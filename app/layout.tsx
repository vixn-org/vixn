import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PopunderAds from "@/components/public/popunder-ads";
import FloatingBanner from "@/components/public/floating-banner";
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/seo";
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
    default: "VIXN - Hot Girl XXX Videos & Nude Photos | Free HD",
  },
  description:
    "Watch free hot girl XXX videos, nude photos and sex clips in HD. Explore Indian hot girls, desi models and exclusive adult content on VIXN, updated daily.",
  keywords: [
    "vixn",
    "model gallery",
    "photo gallery",
    "video gallery",
    "HD photos",
    "4K videos",
    "model portfolio",
    "adult models",
    "free videos",
    "nude photos",
    "hot girls",
    "pornstar videos",
  ],
  openGraph: {
    type: "website",
    siteName: "VIXN",
    url: SITE_URL,
    title: "VIXN - Premium Model Gallery",
    description:
      "Discover exclusive photo galleries and video collections of premium models on VIXN.",
    images: [
      {
        url: `${SITE_URL}/logo.jpg`,
        width: 1200,
        height: 630,
        alt: "VIXN - Hot Girl XXX Videos & Nude Photos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIXN - Premium Model Gallery",
    description:
      "Discover exclusive photo galleries and video collections of premium models on VIXN.",
    images: [`${SITE_URL}/logo.jpg`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
    other: {
      "msvalidate.01": "586BF667B67DA1F9353F02F88B1C80C6",
    },
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const websiteJsonLd = generateWebsiteJsonLd();
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <FloatingBanner />
        <PopunderAds />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
