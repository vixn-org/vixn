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
  Flame,
  Globe,
  BookOpen,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useState } from "react";

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

  const role = session?.user?.role || "admin";
  const navItems = allNavItems.filter((item) => !item.adminOnly || role === "admin");

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 shadow-xs",
        collapsed ? "w-[68px]" : "w-[250px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <Link
            href="/admin"
            className="flex items-center"
          >
            <img
              src="/logo.jpg"
              alt="VIXN Admin"
              className="h-8 w-auto object-contain rounded-md"
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-slate-400 hover:text-slate-800 hover:bg-slate-100"
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
                    ? "bg-slate-900 text-white shadow-xs"
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

          <Separator className="my-3 bg-slate-100" />

          {/* Quick link to live site */}
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all",
              collapsed && "justify-center"
            )}
          >
            <Globe className="h-4 w-4 shrink-0" />
            {!collapsed && <span>View Public Site</span>}
          </Link>
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        {!collapsed && session?.user && (
          <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {session.user.email}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0",
                role === "admin"
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
                "w-full justify-start gap-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-medium",
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
