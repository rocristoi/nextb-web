import { describe, expect, it } from "vitest";
import {
  estimateMinEtaMinutes,
  isEtaPlausible,
  sanitizeLeadEta,
} from "@/lib/server/data-quality";

describe("data-quality ETA checks", () => {
  it("flags 1 min ETA when vehicle is many stops away", () => {
    const distanceMeters = 11 * 350;
    expect(isEtaPlausible(1, distanceMeters, "bus")).toBe(false);
  });

  it("accepts ETA consistent with distance", () => {
    expect(isEtaPlausible(5, 700, "bus")).toBe(true);
    expect(isEtaPlausible(22, 11 * 350, "bus")).toBe(true);
  });

  it("corrects implausible mo-bi ETA using distance", () => {
    const distanceMeters = 11 * 350;
    const result = sanitizeLeadEta(60, distanceMeters, "bus");
    expect(result.corrected).toBe(true);
    expect(result.reason).toBe("eta_distance_mismatch");
    expect(result.time).toBeGreaterThanOrEqual(estimateMinEtaMinutes(distanceMeters, "bus"));
  });

  it("keeps plausible mo-bi ETA", () => {
    const result = sanitizeLeadEta(180, 700, "tram");
    expect(result.corrected).toBe(false);
    expect(result.time).toBe(3);
  });

  it("returns near-zero minimum for vehicles at the stop", () => {
    expect(estimateMinEtaMinutes(50, "bus")).toBe(0);
  });
});
