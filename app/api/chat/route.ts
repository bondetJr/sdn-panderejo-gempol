import { streamText, tool } from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPpdbStatus } from "@/lib/ppdb-data";
import { CERIA_SYSTEM_PROMPT } from "@/lib/chat-system-prompt";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getSchoolProfile } from "@/lib/school";
import { getAllTeachers } from "@/lib/teacher-data";
import { getAchievements, getFasilitasAll } from "@/lib/profil-data";
import { getAllAnnouncements, getAllNews } from "@/lib/informasi-data";
import { getExtracurriculars, getAgenda, getRombonganBelajarPublic } from "@/lib/academic-data";
import { getJadwalPelajaranAll } from "@/lib/jadwal-data";
import { getFlagshipPrograms } from "@/lib/program-unggulan-data";
import { getServiceStandards } from "@/lib/layanan-data";
import { getFaqList } from "@/lib/kontak-data";
import { getCeriaCompleteData } from "@/lib/ceria-data";
import { searchGoogle, searchDuckDuckGo, isGeneralKnowledgeQuery, type GoogleSearchResult } from "@/lib/google-search";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 30;

const chatMessageSchema = z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string() });
const chatRequestSchema = z.object({ messages: z.array(chatMessageSchema).min(1) });

type FaqItem = { pertanyaan: string; jawaban: string };
type ScoredFaq = FaqItem & { score: number };
type PpdbWaveItem = { jalur: string; tahunAjaran: string; syaratText: string | null; kuota: number; tanggalBuka: Date; tanggalTutup: Date };

type TeacherItem = Awaited<ReturnType<typeof getAllTeachers>>[number];
type FacilityItem = Awaited<ReturnType<typeof getFasilitasAll>>[number];
type AchievementItem = Awaited<ReturnType<typeof getAchievements>>[number];
type ProgramItem = Awaited<ReturnType<typeof getFlagshipPrograms>>[number];
type EkskulItem = Awaited<ReturnType<typeof getExtracurriculars>>[number];
type AgendaItem = Awaited<ReturnType<typeof getAgenda>>[number];
type ClassItem = Awaited<ReturnType<typeof getRombonganBelajarPublic>>[number];
type NewsItem = Awaited<ReturnType<typeof getAllNews>>[number];
type LayananDataItem = Awaited<ReturnType<typeof getServiceStandards>>[number];

const ROMAN_CLASS_VALUES: Record<string, string> = { i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6" };

function normalizeClassNumber(message: string): string {
  return message.replace(/\bkelas\s+(iv|v|iii|ii|i|vi)\b/gi, (_m, r: string) => `kelas ${ROMAN_CLASS_VALUES[r.toLowerCase()]}`);
}

function extractClassNumber(value: string): string | null {
  return normalizeClassNumber(value.toLocaleLowerCase("id-ID")).match(/\bkelas\s*(\d+)/i)?.[1] ?? null;
}

function isTendikQuery(q: string): boolean {
  return /(tenaga administrasi|tata usaha|\btu\b|operator|tendik|tenaga kependidikan|penjaga|kebersihan|satpam|admin)/i.test(q);
}

function filterTendik(teachers: TeacherItem[]): TeacherItem[] {
  return teachers.filter((t) => {
    const j = t.jabatan.toLowerCase();
    return j.includes("tata usaha") || j.includes("operator") || j.includes("administrasi") || j.includes("tendik") || j.includes("penjaga") || j.includes("kebersihan") || j.includes("satpam") || (!j.includes("kepala") && !j.includes("guru") && !j.includes("kelas") && !j.includes("mapel") && !j.includes("pai") && !j.includes("pjok"));
  });
}

async function withTimeout<T>(op: Promise<T>, fb: T, label: string, ms = 5000): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    id = setTimeout(() => {
      console.warn(`Timeout: ${label}`);
      resolve(fb);
    }, ms);
  });
  try {
    return await Promise.race([op, timeout]);
  } finally {
    if (id) clearTimeout(id);
  }
}

function findRelevantFaqs(query: string, faqs: FaqItem[]): ScoredFaq[] {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter((w) => w.length > 3);
  return faqs
    .map((faq) => {
      const text = (faq.pertanyaan + " " + faq.jawaban).toLowerCase();
      let score = 0;
      keywords.forEach((kw) => {
        if (text.includes(kw)) score += 1;
        if (faq.pertanyaan.toLowerCase().includes(kw)) score += 2;
      });
      return { ...faq, score };
    })
    .filter((f) => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(`chat:${ip}`, { limit: 20, windowMs: 60000 });
  if (!success) {
    return new Response("Terlalu banyak request. Silakan coba lagi dalam 1 menit.", { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Format chat tidak valid.", { status: 400 });
  }

  const latestRaw = [...parsed.data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const latest = latestRaw.toLocaleLowerCase("id-ID");

  if (/^(halo|haloo|hai|hy|tess|hi|hello|pagi|siang|sore|malam|permisi|tes)[\s!.?,]*$/i.test(latest.trim())) {
    return new Response("Halo Bapak/Ibu! 👋 Saya Ceria, asisten digital SDN Panderejo Gempol. Ada yang bisa saya bantu seputar PPDB, fasilitas, layanan, visi misi, program unggulan, prestasi, atau pertanyaan lainnya?", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return new Response("GROQ_API_KEY belum di set di .env", { status: 500 });
  }

  const completeData = await withTimeout(getCeriaCompleteData(), null, "ceria complete data", 6000);

  const [schoolProfile, teachers, facilities, news, announcements, extracurriculars, flagshipPrograms, achievements, activeWaves, faqs, layanan, agenda, classes, jadwal] = completeData
    ? [
        completeData.profil,
        [] as TeacherItem[],
        completeData.fasilitas as unknown as FacilityItem[],
        completeData.berita as unknown as NewsItem[],
        completeData.pengumuman as unknown as { title: string; isPenting?: boolean }[],
        completeData.ekstrakurikuler as unknown as EkskulItem[],
        completeData.programUnggulan as unknown as ProgramItem[],
        completeData.prestasi as unknown as AchievementItem[],
        completeData.ppdb as unknown as PpdbWaveItem[],
        completeData.faq as unknown as FaqItem[],
        completeData.layanan as unknown as LayananDataItem[],
        completeData.kalenderAkademik as unknown as AgendaItem[],
        completeData.rombel as unknown as ClassItem[],
        completeData.jadwalPelajaran as unknown as Record<number, { hari: string; slots: { jamKe: number; waktu: string; subjectId: string }[] }[]>,
      ]
    : await Promise.all([
        withTimeout(getSchoolProfile(), null, "profil sekolah"),
        withTimeout(getAllTeachers(), [] as TeacherItem[], "guru"),
        withTimeout(getFasilitasAll(), [] as FacilityItem[], "fasilitas"),
        withTimeout(getAllNews(), [] as NewsItem[], "berita"),
        withTimeout(getAllAnnouncements(), [] as { title: string; isPenting?: boolean }[], "pengumuman"),
        withTimeout(getExtracurriculars(), [] as EkskulItem[], "ekstrakurikuler"),
        withTimeout(getFlagshipPrograms(), [] as ProgramItem[], "program unggulan"),
        withTimeout(getAchievements(), [] as AchievementItem[], "prestasi"),
        withTimeout(
          prisma.ppdbWave
            .findMany({
              where: { isActive: true },
              select: { jalur: true, tahunAjaran: true, syaratText: true, kuota: true, tanggalBuka: true, tanggalTutup: true },
              orderBy: { jalur: "asc" },
            })
            .catch(() => [] as PpdbWaveItem[]),
          [] as PpdbWaveItem[],
          "gelombang PPDB"
        ),
        withTimeout(getFaqList(), [] as FaqItem[], "faq"),
        withTimeout(getServiceStandards(), [] as LayananDataItem[], "layanan"),
        withTimeout(getAgenda(), [] as AgendaItem[], "agenda"),
        withTimeout(getRombonganBelajarPublic(), [] as ClassItem[], "rombel"),
        withTimeout(getJadwalPelajaranAll(), {} as Record<number, { hari: string; slots: { jamKe: number; waktu: string; subjectId: string }[] }[]>, "jadwal"),
      ]);

  const statistik = completeData?.statistik;
  const profil = completeData?.profil || schoolProfile;

  // FAST-PATH: VISI MISI
  if (/(visi misi|visi & misi|visi sekolah|misi sekolah)/i.test(latest)) {
    const visi = profil ? (profil as { visi?: string | null }).visi : null;
    const misi = profil ? (profil as { misi?: string | null }).misi : null;
    if (visi || misi) {
      let answer = `**Visi & Misi ${profil ? (profil as { nama: string }).nama : "SDN Panderejo Gempol"}:**\n\n`;
      if (visi) answer += `**Visi:**\n${visi}\n\n`;
      if (misi) answer += `**Misi:**\n${misi}\n\n`;
      answer += "Lihat lengkap di menu **Profil > Visi, Misi & Sejarah**. Ada lagi yang bisa Ceria bantu?";
      return new Response(answer, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  if (/(sejarah sekolah|sejarah sdn)/i.test(latest)) {
    const sejarah = profil ? (profil as { sejarah?: string | null }).sejarah : null;
    if (sejarah) {
      return new Response(`**Sejarah ${(profil as { nama: string }).nama}:**\n\n${sejarah.slice(0, 1000)}\n\nLihat lengkap di **Profil > Visi, Misi & Sejarah**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(kurikulum|kurikulum sekolah)/i.test(latest)) {
    const kur = profil ? (profil as { kurikulumText?: string | null }).kurikulumText : null;
    if (kur) {
      return new Response(`**Kurikulum ${(profil as { nama: string }).nama}:**\n\n${kur.slice(0, 1000)}\n\nLihat lengkap di **Akademik > Kurikulum**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(akreditasi|akreditasi sekolah|nilai akreditasi)/i.test(latest)) {
    if (profil) {
      const akred = (profil as { akreditasi?: string | null }).akreditasi || "Belum ada";
      const tahun = (profil as { akreditasiTahun?: number | null }).akreditasiTahun;
      const tahunText = tahun ? ` tahun ${tahun}` : "";
      return new Response(`Akreditasi ${(profil as { nama: string }).nama ?? "SDN Panderejo Gempol"} adalah **${akred}**${tahunText}.\n\nLihat di menu **Profil > Prestasi & Akreditasi**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(program unggulan|program sekolah|unggulan sekolah|program andalan)/i.test(latest)) {
    const progs = completeData?.programUnggulan || flagshipPrograms;
    if (progs && progs.length > 0) {
      const list = progs
        .slice(0, 6)
        .map((p, i) => {
          const desc = (p as { nama: string; deskripsi?: string; deskripsiSingkat?: string }).deskripsi || (p as { deskripsiSingkat?: string }).deskripsiSingkat || "";
          return `${i + 1}. **${(p as { nama: string }).nama}** - ${desc.slice(0, 120)}`;
        })
        .join("\n\n");
      return new Response(`Program Unggulan di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nLihat lengkap di **Akademik > Program Unggulan**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(prestasi|prestasi sekolah|juara|penghargaan|achievement)/i.test(latest)) {
    const pres = completeData?.prestasi || achievements;
    if (pres && pres.length > 0) {
      const list = pres
        .slice(0, 6)
        .map((a, i) => {
          const item = a as { judul: string; tingkat: string; tahun: number; atasNama?: string | null; atasNamaSiswa?: string | null };
          const nama = item.atasNama || item.atasNamaSiswa;
          return `${i + 1}. **${item.judul}** - ${item.tingkat} (${item.tahun})${nama ? ` - ${nama}` : ""}`;
        })
        .join("\n");
      return new Response(`Prestasi ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nLihat lengkap di **Profil > Prestasi & Akreditasi**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(jumlah rombel|berapa rombel|rombel|rombongan belajar|jumlah kelas)/i.test(latest)) {
    const totalRombel = statistik?.totalRombel || (classes as ClassItem[]).length || 0;
    const rombelList = completeData?.rombel || classes;
    if (totalRombel > 0) {
      const detail = Array.isArray(rombelList)
        ? (rombelList as { nama: string; jumlahSiswa: number; waliKelas?: string | null; waliKelasNama?: string | null }[])
            .slice(0, 10)
            .map((r) => `- Kelas ${r.nama}: ${r.jumlahSiswa} siswa (Wali: ${r.waliKelas || r.waliKelasNama || "-"})`)
            .join("\n")
        : "";
      return new Response(`Jumlah Rombongan Belajar (Rombel) di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}: **${totalRombel} rombel**\n\n${detail}\n\nLihat detail di **Akademik > Rombongan Belajar**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(jumlah siswa|berapa siswa|total siswa|siswa berapa)/i.test(latest)) {
    const totalSiswa = statistik?.totalSiswa || 0;
    const laki = statistik?.totalSiswaLaki || 0;
    const perempuan = statistik?.totalSiswaPerempuan || 0;
    if (totalSiswa > 0) {
      const rata = Math.round(totalSiswa / (statistik?.totalRombel || 1));
      return new Response(
        `Jumlah Siswa di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"} Tahun ${(profil as { tahunAjaranAktif?: string } | null)?.tahunAjaranAktif ?? "2026/2027"}: **${totalSiswa} siswa** (Laki-laki: ${laki}, Perempuan: ${perempuan})\n\nRata-rata per rombel: ${rata} siswa.\n\nLihat detail per kelas di **Akademik > Rombongan Belajar**. Ada lagi yang bisa Ceria bantu?`,
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
  }

  if (/(kalender akademik|agenda sekolah|jadwal kegiatan|kalender sekolah)/i.test(latest)) {
    const kal = completeData?.kalenderAkademik || agenda;
    if (kal && kal.length > 0) {
      const list = kal
        .slice(0, 8)
        .map((a, i) => {
          const item = a as { judul: string; tanggal?: Date; tanggalMulai?: Date; kategori?: string | null };
          const tgl = item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : item.tanggalMulai ? new Date(item.tanggalMulai).toLocaleDateString("id-ID") : "-";
          return `${i + 1}. **${item.judul}** - ${tgl} (${item.kategori || "-"})`;
        })
        .join("\n");
      return new Response(`Kalender Akademik ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nLihat lengkap di **Akademik > Kalender Akademik**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(jadwal pelajaran|jadwal kelas|jadwal belajar|pelajaran kelas|jadwal mapel|mapel kelas|pelajaran hari)/i.test(latest)) {
    const jadwalData = (completeData?.jadwalPelajaran || jadwal) as Record<string, { hari: string; slots: { jamKe: number; waktu: string; subjectId: string }[] }[]> | null;
    if (jadwalData && Object.keys(jadwalData).length > 0) {
      const kelas = extractClassNumber(latest);
      if (kelas) {
        const jd = jadwalData[kelas] || jadwalData[Number(kelas) as unknown as string];
        if (jd && jd.length > 0) {
          const hariList = jd
            .map((h) => {
              const slots = h.slots
                .filter((s) => s.subjectId !== "istirahat")
                .map((s) => `${s.waktu} ${s.subjectId}`)
                .join(", ");
              return `**${h.hari}**: ${slots}`;
            })
            .join("\n");
          return new Response(`Jadwal Pelajaran Kelas ${kelas} Tahun ${(profil as { tahunAjaranAktif?: string } | null)?.tahunAjaranAktif ?? "2026/2027"}:\n\n${hariList}\n\nLihat lengkap dengan tabel di **Akademik > Jadwal Pelajaran**. Ada lagi yang bisa Ceria bantu?`, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        return new Response(`Jadwal untuk kelas ${kelas} belum diisi admin. Jadwal contoh tersedia di **Akademik > Jadwal Pelajaran**. Hubungi operator untuk update jadwal. Ada lagi yang bisa Ceria bantu?`, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      // Jika tidak sebut kelas, kasih summary
      const totalKelas = Object.keys(jadwalData).length;
      return new Response(
        `Jadwal Pelajaran tersedia untuk **${totalKelas} tingkat** (kelas 1-6).\n\nSilakan tanyakan spesifik, contoh:\n- "Jadwal kelas 1"\n- "Jadwal kelas 3 hari Senin"\n- "Jadwal pelajaran kelas 5"\n\nAtau cek lengkap di menu **Akademik > Jadwal Pelajaran**. Ada lagi yang bisa Ceria bantu?`,
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
    // Fallback jika jadwal belum ada sama sekali di DB
    return new Response(`Jadwal Pelajaran untuk kelas 1-6 tersedia di menu **Akademik > Jadwal Pelajaran**.\n\nJika admin belum mengisi jadwal custom, akan tampil jadwal contoh. Hubungi operator jam ${(profil as { jamLayanan?: string } | null)?.jamLayanan ?? "07.30-13.00 WIB"} untuk update. Ada lagi yang bisa Ceria bantu?`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (isTendikQuery(latest)) {
    if (statistik && statistik.totalTendik > 0) {
      return new Response(`Tenaga Kependidikan di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}: **${statistik.totalTendik} tendik** dari total ${statistik.totalGuruTendik} guru & tendik.\n\nLihat daftar lengkap di **Profil > Guru & Tenaga Kependidikan**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    const tendikList = filterTendik(teachers as TeacherItem[]);
    if (tendikList.length > 0) {
      return new Response(
        `Tenaga Administrasi / Tendik di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${tendikList
          .map((t) => `- **${t.nama}**: ${t.jabatan} (${t.statusKepegawaian})`)
          .join("\n")}\n\nAda lagi yang bisa Ceria bantu, Bapak/Ibu?`,
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
  }

  if (/(fasilitas|fasilitas sekolah|sarana|prasarana)/i.test(latest)) {
    const fas = completeData?.fasilitas || facilities;
    if (fas && fas.length > 0) {
      const list = fas
        .slice(0, 10)
        .map((f, i) => {
          const item = f as { nama: string; deskripsi?: string | null };
          return `${i + 1}. **${item.nama}** - ${(item.deskripsi || "").slice(0, 100)}`;
        })
        .join("\n\n");
      return new Response(`Fasilitas yang ada di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nUntuk foto dan detail lengkap, buka menu **Profil > Fasilitas Sekolah**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(syarat ppdb|apa saja syarat|dokumen ppdb|berkas ppdb)/i.test(latest)) {
    const faqRelevant = findRelevantFaqs(latest, faqs as FaqItem[]);
    const faqMatch = faqRelevant.find((f) => /syarat|ppdb|dokumen/i.test(f.pertanyaan));
    if (faqMatch && faqMatch.jawaban.trim().length > 10) {
      return new Response(`${faqMatch.jawaban}\n\nAda lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    const ppdb = completeData?.ppdb || activeWaves;
    if (ppdb && ppdb.length > 0) {
      const waveInfo = ppdb
        .map((w) => {
          const wave = w as PpdbWaveItem & { syarat?: string | null };
          const syarat = wave.syarat || wave.syaratText || "Lihat di menu PPDB";
          return `**Jalur ${wave.jalur}** (${wave.tahunAjaran})\nKuota: ${wave.kuota}\nSyarat: ${syarat}`;
        })
        .join("\n\n");
      return new Response(
        `Syarat PPDB ${(profil as { nama: string; tahunAjaranAktif?: string } | null)?.nama ?? "SDN Panderejo Gempol"} Tahun ${(profil as { tahunAjaranAktif?: string } | null)?.tahunAjaranAktif ?? "2026/2027"}:\n\n${waveInfo}\n\n**Dokumen Umum:**\n- Fotokopi KK\n- Akta Kelahiran\n- KTP Orang Tua\n- KIP/KKS (jika ada)\n- Foto Anak\n\nLengkapnya di menu **PPDB > Informasi PPDB**. Ada lagi yang bisa Ceria bantu?`,
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }
  }

  if (/(standar pelayanan|layanan apa saja|pelayanan sekolah|jenis layanan)/i.test(latest)) {
    const lay = completeData?.layanan || layanan;
    if (lay && lay.length > 0) {
      const list = lay
        .slice(0, 6)
        .map((l, i) => {
          const item = l as { nama: string; waktu?: string | null; waktuPelayanan?: string | null; biaya?: string | null };
          return `${i + 1}. **${item.nama}**\n   Waktu: ${item.waktu || item.waktuPelayanan || "-"} | Biaya: ${item.biaya || "Gratis"}`;
        })
        .join("\n\n");
      return new Response(`Standar Pelayanan di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nDetail lengkap di menu **Layanan > Standar Pelayanan**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(pertanyaan yang sering|faq|ayah.*ibu|pertanyaan.*ayah|tanya jawab)/i.test(latest)) {
    const fq = completeData?.faq || faqs;
    if (fq && fq.length > 0) {
      const list = fq
        .slice(0, 8)
        .map((f, i) => `${i + 1}. **${(f as { pertanyaan: string }).pertanyaan}**`)
        .join("\n");
      return new Response(`Pertanyaan yang sering ditanyakan Ayah & Ibu:\n\n${list}\n\nBuka menu **Layanan > Pertanyaan Ayah & Ibu** untuk lengkap. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(ekskul|ekstra|kurikuler|kulikuler|kegiatan siswa)/i.test(latest)) {
    const ekskul = completeData?.ekstrakurikuler || extracurriculars;
    if (ekskul && ekskul.length > 0) {
      const list = ekskul
        .slice(0, 8)
        .map((e, i) => {
          const item = e as { nama: string; jadwal?: string | null; pembina?: string | null };
          return `${i + 1}. **${item.nama}** - ${item.jadwal || ""}${item.pembina ? ` (Pembina: ${item.pembina})` : ""}`;
        })
        .join("\n");
      return new Response(`Ekstrakurikuler di ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nAda lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(berita|berita sekolah|info terbaru|kegiatan terbaru)/i.test(latest)) {
    const brt = completeData?.berita || news;
    if (brt && brt.length > 0) {
      const list = brt
        .slice(0, 5)
        .map((n, i) => {
          const item = n as { title: string; tanggal?: Date; publishedAt?: Date };
          const tgl = item.tanggal || item.publishedAt;
          const tglStr = tgl ? new Date(tgl).toLocaleDateString("id-ID") : "";
          return `${i + 1}. **${item.title}** - ${tglStr}`;
        })
        .join("\n");
      return new Response(`Berita Terbaru ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nLihat lengkap di **Informasi > Berita Sekolah**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  if (/(pengumuman|pengumuman sekolah|info penting|pengumuman penting)/i.test(latest)) {
    const peng = completeData?.pengumuman || announcements;
    if (peng && peng.length > 0) {
      const list = peng
        .slice(0, 5)
        .map((a, i) => {
          const item = a as { title: string; isPenting?: boolean; penting?: boolean };
          const penting = item.isPenting || item.penting ? " [PENTING]" : "";
          return `${i + 1}. **${item.title}**${penting}`;
        })
        .join("\n");
      return new Response(`Pengumuman ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nLihat lengkap di **Informasi > Pengumuman**. Ada lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  const relevantFaqs = findRelevantFaqs(latest, faqs as FaqItem[]);
  const topFaq = relevantFaqs[0];
  if (topFaq && topFaq.score >= 4 && topFaq.jawaban.trim().length > 10) {
    return new Response(`${topFaq.jawaban}\n\nAda lagi yang bisa Ceria bantu, Bapak/Ibu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // === GOOGLE FALLBACK: Jika tidak ada di DB dan pertanyaan umum, coba Google ===
  const isGeneral = isGeneralKnowledgeQuery(latestRaw);
  const hasSchoolData = completeData || (profil && (facilities as unknown as { length: number }).length > 0);

  // Hanya pakai Google jika: pertanyaan umum DAN tidak ada data sekolah yang relevan DAN env ENABLE_GOOGLE_FALLBACK=true
  if (isGeneral && process.env.ENABLE_GOOGLE_FALLBACK === "true" && !hasSchoolData) {
    console.log(`[Ceria] No DB data for "${latestRaw}", trying Google fallback...`);
    
    let googleResults: GoogleSearchResult[] | null = null;
    
    // Coba Google CSE dulu, kalau gagal coba DuckDuckGo
    googleResults = await withTimeout(searchGoogle(latestRaw), null, "google search", 4000);
    if (!googleResults) {
      googleResults = await withTimeout(searchDuckDuckGo(latestRaw), null, "duckduckgo search", 4000);
    }

    if (googleResults && googleResults.length > 0) {
      // Jika ada hasil Google, pakai LLM untuk ringkas dengan disclaimer
      const googleContext = googleResults
        .slice(0, 3)
        .map((r, i) => `${i + 1}. ${r.title}: ${r.snippet} (Sumber: ${r.link})`)
        .join("\n");

      try {
        const googlePrompt = `Kamu adalah Ceria, asisten SDN Panderejo Gempol. User bertanya "${latestRaw}" yang tidak ada di database sekolah. Berikut hasil pencarian Google/DuckDuckGo:\n\n${googleContext}\n\nTugas: Jawab pertanyaan user secara singkat jelas berdasarkan hasil pencarian di atas. Tambahkan disclaimer di akhir: "\n\n⚠️ Info di atas dari pencarian umum (Google), bukan data resmi sekolah. Untuk info resmi sekolah, hubungi operator jam 07.30-13.00 WIB." Jangan mengarang di luar hasil pencarian.`;

        const result = await streamText({
          model: groq("llama-3.3-70b-versatile"),
          system: googlePrompt,
          messages: [{ role: "user" as const, content: latestRaw }],
        });

        return result.toTextStreamResponse();
      } catch (e) {
        console.error("[Ceria] Google fallback LLM error:", e);
        // Fallback ke jawaban manual dari Google snippet
        const manualAnswer = googleResults
          .slice(0, 2)
          .map((r) => `**${r.title}**\n${r.snippet}\nSumber: ${r.link}`)
          .join("\n\n");
        return new Response(`${manualAnswer}\n\n⚠️ Info di atas dari pencarian umum (Google), bukan data resmi sekolah. Ada lagi yang bisa Ceria bantu?`, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }
  }

  const compact = (value: string | null | undefined, max = 400): string | null => {
    return value ? value.replace(/\s+/g, " ").slice(0, max) : null;
  };

  const websiteData = completeData
    ? {
        profilSekolah: completeData.profil,
        statistik: completeData.statistik,
        rombel: completeData.rombel.slice(0, 5),
        programUnggulan: completeData.programUnggulan,
        prestasi: completeData.prestasi.slice(0, 5),
        kalenderAkademik: completeData.kalenderAkademik.slice(0, 5),
        ekstrakurikuler: completeData.ekstrakurikuler,
        fasilitas: completeData.fasilitas.slice(0, 5),
        berita: completeData.berita.slice(0, 3),
        layanan: completeData.layanan.slice(0, 3),
        faq: completeData.faq.slice(0, 5),
        ppdb: completeData.ppdb,
        jadwalPelajaran: Object.keys(completeData.jadwalPelajaran || {}).length > 0 ? completeData.jadwalPelajaran : "Jadwal tersedia untuk kelas 1-6, cek menu Akademik > Jadwal Pelajaran",
      }
    : {
        profilSekolah: schoolProfile
          ? {
              nama: (schoolProfile as { nama: string }).nama,
              npsn: (schoolProfile as { npsn: string }).npsn,
              alamat: compact((schoolProfile as { alamat: string | null }).alamat),
              telepon: (schoolProfile as { telepon: string | null }).telepon,
              email: (schoolProfile as { email: string | null }).email,
              akreditasi: (schoolProfile as { akreditasi: string | null }).akreditasi,
              akreditasiTahun: (schoolProfile as { akreditasiTahun: number | null }).akreditasiTahun,
              tahunAjaranAktif: (schoolProfile as { tahunAjaranAktif: string | null }).tahunAjaranAktif,
              jamLayanan: (schoolProfile as { jamLayanan: string | null }).jamLayanan,
              visi: compact((schoolProfile as { visi: string | null }).visi, 500),
              misi: compact((schoolProfile as { misi: string | null }).misi, 800),
              sejarah: compact((schoolProfile as { sejarah: string | null }).sejarah, 800),
              kurikulumText: compact((schoolProfile as { kurikulumText: string | null }).kurikulumText, 800),
            }
          : null,
        statistik: {
          totalRombel: (classes as ClassItem[]).length || 0,
          totalSiswa: (classes as ClassItem[]).reduce((sum, c) => sum + c.jumlahSiswa, 0) || 0,
        },
      };

  const systemPrompt = `${CERIA_SYSTEM_PROMPT}

DATA SEKOLAH LENGKAP DARI DATABASE (Supabase):
${JSON.stringify(websiteData, null, 2)}
`;

  const principal = (teachers as TeacherItem[]).find((t) => t.isKepalaSekolah);
  if (/(kepala sekolah|pimpinan sekolah|nama kepala)/i.test(latest)) {
    const kepsek = completeData?.kepalaSekolah || principal;
    if (kepsek) {
      return new Response(`Kepala Sekolah ${(profil as { nama: string } | null)?.nama ?? "SDN Panderejo Gempol"} adalah **${(kepsek as { nama: string }).nama}**.\n\nAda lagi yang bisa Ceria bantu?`, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  try {
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: parsed.data.messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      tools: {
        cekStatusPpdb: tool({
          description: "Cek status PPDB berdasarkan No Pendaftaran dan NIK",
          parameters: z.object({ noPendaftaran: z.string(), nik: z.string() }),
          execute: async ({ noPendaftaran, nik }) => {
            try {
              const r = await checkPpdbStatus(noPendaftaran, nik);
              return r ?? { error: "Data tidak ditemukan." };
            } catch {
              return { error: "Gagal cek status." };
            }
          },
        }),
        getFaq: tool({
          description: "Cari FAQ relevan",
          parameters: z.object({ keyword: z.string() }),
          execute: async ({ keyword }) => {
            const rel = findRelevantFaqs(keyword, faqs as FaqItem[]);
            return rel.length > 0 ? rel : (faqs as FaqItem[]).slice(0, 5);
          },
        }),
        getLayanan: tool({
          description: "Ambil data Standar Pelayanan",
          parameters: z.object({ namaLayanan: z.string().optional() }),
          execute: async ({ namaLayanan }) => {
            if (!namaLayanan) return layanan;
            const f = (layanan as LayananDataItem[]).filter((l) => l.nama.toLowerCase().includes(namaLayanan.toLowerCase()));
            return f.length > 0 ? f : layanan;
          },
        }),
        getProfilSekolah: tool({
          description: "Ambil profil sekolah lengkap termasuk visi misi sejarah kurikulum akreditasi",
          parameters: z.object({}),
          execute: async () => profil,
        }),
        getGuru: tool({
          description: "Ambil guru/tendik",
          parameters: z.object({ kelas: z.string().optional(), jabatan: z.string().optional() }),
          execute: async ({ kelas, jabatan }) => {
            let fil = teachers as TeacherItem[];
            if (kelas) fil = fil.filter((t) => extractClassNumber(t.jabatan) === kelas);
            if (jabatan) fil = fil.filter((t) => t.jabatan.toLowerCase().includes(jabatan.toLowerCase()));
            return fil;
          },
        }),
        getFasilitas: tool({
          description: "Ambil fasilitas",
          parameters: z.object({}),
          execute: async () => facilities,
        }),
        getBerita: tool({
          description: "Berita terbaru",
          parameters: z.object({}),
          execute: async () => news.slice(0, 5),
        }),
        getCeriaData: tool({
          description: "Ambil semua data lengkap sekolah: statistik rombel siswa, program unggulan, prestasi, kalender akademik, ekstrakurikuler, dll",
          parameters: z.object({}),
          execute: async () => completeData,
        }),
      },
    });
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("Groq error:", err);
    const jam = profil ? (profil as { jamLayanan?: string | null }).jamLayanan : null;
    return new Response(
      `Maaf, Ceria sedang gangguan koneksi AI.\n\nTapi Bapak/Ibu bisa cek langsung:\n- **Profil**: Visi Misi, Sejarah, Akreditasi di Profil\n- **Akademik**: Kurikulum, Program Unggulan, Kalender, Jadwal, Rombel, Ekskul\n- **PPDB**: Informasi & Daftar\n- **Layanan**: Standar Pelayanan & FAQ\n- **Informasi**: Berita & Pengumuman\n\nAtau hubungi operator jam ${jam ?? "07.30-13.00 WIB"}.`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
