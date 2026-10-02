import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/kontak/ContactForm";
import { getSchoolProfile } from "@/lib/school";

export const metadata = {
  title: "Lokasi & Kontak",
  description: "Alamat, peta lokasi, dan form hubungi kami SD Negeri Panderejo Gempol",
};

export default async function LokasiPage() {
  const school = await getSchoolProfile();

  const mapsQuery = encodeURIComponent(
    `SD Negeri Panderejo Gempol, ${school.kecamatan}, ${school.kabupaten}, ${school.provinsi}`
  );
  const embedSrc =
    school.mapsEmbedUrl ??
    `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

  return (
    <>
      <PageHeader
        title="Lokasi & Kontak"
        description="Kunjungi sekolah kami atau kirim pesan langsung melalui form di bawah. Kami siap membantu."
        breadcrumbs={[
          { label: "Kontak", href: "/kontak/lokasi" },
          { label: "Lokasi & Kontak" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Kiri: Info Sekolah + Map */}
          <div className="space-y-6 lg:col-span-1">
            {/* Kartu Info */}
            <div className="rounded-card bg-white p-6 shadow-soft">
              <h2 className="flex items-center gap-2 text-base font-bold text-neutral-espresso">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                  <MapPin className="h-4 w-4" />
                </span>
                {school.nama}
              </h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-neutral-espresso/90">
                    {school.alamat}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <Phone className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-neutral-espresso/90">{school.telepon}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <Mail className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-neutral-espresso/90">{school.email}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <Clock className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-neutral-espresso/90">{school.jamLayanan}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-primary-teal/5 p-4">
                <p className="text-xs font-bold text-primary-teal-deep">Jam Kunjungan</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-slate">
                  Senin - Jumat 07.30 - 13.00 WIB<br />
                  Sabtu & Minggu Tutup<br />
                  Disarankan datang pagi untuk layanan PPDB & administrasi.
                </p>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-card shadow-soft">
              <div className="bg-white px-5 py-3">
                <p className="text-sm font-bold text-neutral-espresso">Peta Lokasi</p>
                <p className="text-xs text-neutral-slate">Klik peta untuk buka di Google Maps</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <iframe
                  src={embedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 380 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi SD Negeri Panderejo Gempol"
                  className="pointer-events-none"
                />
              </a>
            </div>
          </div>

          {/* Kanan: Form Hubungi Kami */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-neutral-espresso">Kirim Pesan</h2>
                <p className="text-xs text-neutral-slate">Respon maksimal 1x24 jam di hari kerja</p>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
