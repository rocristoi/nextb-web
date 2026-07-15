import haversine from "haversine-distance";
import * as turf from "@turf/turf";

export const ROUTE_SHAPE_PROXIMITY_METERS = 10;

function haversineDistance(point1: [number, number], point2: [number, number]) {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  return haversine({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
}

function projectPointOntoSegment(
  point: [number, number],
  segmentStart: [number, number],
  segmentEnd: [number, number]
) {
  const line = turf.lineString([segmentStart, segmentEnd]);
  const pt = turf.point(point);
  const snapped = turf.nearestPointOnLine(line, pt);
  return snapped.geometry.coordinates as [number, number];
}

export type ShapeProximityResult = {
  minDist: number;
  shapeProgressMeters: number;
  shapeLengthMeters: number;
};

export function getShapeProximity(
  vehCoords: [number, number],
  routeShape: [number, number][]
): ShapeProximityResult | null {
  if (!routeShape?.length) return null;

  let minDist = Infinity;
  let shapeProgressMeters = 0;
  let cumulative = 0;

  for (let i = 0; i < routeShape.length - 1; i++) {
    const segLen = haversineDistance(routeShape[i], routeShape[i + 1]);
    const projectedPoint = projectPointOntoSegment(
      vehCoords,
      routeShape[i],
      routeShape[i + 1]
    );
    const dist = haversineDistance(vehCoords, projectedPoint);
    if (dist < minDist) {
      minDist = dist;
      shapeProgressMeters =
        cumulative + haversineDistance(routeShape[i], projectedPoint);
    }
    cumulative += segLen;
  }

  return { minDist, shapeProgressMeters, shapeLengthMeters: cumulative };
}

export function isOnRouteShape(
  vehCoords: [number, number],
  routeShape: [number, number][] | null | undefined
): boolean {
  if (!routeShape?.length) return false;
  const proximity = getShapeProximity(vehCoords, routeShape);
  return proximity != null && proximity.minDist <= ROUTE_SHAPE_PROXIMITY_METERS;
}

export function shapeEndpointDistance(
  vehCoords: [number, number],
  shapeEnd: [number, number]
): number {
  const [lat1, lon1] = vehCoords;
  const [lat2, lon2] = shapeEnd;
  return haversine({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 });
}
