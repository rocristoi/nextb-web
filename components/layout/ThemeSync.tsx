"use client";

import { useLayoutEffect, useRef } from "react";
import { useStore } from "@/lib/store";

function applyTheme(theme: "dark" | "light") {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

export function ThemeSync() {
  const theme = useStore((s) => s.theme);
  const skipInitialSync = useRef(true);

  useLayoutEffect(() => {
    if (skipInitialSync.current) {
      skipInitialSync.current = false;
      return;
    }
    applyTheme(theme);
  }, [theme]);

  return null;
}
