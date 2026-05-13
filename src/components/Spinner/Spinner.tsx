import { forwardRef, type HTMLAttributes } from "react";
import { spinnerStyles, type SpinnerSize } from "./Spinner.styles";

export type { SpinnerSize } from "./Spinner.styles";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  /** Localized label for assistive tech. */
  label?: string;
  className?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ size = "md", label = "로딩 중", className, ...rest }, ref) => (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      className={spinnerStyles({ size, className })}
      {...rest}
    >
      <span className="sr-only">{label}</span>
    </span>
  ),
);

Spinner.displayName = "Spinner";
