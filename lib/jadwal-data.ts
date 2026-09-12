import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getJadwalByTingkat, type JadwalHarian } from "@/lib/subjects";

/**
 * Ambil jadwal pelajaran untuk semua tingkat (1-6) dari database.
 * Kalau admin belum mengisi jadwal untuk tingkat tertentu, tingkat
 * itu otomatis pakai jadwal CONTOH dari lib/subjects.ts supaya
 * halaman tetap enak dilihat.
 */
export const getJadwalPelajaranAll = cache(
  async (): Promise<Record<number, JadwalHarian[]>> => {
    const result: Record<number, JadwalHarian[]> = {};

    try {
      const slots = await prisma.scheduleSlot.findMany({
        orderBy: [{ tingkat: "asc" }, { hariIndex: "asc" }, { jamKe: "asc" }],
      });

      for (let tingkat = 1; tingkat <= 6; tingkat++) {
        const slotsForTingkat = slots.filter((s) => s.tingkat === tingkat);
        if (slotsForTingkat.length === 0) {
          result[tingkat] = getJadwalByTingkat(tingkat); // fallback contoh
          continue;
        }

        const hariMap = new Map<string, JadwalHarian>();
        for (const slot of slotsForTingkat) {
          if (!hariMap.has(slot.hari)) {
            hariMap.set(slot.hari, { hari: slot.hari, slots: [] });
          }
          hariMap.get(slot.hari)!.slots.push({
            jamKe: slot.jamKe,
            waktu: slot.waktu,
            subjectId: slot.subjectId as JadwalHarian["slots"][number]["subjectId"],
          });
        }
        result[tingkat] = Array.from(hariMap.values());
      }
    } catch {
      for (let tingkat = 1; tingkat <= 6; tingkat++) {
        result[tingkat] = getJadwalByTingkat(tingkat);
      }
    }

    return result;
  }
);
