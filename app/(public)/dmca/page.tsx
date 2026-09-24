import { Metadata } from "next";
import Link from "next/link";
import { FileCheck, ShieldAlert, Mail, Send, ChevronRight, CheckCircle } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: {
    absolute: "DMCA Notice & Copyright Takedown Policy | VIXN",
  },
  description:
    "Official DMCA Notice and Copyright Infringement Takedown Policy for VIXN.fun. Fast, compliant notice-and-takedown procedure for adult models, creators, and studios.",
  keywords: [
    "vixn dmca",
    "copyright takedown vixn",
    "onlyfans content removal",
    "adult model copyright",
    "dmca agent vixn",
    "17 usc 512",
  ],
  alternates: {
    canonical: `${SITE_URL}/dmca`,
  },
  openGraph: {
    title: "DMCA Notice & Copyright Takedown Policy | VIXN",
    description:
      "VIXN respects intellectual property rights. Review our 17 U.S.C. § 512(c) fast-track takedown instructions for copyright owners and models.",
    url: `${SITE_URL}/dmca`,
    siteName: "VIXN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DMCA Copyright Policy | VIXN",
    description: "Official DMCA copyright takedown instructions for VIXN.fun.",
  },
};

export default function DmcaPage() {
  const dmcaSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DMCA Copyright Policy",
    url: `${SITE_URL}/dmca`,
    description:
      "Digital Millennium Copyright Act (DMCA) notice and takedown policy for VIXN.fun.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dmcaSchema) }}
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
              <span className="text-white">DMCA Copyright Policy</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
              <FileCheck className="w-3.5 h-3.5" />
              <span>17 U.S.C. § 512(c) Notice &amp; Takedown Procedure</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              DMCA Copyright Policy
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Last Updated &amp; Effective Date: September 24, 2026
            </p>
          </div>
        </section>

        {/* Content Body */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          {/* Overview */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Commitment to Intellectual Property Rights
            </h2>
            <p>
              <strong>VIXN (Vixn.fun)</strong> respects the intellectual property
              rights of content creators, adult models, photographers, OnlyFans
              producers, and commercial studios. We operate in full compliance
              with the United States Digital Millennium Copyright Act of 1998
              (Title 17, United States Code, Section 512).
            </p>
            <p>
              VIXN operates as an online directory and media gallery hosting
              publicly circulating adult material, promotional sets, and
              user-submitted links. Upon receipt of a valid, formal takedown
              notification that satisfies the statutory criteria of 17 U.S.C.
              § 512(c)(3), VIXN expeditiously removes or disables access to the
              specified nude photos, 4K XXX video clips, or leaked media files.
            </p>
          </div>

          {/* Required Elements of a Notice */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Required Information for a Valid DMCA Notice</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              To guarantee prompt processing, your written DMCA notification must
              contain all six (6) statutory elements listed below:
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">1. Physical or Electronic Signature:</strong>{" "}
                  A physical or electronic signature of the copyright owner or a
                  person authorized to act on behalf of the owner of the exclusive
                  right allegedly infringed.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">2. Identification of the Work:</strong>{" "}
                  Clear identification of the copyrighted work claimed to have been
                  infringed (e.g., link to original OnlyFans post, official studio
                  release, or photo registration number).
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">3. Exact URLs on VIXN:</strong>{" "}
                  Exact, specific URLs on VIXN.fun where the infringing adult
                  video clip or nude photo is located (e.g.{" "}
                  <code className="text-rose-300 font-mono text-[11px] bg-white/[0.06] px-1 py-0.5 rounded">
                    https://vixn.fun/model/[slug]/video/[id]
                  </code>
                  ). Generic statements like "all videos of model X" are legally
                  insufficient under § 512.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">4. Contact Details:</strong>{" "}
                  Information reasonably sufficient to permit VIXN to contact the
                  complaining party, including a legal name, mailing address,
                  telephone number, and active email address.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">5. Good Faith Statement:</strong>{" "}
                  A statement that the complaining party has a good faith belief
                  that use of the material in the manner complained of is not
                  authorized by the copyright owner, its agent, or the law.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">6. Perjury &amp; Authority Statement:</strong>{" "}
                  A statement that the information in the notification is
                  accurate, and under penalty of perjury, that the complaining
                  party is authorized to act on behalf of the owner of an
                  exclusive right that is allegedly infringed.
                </div>
              </div>
            </div>
          </div>

          {/* Designated Copyright Agent */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-rose-400" />
              <span>Designated Copyright Agent Notice Details</span>
            </h2>
            <p>
              Please transmit formal DMCA notifications directly to our designated
              agent via electronic mail:
            </p>

            <div className="bg-[#070a11] rounded-xl p-5 font-mono text-xs sm:text-sm text-slate-300 space-y-2 border border-white/[0.06]">
              <p>
                <strong className="text-white">Designated DMCA Agent:</strong> VIXN
                Copyright Compliance
              </p>
              <p>
                <strong className="text-white">Direct Email:</strong>{" "}
                <span className="text-rose-400 font-bold">dmca@vixn.fun</span>
              </p>
              <p>
                <strong className="text-white">Entity / Operator:</strong>{" "}
                VIXN Platform Operator {/* REPLACE WITH REAL LEGAL ENTITY */}
              </p>
              <p>
                <strong className="text-white">Mailing Address:</strong>{" "}
                Attn: DMCA Copyright Agent, Suite 400, Legal Department, International Media Center {/* REPLACE WITH REAL LEGAL ADDRESS */}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Note: Emailing dmca@vixn.fun produces the fastest turnaround time
              (typically within 24–48 business hours). Please ensure all exact
              media URLs are listed in the body of your message.
            </p>
          </div>

          {/* Counter-Notification Procedure */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Counter-Notification Procedure
            </h2>
            <p>
              If a content provider or model believes that material removed from
              VIXN was the result of mistake, misidentification, or fair use,
              they may submit a Counter-Notification pursuant to 17 U.S.C.
              § 512(g)(2) &amp; (3).
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              The counter-notice must include the provider's physical signature,
              identification of the removed adult video or photo URL, a statement
              under penalty of perjury that the material was removed by mistake,
              and consent to federal court jurisdiction. If a valid counter-notice
              is received, VIXN forwards it to the original complaining party.
            </p>
          </div>

          {/* Repeat Infringer Policy */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Repeat Infringer Policy
            </h2>
            <p>
              In accordance with Section 512(i)(1)(A) of the DMCA, VIXN enforces
              a strict repeat infringer policy. We will terminate access, crawl
              tokens, or user submission privileges of any individual or source
              determined to be repeatedly infringing copyrighted adult material.
            </p>
          </div>

          {/* Cross-navigation links */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <span>Related Legal Documents:</span>
            <Link href="/terms" className="text-rose-400 hover:underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="text-rose-400 hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/2257" className="text-rose-400 hover:underline">
              18 U.S.C. § 2257
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
