import { cache } from "react";
import { prisma } from "@/lib/prisma";

<<<<<<< HEAD
export type ServiceStandardListItem = {
  id: string;
  judul: string;
=======
export type ServiceStandardItem = {
  id: string;
  nama: string;
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
  coverImage: string | null;
  deskripsi: string;
  persyaratan: string;
  mekanismeImage: string | null;
<<<<<<< HEAD
  mekanismeText: string;
  waktuPelayanan: string | null;
  biaya: string | null;
  produkLayanan: string;
  pengaduan: string;
  documentFile: string | null;
  isPublished: boolean;
  urutan: number;
  createdAt: Date;
  updatedAt: Date;
};

export const getAllServiceStandards = cache(async (): Promise<ServiceStandardListItem[]> => {
  try {
    const data = await prisma.serviceStandard.findMany({
      where: { isPublished: true },
      orderBy: { urutan: "asc" },
    });
    if (data.length > 0) return data;
    throw new Error("empty");
  } catch {
    return [
      {
        id: "dummy-layanan-1",
        judul: "Pendaftaran Peserta Didik Baru",
        coverImage:
          "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
        deskripsi:
          "Proses penerimaan peserta didik baru dilakukan secara transparan, mudah dipahami, dan berorientasi pada pelayanan yang cepat dan humanis.",
        persyaratan:
          "- Akta kelahiran\n- Kartu Keluarga\n- Foto berwarna terbaru\n- Surat keterangan domisili",
        mekanismeImage:
          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
        mekanismeText:
          "1. Calon peserta didik mendaftar secara online.\n2. Melengkapi dokumen persyaratan.\n3. Menunggu verifikasi admin.\n4. Pendaftaran dinyatakan berhasil dan jadwal orientasi akan diinformasikan.",
        waktuPelayanan: "Senin - Jumat, 07.30 - 13.00 WIB",
        biaya: "Gratis",
        produkLayanan:
          "Layanan pendaftaran siswa baru yang mencakup proses pengajuan, verifikasi dokumen, dan konfirmasi hasil seleksi.",
        pengaduan:
          "Pengaduan dapat disampaikan melalui WhatsApp sekolah, email, atau front office sekolah selama jam layanan operasional.",
        documentFile:
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        isPublished: true,
        urutan: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dummy-layanan-2",
        judul: "Pelayanan Administrasi Siswa",
        coverImage:
          "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
        deskripsi:
          "Layanan administrasi siswa mencakup pengurusan dokumen akademik, mutasi, dan kebutuhan pendukung kegiatan belajar siswa.",
        persyaratan:
          "- Surat pengajuan\n- Dokumen pendukung\n- Identitas siswa\n- Data orang tua/wali",
        mekanismeImage:
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
        mekanismeText:
          "1. Pengajuan layanan disampaikan ke admin.\n2. Dokumen diperiksa kelengkapannya.\n3. Proses layanan dibantu hingga selesai.\n4. Bukti penyelesaian diberikan kepada pemohon.",
        waktuPelayanan: "Senin - Jumat, 08.00 - 12.00 WIB",
        biaya: "Bebas biaya administrasi",
        produkLayanan:
          "Pengurusan data siswa, surat keterangan, lembar validasi dokumen, dan pendampingan administrasi akademik.",
        pengaduan:
          "Bila ada kendala, dapat dihubungi petugas administrasi di ruang tata usaha sekolah.",
        documentFile:
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        isPublished: true,
        urutan: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
});

export const getAllServiceStandardsAdmin = cache(async (): Promise<ServiceStandardListItem[]> => {
  try {
    return await prisma.serviceStandard.findMany({
      orderBy: { urutan: "asc" },
    });
  } catch {
    return [];
  }
});
=======
  mekanismeText: string | null;
  waktuPelayanan: string | null;
  biaya: string | null;
  produkLayanan: string | null;
  pengaduan: string | null;
  documentFile: string | null;
  documentName: string | null;
};

export const getServiceStandards = cache(
  async (): Promise<ServiceStandardItem[]> => {
    try {
      return await prisma.serviceStandard.findMany({
        where: { isPublished: true },
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
        select: {
          id: true,
          nama: true,
          coverImage: true,
          deskripsi: true,
          persyaratan: true,
          mekanismeImage: true,
          mekanismeText: true,
          waktuPelayanan: true,
          biaya: true,
          produkLayanan: true,
          pengaduan: true,
          documentFile: true,
          documentName: true,
        },
      });
    } catch {
      return [];
    }
  }
);
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
