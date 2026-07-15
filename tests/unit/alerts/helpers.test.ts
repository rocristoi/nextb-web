import { describe, it, expect } from "vitest";
import { getAlertsForLine, linesWithActiveAlerts } from "@/lib/alerts/helpers";

describe("alert helpers", () => {
  const alerts = [
    {
      id: "1",
      title: "Test",
      created_at: "2026-01-01",
      lines: [{ name: "84", color: "ff0000" }],
    },
  ];

  it("matches alerts by line name", () => {
    expect(getAlertsForLine(alerts, "84")).toHaveLength(1);
    expect(getAlertsForLine(alerts, "123")).toHaveLength(0);
  });

  it("builds set of affected lines", () => {
    const routes = { "84": { id: "1", color: "f00", type: "bus" } };
    const set = linesWithActiveAlerts(alerts, routes);
    expect(set.has("84")).toBe(true);
  });
});
