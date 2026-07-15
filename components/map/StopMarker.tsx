"use client";

import { memo } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ro } from "@/lib/i18n";

export const StopDot = memo(function StopDot({
  selected,
  onClick,
  stopId,
}: {
  selected: boolean;
  onClick: () => void;
  stopId: string;
}) {
  const theme = useStore((s) => s.theme);
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (navigator.vibrate) navigator.vibrate(10);
        onClick();
      }}
      className={cn(
        "group relative flex items-center justify-center",
        "h-[22px] w-[22px] touch-none",
        "transition-transform duration-200 ease-out will-change-transform",
        selected ? "z-10 scale-125" : "scale-100 hover:scale-110"
      )}
      aria-label={ro.map.stop(stopId)}
      aria-pressed={selected}
    >
      {selected && (
        <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
      )}

      <span
        className={cn(
          "absolute rounded-full bg-accent transition-all duration-200",
          selected ? "inset-0 shadow-[0_0_12px_rgba(77,141,255,0.55)]" : "inset-[3px]"
        )}
      />

      <span
        className={cn(
          "relative rounded-full transition-all duration-200",
          isLight ? "bg-[#171717]" : "bg-white",
          selected
            ? "h-2.5 w-2.5 ring-2 ring-accent"
            : "h-2 w-2 group-hover:h-2.5 group-hover:w-2.5"
        )}
      />
    </button>
  );
});

export const ClusterDot = memo(function ClusterDot({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  const theme = useStore((s) => s.theme);
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex items-center justify-center rounded-full font-bold shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95",
        isLight
          ? "bg-[#171717] text-white shadow-black/20"
          : "bg-accent text-white shadow-[0_2px_12px_rgba(77,141,255,0.45)]",
        count > 9 ? "h-9 w-9 text-xs" : "h-8 w-8 text-sm"
      )}
    >
      {count > 9 ? "9+" : count}
    </button>
  );
});
