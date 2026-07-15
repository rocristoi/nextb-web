import { describe, it, expect } from "vitest";
import { soonestEta, countActiveLines } from "@/lib/station/helpers";

describe("station helpers", () => {
  it("finds soonest ETA across lines", () => {
    const lines = {
      "84": [{ time: 5 } as never],
      "123": [{ time: 2 } as never],
    };
    expect(soonestEta(lines)).toBe(2);
  });

  it("counts active lines", () => {
    const lines = {
      "84": [{ time: 1 } as never],
      "123": [],
    };
    expect(countActiveLines(lines)).toBe(1);
  });
});
