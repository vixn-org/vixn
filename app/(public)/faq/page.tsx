import { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  ShieldCheck,
  Search,
  Sparkles,
  Compass,
  ChevronRight,
  Flame,
} from "lucide-react";
import FAQAccordion, { FAQItem } from "@/components/public/faq-accordion";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | VIXN",
  description:
    "Find answers to frequently asked questions about VIXN.fun. Learn about video streaming, 4K photo sets, model discovery, safety, and requesting new models.",
  keywords: [
    "vixn faq",
    "frequently asked questions",
    "vixn help",
    "model directory questions",
    "vixn free streaming",
    "vixn guide",
  ],
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | VIXN",
    description:
      "Find answers to frequently asked questions about VIXN.fun. Learn about video streaming, 4K photo sets, model discovery, safety, and requesting new models.",
    url: `${SITE_URL}/faq`,
    siteName: "VIXN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frequently Asked Questions (FAQ) | VIXN",
    description:
      "Frequently Asked Questions and official answers for VIXN.fun.",
  },
};

const faqsList: FAQItem[] = [
  {
    question: "What is Vixn.fun?",
    answer:
      "Vixn.fun is a free online platform where you can watch and explore videos and photos of popular pornstars and adult models in one place.",
    category: "General Overview",
  },
  {
    question: "Is Vixn.fun free to use?",
    answer:
      "Yes, Vixn.fun is completely free to browse and watch. You can enjoy a large collection of videos and photos without creating an account.",
    category: "Access & Pricing",
  },
  {
    question: "How can I find videos of a specific pornstar on Vixn.fun?",
    answer:
      "Simply use the search bar or go to the Models section and type the pornstar’s name. Each star has a dedicated page with all their available videos and photos.",
    category: "Discovery & Search",
  },
  {
    question: "Does Vixn.fun have HD and 4K videos?",
    answer:
      "Yes, most videos on Vixn.fun are available in HD quality, and many popular scenes are also available in higher resolutions.",
    category: "Media Quality",
  },
  {
    question: "Can I download videos from Vixn.fun?",
    answer:
      "Currently, videos are available for online streaming. Download options may be added in the future for premium users.",
    category: "Features & Downloads",
  },
  {
    question: "How often is new content added to Vixn.fun?",
    answer:
      "New videos and model pages are added regularly. Popular and trending pornstars are updated frequently so you always find fresh content.",
    category: "Content Updates",
  },
  {
    question: "Is Vixn.fun safe to use?",
    answer:
      "Yes. Vixn.fun uses secure connections (HTTPS) and does not require personal information to watch videos. We also take content rights seriously.",
    category: "Safety & Privacy",
  },
  {
    question: "Do I need to create an account to watch videos?",
    answer:
      "No. You can watch most content without signing up. Creating an account is optional and only needed if you want to save favorites or access extra features.",
    category: "Accounts & Membership",
  },
  {
    question: "How do I request a specific pornstar or video?",
    answer:
      "You can use the “Request a Model” or contact form available on the website. Popular requests are prioritized.",
    category: "Requests & Community",
  },
  {
    question: "Is Vixn.fun available on mobile?",
    answer:
      "Yes. Vixn.fun is fully mobile-friendly and works smoothly on smartphones and tablets.",
    category: "Mobile & Devices",
  },
];

export default function FAQPage() {
  // Rich Schema.org FAQPage for Google Rich Snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqsList.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // Breadcrumbs Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "FAQ",
        item: `${SITE_URL}/faq`,
      },
    ],
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-10 pb-12 border-b border-slate-100">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Breadcrumbs */}
          <nav className="flex justify-center items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
            <Link href="/" className="hover:text-rose-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900">FAQ</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/60 text-xs font-bold text-rose-700 shadow-2xs mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center &amp; Platform Guidelines</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about browsing, streaming HD/4K videos, creator folders, and platform safety on VIXN.fun.
          </p>

          {/* Quick CTA to Models */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/models"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Compass className="w-4 h-4 text-rose-400" />
              <span>Browse All Models</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Accordion Component with same width as header */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FAQAccordion items={faqsList} />
      </section>
    </div>
  );
}
