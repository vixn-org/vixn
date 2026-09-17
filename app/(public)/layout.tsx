import Link from "next/link";
import HeaderSearch from "@/components/public/header-search";
import PublicFooter from "@/components/public/footer";
import PublicMuiThemeProvider from "@/components/public/public-mui-theme-provider";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicMuiThemeProvider>
      <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
        {/* Main Header / Navigation - Fixed Transparent Header with Logo */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#090d16]/80 backdrop-blur-xl border-none">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
            >
              <img
                src="/logo.jpg"
                alt="VIXN"
                className="h-8 w-auto object-contain rounded-xl shadow-lg"
              />
            </Link>

            {/* Robust Live Search Bar */}
            <div className="flex-1 flex justify-center max-w-md">
              <HeaderSearch />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/models"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-slate-200 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white transition-all shadow-md border-none cursor-pointer"
              >
                <ExploreRoundedIcon sx={{ fontSize: 16, color: "#f43f5e" }} />
                <span>Explore Models</span>
              </Link>
              <Link
                href="/tag"
                className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors border-none"
              >
                <span>Tags</span>
              </Link>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors border-none"
              >
                <span>Blog</span>
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pt-16">{children}</main>

        {/* SEO-Optimized Luxury Footer */}
        <PublicFooter />
      </div>
    </PublicMuiThemeProvider>
  );
}
