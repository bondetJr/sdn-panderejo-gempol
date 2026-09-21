import { createAdminClient, PUBLIC_MEDIA_BUCKET } from "@/lib/supabase/server";

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
}

/**
 * Upload dokumen publik (PDF/DOC/DOCX) apa adanya ke bucket publik.
 * File ini hanya boleh dipakai dari Server Action atau kode server.
 */
export async function uploadPublicDocument(file: File, folder: string): Promise<string> {
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    throw new Error("Format dokumen harus PDF, DOC, atau DOCX.");
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error("Ukuran dokumen maksimal 10 MB.");
  }

  const supabase = createAdminClient();
  const path = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error } = await supabase.storage
    .from(PUBLIC_MEDIA_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Gagal upload dokumen: ${error.message}`);

  const { data } = supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
