export type MapTheme = "dark" | "light";

export const MAP_STYLES: Record<MapTheme, string> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

export function getMapStyle(theme: MapTheme): string {
  return MAP_STYLES[theme];
}
