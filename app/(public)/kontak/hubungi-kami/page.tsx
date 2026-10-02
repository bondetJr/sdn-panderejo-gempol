import { redirect } from "next/navigation";

export const metadata = {
  title: "Hubungi Kami",
};

export default function HubungiKamiPage() {
  redirect("/kontak/lokasi");
}
