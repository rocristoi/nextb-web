"use client";

import { ThemeSync } from "./ThemeSync";
import { NavigationProgress } from "./NavigationProgress";
import { ServiceWorkerDevCleanup } from "./ServiceWorkerDevCleanup";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerDevCleanup />
      <NavigationProgress />
      <ThemeSync />
      {children}
    </>
  );
}
