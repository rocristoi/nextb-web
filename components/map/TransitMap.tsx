"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import { Crosshair } from "@phosphor-icons/react";
import type { Stop } from "@/lib/types";
import { isValidMapStop } from "@/lib/stops/search-index";
import { useStore } from "@/lib/store";
import { getMapStyle } from "@/lib/map/styles";
import { StopDot, ClusterDot } from "./StopMarker";
import { ro } from "@/lib/i18n";
import "maplibre-gl/dist/maplibre-gl.css";

const BUCHAREST = { longitude: 26.102377, latitude: 44.426858, zoom: 12 };

const CLUSTER_RADIUS = 90;
const CLUSTER_MAX_ZOOM = 18;
/** Below this zoom, only cluster badges are shown (no lone stop dots). */
const INDIVIDUAL_STOPS_MIN_ZOOM = 11;

function effectiveClusterZoom(viewZoom: number): number {
  const z = Math.floor(viewZoom);
  if (z <= 9) return Math.max(0, z - 4);
  if (z <= 11) return z - 3;
  if (z <= 13) return z - 2;
  if (z <= 15) return z - 1;
  return z;
}

type Props = {
  stops: Stop[];
  selectedStopId: number | null;
  onSelectStop: (stopId: number) => void;
  flyTo?: { lat: number; lon: number } | null;
};

type PointProps = {
  stop_id: string;
  cluster?: boolean;
  point_count?: number;
};

type ClusterFeature = GeoJSON.Feature<GeoJSON.Point, PointProps>;

function isValidStop(stop: Stop): boolean {
  return isValidMapStop(stop);
}

function stopIdToNumber(id: string): number {
  const n = Number(id);
  return Number.isNaN(n) ? 0 : n;
}

export function TransitMap({ stops, selectedStopId, onSelectStop, flyTo }: Props) {
  const theme = useStore((s) => s.theme);
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(BUCHAREST);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const [zoom, setZoom] = useState(BUCHAREST.zoom);

  const points = useMemo(() => {
    return stops
      .filter(isValidStop)
      .map((stop) => ({
        type: "Feature" as const,
        properties: { stop_id: String(stop.stop_id) },
        geometry: {
          type: "Point" as const,
          coordinates: [Number(stop.stop_lon), Number(stop.stop_lat)],
        },
      }));
  }, [stops]);

  const index = useMemo(() => {
    const sc = new Supercluster<PointProps>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM,
    });
    sc.load(points);
    return sc;
  }, [points]);

  const clusters = useMemo(() => {
    if (!bounds) return [];
    return index.getClusters(bounds, effectiveClusterZoom(zoom)) as ClusterFeature[];
  }, [index, bounds, zoom]);

  const onMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
    setZoom(evt.viewState.zoom);
    const b = evt.target.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }, []);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map) {
      const b = map.getBounds();
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    }
  }, []);

  useEffect(() => {
    if (!flyTo || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyTo.lon, flyTo.lat],
      zoom: 15,
      duration: 800,
    });
  }, [flyTo]);

  const centerOnUser = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current?.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 15,
        duration: 1000,
      });
    });
  };

  return (
    <div className="relative h-full w-full min-w-0 overflow-hidden">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        mapStyle={getMapStyle(theme)}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {clusters.map((feature) => {
          const [lon, lat] = feature.geometry.coordinates;
          const isCluster = feature.properties.cluster;
          const featureKey = feature.id ?? `pt-${lon}-${lat}`;

          if (isCluster) {
            const count = feature.properties.point_count ?? 0;
            return (
              <Marker
                key={`cluster-${featureKey}`}
                longitude={lon}
                latitude={lat}
                anchor="center"
              >
                <ClusterDot
                  count={count}
                  onClick={() => {
                    mapRef.current?.flyTo({
                      center: [lon, lat],
                      zoom: zoom + 2,
                      duration: 500,
                    });
                  }}
                />
              </Marker>
            );
          }

          if (zoom < INDIVIDUAL_STOPS_MIN_ZOOM) return null;

          const stopIdStr = feature.properties.stop_id;
          const stopIdNum = stopIdToNumber(stopIdStr);
          const selected = selectedStopId === stopIdNum;

          return (
            <Marker
              key={`stop-${stopIdStr}`}
              longitude={lon}
              latitude={lat}
              anchor="center"
            >
              <StopDot
                stopId={stopIdStr}
                selected={selected}
                onClick={() => onSelectStop(stopIdNum)}
              />
            </Marker>
          );
        })}
      </Map>

      <button
        type="button"
        onClick={centerOnUser}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-[14px] font-medium text-foreground shadow-lg backdrop-blur transition-transform hover:scale-[1.02] active:scale-[0.98] lg:bottom-6"
        aria-label={ro.map.centerLocation}
      >
        <Crosshair className="h-4 w-4 shrink-0" weight="bold" />
        <span>{ro.map.myLocation}</span>
      </button>
    </div>
  );
}
