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

type FaqItem = {
  pertanyaan: string;
  jawaban: string;
};

type ScoredFaq = FaqItem & { score: number };

type LayananItem = {
  nama: string;
  deskripsi: string | null;
  persyaratan: string | null;
  waktuPelayanan: string | null;
  biaya: string | null;
  produkLayanan: string | null;
};

type PpdbWaveItem = {
  jalur: string;
  tahunAjaran: string;
  syaratText: string | null;
  kuota: number;
  tanggalBuka: Date;
  tanggalTutup: Date;
};

const ROMAN_CLASS_VALUES: Record<string, string> = {
  i: "1",
  ii: "2",
  iii: "3",
  iv: "4",
  v: "5",
  vi: "6",
};

function normalizeClassNumber(message: string): string {
  return message.replace(
    /\bkelas\s+(iv|v|iii|ii|i|vi)\b/gi,
    (_match, roman: string) => `kelas ${ROMAN_CLASS_VALUES[roman.toLowerCase()]}`
  );
}

function extractClassNumber(value: string): string | null {
  const normalized = normalizeClassNumber(value.toLocaleLowerCase("id-ID"));
  return normalized.match(/\bkelas\s*(\d+)/i)?.[1] ?? null;
}

// Helper untuk deteksi tendik / tenaga administrasi
function isTendikQuery(query: string): boolean {
  return /(tenaga administrasi|tata usaha|\btu\b|operator|tendik|tenaga kependidikan|penjaga|kebersihan|satpam|admin)/i.test(query);
}

function filterTendik(teachers: Awaited<ReturnType<typeof getAllTeachers>>) {
  return teachers.filter((t) => {
    const j = t.jabatan.toLowerCase();
    return (
      j.includes("tata usaha") ||
      j.includes("operator") ||
      j.includes("administrasi") ||
      j.includes("tu") ||
      j.includes("tendik") ||
      j.includes("penjaga") ||
      j.includes("kebersihan") ||
      j.includes("satpam") ||
      j.includes("penjaga sekolah") ||
      (!j.includes("kepala") && !j.includes("guru") && !j.includes("kelas") && !j.includes("mapel") && !j.includes("pai") && !j.includes("pjok"))
    );
  });
}

async function withTimeout<T>(
  operation: Promise<T>,
  fallback: T,
  label: string,
  timeoutMs = 4000
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`Chat data timeout: ${label}`);
      resolve(fallback);
    }, timeoutMs);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
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
  const { success } = await rateLimit(`chat:${ip}`, {
    limit: 20,
    windowMs: 60_000,
  });

  if (!success) {
    return new Response("Terlalu banyak request. Silakan coba lagi dalam 1 menit.", {
      status: 429,
    });
  }

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response("Format chat tidak valid.", { status: 400 });
  }

  const latestUserMessageRaw =
    [...parsed.data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const latestUserMessage = latestUserMessageRaw.toLocaleLowerCase("id-ID");

  const isGreeting = /^(halo|haloo|hai|hy|tess|hi|hello|pagi|siang|sore|malam|permisi|tes)[\s!.?,]*$/i.test(
    latestUserMessage.trim()
  );
  if (isGreeting) {
    return new Response(
      "Halo Bapak/Ibu! 👋 Saya Ceria, asisten digital SDN Panderejo Gempol. Ada yang bisa saya bantu seputar PPDB, fasilitas, layanan, atau pertanyaan lainnya?",
      {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }

  if (!process.env.GROQ_API_KEY) {
    return new Response("GROQ_API_KEY belum di set", { status: 500 });
  }

  const [
    schoolProfile,
    teachers,
    facilities,
    news,
    announcements,
    extracurriculars,
    flagshipPrograms,
    achievements,
    activeWaves,
    faqs,
    layanan,
  ] = await Promise.all([
    withTimeout(getSchoolProfile(), null, "profil sekolah"),
    withTimeout(getAllTeachers(), [], "guru"),
    withTimeout(getFasilitasAll(), [], "fasilitas"),
    withTimeout(getAllNews(), [], "berita"),
    withTimeout(getAllAnnouncements(), [], "pengumuman"),
    withTimeout(getExtracurriculars(), [], "ekstrakurikuler"),
    withTimeout(getFlagshipPrograms(), [], "program unggulan"),
    withTimeout(getAchievements(), [], "prestasi"),
    withTimeout(
      prisma.ppdbWave
        .findMany({
          where: { isActive: true },
          select: {
            jalur: true,
            tahunAjaran: true,
            syaratText: true,
            kuota: true,
            tanggalBuka: true,
            tanggalTutup: true,
          },
          orderBy: { jalur: "asc" },
        })
        .catch(() => [] as PpdbWaveItem[]),
      [] as PpdbWaveItem[],
      "gelombang PPDB"
    ),
    withTimeout(getFaqList(), [] as FaqItem[], "faq"),
    withTimeout(getServiceStandards(), [] as LayananItem[], "layanan"),
  ]);

  // Deteksi query tendik / tenaga administrasi - PRIORITAS
  if (isTendikQuery(latestUserMessage)) {
    const tendikList = filterTendik(teachers);
    if (tendikList.length > 0) {
      const answer = `Tenaga Administrasi / Tendik di ${schoolProfile?.nama ?? "SDN Panderejo Gempol"}:\n\n${tendikList
        .map((t) => `- **${t.nama}**: ${t.jabatan} (${t.statusKepegawaian})`)
        .join("\n")}\n\nAda lagi yang bisa Ceria bantu, Bapak/Ibu?`;
      return new Response(answer, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } else {
      const allTendik = teachers.filter((t) => !t.isKepalaSekolah && !t.jabatan.toLowerCase().includes("guru kelas"));
      if (allTendik.length > 0) {
        const answer = `Data tendik di ${schoolProfile?.nama ?? "SDN Panderejo Gempol"}:\n\n${allTendik
          .map((t) => `- ${t.nama}: ${t.jabatan}`)
          .join("\n")}\n\nAda lagi yang bisa Ceria bantu?`;
        return new Response(answer, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      return new Response(
        "Data tenaga administrasi belum tersedia di database. Silakan cek menu Profil > Guru & Tenaga Kependidikan atau hubungi operator sekolah.",
        {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      );
    }
  }

  const relevantFaqs = findRelevantFaqs(latestUserMessage, faqs as FaqItem[]);

  const topFaq = relevantFaqs[0];
  if (topFaq && topFaq.score >= 4) {
    const answer = `${topFaq.jawaban}\n\n*Sumber: Pertanyaan Ayah & Ibu - ${topFaq.pertanyaan}*\n\nAda lagi yang bisa Ceria bantu, Bapak/Ibu?`;
    return new Response(answer, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const compact = (value: string | null | undefined, max = 400) =>
    value ? value.replace(/\s+/g, " ").slice(0, max) : null;

  const websiteData = {
    profilSekolah: schoolProfile
      ? {
          nama: schoolProfile.nama,
          npsn: schoolProfile.npsn,
          alamat: compact(schoolProfile.alamat),
          telepon: schoolProfile.telepon,
          email: schoolProfile.email,
          akreditasi: schoolProfile.akreditasi,
          tahunAjaranAktif: schoolProfile.tahunAjaranAktif,
          jamLayanan: schoolProfile.jamLayanan,
        }
      : null,

    faqRelevan: relevantFaqs.length > 0 ? relevantFaqs : (faqs as FaqItem[]).slice(0, 5),

    layanan: (layanan as LayananItem[]).map((l) => ({
      nama: l.nama,
      deskripsi: compact(l.deskripsi, 300),
      persyaratan: compact(l.persyaratan, 300),
      waktuPelayanan: l.waktuPelayanan,
      biaya: l.biaya,
    })),

    guru: teachers.map(({ nama, jabatan, statusKepegawaian, mapelDiampu, isKepalaSekolah }) => ({
      nama,
      jabatan,
      statusKepegawaian,
      mapelDiampu,
      isKepalaSekolah,
    })),

    tendik: filterTendik(teachers).map(({ nama, jabatan, statusKepegawaian }) => ({
      nama,
      jabatan,
      statusKepegawaian,
    })),

    fasilitas: facilities.map(({ nama, deskripsi }) => ({
      nama,
      deskripsi: compact(deskripsi),
    })),

    ppdbAktif: activeWaves as PpdbWaveItem[],

    programUnggulan: flagshipPrograms.map(({ nama, deskripsiSingkat }) => ({
      nama,
      deskripsiSingkat: compact(deskripsiSingkat),
    })),

    ekstrakurikuler: extracurriculars.map(({ nama, jadwal }) => ({
      nama,
      jadwal,
    })),

    prestasi: achievements.slice(0, 5).map(({ judul, tingkat, tahun }) => ({
      judul,
      tingkat,
      tahun,
    })),

    beritaTerbaru: news.slice(0, 3).map(({ title, publishedAt }) => ({
      title,
      publishedAt,
    })),

    pengumumanPenting: announcements
      .filter((a) => a.isPenting)
      .slice(0, 3)
      .map(({ title }) => ({ title })),
  };

  const systemPrompt = `${CERIA_SYSTEM_PROMPT}

DATA SEKOLAH LENGKAP DARI DATABASE (Supabase):
${JSON.stringify(websiteData, null, 2)}

Gelombang PPDB Aktif: ${
    (activeWaves as PpdbWaveItem[]).length > 0
      ? (activeWaves as PpdbWaveItem[]).map((w) => `${w.jalur} - Kuota: ${w.kuota} - ${w.tahunAjaran}`).join(", ")
      : "Belum ada gelombang aktif, silakan cek menu PPDB atau hubungi operator."
  }

INSTRUKSI KHUSUS:
- Jika pertanyaan tentang tenaga administrasi, tata usaha, TU, operator, tendik: pakai data "tendik" di atas
- Jika pertanyaan cocok dengan FAQ di "faqRelevan", JAWAB PERSIS dari jawaban FAQ tersebut
- Untuk pertanyaan alamat/kontak/jam layanan, pakai data profilSekolah
- Untuk pertanyaan layanan (syarat, waktu, biaya), pakai data layanan
- Untuk pertanyaan PPDB, pakai data ppdbAktif
- Untuk pertanyaan guru, pakai data guru
- JANGAN mengarang, JANGAN pakai data luar kalau data sekolah sudah ada
`;

  const normalizedUserMessage = normalizeClassNumber(latestUserMessage);
  if (/(kepala sekolah|pimpinan sekolah|nama kepala)/i.test(normalizedUserMessage)) {
    const principal = teachers.find((t) => t.isKepalaSekolah);
    const answer = principal
      ? `Kepala Sekolah ${schoolProfile?.nama ?? "SDN Panderejo Gempol"} adalah **${principal.nama}** (${principal.jabatan}).\n\nAda lagi yang bisa Ceria bantu?`
      : "Data kepala sekolah belum tersedia di database. Silakan hubungi operator sekolah.";
    return new Response(answer, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (/(guru kelas|wali kelas)/i.test(normalizedUserMessage)) {
    const requestedClass = extractClassNumber(normalizedUserMessage);
    const matching = requestedClass
      ? teachers.filter((t) => extractClassNumber(t.jabatan) === requestedClass)
      : [];
    if (matching.length > 0) {
      const answer = matching.map((t) => `- ${t.nama}: ${t.jabatan}`).join("\n");
      return new Response(answer, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  const result = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages: parsed.data.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
    tools: {
      cekStatusPpdb: tool({
        description: "Cek status PPDB berdasarkan No Pendaftaran dan NIK. Hanya pakai jika user sudah kasih keduanya.",
        parameters: z.object({
          noPendaftaran: z.string().describe("Nomor pendaftaran PPDB, contoh PPDB-2026-000123"),
          nik: z.string().describe("NIK siswa 16 digit"),
        }),
        execute: async ({ noPendaftaran, nik }) => {
          try {
            const resultData = await checkPpdbStatus(noPendaftaran, nik);
            return resultData ?? { error: "Data tidak ditemukan. Periksa kembali No Pendaftaran dan NIK." };
          } catch {
            return { error: "Gagal cek status PPDB. Coba lagi atau hubungi operator." };
          }
        },
      }),

      getFaq: tool({
        description: "Cari FAQ / Pertanyaan Ayah & Ibu yang relevan dengan pertanyaan user",
        parameters: z.object({
          keyword: z.string().describe("Kata kunci pencarian FAQ, contoh: syarat PPDB, biaya, seragam"),
        }),
        execute: async ({ keyword }) => {
          const relevant = findRelevantFaqs(keyword, faqs as FaqItem[]);
          return relevant.length > 0 ? relevant : (faqs as FaqItem[]).slice(0, 5);
        },
      }),

      getLayanan: tool({
        description: "Ambil data Standar Pelayanan sekolah (syarat, mekanisme, waktu, biaya)",
        parameters: z.object({
          namaLayanan: z.string().optional().describe("Nama layanan yang dicari, kosongkan untuk semua"),
        }),
        execute: async ({ namaLayanan }) => {
          if (!namaLayanan) return layanan;
          const filtered = (layanan as LayananItem[]).filter((l) =>
            l.nama.toLowerCase().includes(namaLayanan.toLowerCase())
          );
          return filtered.length > 0 ? filtered : layanan;
        },
      }),

      getProfilSekolah: tool({
        description: "Ambil profil lengkap sekolah: alamat, telepon, email, akreditasi, visi misi, jam layanan",
        parameters: z.object({}),
        execute: async () => schoolProfile,
      }),

      getGuru: tool({
        description: "Ambil daftar guru dan tendik, bisa filter berdasarkan jabatan atau kelas",
        parameters: z.object({
          kelas: z.string().optional().describe("Filter kelas, contoh: 1, 2, 3"),
          jabatan: z.string().optional().describe("Filter jabatan, contoh: tata usaha, operator, administrasi, guru pai, penjaga"),
        }),
        execute: async ({ kelas, jabatan }) => {
          let filtered = teachers;
          if (kelas) {
            filtered = filtered.filter((t) => extractClassNumber(t.jabatan) === kelas);
          }
          if (jabatan) {
            const jLower = jabatan.toLowerCase();
            filtered = filtered.filter((t) => t.jabatan.toLowerCase().includes(jLower));
          }
          return filtered;
        },
      }),

      getFasilitas: tool({
        description: "Ambil daftar fasilitas sekolah",
        parameters: z.object({}),
        execute: async () => facilities,
      }),

      getBerita: tool({
        description: "Ambil berita terbaru sekolah",
        parameters: z.object({}),
        execute: async () => news.slice(0, 5),
      }),
    },
  });

  return result.toTextStreamResponse();
}
