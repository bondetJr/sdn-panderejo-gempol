import sharp from "sharp";
import { createAdminClient, PUBLIC_MEDIA_BUCKET } from "@/lib/supabase/server";

/**
 * Upload gambar publik dalam format WebP setelah normalisasi orientasi EXIF.
 * File ini hanya boleh dipakai dari Server Action atau kode server.
 */
export async function uploadPublicImage(file: File, folder: string): Promise<string> {
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
