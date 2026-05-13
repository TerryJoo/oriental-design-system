import { cn } from "@/utils/cn";

export type SpinnerSize = "sm" | "md" | "lg";

export const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-[3px]",
  lg: "w-10 h-10 border-4",
};

export interface SpinnerStyleProps {
  size?: SpinnerSize;
  className?: string;
}

export function spinnerStyles({
  size = "md",
  className,
}: SpinnerStyleProps = {}): string {
  return cn(
    "inline-block rounded-full border-era-soft motion-safe:animate-spin",
    "[border-top-color:rgb(var(--accent-600))]",
    spinnerSizes[size],
    className,
  );
}
