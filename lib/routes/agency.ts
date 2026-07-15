/** GTFS agency_id values for STB surface lines (not regional operators). */
const STB_AGENCY_IDS = new Set(["1", "STB", ""]);

/** Metro agency in GTFS — excluded from surface lines list separately. */
const METRO_AGENCY_ID = "2";

export function isRegionalOperator(agencyId?: string): boolean {
  if (!agencyId || STB_AGENCY_IDS.has(agencyId) || agencyId === METRO_AGENCY_ID) {
    return false;
  }
  return true;
}

export function isStbSurfaceLine(agencyId?: string): boolean {
  if (!agencyId) return true;
  return STB_AGENCY_IDS.has(agencyId);
}
