import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Menampilkan logo sekolah dari `School.logoUrl` (diatur admin di
 * Pengaturan > Data Sekolah). Kalau belum ada logo yang diunggah,
 * fallback ke ikon GraduationCap supaya tetap terlihat rapi.
 */
export function SchoolLogo({
  logoUrl,
  alt,
  size = 44,
  className,
  iconClassName,
}: {
  logoUrl: string | null;
  alt: string;
  size?: number;
  className?: string;
  iconClassName?: string;
}) {
  if (logoUrl) {
    return (
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full bg-white",
          className
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-contain p-1"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-teal-deep text-white",
        className
      )}
      style={{ width: size, height: size }}
    >
      <GraduationCap className={cn("h-1/2 w-1/2", iconClassName)} strokeWidth={2} />
    </span>
  );
}
