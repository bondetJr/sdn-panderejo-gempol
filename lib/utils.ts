import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format tanggal Indonesia, mis. "11 Agustus 2026" */
export function formatTanggalId(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Generate nomor pendaftaran PPDB, mis. PPDB-2026-000123 */
export function generateNoPendaftaran(tahun: number, urutan: number) {
  return `PPDB-${tahun}-${String(urutan).padStart(6, "0")}`;
}
