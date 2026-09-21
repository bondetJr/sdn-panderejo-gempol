import sharp from "sharp";
import { createAdminClient, PUBLIC_MEDIA_BUCKET } from "@/lib/supabase/server";

export const MAX_PUBLIC_IMAGE_SIZE = 4 * 1024 * 1024;
export const MAX_PUBLIC_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Upload gambar publik dalam format WebP setelah normalisasi orientasi EXIF.
 * File ini hanya boleh dipakai dari Server Action atau kode server.
 */
export async function uploadPublicImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Format gambar harus JPG, PNG, atau WebP.");
  }

  if (file.size > MAX_PUBLIC_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 4 MB. Kompres gambar lalu coba lagi.");
  }

  const supabase = createAdminClient();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const imageBuffer = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate()
    .webp({ quality: 82 })
    .toBuffer();

  const { error } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(path, imageBuffer, { contentType: "image/webp", upsert: false });

  if (error) throw new Error(`Gagal upload gambar: ${error.message}`);

  const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload dokumen publik ke bucket public-media agar URL dapat diunduh langsung.
 */
export async function uploadPublicFile(file: File, folder: string): Promise<string> {
  if (file.size > MAX_PUBLIC_FILE_SIZE) {
    throw new Error("Ukuran file maksimal 10 MB.");
  }

  const supabase = createAdminClient();
  const safeName = file.name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const { error } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });

  if (error) throw new Error(`Gagal upload dokumen: ${error.message}`);

  const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
