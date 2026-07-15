"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(pathname);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress(8);
    timers.current.push(
      setTimeout(() => setProgress(45), 80),
      setTimeout(() => setProgress(72), 220),
      setTimeout(() => setProgress(88), 420)
    );
  }, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 280)
    );
  }, [clearTimers]);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      start();
      timers.current.push(setTimeout(complete, 520));
    }
    return clearTimers;
  }, [pathname, start, complete, clearTimers]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      if (href === pathname) return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, start]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      aria-hidden
    >
      <div
        className="h-full bg-gradient-to-r from-danger via-foreground to-danger shadow-[0_0_8px_var(--danger)] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
