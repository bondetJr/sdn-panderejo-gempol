// lib/google-search.ts
// Fallback Google Search untuk Ceria jika data tidak ada di DB

export type GoogleSearchResult = {
  title: string;
  link: string;
  snippet: string;
};

type GoogleApiItem = {
  title: string;
  link: string;
  snippet: string;
};

type GoogleApiResponse = {
  items?: GoogleApiItem[];
};

type DuckDuckGoTopic = {
  Text?: string;
  FirstURL?: string;
};

type DuckDuckGoResponse = {
  AbstractText?: string;
  Heading?: string;
  AbstractURL?: string;
  RelatedTopics?: DuckDuckGoTopic[];
};

export async function searchGoogle(query: string): Promise<GoogleSearchResult[] | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    console.warn("[Google Search] GOOGLE_API_KEY atau GOOGLE_CSE_ID belum di set, skip Google search");
    return null;
  }

  try {
    // FIX: Hapus hl & gl yang bikin 400 error di CSE ID baru
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=3`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[Google Search] API error:", res.status, errText);
      // Jika 400, kemungkinan CSE ID format baru atau billing belum enable - coba Wikipedia saja
      if (res.status === 400) {
        console.warn("[Google Search] 400 error - CSE mungkin butuh enable billing atau format ID salah. Gunakan Wikipedia fallback.");
      }
      return null;
    }

    const data = (await res.json()) as GoogleApiResponse;
    const items = data.items || [];

    return items.map((item) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));
  } catch (e) {
    console.error("[Google Search] error:", e);
    return null;
  }
}

export async function searchDuckDuckGo(query: string): Promise<GoogleSearchResult[] | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`;
    const res = await fetch(url, { headers: { "User-Agent": "CeriaBot/1.0" } });
    if (!res.ok) return null;
    
    const data = (await res.json()) as DuckDuckGoResponse;
    const results: GoogleSearchResult[] = [];
    
    if (data.AbstractText) {
      results.push({
        title: data.Heading || query,
        link: data.AbstractURL || "",
        snippet: data.AbstractText,
      });
    }
    
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 3)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(" - ")[0] || topic.Text.slice(0, 60),
            link: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }
    
    return results.length > 0 ? results : null;
  } catch (e) {
    console.error("[DuckDuckGo Search] error:", e);
    return null;
  }
}

export function isGeneralKnowledgeQuery(query: string): boolean {
  const lower = query.toLowerCase();
  
  // Kata kunci spesifik sekolah -> jangan pakai Google
  const schoolKeywords = [
    "sdn panderejo", "panderejo gempol", "sd panderejo", "sdn panderejo gempol",
    "ppdb sdn", "pendaftaran sdn", "jalur zonasi", "jalur afirmasi", "jalur prestasi",
    "guru sdn", "tendik sdn", "kepala sekolah sdn", "wali kelas sdn",
    "rombel sdn", "jumlah siswa sdn", "siswa kelas sdn",
    "akreditasi sdn", "npsn sdn", "visi misi sdn", "sejarah sdn",
    "program unggulan sdn", "prestasi sdn",
    "jadwal pelajaran sdn", "kalender akademik sdn",
    "fasilitas sdn", "ekstrakurikuler sdn",
    "layanan sdn", "standar pelayanan sdn",
    "alamat sdn", "kontak sdn", "telepon sdn", "email sdn",
  ];
  
  // Kalau ada kata kunci sekolah yang spesifik, jangan pakai Google
  const isSchoolSpecific = schoolKeywords.some((kw) => lower.includes(kw));
  if (isSchoolSpecific) {
    return false;
  }
  
  // Kalau pertanyaan mengandung kata tanya umum, anggap umum
  const generalPatterns = [
    /apa itu/i, /apa yang dimaksud/i, /pengertian/i, /definisi/i, /artinya/i,
    /bagaimana cara/i, /cara menghitung/i, /cara membuat/i, /rumus/i, /cara kerja/i,
    /kenapa/i, /mengapa/i, /bagaimana/i, /kapan/i, /dimana/i, /siapa/i,
    /contoh/i, /jenis/i, /macam/i, /perbedaan/i,
    /manfaat/i, /kegunaan/i, /fungsi/i, /kandungan/i,
    /sejarah/i, /asal usul/i, /penemu/i,
  ];
  
  if (generalPatterns.some((p) => p.test(query))) {
    return true;
  }
  
  // Kalau tidak ada kata kunci sekolah sama sekali dan panjang > 8, anggap umum (biar Google kepanggil)
  const hasAnySchoolKeyword = ["sekolah", "sdn", "guru", "ppdb", "siswa", "kelas", "rombel", "akreditasi", "visi", "misi", "jadwal", "ekskul", "fasilitas", "layanan"].some(kw => lower.includes(kw));
  if (!hasAnySchoolKeyword && lower.length > 8) {
    return true;
  }
  
  return false;
}
