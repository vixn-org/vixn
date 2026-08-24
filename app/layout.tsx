import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | VIXN",
    default: "VIXN - Premium Model Gallery",
  },
  description:
    "Discover exclusive photo galleries and video collections of premium models on VIXN. High-quality content curated for you.",
  keywords: [
    "models",
    "photo gallery",
    "video gallery",
    "premium models",
    "vixn",
    "model portfolio",
  ],
  openGraph: {
    type: "website",
    siteName: "VIXN",
    url: SITE_URL,
    title: "VIXN - Premium Model Gallery",
    description:
      "Discover exclusive photo galleries and video collections of premium models on VIXN.",
  },
  twitter: {
    card: "summary_large_image",
    title: "VIXN - Premium Model Gallery",
    description:
      "Discover exclusive photo galleries and video collections of premium models on VIXN.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.jpg" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
