import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{
  className?: string;
  weight?: "regular" | "fill" | "duotone" | "bold";
}>;

export function PageHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: IconComponent;
  className?: string;
}) {
  return (
    <header className={cn("mb-8", className)}>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="mt-1 text-[15px] text-muted">{subtitle}</p>}
    </header>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("mb-3 text-[13px] font-medium text-muted", className)}>
      {children}
    </h2>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-elevated", className)} />
  );
}

export function Card({
  children,
  className,
  hover,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl bg-card p-5 text-left",
        hover && "cursor-pointer transition-colors hover:bg-elevated active:bg-elevated-2",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function Switch({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "group relative inline-flex h-[30px] w-[50px] shrink-0 cursor-pointer items-center rounded-full p-[3px] transition-[background-color,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.97]",
        checked
          ? "bg-accent shadow-[0_0_12px_rgba(77,141,255,0.35)]"
          : "bg-elevated-2 ring-1 ring-inset ring-foreground/[0.06]",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block h-[24px] w-[24px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18),0_0_1px_rgba(0,0,0,0.08)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-active:shadow-[0_1px_2px_rgba(0,0,0,0.15)]",
          checked ? "translate-x-5 shadow-[0_2px_6px_rgba(0,0,0,0.22)]" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-[15px] font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-muted">{description}</p>
      )}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl bg-card px-4 py-3.5 text-foreground placeholder:text-muted outline-none transition-colors focus:bg-elevated",
        className
      )}
      {...props}
    />
  );
}
