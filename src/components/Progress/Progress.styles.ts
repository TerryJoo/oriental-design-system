import { cn } from "@/utils/cn";

export type ProgressSize = "sm" | "md" | "lg";

export const progressTrack: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function progressTrackStyles(size: ProgressSize = "md"): string {
  return cn(
    "w-full rounded-full overflow-hidden bg-era-sunken border-era",
    progressTrack[size],
  );
}

export const progressBar = cn(
  "h-full rounded-full",
  "[background:linear-gradient(90deg,rgb(var(--accent-500)),rgb(var(--accent-700)))]",
  "motion-safe:transition-[width] duration-era-slow ease-era-brush",
);
