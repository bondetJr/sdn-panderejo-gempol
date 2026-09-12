import { AdminAkademikTabs } from "@/components/admin/AdminAkademikTabs";

export default function AdminAkademikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Akademik Manager
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola rombongan belajar, kalender akademik, dan ekstrakurikuler.
        </p>
      </div>
      <AdminAkademikTabs />
      {children}
    </div>
  );
}
