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
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=5&hl=id&gl=id`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("[Google Search] API error:", res.status, await res.text());
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
  
  const schoolKeywords = [
    "sdn panderejo", "panderejo gempol", "sd panderejo",
    "ppdb", "pendaftaran", "jalur zonasi", "jalur afirmasi",
    "guru", "tendik", "kepala sekolah", "wali kelas",
    "rombel", "jumlah siswa", "siswa kelas",
    "akreditasi sekolah", "npsn", "visi misi sekolah", "sejarah sekolah",
    "program unggulan sdn", "prestasi sdn",
    "jadwal pelajaran sdn", "kalender akademik sdn",
    "fasilitas sdn", "ekstrakurikuler sdn",
    "layanan sdn", "standar pelayanan sdn",
    "alamat sdn", "kontak sdn", "telepon sdn",
  ];
  
  if (schoolKeywords.some((kw) => lower.includes(kw))) {
    return false;
  }
  
  return lower.length > 15;
}
