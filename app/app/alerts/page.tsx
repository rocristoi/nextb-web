"use client";

import { useAlerts } from "@/lib/hooks/useApi";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { AlertCard } from "@/components/alerts/AlertCard";
import { ro } from "@/lib/i18n";

export default function AlertsPage() {
  const { data, isLoading, isValidating } = useAlerts();
  const count = data?.notifications.length ?? 0;

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-xl lg:pb-10 lg:pt-10">
      <PageHeader title={ro.alerts.title} subtitle={ro.alerts.subtitle} />

      {!isLoading && count > 0 && (
        <p className="mb-6 text-[14px] text-muted">
          <span className="font-semibold text-foreground">{count}</span>{" "}
          {ro.alerts.active(count)}
          {isValidating && (
            <ArrowsClockwise className="ml-2 inline h-3.5 w-3.5 animate-spin opacity-60" />
          )}
        </p>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {!isLoading && count > 0 && (
        <div className="flex flex-col gap-3">
          {data!.notifications.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {!isLoading && count === 0 && (
        <EmptyState title={ro.alerts.allClear} description={ro.alerts.noAlerts} />
      )}
    </div>
  );
}
