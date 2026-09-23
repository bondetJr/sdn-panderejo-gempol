import { getAllFaqsAdmin } from "@/lib/admin-kontak-data";
import { FaqManager } from "@/components/admin/FaqManager";

export const metadata = { title: "Kelola FAQ" };

export default async function AdminFaqPage() {
  const faqs = await getAllFaqsAdmin();
  return <FaqManager faqs={faqs} />;
}
