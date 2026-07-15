"use client";

import useSWR from "swr";
import type { AlertsResponse, RouteShapeResponse, RoutesMap, StationResponse, Stop } from "@/lib/types";
import { fetchJson } from "@/lib/api";

const fetcher = <T,>(url: string) => fetchJson<T>(url);

export function useStops() {
  return useSWR<Stop[]>("/api/getstops", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export function useRoutes() {
  return useSWR<RoutesMap>("/api/routes", fetcher, {
    revalidateOnFocus: false,
  });
}

export function useStation(stationId: number | null) {
  return useSWR<StationResponse>(
    stationId ? `/api?stationID=${stationId}` : null,
    fetcher,
    {
      refreshInterval: 45000,
      errorRetryCount: 2,
      shouldRetryOnError: (err) => (err as { status?: number }).status === 503,
    }
  );
}

export function useAlerts() {
  return useSWR<AlertsResponse>("/api/alerts", fetcher, {
    refreshInterval: 300000,
  });
}

export function useRouteShape(shapeId: string | null, name?: string) {
  const query = shapeId
    ? `/api/routeShape?shapeId=${shapeId}${name ? `&name=${encodeURIComponent(name)}` : ""}`
    : null;
  return useSWR<RouteShapeResponse>(query, fetcher, {
    refreshInterval: 10000,
  });
}
