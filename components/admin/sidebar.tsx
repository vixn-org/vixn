"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  BookOpen,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useAdminTheme } from "@/components/admin/mui-theme-provider";

const allNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    title: "Models Management",
    href: "/admin/models",
    icon: Users,
    adminOnly: false,
  },
  {
    title: "Search SEO & Tags",
    href: "/admin/search-seo",
    icon: Search,
    adminOnly: true,
  },
  {
    title: "Blog & SEO Articles",
    href: "/admin/blogs",
    icon: BookOpen,
    adminOnly: true,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const { mode, toggleMode } = useAdminTheme();
  const isDark = mode === "dark";

  const role = session?.user?.role || "admin";
  const navItems = allNavItems.filter((item) => !item.adminOnly || role === "admin");

  return (
    <aside
      className={cn(
        "flex h-screen flex-col transition-all duration-300 shadow-sm shrink-0",
        collapsed ? "w-[68px]" : "w-[250px]",
        isDark
          ? "border-r border-white/[0.08] bg-[#0b0f19] text-slate-200"
          : "border-r border-slate-200 bg-white text-slate-800"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center justify-between px-4 border-b",
          isDark ? "border-white/[0.06]" : "border-slate-100"
        )}
      >
        {!collapsed && (
          <Link href="/admin" className="flex items-center">
            <img
              src="/logo.jpg"
              alt="VIXN Admin"
              className="h-8 w-auto object-contain rounded-md shadow-sm"
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8 transition-colors",
            isDark
              ? "text-slate-400 hover:text-white hover:bg-white/[0.08]"
              : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? isDark
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-bold"
                      : "bg-slate-900 text-white shadow-xs font-bold"
                    : isDark
                    ? "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}

          <Separator
            className={cn("my-3", isDark ? "bg-white/[0.08]" : "bg-slate-100")}
          />

          {/* Quick link to live site */}
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              isDark
                ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                : "text-rose-600 hover:bg-rose-50",
              collapsed && "justify-center"
            )}
          >
            <Globe className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View Public Site</span>}
          </Link>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div
        className={cn(
          "border-t p-3 space-y-2",
          isDark ? "border-white/[0.08]" : "border-slate-100"
        )}
      >
        {/* Dark / Light Mode Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={toggleMode}
              type="button"
              className={cn(
                "w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all border",
                isDark
                  ? "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:text-white"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                collapsed && "justify-center px-0 py-2.5"
              )}
            >
              <div className="flex items-center gap-2.5">
                {isDark ? (
                  <Moon className="h-4 w-4 text-rose-400 shrink-0" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                {!collapsed && <span>{isDark ? "Dark Theme" : "Light Theme"}</span>}
              </div>
              {!collapsed && (
                <span
                  className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md",
                    isDark
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-slate-200 text-slate-700"
                  )}
                >
                  {isDark ? "Dark" : "Light"}
                </span>
              )}
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">
              Switch to {isDark ? "Light Mode" : "Dark Mode"}
            </TooltipContent>
          )}
        </Tooltip>

        {!collapsed && session?.user && (
          <div
            className={cn(
              "px-2.5 py-2 rounded-xl border flex items-center justify-between",
              isDark
                ? "bg-[#0f1422] border-white/[0.08]"
                : "bg-slate-50 border-slate-100"
            )}
          >
            <div className="truncate mr-2">
              <p
                className={cn(
                  "text-xs font-semibold truncate",
                  isDark ? "text-slate-300" : "text-slate-800"
                )}
              >
                {session.user.email}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0",
                isDark
                  ? "bg-rose-950/60 text-rose-300 border-rose-800/50"
                  : role === "admin"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              )}
            >
              {role}
            </Badge>
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className={cn(
                "w-full justify-start gap-3 rounded-xl font-medium transition-colors",
                isDark
                  ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  : "text-slate-500 hover:text-rose-600 hover:bg-rose-50",
                collapsed && "justify-center px-0"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Sign Out</TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
