import { cn } from "@/lib/utils";
import {
  formatEtaLabel,
  etaTextClass,
  getEtaDisplay,
} from "@/lib/station/helpers";
import { ro } from "@/lib/i18n";

/** Primary arrival time — number + unit, color-coded */
export function DepartureTime({
  time,
  className,
  prominent,
}: {
  time: number | string | undefined | null;
  className?: string;
  prominent?: boolean;
}) {
  const { primary, secondary } = getEtaDisplay(time);

  if (primary === ro.eta.now) {
    return (
      <span
        className={cn(
          "font-bold text-success",
          prominent ? "text-lg" : "text-sm",
          className
        )}
      >
        {ro.eta.now}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", className)}>
      <span
        className={cn(
          "font-bold leading-none",
          prominent ? "text-xl" : "text-base",
          etaTextClass(time)
        )}
      >
        {primary}
      </span>
      {secondary && (
        <span className="text-xs font-medium text-muted">{secondary}</span>
      )}
    </span>
  );
}

/** @deprecated use DepartureTime */
export function EtaTime({
  time,
  className,
  large,
}: {
  time: number | string | undefined | null;
  className?: string;
  large?: boolean;
}) {
  return (
    <DepartureTime time={time} className={className} prominent={large} />
  );
}

/** @deprecated use DepartureTime */
export function EtaBadge({
  time,
  size = "md",
  className,
}: {
  time: number | string | undefined | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <DepartureTime
      time={time}
      className={className}
      prominent={size === "lg"}
    />
  );
}

export { formatEtaLabel };
