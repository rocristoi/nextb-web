"use client";

import { useEffect } from "react";

/** Serwist is disabled in dev, but a stale production SW can still intercept fetches. */
export function ServiceWorkerDevCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        void registration.unregister();
      }
    });
  }, []);

  return null;
}
