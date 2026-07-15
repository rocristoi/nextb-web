export function buildLineUrl(
  routeId: string | number,
  lineName: string,
  routeType: string,
  options?: { vehicleId?: number | null; plate?: string | null }
): string {
  const params = new URLSearchParams({
    name: lineName,
    type: routeType,
  });
  if (options?.vehicleId != null && options.vehicleId > 0) {
    params.set("vehicle", String(options.vehicleId));
  }
  if (options?.plate) {
    params.set("plate", options.plate);
  }
  return `/app/lines/${routeId}?${params.toString()}`;
}
