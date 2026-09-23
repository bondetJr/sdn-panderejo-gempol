import Groq from "groq-sdk";
import { groq } from "@ai-sdk/groq";
import { streamText, tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkPpdbStatus } from "@/lib/ppdb-data";
import { CERIA_SYSTEM_PROMPT } from "@/lib/chat-system-prompt";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getSchoolProfile } from "@/lib/school";
import { getAllTeachers } from "@/lib/teacher-data";
import { getAchievements, getFasilitasAll } from "@/lib/profil-data";
import { getAllAnnouncements, getAllNews, getAllGalleryAlbums } from "@/lib/informasi-data";
import { getAgenda, getExtracurriculars } from "@/lib/academic-data";
import { getFlagshipPrograms } from "@/lib/program-unggulan-data";

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

async function searchExternalReferences(query: string, detailed = false) {
  const sources: Array<{ sumber: string; hasil: Array<{ judul: string; ringkasan: string; url: string }> }> = [];
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (tavilyKey) {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        topic: "general",
        search_depth: "basic",
        max_results: detailed ? 5 : 3,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Tavily returned ${response.status}.`);
    const data = (await response.json()) as {
      answer?: string;
      results?: Array<{ title: string; content: string; url: string }>;
    };
    const tavilyResults = (data.results ?? []).map((result) => ({
      judul: result.title,
      ringkasan: result.content,
      url: result.url,
    }));
    sources.push({
      sumber: "Tavily",
      hasil: [
        ...(data.answer ? [{ judul: "Ringkasan Tavily", ringkasan: data.answer, url: "https://tavily.com" }] : []),
        ...tavilyResults,
      ],
    });
  }

  if (/(penelitian|jurnal|makalah|paper|akademik|ilmiah|skripsi|tesis|disertasi|riset)/i.test(query)) {
    const openAlexParams = new URLSearchParams({
      search: query,
      "per-page": "5",
      mailto: "sdnpanderejogempol@gmail.com",
    });
    const openAlexResponse = await fetch(
      `https://api.openalex.org/works?${openAlexParams.toString()}`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (openAlexResponse.ok) {
      const data = (await openAlexResponse.json()) as {
        results?: Array<{
          title?: string;
          publication_year?: number;
          doi?: string;
          primary_location?: { landing_page_url?: string };
        }>;
      };
      sources.push({
        sumber: "OpenAlex",
        hasil: (data.results ?? []).map((result) => ({
          judul: `${result.title ?? "Publikasi"}${result.publication_year ? ` (${result.publication_year})` : ""}`,
          ringkasan: "Referensi publikasi akademik.",
          url: result.doi ?? result.primary_location?.landing_page_url ?? "https://openalex.org",
        })),
      });
    }
  }

  return sources;
}

async function withTimeout<T>(
  operation: Promise<T>,
  fallback: T,
  label: string,
  timeoutMs = 4_000
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

  const latestUserMessage = [...parsed.data.messages]
    .reverse()
    .find((message) => message.role === "user")
    ?.content.toLocaleLowerCase("id-ID") ?? "";
  const isSchoolQuestion = /(sekolah|guru|kepala|jabatan|fasilitas|ppdb|panderejo|gempol|ekstrakurikuler|berita|agenda)/i.test(
    latestUserMessage
  );
  const isGreeting = /^(halo|haloo|hai|hy|tess|hi|hello|pagi|siang|sore|malam|permisi|tes)[\s!.?,]*$/i.test(
    latestUserMessage.trim()
  );

  if (isGreeting) {
    return new Response("Halo Bapak/Ibu! Ada yang bisa Ceria bantu hari ini?", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!isSchoolQuestion) {
    try {
      const wantsDetail = /(rinci|detail|lengkap|selengkapnya|mendalam|jelaskan lebih|uraikan|penjelasan panjang)/i.test(
        latestUserMessage
      );
      const sources = await searchExternalReferences(latestUserMessage, wantsDetail);
      const answer = sources.some((source) => source.hasil.length > 0)
        ? sources.flatMap((source) => {
            const items = source.hasil.filter((item) => item.judul !== "Ringkasan Tavily");
            const summary = source.hasil.find((item) => item.judul === "Ringkasan Tavily");
            if (!wantsDetail && summary) {
              return [`${summary.ringkasan}\nSumber: ${summary.url}`];
            }
            return (summary ? [summary, ...items] : items)
              .slice(0, wantsDetail ? 6 : 1)
              .map((item) => `${item.ringkasan.slice(0, wantsDetail ? 700 : 280)}${item.ringkasan.length > (wantsDetail ? 700 : 280) ? "..." : ""}\nSumber: ${item.url}`);
          }).join("\n\n")
        : "Maaf, referensi eksternal tidak menemukan hasil yang sesuai.";
      return new Response(answer, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (error) {
      console.error("External reference error:", error);
      return new Response("Maaf, referensi eksternal sedang tidak dapat diakses.", { status: 503 });
    }
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
    galleryAlbums,
    agenda,
    extracurriculars,
    flagshipPrograms,
    achievements,
    committeeMembers,
    activeWaves,
  ] = await Promise.all([
      withTimeout(getSchoolProfile(), null, "profil sekolah"),
      withTimeout(getAllTeachers(), [], "guru"),
      withTimeout(getFasilitasAll(), [], "fasilitas"),
      withTimeout(getAllNews(), [], "berita"),
      withTimeout(getAllAnnouncements(), [], "pengumuman"),
      withTimeout(getAllGalleryAlbums(), [], "galeri"),
      withTimeout(getAgenda(), [], "agenda"),
      withTimeout(getExtracurriculars(), [], "ekstrakurikuler"),
      withTimeout(getFlagshipPrograms(), [], "program unggulan"),
      withTimeout(getAchievements(), [], "prestasi"),
      withTimeout(prisma.orgCommitteeMember.findMany({
        select: { nama: true, jabatan: true },
        orderBy: { urutan: "asc" },
      }).catch((error) => {
        console.error("Chat committee query error:", error);
        return [];
      }), [], "struktur komite"),
      withTimeout(prisma.ppdbWave
        .findMany({
          where: { isActive: true },
          select: { jalur: true, tahunAjaran: true },
          orderBy: { jalur: "asc" },
        })
        .catch((error) => {
          console.error("Chat PPDB wave query error:", error);
          return [];
        }), [], "gelombang PPDB"),
    ]);

  const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const compact = (value: string | null | undefined, max = 320) =>
    value ? value.replace(/\s+/g, " ").slice(0, max) : null;
  const websiteData = {
    profilSekolah: schoolProfile
      ? {
          nama: schoolProfile.nama,
          alamat: compact(schoolProfile.alamat),
          telepon: schoolProfile.telepon,
          email: schoolProfile.email,
          akreditasi: schoolProfile.akreditasi,
          tahunAjaranAktif: schoolProfile.tahunAjaranAktif,
          jamLayanan: schoolProfile.jamLayanan,
        }
      : { pesan: "Data profil sekolah belum tersedia." },
    guru: teachers.map(({ nama, jabatan, statusKepegawaian, mapelDiampu, isKepalaSekolah }) => ({
      nama,
      jabatan,
      statusKepegawaian,
      mapelDiampu,
      isKepalaSekolah,
    })),
    fasilitas: facilities.map(({ nama, deskripsi }) => ({ nama, deskripsi: compact(deskripsi) })),
    berita: news.slice(0, 10).map(({ title, excerpt, content, publishedAt }) => ({
      title,
      excerpt: compact(excerpt),
      content: compact(content, 500),
      publishedAt,
    })),
    pengumuman: announcements.slice(0, 10).map(({ title, content, isPenting, publishedAt }) => ({
      title,
      content: compact(content, 500),
      isPenting,
      publishedAt,
    })),
    galeri: galleryAlbums.map(({ judul, deskripsi, coverUrl, jumlahFoto }) => ({
      judul,
      deskripsi: compact(deskripsi),
      coverUrl,
      jumlahFoto,
    })),
    agenda: agenda.map(({ judul, deskripsi, tanggalMulai, tanggalSelesai, kategori }) => ({
      judul,
      deskripsi: compact(deskripsi),
      tanggalMulai,
      tanggalSelesai,
      kategori,
    })),
    ekstrakurikuler: extracurriculars.map(({ nama, deskripsi, jadwal, pembina }) => ({
      nama,
      deskripsi: compact(deskripsi),
      jadwal,
      pembina: pembina?.nama ?? null,
    })),
    programUnggulan: flagshipPrograms.map(({ nama, deskripsiSingkat, deskripsiLengkap }) => ({
      nama,
      deskripsiSingkat: compact(deskripsiSingkat),
      deskripsiLengkap: compact(deskripsiLengkap, 500),
    })),
    prestasi: achievements.map(({ judul, tingkat, tahun, deskripsi, atasNamaSiswa }) => ({
      judul,
      tingkat,
      tahun,
      deskripsi: compact(deskripsi),
      atasNamaSiswa,
    })),
    strukturKomite: committeeMembers,
  };

  const systemPrompt = `Kamu adalah Ceria, Asisten Digital SDN Panderejo Gempol. Jawab ramah, singkat, bahasa Indonesia. ${CERIA_SYSTEM_PROMPT}

Informasi gelombang PPDB aktif saat ini:${(activeWaves as { jalur: string; tahunAjaran: string }[]).length > 0 ? (activeWaves as { jalur: string; tahunAjaran: string }[]).map((wave) => `${wave.jalur} (${wave.tahunAjaran})`).join(", ") : "Belum ada gelombang aktif."}

ATURAN DATA WEBSITE:
- Gunakan DATA WEBSITE yang disediakan di bawah sebagai sumber utama jawaban.
- Jika DATA WEBSITE berisi jawaban, jawab langsung berdasarkan data tersebut.
- Tool tetap tersedia untuk pencarian yang lebih spesifik atau pengecekan status PPDB.
- Untuk pertanyaan profil/alamat/kontak sekolah, WAJIB panggil getProfilSekolah.
- Untuk pertanyaan guru atau tenaga kependidikan, WAJIB panggil getGuru.
- Untuk pertanyaan fasilitas, WAJIB panggil getFasilitas.
- Untuk pertanyaan berita/pengumuman, WAJIB panggil getBerita.
- Untuk pertanyaan galeri, WAJIB panggil getGaleri.
- Untuk pertanyaan agenda/kegiatan sekolah, WAJIB panggil getAgenda.
- Untuk pertanyaan ekstrakurikuler, WAJIB panggil getEkstrakurikuler.
- Untuk pertanyaan program unggulan, prestasi, atau struktur komite, gunakan DATA WEBSITE.
- Untuk pertanyaan di luar konteks sekolah, panggil cariReferensiLuar sebelum menjawab.
- Untuk pertanyaan umum atau informasi terbaru, gunakan cariReferensiLuar dan sebutkan sumbernya.
- Jika referensi luar tidak menemukan hasil, jelaskan keterbatasannya dan jangan mengarang.
- DATA WEBSITE tidak memuat data siswa, NIK, NISN, alamat pribadi, nomor telepon orang tua, atau kredensial admin.
- Jangan mengarang data dan jangan menyebut data yang tidak tersedia.

DATA WEBSITE:
${JSON.stringify(websiteData)}`;

  const normalizedUserMessage = normalizeClassNumber(latestUserMessage);

  if (isSchoolQuestion && /(kepala sekolah|pimpinan sekolah|nama kepala)/i.test(normalizedUserMessage)) {
    const principal = teachers.find((teacher) => teacher.isKepalaSekolah);
    const answer = principal
      ? `Kepala Sekolah SDN Panderejo Gempol adalah ${principal.nama} dengan jabatan ${principal.jabatan}.`
      : "Data kepala sekolah belum tersedia di database website.";
    return new Response(answer, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (isSchoolQuestion && /(jabatan|guru kelas|guru dan tendik|tenaga kependidikan)/i.test(normalizedUserMessage)) {
    const requestedClass = extractClassNumber(normalizedUserMessage);
    const matchingTeachers = requestedClass
      ? teachers.filter((teacher) => {
          const teacherClass = extractClassNumber(teacher.jabatan);
          return teacherClass === requestedClass;
        })
      : teachers;
    const asksForName = /\b(nama|siapa)\b/i.test(normalizedUserMessage);
    const answer = matchingTeachers.length
      ? requestedClass && asksForName
        ? matchingTeachers.map((teacher) => teacher.nama).join("\n")
        : matchingTeachers
            .map((teacher) => `- ${teacher.nama}: ${teacher.jabatan}${teacher.mapelDiampu ? ` (${teacher.mapelDiampu})` : ""}`)
            .join("\n")
      : "Data guru yang ditanyakan belum tersedia di database website.";
    return new Response(answer, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!isSchoolQuestion) {
    try {
      const searchParams = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: latestUserMessage,
        format: "json",
        utf8: "1",
        srlimit: "3",
        origin: "*",
      });
      const wikipediaResponse = await fetch(
        `https://id.wikipedia.org/w/api.php?${searchParams.toString()}`,
        { signal: AbortSignal.timeout(8_000) }
      );

      if (!wikipediaResponse.ok) {
        throw new Error(`Wikipedia returned ${wikipediaResponse.status}.`);
      }

      const wikipediaData = (await wikipediaResponse.json()) as {
        query?: {
          search?: Array<{ title: string; snippet: string; pageid: number }>;
        };
      };
      const results = wikipediaData.query?.search ?? [];
      const answer =
        results.length > 0
          ? `Referensi Wikipedia:\n\n${results
              .map(
                (result) =>
                  `${result.title}\n${result.snippet.replace(/<[^>]*>/g, "")}\nhttps://id.wikipedia.org/?curid=${result.pageid}`
              )
              .join("\n\n")}`
          : "Maaf, referensi yang sesuai tidak ditemukan di Wikipedia.";

      return new Response(answer, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (error) {
      console.error("Wikipedia reference error:", error);
      return new Response(
        "Maaf, Wikipedia sedang tidak dapat diakses. Silakan coba lagi beberapa saat.",
        { status: 503 }
      );
    }
  }

  try {
    const result = streamText({
      model: groq("openai/gpt-oss-20b"),
      system: systemPrompt,
      messages: parsed.data.messages,
      tools: {
        getProfilSekolah: tool({
          description: "Mengambil profil sekolah, alamat, kontak, akreditasi, dan tahun ajaran dari database website.",
          parameters: z.object({}),
          execute: async () => {
            return prisma.school.findFirst({
              select: {
                nama: true,
                npsn: true,
                tagline: true,
                alamat: true,
                desa: true,
                kecamatan: true,
                kabupaten: true,
                provinsi: true,
                kodePos: true,
                telepon: true,
                email: true,
                akreditasi: true,
                akreditasiTahun: true,
                tahunAjaranAktif: true,
                jamLayanan: true,
              },
            });
          },
        }),
        getGuru: tool({
          description: "Mengambil daftar guru dan tenaga kependidikan aktif dari database. Jangan tampilkan NIP atau NUPTK.",
          parameters: z.object({
            nama: z.string().optional().describe("Nama atau jabatan yang ingin dicari"),
          }),
          execute: async ({ nama }) => {
            const search = nama?.trim().toLocaleLowerCase("id-ID");
            const matchingTeachers = search
              ? teachers.filter((teacher) =>
                  [teacher.nama, teacher.jabatan, teacher.mapelDiampu]
                    .filter((value): value is string => Boolean(value))
                    .some((value) => value.toLocaleLowerCase("id-ID").includes(search))
                )
              : teachers;

            return matchingTeachers.map(
              ({ nama: teacherName, jabatan, statusKepegawaian, mapelDiampu, isKepalaSekolah }) => ({
                nama: teacherName,
                jabatan,
                statusKepegawaian,
                mapelDiampu,
                isKepalaSekolah,
              })
            );
          },
        }),
        getFasilitas: tool({
          description: "Mengambil fasilitas sekolah yang dipublikasikan dari database.",
          parameters: z.object({
            nama: z.string().optional().describe("Nama fasilitas yang ingin dicari"),
          }),
          execute: async ({ nama }) => {
            return prisma.facility.findMany({
              where: {
                isPublished: true,
                ...(nama ? { nama: { contains: nama, mode: "insensitive" } } : {}),
              },
              select: { nama: true, deskripsi: true },
              orderBy: { urutan: "asc" },
            });
          },
        }),
        getBerita: tool({
          description: "Mengambil berita sekolah yang sudah dipublikasikan dari database.",
          parameters: z.object({
            kataKunci: z.string().optional().describe("Judul atau kata kunci berita"),
          }),
          execute: async ({ kataKunci }) => {
            return prisma.news.findMany({
              where: {
                status: "PUBLISHED",
                ...(kataKunci
                  ? {
                      OR: [
                        { title: { contains: kataKunci, mode: "insensitive" } },
                        { content: { contains: kataKunci, mode: "insensitive" } },
                      ],
                    }
                  : {}),
              },
              select: {
                title: true,
                excerpt: true,
                content: true,
                publishedAt: true,
              },
              orderBy: { publishedAt: "desc" },
              take: 10,
            });
          },
        }),
        getGaleri: tool({
          description: "Mengambil album dan foto galeri sekolah dari database.",
          parameters: z.object({
            kataKunci: z.string().optional().describe("Judul album atau kata kunci galeri"),
          }),
          execute: async ({ kataKunci }) => {
            return prisma.galleryAlbum.findMany({
              where: kataKunci
                ? {
                    OR: [
                      { judul: { contains: kataKunci, mode: "insensitive" } },
                      { deskripsi: { contains: kataKunci, mode: "insensitive" } },
                    ],
                  }
                : undefined,
              select: {
                judul: true,
                deskripsi: true,
                photos: {
                  select: { caption: true, url: true },
                  orderBy: { urutan: "asc" },
                  take: 5,
                },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            });
          },
        }),
        getAgenda: tool({
          description: "Mengambil agenda dan kegiatan sekolah dari database.",
          parameters: z.object({
            kataKunci: z.string().optional().describe("Judul atau kategori agenda"),
          }),
          execute: async ({ kataKunci }) => {
            return prisma.agenda.findMany({
              where: kataKunci
                ? {
                    OR: [
                      { judul: { contains: kataKunci, mode: "insensitive" } },
                      { kategori: { contains: kataKunci, mode: "insensitive" } },
                    ],
                  }
                : undefined,
              select: {
                judul: true,
                deskripsi: true,
                tanggalMulai: true,
                tanggalSelesai: true,
                kategori: true,
              },
              orderBy: { tanggalMulai: "asc" },
              take: 20,
            });
          },
        }),
        getEkstrakurikuler: tool({
          description: "Mengambil daftar ekstrakurikuler sekolah dari database.",
          parameters: z.object({
            nama: z.string().optional().describe("Nama ekstrakurikuler yang ingin dicari"),
          }),
          execute: async ({ nama }) => {
            return prisma.extracurricular.findMany({
              where: nama ? { nama: { contains: nama, mode: "insensitive" } } : undefined,
              select: {
                nama: true,
                deskripsi: true,
                jadwal: true,
                pembina: { select: { nama: true } },
              },
              orderBy: { nama: "asc" },
            });
          },
        }),
        cariReferensiLuar: tool({
          description:
            "Mencari referensi pengetahuan umum. Gunakan pencarian web umum untuk informasi terbaru, lalu Wikipedia bila pencarian web tidak tersedia.",
          parameters: z.object({
            query: z.string().min(2).max(200).describe("Topik atau pertanyaan yang ingin dicari"),
            bahasa: z.enum(["id", "en"]).default("id").describe("Bahasa referensi"),
          }),
          execute: async ({ query, bahasa }) => {
            const tavilyKey = process.env.TAVILY_API_KEY;
            if (tavilyKey) {
              const response = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${tavilyKey}`,
                },
                body: JSON.stringify({
                  api_key: tavilyKey,
                  query,
                  topic: "general",
                  search_depth: "advanced",
                  max_results: 5,
                  include_answer: true,
                }),
                signal: AbortSignal.timeout(10_000),
              });

              if (!response.ok) {
                throw new Error(`Pencarian web gagal dengan status ${response.status}.`);
              }

              const data = (await response.json()) as {
                answer?: string;
                results?: Array<{ title: string; content: string; url: string }>;
              };

              return {
                sumber: "Pencarian web Tavily",
                jawabanRingkas: data.answer ?? null,
                hasil: (data.results ?? []).map((result) => ({
                  judul: result.title,
                  ringkasan: result.content,
                  url: result.url,
                })),
              };
            }

            const braveKey = process.env.BRAVE_SEARCH_API_KEY;
            if (braveKey) {
              const response = await fetch(
                `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
                {
                  headers: {
                    Accept: "application/json",
                    "X-Subscription-Token": braveKey,
                  },
                  signal: AbortSignal.timeout(10_000),
                }
              );

              if (!response.ok) {
                throw new Error(`Pencarian web gagal dengan status ${response.status}.`);
              }

              const data = (await response.json()) as {
                web?: {
                  results?: Array<{ title: string; description: string; url: string }>;
                };
              };

              return {
                sumber: "Pencarian web Brave",
                hasil: (data.web?.results ?? []).map((result) => ({
                  judul: result.title,
                  ringkasan: result.description,
                  url: result.url,
                })),
              };
            }

            const searchParams = new URLSearchParams({
              action: "query",
              list: "search",
              srsearch: query,
              format: "json",
              utf8: "1",
              srlimit: "5",
              origin: "*",
            });
            const searchResponse = await fetch(
              `https://${bahasa}.wikipedia.org/w/api.php?${searchParams.toString()}`,
              { signal: AbortSignal.timeout(8_000) }
            );

            if (!searchResponse.ok) {
              throw new Error(`Referensi eksternal gagal dengan status ${searchResponse.status}.`);
            }

            const searchData = (await searchResponse.json()) as {
              query?: { search?: Array<{ title: string; snippet: string; pageid: number }> };
            };
            const results = searchData.query?.search ?? [];

            if (results.length === 0) {
              return { sumber: "Wikipedia", hasil: [], pesan: "Tidak ada referensi yang cocok." };
            }

            return {
              sumber: "Wikipedia (fallback)",
              hasil: results.map((result) => ({
                judul: result.title,
                ringkasan: result.snippet.replace(/<[^>]*>/g, ""),
                url: `https://${bahasa}.wikipedia.org/?curid=${result.pageid}`,
              })),
            };
          },
        }),
        cekStatusPpdb: tool({
          description: "Cek status pendaftaran PPDB berdasarkan nomor pendaftaran dan NIK.",
          parameters: z.object({
            noPendaftaran: z.string().min(1),
            nik: z.string().min(1),
          }),
          execute: async ({ noPendaftaran, nik }) => {
            return await checkPpdbStatus(noPendaftaran, nik);
          },
        }),
      },
      maxSteps: 2,
      maxTokens: 400,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat AI fallback error:", error);

    let completion;
    try {
      completion = await groqClient.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          ...parsed.data.messages,
        ],
        stream: true,
        max_tokens: 400,
      });
    } catch (fallbackError) {
      console.error("Chat provider fallback error:", fallbackError);
      return new Response(
        "Layanan AI sedang mencapai batas penggunaan. Silakan coba lagi dalam beberapa saat.",
        { status: 429 }
      );
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) controller.enqueue(encoder.encode(content));
          }
          controller.close();
        } catch (streamError) {
          controller.error(streamError);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}