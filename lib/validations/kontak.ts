import { z } from "zod";

export const contactMessageSchema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter"),
  email: z.string().trim().email("Format email tidak valid").optional().or(z.literal("")),
  telepon: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{7,10}$/, "Nomor telepon tidak valid")
    .optional()
    .or(z.literal("")),
  subjek: z.string().trim().min(3, "Subjek minimal 3 karakter"),
  pesan: z.string().trim().min(10, "Pesan minimal 10 karakter"),
  isPengaduan: z.boolean().optional().default(false),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const testimonialSchema = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter"),
  peran: z.string().trim().min(3, "Contoh: Wali Murid Kelas 3A"),
  pesan: z.string().trim().min(10, "Pesan minimal 10 karakter").max(500, "Maksimal 500 karakter"),
  rating: z.coerce.number().min(1).max(5),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
