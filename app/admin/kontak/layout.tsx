import { AdminKontakTabs } from "@/components/admin/AdminKontakTabs";

export default function AdminKontakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-neutral-espresso">
          Kontak Manager
        </h1>
        <p className="text-sm text-neutral-slate">
          Kelola pesan masuk dari wali murid dan moderasi testimoni.
        </p>
      </div>
      <AdminKontakTabs />
      {children}
    </div>
  );
}
