const VEHICLE_IMAGE_BASE = "/vehicles";

export function vehicleImage(filename: string): string {
  return `${VEHICLE_IMAGE_BASE}/${filename}`;
}

const TIP_IMAGE_MAP: Record<string, string> = {
  "V3A-93": "BLF-2-3A6-417_STB_V.png",
  "V3A-93M": "BLF-2-3A6-417_STB_V.png",
  "V3A-93 PPC": "BLF-2-3A6-417_STB_V.png",
  "V3A-93 CH-PPC": "V3A-2006-1_STB_V.png",
  "V3A-93-CH-PPC": "V3A-2006-1_STB_V.png",
  "V3A-2010-PPC-CA": "V3A-2006-1_STB_V.png",
  "V3A-93M 2000": "V3A-2006-1_STB_V.png",
  "V3A-2S-93": "V3A-2S-93.png",
  "Astra Imperio Metropolitan": "AstraGT8_STB_V.png",
  "Imperio Metropolitan": "AstraGT8_STB_V.png",
  "Bucur 1 V2A-T": "V2AT.png",
  "V2A-T": "V2AT.png",
  "Bucur LF": "BLF-2-3A6-1_g2.png",
  "Bucur LF-CA": "BLF-2-3A6-1_g2.png",
  "Tatra T4R": "T4-3_STB_V.png",
};

const TIP_ALIASES: Record<string, string> = {
  "V3A-93-CH-PPC": "V3A-93 CH-PPC",
  "Bucur LF-CA": "Bucur LF",
  "Imperio Metropolitan": "Astra Imperio Metropolitan",
  "V2A-T": "Bucur 1 V2A-T",
};

export const CITY_TOUR_LINE_MIN = 994;
export const CITY_TOUR_LINE_MAX = 999;
export const CITY_TOUR_MODEL = "Volvo B9R UNVI Urbis";
export const CITY_TOUR_IMAGE = vehicleImage("city-tour.png");

export const ASTRA_IMPERIO_INVENTORY_MIN = 3801;
export const ASTRA_IMPERIO_INVENTORY_MAX = 3900;
export const ASTRA_IMPERIO_MODEL = "Astra Imperio Metropolitan";
export const ASTRA_IMPERIO_IMAGE = vehicleImage("AstraGT8_STB_V.png");

export function isAstraImperioId(id: number | null | undefined): boolean {
  if (id == null || id <= 0) return false;
  return id >= ASTRA_IMPERIO_INVENTORY_MIN && id <= ASTRA_IMPERIO_INVENTORY_MAX;
}

export const TRAM_TYPE_MAP: Record<string, [string, string]> = {
  "994-999": [CITY_TOUR_MODEL, "city-tour.png"],
  "3801-3900": [ASTRA_IMPERIO_MODEL, "AstraGT8_STB_V.png"],
  "4100-4599": ["M-Benz Citaro EURO 3", "4661.png"],
  "4600-4999": ["M-Benz Citaro EURO 4", "4661.png"],
  "6200-6299": ["M-Benz Citaro EURO 4", "4661.png"],
  "5301-5399": ["Irisbus Citelis", "Irisbus.png"],
  "5100-5300": ["Ikarus Astra 415T", "Ikarus_415T_STB_V.png"],
  "5400-5500": ["Solaris Trollino 12M", "Trollino+12.png"],
  "5601-5622": ["Yutong U12", "YutongU12.png"],
  "6300-6350": ["Otokar Kent 10m", "Otokar+C10.png"],
  "6400-6720": ["Otokar Kent 12m", "Otokar+C12.png"],
  "6800-6830": ["Otokar Kent 18m", "Otokar+C18.png"],
  "7000-7130": ["M-Benz Citaro Hibrid", "O530-D1-1-STB_V.png"],
  "7200-7300": ["ZTE Granton 12m", "ZTE-12m.png"],
};

export function getImageByTip(tip: string): string {
  const normalized = TIP_ALIASES[tip] ?? tip;
  const filename = TIP_IMAGE_MAP[normalized] ?? TIP_IMAGE_MAP[tip] ?? "unknown.png";
  return vehicleImage(filename);
}

export function getCityTourForLine(
  lineName: string | number | null | undefined
): { type: string; image: string } | null {
  const name = String(lineName ?? "").trim();
  if (name.toLowerCase() === "city tour") {
    return { type: CITY_TOUR_MODEL, image: CITY_TOUR_IMAGE };
  }
  const num = parseInt(name, 10);
  if (Number.isNaN(num) || num < CITY_TOUR_LINE_MIN || num > CITY_TOUR_LINE_MAX) {
    return null;
  }
  return { type: CITY_TOUR_MODEL, image: CITY_TOUR_IMAGE };
}

export function getImageFromTypeMap(id: number): [string, string] | null {
  for (const [range, value] of Object.entries(TRAM_TYPE_MAP)) {
    const [min, max] = range.split("-").map(Number);
    if (id >= min && id <= max) {
      return [value[0], vehicleImage(value[1])];
    }
  }
  return null;
}

export function isCitaroEuro3Inventory(id: number | null | undefined): boolean {
  if (id == null || id <= 0) return false;
  return id >= 4100 && id <= 4599;
}

export const UNKNOWN_VEHICLE_IMAGE = vehicleImage("unknown.png");
