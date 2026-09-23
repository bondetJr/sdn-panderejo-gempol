import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // FIX MEDIUM: Hapus hardcoded IP lokal 192.168.1.98 yang bocor di repo.
  // Kalau butuh dev origin di LAN, set via env: ALLOWED_DEV_ORIGINS="http://192.168.1.98:3000"
  ...(process.env.ALLOWED_DEV_ORIGINS
    ? { allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS.split(",") }
    : {}),

  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  // FIX CRITICAL: Hapus ignoreBuildErrors & ignoreDuringBuilds
  // Sekarang build akan GAGAL jika ada error TypeScript/ESLint - jadi bug ketahuan sebelum deploy.

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // FIX LOW: Hapus images.unsplash.com di production.
      // Aktifkan lagi cuma di dev jika butuh: ALLOW_UNSPLASH=true
      ...(process.env.ALLOW_UNSPLASH === "true"
        ? [{ protocol: "https", hostname: "images.unsplash.com" } as const]
        : []),
    ],
  },
};

export default nextConfig;