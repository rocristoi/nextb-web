import { describe, it, expect } from "vitest";
import {
  computeComfortScore,
  comfortTierFromScore,
  crowdPoints,
  acPointsFromConfidence,
  typeHasAc,
} from "@/lib/comfort/score";

describe("comfort score", () => {
  it("scores great when AC ok and low crowd", () => {
    const score = computeComfortScore("ok", 10);
    expect(score).toBeGreaterThan(0.75);
    expect(comfortTierFromScore(score)).toBe("great");
  });

  it("scores poor when AC broken and crowded", () => {
    const score = computeComfortScore("broken", 60);
    expect(comfortTierFromScore(score)).toBe("poor");
  });

  it("handles null passengers", () => {
    expect(crowdPoints(null)).toBe(0.5);
  });

  it("uncertain AC gives partial points", () => {
    expect(acPointsFromConfidence("uncertain")).toBe(0.4);
  });

  it("treats M-Benz Citaro EURO 3 as non-AC by default", () => {
    expect(typeHasAc("M-Benz Citaro EURO 3")).toBe(false);
  });
});
