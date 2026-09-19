import { getAllServiceStandardsAdmin } from "@/lib/admin-layanan-data";
import { ServiceStandardManager } from "@/components/admin/ServiceStandardManager";

export const metadata = { title: "Layanan Manager" };

export default async function AdminLayananPage() {
  const items = await getAllServiceStandardsAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Layanan Manager
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola Standar Pelayanan yang tampil di halaman publik /layanan,
          termasuk cover, gambar mekanisme, dan dokumen yang bisa diunduh.
        </p>
      </div>
      <ServiceStandardManager items={items} />
    </div>
  );
}
