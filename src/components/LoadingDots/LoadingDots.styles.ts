import { cn } from "@/utils/cn";

export type LoadingDotsSpeed = "slow" | "normal" | "fast";

const SPEED: Record<LoadingDotsSpeed, string> = {
  slow: "motion-safe:animate-dot-pulse-slow",
  normal: "motion-safe:animate-dot-pulse",
  fast: "motion-safe:animate-dot-pulse-fast",
};

export interface LoadingDotsStyleProps {
  speed?: LoadingDotsSpeed;
  className?: string;
}

export function loadingDotsContainerStyles({
  className,
}: LoadingDotsStyleProps = {}): string {
  return cn("inline-flex items-center gap-1.5", className);
}

export function loadingDotStyles(speed: LoadingDotsSpeed = "normal"): string {
  return cn("w-2 h-2 rounded-full bg-[rgb(var(--accent-600))]", SPEED[speed]);
}

export const loadingDotsSpeedMap = SPEED;
