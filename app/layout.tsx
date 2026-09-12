import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { getSchoolProfile } from "@/lib/school";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const school = await getSchoolProfile();
  const icon = school.logoUrl ?? "/icon.svg";

  return {
    title: {
      default: "SD Negeri Panderejo Gempol — Belajar Seru, Karakter Kuat, Berakhlak Mulia",
      template: "%s | SDN Panderejo Gempol",
    },
    description:
      "Website resmi SD Negeri Panderejo Gempol, Kecamatan Gempol, Kabupaten Pasuruan. Informasi PPDB, profil sekolah, akademik, guru, berita, dan layanan untuk wali murid.",
    keywords: [
      "SDN Panderejo Gempol",
      "PPDB SD Gempol Pasuruan",
      "sekolah dasar negeri Pasuruan",
      "NPSN 20519616",
    ],
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
    verification: {
      google: "w4J7ig1dKzyhvwEgApj2P96RhHqGB7a-MryobfVl2RM",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased bg-base-cloud text-neutral-espresso">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
