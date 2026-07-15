"use client";

import { ThemeSync } from "./ThemeSync";
import { NavigationProgress } from "./NavigationProgress";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationProgress />
      <ThemeSync />
      {children}
    </>
  );
}
