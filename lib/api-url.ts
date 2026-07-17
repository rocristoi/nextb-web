/** Base URL for the NexTB API (no trailing slash). Empty = same origin (legacy). */
export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) return "";
  return base.replace(/\/$/, "");
}

/** Resolve an API path like `/api/getstops` against the configured backend. */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
