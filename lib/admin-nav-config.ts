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
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  restrictedFrom?: ("KEPALA_SEKOLAH" | "OPERATOR" | "GURU")[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Profil Sekolah", href: "/admin/profil", icon: School },
  { label: "Akademik", href: "/admin/akademik", icon: BookOpenText },
  { label: "Guru & Tendik", href: "/admin/guru", icon: Users },
  { label: "Publikasi", href: "/admin/informasi", icon: Newspaper },
  { label: "PPDB", href: "/admin/ppdb", icon: ClipboardList },
  { label: "Layanan", href: "/admin/layanan", icon: ClipboardCheck },
  { label: "Kontak", href: "/admin/kontak", icon: MessagesSquare },
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
