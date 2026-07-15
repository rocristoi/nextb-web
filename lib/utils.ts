import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ro } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEta(time: number | string | undefined | null): string {
  if (time === undefined || time === null) return ro.eta.dashShort;
  if (time.toString() === "m") return ro.eta.over17Full;
  if (time === 0) return ro.eta.now;
  if (time === 1) return ro.eta.oneMin;
  return ro.eta.minutes(Number(time));
}

export function formatEtaShort(time: number | string | undefined | null): string {
  if (time === undefined || time === null) return ro.eta.dashShort;
  if (time.toString() === "m") return ro.eta.over17;
  return String(time);
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return ro.alerts.justNow;
  if (diffMin < 60) return ro.alerts.minutesAgo(diffMin);
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return ro.alerts.hoursAgo(diffHr);
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return ro.alerts.daysAgo(diffDay);
  return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export function formatAlertDate(iso: string): string {
  return new Date(iso).toLocaleString("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
