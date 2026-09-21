import {
  LayoutDashboard,
  School,
  BookOpenText,
  Users,
  Newspaper,
  ClipboardList,
  ClipboardCheck,
  MessagesSquare,
  Settings,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Role yang TIDAK boleh mengakses menu ini. Kosong = semua role boleh. */
  restrictedFrom?: ("KEPALA_SEKOLAH" | "OPERATOR" | "GURU")[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Profil Manager", href: "/admin/profil", icon: School },
  { label: "Akademik Manager", href: "/admin/akademik", icon: BookOpenText },
  { label: "Guru Manager", href: "/admin/guru", icon: Users },
  { label: "Informasi Manager", href: "/admin/informasi", icon: Newspaper },
  { label: "PPDB Manager", href: "/admin/ppdb", icon: ClipboardList },
  { label: "Layanan Manager", href: "/admin/layanan", icon: ClipboardCheck },
  { label: "Kontak Manager", href: "/admin/kontak", icon: MessagesSquare },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
    restrictedFrom: ["GURU"],
  },
];

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  KEPALA_SEKOLAH: "Kepala Sekolah",
  OPERATOR: "Operator",
  GURU: "Guru",
};
