import { AdminLayananTabs } from "@/components/admin/AdminLayananTabs";

export default function AdminLayananLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Layanan Manager
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola Standar Pelayanan dan Pertanyaan Ayah & Ibu (FAQ) yang tampil di menu Layanan.
        </p>
      </div>
      <AdminLayananTabs />
      {children}
    </div>
  );
}
