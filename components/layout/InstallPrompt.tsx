"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DownloadSimple, X } from "@phosphor-icons/react";
import { ro } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "nextb-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const reduceMotion = useReducedMotion();
  const isOpen = !dismissed && deferred !== null;

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    setDismissed(false);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  }, [deferred]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-40",
        "inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom)+0.75rem)] px-4",
        "lg:inset-x-auto lg:bottom-6 lg:right-6 lg:px-0"
      )}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="install-prompt"
            role="dialog"
            aria-labelledby="install-prompt-title"
            aria-describedby="install-prompt-description"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.96 }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduceMotion
                ? { opacity: 0, transition: { duration: 0.15 } }
                : {
                    opacity: 0,
                    y: 16,
                    scale: 0.97,
                    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
                  }
            }
            transition={{
              type: "spring",
              damping: 26,
              stiffness: 340,
              mass: 0.8,
            }}
            className={cn(
              "pointer-events-auto mx-auto w-full max-w-md",
              "rounded-2xl bg-card/95 p-4 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)] backdrop-blur-xl",
              "ring-1 ring-foreground/8",
              "lg:mx-0 lg:max-w-sm"
            )}
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={reduceMotion ? false : { scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  damping: 14,
                  stiffness: 420,
                  delay: reduceMotion ? 0 : 0.05,
                }}
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elevated"
              >
                <DownloadSimple
                  className="h-5 w-5 text-foreground"
                  weight="bold"
                  aria-hidden
                />
              </motion.div>

              <div className="min-w-0 flex-1">
                <p
                  id="install-prompt-title"
                  className="text-[15px] font-semibold leading-snug text-foreground"
                >
                  {ro.install.title}
                </p>
                <p
                  id="install-prompt-description"
                  className="mt-1 text-[13px] leading-relaxed text-muted"
                >
                  {ro.install.description}
                </p>

                <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleInstall}
                    className={cn(
                      "min-h-10 rounded-xl bg-foreground px-4 py-2.5",
                      "text-[13px] font-semibold text-background",
                      "transition-transform active:scale-[0.98]",
                      "sm:flex-1"
                    )}
                  >
                    {ro.install.install}
                  </button>
                  <button
                    type="button"
                    onClick={dismiss}
                    className={cn(
                      "min-h-10 rounded-xl px-4 py-2.5",
                      "text-[13px] font-medium text-muted",
                      "transition-colors hover:bg-elevated hover:text-foreground active:scale-[0.98]",
                      "sm:shrink-0"
                    )}
                  >
                    {ro.install.notNow}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className={cn(
                  "shrink-0 rounded-lg p-1.5 text-muted",
                  "transition-colors hover:bg-elevated hover:text-foreground active:scale-95"
                )}
                aria-label={ro.install.dismiss}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
