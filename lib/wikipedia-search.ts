// lib/wikipedia-search.ts
// Fallback Wikipedia untuk pertanyaan umum - GRATIS, no API key, no SSL issue

export type WikiResult = {
  title: string;
  snippet: string;
  link: string;
};

export async function searchWikipedia(query: string): Promise<WikiResult[] | null> {
  try {
    // Cari artikel relevan di Wikipedia Indonesia
    const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3&srprop=snippet`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "CeriaBot-SDN-Panderejo/1.0" },
      next: { revalidate: 3600 },
    });
    
    if (!searchRes.ok) {
      console.error("[Wikipedia] Search failed:", searchRes.status);
      return null;
    }
    
    const searchData = await searchRes.json() as {
      query?: { search?: { title: string; snippet: string }[] };
    };
    
    const searchResults = searchData.query?.search || [];
    if (searchResults.length === 0) return null;
    
    const results: WikiResult[] = [];
    
    for (const item of searchResults.slice(0, 2)) {
      // Ambil extract/ringkasan artikel
      try {
        const extractUrl = `https://id.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&exsentences=3&titles=${encodeURIComponent(item.title)}&format=json&origin=*`;
        const extractRes = await fetch(extractUrl, {
          headers: { "User-Agent": "CeriaBot-SDN-Panderejo/1.0" },
          next: { revalidate: 3600 },
        });
        
        if (extractRes.ok) {
          const extractData = await extractRes.json() as {
            query?: { pages?: Record<string, { extract?: string; title?: string }> };
          };
          
          const pages = extractData.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0];
            if (page?.extract) {
              results.push({
                title: item.title,
                snippet: page.extract.slice(0, 400),
                link: `https://id.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
              });
              continue;
            }
          }
        }
        
        // Fallback pakai snippet dari search
        results.push({
          title: item.title,
          snippet: item.snippet.replace(/<[^>]*>/g, "").slice(0, 400),
          link: `https://id.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
        });
      } catch (e) {
        console.error("[Wikipedia] Extract error:", e);
      }
    }
    
    return results.length > 0 ? results : null;
  } catch (e) {
    console.error("[Wikipedia] error:", e);
    return null;
  }
}
