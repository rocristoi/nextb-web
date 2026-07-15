"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Snowflake, X } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import type { FleetVehicleInfo } from "@/lib/vehicles/fleetInfo";
import {
  formatFleetKm,
  getFleetModelNameFromInfo,
  getFleetSource,
  resolveFleetInfo,
  resolveVehicleByInventory,
} from "@/lib/vehicles/fleetInfo";
import { UNKNOWN_VEHICLE_IMAGE } from "@/lib/vehicles/imageMap";
import { cn } from "@/lib/utils";
import { ro } from "@/lib/i18n";
import { FleetObservationsCard } from "@/components/vehicle/FleetObservationsCard";

type VehicleFleetModalProps = {
  inventoryId: number | null;
  type: string;
  image: string | null;
  livePlate?: string | null;
  onBoard?: number | null;
  ac?: boolean | null;
  fleetInfo?: FleetVehicleInfo | null;
  onClose: () => void;
};

export function VehicleFleetModal({
  inventoryId,
  type,
  image,
  livePlate,
  onBoard,
  ac,
  fleetInfo,
  onClose,
}: VehicleFleetModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedFleet = fleetInfo ?? resolveFleetInfo(livePlate, inventoryId);
  const fallback = inventoryId
    ? resolveVehicleByInventory(inventoryId, livePlate)
    : null;
  const displayId = inventoryId ?? resolvedFleet?.inventory ?? ro.eta.dash;
  const modelName =
    getFleetModelNameFromInfo(resolvedFleet) ??
    (type !== "Unknown" ? type : fallback?.type ?? type);
  const displayImage = image ?? fallback?.image ?? UNKNOWN_VEHICLE_IMAGE;
  const plate = livePlate || resolvedFleet?.plate;
  const title = resolvedFleet ? ro.fleet.vehicle(displayId) : ro.lines.vehicle(displayId);
  const source = getFleetSource(resolvedFleet);

  const modal = (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-3xl bg-card p-6"
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.97 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-bold text-foreground">{title}</p>
            <p className="text-[14px] text-muted">{modelName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-muted hover:text-foreground"
            aria-label={ro.station.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Image
          src={displayImage}
          alt={modelName}
          width={320}
          height={180}
          className="mx-auto h-36 w-full object-contain"
        />

        <div className="mt-4 grid grid-cols-2 gap-2 text-[14px]">
          <InfoCell label={ro.lines.plate} value={plate || ro.eta.dash} />
          {ac != null && <AcCell ac={ac} />}
          {resolvedFleet && (
            <InfoCell label={ro.fleet.depot} value={resolvedFleet.depot || ro.eta.dash} />
          )}
          {onBoard != null && (
            <InfoCell label={ro.lines.passengers} value={String(onBoard)} />
          )}
          {resolvedFleet?.family === "otokar" && (
            <InfoCell label={ro.fleet.vin} value={resolvedFleet.vin} className="col-span-2" />
          )}
          {resolvedFleet?.family === "citaro" && (
            <InfoCell
              label={ro.fleet.km}
              value={formatFleetKm(resolvedFleet.km) ?? ro.eta.dash}
              className={onBoard == null ? undefined : "col-span-2"}
            />
          )}
          {(resolvedFleet?.family === "trolleybus" || resolvedFleet?.family === "bus") &&
            resolvedFleet.yearBuilt != null && (
            <InfoCell label={ro.fleet.yearBuilt} value={String(resolvedFleet.yearBuilt)} />
          )}
          {(resolvedFleet?.family === "trolleybus" || resolvedFleet?.family === "bus") &&
            resolvedFleet.imported && (
            <InfoCell label={ro.fleet.imported} value={resolvedFleet.imported} />
          )}
          {(resolvedFleet?.family === "trolleybus" || resolvedFleet?.family === "bus") &&
            resolvedFleet.manufacturer && (
            <InfoCell label={ro.fleet.manufacturer} value={resolvedFleet.manufacturer} />
          )}
          {(resolvedFleet?.family === "trolleybus" || resolvedFleet?.family === "bus") &&
            resolvedFleet.modelType && (
            <InfoCell label={ro.fleet.modelType} value={resolvedFleet.modelType} />
          )}
          {!resolvedFleet && onBoard == null && ac == null && (
            <InfoCell label={ro.lines.passengers} value={ro.eta.dash} />
          )}
        </div>

        {resolvedFleet?.family === "citaro" && resolvedFleet.details && (
          <FleetObservationsCard text={resolvedFleet.details} />
        )}

        {resolvedFleet?.family === "trolleybus" && resolvedFleet.observations && (
          <FleetObservationsCard text={resolvedFleet.observations} />
        )}

        {resolvedFleet?.family === "bus" && resolvedFleet.observations && (
          <FleetObservationsCard text={resolvedFleet.observations} />
        )}

        {source && (
          <p className="mt-4 text-[12px] text-muted">{ro.fleet.source(source)}</p>
        )}
      </motion.div>
    </motion.div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}

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
    <div className={cn("rounded-xl bg-elevated p-3", className)}>
      <p className="text-[12px] text-muted">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AcCell({ ac }: { ac: boolean }) {
  return (
    <div className="rounded-xl bg-elevated p-3">
      <p className="text-[12px] text-muted">{ro.fleet.ac}</p>
      <p
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold",
          ac ? "text-accent" : "text-danger"
        )}
      >
        <Snowflake className="h-3.5 w-3.5" />
        {ac ? ro.station.ac : ro.station.noAc}
      </p>
    </div>
  );
}
