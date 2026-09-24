import { Metadata } from "next";
import Link from "next/link";
import { Building2, ShieldAlert, Mail, FileText, ChevronRight, Globe } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vixn.fun";

export const metadata: Metadata = {
  title: {
    absolute: "Impressum | Legal Notice & Platform Imprint | VIXN",
  },
  description:
    "Official Legal Notice and Impressum for VIXN.fun pursuant to § 5 TMG, § 18 MStV and EU Digital Services Act regulations. Operator details and adult content youth protection disclosures.",
  keywords: [
    "vixn impressum",
    "vixn legal notice",
    "tmg 5 impressum",
    "youth protection adult",
    "vixn operator",
  ],
  alternates: {
    canonical: `${SITE_URL}/impressum`,
  },
  openGraph: {
    title: "Impressum | Legal Notice & Imprint | VIXN",
    description:
      "Statutory information provider disclosures pursuant to German and EU telemedia regulations for VIXN.fun.",
    url: `${SITE_URL}/impressum`,
    siteName: "VIXN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Impressum | VIXN",
    description: "Official statutory legal notice and operator details for VIXN.fun.",
  },
};

export default function ImpressumPage() {
  const impressumSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Impressum (Legal Notice)",
    url: `${SITE_URL}/impressum`,
    description:
      "Statutory disclosure of website operators, regulatory information, and adult content compliance for VIXN.fun.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(impressumSchema) }}
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
              <span className="text-white">Impressum</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
              <Globe className="w-3.5 h-3.5" />
              <span>§ 5 TMG &amp; § 18 MStV Compliance Disclosure</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Impressum (Legal Notice)
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Angaben gemäß § 5 Telemediengesetz (TMG) &amp; § 18 Medienstaatsvertrag (MStV)
            </p>
          </div>
        </section>

        {/* Content Body */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-10 space-y-12 text-sm sm:text-base text-slate-300 leading-relaxed">
          {/* Service Provider Identification */}
          <div className="bg-[#0e1424] border border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-rose-400" />
              <span>Diensteanbieter / Service Provider</span>
            </h2>

            <div className="text-slate-300 space-y-2 text-sm sm:text-base">
              <p>
                <strong>Plattform-Betreiber / Platform Operator:</strong>
                <br />
                {/* REPLACE WITH REAL LEGAL ENTITY */}
                VIXN Digital Media Operations Ltd.
              </p>
              <p>
                <strong>Unternehmenssitz / Registered Address:</strong>
                <br />
                {/* REPLACE WITH REAL LEGAL ADDRESS */}
                Suite 502, Horizon Tower, Media City Commercial District, PO Box 94022
              </p>
              <p>
                <strong>Handelsregisternummer / Commercial Register ID:</strong>
                <br />
                {/* REPLACE WITH REGISTER NUMBER */}
                HE 482019 / Register of Companies
              </p>
              <p>
                <strong>Vertretungsberechtigte Person / Authorized Representative:</strong>
                <br />
                {/* REPLACE WITH MANAGING DIRECTOR */}
                Managing Director of Digital Content &amp; Compliance
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-rose-400" />
              <span>Kontakt / Electronic Contact</span>
            </h2>
            <div className="bg-[#0e1424] border border-white/[0.06] rounded-xl p-5 space-y-2 text-sm font-mono text-slate-300">
              <p>
                <strong>Allgemeine rechtliche Anfragen / Legal:</strong>{" "}
                <span className="text-rose-400">legal@vixn.fun</span>
              </p>
              <p>
                <strong>Datenschutz &amp; DSGVO / Privacy:</strong>{" "}
                <span className="text-rose-400">privacy@vixn.fun</span>
              </p>
              <p>
                <strong>Urheberrecht &amp; DMCA / Copyright:</strong>{" "}
                <span className="text-rose-400">dmca@vixn.fun</span>
              </p>
            </div>
          </div>

          {/* Responsible for Content */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-rose-400" />
              <span>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</span>
            </h2>
            <p>
              Verantwortlich für redaktionelle Inhalte und Modell-Archive:
              <br />
              {/* REPLACE WITH EDITORIAL LEAD */}
              Editorial Management &amp; Content Operations, VIXN Media, Suite 502, Horizon Tower.
            </p>
          </div>

          {/* Jugendschutz / Youth Protection */}
          <div className="bg-rose-950/25 border border-rose-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Jugendschutzbeauftragter / Youth Protection Notice</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dieses Online-Angebot enthält <strong>pornografische Inhalte</strong>{" "}
              (nicht-jugendfreie Inhalte, Nacktfotos, erotische Model-Galerien
              und XXX-Videos) und richtet sich ausschließlich an Personen ab 18
              Jahren. Wir unterstützen anerkannte Jugendschutz-Filter (z.B.
              RTA - Restricted to Adults und age.de/FSM-Spezifikationen).
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Fragen oder Hinweise bezüglich des Jugendschutzes richten Sie bitte an
              unseren Jugendschutzbeauftragten:
              <br />
              <strong className="text-white">Email:</strong>{" "}
              <span className="text-rose-400 font-mono">compliance@vixn.fun</span>
            </p>
          </div>

          {/* EU Online Dispute Resolution */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              EU-Streitschlichtung / Online Dispute Resolution
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-400 hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              .<br />
              Wir sind nicht verpflichtet und nicht bereit, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </div>

          {/* Haftung für Inhalte & Links */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Haftung für Inhalte und Links
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte
              auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
              Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen.
              Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir
              diese Inhalte umgehend entfernen.
            </p>
          </div>

          {/* Cross-navigation links */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <span>Rechtliche Dokumente:</span>
            <Link href="/terms" className="text-rose-400 hover:underline">
              Nutzungsbedingungen (Terms)
            </Link>
            <span>•</span>
            <Link href="/privacy" className="text-rose-400 hover:underline">
              Datenschutzerklärung (Privacy)
            </Link>
            <span>•</span>
            <Link href="/2257" className="text-rose-400 hover:underline">
              Jugendschutz &amp; § 2257
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
