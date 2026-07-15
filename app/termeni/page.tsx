import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { ro } from "@/lib/i18n";

function LegalSection({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[17px] font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted">
        {paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
    </section>
  );
}

export default function TermsPage() {
  const t = ro.legal.terms;
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <MarketingHeader />
      <main className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{ro.legal.termsTitle}</h1>
        <p className="mt-2 text-[13px] text-muted">{ro.legal.lastUpdated}</p>

        <div className="mt-10">
          <LegalSection title="1. Introducere" paragraphs={[t.intro]} />
          <LegalSection title="2. Caracter neoficial" paragraphs={[t.unofficial, t.respect]} />
          <LegalSection title="3. Imagini vehicule" paragraphs={[t.images]} />
          <LegalSection title="4. Date publice" paragraphs={[t.publicData, t.liveData]} />
          <LegalSection title="5. Rapoarte AC" paragraphs={[t.acReports]} />
          <LegalSection title="6. Limitarea răspunderii" paragraphs={[t.liability]} />
        </div>

        <Link href="/" className="mt-8 inline-block text-[14px] font-medium text-accent hover:underline">
         {ro.legal.backHome}
        </Link>
      </main>
      <MarketingFooter />
    </div>
  );
}
