import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import {
  progressBar,
  progressTrackStyles,
  type ProgressSize,
} from "./Progress.styles";

export type { ProgressSize } from "./Progress.styles";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 0 to 100. */
  value?: number;
  /** When true, show indeterminate (looping) animation instead of `value`. */
  indeterminate?: boolean;
  size?: ProgressSize;
  /** Optional label for assistive tech. */
  label?: string;
  className?: string;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      indeterminate = false,
      size = "md",
      label = "진행률",
      className,
      ...rest
    },
    ref,
  ) => {
    const clamped = Math.min(100, Math.max(0, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn(progressTrackStyles(size), className)}
        {...rest}
      >
        <div
          className={cn(
            progressBar,
            indeterminate && "motion-safe:animate-pulse-subtle",
          )}
          style={{ width: indeterminate ? "100%" : `${clamped}%` }}
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";
