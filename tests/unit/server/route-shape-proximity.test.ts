import { describe, expect, it } from "vitest";
import {
  getShapeProximity,
  isOnRouteShape,
  ROUTE_SHAPE_PROXIMITY_METERS,
} from "@/lib/server/route-shape-proximity";

describe("route-shape-proximity", () => {
  const shape: [number, number][] = [
    [44.4268, 26.1025],
    [44.4278, 26.1035],
    [44.4288, 26.1045],
  ];

  it("treats a point on the segment as on-route", () => {
    const midpoint: [number, number] = [44.4273, 26.103];
    const proximity = getShapeProximity(midpoint, shape);
    expect(proximity).not.toBeNull();
    expect(proximity!.minDist).toBeLessThanOrEqual(ROUTE_SHAPE_PROXIMITY_METERS);
    expect(isOnRouteShape(midpoint, shape)).toBe(true);
  });

  it("treats a far-off point as off-route", () => {
    const far: [number, number] = [44.5, 26.2];
    const proximity = getShapeProximity(far, shape);
    expect(proximity).not.toBeNull();
    expect(proximity!.minDist).toBeGreaterThan(ROUTE_SHAPE_PROXIMITY_METERS);
    expect(isOnRouteShape(far, shape)).toBe(false);
  });
});
