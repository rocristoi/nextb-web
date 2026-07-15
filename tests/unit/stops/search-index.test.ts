import { describe, it, expect } from "vitest";
import { buildStopSearchIndex, searchStops, isInBucharestBbox } from "@/lib/stops/search-index";
import type { Stop } from "@/lib/types";

describe("stop search index", () => {
  const stops: Stop[] = [
    {
      stop_id: 100,
      stop_name: "Universitate",
      stop_lat: 44.435,
      stop_lon: 26.102,
      location_type: 0,
      parent_station: "",
    },
    {
      stop_id: 101,
      stop_name: "Universitate",
      stop_lat: 44.436,
      stop_lon: 26.103,
      location_type: 0,
      parent_station: "",
    },
    {
      stop_id: "PV1_999",
      stop_name: "Bad",
      stop_lat: 44.44,
      stop_lon: 26.1,
      location_type: 0,
      parent_station: "",
    },
  ];

  it("filters non-numeric stop ids", () => {
    const index = buildStopSearchIndex(stops);
    expect(index.every((s) => typeof s.stop_id === "number")).toBe(true);
  });

  it("dedupes by name keeping lowest id", () => {
    const index = buildStopSearchIndex(stops);
    const uni = index.find((s) => s.stop_name === "Universitate");
    expect(uni?.stop_id).toBe(100);
  });

  it("searches by prefix", () => {
    const index = buildStopSearchIndex(stops);
    const results = searchStops(index, "univ");
    expect(results[0]?.stop_name).toBe("Universitate");
  });

  it("bbox check", () => {
    expect(isInBucharestBbox(44.44, 26.1)).toBe(true);
    expect(isInBucharestBbox(45, 26.1)).toBe(false);
  });
});
