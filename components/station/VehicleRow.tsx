"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CaretRight, Info, Snowflake, Users } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { VehicleArrival, RouteInfo } from "@/lib/types";
import { UNKNOWN_VEHICLE_IMAGE } from "@/lib/vehicles/imageMap";
import { resolveFleetInfo } from "@/lib/vehicles/fleetInfo";
import { buildLineUrl } from "@/lib/navigation/line-url";
import { VehicleFleetModal } from "@/components/vehicle/VehicleFleetModal";
import { DepartureTime } from "./EtaBadge";
import { ro } from "@/lib/i18n";

function vehicleKey(tram: VehicleArrival, index: number): string {
  return `${tram.plate ?? "x"}-${tram.id ?? "noid"}-${index}`;
}

function comfortAccent(tier?: VehicleArrival["comfortTier"]) {
  if (tier === "great") return "border-l-success";
  if (tier === "ok") return "border-l-accent";
  if (tier === "poor") return "border-l-danger";
  return "border-l-transparent";
}

export const VehicleRow = memo(function VehicleRow({
  tram,
  lineName,
  routeInfo,
}: {
  tram: VehicleArrival;
  lineName?: string;
  routeInfo?: RouteInfo;
}) {
  const router = useRouter();
  const { displayAdditionalInfo, selectedPrimaryDetail } = useStore();
  const [showFleetInfo, setShowFleetInfo] = useState(false);
  const imageSrc = tram.image ?? UNKNOWN_VEHICLE_IMAGE;
  const fleetInfo = resolveFleetInfo(tram.plate, tram.id);
  const isFleetVehicle = fleetInfo != null;
  const canTrack = lineName && routeInfo?.id;

  const showPassengers = tram.on_board != null;
  const showAc = selectedPrimaryDetail === "ac" || displayAdditionalInfo;
  const modelName = tram.type && tram.type !== "unknown" ? tram.type : null;

  const trackVehicle = () => {
    if (!canTrack) return;
    router.push(
      buildLineUrl(routeInfo.id, lineName, routeInfo.type, {
        vehicleId: tram.id,
        plate: tram.plate,
      })
    );
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border-l-2 bg-elevated py-2 pl-2 pr-2.5",
          comfortAccent(tram.comfortTier)
        )}
      >
        <button
          type="button"
          onClick={canTrack ? trackVehicle : undefined}
          disabled={!canTrack}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2.5 text-left",
            canTrack && "transition-colors hover:opacity-90 active:opacity-80"
          )}
        >
          {tram.time != null ? (
            <DepartureTime time={tram.time} className="w-[3.25rem] shrink-0 text-[15px]" />
          ) : (
            <span className="w-[3.25rem] shrink-0" aria-hidden />
          )}

          <div className="min-w-0 flex-1">
            {modelName && (
              <p className="truncate text-[13px] font-medium text-foreground">{modelName}</p>
            )}
            <div className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px]", modelName && "mt-0.5")}>
              {showAc && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    tram.ac ? "text-accent" : "text-danger"
                  )}
                >
                  <Snowflake className="h-3 w-3" />
                  {tram.acConfidence === "uncertain"
                    ? ro.station.acUncertain
                    : tram.ac
                      ? ro.station.ac
                      : ro.station.noAc}
                </span>
              )}
              {showPassengers && tram.on_board != null && (
                <span className="inline-flex items-center gap-1 text-muted">
                  <Users className="h-3 w-3" />
                  {tram.on_board}
                </span>
              )}
              {tram.stopsAway != null && (
                <span className="text-muted">{ro.stopsAway.label(tram.stopsAway)}</span>
              )}
            </div>
            {displayAdditionalInfo && tram.plate && (
              <p className="mt-0.5 truncate text-[11px] text-muted">{tram.plate}</p>
            )}
          </div>

          <div className="relative h-9 w-12 shrink-0">
            <Image
              src={imageSrc}
              alt=""
              width={48}
              height={36}
              className="h-full w-full object-contain object-right"
              loading="lazy"
            />
          </div>

          {canTrack && <CaretRight className="h-3.5 w-3.5 shrink-0 text-muted" />}
        </button>

        {isFleetVehicle && (
          <button
            type="button"
            onClick={() => setShowFleetInfo(true)}
            className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-elevated-2 hover:text-foreground"
            aria-label={ro.station.viewFleetInfo}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showFleetInfo && fleetInfo && (
          <VehicleFleetModal
            inventoryId={tram.id}
            type={tram.type}
            image={tram.image}
            livePlate={tram.plate}
            onBoard={tram.on_board}
            ac={tram.ac}
            fleetInfo={fleetInfo}
            onClose={() => setShowFleetInfo(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});

export { vehicleKey };
