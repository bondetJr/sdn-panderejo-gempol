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
import { getExtracurriculars } from "@/lib/academic-data";
import { getFlagshipPrograms } from "@/lib/program-unggulan-data";
import { getServiceStandards } from "@/lib/layanan-data";
import { getFaqList } from "@/lib/kontak-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 30;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
});

type FaqItem = { pertanyaan: string; jawaban: string; };
type ScoredFaq = FaqItem & { score: number };
type LayananItem = { nama: string; deskripsi: string | null; persyaratan: string | null; waktuPelayanan: string | null; biaya: string | null; produkLayanan: string | null; };
type PpdbWaveItem = { jalur: string; tahunAjaran: string; syaratText: string | null; kuota: number; tanggalBuka: Date; tanggalTutup: Date; };

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
function filterTendik(teachers: Awaited<ReturnType<typeof getAllTeachers>>) {
  return teachers.filter((t) => {
    const j = t.jabatan.toLowerCase();
    return j.includes("tata usaha") || j.includes("operator") || j.includes("administrasi") || j.includes("tendik") || j.includes("penjaga") || j.includes("kebersihan") || j.includes("satpam") || (!j.includes("kepala") && !j.includes("guru") && !j.includes("kelas") && !j.includes("mapel") && !j.includes("pai") && !j.includes("pjok"));
  });
}
async function withTimeout<T>(op: Promise<T>, fb: T, label: string, ms = 4000): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => { id = setTimeout(() => { console.warn(`Timeout: ${label}`); resolve(fb); }, ms); });
  try { return await Promise.race([op, timeout]); } finally { if (id) clearTimeout(id); }
}
function findRelevantFaqs(query: string, faqs: FaqItem[]): ScoredFaq[] {
  const q = query.toLowerCase();
  const keywords = q.split(/\s+/).filter((w) => w.length > 3);
  return faqs.map((faq) => {
    const text = (faq.pertanyaan + " " + faq.jawaban).toLowerCase();
    let score = 0;
    keywords.forEach((kw) => { if (text.includes(kw)) score += 1; if (faq.pertanyaan.toLowerCase().includes(kw)) score += 2; });
    return { ...faq, score };
  }).filter((f) => f.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success } = await rateLimit(`chat:${ip}`, { limit: 20, windowMs: 60000 });
  if (!success) return new Response("Terlalu banyak request. Silakan coba lagi dalam 1 menit.", { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return new Response("Format chat tidak valid.", { status: 400 });

  const latestRaw = [...parsed.data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const latest = latestRaw.toLocaleLowerCase("id-ID");

  if (/^(halo|haloo|hai|hy|tess|hi|hello|pagi|siang|sore|malam|permisi|tes)[\s!.?,]*$/i.test(latest.trim())) {
    return new Response("Halo Bapak/Ibu! 👋 Saya Ceria, asisten digital SDN Panderejo Gempol. Ada yang bisa saya bantu seputar PPDB, fasilitas, layanan, atau pertanyaan lainnya?", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (!process.env.GROQ_API_KEY) return new Response("GROQ_API_KEY belum di set di .env", { status: 500 });

  const [schoolProfile, teachers, facilities, news, announcements, extracurriculars, flagshipPrograms, achievements, activeWaves, faqs, layanan] = await Promise.all([
    withTimeout(getSchoolProfile(), null, "profil sekolah"),
    withTimeout(getAllTeachers(), [], "guru"),
    withTimeout(getFasilitasAll(), [], "fasilitas"),
    withTimeout(getAllNews(), [], "berita"),
    withTimeout(getAllAnnouncements(), [], "pengumuman"),
    withTimeout(getExtracurriculars(), [], "ekstrakurikuler"),
    withTimeout(getFlagshipPrograms(), [], "program unggulan"),
    withTimeout(getAchievements(), [], "prestasi"),
    withTimeout(prisma.ppdbWave.findMany({ where: { isActive: true }, select: { jalur: true, tahunAjaran: true, syaratText: true, kuota: true, tanggalBuka: true, tanggalTutup: true }, orderBy: { jalur: "asc" } }).catch(() => [] as PpdbWaveItem[]), [] as PpdbWaveItem[], "gelombang PPDB"),
    withTimeout(getFaqList(), [] as FaqItem[], "faq"),
    withTimeout(getServiceStandards(), [] as LayananItem[], "layanan"),
  ]);

  // === FAST-PATH: TENDIK ===
  if (isTendikQuery(latest)) {
    const tendikList = filterTendik(teachers);
    if (tendikList.length > 0) {
      return new Response(`Tenaga Administrasi / Tendik di ${schoolProfile?.nama ?? "SDN Panderejo Gempol"}:\n\n${tendikList.map((t) => `- **${t.nama}**: ${t.jabatan} (${t.statusKepegawaian})`).join("\n")}\n\nAda lagi yang bisa Ceria bantu, Bapak/Ibu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // === FAST-PATH: FASILITAS - INI YANG KOSONG DI SCREENSHOT ===
  if (/(fasilitas|fasilitas sekolah|sarana|prasarana)/i.test(latest)) {
    if (facilities.length > 0) {
      const list = facilities.slice(0, 10).map((f, i) => `${i + 1}. **${f.nama}** - ${f.deskripsi?.slice(0, 100) ?? ""}`).join("\n\n");
      return new Response(`Fasilitas yang ada di ${schoolProfile?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nUntuk foto dan detail lengkap, buka menu **Profil > Fasilitas Sekolah**. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return new Response(`Data fasilitas belum tersedia di database. Silakan cek menu Profil > Fasilitas Sekolah atau hubungi operator.`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // === FAST-PATH: SYARAT PPDB ===
  if (/(syarat ppdb|apa saja syarat|dokumen ppdb|berkas ppdb)/i.test(latest)) {
    const faqRelevant = findRelevantFaqs(latest, faqs as FaqItem[]);
    const faqMatch = faqRelevant.find((f) => /syarat|ppdb|dokumen/i.test(f.pertanyaan));
    if (faqMatch && faqMatch.jawaban.trim().length > 10) {
      return new Response(`${faqMatch.jawaban}\n\nAda lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    if ((activeWaves as PpdbWaveItem[]).length > 0) {
      const waveInfo = (activeWaves as PpdbWaveItem[]).map((w) => `**Jalur ${w.jalur}** (${w.tahunAjaran})\nKuota: ${w.kuota}\nSyarat: ${w.syaratText ?? "Lihat di menu PPDB"}`).join("\n\n");
      return new Response(`Syarat PPDB ${schoolProfile?.nama ?? "SDN Panderejo Gempol"} Tahun ${schoolProfile?.tahunAjaranAktif ?? "2026/2027"}:\n\n${waveInfo}\n\n**Dokumen Umum:**\n- Fotokopi KK\n- Akta Kelahiran\n- KTP Orang Tua\n- KIP/KKS (jika ada)\n- Foto Anak\n\nLengkapnya di menu **PPDB > Informasi PPDB**. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return new Response(`Syarat PPDB ada 3 jalur:\n\n1. **Zonasi**: KK wilayah Panderejo\n2. **Afirmasi**: KIP/KKS/PKH\n3. **Perpindahan**: Surat pindah tugas ortu\n\nDokumen: KK, Akta, KTP Ortu, KIP (jika ada), Foto Anak. Cek menu **PPDB > Informasi**. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // === FAST-PATH: STANDAR PELAYANAN ===
  if (/(standar pelayanan|layanan apa saja|pelayanan sekolah|jenis layanan)/i.test(latest)) {
    if ((layanan as LayananItem[]).length > 0) {
      const list = (layanan as LayananItem[]).slice(0, 6).map((l, i) => `${i + 1}. **${l.nama}**\n   ${l.deskripsi?.slice(0, 80) ?? ""}...\n   Waktu: ${l.waktuPelayanan ?? "-"} | Biaya: ${l.biaya ?? "Gratis"}`).join("\n\n");
      return new Response(`Standar Pelayanan di ${schoolProfile?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nDetail lengkap di menu **Layanan > Standar Pelayanan**. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return new Response(`Standar Pelayanan: Penerimaan Siswa Baru, Surat Keterangan, Legalitas Dokumen, Penggunaan Fasilitas, Pengaduan. Cek menu **Layanan > Standar Pelayanan**. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // === FAST-PATH: FAQ LIST ===
  if (/(pertanyaan yang sering|faq|ayah.*ibu|pertanyaan.*ayah|tanya jawab)/i.test(latest)) {
    if ((faqs as FaqItem[]).length > 0) {
      const list = (faqs as FaqItem[]).slice(0, 8).map((f, i) => `${i + 1}. **${f.pertanyaan}**\n   ${f.jawaban.slice(0, 100)}...`).join("\n\n");
      return new Response(`Pertanyaan yang sering ditanyakan Ayah & Ibu:\n\n${list}\n\nBuka menu **Layanan > Pertanyaan Ayah & Ibu** untuk lengkap. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return new Response(`Belum ada FAQ di database. Hubungi operator via Kontak > Lokasi & Kontak.`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // === FAST-PATH: GURU ===
  if (/(daftar guru|guru.*sekolah|nama guru|guru kelas|wali kelas)/i.test(latest) && !isTendikQuery(latest)) {
    const requestedClass = extractClassNumber(latest);
    let filtered = teachers;
    if (requestedClass) filtered = teachers.filter((t) => extractClassNumber(t.jabatan) === requestedClass);
    if (filtered.length > 0) {
      const list = filtered.slice(0, 10).map((t) => `- ${t.nama}: ${t.jabatan}${t.mapelDiampu ? ` (${t.mapelDiampu})` : ""}`).join("\n");
      return new Response(`Daftar Guru di ${schoolProfile?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nLihat lengkap di **Profil > Guru & Tendik**. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // === FAST-PATH: ALAMAT / KONTAK ===
  if (/(alamat sekolah|lokasi sekolah|kontak sekolah|telepon sekolah|no hp sekolah|email sekolah)/i.test(latest)) {
    if (schoolProfile) {
      return new Response(`${schoolProfile.nama}:\nAlamat: ${schoolProfile.alamat}\nTelepon: ${schoolProfile.telepon}\nEmail: ${schoolProfile.email}\nJam Layanan: ${schoolProfile.jamLayanan}\n\nCek menu **Kontak > Lokasi & Kontak** untuk peta. Ada lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // === FAST-PATH: EKSTRAKURIKULER ===
  if (/(ekstrakurikuler|ekskul|kegiatan siswa)/i.test(latest)) {
    if (extracurriculars.length > 0) {
      const list = extracurriculars.slice(0, 8).map((e, i) => `${i + 1}. **${e.nama}** - ${e.jadwal ?? ""}`).join("\n");
      return new Response(`Ekstrakurikuler di ${schoolProfile?.nama ?? "SDN Panderejo Gempol"}:\n\n${list}\n\nAda lagi yang bisa Ceria bantu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // === FAQ HIGH SCORE ===
  const relevantFaqs = findRelevantFaqs(latest, faqs as FaqItem[]);
  const topFaq = relevantFaqs[0];
  if (topFaq && topFaq.score >= 4 && topFaq.jawaban.trim().length > 10) {
    return new Response(`${topFaq.jawaban}\n\nAda lagi yang bisa Ceria bantu, Bapak/Ibu?`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const compact = (value: string | null | undefined, max = 400) => value ? value.replace(/\s+/g, " ").slice(0, max) : null;

  const websiteData = {
    profilSekolah: schoolProfile ? { nama: schoolProfile.nama, npsn: schoolProfile.npsn, alamat: compact(schoolProfile.alamat), telepon: schoolProfile.telepon, email: schoolProfile.email, akreditasi: schoolProfile.akreditasi, tahunAjaranAktif: schoolProfile.tahunAjaranAktif, jamLayanan: schoolProfile.jamLayanan } : null,
    faqRelevan: relevantFaqs.length > 0 ? relevantFaqs : (faqs as FaqItem[]).slice(0, 5),
    layanan: (layanan as LayananItem[]).map((l) => ({ nama: l.nama, deskripsi: compact(l.deskripsi, 300), persyaratan: compact(l.persyaratan, 300), waktuPelayanan: l.waktuPelayanan, biaya: l.biaya })),
    guru: teachers.map(({ nama, jabatan, statusKepegawaian, mapelDiampu, isKepalaSekolah }) => ({ nama, jabatan, statusKepegawaian, mapelDiampu, isKepalaSekolah })),
    tendik: filterTendik(teachers).map(({ nama, jabatan, statusKepegawaian }) => ({ nama, jabatan, statusKepegawaian })),
    fasilitas: facilities.map(({ nama, deskripsi }) => ({ nama, deskripsi: compact(deskripsi) })),
    ppdbAktif: activeWaves as PpdbWaveItem[],
    programUnggulan: flagshipPrograms.map(({ nama, deskripsiSingkat }) => ({ nama, deskripsiSingkat: compact(deskripsiSingkat) })),
    ekstrakurikuler: extracurriculars.map(({ nama, jadwal }) => ({ nama, jadwal })),
    prestasi: achievements.slice(0, 5).map(({ judul, tingkat, tahun }) => ({ judul, tingkat, tahun })),
  };

  const systemPrompt = `${CERIA_SYSTEM_PROMPT}

DATA SEKOLAH LENGKAP DARI DATABASE:
${JSON.stringify(websiteData, null, 2)}

PPDB Aktif: ${(activeWaves as PpdbWaveItem[]).length > 0 ? (activeWaves as PpdbWaveItem[]).map((w) => `${w.jalur} Kuota ${w.kuota}`).join(", ") : "Belum ada gelombang aktif"}
`;

  if (/(kepala sekolah|pimpinan sekolah|nama kepala)/i.test(latest)) {
    const principal = teachers.find((t) => t.isKepalaSekolah);
    return new Response(principal ? `Kepala Sekolah ${schoolProfile?.nama ?? "SDN Panderejo Gempol"} adalah **${principal.nama}** (${principal.jabatan}).\n\nAda lagi yang bisa Ceria bantu?` : "Data kepala sekolah belum tersedia.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
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
            try { const r = await checkPpdbStatus(noPendaftaran, nik); return r ?? { error: "Data tidak ditemukan." }; } catch { return { error: "Gagal cek status." }; }
          },
        }),
        getFaq: tool({ description: "Cari FAQ relevan", parameters: z.object({ keyword: z.string() }), execute: async ({ keyword }) => { const rel = findRelevantFaqs(keyword, faqs as FaqItem[]); return rel.length > 0 ? rel : (faqs as FaqItem[]).slice(0, 5); } }),
        getLayanan: tool({ description: "Ambil data Standar Pelayanan", parameters: z.object({ namaLayanan: z.string().optional() }), execute: async ({ namaLayanan }) => { if (!namaLayanan) return layanan; const f = (layanan as LayananItem[]).filter((l) => l.nama.toLowerCase().includes(namaLayanan.toLowerCase())); return f.length > 0 ? f : layanan; } }),
        getProfilSekolah: tool({ description: "Ambil profil sekolah", parameters: z.object({}), execute: async () => schoolProfile }),
        getGuru: tool({ description: "Ambil guru/tendik", parameters: z.object({ kelas: z.string().optional(), jabatan: z.string().optional() }), execute: async ({ kelas, jabatan }) => { let fil = teachers; if (kelas) fil = fil.filter((t) => extractClassNumber(t.jabatan) === kelas); if (jabatan) fil = fil.filter((t) => t.jabatan.toLowerCase().includes(jabatan.toLowerCase())); return fil; } }),
        getFasilitas: tool({ description: "Ambil fasilitas", parameters: z.object({}), execute: async () => facilities }),
        getBerita: tool({ description: "Berita terbaru", parameters: z.object({}), execute: async () => news.slice(0, 5) }),
      },
    });
    return result.toTextStreamResponse();
  } catch (err) {
    console.error("Groq error:", err);
    return new Response(`Maaf, Ceria sedang gangguan koneksi AI.\n\nTapi Bapak/Ibu bisa cek langsung:\n- **PPDB**: Menu PPDB > Informasi\n- **Layanan**: Menu Layanan > Standar Pelayanan\n- **Fasilitas**: Menu Profil > Fasilitas\n- **FAQ**: Menu Layanan > Pertanyaan Ayah & Ibu\n- **Kontak**: Menu Kontak > Lokasi\n\nAtau hubungi operator jam ${schoolProfile?.jamLayanan ?? "07.30-13.00 WIB"}.`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
