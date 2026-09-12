import { getAllMessagesAdmin } from "@/lib/admin-kontak-data";
import { MessageManager } from "@/components/admin/MessageManager";

export const metadata = { title: "Pesan Masuk" };

export default async function AdminPesanPage() {
  const messages = await getAllMessagesAdmin();
  return <MessageManager messages={messages} />;
}
