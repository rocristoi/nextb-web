import type { Alert, RoutesMap } from "@/lib/types";

export function getAlertsForLine(alerts: Alert[], lineName: string): Alert[] {
  if (!lineName) return [];
  return alerts.filter((a) => a.lines?.some((l) => l.name === lineName));
}

export function linesWithActiveAlerts(
  alerts: Alert[],
  routes: RoutesMap
): Set<string> {
  const affected = new Set<string>();
  for (const routeName of Object.keys(routes)) {
    if (getAlertsForLine(alerts, routeName).length > 0) {
      affected.add(routeName);
    }
  }
  return affected;
}

export function favoriteLinesWithAlerts(
  alerts: Alert[],
  favoriteLineNames: string[]
): Alert[] {
  const seen = new Set<string>();
  const result: Alert[] = [];
  for (const line of favoriteLineNames) {
    for (const alert of getAlertsForLine(alerts, line)) {
      if (!seen.has(alert.id)) {
        seen.add(alert.id);
        result.push(alert);
      }
    }
  }
  return result;
}
