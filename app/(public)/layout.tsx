import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { getSchoolProfile } from "@/lib/school";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const school = await getSchoolProfile();

  return (
    <>
      {/* Skip link — aksesibilitas keyboard */}
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-button focus:bg-primary-teal focus:px-4 focus:py-2 focus:text-white"
      >
        Lewati ke konten utama
      </a>

      <Header school={school} />
      <main id="konten-utama">{children}</main>
      <Footer school={school} />

      <ChatWidget school={school} />
    </>
  );
}
