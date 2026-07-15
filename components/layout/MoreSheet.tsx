"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GearSix,
  Snowflake,
  MagnifyingGlass,
  ChartBar,
  X,
  DotsThree,
} from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { ro } from "@/lib/i18n";

const moreLinks = [
  { href: "/app/settings", label: ro.nav.settings, icon: GearSix },
  { href: "/app/faulty", label: ro.nav.faultyAc, icon: Snowflake },
  { href: "/app/lookup", label: ro.nav.lookup, icon: MagnifyingGlass },
  { href: "/app/fleet", label: ro.nav.fleetStats, icon: ChartBar },
];

export function MoreSheet() {
  const pathname = usePathname();
  const isMoreActive = moreLinks.some((l) => pathname.startsWith(l.href));

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors lg:hidden",
            isMoreActive ? "text-foreground" : "text-muted hover:text-foreground"
          )}
        >
          <DotsThree className="h-5 w-5" weight={isMoreActive ? "fill" : "regular"} />
          <span className="max-w-[60px] truncate">{ro.nav.more}</span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[70dvh] flex-col rounded-t-3xl bg-background pb-[env(safe-area-inset-bottom)]">
          <div className="flex shrink-0 justify-center pb-1 pt-3">
            <div className="h-1 w-10 rounded-full bg-elevated-2" />
          </div>
          <div className="flex items-center justify-between px-5 pb-3">
            <Drawer.Title className="text-[17px] font-bold">{ro.nav.more}</Drawer.Title>
            <Drawer.Close asChild>
              <button type="button" className="rounded-lg p-1 text-muted hover:text-foreground" aria-label={ro.station.close}>
                <X className="h-5 w-5" />
              </button>
            </Drawer.Close>
          </div>
          <nav className="flex flex-col gap-1 px-3 pb-6">
            {moreLinks.map((link) => (
              <Drawer.Close asChild key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-elevated text-foreground"
                      : "text-muted hover:bg-elevated hover:text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5" weight={pathname.startsWith(link.href) ? "fill" : "regular"} />
                  {link.label}
                </Link>
              </Drawer.Close>
            ))}
          </nav>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export function MoreNavDesktop() {
  const pathname = usePathname();

  return (
    <div className="mt-4 border-t border-elevated pt-4">
      <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wide text-muted">
        {ro.nav.more}
      </p>
      {moreLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
            pathname.startsWith(link.href)
              ? "text-foreground"
              : "text-muted hover:text-foreground"
          )}
        >
          {pathname.startsWith(link.href) && (
            <span className="absolute inset-0 rounded-xl bg-elevated" />
          )}
          <link.icon className="relative h-[18px] w-[18px]" weight={pathname.startsWith(link.href) ? "fill" : "regular"} />
          <span className="relative">{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
