"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import { ro } from "@/lib/i18n";

const BANNER_KEY = "nextb-banner-dismissed";

export function HomeDisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(BANNER_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(BANNER_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

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
