"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowsClockwise, Star } from "@phosphor-icons/react";
import { useStation, useRoutes } from "@/lib/hooks/useApi";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { sortStationLines } from "@/lib/station/helpers";
import { StationLineCard } from "./StationLineCard";
import { ro } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function StationPanel({
  stationId,
  onClose,
}: {
  stationId: number;
  onClose: () => void;
}) {
  const { data, error, isLoading, isValidating } = useStation(stationId);
  const { data: routes } = useRoutes();
  const [expandedLine, setExpandedLine] = useState<string | null>(null);
  const favoriteStopIds = useStore((s) => s.favoriteStopIds);
  const addFavorite = useStore((s) => s.addFavorite);
  const removeFavorite = useStore((s) => s.removeFavorite);
  const { showToast } = useToast();
  const isFav = favoriteStopIds.includes(stationId);

  const sortedLines = useMemo(
    () => (data?.lines ? sortStationLines(data.lines) : []),
    [data]
  );

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(stationId);
      showToast(ro.home.favoriteRemoved);
    } else {
      addFavorite(stationId);
      showToast(ro.home.favoriteAdded);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <header className="shrink-0 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[17px] font-bold text-foreground">
              {isLoading ? ro.station.loading : data?.name ?? ro.station.fallbackName}
            </h2>
            {!isLoading && data?.address && (
              <p className="mt-1 truncate text-[13px] text-muted">{data.address}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={toggleFavorite}
              className={cn(
                "rounded-lg p-1.5 transition-colors",
                isFav ? "text-accent" : "text-muted hover:text-foreground"
              )}
              aria-label={isFav ? ro.home.removeFavorite : ro.home.addFavorite}
            >
              <Star className="h-5 w-5" weight={isFav ? "fill" : "regular"} />
            </button>
            {isValidating && (
              <ArrowsClockwise className="h-4 w-4 animate-spin text-muted" />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:text-foreground lg:hidden"
              aria-label={ro.station.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="text-[14px] text-foreground">
            {(error as { status?: number }).status === 503
              ? ro.station.serversBusy
              : ro.station.loadError}
          </p>
          <p className="mt-1 text-[13px] text-muted">{ro.station.retry}</p>
        </div>
      )}

      {!error && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {isLoading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-11 animate-pulse rounded-xl bg-elevated" />
              ))}
            </div>
          )}

          {!isLoading && sortedLines.length > 0 && (
            <div className="flex flex-col gap-2 pb-2">
              {sortedLines.map(([lineName, vehicles], index) => (
                <motion.div
                  key={lineName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.22 }}
                >
                  <StationLineCard
                    lineName={lineName}
                    vehicles={vehicles}
                    routeInfo={routes?.[lineName]}
                    expanded={expandedLine === lineName}
                    onToggle={() =>
                      setExpandedLine((cur) => (cur === lineName ? null : lineName))
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && sortedLines.length === 0 && (
            <p className="py-12 text-center text-[14px] text-muted">{ro.station.noLines}</p>
          )}
        </div>
      )}
    </div>
  );
}
