import { getAllNewsAdmin } from "@/lib/admin-informasi-data";
import { NewsManager } from "@/components/admin/NewsManager";

export const metadata = { title: "Berita Manager" };

export default async function AdminBeritaPage() {
  const news = await getAllNewsAdmin();
  return <NewsManager news={news} />;
}
