import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase khusus SERVER (API routes / Server Actions saja),
 * pakai SERVICE ROLE KEY yang punya akses penuh — termasuk baca/tulis
 * bucket privat `ppdb-documents` tanpa terikat RLS.
 *
 * JANGAN PERNAH import file ini dari komponen client ("use client").
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}

export const PPDB_DOCUMENTS_BUCKET = "ppdb-documents";

/**
 * Bucket PUBLIK untuk gambar yang memang boleh diakses siapa saja
 * tanpa login: cover berita, foto galeri, foto fasilitas, foto guru.
 * Beda dengan PPDB_DOCUMENTS_BUCKET yang privat.
 */
export const PUBLIC_MEDIA_BUCKET = "public-media";

/**
 * Upload satu file gambar ke bucket publik dan kembalikan public URL.
 * Dipakai di berbagai Server Action admin (News, Gallery, Facility, Teacher).
 */
export async function uploadPublicImage(
  file: File,
  folder: string
): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Gagal upload gambar: ${error.message}`);

  const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
