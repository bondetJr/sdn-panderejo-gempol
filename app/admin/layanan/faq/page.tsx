import { getAllFaqsAdmin } from "@/lib/admin-kontak-data";
import { FaqManager } from "@/components/admin/FaqManager";

export const metadata = { title: "Pertanyaan Ayah & Ibu" };

export default async function AdminLayananFaqPage() {
  const faqs = await getAllFaqsAdmin();
  return <FaqManager faqs={faqs} />;
}
