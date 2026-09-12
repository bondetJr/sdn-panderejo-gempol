import { z } from "zod";

/**
 * Validasi NIK: 16 digit angka.
 * Validasi NISN: 10 digit angka (opsional, karena calon siswa TK
 * kadang belum punya NISN sebelum masuk SD).
 */
const nikSchema = z
  .string()
  .trim()
  .regex(/^\d{16}$/, "NIK harus 16 digit angka");

const nisnSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "NISN harus 10 digit angka")
  .optional()
  .or(z.literal(""));

const noHpSchema = z
  .string()
  .trim()
  .regex(/^(\+62|62|0)8[1-9][0-9]{7,10}$/, "Nomor HP tidak valid, contoh: 081234567890");

// ---------------------------------------------------------------
// STEP 1 — Pilih Jalur
// ---------------------------------------------------------------
export const step1Schema = z
  .object({
    waveId: z.string().min(1, "Pilih jalur pendaftaran"),
    jalur: z.enum(["ZONASI", "AFIRMASI", "PERPINDAHAN"]),
    jarakKeSekolahKm: z.coerce.number().optional(),
  })
  .refine(
    (data) =>
      data.jalur !== "ZONASI" ||
      (data.jarakKeSekolahKm !== undefined && data.jarakKeSekolahKm >= 0),
    {
      message: "Jarak ke sekolah wajib diisi untuk jalur Zonasi",
      path: ["jarakKeSekolahKm"],
    }
  );

// ---------------------------------------------------------------
// STEP 2 — Data Diri Calon Siswa
// ---------------------------------------------------------------
export const step2Schema = z.object({
  namaLengkap: z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
  nik: nikSchema,
  nisn: nisnSchema,
  tempatLahir: z.string().trim().min(2, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.enum(["L", "P"], { message: "Pilih jenis kelamin" }),
});

// ---------------------------------------------------------------
// STEP 3 — Data Orang Tua & Alamat
// ---------------------------------------------------------------
export const step3Schema = z.object({
  namaAyah: z.string().trim().min(3, "Nama ayah wajib diisi"),
  namaIbu: z.string().trim().min(3, "Nama ibu wajib diisi"),
  noHpOrtu: noHpSchema,
  alamat: z.string().trim().min(10, "Alamat lengkap minimal 10 karakter"),
});

// ---------------------------------------------------------------
// STEP 4 — Dokumen (validasi keberadaan file dilakukan di client,
// karena File object tidak bisa divalidasi Zod di server sama
// persis; server tetap re-validasi jenis & ukuran file saat upload)
// ---------------------------------------------------------------
export const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_FILE_SIZE_MB = 2;

export const step4Schema = z.object({
  kartuKeluarga: z.instanceof(File, { message: "Kartu Keluarga wajib diunggah" }),
  aktaKelahiran: z.instanceof(File, { message: "Akta Kelahiran wajib diunggah" }),
  ktpOrtu: z.instanceof(File, { message: "KTP Orang Tua wajib diunggah" }),
  fotoAnak: z.instanceof(File, { message: "Foto anak wajib diunggah" }),
  kip: z.instanceof(File).optional(),
  ijazahTk: z.instanceof(File).optional(),
});

// ---------------------------------------------------------------
// SKEMA GABUNGAN — dipakai saat submit final ke API
// ---------------------------------------------------------------
export const ppdbSubmitSchema = z.object({
  waveId: z.string().min(1),
  jalur: z.enum(["ZONASI", "AFIRMASI", "PERPINDAHAN"]),
  jarakKeSekolahKm: z.coerce.number().optional(),
  namaLengkap: z.string().trim().min(3),
  nik: nikSchema,
  nisn: nisnSchema,
  tempatLahir: z.string().trim().min(2),
  tanggalLahir: z.string().min(1),
  jenisKelamin: z.enum(["L", "P"]),
  namaAyah: z.string().trim().min(3),
  namaIbu: z.string().trim().min(3),
  noHpOrtu: noHpSchema,
  alamat: z.string().trim().min(10),
});

export type PpdbSubmitInput = z.infer<typeof ppdbSubmitSchema>;

// ---------------------------------------------------------------
// CEK STATUS — wajib 2 identitas sekaligus (no. pendaftaran + NIK)
// supaya tidak bisa ditebak/di-brute-force dengan 1 data saja.
// ---------------------------------------------------------------
export const cekStatusSchema = z.object({
  noPendaftaran: z.string().trim().min(5, "Nomor pendaftaran tidak valid"),
  nik: nikSchema,
});

export type CekStatusInput = z.infer<typeof cekStatusSchema>;
