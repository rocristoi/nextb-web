"use client";

import { useState } from "react";
import { Snowflake, CheckCircle } from "@phosphor-icons/react";
import useSWR from "swr";
import { Card, PageHeader, SectionLabel, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { fetchJson } from "@/lib/api";
import type { AcVoteStatus } from "@/lib/types";
import { acConfidenceLabel, ro } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function FaultyPage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [loading, setLoading] = useState<"broken" | "working" | null>(null);
  const { showToast } = useToast();

  const { data, mutate, isLoading } = useSWR<{ statuses: AcVoteStatus[] }>(
    "/api/ac/status",
    fetchJson,
    { refreshInterval: 60000 }
  );

  const handleReport = async (vote: "broken" | "working") => {
    if (!vehicleNumber.trim()) {
      showToast(ro.faulty.enterNumber, "error");
      return;
    }
    setLoading(vote);
    try {
      await fetchJson("/api/ac/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: Number(vehicleNumber), vote }),
      });
      showToast(ro.faulty.voteRecorded);
      setVehicleNumber("");
      mutate();
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      showToast(e.data?.error ?? ro.faulty.networkError, "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-md lg:pb-10 lg:pt-10">
      <PageHeader title={ro.faulty.title} subtitle={ro.faulty.subtitle} />

      <Card className="mb-4">
        <SectionLabel className="mb-2 text-foreground">{ro.faulty.howItWorks}</SectionLabel>
        <p className="text-[14px] leading-relaxed text-muted">{ro.faulty.howItWorksText}</p>
      </Card>

      <Card className="mb-6">
        <Input
          type="number"
          inputMode="numeric"
          placeholder={ro.faulty.vehicleIdPlaceholder}
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          disabled={loading !== null}
          className="mb-4"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleReport("broken")}
            disabled={loading !== null || !vehicleNumber.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger py-3.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {loading === "broken" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Snowflake className="h-4 w-4" weight="bold" /> {ro.faulty.reportBroken}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleReport("working")}
            disabled={loading !== null || !vehicleNumber.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-success py-3.5 text-[14px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {loading === "working" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CheckCircle className="h-4 w-4" weight="bold" /> {ro.faulty.reportWorking}
              </>
            )}
          </button>
        </div>
      </Card>

      <SectionLabel>{ro.faulty.reportedList}</SectionLabel>
      {!data && isLoading && (
        <p className="text-[14px] text-muted">{ro.station.loading}</p>
      )}
      {!isLoading && (data?.statuses.length ?? 0) === 0 && (
        <p className="text-[14px] text-muted">{ro.faulty.noReports}</p>
      )}
      <div className="flex flex-col gap-2">
        {data?.statuses.map((s) => (
          <Card key={s.vehicleId}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">#{s.vehicleId}</p>
                <p className="mt-0.5 text-[12px] text-muted">
                  {ro.faulty.brokenVotes(s.brokenVotes)} · {ro.faulty.workingVotes(s.workingVotes)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[12px] font-semibold",
                  s.confidence === "broken" && "bg-danger/15 text-danger",
                  s.confidence === "uncertain" && "bg-accent/15 text-accent",
                  s.confidence === "ok" && "bg-success/15 text-success"
                )}
              >
                {acConfidenceLabel(s.confidence)}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
