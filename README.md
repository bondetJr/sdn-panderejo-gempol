# Website Resmi SD Negeri Panderejo Gempol

Website resmi & sistem informasi PPDB untuk **SD Negeri Panderejo Gempol**, Desa Panderejo, Kecamatan Gempol, Kabupaten Pasuruan, Jawa Timur.

**NPSN:** `20519616` &nbsp;•&nbsp; **Tahun Ajaran Aktif:** 2026/2027

---

## ✅ Status: Semua 11 Tahap Pembangunan Selesai

| # | Tahap | Isi |
|---|---|---|
| 0 | Fondasi | Next.js 15, Tailwind v4 + token warna 2026, Prisma schema |
| 1 | Layout Utama | Header mega-menu, mobile drawer, Footer |
| 2 | Beranda | Hero, 6 Program Unggulan, Pengumuman, Fasilitas, Berita, Testimoni |
| 3 | Profil Sekolah | 6 sub-halaman (Visi Misi, Sejarah, Struktur, Sambutan, Fasilitas, Prestasi) |
| 4 | Akademik | Kurikulum, Kalender, Jadwal (berwarna per mapel), Rombel, Ekstrakurikuler |
| 5 | Guru & Tendik | Grid card, search & filter status kepegawaian |
| 6 | Informasi & Berita | Berita+detail, Pengumuman, Galeri+lightbox |
| 7 | PPDB | Informasi gelombang, form daftar 5 langkah, cek status privat |
| 8 | Kontak | Lokasi+Maps, Hubungi Kami, Buku Tamu, FAQ |
| 9 | Login | NextAuth v5, proteksi `/admin` |
| 10 | Dashboard Admin | 8 modul CRUD lengkap + proteksi role |
| 11 | Chat AI "Ceria" | Widget chat streaming dengan tool calling |

> Catatan teknis detail tiap tahap (keputusan desain, trade-off, hal yang perlu direview) ada di **[`docs/CATATAN-PEMBANGUNAN.md`](./docs/CATATAN-PEMBANGUNAN.md)**.

---

## 🚀 Cara Menjalankan (Development)

### 1. Install dependencies
```bash
npm install
```

### 2. Siapkan Supabase
Buat project baru di [supabase.com](https://supabase.com), lalu buat **2 bucket Storage**:
- `ppdb-documents` → **privat** (uncheck "Public bucket")
- `public-media` → **publik** (check "Public bucket")

### 3. Isi environment variables
```bash
cp .env.example .env
```
Lengkapi `.env` dengan kredensial dari Supabase Dashboard (Project Settings > API & Database), plus:
```bash
# Generate AUTH_SECRET:
openssl rand -base64 32
```

### 4. Migrasi database
```bash
npx prisma migrate dev --name init
```

### 5. Isi data awal (opsional tapi disarankan untuk development)
```bash
npm run prisma:seed
```
Untuk **production**, jangan pakai password default ini. Buat akun lewat:
```bash
npm run create-admin -- "Nama Anda" email@sekolah.sch.id passwordAman123 SUPER_ADMIN
```

### 6. Jalankan development server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) untuk website publik, dan [http://localhost:3000/admin](http://localhost:3000/admin) untuk Dashboard Admin.

---

## 🔑 Environment Variables Wajib

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Koneksi Supabase Postgres (pooler & direct) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publik |
| `SUPABASE_SERVICE_ROLE_KEY` | **Rahasia** — hanya dipakai di server (upload file) |
| `AUTH_SECRET`, `AUTH_URL` | NextAuth v5 |
| `ANTHROPIC_API_KEY` | Untuk Chat AI "Ceria" (Tahap 11) |

Lihat `.env.example` untuk template lengkap.

---

## 🎨 Design System

Semua warna wajib pakai token dari `lib/tokens.ts` (juga tersedia sebagai class Tailwind via `app/globals.css`):

| Token | Hex | Pemakaian |
|---|---|---|
| `base-cloud` | `#F8F7F4` | Background utama |
| `primary-teal-deep` | `#0A5C5C` | Header, navigasi |
| `primary-teal` | `#1DB5A8` | CTA utama |
| `joy-butter` | `#FBE49D` | Badge prestasi, pengumuman penting |
| `accent-lime` | `#B3FF00` | **HANYA** di atas background gelap (CTA "Diterima" di Dashboard Admin) |
| `neutral-graphite` | `#23262F` | Sidebar admin, footer |

Radius: card `20px`, button `12px`, hero `32px`. Shadow: `0 8px 24px rgba(89,39,32,0.06)`.

---

## 📁 Struktur Folder

```
/app
  layout.tsx                    ← root layout + AuthProvider
  (public)/                     ← seluruh halaman publik (Header+Footer+Chat otomatis)
    page.tsx                    ← Beranda
    profil/, akademik/, guru-dan-tendik/, informasi/, ppdb/, kontak/, login/
  admin/                        ← Dashboard Admin (proteksi middleware.ts)
    layout.tsx                  ← sidebar + topbar
    page.tsx                    ← Overview
    ppdb/, informasi/, profil/, akademik/, guru/, kontak/, pengaturan/
  api/
    auth/[...nextauth]/         ← NextAuth
    chat/                       ← Chat AI Ceria
    ppdb/, kontak/              ← form submission publik

/components
  ui/            ← Button, dst (shadcn-style)
  layout/        ← Header, Footer, PageHeader
  home/          ← section-section Beranda
  profil/ akademik/ informasi/ ppdb/ kontak/ auth/  ← komponen per section publik
  admin/         ← seluruh komponen Dashboard Admin (Manager per modul)
  chat/          ← ChatWidget

/lib
  tokens.ts, nav-config.ts, admin-nav-config.ts
  prisma.ts, school.ts, utils.ts
  *-data.ts              ← query data publik (dengan fallback dummy)
  admin-*-data.ts         ← query data khusus admin
  actions/                ← Server Actions untuk semua mutasi admin
  validations/            ← skema Zod (PPDB, Kontak)
  supabase/               ← client & server helper Supabase

/prisma
  schema.prisma
  seed.ts

/scripts
  create-admin.ts         ← CLI buat akun admin production
```

---

## 🔒 Keamanan & Privasi — Yang Sudah & Belum

**Sudah diterapkan:**
- Password di-hash dengan bcrypt (12 rounds)
- Proteksi role: hanya Super Admin bisa kelola akun User (`/admin/pengaturan/users`)
- Halaman Rombongan Belajar publik **hanya menampilkan data agregat** (jumlah siswa, bukan nama/NISN) — sesuai UU PDP
- Dokumen PPDB tersimpan di Supabase Storage **bucket privat**, diakses admin lewat signed URL (kedaluwarsa 10 menit)
- Cek status PPDB publik butuh 2 identitas sekaligus (No. Pendaftaran + NIK), pesan error generik
- Semua aksi admin tercatat di `AdminActionLog`
- Rate limiting di endpoint sensitif (cek status PPDB, submit form, chat)

**⚠️ Belum diterapkan — mohon jadi perhatian sebelum go-live:**
1. **Enkripsi NIK & No. HP Orang Tua "at rest"** di database (masih plain text). Diminta di brief awal tapi perlu keputusan arsitektur terpisah (app-level encryption vs `pgcrypto`).
2. **Rate limiter berbasis in-memory** — tidak efektif di Vercel production (serverless multi-instance). Perlu diganti Upstash Redis atau Vercel KV sebelum production traffic tinggi.

Detail lengkap ada di `docs/CATATAN-PEMBANGUNAN.md`.

---

## 🌐 Deploy ke Production (Vercel)

1. Push project ini ke GitHub/GitLab.
2. Import ke [Vercel](https://vercel.com/new).
3. Isi semua environment variables (sama seperti `.env`) di Vercel Project Settings.
4. Set `AUTH_URL` ke domain production (mis. `https://sdnpanderejogempol.sch.id`).
5. Jalankan migrasi database production:
   ```bash
   DATABASE_URL="<connection-string-production>" npx prisma migrate deploy
   ```
6. Buat akun Super Admin production (**jangan** pakai seed dev):
   ```bash
   DATABASE_URL="<connection-string-production>" npm run create-admin -- "Nama" email@sekolah.sch.id passwordAman SUPER_ADMIN
   ```
7. Ganti field `School` (logo, alamat asli, dll) lewat Dashboard Admin > Pengaturan.

---

## 📝 Mengganti NPSN & Data Sekolah ke Data Asli

Setelah aplikasi jalan, edit lewat **Dashboard Admin**:
- **Pengaturan > Data Sekolah** — nama, NPSN, alamat, telepon, email, logo
- **Profil Manager > Umum & Visi Misi** — visi, misi, sejarah, struktur organisasi, akreditasi
- **Profil Manager > Sambutan Kepsek** — pilih guru yang menjabat + teks sambutan

Semua data dummy (guru, kelas, fasilitas contoh dari `prisma/seed.ts`) sebaiknya dihapus/diganti data asli sebelum website go-live.

---

## 🔄 Revisi Pasca-Peluncuran

**Kelompok C — Fitur Interaktif Baru (SELESAI ✅ 5/5):**
- **Program Unggulan interaktif** ✅ — model baru `FlagshipProgram`. Card di Beranda sekarang bisa diklik → muncul modal berisi deskripsi lengkap + foto kegiatan. Semua diatur dari `/admin/profil/program` (upload foto, pilih icon, atur urutan, draft/publish).
- **Prestasi interaktif** ✅ — field `fotoUrl` di `Achievement` sudah ada dari awal tapi belum pernah dipakai. Sekarang card prestasi di `/profil/akreditasi-prestasi` bisa diklik → modal dengan foto piala/kegiatan/siswa. Form admin `/admin/profil/prestasi` ditambah upload foto.
- **Ekstrakurikuler interaktif** ✅ — sama seperti Prestasi, field `fotoUrl` & upload admin sudah ada dari Kelompok B, tinggal sisi publik yang belum interaktif. Sekarang card di `/akademik/ekstrakurikuler` bisa diklik → modal deskripsi lengkap + foto kegiatan.
- **Struktur Organisasi berbasis data** ✅ — model baru `OrgCommitteeMember` (khusus Level 2/Komite Sekolah, input manual). Level 1 (Kepala Sekolah) & Level 3 (Guru/Tendik, dipisah otomatis berdasarkan kata "guru" di jabatan) diambil langsung dari data Guru Manager yang sudah ada — **tidak ada duplikasi data**. Field `School.strukturOrgUrl` (upload gambar lama) sudah tidak dipakai lagi tapi dibiarkan di schema agar tidak perlu migrasi drop-column.
- **Rombongan Belajar + CRUD Siswa** ✅ — modul CRUD Siswa baru dari nol (`/admin/akademik/rombel/[id]`): klik "Kelola Siswa" di daftar rombel → ringkasan kelas (Total/L/P) + tabel siswa lengkap (No Induk, NISN, NIK, jenis kelamin, status aktif) dengan tambah/edit/hapus. Validasi NISN (10 digit) & NIK (16 digit) otomatis, plus cek duplikasi.

  Halaman **publik** `/akademik/rombongan-belajar` UI-nya drill-down 2 langkah (6 card Kelas langsung tampil → klik → card rombel A/B/C → klik → ringkasan + tabel siswa). ✅ **Update:** atas konfirmasi eksplisit pemilik website, tabel siswa **aktif** (No. Induk, NISN, Nama, Jenis Kelamin) sekarang ditampilkan di halaman publik ini. **NIK tetap tidak pernah ditampilkan** di publik dalam kondisi apa pun (field paling sensitif, hanya bisa diakses admin/guru setelah login).

⚠️ **Perlu migrasi database** (model baru `FlagshipProgram` & `OrgCommitteeMember`):
```bash
npx prisma migrate dev --name kelompok-c-updates
```

**Kelompok B — Modul Admin Baru (selesai):**
- **Jadwal Pelajaran** kini bisa diatur dari `/admin/akademik/jadwal` (model baru `ScheduleSlot`) — pilih tingkat, atur per hari, halaman publik otomatis mengikuti. Kalau admin belum isi untuk tingkat tertentu, tetap tampil jadwal contoh.
- **Kurikulum** kini bisa diedit dari `/admin/akademik/kurikulum` (field baru `School.kurikulumText`).
- **PPDB Daftar** sekarang otomatis aktif/nonaktif sesuai periode gelombang (`tanggalBuka`-`tanggalTutup`), bukan cuma toggle `isActive` manual. Halaman Informasi PPDB juga dapat badge status: Belum Dibuka / Sedang Dibuka / Ditutup.
- **Guru Manager**: tambah field `urutan` (kontrol urutan tampil di halaman publik) + ringkasan total Kepala Sekolah/Guru/Tendik di halaman `/guru-dan-tendik`.

⚠️ **Perlu migrasi database** setelah update ini (ada 2 field baru + 1 model baru):
```bash
npx prisma migrate dev --name kelompok-b-updates
```

**Kelompok A — Bug Kritis (selesai):**
- Fix hydration error (invalid `<a>` di dalam `<button>` pada Header)
- Fix mobile hamburger menu berantakan (drawer dipindah pakai React Portal, lepas dari containing block `backdrop-blur` header)
- Fix logo sekolah tidak update di area publik (Header & Footer sekarang baca `school.logoUrl` via komponen `SchoolLogo`)
- Fix card Pengumuman Penting tumpang tindih Hero di mobile

**Kelompok D — Polish UI (selesai):**
- Hero lebih ringkas (padding & ukuran teks dikecilkan)
- Card Program Unggulan lebih simple (grid 6 kolom seragam, ikon+judul saja)
- Testimoni lebih ringkas (1 baris kutipan, padding lebih kecil)
- Footer lebih simple (3 kolom, kolom "Menu Utama" yang redundan dengan "Link Cepat" dihapus)

Detail teknis lengkap tiap perbaikan ada di `docs/CATATAN-PEMBANGUNAN.md`.

## 🛠️ Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma ORM · Supabase (Postgres + Storage) · NextAuth v5 · Vercel AI SDK · React Hook Form + Zod · Recharts

---

## 📄 Lisensi & Kontribusi

Proyek internal untuk SD Negeri Panderejo Gempol. Dikembangkan bertahap bersama Claude (Anthropic) sebagai partner development.
