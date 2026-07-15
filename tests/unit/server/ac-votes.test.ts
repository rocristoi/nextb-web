import { describe, it, expect } from "vitest";
import { confidenceFromVotes } from "@/lib/server/ac-votes";

describe("ac vote confidence", () => {
  it("marks broken at 5+ net votes", () => {
    expect(confidenceFromVotes(6, 1, "bus")).toBe("broken");
  });

  it("marks uncertain at 1-4 net votes", () => {
    expect(confidenceFromVotes(3, 0, "bus")).toBe("uncertain");
  });

  it("marks none for types without AC", () => {
    expect(confidenceFromVotes(10, 0, "V3A-93")).toBe("none");
  });
});
