"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapTrifold,
  Bus,
  Bell,
  House,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ro } from "@/lib/i18n";
import { useAlerts } from "@/lib/hooks/useApi";
import { ThemeToggle } from "./ThemeToggle";
import { MoreSheet, MoreNavDesktop } from "./MoreSheet";
import { linesWithActiveAlerts } from "@/lib/alerts/helpers";
import { useRoutes } from "@/lib/hooks/useApi";
import { NexTBLogo } from "../brand/NexTBLogo";

const tabs = [
  { href: "/app/home", label: ro.nav.home, icon: House },
  { href: "/app/map", label: ro.nav.map, icon: MapTrifold },
  { href: "/app/lines", label: ro.nav.lines, icon: Bus },
  { href: "/app/alerts", label: ro.nav.alerts, icon: Bell },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  desktop,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: "regular" | "fill" }>;
  active: boolean;
  desktop?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center transition-colors duration-150",
        desktop
          ? "gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium"
          : "min-h-[52px] min-w-0 flex-1 flex-col justify-center gap-1 px-1 py-2 text-[10px] font-medium",
        active ? "text-foreground" : "text-muted hover:text-foreground"
      )}
    >
      {desktop && active && (
        <span className="absolute inset-0 rounded-xl bg-elevated" />
      )}
      <span className="relative flex items-center justify-center">
        <Icon
          className={cn(desktop ? "h-[18px] w-[18px]" : "h-5 w-5")}
          weight={active ? "fill" : "regular"}
        />
        {badge != undefined && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-danger px-0.5 text-[8px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className={cn("relative truncate", !desktop && "max-w-[60px]")}>{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { data: alertsData } = useAlerts();
  const { data: routes } = useRoutes();
  const alertCount = alertsData?.notifications.length ?? 0;
  const linesAlertCount =
    alertsData && routes
      ? linesWithActiveAlerts(alertsData.notifications, routes).size
      : 0;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
          {tabs.map((tab) => (
            <NavItem
              key={tab.href}
              {...tab}
              active={pathname.startsWith(tab.href)}
              badge={
                tab.href === "/app/alerts"
                  ? alertCount
                  : undefined
              }
            />
          ))}
          <MoreSheet />
        </div>
      </nav>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-[220px] lg:flex-col lg:bg-background lg:px-4 lg:pt-[env(safe-area-inset-top)]">
        <div className="py-6 pl-1">
          <Link href="/" className="block hover:opacity-80 sm:ml-1">
            <NexTBLogo size="sm" />
            <p className="mt-0.5 text-[12px] text-muted">{ro.app.tagline}</p>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {tabs.map((tab) => (
            <NavItem
              key={tab.href}
              {...tab}
              desktop
              active={pathname.startsWith(tab.href)}
              badge={
                tab.href === "/app/alerts"
                  ? alertCount
                  :  undefined
              }
            />
          ))}
          <MoreNavDesktop />
        </nav>

        <div className="pb-5 pt-2">
          <ThemeToggle compact />
        </div>
      </aside>
    </>
  );
}
