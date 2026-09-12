/**
 * SDN PANDEREJO GEMPOL — DESIGN TOKENS 2026
 * -------------------------------------------------------
 * Sumber kebenaran tunggal warna, radius, shadow.
 * Dipakai untuk: inline style, chart (recharts), email template,
 * atau tempat lain yang tidak bisa pakai class Tailwind.
 *
 * Untuk styling komponen React, TETAP UTAMAKAN class Tailwind
 * (bg-primary-teal, text-neutral-espresso, dst) yang sudah
 * didefinisikan di app/globals.css via @theme.
 * -------------------------------------------------------
 */

export const colors = {
  base: {
    cloud: "#F8F7F4", // Cloud Dancer - Pantone Color of the Year 2026 (11-4201)
  },
  neutral: {
    espresso: "#592720", // text utama
    graphite: "#23262F", // sidebar admin, footer
    paleOak: "#DAC8AE",
    slate: "#536878", // teks sekunder / deskripsi
  },
  primary: {
    tealDeep: "#0A5C5C", // header, nav
    teal: "#1DB5A8", // CTA utama - Transformative Teal 2026
    tealLight: "#AAD9F4",
  },
  joy: {
    butter: "#FBE49D", // badge prestasi, pengumuman penting
  },
  accent: {
    lime: "#B3FF00", // HANYA di atas background gelap (#0A5C5C / #23262F)
  },
} as const;

export const gradients = {
  hero: "linear-gradient(135deg, #0A5C5C 0%, #1DB5A8 60%, #AAD9F4 100%)",
} as const;

export const radius = {
  card: "20px",
  button: "12px",
  hero: "32px",
} as const;

export const shadow = {
  soft: "0 8px 24px rgba(89,39,32,0.06)",
} as const;

/** Palet dipakai untuk chart (recharts) statistik PPDB, dsb. */
export const chartPalette = [
  colors.primary.teal,
  colors.primary.tealDeep,
  colors.joy.butter,
  colors.primary.tealLight,
  colors.neutral.paleOak,
];

/**
 * Guard util: pastikan lime hanya dipakai di atas dark background.
 * Dipanggil secara konvensi di komponen yang pakai accent.lime.
 */
export function assertLimeOnDarkOnly(bgIsDark: boolean) {
  if (!bgIsDark && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "[design-tokens] accent.lime (#B3FF00) hanya boleh dipakai di atas background gelap (graphite/teal-deep). Jangan di atas putih/cloud."
    );
  }
}
