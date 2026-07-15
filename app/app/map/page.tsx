"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useStops } from "@/lib/hooks/useApi";
import { StationSheet, StationDesktopPanel } from "@/components/station/StationSheet";
import { StopSearch } from "@/components/map/StopSearch";
import { Skeleton } from "@/components/ui";
import type { StopSearchEntry } from "@/lib/types";
import { ro } from "@/lib/i18n";

const TransitMap = dynamic(
  () => import("@/components/map/TransitMap").then((m) => m.TransitMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    ),
  }
);

export default function MapPage() {
  const { data: stops, isLoading, error } = useStops();
  const [selectedStopId, setSelectedStopId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lon: number } | null>(null);

  const handleSelectStop = useCallback((stopId: number) => {
    if (!stopId) return;
    setSelectedStopId(stopId);
    setSheetOpen(true);
  }, []);

  const handleSearchSelect = useCallback((stop: StopSearchEntry) => {
    setFlyTo({ lat: stop.stop_lat, lon: stop.stop_lon });
    handleSelectStop(stop.stop_id);
  }, [handleSelectStop]);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
    setTimeout(() => setSelectedStopId(null), 200);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      setTimeout(() => setSelectedStopId(null), 280);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-4.5rem)] flex-col items-center justify-center gap-4 lg:h-dvh">
        <Skeleton className="h-8 w-40" />
        <p className="text-muted">{ro.map.loadingStops}</p>
      </div>
    );
  }

  if (error || !stops?.length) {
    return (
      <div className="flex h-[calc(100dvh-4.5rem)] items-center justify-center px-6 text-center text-danger lg:h-dvh">
        {ro.map.loadError}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-4.5rem)] min-w-0 flex-col overflow-x-hidden lg:h-dvh lg:flex-row">
      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-20 px-3 pt-3 lg:max-w-md">
          <StopSearch onSelect={handleSearchSelect} />
        </div>
        <div className="h-full min-w-0">
          <TransitMap
            stops={stops}
            selectedStopId={selectedStopId}
            onSelectStop={handleSelectStop}
            flyTo={flyTo}
          />
        </div>
      </div>

      <StationDesktopPanel stationId={selectedStopId} onClose={handleClose} />
      <StationSheet
        stationId={selectedStopId}
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
      />
    </div>
  );
}
