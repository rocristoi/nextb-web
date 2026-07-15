import Link from "next/link";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { NexTBLogo } from "@/components/brand/NexTBLogo";
import { ro } from "@/lib/i18n";

const GITHUB_URL = "https://github.com/rocristoi/nextb-web";

export function MarketingFooter() {
  return (
    <footer className="border-t border-elevated px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <NexTBLogo size="sm" />
            <p className="mt-2 text-[12px] text-muted">
              NexTB Web 2.0.0 · Tracker STB independent pentru București
            </p>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-foreground"
          >
            <GithubLogo className="h-4 w-4" weight="fill" />
            {ro.github.label}
          </a>
        </div>
        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
          <Link href="/termeni" className="transition-colors hover:text-foreground">
            {ro.legal.termsTitle}
          </Link>
          <Link href="/confidentialitate" className="transition-colors hover:text-foreground">
            {ro.legal.privacyTitle}
          </Link>
          <Link href="/app/home" className="transition-colors hover:text-foreground">
            Deschide aplicația
          </Link>
        </nav>
      </div>
    </footer>
  );
}
