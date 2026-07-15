import { describe, expect, it } from "vitest";
import { isVehicleCompatibleWithLine } from "@/lib/server/resolve-vehicle";

describe("isVehicleCompatibleWithLine", () => {
  it("allows matching vehicle and line modes", () => {
    expect(isVehicleCompatibleWithLine("bus", "bus")).toBe(true);
    expect(isVehicleCompatibleWithLine("tram", "tram")).toBe(true);
    expect(isVehicleCompatibleWithLine("trolleybus", "trolleybus")).toBe(true);
  });

  it("rejects mismatched modes", () => {
    expect(isVehicleCompatibleWithLine("bus", "tram")).toBe(false);
    expect(isVehicleCompatibleWithLine("tram", "bus")).toBe(false);
    expect(isVehicleCompatibleWithLine("trolleybus", "bus")).toBe(false);
  });

  it("allows unknown vehicle mode", () => {
    expect(isVehicleCompatibleWithLine("unknown", "tram")).toBe(true);
    expect(isVehicleCompatibleWithLine("unknown", "bus")).toBe(true);
  });

  it("allows any mode when line mode is missing", () => {
    expect(isVehicleCompatibleWithLine("bus", undefined)).toBe(true);
    expect(isVehicleCompatibleWithLine("tram", undefined)).toBe(true);
  });
});
