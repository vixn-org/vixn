import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="mx-auto max-w-7xl p-6 sm:p-8">{children}</div>
        </main>
        <Toaster position="top-right" theme="light" />
      </div>
    </SessionProvider>
  );
}
