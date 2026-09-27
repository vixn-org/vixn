"use client";

import { useAdminTheme } from "@/components/admin/mui-theme-provider";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const { mode } = useAdminTheme();
  const isDark = mode === "dark";

  return (
    <div
      className={cn(
        "flex h-screen font-sans transition-colors duration-200",
        isDark
          ? "dark admin-dark bg-[#090d16] text-slate-100 selection:bg-rose-500 selection:text-white"
          : "admin-light bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white"
      )}
    >
      <AdminSidebar />
      <main
        className={cn(
          "flex-1 overflow-auto transition-colors duration-200",
          isDark ? "bg-[#090d16]" : "bg-slate-50"
        )}
      >
        <div className="mx-auto max-w-7xl p-6 sm:p-8">{children}</div>
      </main>
      <Toaster position="top-right" theme={mode} />
    </div>
  );
}
