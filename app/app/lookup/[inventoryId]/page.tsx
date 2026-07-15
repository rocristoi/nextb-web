"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bus,
  MapPin,
  Users,
  Circle,
  Snowflake,
} from "@phosphor-icons/react";
import useSWR from "swr";
import { fetchJson } from "@/lib/api";
import { buildLineUrl } from "@/lib/navigation/line-url";
import type { AcConfidence, VehicleSearchResult } from "@/lib/types";
import type { FleetVehicleInfo } from "@/lib/vehicles/fleetInfo";
import {
  formatFleetKm,
  getFleetModelNameFromInfo,
  getFleetSource,
  resolveFleetInfo,
} from "@/lib/vehicles/fleetInfo";
import { UNKNOWN_VEHICLE_IMAGE } from "@/lib/vehicles/imageMap";
import { Card, EmptyState, SectionLabel, Skeleton } from "@/components/ui";
import { FleetObservationsCard } from "@/components/vehicle/FleetObservationsCard";
import { cn } from "@/lib/utils";
import { acConfidenceLabel, ro } from "@/lib/i18n";

type VehicleDetailResponse = {
  vehicle: VehicleSearchResult;
  fleetInfo: FleetVehicleInfo | null;
};

function InfoCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-elevated p-3.5", className)}>
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AcStatusCell({
  ac,
  acConfidence,
}: {
  ac: boolean;
  acConfidence?: AcConfidence;
}) {
  const label = acConfidence
    ? acConfidenceLabel(acConfidence)
    : ac
      ? ro.station.ac
      : ro.station.noAc;

  return (
    <div className="rounded-xl bg-elevated p-3.5">
      <p className="text-[12px] text-muted">{ro.fleet.ac}</p>
      <p
        className={cn(
          "mt-0.5 inline-flex items-center gap-1.5 font-semibold",
          acConfidence === "ok" && ac
            ? "text-accent"
            : acConfidence === "uncertain"
              ? "text-accent"
              : acConfidence === "broken"
                ? "text-danger"
                : ac
                  ? "text-accent"
                  : "text-danger"
        )}
      >
        <Snowflake className="h-3.5 w-3.5" />
        {label}
      </p>
    </div>
  );
}

function StatusBadge({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[8px] font-medium",
        live ? "bg-accent/15 text-accent" : "bg-elevated text-muted"
      )}
    >
      <Circle
        className={cn("h-2 w-2", live ? "text-accent" : "text-muted")}
        weight="fill"
      />
      {live ? ro.lookup.liveOnLine : ro.lookup.notInService}
    </span>
  );
}

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inventoryId = params.inventoryId as string;

  const { data, isLoading, error } = useSWR<VehicleDetailResponse>(
    `/api/vehicle/${inventoryId}`,
    fetchJson
  );

  const vehicle = data?.vehicle;
  const fleetInfo = data?.fleetInfo;
  const isLive = vehicle?.live != null;
  const modelName =
    vehicle?.model ??
    getFleetModelNameFromInfo(resolveFleetInfo(vehicle?.plate, vehicle?.inventory)) ??
    ro.eta.unknown;

  const source = getFleetSource(fleetInfo);

  const trackLive = () => {
    if (!vehicle?.live) return;
    router.push(
      buildLineUrl(
        vehicle.live.routeId,
        vehicle.live.lineName ?? "",
        vehicle.live.lineType ?? "bus",
        { vehicleId: vehicle.inventory, plate: vehicle.plate }
      )
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto min-h-dvh max-w-lg px-5 pb-28 pt-[env(safe-area-inset-top)] lg:max-w-md lg:pb-10 lg:pt-0">
        <header className="sticky top-0 z-10 -mx-5 mb-6 bg-background/90 px-5 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md lg:static lg:mx-0 lg:px-0 lg:pt-10">
          <nav className="grid h-10 grid-cols-[2.5rem_1fr_2.5rem] items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-elevated"
              aria-label={ro.lookup.back}
            >
              <ArrowLeft className="h-5 w-5" weight="bold" />
            </button>
            <span className="text-center text-[15px] font-semibold text-foreground">
              {ro.lookup.vehicleTitle(inventoryId)}
            </span>
            <span aria-hidden />
          </nav>
        </header>
        <Skeleton className="mb-4 h-48 rounded-3xl" />
        <div className="mb-6 grid grid-cols-2 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-14 rounded-2xl" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="mx-auto min-h-dvh max-w-lg px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-md lg:pb-10 lg:pt-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-elevated"
          aria-label={ro.lookup.back}
        >
          <ArrowLeft className="h-5 w-5" weight="bold" />
        </button>
        <EmptyState title={ro.lookup.notFound} />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pb-28 pt-[env(safe-area-inset-top)] lg:max-w-md lg:pb-10 lg:pt-0">
      <header className="sticky top-0 z-10 -mx-5 mb-6 bg-background/90 px-5 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md lg:static lg:mx-0 lg:px-0 lg:pt-10">
        <nav className="grid h-10 grid-cols-[2.5rem_1fr_2.5rem] items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-elevated active:bg-elevated-2"
            aria-label={ro.lookup.back}
          >
            <ArrowLeft className="h-5 w-5" weight="bold" />
          </button>
          <h1 className="truncate text-center text-[15px] font-semibold text-foreground">
            {ro.lookup.vehicleTitle(vehicle.inventory)}
          </h1>
          <span aria-hidden />
        </nav>
      </header>

      <div className="relative mb-5 overflow-hidden rounded-3xl bg-card">
        <div className="relative mx-auto aspect-[16/9] max-h-52 w-full">
          <Image
            src={vehicle.image ?? UNKNOWN_VEHICLE_IMAGE}
            alt={modelName}
            fill
            sizes="(max-width: 512px) 100vw, 448px"
            className="object-contain p-6"
            priority
          />
        </div>
        <div className="border-t border-elevated px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground">{modelName}</p>
              <p className="mt-0.5 font-mono text-[15px] tracking-wide text-muted">
                {vehicle.plate}
              </p>
            </div>
            <StatusBadge live={isLive} />
          </div>
        </div>
      </div>

      <Card className="mb-4 !p-4">
        <SectionLabel className="mb-3">{ro.lookup.fleetDetails}</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <InfoCell label={ro.lines.plate} value={vehicle.plate || ro.eta.dash} />
          {fleetInfo && (
            <InfoCell
              label={ro.fleet.depot}
              value={fleetInfo.depot || ro.eta.dash}
            />
          )}
          <InfoCell
            label={ro.lookup.inventoryId}
            value={`#${vehicle.inventory}`}
          />
          {vehicle.acConfidence != null && (
            <AcStatusCell ac={vehicle.ac ?? false} acConfidence={vehicle.acConfidence} />
          )}
          {fleetInfo?.family === "otokar" && (
            <InfoCell
              label={ro.fleet.vin}
              value={fleetInfo.vin}
              className="col-span-2"
            />
          )}
          {fleetInfo?.family === "citaro" && (
            <InfoCell
              label={ro.fleet.km}
              value={formatFleetKm(fleetInfo.km) ?? ro.eta.dash}
              className="col-span-2"
            />
          )}
          {(fleetInfo?.family === "trolleybus" ||
            fleetInfo?.family === "bus" ||
            fleetInfo?.family === "tram") &&
            fleetInfo.yearBuilt != null && (
            <InfoCell label={ro.fleet.yearBuilt} value={String(fleetInfo.yearBuilt)} />
          )}
          {(fleetInfo?.family === "trolleybus" ||
            fleetInfo?.family === "bus" ||
            fleetInfo?.family === "tram") &&
            fleetInfo.imported && (
            <InfoCell label={ro.fleet.imported} value={fleetInfo.imported} />
          )}
          {(fleetInfo?.family === "trolleybus" ||
            fleetInfo?.family === "bus" ||
            fleetInfo?.family === "tram") &&
            fleetInfo.manufacturer && (
            <InfoCell label={ro.fleet.manufacturer} value={fleetInfo.manufacturer} />
          )}
          {(fleetInfo?.family === "trolleybus" ||
            fleetInfo?.family === "bus" ||
            fleetInfo?.family === "tram") &&
            fleetInfo.modelType && (
            <InfoCell label={ro.fleet.modelType} value={fleetInfo.modelType} />
          )}
        </div>

        {fleetInfo?.family === "citaro" && fleetInfo.details && (
          <FleetObservationsCard text={fleetInfo.details} />
        )}

        {fleetInfo?.family === "trolleybus" && fleetInfo.observations && (
          <FleetObservationsCard text={fleetInfo.observations} />
        )}

        {fleetInfo?.family === "tram" && fleetInfo.observations && (
          <FleetObservationsCard text={fleetInfo.observations} />
        )}

        {fleetInfo?.family === "bus" && fleetInfo.observations && (
          <FleetObservationsCard text={fleetInfo.observations} />
        )}
      </Card>

      <Card className="mb-4 !p-4">
        <SectionLabel className="mb-3">{ro.lookup.liveStatus}</SectionLabel>

        {isLive ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-accent/10 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
                <Bus className="h-5 w-5 text-accent" weight="duotone" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-foreground">
                  {vehicle.live?.lineName
                    ? ro.lookup.currentlyOnLine(vehicle.live.lineName)
                    : ro.lookup.liveOnLine}
                </p>
                {vehicle.live?.on_board != null && (
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-muted">
                    <Users className="h-3.5 w-3.5" />
                    {ro.lookup.passengersOnBoard}: {vehicle.live.on_board}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={trackLive}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3.5 text-[15px] font-semibold text-background transition-opacity hover:opacity-90 active:opacity-80"
            >
              <MapPin className="h-4 w-4" weight="fill" />
              {ro.lookup.trackLive}
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-elevated p-4 text-center">
            <Bus className="mx-auto mb-2 h-8 w-8 text-muted" weight="duotone" />
            <p className="text-[14px] text-muted">{ro.lookup.offlineHint}</p>
          </div>
        )}
      </Card>

      {source && (
        <p className="text-center text-[12px] text-muted">{ro.fleet.source(source)}</p>
      )}
    </div>
  );
}
