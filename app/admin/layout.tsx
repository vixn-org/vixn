import { SessionProvider } from "next-auth/react";
import AdminMuiThemeProvider from "@/components/admin/mui-theme-provider";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminMuiThemeProvider>
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </AdminMuiThemeProvider>
    </SessionProvider>
  );
}
