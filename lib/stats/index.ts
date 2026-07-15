import statsData from "./stats.json";

/** Fleet/network stats for the landing and fleet pages. Edit `stats.json` manually when numbers change. */

export type BarItem = { label: string; count: number };

export type TransitStats = {
  summary: {
    buses: number;
    trolleybuses: number;
    trolleybusesTotal: number;
    trams: number;
    tramsTotal: number;
    stops: number;
    lines: { tram: number; bus: number; trolleybus: number; total: number };
    acReports: number;
  };
  buses: {
    otokarCount: number;
    citaroCount: number;
    cityTourCount: number;
    total: number;
    byDepot: { depot: string; count: number }[];
    kmBuckets: BarItem[];
    citaroWithKm: number;
    citaroAcRetrofit: number;
  };
  trolleybuses: {
    active: number;
    retired: number;
    byManufacturer: BarItem[];
    byModel: BarItem[];
    byDepot: BarItem[];
    byDecade: BarItem[];
  };
  trams: {
    active: number;
    retired: number;
    withAc: number;
    byType: BarItem[];
    byDepot: BarItem[];
  };
  network: {
    lines: { tram: number; bus: number; trolleybus: number; total: number };
    stops: number;
  };
  community: {
    legacyAcReports: number;
  };
};

export const transitStats = statsData as TransitStats;
