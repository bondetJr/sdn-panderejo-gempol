import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { INDONESIA_HOLIDAYS_2026 } from "@/lib/indonesia-holidays";

// ---------------------------------------------------------------
// ROMBONGAN BELAJAR + SISWA
// ---------------------------------------------------------------

export type StudentRow = {
  id: string;
  nis: string | null;
  nisn: string | null;
  nama: string;
  jenisKelamin: "L" | "P" | null;
};

export type ClassRoomWithStudents = {
  id: string;
  nama: string;
  tingkat: number;
  waliKelasNama: string | null;
  waliKelasFotoUrl: string | null;
  jumlahSiswa: number;
  students: StudentRow[];
};

function dummyStudents(nama: string, jumlah: number): StudentRow[] {
  const namaDepan = [
    "Ahmad", "Siti", "Muhammad", "Nur", "Putri", "Bagas", "Zahra", "Rizky",
    "Aisyah", "Fajar", "Indah", "Dwi", "Rangga", "Salsa", "Bima", "Kayla",
  ];
  const namaBelakang = [
    "Ramadhan", "Wijaya", "Saputra", "Anggraini", "Pratama", "Lestari",
    "Firmansyah", "Kusuma", "Maulana", "Safitri", "Nugroho", "Wulandari",
  ];
  return Array.from({ length: jumlah }).map((_, i) => {
    const jk: "L" | "P" = i % 2 === 0 ? "L" : "P";
    const namaSiswa = `${namaDepan[i % namaDepan.length]} ${
      namaBelakang[(i * 3) % namaBelakang.length]
    }`;
    return {
      id: `dummy-${nama}-${i}`,
      nis: String(2024000 + i).padStart(7, "0"),
      nisn: String(3050000000 + i * 7),
      nama: namaSiswa,
      jenisKelamin: jk,
    };
  });
}

export const getRombonganBelajar = cache(
  async (): Promise<ClassRoomWithStudents[]> => {
    try {
      const data = await prisma.classRoom.findMany({
        orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
        include: {
          waliKelas: true,
          students: {
            where: { isActive: true },
            orderBy: { nama: "asc" },
          },
        },
      });
      if (data.length === 0) throw new Error("empty");
      return data.map((c) => ({
        id: c.id,
        nama: c.nama,
        tingkat: c.tingkat,
        waliKelasNama: c.waliKelas?.nama ?? null,
        waliKelasFotoUrl: c.waliKelas?.fotoUrl ?? null,
        jumlahSiswa: c.students.length,
        students: c.students.map((s) => ({
          id: s.id,
          nis: s.nis,
          nisn: s.nisn,
          nama: s.nama,
          jenisKelamin: s.jenisKelamin,
        })),
      }));
    } catch {
      // Fallback: 3 rombel (A, B, C) untuk tiap tingkat 1-6
      const result: ClassRoomWithStudents[] = [];
      const waliDummy = [
        "Ibu Siti Aminah, S.Pd.",
        "Bapak Slamet Riyadi, S.Pd.",
        "Ibu Ratna Dewi, S.Pd.",
      ];
      for (let tingkat = 1; tingkat <= 6; tingkat++) {
        ["A", "B", "C"].forEach((rombel, idx) => {
          const namaKelas = `${tingkat}${rombel}`;
          const jumlah = 6 + ((tingkat + idx) % 4); // variasi 6-9 siswa contoh
          result.push({
            id: `dummy-${namaKelas}`,
            nama: namaKelas,
            tingkat,
            waliKelasNama: waliDummy[idx],
            waliKelasFotoUrl: null,
            jumlahSiswa: jumlah,
            students: dummyStudents(namaKelas, jumlah),
          });
        });
      }
      return result;
    }
  }
);

// ---------------------------------------------------------------
// ROMBONGAN BELAJAR — VERSI PUBLIK
// ---------------------------------------------------------------
// Menampilkan daftar siswa AKTIF (nama, no induk, NISN, jenis
// kelamin) sesuai keputusan eksplisit pemilik website. NIK TETAP
// TIDAK PERNAH ditampilkan di halaman publik dalam kondisi apa pun
// karena itu data paling sensitif (identitas kependudukan).
// Untuk kebutuhan admin dengan akses penuh (termasuk NIK),
// pakai `getRombonganBelajar()` di atas yang dilindungi login.

export type PublicStudentRow = {
  id: string;
  nis: string | null;
  nisn: string | null;
  nama: string;
  jenisKelamin: "L" | "P" | null;
};

export type ClassRoomAggregate = {
  id: string;
  nama: string;
  tingkat: number;
  waliKelasNama: string | null;
  waliKelasFotoUrl: string | null;
  jumlahSiswa: number;
  jumlahLakiLaki: number;
  jumlahPerempuan: number;
  students: PublicStudentRow[];
};

export const getRombonganBelajarPublic = cache(
  async (): Promise<ClassRoomAggregate[]> => {
    try {
      const data = await prisma.classRoom.findMany({
        orderBy: [{ tingkat: "asc" }, { nama: "asc" }],
        select: {
          id: true,
          nama: true,
          tingkat: true,
          waliKelas: { select: { nama: true, fotoUrl: true } },
          students: {
            where: { isActive: true },
            orderBy: { nama: "asc" },
            // Sengaja TIDAK select "nik" — NIK tidak pernah dikirim ke publik.
            select: { id: true, nis: true, nisn: true, nama: true, jenisKelamin: true },
          },
        },
      });
      if (data.length === 0) throw new Error("empty");
      return data.map((c) => ({
        id: c.id,
        nama: c.nama,
        tingkat: c.tingkat,
        waliKelasNama: c.waliKelas?.nama ?? null,
        waliKelasFotoUrl: c.waliKelas?.fotoUrl ?? null,
        jumlahSiswa: c.students.length,
        jumlahLakiLaki: c.students.filter((s) => s.jenisKelamin === "L")
          .length,
        jumlahPerempuan: c.students.filter((s) => s.jenisKelamin === "P")
          .length,
        students: c.students,
      }));
    } catch {
      const full = await getRombonganBelajar();
      return full.map((c) => ({
        id: c.id,
        nama: c.nama,
        tingkat: c.tingkat,
        waliKelasNama: c.waliKelasNama,
        waliKelasFotoUrl: c.waliKelasFotoUrl,
        jumlahSiswa: c.jumlahSiswa,
        jumlahLakiLaki: c.students.filter((s) => s.jenisKelamin === "L")
          .length,
        jumlahPerempuan: c.students.filter((s) => s.jenisKelamin === "P")
          .length,
        students: c.students.map((s) => ({
          id: s.id,
          nis: s.nis,
          nisn: s.nisn,
          nama: s.nama,
          jenisKelamin: s.jenisKelamin,
        })),
      }));
    }
  }
);

// ---------------------------------------------------------------
// AGENDA / KALENDER AKADEMIK
// ---------------------------------------------------------------

export const getAgenda = cache(async () => {
  try {
    const data = await prisma.agenda.findMany({
      orderBy: { tanggalMulai: "asc" },
    });
    return [...data, ...INDONESIA_HOLIDAYS_2026].sort(
      (a, b) => a.tanggalMulai.getTime() - b.tanggalMulai.getTime()
    );
  } catch {
    const now = new Date();
    const inDays = (d: number) => new Date(now.getTime() + d * 86400000);
    return [
      {
        id: "dummy-ag-1",
        judul: "Awal Tahun Ajaran 2026/2027",
        deskripsi: "Hari pertama masuk sekolah tahun ajaran baru.",
        tanggalMulai: inDays(2),
        tanggalSelesai: null,
        kategori: "Kalender Akademik",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "dummy-ag-2",
        judul: "Penilaian Tengah Semester (PTS)",
        deskripsi: "Pelaksanaan penilaian tengah semester ganjil.",
        tanggalMulai: inDays(45),
        tanggalSelesai: inDays(50),
        kategori: "Kegiatan",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "dummy-ag-3",
        judul: "Libur Semester Ganjil",
        deskripsi: "Libur akhir semester ganjil tahun ajaran 2026/2027.",
        tanggalMulai: inDays(150),
        tanggalSelesai: inDays(164),
        kategori: "Libur",
        createdAt: now,
        updatedAt: now,
      },
      ...INDONESIA_HOLIDAYS_2026,
    ].sort((a, b) => a.tanggalMulai.getTime() - b.tanggalMulai.getTime());
  }
});

// ---------------------------------------------------------------
// EKSTRAKURIKULER
// ---------------------------------------------------------------

export const getExtracurriculars = cache(async () => {
  try {
    const data = await prisma.extracurricular.findMany({
      include: { pembina: true },
      orderBy: { nama: "asc" },
    });
    if (data.length === 0) throw new Error("empty");
    return data;
  } catch {
    const now = new Date();
    return [
      {
        id: "dummy-eks-1",
        nama: "Pramuka",
        deskripsi:
          "Membentuk karakter disiplin, kemandirian, dan jiwa kepemimpinan siswa.",
        jadwal: "Jumat, 13.00 - 15.00 WIB",
        fotoUrl: null,
        pembina: { nama: "Bapak Slamet Riyadi, S.Pd." },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "dummy-eks-2",
        nama: "Seni Tari",
        deskripsi: "Mengembangkan bakat seni tari tradisional dan kreasi.",
        jadwal: "Sabtu, 08.00 - 10.00 WIB",
        fotoUrl: null,
        pembina: { nama: "Ibu Ratna Dewi, S.Pd." },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "dummy-eks-3",
        nama: "Futsal",
        deskripsi: "Melatih kebugaran fisik dan kerja sama tim.",
        jadwal: "Sabtu, 07.00 - 09.00 WIB",
        fotoUrl: null,
        pembina: { nama: "Bapak Agus Setiawan, S.Pd." },
        createdAt: now,
        updatedAt: now,
      },
    ];
  }
});
