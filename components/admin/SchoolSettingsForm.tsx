"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImageOff, Loader2, Save } from "lucide-react";
import { updateSchoolSettings } from "@/lib/actions/pengaturan-admin";

type School = {
  id: string;
  nama: string;
  npsn: string;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  mapsEmbedUrl: string | null;
  logoUrl: string | null;
};

export function SchoolSettingsForm({ school }: { school: School }) {
  const [nama, setNama] = useState(school.nama);
  const [npsn, setNpsn] = useState(school.npsn);
  const [alamat, setAlamat] = useState(school.alamat ?? "");
  const [telepon, setTelepon] = useState(school.telepon ?? "");
  const [email, setEmail] = useState(school.email ?? "");
  const [mapsEmbedUrl, setMapsEmbedUrl] = useState(school.mapsEmbedUrl ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(school.logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append("id", school.id);
      formData.append("nama", nama);
      formData.append("npsn", npsn);
      formData.append("alamat", alamat);
      formData.append("telepon", telepon);
      formData.append("email", email);
      formData.append("mapsEmbedUrl", mapsEmbedUrl);
      if (school.logoUrl) formData.append("existingLogoUrl", school.logoUrl);
      if (fileInputRef.current?.files?.[0]) {
        formData.append("logo", fileInputRef.current.files[0]);
      }

      await updateSchoolSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white p-6 shadow-soft">
      <div>
        <label className="text-sm font-semibold text-neutral-espresso">Logo Sekolah</label>
        <div className="mt-1.5 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-neutral-espresso/5">
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" fill className="object-contain p-2" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="h-6 w-6 text-neutral-slate/40" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="text-xs"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-neutral-espresso">Nama Sekolah</label>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-neutral-espresso">NPSN</label>
          <input
            required
            value={npsn}
            onChange={(e) => setNpsn(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-neutral-espresso">Alamat</label>
        <textarea
          rows={2}
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          className="input-field mt-1.5 resize-none"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-neutral-espresso">Telepon</label>
          <input
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-neutral-espresso">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mt-1.5"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-neutral-espresso">
          Embed URL Google Maps (opsional)
        </label>
        <input
          value={mapsEmbedUrl}
          onChange={(e) => setMapsEmbedUrl(e.target.value)}
          placeholder="https://www.google.com/maps?q=...&output=embed"
          className="input-field mt-1.5"
        />
        <p className="mt-1 text-xs text-neutral-slate">
          Kosongkan untuk pakai pencarian otomatis berdasarkan alamat.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex items-center gap-2 rounded-button bg-primary-teal px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saved ? "Tersimpan!" : "Simpan Perubahan"}
      </button>
    </form>
  );
}
