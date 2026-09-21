import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type ServiceStandardListItem = {
  id: string;
  judul: string;
  coverImage: string | null;
  deskripsi: string;
  persyaratan: string;
  mekanismeImage: string | null;
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

export type ServiceStandardItem = {
  id: string;
  nama: string;
  coverImage: string | null;
  deskripsi: string;
  persyaratan: string;
  mekanismeImage: string | null;
  mekanismeText: string | null;
  waktuPelayanan: string | null;
  biaya: string | null;
  produkLayanan: string | null;
  pengaduan: string | null;
  documentFile: string | null;
  documentName: string | null;
  urutan?: number;
  isPublished?: boolean;
};

const dummyLayanan: ServiceStandardListItem[] = [
  {
    id: "dummy-layanan-1",
    judul: "Pendaftaran Peserta Didik Baru",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
    deskripsi: "Proses penerimaan peserta didik baru dilakukan secara transparan, mudah dipahami, dan berorientasi pada pelayanan yang cepat dan humanis.",
    persyaratan: "- Akta kelahiran\n- Kartu Keluarga\n- Foto berwarna terbaru\n- Surat keterangan domisili",
    mekanismeImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    mekanismeText: "1. Calon peserta didik mendaftar secara online.\n2. Melengkapi dokumen persyaratan.\n3. Menunggu verifikasi admin.\n4. Pendaftaran dinyatakan berhasil.",
    waktuPelayanan: "Senin - Jumat, 07.30 - 13.00 WIB",
    biaya: "Gratis",
    produkLayanan: "Layanan pendaftaran siswa baru yang mencakup proses pengajuan, verifikasi dokumen, dan konfirmasi hasil seleksi.",
    pengaduan: "Pengaduan dapat disampaikan melalui WhatsApp sekolah, email, atau front office sekolah selama jam layanan operasional.",
    documentFile: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    urutan: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "dummy-layanan-2",
    judul: "Pelayanan Administrasi Siswa",
    coverImage: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
    deskripsi: "Layanan administrasi siswa mencakup pengurusan dokumen akademik, mutasi, dan kebutuhan pendukung kegiatan belajar siswa.",
    persyaratan: "- Surat pengajuan\n- Dokumen pendukung\n- Identitas siswa\n- Data orang tua/wali",
    mekanismeImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    mekanismeText: "1. Pengajuan layanan disampaikan ke admin.\n2. Dokumen diperiksa kelengkapannya.\n3. Proses layanan dibantu hingga selesai.",
    waktuPelayanan: "Senin - Jumat, 08.00 - 12.00 WIB",
    biaya: "Bebas biaya administrasi",
    produkLayanan: "Pengurusan data siswa, surat keterangan, lembar validasi dokumen, dan pendampingan administrasi akademik.",
    pengaduan: "Bila ada kendala, dapat dihubungi petugas administrasi di ruang tata usaha sekolah.",
    documentFile: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPublished: true,
    urutan: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// === Versi BARU (pakai nama) - dipakai di /layanan/page.tsx ===
export const getServiceStandards = cache(async (): Promise<ServiceStandardItem[]> => {
  try {
    const data = await prisma.serviceStandard.findMany({
      where: { isPublished: true },
      orderBy: [{ urutan: "asc" }, { nama: "asc" }],
    });
    if (data.length === 0) return [];
    return data as unknown as ServiceStandardItem[];
  } catch (e) {
    console.warn("[layanan-data] getServiceStandards failed, fallback empty", e);
    return [];
  }
});

// === Versi LAMA (pakai judul + dummy) - biar gak break code lama ===
export const getAllServiceStandards = cache(async (): Promise<ServiceStandardListItem[]> => {
  try {
    const data = await prisma.serviceStandard.findMany({
      where: { isPublished: true },
      orderBy: { urutan: "asc" },
    });
    if (data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        judul: d.nama || d.judul || "Layanan",
        coverImage: d.coverImage,
        deskripsi: d.deskripsi,
        persyaratan: d.persyaratan,
        mekanismeImage: d.mekanismeImage,
        mekanismeText: d.mekanismeText || "",
        waktuPelayanan: d.waktuPelayanan,
        biaya: d.biaya,
        produkLayanan: d.produkLayanan || "",
        pengaduan: d.pengaduan || "",
        documentFile: d.documentFile,
        isPublished: d.isPublished,
        urutan: d.urutan,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
    }
    throw new Error("empty");
  } catch {
    return dummyLayanan;
  }
});

// === Admin ===
export const getAllServiceStandardsAdmin = cache(async () => {
  try {
    return await prisma.serviceStandard.findMany({
      orderBy: { urutan: "asc" },
    });
  } catch {
    return [];
  }
});

// alias biar semua nama kepanggil
export const getPublishedLayanan = getServiceStandards;
export const getAllLayananAdmin = getAllServiceStandardsAdmin;

export const getLayananById = cache(async (id: string) => {
  try {
    return await prisma.serviceStandard.findUnique({ where: { id } });
  } catch {
    return null;
  }
});

export const getServiceStandardById = getLayananById;