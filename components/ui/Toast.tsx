"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ro } from "@/lib/i18n";

const TOAST_DURATION_MS = 4500;

type ToastType = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastConfig: Record<
  ToastType,
  {
    Icon: typeof CheckCircle;
    iconClass: string;
    accentClass: string;
    progressClass: string;
  }
> = {
  success: {
    Icon: CheckCircle,
    iconClass: "text-success",
    accentClass: "border-l-success",
    progressClass: "bg-success/80",
  },
  error: {
    Icon: WarningCircle,
    iconClass: "text-danger",
    accentClass: "border-l-danger",
    progressClass: "bg-danger/80",
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const { Icon, iconClass, accentClass, progressClass } = toastConfig[toast.type];

  return (
    <motion.div
      layout
      role="status"
      initial={{ opacity: 0, y: -24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: -16,
        scale: 0.94,
        transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
      }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 360,
        mass: 0.75,
      }}
      className={cn(
        "pointer-events-auto relative flex w-full max-w-[min(100%,22rem)] items-start gap-3 overflow-hidden rounded-2xl  bg-card/95 py-3.5 pl-3.5 pr-3 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.35)] backdrop-blur-xl",
        accentClass
      )}
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 420, delay: 0.06 }}
        className={cn("mt-0.5 shrink-0", iconClass)}
      >
        <Icon className="h-5 w-5" weight="fill" aria-hidden />
      </motion.div>

      <p className="flex-1 pt-0.5 text-[14px] font-medium leading-snug tracking-[-0.01em] text-foreground">
        {toast.message}
      </p>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-elevated hover:text-foreground active:scale-95"
        aria-label={ro.toast.dismiss}
      >
        <X className="h-4 w-4" />
      </button>

      <motion.div
        aria-hidden
        className={cn("absolute inset-x-0 bottom-0 h-[2px] origin-left", progressClass)}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: TOAST_DURATION_MS / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[100] flex flex-col items-center gap-2.5 px-4"
        aria-live="polite"
        aria-atomic="false"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
