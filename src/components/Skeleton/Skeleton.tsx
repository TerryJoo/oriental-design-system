import { forwardRef, type HTMLAttributes } from "react";
import { skeletonStyles, type SkeletonShape } from "./Skeleton.styles";

export type { SkeletonShape } from "./Skeleton.styles";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  shape?: SkeletonShape;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ shape = "line", width, height, className, style, ...rest }, ref) => (
    <span
      ref={ref}
      aria-busy="true"
      aria-live="polite"
      className={skeletonStyles({ shape, className })}
      style={{ width, height, ...style }}
      {...rest}
    />
  ),
);

Skeleton.displayName = "Skeleton";
