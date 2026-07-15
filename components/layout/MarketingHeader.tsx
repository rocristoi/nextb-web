"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { NexTBLogo } from "@/components/brand/NexTBLogo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-elevated bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-[3.75rem] max-w-5xl items-center gap-4 px-5">
        <Link href="/" className="shrink-0">
          <NexTBLogo size="md" />
        </Link>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle compact />
          <Link
            href="/app/home"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-5 py-2.5 text-[14px] font-semibold text-background transition-opacity hover:opacity-90"
          >
            Deschide aplicația
            <ArrowRight className="h-4 w-4 shrink-0" weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}
