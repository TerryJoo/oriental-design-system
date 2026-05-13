import { cn } from "@/utils/cn";

export const emptyStateWrap = cn(
  "w-full max-w-md mx-auto px-6 py-10 text-center",
  "border border-dashed border-era-soft rounded-card",
);
export const emptyStateIcon = "text-3xl opacity-60 mb-2 block";
export const emptyStateTitle = cn(
  "font-era-display tracking-era-display case-era",
  "text-base font-bold text-era-primary mb-1",
);
export const emptyStateMessage = "text-xs text-era-muted mb-3";
