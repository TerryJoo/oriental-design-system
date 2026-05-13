import { cn } from "@/utils/cn";

export type EraSwitchSize = "sm" | "md" | "lg";

export const eraSwitchContainer = cn(
  "inline-flex items-center gap-1 p-1 rounded-pill",
  "bg-era-sunken border-era",
  "transition-colors duration-era ease-era-brush",
);

export const eraSwitchSizes: Record<EraSwitchSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const eraSwitchSegmentSizes: Record<EraSwitchSize, string> = {
  sm: "px-3 py-1",
  md: "px-4 py-1.5",
  lg: "px-5 py-2",
};

export interface EraSwitchSegmentStyleProps {
  active: boolean;
  size: EraSwitchSize;
  className?: string;
}

export function eraSwitchSegmentStyles({
  active,
  size,
  className,
}: EraSwitchSegmentStyleProps): string {
  return cn(
    "appearance-none cursor-pointer rounded-pill",
    "font-era-display tracking-era-display case-era font-bold",
    "transition-colors duration-era ease-era-brush",
    "focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:ring-offset-1",
    eraSwitchSegmentSizes[size],
    active
      ? "bg-accent-600 text-white shadow-era-card [text-shadow:var(--era-glow-inverse)]"
      : "bg-transparent text-era-muted hover:text-era-primary",
    className,
  );
}
