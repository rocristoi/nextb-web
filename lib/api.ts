import { useStore } from "@/lib/store";

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const deviceId = useStore.getState().deviceId;
  const headers = new Headers(init?.headers);
  if (deviceId) headers.set("X-Device-Id", deviceId);

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error("Request failed") as Error & {
      status: number;
      data: unknown;
    };
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return res.json();
}
