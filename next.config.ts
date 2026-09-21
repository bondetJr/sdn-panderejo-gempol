import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.98"],
  experimental: {
    // Vercel rejects large Server Action requests before the action runs.
    // Keep this below Vercel's 4.5 MB function request limit.
    serverActions: {
      bodySizeLimit: "4mb",
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