export type MobiVehicleInner = {
  id?: string;
  th_id?: number;
  licensePlate?: string;
  license_plate?: string;
};

export type MobiVehiclePosition = {
  latitude: number;
  longitude: number;
};

export type MobiVehicleTrip = {
  routeId: string | number;
  directionId: number;
};

export type MobiVehicleFeedEntry = {
  id?: number;
  vehicle: {
    vehicle: MobiVehicleInner;
    position: MobiVehiclePosition;
    trip?: MobiVehicleTrip;
    timestamp?: number;
  };
};

export type MobiDatasetEntry = {
  vehicle: {
    vehicle: {
      th_id?: number;
      license_plate?: string;
    };
    passenger_info?: {
      on_board?: number | null;
    };
  };
};

export type MobiStationLine = {
  id: string | number;
  name: string;
  direction: number;
  arrivingTime?: number;
};

export type MobiStationArrivals = {
  name?: string;
  address?: string;
  lines?: MobiStationLine[];
};
