import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.98"],
  experimental: {
<<<<<<< HEAD
    // Vercel rejects large Server Action requests before the action runs.
    // Keep this below Vercel's 4.5 MB function request limit.
    serverActions: {
      bodySizeLimit: "4mb",
=======
    serverActions: {
      bodySizeLimit: "12mb",
>>>>>>> b42813ae25ac0ef20e7d1d6c29bcd55c1e4aec89
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Dipakai HANYA untuk gambar dummy/placeholder sebelum data asli di-upload.
        // Boleh dihapus setelah semua foto Fasilitas/Berita diganti gambar asli sekolah.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;