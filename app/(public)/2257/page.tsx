import { Metadata } from "next";
import Link from "next/link";
import { Scale, ShieldCheck, FileCheck2, AlertOctagon, ChevronRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: {
    absolute: "18 U.S.C. § 2257 Record-Keeping Compliance Statement | VIXN",
  },
  description:
    "Official 18 U.S.C. § 2257 Compliance Statement for VIXN.fun. Verification that all models and adult performers depicted in nude photo sets and XXX video media are 18+ years of age.",
  keywords: [
    "18 usc 2257",
    "2257 compliance statement",
    "vixn 2257",
    "adult model age verification",
    "28 cfr 75 record keeping",
  ],
  alternates: {
    canonical: `${SITE_URL}/2257`,
  },
  openGraph: {
    title: "18 U.S.C. § 2257 Compliance Statement | VIXN",
    description:
      "Federal record-keeping compliance statement for adult media and nude galleries hosted on VIXN.fun.",
    url: `${SITE_URL}/2257`,
    siteName: "VIXN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "18 U.S.C. § 2257 Statement | VIXN",
    description: "Official federal age-verification statement for VIXN.fun.",
  },
};

export default function Compliance2257Page() {
  const complianceSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "18 U.S.C. 2257 Compliance Notice",
    url: `${SITE_URL}/2257`,
    description:
      "Statutory notice regarding age verification and record keeping under 18 U.S.C. § 2257 for adult entertainment content on VIXN.fun.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(complianceSchema) }}
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
              <span className="text-white">18 U.S.C. § 2257 Statement</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
              <Scale className="w-3.5 h-3.5" />
              <span>Federal Statutory Age Verification Disclosure</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              18 U.S.C. § 2257 Record-Keeping Compliance
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Title 18 U.S.C. § 2257 and 28 C.F.R. Part 75 Compliance Statement
            </p>
          </div>
        </section>

        {/* Content Body */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          {/* Statutory Age Affirmation */}
          <div className="bg-rose-950/25 border border-rose-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <span>Mandatory Adult Age Verification Affirmation</span>
            </h2>
            <p className="text-slate-200 font-medium">
              ALL MODELS, ACTORS, PERFORMERS, AND OTHER PERSONS DEPICTED IN
              SEXUALLY EXPLICIT CONDUCT, NUDE PHOTOS, ONLYFANS MEDIA, AND XXX
              VIDEOS ON VIXN (VIXN.FUN) WERE AT LEAST EIGHTEEN (18) YEARS OF AGE
              AT THE TIME OF THE CREATION OF THE VISUAL DEPICTION.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              VIXN strictly opposes and condemns child sexual abuse material
              (CSAM/CSAE). Any attempt to submit, index, or distribute imagery
              depicting persons under the age of 18 is subject to immediate
              account termination, IP banning, and reporting to the National Center
              for Missing &amp; Exploited Children (NCMEC) and relevant federal law
              enforcement agencies.
            </p>
          </div>

          {/* Secondary Transmitter Statement */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileCheck2 className="w-5 h-5 text-rose-400" />
              <span>Secondary Transmitter &amp; Gallery Aggregator Exemption</span>
            </h2>
            <p>
              VIXN is a <strong>secondary transmitter</strong>, indexer, and
              promotional digital gallery. With respect to visual depictions of
              sexually explicit conduct appearing on this website, VIXN is not the
              "primary producer" as defined under Title 18 U.S.C. § 2257 and 28
              C.F.R. Part 75.
            </p>
            <p>
              The original records required pursuant to 18 U.S.C. § 2257 and 28
              C.F.R. Part 75—including government-issued photo identification, age
              verification documents, and name cross-references—are maintained by
              the respective primary producers, studios, or content syndication
              partners who produced, authored, or originally commissioned the
              visual media.
            </p>
          </div>

          {/* Custodian of Records Reference */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Custodian of Records &amp; Inspection Inquiries
            </h2>
            <p className="text-sm text-slate-300">
              For content produced by or licensed through third-party adult
              studios, record-keeping documentation is maintained at the physical
              locations designated by the primary producers:
            </p>

            <div className="bg-[#070a11] rounded-xl p-5 font-mono text-xs sm:text-sm text-slate-300 space-y-2 border border-white/[0.06]">
              <p>
                <strong className="text-white">Designated Custodian:</strong>{" "}
                Records Custodian Department {/* REPLACE WITH CUSTODIAN DETAILS */}
              </p>
              <p>
                <strong className="text-white">Operator:</strong> VIXN Digital
                Media {/* REPLACE WITH REAL ENTITY */}
              </p>
              <p>
                <strong className="text-white">Inspection Location:</strong>{" "}
                Suite 502, Horizon Tower, Media City Commercial District {/* REPLACE WITH CUSTODIAN ADDRESS */}
              </p>
              <p>
                <strong className="text-white">Compliance Inquiries:</strong>{" "}
                <span className="text-rose-400 font-bold">compliance@vixn.fun</span>
              </p>
            </div>

            <p className="text-xs text-slate-500">
              To request primary producer information for any specific video or
              photo set hosted or indexed on VIXN, please email compliance@vixn.fun
              with the exact URL of the material.
            </p>
          </div>

          {/* User Submitted & Creator Leaks Notice */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
              <span>Independent Creator &amp; Model Submissions</span>
            </h2>
            <p>
              Content creators, OnlyFans models, and third-party uploaders who
              submit promotional photos, videos, or previews to VIXN must warrant
              and certify that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-400 text-xs sm:text-sm">
              <li>
                All individuals appearing in the submitted material were at least
                18 years old at the moment of recording or filming.
              </li>
              <li>
                The uploader maintains full, legally verifiable documentation
                complying with 18 U.S.C. § 2257.
              </li>
              <li>
                Any submission found to lack verifiable 18+ documentation is
                summarily deleted and permanently blacklisted.
              </li>
            </ul>
          </div>

          {/* Cross-navigation links */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <span>Related Legal Documents:</span>
            <Link href="/terms" className="text-rose-400 hover:underline">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/dmca" className="text-rose-400 hover:underline">
              DMCA Copyright Policy
            </Link>
            <span>•</span>
            <Link href="/privacy" className="text-rose-400 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
