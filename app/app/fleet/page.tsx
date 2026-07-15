"use client";

import { useState } from "react";
import { PageHeader, Card, SectionLabel } from "@/components/ui";
import { transitStats, type BarItem } from "@/lib/stats";
import { ro } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = "buses" | "trolleybuses" | "trams" | "network";

const tabs: { id: Tab; label: string }[] = [
  { id: "buses", label: ro.fleet.tabBuses },
  { id: "trolleybuses", label: ro.fleet.tabTrolleybuses },
  { id: "trams", label: ro.fleet.tabTrams },
  { id: "network", label: ro.fleet.tabNetwork },
];

function BarChart({ items }: { items: BarItem[] }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-[13px]">
            <span className="truncate pr-2 text-foreground">{item.label}</span>
            <span className="shrink-0 text-muted">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </Card>
  );
}

export default function FleetPage() {
  const [tab, setTab] = useState<Tab>("buses");
  const { summary, buses, trolleybuses, trams, network, community } = transitStats;

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-md lg:pb-10 lg:pt-10">
      <PageHeader title={ro.fleet.statsTitle} subtitle={ro.fleet.statsSubtitle} />

      <div className="mb-4 grid grid-cols-2 gap-2">
        <StatCard label={ro.fleet.tabBuses} value={summary.buses} />
        <StatCard label={ro.fleet.tabTrolleybuses} value={summary.trolleybuses} />
        <StatCard label={ro.fleet.tabTrams} value={summary.trams} />
        <StatCard label={ro.fleet.totalLines} value={summary.lines.total} />
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-elevated p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors cursor-pointer hover:bg-elevated",
              tab === t.id ? "bg-foreground text-background hover:bg-foreground" : "text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "buses" && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <StatCard label={ro.fleet.otokar} value={buses.otokarCount} />
            <StatCard label={ro.fleet.citaro} value={buses.citaroCount} />
            <StatCard label={ro.fleet.cityTour} value={buses.cityTourCount} />
          </div>
          <Card className="mb-4">
            <SectionLabel className="mb-4">{ro.fleet.byDepot}</SectionLabel>
            <BarChart items={buses.byDepot.map((d) => ({ label: d.depot, count: d.count }))} />
          </Card>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <StatCard label={ro.fleet.kmKnown} value={buses.citaroWithKm} />
            <StatCard label={ro.fleet.citaroAcRetrofit} value={buses.citaroAcRetrofit} />
          </div>
          <p className="text-center text-[12px] text-muted">{ro.fleet.sourceMetrouusor}</p>
        </>
      )}

      {tab === "trolleybuses" && (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <StatCard label={ro.fleet.active} value={trolleybuses.active} />
            <StatCard label={ro.fleet.retired} value={trolleybuses.retired} />
          </div>
          <Card className="mb-4">
            <SectionLabel className="mb-4">{ro.fleet.byManufacturer}</SectionLabel>
            <BarChart items={trolleybuses.byManufacturer} />
          </Card>
          <Card className="mb-4">
            <SectionLabel className="mb-4">{ro.fleet.byModel}</SectionLabel>
            <BarChart items={trolleybuses.byModel} />
          </Card>
          <Card className="mb-4">
            <SectionLabel className="mb-4">{ro.fleet.byDepot}</SectionLabel>
            <BarChart items={trolleybuses.byDepot} />
          </Card>
          <Card className="mb-4">
            <SectionLabel className="mb-4">{ro.fleet.byDecade}</SectionLabel>
            <BarChart items={trolleybuses.byDecade} />
          </Card>
          <p className="text-center text-[12px] text-muted">{ro.fleet.sourceTransportInComun}</p>
        </>
      )}

      {tab === "trams" && (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <StatCard label={ro.fleet.active} value={trams.active} />
            <StatCard label={ro.fleet.retired} value={`?`} />
            <StatCard label={ro.fleet.withAc} value={trams.withAc} />
          </div>
          <Card className="mb-4">
            <SectionLabel className="mb-4">{ro.fleet.byType}</SectionLabel>
            <BarChart items={trams.byType} />
          </Card>
          <p className="text-center text-[12px] text-muted">{ro.fleet.sourceTransportInComun}</p>
        </>
      )}

      {tab === "network" && (
        <>
          <Card className="mb-4">
            <SectionLabel className="mb-4">{ro.fleet.totalLines}</SectionLabel>
            <BarChart
              items={[
                { label: ro.fleet.linesTram, count: network.lines.tram },
                { label: ro.fleet.linesBus, count: network.lines.bus },
                { label: ro.fleet.linesTrolley, count: network.lines.trolleybus },
              ]}
            />
          </Card>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <StatCard label={ro.fleet.totalStops} value={network.stops} />
            <StatCard label={ro.fleet.acReports} value={community.legacyAcReports} />
          </div>
          <p className="text-center text-[12px] text-muted">{ro.fleet.sourceGtfs}</p>
        </>
      )}

      <p className="mt-4 text-center text-[12px] text-muted">{ro.fleet.dataDisclaimer}</p>
    </div>
  );
}
