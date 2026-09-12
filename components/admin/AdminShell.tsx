"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export function AdminShell({
  userName,
  role,
  notifCount,
  children,
}: {
  userName: string;
  role: string;
  notifCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-cloud">
      <AdminSidebar
        role={role}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="lg:pl-64">
        <AdminTopbar
          userName={userName}
          role={role}
          notifCount={notifCount}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
