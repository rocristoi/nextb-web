"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { ArrowLeft, ArrowRight, Bus, CaretUp, Train, Warning } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouteShape, useAlerts } from "@/lib/hooks/useApi";
import { useAnimatedPolyline } from "@/lib/hooks/useAnimatedPolyline";
import { useStore } from "@/lib/store";
import { getMapStyle } from "@/lib/map/styles";
import type { RouteVehicle } from "@/lib/types";
import { resolveFleetInfo } from "@/lib/vehicles/fleetInfo";
import { VehicleFleetModal } from "@/components/vehicle/VehicleFleetModal";
import { AlertCard } from "@/components/alerts/AlertCard";
import { cn } from "@/lib/utils";
import { normalizePlate } from "@/lib/vehicles/plate";
import { ro } from "@/lib/i18n";
import "maplibre-gl/dist/maplibre-gl.css";

function getVehicleIcon(vehType: string, lineType: string) {
  const v = vehType?.toLowerCase() ?? "";
  if (
    v.includes("citaro") ||
    v.includes("otokar") ||
    v.includes("volvo") ||
    v.includes("unvi") ||
    v.includes("irisbus") ||
    v.includes("ikarus") ||
    v.includes("solaris") ||
    v.includes("zte") ||
    v.includes("granton")
  ) {
    return Bus;
  }
  if (
    v.includes("tram") ||
    v.includes("v3a") ||
    v.includes("tatra") ||
    v.includes("bucur") ||
    v.includes("astra")
  ) {
    return Train;
  }
  return lineType?.toLowerCase().includes("tram") ? Train : Bus;
}

function toLonLat(shape: [number, number][]): [number, number][] {
  return shape.map(([lat, lon]) => [lon, lat]);
}

export default function RouteMapClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const routeId = params.routeId as string;
  const mapRef = useRef<MapRef>(null);
  const highlightFlownRef = useRef<string | null>(null);
  const theme = useStore((s) => s.theme);
  const routeName = searchParams.get("name") ?? "";
  const lineType = searchParams.get("type") ?? "";
  const highlightVehicleId = searchParams.get("vehicle");
  const highlightPlate = searchParams.get("plate");
  const [direction, setDirection] = useState<"tour" | "retour">("tour");
  const [selectedVehicle, setSelectedVehicle] = useState<RouteVehicle | null>(null);
  const [alertsManuallyClosed, setAlertsManuallyClosed] = useState(false);
  const [prevRouteKey, setPrevRouteKey] = useState(`${routeId}-${routeName}`);
  const [resolvedHighlightKey, setResolvedHighlightKey] = useState<string | null>(null);
  const { data: routeData, isLoading } = useRouteShape(routeId, routeName);
  const { data: alertsData } = useAlerts();

  const current = direction === "tour" ? routeData?.tour : routeData?.retour;
  const shape = useMemo(
    () => current?.shape ?? [],
    [current?.shape]
  );
  const vehicles = current?.vehicles ?? [];

  const fullCoords = useMemo(() => toLonLat(shape), [shape]);
  const animationKey = `${direction}-${routeId}-${shape.length}`;
  const { animatedCoords } = useAnimatedPolyline(fullCoords, animationKey);

  const baseLineColor = theme === "light" ? "#141418" : "#ffffff";

  const fullLine = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: fullCoords },
    }),
    [fullCoords]
  );

  const animatedLine = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: animatedCoords.length >= 2 ? animatedCoords : fullCoords.slice(0, 1),
      },
    }),
    [animatedCoords, fullCoords]
  );

  const routeKey = `${routeId}-${routeName}`;
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    setAlertsManuallyClosed(false);
  }

  const lineAlerts = useMemo(() => {
    if (!alertsData?.notifications || !routeName) return [];
    return alertsData.notifications.filter((a) =>
      a.lines?.some((l) => l.name === routeName)
    );
  }, [alertsData, routeName]);

  const alertsOpen = lineAlerts.length > 0 && !alertsManuallyClosed;

  const isHighlighted = useCallback(
    (veh: RouteVehicle) => {
      if (
        highlightVehicleId &&
        veh.id != null &&
        String(veh.id) === highlightVehicleId
      ) {
        return true;
      }
      if (
        highlightPlate &&
        veh.licensePlate &&
        normalizePlate(veh.licensePlate) === normalizePlate(highlightPlate)
      ) {
        return true;
      }
      return false;
    },
    [highlightVehicleId, highlightPlate]
  );

  useEffect(() => {
    if (!shape.length || !mapRef.current) return;
    if (highlightVehicleId || highlightPlate) {
      const found =
        routeData?.tour?.vehicles?.some(isHighlighted) ||
        routeData?.retour?.vehicles?.some(isHighlighted);
      if (found) return;
    }
    const lons = shape.map(([, lon]) => lon);
    const lats = shape.map(([lat]) => lat);
    mapRef.current.fitBounds(
      [
        [Math.min(...lons), Math.min(...lats)],
        [Math.max(...lons), Math.max(...lats)],
      ],
      { padding: 60, duration: 800 }
    );
  }, [shape, direction, highlightVehicleId, highlightPlate, routeData, isHighlighted]);

  const highlightKey = `${routeId}-${highlightVehicleId ?? ""}-${highlightPlate ?? ""}`;
  if (
    routeData &&
    (highlightVehicleId || highlightPlate) &&
    resolvedHighlightKey !== highlightKey
  ) {
    const tourMatch = routeData.tour?.vehicles?.find(isHighlighted);
    const retourMatch = routeData.retour?.vehicles?.find(isHighlighted);

    if (tourMatch || retourMatch) {
      const nextDirection = retourMatch && !tourMatch ? "retour" : "tour";
      if (direction !== nextDirection) {
        setDirection(nextDirection);
      }
      setResolvedHighlightKey(highlightKey);
    }
  }

  useEffect(() => {
    highlightFlownRef.current = null;
  }, [routeId, highlightVehicleId, highlightPlate]);

  useEffect(() => {
    if (!routeData || !mapRef.current) return;
    if (!highlightVehicleId && !highlightPlate) return;

    const flyKey = `${routeId}-${highlightVehicleId ?? ""}-${highlightPlate ?? ""}-${direction}`;
    if (highlightFlownRef.current === flyKey) return;

    const list =
      direction === "tour" ? routeData.tour?.vehicles : routeData.retour?.vehicles;
    const target = list?.find(isHighlighted);
    if (!target) return;

    mapRef.current.flyTo({
      center: [target.position.longitude, target.position.latitude],
      zoom: 15,
      duration: 900,
    });
    queueMicrotask(() => setSelectedVehicle(target));
    highlightFlownRef.current = flyKey;
  }, [routeData, direction, routeId, highlightVehicleId, highlightPlate, isHighlighted]);

  const toggleDirection = useCallback(() => {
    setDirection((d) => (d === "tour" ? "retour" : "tour"));
  }, []);

  return (
    <div className="flex h-[calc(100dvh-4.5rem)] flex-col overflow-hidden lg:h-dvh">
      <header className="shrink-0 bg-background pt-[env(safe-area-inset-top)]">
        <nav className="grid h-12 grid-cols-[2.5rem_1fr_2.5rem] items-center px-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-elevated active:bg-elevated-2"
            aria-label={ro.lines.back}
          >
            <ArrowLeft className="h-5 w-5" weight="bold" />
          </button>
          <h1 className="truncate text-center text-[15px] font-semibold text-foreground">
            {ro.lines.lineHeader(routeName)}
          </h1>
          {lineAlerts.length > 0 ? (
            <button
              type="button"
              onClick={() => setAlertsManuallyClosed((closed) => !closed)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-danger transition-colors hover:bg-danger/10"
              aria-label={ro.alerts.activeCount(lineAlerts.length)}
            >
              <Warning className="h-5 w-5" weight="fill" />
            </button>
          ) : (
            <span aria-hidden />
          )}
        </nav>
      </header>

      <div className="flex shrink-0 items-center justify-center py-2">
        <div className="relative flex h-10 w-72 max-w-[calc(100%-2rem)] items-center rounded-xl bg-elevated p-1">
            <motion.div
              className="absolute top-1 h-8 rounded-lg bg-foreground"
              style={{
                width: "calc(50% - 4px)",
                left: direction === "tour" ? 4 : undefined,
                right: direction === "retour" ? 4 : undefined,
              }}
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <button
              type="button"
              onClick={() => direction !== "tour" && toggleDirection()}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-1.5 text-[14px] font-semibold",
                direction === "tour" ? "text-background" : "text-muted"
              )}
            >
              <ArrowRight className="h-3.5 w-3.5" weight="bold" /> {ro.lines.tour}
            </button>
            <button
              type="button"
              onClick={() => direction !== "retour" && toggleDirection()}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-1.5 text-[14px] font-semibold",
                direction === "retour" ? "text-background" : "text-muted"
              )}
            >
              <ArrowLeft className="h-3.5 w-3.5" weight="bold" /> {ro.lines.retour}
            </button>
          </div>
        </div>

      <div className="relative min-h-0 flex-1">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          </div>
        )}
        <Map
          ref={mapRef}
          initialViewState={{ longitude: 26.1025, latitude: 44.4268, zoom: 12 }}
          mapStyle={getMapStyle(theme)}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <NavigationControl position="top-right" showCompass={false} />

          {fullCoords.length > 1 && (
            <>
              <Source id="route-base" type="geojson" data={fullLine}>
                <Layer
                  id="route-base-line"
                  type="line"
                  paint={{
                    "line-color": baseLineColor,
                    "line-width": 6,
                    "line-opacity": 0.95,
                  }}
                  layout={{
                    "line-cap": "butt",
                    "line-join": "miter",
                  }}
                />
              </Source>
              <Source id="route-animated" type="geojson" data={animatedLine}>
                <Layer
                  id="route-animated-line"
                  type="line"
                  paint={{
                    "line-color": "#FF4D4C",
                    "line-width": 6,
                    "line-opacity": 1,
                  }}
                  layout={{
                    "line-cap": "butt",
                    "line-join": "miter",
                  }}
                />
              </Source>
            </>
          )}

          {vehicles.map((veh) => {
            const Icon = getVehicleIcon(veh.type, lineType);
            const highlighted = isHighlighted(veh);
            return (
              <Marker
                key={veh.id ?? veh.vehicle.vehicle.id}
                longitude={veh.position.longitude}
                latitude={veh.position.latitude}
                anchor="center"
              >
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(veh)}
                  className={cn(
                    "relative flex items-center justify-center rounded-full shadow-lg transition-transform cursor-pointer",
                    highlighted ? "h-11 w-11" : "h-8 w-8"
                  )}
                >
                  {highlighted && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-danger/40" />
                  )}
                  <span
                    className={cn(
                      "relative flex items-center justify-center rounded-full bg-danger cursor-pointer",
                      highlighted ? "h-10 w-10 ring-2 ring-white ring-offset-2 ring-offset-background" : "h-8 w-8"
                    )}
                  >
                    <Icon className={cn("text-white", highlighted ? "h-5 w-5" : "h-4 w-4")} weight="fill" />
                  </span>
                </button>
              </Marker>
            );
          })}
        </Map>

        <AnimatePresence>
          {lineAlerts.length > 0 && alertsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="absolute inset-x-3 bottom-3 z-10 lg:inset-x-auto lg:right-4 lg:w-80"
            >
              <div className="overflow-hidden rounded-2xl border border-elevated bg-background/95 shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setAlertsManuallyClosed(true)}
                  className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
                >
                  <Warning className="h-4 w-4 shrink-0 text-danger" weight="fill" />
                  <span className="flex-1 text-[13px] font-medium text-foreground">
                    {ro.alerts.activeCount(lineAlerts.length)}
                  </span>
                  <CaretUp className="h-4 w-4 text-muted" />
                </button>
                <div className="scrollbar-none max-h-[38dvh] space-y-2 overflow-y-auto border-t border-elevated px-3 py-3">
                  {lineAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} compact />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedVehicle && (
          <VehicleFleetModal
            inventoryId={selectedVehicle.id}
            type={selectedVehicle.type}
            image={selectedVehicle.img}
            livePlate={selectedVehicle.licensePlate}
            onBoard={selectedVehicle.on_board}
            ac={selectedVehicle.ac}
            fleetInfo={resolveFleetInfo(
              selectedVehicle.licensePlate,
              selectedVehicle.id
            )}
            onClose={() => setSelectedVehicle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
