"use client";

import { memo, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, CaretRight } from "@phosphor-icons/react";
import { useRoutes, useAlerts } from "@/lib/hooks/useApi";
import { useStore } from "@/lib/store";
import type { RouteInfo } from "@/lib/types";
import { normalizeLineColor } from "@/lib/colors";
import { getAlertsForLine } from "@/lib/alerts/helpers";
import { isRegionalOperator } from "@/lib/routes/agency";
import { PageHeader, Skeleton, EmptyState, Input } from "@/components/ui";
import { lineTypeLineLabel, ro } from "@/lib/i18n";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const LineItem = memo(function LineItem({
  route,
  data,
  hasAlert,
  onPress,
}: {
  route: string;
  data: RouteInfo;
  hasAlert: boolean;
  onPress: () => void;
}) {
  const lineColor = normalizeLineColor(data.color);

  return (
    <button
      type="button"
      onClick={onPress}
      className="group flex w-full items-center gap-3.5 rounded-2xl bg-card p-3.5 text-left transition-colors hover:bg-elevated active:bg-elevated-2"
    >
      <span
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold text-white"
        style={{ backgroundColor: lineColor }}
      >
        {route}

      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-foreground">
          {lineTypeLineLabel(data.type)}
          {data.agency_id && isRegionalOperator(data.agency_id) && (
            <span className="ml-1 text-[12px] text-muted">({data.agency_id})</span>
          )}
        </p>
        <p className="text-[13px] text-muted">
          {hasAlert ? ro.lines.hasAlert : ro.lines.liveMap}
        </p>
      </div>
      <CaretRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
    </button>
  );
});

export default function LinesPage() {
  const router = useRouter();
  const { data: routes, isLoading } = useRoutes();
  const { data: alertsData } = useAlerts();
  const showRegionalOperators = useStore((s) => s.showRegionalOperators);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 250);

  const filtered = useMemo(() => {
    if (!routes) return {};
    const metro = ["m1", "m2", "m3", "m4", "m5"];
    return Object.fromEntries(
      Object.entries(routes).filter(([key, data]) => {
        if (metro.includes(key.toLowerCase())) return false;
        if (!showRegionalOperators && isRegionalOperator(data.agency_id)) {
          return false;
        }
        if (!debounced.trim()) return true;
        return key.toLowerCase().includes(debounced.trim().toLowerCase());
      })
    );
  }, [routes, debounced, showRegionalOperators]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        document.getElementById("line-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const entries = Object.entries(filtered);

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-xl lg:pb-10 lg:pt-10">
      <PageHeader title={ro.lines.title} subtitle={ro.lines.subtitle} />

      <div className="relative mb-6">
        <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          id="line-search"
          type="search"
          placeholder={ro.lines.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11"
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem]" />
          ))}
        </div>
      )}

      {!isLoading && entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {entries.map(([route, data]) => (
            <LineItem
              key={route}
              route={route}
              data={data}
              hasAlert={
                alertsData?.notifications
                  ? getAlertsForLine(alertsData.notifications, route).length > 0
                  : false
              }
              onPress={() =>
                router.push(
                  `/app/lines/${data.id}?name=${encodeURIComponent(route)}&type=${encodeURIComponent(data.type)}`
                )
              }
            />
          ))}
        </div>
      )}

      {!isLoading && entries.length === 0 && (
        <EmptyState
          title={ro.lines.noResults}
          description={
            debounced.trim()
              ? ro.lines.noResultsHint
              : showRegionalOperators
                ? ro.lines.noResultsEmpty
                : ro.lines.enableRegionalHint
          }
        />
      )}
    </div>
  );
}
