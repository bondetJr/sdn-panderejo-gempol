import { getAllAlbumsAdmin } from "@/lib/admin-informasi-data";
import { AlbumManager } from "@/components/admin/AlbumManager";

export const metadata = { title: "Kegiatan Siswa Manager" };

export default async function AdminGaleriPage() {
  const albums = await getAllAlbumsAdmin();
  return <AlbumManager albums={albums} />;
}
