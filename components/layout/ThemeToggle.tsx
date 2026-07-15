"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ro } from "@/lib/i18n";

export function ThemeToggle({ className, compact }: { className?: string; compact?: boolean }) {
  const { theme, toggleTheme } = useStore();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex items-center rounded-xl text-muted transition-colors hover:bg-elevated hover:text-foreground",
        compact ? "w-full gap-3 px-3 py-2.5 text-[14px] font-medium" : "h-10 w-10 justify-center",
        className
      )}
      aria-label={isDark ? ro.theme.switchToLight : ro.theme.switchToDark}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px] shrink-0" />
      ) : (
        <Moon className="h-[18px] w-[18px] shrink-0" />
      )}
      {compact && <span>Schimbă tema</span>}
    </button>
  );
}
