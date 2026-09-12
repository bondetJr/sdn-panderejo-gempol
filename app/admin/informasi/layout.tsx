import { AdminInformasiTabs } from "@/components/admin/AdminInformasiTabs";

export default function AdminInformasiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Informasi Manager
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola berita, pengumuman, dan kegiatan siswa sekolah.
        </p>
      </div>
      <AdminInformasiTabs />
      {children}
    </div>
  );
}
