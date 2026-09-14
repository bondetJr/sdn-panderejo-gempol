import { getKenaliSekolahData } from "@/lib/kenali-sekolah-data";
import { KenaliSekolahExplorer } from "@/components/profil/KenaliSekolahExplorer";

export const metadata = {
  title: "Kenali Sekolah Kami",
  description: "Ringkasan profil, akademik, SDM, fasilitas, prestasi, dan informasi SDN Panderejo Gempol.",
};

export default async function KenaliSekolahPage() {
  const data = await getKenaliSekolahData();
  return <KenaliSekolahExplorer data={data} />;
}
