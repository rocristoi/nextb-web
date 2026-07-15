import { cn } from "@/lib/utils";

export function NexTBLogo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-[15px]",
    md: "text-[19px]",
    lg: "text-[2rem]",
  };

  return (
    <span
      className={cn("inline-flex items-baseline leading-none", sizes[size], className)}
      aria-label="NexTB"
    >
      <span className="font-medium tracking-tight text-foreground">nex</span>
      <span className="font-bold tracking-tight text-[#a30010]">TB</span>
    </span>
  );
}
