"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Loader2,
  MapPin,
  UploadCloud,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ppdbSubmitSchema, type PpdbSubmitInput } from "@/lib/validations/ppdb";

type WaveOption = {
  id: string;
  jalur: "ZONASI" | "AFIRMASI" | "PERPINDAHAN";
  jalurLabel: string;
  tahunAjaran: string;
};

type FormValues = PpdbSubmitInput;

const STEPS = [
  { label: "Jalur", icon: MapPin },
  { label: "Data Siswa", icon: User },
  { label: "Data Ortu", icon: Users },
  { label: "Dokumen", icon: UploadCloud },
  { label: "Review", icon: FileText },
];

const STEP_FIELDS: (keyof FormValues)[][] = [
  ["waveId", "jalur", "jarakKeSekolahKm"],
  ["namaLengkap", "nik", "nisn", "tempatLahir", "tanggalLahir", "jenisKelamin"],
  ["namaAyah", "namaIbu", "noHpOrtu", "alamat"],
  [], // dokumen divalidasi terpisah (bukan bagian react-hook-form state)
  [],
];

const DOCUMENT_FIELDS: {
  key: string;
  label: string;
  required: boolean;
}[] = [
  { key: "kartuKeluarga", label: "Kartu Keluarga (KK)", required: true },
  { key: "aktaKelahiran", label: "Akta Kelahiran", required: true },
  { key: "ktpOrtu", label: "KTP Orang Tua/Wali", required: true },
  { key: "fotoAnak", label: "Foto Anak (terbaru)", required: true },
  { key: "kip", label: "Kartu Indonesia Pintar (KIP) — jika ada", required: false },
  { key: "ijazahTk", label: "Ijazah/Keterangan TK — jika ada", required: false },
];

export function PpdbFormMultiStep({ waves }: { waves: WaveOption[] }) {
  const [step, setStep] = useState(0);
  const [documents, setDocuments] = useState<Record<string, File | null>>({});
  const [documentErrors, setDocumentErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ noPendaftaran: string } | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(ppdbSubmitSchema),
    mode: "onBlur",
    defaultValues: { jalur: waves[0]?.jalur ?? "ZONASI", waveId: waves[0]?.id ?? "" },
  });

  const selectedJalur = watch("jalur");
  const values = watch();

  const selectedWave = useMemo(
    () => waves.find((w) => w.id === values.waveId),
    [waves, values.waveId]
  );

  async function goNext() {
    if (step === 3) {
      // Validasi dokumen wajib sebelum lanjut ke Review
      const newErrors: Record<string, string> = {};
      for (const doc of DOCUMENT_FIELDS) {
        if (doc.required && !documents[doc.key]) {
          newErrors[doc.key] = "Wajib diunggah";
        }
      }
      setDocumentErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
      setStep((s) => s + 1);
      return;
    }

    const fields = STEP_FIELDS[step];
    const valid = fields.length === 0 || (await trigger(fields));
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleFileChange(key: string, file: File | null) {
    setDocuments((prev) => ({ ...prev, [key]: file }));
    setDocumentErrors((prev) => ({ ...prev, [key]: "" }));
  }

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      Object.entries(documents).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const res = await fetch("/api/ppdb/daftar", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error ?? "Terjadi kesalahan. Silakan coba lagi.");
        setSubmitting(false);
        return;
      }

      setSuccessData({ noPendaftaran: json.data.noPendaftaran });
    } catch {
      setSubmitError(
        "Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  });

  // ---------------------------------------------------------------
  // TAMPILAN SUKSES
  // ---------------------------------------------------------------
  if (successData) {
    return (
      <div className="rounded-card bg-white p-8 text-center shadow-soft sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <h2 className="mt-5 text-xl font-extrabold text-neutral-espresso">
          Pendaftaran Berhasil Dikirim!
        </h2>
        <p className="mt-2 text-sm text-neutral-slate">
          Simpan nomor pendaftaran di bawah ini untuk mengecek status
          verifikasi Anda.
        </p>

        <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-2xl bg-primary-teal-deep/5 p-4">
          <span className="text-lg font-mono font-bold tracking-wide text-primary-teal-deep">
            {successData.noPendaftaran}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(successData.noPendaftaran)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-teal-deep shadow-soft hover:bg-primary-teal/10"
            aria-label="Salin nomor pendaftaran"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <a
          href="/ppdb/cek-status"
          className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-button bg-primary-teal px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          Cek Status Pendaftaran
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between overflow-x-auto">
        {STEPS.map((s, idx) => (
          <div key={s.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  idx < step
                    ? "bg-primary-teal text-white"
                    : idx === step
                    ? "bg-primary-teal-deep text-white"
                    : "bg-neutral-espresso/10 text-neutral-slate"
                )}
              >
                {idx < step ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
              </span>
              <span
                className={cn(
                  "hidden text-[11px] font-semibold sm:block",
                  idx <= step ? "text-primary-teal-deep" : "text-neutral-slate"
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  idx < step ? "bg-primary-teal" : "bg-neutral-espresso/10"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="rounded-card bg-white p-6 shadow-soft sm:p-8">
        {/* STEP 0: Pilih Jalur */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-neutral-espresso">
              Pilih Jalur Pendaftaran
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {waves.map((w) => (
                <label
                  key={w.id}
                  className={cn(
                    "cursor-pointer rounded-2xl border-2 p-4 transition-colors",
                    values.waveId === w.id
                      ? "border-primary-teal bg-primary-teal/5"
                      : "border-neutral-espresso/10 hover:border-primary-teal/40"
                  )}
                >
                  <input
                    type="radio"
                    value={w.id}
                    className="sr-only"
                    {...register("waveId", {
                      onChange: () => setValue("jalur", w.jalur),
                    })}
                  />
                  <p className="text-sm font-bold text-neutral-espresso">
                    {w.jalurLabel}
                  </p>
                  <p className="text-xs text-neutral-slate">
                    TA {w.tahunAjaran}
                  </p>
                </label>
              ))}
            </div>
            {errors.waveId && (
              <p className="text-xs text-red-600">{errors.waveId.message}</p>
            )}

            {selectedJalur === "ZONASI" && (
              <div>
                <label className="text-sm font-semibold text-neutral-espresso">
                  Jarak Rumah ke Sekolah (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Contoh: 1.2"
                  className="mt-1.5 w-full rounded-button border border-neutral-espresso/15 px-4 py-2.5 text-sm focus:border-primary-teal focus:outline-none focus:ring-2 focus:ring-primary-teal/20"
                  {...register("jarakKeSekolahKm")}
                />
                {errors.jarakKeSekolahKm && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.jarakKeSekolahKm.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-slate">
                  Jarak dihitung dari domisili sesuai KK ke lokasi sekolah.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Data Diri Calon Siswa */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-espresso">
              Data Diri Calon Siswa
            </h2>
            <Field label="Nama Lengkap" error={errors.namaLengkap?.message}>
              <input
                className="input-field"
                placeholder="Sesuai Akta Kelahiran"
                {...register("namaLengkap")}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="NIK Anak (16 digit)" error={errors.nik?.message}>
                <input
                  className="input-field"
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="16 digit angka"
                  {...register("nik")}
                />
              </Field>
              <Field label="NISN (jika sudah ada)" error={errors.nisn?.message}>
                <input
                  className="input-field"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Opsional"
                  {...register("nisn")}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tempat Lahir" error={errors.tempatLahir?.message}>
                <input className="input-field" {...register("tempatLahir")} />
              </Field>
              <Field label="Tanggal Lahir" error={errors.tanggalLahir?.message}>
                <input
                  type="date"
                  className="input-field"
                  {...register("tanggalLahir")}
                />
              </Field>
            </div>
            <Field label="Jenis Kelamin" error={errors.jenisKelamin?.message}>
              <div className="flex gap-3">
                {[
                  { value: "L", label: "Laki-laki" },
                  { value: "P", label: "Perempuan" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex-1 cursor-pointer rounded-button border-2 px-4 py-2.5 text-center text-sm font-semibold transition-colors",
                      values.jenisKelamin === opt.value
                        ? "border-primary-teal bg-primary-teal/5 text-primary-teal-deep"
                        : "border-neutral-espresso/10 text-neutral-slate"
                    )}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="sr-only"
                      {...register("jenisKelamin")}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* STEP 2: Data Orang Tua & Alamat */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-espresso">
              Data Orang Tua & Alamat
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama Ayah" error={errors.namaAyah?.message}>
                <input className="input-field" {...register("namaAyah")} />
              </Field>
              <Field label="Nama Ibu" error={errors.namaIbu?.message}>
                <input className="input-field" {...register("namaIbu")} />
              </Field>
            </div>
            <Field label="No. HP Orang Tua/Wali (aktif)" error={errors.noHpOrtu?.message}>
              <input
                className="input-field"
                placeholder="08xxxxxxxxxx"
                {...register("noHpOrtu")}
              />
            </Field>
            <Field label="Alamat Lengkap (sesuai KK)" error={errors.alamat?.message}>
              <textarea
                rows={3}
                className="input-field resize-none"
                placeholder="Jalan, RT/RW, Desa/Kelurahan, Kecamatan"
                {...register("alamat")}
              />
            </Field>
          </div>
        )}

        {/* STEP 3: Upload Dokumen */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-espresso">
              Unggah Dokumen Persyaratan
            </h2>
            <p className="text-xs text-neutral-slate">
              Format PDF, JPG, atau PNG — maksimal 2MB per file.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {DOCUMENT_FIELDS.map((doc) => (
                <div key={doc.key}>
                  <label className="text-sm font-semibold text-neutral-espresso">
                    {doc.label}
                    {doc.required && <span className="text-red-500"> *</span>}
                  </label>
                  <label
                    className={cn(
                      "mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed p-4 text-center transition-colors",
                      documents[doc.key]
                        ? "border-primary-teal bg-primary-teal/5"
                        : documentErrors[doc.key]
                        ? "border-red-300 bg-red-50"
                        : "border-neutral-espresso/15 hover:border-primary-teal/40"
                    )}
                  >
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) =>
                        handleFileChange(doc.key, e.target.files?.[0] ?? null)
                      }
                    />
                    <UploadCloud className="h-5 w-5 text-primary-teal" />
                    <span className="text-xs font-medium text-neutral-espresso">
                      {documents[doc.key]?.name ?? "Klik untuk pilih file"}
                    </span>
                  </label>
                  {documentErrors[doc.key] && (
                    <p className="mt-1 text-xs text-red-600">
                      {documentErrors[doc.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Review */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-neutral-espresso">
              Periksa Kembali Data Anda
            </h2>

            <ReviewSection title="Jalur Pendaftaran">
              <ReviewRow label="Jalur" value={selectedWave?.jalurLabel ?? "-"} />
              {selectedJalur === "ZONASI" && (
                <ReviewRow
                  label="Jarak ke Sekolah"
                  value={`${values.jarakKeSekolahKm ?? "-"} km`}
                />
              )}
            </ReviewSection>

            <ReviewSection title="Data Calon Siswa">
              <ReviewRow label="Nama Lengkap" value={values.namaLengkap} />
              <ReviewRow label="NIK" value={values.nik} />
              <ReviewRow label="NISN" value={values.nisn || "-"} />
              <ReviewRow
                label="Tempat, Tanggal Lahir"
                value={`${values.tempatLahir}, ${values.tanggalLahir}`}
              />
              <ReviewRow
                label="Jenis Kelamin"
                value={values.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
              />
            </ReviewSection>

            <ReviewSection title="Data Orang Tua">
              <ReviewRow label="Nama Ayah" value={values.namaAyah} />
              <ReviewRow label="Nama Ibu" value={values.namaIbu} />
              <ReviewRow label="No. HP" value={values.noHpOrtu} />
              <ReviewRow label="Alamat" value={values.alamat} />
            </ReviewSection>

            <ReviewSection title="Dokumen Terlampir">
              {DOCUMENT_FIELDS.filter((d) => documents[d.key]).map((d) => (
                <ReviewRow
                  key={d.key}
                  label={d.label}
                  value={documents[d.key]?.name ?? "-"}
                />
              ))}
            </ReviewSection>

            {submitError && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="rounded-2xl bg-joy-butter/40 p-4 text-xs leading-relaxed text-neutral-espresso/80">
              Dengan mengirim formulir ini, saya menyatakan bahwa data yang
              diisikan adalah benar dan dapat dipertanggungjawabkan.
            </div>
          </div>
        )}

        {/* Navigasi */}
        <div className="mt-8 flex items-center justify-between border-t border-neutral-espresso/10 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0 || submitting}
            className="flex items-center gap-1.5 rounded-button px-5 py-2.5 text-sm font-semibold text-neutral-slate disabled:opacity-0"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 rounded-button bg-primary-teal px-6 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Lanjut
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-button bg-primary-teal px-6 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-neutral-espresso">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-neutral-espresso/[0.03] p-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-primary-teal-deep">
        {title}
      </h3>
      <div className="mt-2 space-y-1.5">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:gap-2">
      <span className="w-40 shrink-0 text-neutral-slate">{label}</span>
      <span className="font-medium text-neutral-espresso">{value}</span>
    </div>
  );
}
