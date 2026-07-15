"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapTrifold, Warning } from "@phosphor-icons/react";
import useSWR from "swr";
import { useStore } from "@/lib/store";
import { useAlerts } from "@/lib/hooks/useApi";
import { fetchJson } from "@/lib/api";
import type { StationResponse } from "@/lib/types";
import { soonestEta, countActiveLines, formatEtaLabel } from "@/lib/station/helpers";
import { favoriteLinesWithAlerts } from "@/lib/alerts/helpers";
import { PageHeader, Card, EmptyState, Skeleton } from "@/components/ui";
import { HomeDisclaimerBanner } from "@/components/home/HomeDisclaimerBanner";
import { ro } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function FavoriteCard({ stopId }: { stopId: number }) {
  const { data, isLoading, error } = useSWR<StationResponse>(
    `/api?stationID=${stopId}`,
    fetchJson,
    { refreshInterval: 45000 }
  );
  const { data: alertsData } = useAlerts();
  const removeFavorite = useStore((s) => s.removeFavorite);

  const soonest = data?.lines ? soonestEta(data.lines) : null;
  const active = data?.lines ? countActiveLines(data.lines) : 0;
  const lineNames = data?.lines ? Object.keys(data.lines) : [];
  const favAlerts =
    alertsData?.notifications && lineNames.length
      ? favoriteLinesWithAlerts(alertsData.notifications, lineNames)
      : [];

  return (
    <Card className="relative">
      <button
        type="button"
        onClick={() => removeFavorite(stopId)}
        className="absolute right-4 top-4 text-accent"
        aria-label={ro.home.removeFavorite}
      >
       {!isLoading && !error && data && <Star className="h-5 w-5" weight="fill" /> }
      </button>
      {isLoading && <Skeleton className="h-20" />}
      {error && (
        <p className="text-[14px] text-danger">{ro.station.loadError}</p>
      )}
      {!isLoading && !error && data && (
        <>
          <h3 className="pr-8 text-[16px] font-semibold text-foreground">{data.name}</h3>
          {data.address && (
            <p className="mt-0.5 text-[13px] text-muted">{data.address}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[14px]">
            <span className="text-muted">{ro.home.soonest}: {soonest != null ? formatEtaLabel(soonest) : ro.eta.dash}</span>
            <span className="text-muted">·</span>
            <span className="text-muted">{ro.home.linesActive(active)}</span>
          </div>
          {favAlerts.length > 0 && (
            <Link
              href="/app/alerts"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-danger"
            >
              <Warning className="h-4 w-4" weight="fill" />
              {ro.home.alertOnLine}
            </Link>
          )}
        </>
      )}
    </Card>
  );
}

export default function HomePage() {
  const router = useRouter();
  const favoriteStopIds = useStore((s) => s.favoriteStopIds);

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-xl lg:pb-10 lg:pt-10">
      <PageHeader title={ro.home.title} subtitle={ro.home.subtitle} />
      <HomeDisclaimerBanner />

      {favoriteStopIds.length === 0 && (
        <EmptyState
          title={ro.home.emptyTitle}
          description={ro.home.emptyHint}
        />
      )}

      {favoriteStopIds.length > 0 && (
        <div className="flex flex-col gap-3">
          {favoriteStopIds.map((id) => (
            <FavoriteCard key={id} stopId={id} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push("/app/map")}
        className={cn(
          "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-elevated py-3.5 text-[14px] font-semibold text-foreground transition-colors hover:bg-elevated-2",
          favoriteStopIds.length === 0 && "mt-0"
        )}
      >
        <MapTrifold className="h-4 w-4" />
        {ro.home.openMap}
      </button>
    </div>
  );
}
