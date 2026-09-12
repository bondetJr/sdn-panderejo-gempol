import { getKurikulumAdmin } from "@/lib/admin-akademik-data";
import { KurikulumForm } from "@/components/admin/KurikulumForm";

export const metadata = { title: "Kurikulum Manager" };

const DEFAULT_KURIKULUM = `SDN Panderejo Gempol menerapkan Kurikulum Merdeka sesuai dengan kebijakan Kementerian Pendidikan Dasar dan Menengah (Kemendikdasmen). Kurikulum ini dirancang untuk memberikan keleluasaan bagi guru dalam menciptakan pembelajaran yang berkualitas dan sesuai dengan kebutuhan serta minat peserta didik.

Prinsip utama: pembelajaran berpusat pada peserta didik, berbasis proyek untuk penguatan karakter (P5), materi esensial dan pembelajaran mendalam, fleksibel dalam metode, serta penilaian yang holistik.`;

export default async function AdminKurikulumPage() {
  const school = await getKurikulumAdmin();

  if (!school) {
    return (
      <div className="rounded-card bg-white p-10 text-center text-sm text-neutral-slate shadow-soft">
        Gagal memuat data sekolah.
      </div>
    );
  }

  return (
    <KurikulumForm
      schoolId={school.id}
      initialText={school.kurikulumText ?? DEFAULT_KURIKULUM}
    />
  );
}
