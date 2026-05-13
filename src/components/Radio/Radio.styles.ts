import { cn } from "@/utils/cn";

export type RadioSize = "sm" | "md" | "lg";

export const radioDotSizes: Record<RadioSize, string> = {
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
  lg: "w-5 h-5",
};

export const radioLabelSizes: Record<RadioSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const radioWrap =
  "inline-flex items-center gap-2 cursor-pointer select-none";

export function radioDotStyles(size: RadioSize = "md"): string {
  return cn(
    "relative inline-flex items-center justify-center shrink-0",
    "rounded-full bg-era-sunken border-era-strong",
    "transition-colors duration-era ease-era-brush",
    "peer-checked:border-[rgb(var(--accent-700))]",
    "peer-checked:[background:radial-gradient(circle,rgb(var(--accent-600))_35%,var(--era-surface-sunken)_45%)]",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--accent-500)/0.3)]",
    "peer-disabled:opacity-40",
    radioDotSizes[size],
  );
}
