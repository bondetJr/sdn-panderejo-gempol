import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { getSchoolProfile } from "@/lib/school";

async function getSejarah() {
  try {
    const school = await prisma.school.findFirst();
    return (
      school?.sejarah ??
      `${"[NAMA SEKOLAH]"} berdiri sebagai salah satu lembaga pendidikan dasar negeri yang melayani masyarakat Desa Panderejo dan sekitarnya di Kecamatan Gempol, Kabupaten Pasuruan.\n\nSejak awal berdiri, sekolah ini berkomitmen menghadirkan pendidikan dasar yang berkualitas, terjangkau, dan berlandaskan nilai-nilai keagamaan serta budaya lokal. Dari tahun ke tahun, sekolah terus berbenah — baik dari sisi sarana prasarana, kualitas tenaga pendidik, maupun capaian prestasi peserta didik.\n\nHingga saat ini, sekolah terus bertransformasi mengikuti perkembangan zaman, termasuk dalam penerapan Kurikulum Merdeka dan digitalisasi layanan administrasi sekolah, tanpa meninggalkan nilai-nilai karakter dan kearifan lokal yang menjadi ciri khasnya.\n\n[Catatan: Narasi sejarah lengkap — termasuk tahun berdiri, nama kepala sekolah pertama, dan tonggak penting lainnya — mohon dilengkapi oleh pihak sekolah melalui Dashboard Admin.]`
    );
  } catch {
    return "[Narasi sejarah sekolah akan ditampilkan di sini setelah diisi melalui Dashboard Admin.]";
  }
}

export default async function SejarahPage() {
  const school = await getSchoolProfile();
  const sejarah = await getSejarah();
  const paragraphs = sejarah.split("\n").filter(Boolean);

  return (
    <>
      <PageHeader
        title="Sejarah Sekolah"
        breadcrumbs={[
          { label: "Profil Sekolah", href: "/profil" },
          { label: "Sejarah" },
        ]}
      />

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-card bg-white p-6 shadow-soft sm:p-10">
          <h2 className="text-lg font-extrabold text-neutral-espresso">
            Perjalanan {school.nama}
          </h2>
          <div className="text-justify mt-4 max-w-none space-y-4 text-neutral-espresso/90">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
