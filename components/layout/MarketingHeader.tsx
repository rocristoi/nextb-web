"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { NexTBLogo } from "@/components/brand/NexTBLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ro } from "@/lib/i18n";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-elevated bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4 sm:h-[3.75rem] sm:gap-4 sm:px-5">
        <Link href="/" className="min-w-0 shrink-0">
          <NexTBLogo size="md" />
        </Link>
        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle />
          <Link
            href="/app/home"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 text-[13px] font-semibold text-background transition-opacity hover:opacity-90 sm:gap-2 sm:px-5 sm:text-[14px]"
          >
            <span className="sm:hidden">{ro.marketing.openAppShort}</span>
            <span className="hidden sm:inline">{ro.marketing.openApp}</span>
            <ArrowRight className="h-4 w-4 shrink-0" weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}
