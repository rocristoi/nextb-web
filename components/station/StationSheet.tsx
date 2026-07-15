"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StationPanel } from "./StationPanel";
import { ro } from "@/lib/i18n";

export function StationSheet({
  stationId,
  open,
  onOpenChange,
}: {
  stationId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AnimatePresence>
      {open && stationId != null && stationId > 0 && (
        <>
          <motion.button
            type="button"
            aria-label={ro.station.closePanel}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-background lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 420 }}
          >
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-elevated-2" />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-5 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-2">
              <StationPanel stationId={stationId} onClose={() => onOpenChange(false)} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function StationDesktopPanel({
  stationId,
  onClose,
}: {
  stationId: number | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {stationId != null && stationId > 0 && (
        <motion.aside
          key={stationId}
          initial={{ x: "100%", opacity: 0.6 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 32, stiffness: 380 }}
          className="hidden h-dvh w-[340px] shrink-0 flex-col overflow-hidden border-l border-elevated bg-background lg:flex"
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-5">
            <StationPanel stationId={stationId} onClose={onClose} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
