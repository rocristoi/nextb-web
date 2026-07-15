/** Normalize line color from API — may already include `#` or be a bare hex string. */
export function normalizeLineColor(color: string | undefined | null): string {
  if (!color) return "#6b7280";
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) return trimmed;
  return `#${trimmed}`;
}
