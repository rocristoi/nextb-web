/** Normalize Romanian plates for fuzzy matching (B 423 STB → B423STB). */
export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[\s\-_.]/g, "");
}
