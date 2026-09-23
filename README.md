# SDN Panderejo Gempol - Website Resmi

Website resmi dan sistem informasi PPDB untuk SD Negeri Panderejo Gempol, Kec. Gempol, Kab. Pasuruan.

Live: https://sdn-panderejo-gempol.vercel.app

## Fitur

**Publik:**
- Beranda, Profil Sekolah (Visi Misi, Sejarah, Fasilitas, Prestasi)
- Akademik (Kurikulum, Kalender, Jadwal, Rombel, Ekstrakurikuler)
- Guru & Tendik
- Informasi (Berita, Pengumuman, Galeri)
- PPDB (Informasi Gelombang, Daftar Online, Cek Status)
- Kontak (Lokasi, Buku Tamu, FAQ)

**Admin:**
- Dashboard Overview
- Manajemen PPDB (Verifikasi pendaftar & dokumen)
- Manajemen Konten (Berita, Galeri, Fasilitas, Guru, dll)
- Pengaturan Sekolah & Pengguna (Role-based)

**Fitur Tambahan:**
- Chat AI "Ceria" untuk bantuan informasi

## Teknologi

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui
- Prisma ORM + PostgreSQL (Supabase)
- Supabase Storage (Dokumen PPDB privat & media publik)
- NextAuth v5 (Credentials)
- Vercel Analytics

## Cara Menjalankan Lokal

### 1. Install
```bash
npm install
```

### 2. Setup Supabase
Buat project di supabase.com, lalu buat 2 bucket:
- `ppdb-documents` -> **Private** (uncheck Public)
- `public-media` -> **Public** (check Public)

### 3. Environment Variables
```bash
cp .env.example .env
```
Lengkapi file `.env` sesuai template di `.env.example`. Generate secret:
```bash
openssl rand -base64 32
```

### 4. Database
```bash
npx prisma migrate dev
npm run prisma:seed # Opsional, untuk data contoh development
```

### 5. Buat Akun Admin Pertama
Jangan pakai seed di production. Gunakan CLI:
```bash
npm run create-admin -- "Nama Admin" admin@sekolah.sch.id passwordYangKuat SUPER_ADMIN
```

### 6. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000 (publik) dan http://localhost:3000/admin (admin).

## Environment Variables Wajib

Lihat `.env.example` untuk daftar lengkap. Yang wajib ada:
- `DATABASE_URL`, `DIRECT_URL` (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only, jangan pakai prefix NEXT_PUBLIC_)
- `AUTH_SECRET`, `AUTH_URL`
- `PII_ENCRYPTION_KEY`, `PII_HASH_KEY` (generate: openssl rand -base64 32)
- `ANTHROPIC_API_KEY` (jika pakai fitur Chat)

## Deploy ke Vercel

1. Push ke GitHub
2. Import di Vercel
3. Isi semua Environment Variables di Vercel Settings
4. Set `AUTH_URL` ke domain production
5. Jalankan migrasi production:
```bash
DATABASE_URL="..." npx prisma migrate deploy
```

## Keamanan

- Password di-hash dengan bcrypt
- Proteksi role (SUPER_ADMIN, KEPALA_SEKOLAH, OPERATOR, GURU)
- Dokumen PPDB disimpan di bucket privat dengan signed URL
- Data sensitif (NIK) dienkripsi at-rest (AES-256-GCM)
- Semua aksi admin tercatat di log

## Struktur Folder Singkat

```
/app/(public)  -> Halaman publik
/app/admin     -> Dashboard admin
/app/api       -> API routes
/components    -> Komponen UI
/lib           -> Helper, validasi, data fetching
/prisma        -> Schema & migrations
/scripts       -> CLI tools
```

## Lisensi

Private - Untuk internal SD Negeri Panderejo Gempol.
