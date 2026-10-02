import { redirect } from "next/navigation";

export const metadata = {
  title: "Pertanyaan Ayah & Ibu",
};

export default function FaqRedirectPage() {
  redirect("/layanan/faq");
}
