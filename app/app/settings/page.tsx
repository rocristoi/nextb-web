"use client";

import Link from "next/link";
import {
  Snowflake,
  Users,
  Sun,
  Moon,
  Info,
  Star,
  Globe,
  GithubLogo,
  FileText,
  Shield,
  CaretRight,
} from "@phosphor-icons/react";
import { useStore } from "@/lib/store";
import { Card, Switch, PageHeader, SectionLabel } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ro } from "@/lib/i18n";

const GITHUB_URL = "https://github.com/rocristoi/nextb-web";

type IconComponent = React.ComponentType<{
  className?: string;
  weight?: "regular" | "fill" | "duotone" | "bold";
}>;

function SettingsIcon({ icon: Icon }: { icon: IconComponent }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elevated">
      <Icon className="h-[18px] w-[18px] text-foreground" />
    </div>
  );
}

function SettingsRow({
  icon,
  title,
  hint,
  children,
  border,
}: {
  icon: IconComponent;
  title: string;
  hint?: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-3.5",
        border && "border-t border-elevated"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SettingsIcon icon={icon} />
        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-snug text-foreground">{title}</p>
          {hint && <p className="mt-0.5 text-[13px] leading-snug text-muted">{hint}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ThemeSegmented() {
  const { theme, toggleTheme } = useStore();
  const isDark = theme === "dark";

  return (
    <div className="flex rounded-xl bg-elevated p-1">
      {(
        [
          { id: "light" as const, icon: Sun, label: ro.theme.light },
          { id: "dark" as const, icon: Moon, label: ro.theme.dark },
        ] as const
      ).map(({ id, icon: Icon, label }) => {
        const active = (id === "dark") === isDark;
        return (
          <button
            key={id}
            type="button"
            onClick={() => {
              if ((id === "dark") !== isDark) toggleTheme();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" weight={active ? "fill" : "regular"} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function AboutLink({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  icon: IconComponent;
  label: string;
  external?: boolean;
}) {
  const className =
    "flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium text-foreground transition-colors hover:bg-elevated active:bg-elevated-2";

  const content = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0 text-muted" weight={Icon === GithubLogo ? "fill" : "regular"} />
      <span className="flex-1">{label}</span>
      <CaretRight className="h-4 w-4 shrink-0 text-muted/60" />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function SettingsPage() {
  const {
    displayAdditionalInfo,
    toggleDisplayAdditionalInfo,
    selectedPrimaryDetail,
    setSelectedPrimaryDetail,
    showRegionalOperators,
    setShowRegionalOperators,
  } = useStore();

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-5 pb-28 pt-[calc(1.25rem+env(safe-area-inset-top))] lg:max-w-md lg:pb-10 lg:pt-10">
      <PageHeader title={ro.settings.title} subtitle={ro.settings.subtitle} />

      <section className="mb-10">
        <SectionLabel>{ro.settings.display}</SectionLabel>

        <Card className="overflow-hidden p-0">
          <SettingsRow icon={Sun} title={ro.settings.appearance} hint={undefined} >
            <ThemeSegmented />
          </SettingsRow>

          <SettingsRow
            icon={Info}
            title={ro.settings.additionalInfo}
            hint={ro.settings.additionalInfoHint}
            border
          >
            <Switch checked={displayAdditionalInfo} onChange={toggleDisplayAdditionalInfo} />
          </SettingsRow>

          <SettingsRow
            icon={Globe}
            title={ro.settings.regionalOperators}
            hint={ro.settings.regionalOperatorsHint}
            border
          >
            <Switch checked={showRegionalOperators} onChange={setShowRegionalOperators} />
          </SettingsRow>
        </Card>

        <Card className="mt-3">
          <div className="mb-4 flex items-center gap-3">
            <SettingsIcon icon={Star} />
            <div>
              <p className="text-[15px] font-medium text-foreground">{ro.settings.primaryDetail}</p>
              <p className="mt-0.5 text-[13px] text-muted">{ro.settings.primaryDetailHint}</p>
            </div>
          </div>
          <div className="flex gap-2 rounded-xl bg-elevated p-1">
            {(["ac", "psg"] as const).map((detail) => {
              const active = selectedPrimaryDetail === detail;
              return (
                <button
                  key={detail}
                  type="button"
                  onClick={() => setSelectedPrimaryDetail(detail)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-medium transition-all duration-200",
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {detail === "ac" ? (
                    <Snowflake className="h-4 w-4" weight={active ? "fill" : "regular"} />
                  ) : (
                    <Users className="h-4 w-4" weight={active ? "fill" : "regular"} />
                  )}
                  {detail === "ac" ? ro.station.ac : ro.settings.passengers}
                </button>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <SectionLabel>{ro.settings.about}</SectionLabel>

        <Card className="mb-3 overflow-hidden p-0">
          <div className="px-4 py-4">
            <p className="text-[13px] leading-relaxed text-muted">{ro.settings.disclaimer}</p>
          </div>
          <div className="border-t border-elevated px-4 py-1">
            <div className="flex items-center justify-between py-2.5 text-[14px]">
              <span className="text-muted">{ro.settings.version}</span>
              <span className="font-medium tabular-nums text-foreground">2.0.0 Web</span>
            </div>
            <div className="flex items-center justify-between border-t border-elevated py-2.5 text-[14px]">
              <span className="text-muted">{ro.settings.developer}</span>
              <span className="font-medium text-foreground">Cristian Capotă</span>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-1">
          <AboutLink href="/termeni" icon={FileText} label={ro.settings.terms} />
          <AboutLink href="/confidentialitate" icon={Shield} label={ro.settings.privacy} />
          <AboutLink href={GITHUB_URL} icon={GithubLogo} label={ro.settings.github} external />
        </Card>
      </section>
    </div>
  );
}
