import { ro } from "@/lib/i18n";

export function FleetObservationsCard({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-xl bg-elevated p-3.5">
      <p className="mb-1.5 text-[12px] font-medium text-muted">{ro.fleet.observations}</p>
      <p className="text-[14px] leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
