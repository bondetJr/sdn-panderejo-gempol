export type IndonesiaHoliday = {
  id: string;
  judul: string;
  deskripsi: string;
  tanggalMulai: Date;
  tanggalSelesai: Date | null;
  kategori: "Libur Nasional" | "Cuti Bersama";
};

function date(value: string) {
  return new Date(`${value}T12:00:00+07:00`);
}

function holiday(
  id: string,
  mulai: string,
  judul: string,
  kategori: IndonesiaHoliday["kategori"],
  selesai = mulai
): IndonesiaHoliday {
  return {
    id,
    judul,
    deskripsi: `${kategori} Indonesia 2026.`,
    tanggalMulai: date(mulai),
    tanggalSelesai: selesai === mulai ? null : date(selesai),
    kategori,
  };
}

/**
 * Kalender nasional dan cuti bersama Indonesia 2026.
 * Tanggal mengikuti SKB 3 Menteri tentang hari libur nasional dan cuti bersama.
 */
export const INDONESIA_HOLIDAYS_2026: IndonesiaHoliday[] = [
  holiday("id-2026-new-year", "2026-01-01", "Tahun Baru Masehi", "Libur Nasional"),
  holiday("id-2026-isra-miraj", "2026-01-16", "Isra Mikraj Nabi Muhammad SAW", "Libur Nasional"),
  holiday("id-2026-imlek-leave", "2026-02-16", "Cuti Bersama Tahun Baru Imlek", "Cuti Bersama"),
  holiday("id-2026-imlek", "2026-02-17", "Tahun Baru Imlek 2577 Kongzili", "Libur Nasional"),
  holiday("id-2026-nyepi-leave", "2026-03-18", "Cuti Bersama Hari Suci Nyepi", "Cuti Bersama"),
  holiday("id-2026-nyepi", "2026-03-19", "Hari Suci Nyepi", "Libur Nasional"),
  holiday("id-2026-idulfitri-1", "2026-03-21", "Idulfitri 1447 H", "Libur Nasional", "2026-03-22"),
  holiday("id-2026-idulfitri-leave-1", "2026-03-20", "Cuti Bersama Idulfitri 1447 H", "Cuti Bersama"),
  holiday("id-2026-idulfitri-leave-2", "2026-03-23", "Cuti Bersama Idulfitri 1447 H", "Cuti Bersama"),
  holiday("id-2026-idulfitri-leave-3", "2026-03-24", "Cuti Bersama Idulfitri 1447 H", "Cuti Bersama"),
  holiday("id-2026-good-friday", "2026-04-03", "Wafat Yesus Kristus", "Libur Nasional"),
  holiday("id-2026-easter", "2026-04-05", "Kebangkitan Yesus Kristus (Paskah)", "Libur Nasional"),
  holiday("id-2026-labor", "2026-05-01", "Hari Buruh Internasional", "Libur Nasional"),
  holiday("id-2026-ascension", "2026-05-14", "Kenaikan Yesus Kristus", "Libur Nasional"),
  holiday("id-2026-ascension-leave", "2026-05-15", "Cuti Bersama Kenaikan Yesus Kristus", "Cuti Bersama"),
  holiday("id-2026-eid-adha", "2026-05-27", "Iduladha 1447 H", "Libur Nasional"),
  holiday("id-2026-eid-adha-leave", "2026-05-28", "Cuti Bersama Iduladha 1447 H", "Cuti Bersama"),
  holiday("id-2026-vesak", "2026-05-31", "Hari Raya Waisak 2570 BE", "Libur Nasional"),
  holiday("id-2026-pancasila", "2026-06-01", "Hari Lahir Pancasila", "Libur Nasional"),
  holiday("id-2026-islamic-new-year", "2026-06-16", "Tahun Baru Islam 1448 H", "Libur Nasional"),
  holiday("id-2026-independence", "2026-08-17", "Hari Kemerdekaan Republik Indonesia", "Libur Nasional"),
  holiday("id-2026-mawlid", "2026-08-25", "Maulid Nabi Muhammad SAW", "Libur Nasional"),
  holiday("id-2026-christmas-leave", "2026-12-24", "Cuti Bersama Hari Raya Natal", "Cuti Bersama"),
  holiday("id-2026-christmas", "2026-12-25", "Hari Raya Natal", "Libur Nasional"),
];

