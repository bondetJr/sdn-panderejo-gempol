# Catatan Pembangunan — Per Tahap

Dokumen ini berisi catatan teknis detail dari setiap tahap pembangunan website (Tahap 0-12). Disimpan terpisah dari `README.md` supaya README utama tetap ringkas untuk kebutuhan sehari-hari, tapi konteks keputusan desain/teknis tetap terdokumentasi untuk pengembangan lanjutan.

---

## Catatan Tahap 11 — Chat AI "Ceria"

- Pakai **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) dengan `streamText` + tool calling — respons streaming (muncul kata per kata), bukan tunggu penuh baru tampil.
- **3 tools** yang bisa dipanggil model:
  1. `cekStatusPpdb(noPendaftaran, nik)` — reuse fungsi yang sama persis dengan halaman `/ppdb/cek-status`, jadi aturan privasinya konsisten (butuh 2 identitas cocok, tidak pernah expose data pendaftar lain).
  2. `getFasilitas()` — ambil data fasilitas asli dari database, supaya Ceria tidak mengarang.
  3. `getGuru(keyword?)` — cari guru berdasarkan jabatan, data yang dikembalikan hanya nama/jabatan/status (bukan data pribadi sensitif).
- System prompt (`lib/chat-system-prompt.ts`) mewajibkan Ceria: tidak pernah membocorkan cara akses `/login` admin, tidak mengarang data, dan mengarahkan ke menu Kontak untuk hal yang datanya belum tersedia.
- Rate limit 20 pesan/menit per IP (pola sama seperti endpoint sensitif lainnya).

**⚠️ Wajib diisi sebelum chat berfungsi:** `ANTHROPIC_API_KEY` di `.env` (sudah ada template di `.env.example`). Model id di `app/api/chat/route.ts` (`claude-3-5-sonnet-20241022`) mungkin perlu disesuaikan dengan model yang aktif di akun Anthropic Bapak/Ibu saat deploy — cek daftar model terbaru di [docs.claude.com](https://docs.claude.com).

## Catatan Tahap 10 — Dashboard Admin (Pengaturan & Proteksi Role)

- **Proteksi role SUPER_ADMIN** untuk halaman Kelola Pengguna diterapkan di **2 lapisan**:
  1. UI: tab "Kelola Pengguna" otomatis disembunyikan dari sidebar/tabs untuk role selain Super Admin (`components/admin/AdminPengaturanTabs.tsx`)
  2. Server: halaman (`app/admin/pengaturan/users/page.tsx`) & semua Server Action terkait (`lib/actions/pengaturan-admin.ts`) mengecek ulang `session.user.role === "SUPER_ADMIN"` — jadi meski seseorang mencoba akses URL langsung atau memanggil action dari luar UI, tetap akan ditolak dengan pesan jelas, bukan crash.
- Super Admin **tidak bisa menghapus akun miliknya sendiri** (dicegah di server action `deleteUser`) — mencegah kena-lock-out tak sengaja.
- Reset password oleh admin **tidak memerlukan password lama** (wajar untuk kasus lupa password), tapi tetap tercatat di `AdminActionLog`.

**Dengan ini, seluruh 8 modul Dashboard Admin sudah lengkap:** Overview, PPDB Manager, Informasi Manager, Profil Manager, Akademik Manager, Guru Manager, Kontak Manager, dan Pengaturan.

## Catatan Tahap 9 — Login

- Pakai **NextAuth v5** (Credentials provider) dengan session JWT — tidak perlu tabel Session tambahan.
- **Tidak ada halaman registrasi publik** (sesuai desain sistem sekolah negeri: akun dibuat oleh Super Admin). Untuk membuat akun admin pertama sebelum Dashboard Admin selesai (Tahap 10), pakai script CLI:
  ```bash
  npm run create-admin -- "Nama Anda" 
  ```
- `middleware.ts` melindungi semua rute `/admin/*` — otomatis redirect ke `/login` kalau belum login, dan kembali ke halaman yang dituju setelah berhasil login (`callbackUrl`).
- Header di area publik otomatis berubah dari tombol **"Sign In"** jadi **"Dashboard"** begitu ada sesi aktif.
- Isi `AUTH_SECRET` di `.env` (generate dengan `openssl rand -base64 32`) sebelum menjalankan aplikasi — NextAuth akan error kalau kosong.
- Proteksi berbasis **role** (mis. hanya SUPER_ADMIN yang boleh ke halaman Pengaturan) belum diterapkan di tahap ini — baru akan ditambahkan per-halaman saat membangun Dashboard Admin di Tahap 10, karena strukturnya baru jelas setelah halaman itu ada.

## Catatan Tahap 7 — PPDB

**Alur yang sudah jalan:**
- `/ppdb/informasi` — kartu tiap jalur (Zonasi/Afirmasi/Perpindahan) dengan progress bar kuota & syarat
- `/ppdb/daftar` — form 5 langkah (Pilih Jalur → Data Siswa → Data Ortu → Upload Dokumen → Review) dengan validasi Zod per langkah, submit ke `POST /api/ppdb/daftar`
- `/ppdb/cek-status` — cek via **Nomor Pendaftaran + NIK sekaligus** (bukan salah satu saja) supaya tidak bisa ditebak; response error sengaja dibuat generik (tidak bilang "NIK salah" vs "no. pendaftaran salah") agar tidak membantu orang menebak data pendaftar lain

**Wajib disiapkan sebelum fitur ini berfungsi:**
1. Buat **bucket privat** bernama `ppdb-documents` di Supabase Storage (Storage > New Bucket > uncheck "Public bucket").
2. Isi `.env` dengan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` (service role **hanya** dipakai di `lib/supabase/server.ts`, tidak pernah di kode client).
3. Jalankan migrasi Prisma agar tabel `PpdbApplicant`/`PpdbDocument` tersedia.

**⚠️ 2 hal yang belum sepenuhnya sesuai dokumen keamanan awal, mohon jadi perhatian sebelum go-live:**
1. **Enkripsi NIK & No. HP Ortu "at rest"** — dokumen instruksi awal meminta ini dienkripsi di database, tapi saat ini masih tersimpan sebagai teks biasa di kolom Postgres. Mengimplementasikan enkripsi yang benar (butuh keputusan: enkripsi level-aplikasi dengan kunci terkelola vs `pgcrypto` di Postgres) adalah pekerjaan tersendiri yang saya sarankan jadi tahap terpisah — beri tahu saya kalau mau saya kerjakan.
2. **Rate limit 10x/menit** sudah saya buat (`lib/rate-limit.ts`), tapi berbasis in-memory yang **tidak efektif di Vercel production** (serverless = banyak instance, tidak berbagi memori). Untuk production, perlu diganti ke Upstash Redis atau Vercel KV — sudah saya beri catatan jelas di kode filenya.

**Field yang belum ada UI admin-nya** (upload dokumen tersimpan sebagai *path* privat di Storage, bukan URL publik) — nanti di Tahap 10 (Dashboard Admin) akan dibuatkan halaman Verifikasi Dokumen yang generate *signed URL* sementara untuk admin melihat file.

## Catatan Tahap 4 — Akademik

- **Jadwal Pelajaran**: warna badge per mata pelajaran ada di `lib/subjects.ts` (10 mapel, palet pastel terpisah dari token warna brand). Data jadwal masih **contoh/dummy** karena belum ada model database untuk jadwal — beri tahu saya kalau ingin dibuatkan model `ScheduleSlot` + CRUD di admin.
- **Rombongan Belajar**: klik kartu rombel menampilkan **ringkasan agregat** (Total Siswa, jumlah Laki-laki, jumlah Perempuan, nama Wali Kelas) via `components/akademik/RombonganBelajarExplorer.tsx`. **Tidak ada nama, NIS, atau NISN individual** yang ditampilkan maupun dikirim ke browser — sesuai pertimbangan privasi UU PDP untuk data anak.
  - Fungsi data: `getRombonganBelajarPublic()` di `lib/academic-data.ts` — query Prisma-nya sengaja hanya `select: { jenisKelamin: true }` untuk siswa, tidak pernah mengambil `nama`/`nis`/`nisn` ke sisi publik.
  - Fungsi `getRombonganBelajar()` (data lengkap per-siswa) tetap tersedia di file yang sama untuk dipakai nanti di Dashboard Admin/Guru (Tahap 10) yang terlindungi login.
- Field `nis` (No Induk lokal) ditambahkan ke model `Student` di `prisma/schema.prisma` — perlu migrasi ulang (`npx prisma migrate dev`).

## Catatan Tahap 2 — Beranda

- Bagian **6 Program Unggulan** memakai data statis di `lib/program-unggulan.ts` (bukan dari database), karena kontennya jarang berubah. Edit langsung file itu untuk mengubah nama/deskripsi/icon program.
- Semua section lain (Pengumuman, Fasilitas, Berita, Testimoni) mengambil dari database via `lib/homepage-data.ts`. **Sebelum di-seed**, otomatis pakai data dummy supaya halaman tetap enak dilihat — begitu ada data asli, otomatis terganti.
- Gambar dummy pakai Unsplash (`images.unsplash.com`), sudah diizinkan di `next.config.ts`. Ganti dengan foto asli sekolah nanti via Dashboard Admin (Tahap 10) yang upload ke Supabase Storage.

