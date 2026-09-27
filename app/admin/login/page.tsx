"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Mail, ArrowLeft, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("vixn_admin_theme");
    if (saved === "light") {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("vixn_admin_theme", next ? "dark" : "light");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please verify and try again.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200",
        isDark ? "bg-[#090d16] text-slate-100" : "bg-slate-50 text-slate-900"
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          "absolute inset-0 [background-size:24px_24px]",
          isDark
            ? "bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] opacity-30"
            : "bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] opacity-40"
        )}
      />

      <Link
        href="/"
        className={cn(
          "absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold transition-all px-3.5 py-2 rounded-full border shadow-sm",
          isDark
            ? "text-slate-300 hover:text-white bg-[#0f1422] border-white/[0.08] hover:bg-white/[0.08]"
            : "text-slate-500 hover:text-slate-900 bg-white border-slate-200"
        )}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Website
      </Link>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        type="button"
        className={cn(
          "absolute top-6 right-6 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer",
          isDark
            ? "bg-[#0f1422] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]"
            : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
        )}
      >
        {isDark ? (
          <>
            <Moon className="w-3.5 h-3.5 text-rose-400" />
            <span>Dark</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </>
        )}
      </button>

      <Card
        className={cn(
          "relative w-full max-w-md shadow-2xl rounded-3xl transition-colors duration-200",
          isDark
            ? "border-white/[0.08] bg-[#0f1422] text-slate-100"
            : "border-slate-200 bg-white text-slate-900"
        )}
      >
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <img
              src="/logo.jpg"
              alt="VIXN"
              className="h-12 w-auto object-contain rounded-xl shadow-lg"
            />
          </div>
          <CardTitle
            className={cn(
              "text-2xl font-black",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Admin Portal
          </CardTitle>
          <CardDescription
            className={cn(
              "text-sm mt-1",
              isDark ? "text-slate-400" : "text-slate-500"
            )}
          >
            Sign in to manage model routes, media sets, and SEO tags
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 text-xs font-semibold",
                  isDark
                    ? "border-red-500/30 bg-red-950/40 text-red-300"
                    : "border-red-200 bg-red-50 text-red-600"
                )}
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className={cn(
                  "text-xs font-bold",
                  isDark ? "text-slate-300" : "text-slate-700"
                )}
              >
                Admin Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@vixn.fun"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "pl-10 rounded-xl transition-all",
                    isDark
                      ? "border-white/[0.1] bg-white/[0.04] text-white placeholder:text-slate-500 focus:bg-white/[0.08] focus:border-rose-500"
                      : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                  )}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className={cn(
                  "text-xs font-bold",
                  isDark ? "text-slate-300" : "text-slate-700"
                )}
              >
                Security Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "pl-10 rounded-xl transition-all",
                    isDark
                      ? "border-white/[0.1] bg-white/[0.04] text-white placeholder:text-slate-500 focus:bg-white/[0.08] focus:border-rose-500"
                      : "border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                  )}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full mt-2 font-bold rounded-xl py-2.5 shadow-md transition-all cursor-pointer border-none",
                isDark
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Authenticating...
                </span>
              ) : (
                "Access Admin Panel"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
