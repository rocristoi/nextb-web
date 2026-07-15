"use client";

import { memo } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { normalizeLineColor } from "@/lib/colors";
import type { VehicleArrival, RouteInfo } from "@/lib/types";
import { DepartureTime } from "./EtaBadge";
import { VehicleRow, vehicleKey } from "./VehicleRow";
import { ro } from "@/lib/i18n";

export const StationLineCard = memo(function StationLineCard({
  lineName,
  vehicles,
  routeInfo,
  expanded,
  onToggle,
}: {
  lineName: string;
  vehicles: VehicleArrival[];
  routeInfo?: RouteInfo;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasVehicles = vehicles.length > 0;
  const lead = vehicles[0];
  const lineColor = normalizeLineColor(routeInfo?.color);

  return (
    <div className="overflow-hidden rounded-xl bg-card">
      <button
        type="button"
        onClick={hasVehicles ? onToggle : undefined}
        disabled={!hasVehicles}
        className={cn(
          "flex h-11 w-full items-stretch text-left",
          hasVehicles && "cursor-pointer hover:brightness-105 active:brightness-95"
        )}
      >
        <span
          className="relative flex min-w-[4.5rem] items-center justify-center px-4 text-[17px] font-bold text-white"
          style={{ backgroundColor: hasVehicles ? lineColor : "#555" }}
        >
          {lineName}
        </span>

        <span className="flex flex-1 items-center justify-end gap-2 bg-elevated px-4">
          {hasVehicles ? (
            <DepartureTime time={lead?.time} prominent />
          ) : (
            <span className="text-[14px] text-muted">{ro.eta.dash}</span>
          )}
          {hasVehicles && (
            <CaretDown
              className={cn(
                "h-4 w-4 text-muted transition-transform duration-200",
                expanded && "rotate-180"
              )}
            />
          )}
        </span>
      </button>

      <div className="line-expand" data-open={expanded && hasVehicles ? "true" : "false"}>
        <div className="line-expand-inner">
          <div className="space-y-1 bg-card p-1.5">
            {vehicles.slice(0, 4).map((tram, i) => (
              <VehicleRow
                key={vehicleKey(tram, i)}
                tram={tram}
                lineName={lineName}
                routeInfo={routeInfo}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
