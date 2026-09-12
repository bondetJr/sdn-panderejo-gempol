import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase untuk browser. Dipakai untuk upload dokumen PPDB
 * langsung dari form ke bucket privat `ppdb-documents`.
 * Hanya pakai ANON KEY di sini — JANGAN pernah taruh service role
 * key di kode yang jalan di browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
