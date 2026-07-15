"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Bus, Circle, CaretRight } from "@phosphor-icons/react";
import useSWR from "swr";
import { PageHeader, Input, EmptyState, Skeleton } from "@/components/ui";
import { fetchJson } from "@/lib/api";
import type { VehicleSearchResult } from "@/lib/types";
import { UNKNOWN_VEHICLE_IMAGE } from "@/lib/vehicles/imageMap";
import { ro } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function VehicleResultCard({ v }: { v: VehicleSearchResult }) {
  const router = useRouter();
  const isLive = v.live != null;

  return (
    <button
      type="button"
      onClick={() => router.push(`/app/lookup/${v.inventory}`)}
      className="group flex w-full gap-4 rounded-2xl bg-card p-4 text-left transition-colors hover:bg-elevated active:bg-elevated-2"
    >
      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-elevated">
        <Image
          src={v.image ?? UNKNOWN_VEHICLE_IMAGE}
          alt=""
          fill
          sizes="96px"
          className="object-contain p-1"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[17px] font-bold text-foreground">#{v.inventory}</p>
            <p className="text-[14px] text-muted">{v.model ?? ro.eta.unknown}</p>
          </div>
          <CaretRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
        </div>

        <p className="mt-1 font-mono text-[13px] tracking-wide text-foreground">{v.plate}</p>

        {v.depot && (
          <p className="mt-0.5 text-[12px] text-muted">
            {ro.fleet.depot}: {v.depot}
          </p>
        )}

        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium",
            isLive ? "text-accent" : "text-muted"
          )}
        >
          <Circle
            className={cn("h-2 w-2", isLive ? "text-accent" : "text-muted")}
            weight="fill"
          />
          {isLive
            ? v.live?.lineName
              ? ro.lookup.onLine(v.live.lineName)
              : ro.lookup.liveOnLine
            : ro.lookup.notInService}
        </p>
      </div>
    </button>
  );
}

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);

  const { data, isLoading } = useSWR<{ results: VehicleSearchResult[] }>(
    debounced.length >= 2 ? `/api/vehicle/search?q=${encodeURIComponent(debounced)}` : null,
    fetchJson
  );

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-md lg:pb-10 lg:pt-10">
      <PageHeader title={ro.lookup.title} subtitle={ro.lookup.subtitle} />

      <div className="relative mb-6">
        <MagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          type="search"
          placeholder={ro.lookup.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {debounced.length < 2 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-10 text-center">
          <Bus className="h-10 w-10 text-muted" weight="duotone" />
          <p className="text-[14px] text-muted">{ro.lookup.subtitle}</p>
        </div>
      )}

      {isLoading && debounced.length >= 2 && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      )}

      {!isLoading && debounced.length >= 2 && (data?.results.length ?? 0) === 0 && (
        <EmptyState title={ro.lookup.noResults} />
      )}

      <div className="flex flex-col gap-3">
        {data?.results.map((v) => (
          <VehicleResultCard key={v.inventory} v={v} />
        ))}
      </div>
    </div>
  );
}
