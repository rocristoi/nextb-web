"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Warning, X } from "@phosphor-icons/react";

const BANNER_KEY = "nextb-beta-notice-dismissed";
const GITHUB_URL = "https://github.com/rocristoi/nextb-web";

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

export function HomeBetaBanner() {
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
    <div
      role="status"
      className="mb-4 flex items-start gap-2.5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3.5"
    >
      <Warning className="mt-0.5 h-4 w-4 shrink-0 text-danger/80" weight="regular" />
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-foreground/90">
        <p>
          <span className="font-semibold text-danger">Atenție!</span>
          {" "}
          NexTB este încă în versiune beta. Sistemul de estimare a timpului de sosire nu este încă
          finalizat - estimările pot fi inexacte. În plus, API-ul mo-bi returnează uneori valori
          eronate pentru poziția GPS a vehiculelor.
        </p>
        <p className="mt-1.5 text-muted">
          Vrei să ajuți la îmbunătățirea NexTB?{" "}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-danger underline underline-offset-2"
          >
            Contribuie pe GitHub
          </a>
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        aria-label="Închide"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
