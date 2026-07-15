export type AcConfidence = "ok" | "uncertain" | "broken" | "none";
export type ComfortTier = "great" | "ok" | "poor";

export type RouteInfo = {
  id: string | number;
  color: string;
  type: string;
  agency_id?: string;
};

export type RoutesMap = Record<string, RouteInfo>;

export type VehicleArrival = {
  id: number | null;
  distance: number;
  position: [number, number];
  plate: string;
  on_board: number | null;
  ac: boolean;
  acConfidence?: AcConfidence;
  comfortScore?: number;
  comfortTier?: ComfortTier;
  stopsAway?: number | null;
  type: string;
  image: string | null;
  time?: number | string;
};

export type StationResponse = {
  name: string;
  address: string;
  lines: Record<string, VehicleArrival[]>;
};

export type Stop = {
  stop_id: number | string;
  stop_name?: string;
  stop_lat: number;
  stop_lon: number;
  location_type?: number | string;
  parent_station?: string;
  stop_desc?: string;
};

export type StopSearchEntry = {
  stop_id: number;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
};

export type RouteVehicle = {
  id: number | null;
  type: string;
  img: string | null;
  on_board: number | null;
  ac: boolean;
  acConfidence?: AcConfidence;
  comfortScore?: number;
  comfortTier?: ComfortTier;
  stopsAway?: number | null;
  licensePlate: string | null;
  position: { latitude: number; longitude: number };
  vehicle: {
    vehicle: {
      id: string;
      th_id?: number;
      licensePlate?: string;
    };
    position: { latitude: number; longitude: number };
    trip: { routeId: string; directionId: number };
  };
};

export type RouteShapeResponse = {
  tour: { shape: [number, number][]; vehicles: RouteVehicle[] };
  retour: { shape: [number, number][]; vehicles: RouteVehicle[] };
};

export type AlertLine = { name: string; color: string };

export type Alert = {
  id: string;
  title: string;
  message?: string;
  created_at: string;
  lines?: AlertLine[];
};

export type AlertsResponse = {
  notifications: Alert[];
};

export type AcVoteStatus = {
  vehicleId: number;
  brokenVotes: number;
  workingVotes: number;
  confidence: AcConfidence;
};

export type VehicleSearchResult = {
  inventory: number;
  plate: string;
  model: string | null;
  image: string | null;
  depot?: string;
  km?: number | null;
  family?: string;
  ac?: boolean;
  acConfidence?: AcConfidence;
  live?: {
    routeId: string;
    lineName?: string;
    lineType?: string;
    on_board: number | null;
  } | null;
};
