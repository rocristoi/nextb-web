"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { X } from "@phosphor-icons/react";
import { ro } from "@/lib/i18n";

const BANNER_KEY = "nextb-banner-dismissed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getBannerVisible() {
  try {
    return localStorage.getItem(BANNER_KEY) !== "1";
  } catch {
    return true;
  }
}

export function HomeDisclaimerBanner() {
  const storedVisible = useSyncExternalStore(subscribe, getBannerVisible, () => true);
  const [dismissedLocally, setDismissedLocally] = useState(false);
  const visible = storedVisible && !dismissedLocally;

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(BANNER_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissedLocally(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl bg-elevated px-4 py-3">
      <p className="flex-1 text-[13px] leading-relaxed text-muted">{ro.home.disclaimerBanner}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:text-foreground"
        aria-label={ro.home.dismissBanner}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
