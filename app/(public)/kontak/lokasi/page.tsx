import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSchoolProfile } from "@/lib/school";

export const metadata = {
  title: "Lokasi Sekolah",
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
        title="Lokasi Sekolah"
        breadcrumbs={[
          { label: "Kontak", href: "/kontak/lokasi" },
          { label: "Lokasi" },
        ]}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Info */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-card bg-white p-6 shadow-soft">
              <h2 className="text-base font-bold text-neutral-espresso">
                {school.nama}
              </h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-neutral-espresso/90">
                    {school.alamat}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <Phone className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-neutral-espresso/90">
                    {school.telepon}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <Mail className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-neutral-espresso/90">
                    {school.email}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                    <Clock className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-neutral-espresso/90">
                    {school.jamLayanan}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-card shadow-soft lg:col-span-2">
            <iframe
              src={embedSrc}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 420 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi SD Negeri Panderejo Gempol"
            />
          </div>
        </div>
      </section>
    </>
  );
}
