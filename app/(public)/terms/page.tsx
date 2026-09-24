import { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Scale, FileText, Ban, ChevronRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: {
    absolute: "Terms of Service & 18+ Agreement | VIXN",
  },
  description:
    "Official Terms of Service and mandatory 18+ User Agreement for VIXN.fun. Review the conditions for streaming hot girl XXX videos, nude photos & model galleries.",
  keywords: [
    "vixn terms of service",
    "18+ adult agreement",
    "adult website terms",
    "vixn user rules",
    "nude media legal terms",
  ],
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: "Terms of Service & 18+ Agreement | VIXN",
    description:
      "Binding terms and 18+ compliance conditions for accessing adult videos and nude model photo sets on VIXN.fun.",
    url: `${SITE_URL}/terms`,
    siteName: "VIXN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | VIXN",
    description: "Terms of service and 18+ legal agreement for VIXN.fun.",
  },
};

export default function TermsPage() {
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    url: `${SITE_URL}/terms`,
    description:
      "Terms of Service governing user access, 18+ age verification, and content display on VIXN.fun.",
    publisher: {
      "@type": "Organization",
      name: "VIXN",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />

      <article className="min-h-screen bg-[#090d16] text-slate-100 pb-20 selection:bg-rose-500 selection:text-white">
        {/* Header Section */}
        <section className="border-b border-white/[0.08] bg-gradient-to-b from-[#111827] via-[#0d1322] to-[#090d16] pt-12 pb-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <Link href="/" className="hover:text-rose-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white">Terms of Service</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
              <Scale className="w-3.5 h-3.5" />
              <span>Mandatory 18+ Legal Agreement</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Terms of Service
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Last Updated &amp; Effective Date: September 24, 2026
            </p>
          </div>
        </section>

        {/* Content Body */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          {/* 1. Mandatory 18+ Age Requirement */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>1. Mandatory 18+ Age Requirement &amp; Adult Consent</span>
            </h2>
            <p className="text-slate-300">
              THIS WEBSITE CONTAINS SEXUALLY EXPLICIT MATERIAL INCLUDING NUDE
              PHOTOS, HARDCORE XXX VIDEOS, STRIPTEASES, ONLYFANS MEDIA, AND
              PORNOGRAPHIC MATERIAL.
            </p>
            <p className="text-slate-300">
              By accessing, browsing, or streaming any media on{" "}
              <strong>VIXN (Vixn.fun)</strong>, you certify and warrant under
              penalty of law that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400 text-xs sm:text-sm">
              <li>
                You are at least eighteen (18) years of age, or the legal age of
                majority in your state, province, or country of residence,
                whichever is greater.
              </li>
              <li>
                Viewing explicit nude photos and sexually explicit adult videos
                is legal in the community, municipality, and jurisdiction from
                which you connect.
              </li>
              <li>
                You are accessing this content voluntarily for personal
                entertainment and do not find depictions of adult sexual
                conduct offensive or unlawful.
              </li>
              <li>
                You will not release, display, or transfer any adult imagery from
                VIXN to minors or individuals under the legal age of majority.
              </li>
            </ul>
          </div>

          {/* 2. Platform Nature and Media Cataloging */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>Platform Purpose &amp; Media Indexing</span>
            </h2>
            <p>
              VIXN operates as an online promotional gallery, biographical
              dossier, and adult discovery index. We aggregate publicly
              circulating photo sets, third-party streaming links, and verified
              creator showcases.
            </p>
            <p>
              All trademarks, creator names, and original copyrights belong
              exclusively to their respective adult models, studios, and content
              creators. If you are an authorized copyright holder or creator who
              wishes to request content removal, refer to our fast-track{" "}
              <Link
                href="/dmca"
                className="text-rose-400 hover:underline font-bold"
              >
                DMCA Notice &amp; Takedown Procedure
              </Link>
              .
            </p>
          </div>

          {/* 3. Prohibited Conduct */}
          <div className="space-y-4 bg-[#0e1424] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Ban className="w-5 h-5 text-rose-500" />
              <span>3. Prohibited Uses &amp; Zero Tolerance Policy</span>
            </h2>
            <p>Users are strictly prohibited from:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400 text-xs sm:text-sm">
              <li>
                <strong className="text-rose-300">Underage Material:</strong>{" "}
                Attempting to request, upload, link, or promote any visual depiction
                of minors (CSAM/CSAE). VIXN reports any detected attempts
                immediately to the National Center for Missing &amp; Exploited
                Children (NCMEC) and federal law enforcement authorities.
              </li>
              <li>
                <strong className="text-rose-300">Non-Consensual Imagery:</strong>{" "}
                Submitting or distributing revenge porn, non-consensual sexual
                content, hidden camera footage, or non-consensual deepfakes.
              </li>
              <li>
                <strong className="text-rose-300">Destructive Crawling:</strong>{" "}
                Executing distributed denial of service (DDoS) attacks,
                exploitative scraping, or automated bandwidth draining that
                degrades 4K streaming performance for other users.
              </li>
              <li>
                <strong className="text-rose-300">Commercial Redistribution:</strong>{" "}
                Selling or repackaging media found on VIXN for paid commercial
                gain without proper authorization from original rights holders.
              </li>
            </ul>
          </div>

          {/* 4. Disclaimer of Warranties */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>Disclaimer of Warranties ("As Is")</span>
            </h2>
            <p>
              VIXN and all associated media, 4K streaming videos, photo galleries,
              and creator descriptions are provided on an{" "}
              <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis
              without warranty of any kind, whether express or implied.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              We do not warrant that video streaming will be error-free,
              uninterrupted, or that third-party video host servers will remain
              permanently available. We reserve the right to remove, edit, or
              restructure any model folder, photo gallery, or video stream at
              any time without prior notice.
            </p>
          </div>

          {/* 5. Limitation of Liability */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                5
              </span>
              <span>Limitation of Liability &amp; Indemnification</span>
            </h2>
            <p>
              In no event shall VIXN, its operators, hosting providers, or
              affiliates be liable for any direct, indirect, incidental,
              consequential, or punitive damages arising from your access to,
              use of, or inability to use this adult entertainment platform.
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              You agree to defend, indemnify, and hold harmless VIXN and its
              operators from any claims, liabilities, losses, or legal expenses
              resulting from your violation of these Terms of Service or your
              breach of the 18+ age warranty.
            </p>
          </div>

          {/* 6. Governing Law & Updates */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs font-black">
                6
              </span>
              <span>Governing Law &amp; Revisions</span>
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance
              with applicable international commercial laws. We reserve the right
              to update these terms periodically. Continued use of VIXN following
              the publication of modified terms constitutes your binding acceptance.
            </p>
          </div>

          {/* Cross Link Notice */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-2 text-xs sm:text-sm">
            <h3 className="font-bold text-white">Related Legal Policies</h3>
            <p className="text-slate-400">
              Please review our supplementary legal documentation:{" "}
              <Link href="/privacy" className="text-rose-400 hover:underline">
                Privacy Policy
              </Link>
              ,{" "}
              <Link href="/dmca" className="text-rose-400 hover:underline">
                DMCA Copyright Policy
              </Link>
              ,{" "}
              <Link href="/2257" className="text-rose-400 hover:underline">
                18 U.S.C. § 2257 Notice
              </Link>
              , and{" "}
              <Link href="/impressum" className="text-rose-400 hover:underline">
                Impressum
              </Link>
              .
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
