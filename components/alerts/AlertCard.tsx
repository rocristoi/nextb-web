"use client";

import { memo, useState, useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { CaretDown } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import type { Alert } from "@/lib/types";
import { normalizeLineColor } from "@/lib/colors";
import { cn, formatAlertDate, formatRelativeTime } from "@/lib/utils";
import { ro } from "@/lib/i18n";

const AlertCard = memo(function AlertCard({
  alert,
  compact,
}: {
  alert: Alert;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasLongMessage = (alert.message?.length ?? 0) > 180;

  const sanitized = useMemo(
    () => (alert.message ? DOMPurify.sanitize(alert.message) : ""),
    [alert.message]
  );

  return (
    <motion.article
      layout
      className={cn("rounded-2xl bg-card p-5", compact && "p-4")}
    >
      <h2
        className={cn(
          "font-semibold leading-snug text-foreground",
          compact ? "text-[15px]" : "text-[17px]"
        )}
      >
        {alert.title}
      </h2>

      {alert.lines && alert.lines.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {alert.lines.map((line) => (
            <span
              key={`${alert.id}-${line.name}`}
              className="inline-flex min-w-[2.75rem] items-center justify-center rounded-full px-3 py-1 text-[13px] font-bold text-white"
              style={{ backgroundColor: normalizeLineColor(line.color) }}
            >
              {line.name}
            </span>
          ))}
        </div>
      )}

      {sanitized && (
        <div className="mt-3">
          <motion.div
            initial={false}
            animate={{ height: expanded || !hasLongMessage ? "auto" : 72 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className="alert-body"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          </motion.div>
          {hasLongMessage && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-2.5 flex items-center gap-1 text-[13px] font-medium text-muted transition-colors hover:text-foreground"
            >
              {expanded ? ro.alerts.showLess : ro.alerts.readMore}
              <CaretDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  expanded && "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      )}

      <p className="mt-4 text-[13px] text-muted">
        <time dateTime={alert.created_at} title={formatAlertDate(alert.created_at)}>
          {formatRelativeTime(alert.created_at)}
          {!compact && <> · {formatAlertDate(alert.created_at)}</>}
        </time>
      </p>
    </motion.article>
  );
});

export { AlertCard };
