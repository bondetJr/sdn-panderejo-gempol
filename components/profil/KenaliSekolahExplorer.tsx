"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight, Award, BookOpen, Building2, CalendarDays, CheckCircle2,
  Heart, Image as ImageIcon, ImageOff, Lightbulb, MapPin, Palette, Sparkles, Target, Users,
} from "lucide-react";
import type { KenaliSekolahData } from "@/lib/kenali-sekolah-data";

type Data = KenaliSekolahData;

export function KenaliSekolahExplorer({ data }: { data: Data }) {
  const [visionTab, setVisionTab] = useState<"visi" | "misi">("visi");
  const [academicTab, setAcademicTab] = useState<"kurikulum" | "program">("kurikulum");
  const visible = {
    programs: data.programs,
    facilities: data.facilities,
    achievements: data.achievements,
    teachers: data.teachers,
  };
  return (
    <div className="bg-base-cloud">
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary-teal-light/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Satu ruang untuk mengenal sekolah
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
              Kenali {data.school.nama}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {data.school.tagline}. Jelajahi profil, pembelajaran, warga sekolah, serta kabar terbaru dalam satu halaman.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["6", "Tingkat kelas"], [String(data.teachers.length), "Guru & tendik"],
              [String(data.facilities.length), "Fasilitas"], [data.school.akreditasi, "Akreditasi"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-card border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="mt-1 text-xs text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-card bg-white p-6 shadow-soft sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-primary-teal">Arah pendidikan</p>
                <h2 className="mt-2 text-2xl font-extrabold">Visi & misi</h2>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-teal/10 text-primary-teal-deep">
                {visionTab === "visi" ? <Target className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-base-cloud p-1">
              {(["visi", "misi"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setVisionTab(tab)} className={`rounded-xl px-3 py-2 text-sm font-bold capitalize transition-colors ${visionTab === tab ? "bg-white text-primary-teal-deep shadow-sm" : "text-neutral-slate hover:text-primary-teal-deep"}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-4 min-h-40 rounded-2xl border border-primary-teal/15 bg-primary-teal/5 p-5">
              {visionTab === "visi" ? (
                <p className="text-sm font-medium italic leading-relaxed">“{data.narratives.visi}”</p>
              ) : (
                <div className="space-y-3">
                  {data.narratives.misi.map((item, index) => <div key={item} className="flex gap-3 text-sm leading-relaxed"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-teal text-xs font-bold text-white">{index + 1}</span><span>{item}</span></div>)}
                </div>
              )}
            </div>
            <Link href="/profil/visi-misi" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary-teal-deep">Baca profil lengkap <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-card bg-neutral-graphite p-6 text-white shadow-soft sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-primary-teal-light">Identitas sekolah</p>
              <h2 className="mt-2 text-2xl font-extrabold">{data.school.nama}</h2>
              <div className="mt-6 space-y-4 text-sm text-white/75">
                <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-primary-teal" />{data.school.alamat}</p>
                <p className="flex gap-3"><Building2 className="h-5 w-5 shrink-0 text-primary-teal" />NPSN {data.school.npsn} · {data.school.provinsi}</p>
                <p className="flex gap-3"><CalendarDays className="h-5 w-5 shrink-0 text-primary-teal" />Tahun ajaran {data.school.tahunAjaranAktif}</p>
              </div>
              <Link href="/kontak" className="mt-7 inline-flex items-center gap-2 rounded-button bg-primary-teal px-4 py-2.5 text-sm font-bold text-white">Hubungi sekolah <ArrowRight className="h-4 w-4" /></Link>
            </div>
        </section>

        <section className="rounded-card bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary-teal">Belajar & bertumbuh</p><h2 className="mt-2 text-2xl font-extrabold">Program dan akademik</h2></div><Link href="/akademik" className="text-sm font-bold text-primary-teal-deep">Lihat akademik <ArrowRight className="inline h-4 w-4" /></Link></div>
          <div className="mt-6 flex gap-2 overflow-x-auto border-b border-neutral-espresso/10">
            <button type="button" onClick={() => setAcademicTab("kurikulum")} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 text-sm font-bold ${academicTab === "kurikulum" ? "border-primary-teal text-primary-teal-deep" : "border-transparent text-neutral-slate"}`}><BookOpen className="h-4 w-4" />Kurikulum</button>
            <button type="button" onClick={() => setAcademicTab("program")} className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 pb-3 text-sm font-bold ${academicTab === "program" ? "border-primary-teal text-primary-teal-deep" : "border-transparent text-neutral-slate"}`}><Lightbulb className="h-4 w-4" />Program Unggulan</button>
          </div>
          {academicTab === "kurikulum" ? (
            <p className="mt-5 rounded-2xl bg-base-cloud p-5 text-justify text-sm leading-relaxed text-neutral-slate">{data.narratives.kurikulum}</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.programs.map((item) => <div key={item.id} className="rounded-2xl border border-neutral-espresso/10 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-teal/10 text-primary-teal-deep"><Sparkles className="h-4 w-4" /></span><h3 className="mt-3 font-bold">{item.nama}</h3><p className="mt-1 text-sm leading-relaxed text-neutral-slate">{item.deskripsiSingkat}</p></div>)}</div>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.extracurriculars.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-card border border-neutral-espresso/10 bg-white shadow-soft transition-transform hover:-translate-y-1">
                <div className="relative flex h-36 items-center justify-center bg-primary-teal/10">
                  {item.fotoUrl ? (
                    <Image src={item.fotoUrl} alt={item.nama} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary-teal-deep/50">
                      <Palette className="h-9 w-9" />
                      <ImageOff className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{item.nama}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card bg-white p-6 shadow-soft sm:p-8"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary-teal">Orang-orang hebat</p><h2 className="mt-2 text-2xl font-extrabold">Guru & tenaga kependidikan</h2></div><Link href="/guru-dan-tendik" className="text-sm font-bold text-primary-teal-deep">Semua tim <ArrowRight className="inline h-4 w-4" /></Link></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.teachers.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-neutral-espresso/10 p-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep"><Users className="h-5 w-5" /></div><div className="min-w-0"><h3 className="truncate text-sm font-bold">{item.nama}</h3><p className="truncate text-xs text-neutral-slate">{item.jabatan}{item.mapelDiampu ? ` · ${item.mapelDiampu}` : ""}</p></div></div>)}</div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Guru", data.structure.guruCount], ["Tendik", data.structure.tendikCount], ["Rombel", data.classes.length], ["Siswa aktif", data.classes.reduce((sum, item) => sum + item.jumlahSiswa, 0)]].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-base-cloud p-4 text-center"><p className="text-xl font-extrabold text-primary-teal-deep">{value}</p><p className="text-xs text-neutral-slate">{label}</p></div>)}</div></section>

        <section><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary-teal">Ruang belajar</p><h2 className="mt-2 text-2xl font-extrabold">Fasilitas & prestasi</h2></div><Link href="/profil/fasilitas" className="text-sm font-bold text-primary-teal-deep">Detail profil <ArrowRight className="inline h-4 w-4" /></Link></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{visible.facilities.map((item) => <div key={item.id} className="rounded-card bg-white p-5 shadow-soft"><Building2 className="h-5 w-5 text-primary-teal" /><h3 className="mt-3 font-bold">{item.nama}</h3><p className="mt-1 text-sm leading-relaxed text-neutral-slate">{item.deskripsi}</p></div>)}</div><div className="mt-4 grid gap-4 md:grid-cols-3">{visible.achievements.map((item) => <div key={item.id} className="rounded-card border border-joy-butter bg-joy-butter/30 p-5"><Award className="h-5 w-5 text-neutral-espresso" /><p className="mt-3 text-xs font-bold uppercase text-neutral-slate">{item.tahun} · {item.tingkat}</p><h3 className="mt-1 font-bold">{item.judul}</h3></div>)}</div></section>

        <section className="rounded-card bg-primary-teal-deep p-6 text-white shadow-soft sm:p-8"><ImageIcon className="h-6 w-6 text-primary-teal-light" /><h2 className="mt-3 text-2xl font-extrabold">Momen kegiatan</h2><p className="mt-2 text-sm leading-relaxed text-white/70">Lihat dokumentasi aktivitas dan kebersamaan warga sekolah.</p><div className="mt-5 space-y-3">{data.albums.slice(0, 3).map((album) => <Link key={album.id} href={`/informasi/galeri/${album.id}`} className="flex items-center justify-between rounded-xl bg-white/10 p-3 text-sm font-semibold hover:bg-white/15"><span>{album.judul}</span><ArrowRight className="h-4 w-4 shrink-0" /></Link>)}</div><Link href="/informasi/galeri" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary-teal-light">Buka galeri <ArrowRight className="h-4 w-4" /></Link></section>

        <section className="rounded-card border border-primary-teal/20 bg-primary-teal/5 p-6 text-center sm:p-8"><CheckCircle2 className="mx-auto h-7 w-7 text-primary-teal-deep" /><h2 className="mt-3 text-xl font-extrabold">Ingin tahu lebih banyak?</h2><p className="mx-auto mt-2 max-w-xl text-sm text-neutral-slate">Semua konten di halaman ini terhubung dengan informasi publik yang dikelola melalui Dashboard Admin.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/kontak/hubungi-kami" className="rounded-button bg-primary-teal px-5 py-2.5 text-sm font-bold text-white">Hubungi kami</Link><Link href="/" className="rounded-button border border-primary-teal/30 px-5 py-2.5 text-sm font-bold text-primary-teal-deep">Kembali ke beranda</Link></div></section>
      </div>
    </div>
  );
}
