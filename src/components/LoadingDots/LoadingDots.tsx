import { forwardRef, type HTMLAttributes } from "react";
import {
  loadingDotStyles,
  loadingDotsContainerStyles,
  type LoadingDotsSpeed,
} from "./LoadingDots.styles";

export type { LoadingDotsSpeed } from "./LoadingDots.styles";

export interface LoadingDotsProps extends HTMLAttributes<HTMLSpanElement> {
  speed?: LoadingDotsSpeed;
  label?: string;
  className?: string;
}

export const LoadingDots = forwardRef<HTMLSpanElement, LoadingDotsProps>(
  ({ speed = "normal", label = "로딩 중", className, ...rest }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={loadingDotsContainerStyles({ className })}
      {...rest}
    >
      <span
        className={loadingDotStyles(speed)}
        style={{ animationDelay: "0ms" }}
      />
      <span
        className={loadingDotStyles(speed)}
        style={{ animationDelay: "200ms" }}
      />
      <span
        className={loadingDotStyles(speed)}
        style={{ animationDelay: "400ms" }}
      />
    </span>
  ),
);

LoadingDots.displayName = "LoadingDots";
