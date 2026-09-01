import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AdsterraGlobal from "@/components/ads/adsterra-global";
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
    template: "%s | Hot Girl XXX Videos & Nude Photos | Free HD on Vixn.fun",
    default: "Hot Girl XXX Videos & Nude Photos | Free HD on Vixn.fun",
  },
  description:
    "Watch free hot girl XXX videos, nude photos and sex videos in HD. Explore Indian hot girls, sexy desi girls, college girls and exclusive hot content on Vixn.fun – updated daily.",
  keywords: [
    "models",
    "photo gallery",
    "video gallery",
    "premium models",
    "vixn",
    "model portfolio",
    "hot girl xxx",
    "hot girl xnxx",
    "hot girls",
    "hot girl xxx video",
    "hot girl porn",
    "hot girl sex",
    "hot girl sex video",
    "indian hot girl xxx",
    "hot girl porn video",
    "hot girl fuck",
    "hot sexy girl xxx",
    "indian girls hot videos",
    "hot girl xvideo",
    "hot indian girls nude",
    "hot mallu girls",
    "hot sexy girl photo",
    "kerala hot girls",
    "beautiful hot girl",
    "hot indian girls pics",
    "indian hot girl photo",
    "hot american girls",
    "hot college girls",
    "hot girl bf",
    "hot girl xx",
    "hot girls in bra",
    "hot indian girl porn",
    "hot sexy desi girl",
    "hot sexy girl image",
    "hot sexy girl pic",
    "bengali hot girl",
    "hot girl dp",
    "hot girls without clothes",
    "hot indian college girls",
    "hot indian school girl",
    "hot school girl xxx",
    "hot sexy girl porn",
    "hot sexy nude girls",
    "indian hot girl porn",
    "pakistani hot girl",
    "telugu hot girls",
    "cute hot girls",
    "hot figure girl",
    "hot girl photo dp",
    "hot girl pron",
    "hot girl wallpaper",
    "hot girl xxxx",
    "hot indian desi girl",
    "hot instagram girls",
    "hot sexy girl xnxx",
    "indian girls hot images",
    "indian hot girl xnxx",
    "indian hot girls nude",
    "xxx video hot girls",
    "hot desi girl xxx",
    "hot girl hot sex",
    "hot girl quotes",
    "hot girl x video",
    "hot girls live",
    "hot indian girl xxx",
    "hot sexy school girl",
    "sex with hot girl",
    "desi girl hot photo",
    "desi girl hot pic",
    "desi hot girl sex",
    "desi hot girl xxx",
    "hot girl boobs press",
    "hot girl dance",
    "hot girl mms",
    "hot girl porn hd",
    "hot girl xnxx com",
    "hot girls com",
    "hot girls in panties",
    "hot girls porn",
    "hot girls without dress",
    "hot gym girls",
    "hot indian girls boobs",
    "hot naked indian girls",
    "hot nude girls videos",
    "indian girl hot sex",
    "indian girls hot sex",
    "indian girls hot sex videos",
    "indian hot girl boobs",
    "indian hot girl porn video",
    "indian hot girl xxx video",
    "school girl hot video",
    "tamil girls hot videos",
    "xxx hot girl indian",
    "beautiful girl hot video",
    "brazzers hot girl",
    "chat with hot girls",
    "delhi hot girls",
    "hot arab girls",
    "hot beach girls",
    "hot girl masturbating",
    "hot girl xxx com",
    "hot girls in jeans",
    "hot girls in shorts",
    "hot girls showing boobs",
    "hot indian girl porn video",
    "hot indian girl sex video",
    "spanish hot girls",
    "latina hot girls",
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Adsterra Global Ads (Popunder + Social Bar) */}
        <AdsterraGlobal />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
