import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  checkboxBoxStyles,
  checkboxCheckmark,
  checkboxLabelSizes,
  checkboxWrap,
  type CheckboxSize,
} from "./Checkbox.styles";

export type { CheckboxSize } from "./Checkbox.styles";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  size?: CheckboxSize;
  /** Visible label rendered next to the box. */
  label?: ReactNode;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ size = "md", label, className, disabled, ...rest }, ref) => (
    <label
      className={cn(
        checkboxWrap,
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="peer sr-only"
        disabled={disabled}
        {...rest}
      />
      <span className={checkboxBoxStyles(size)}>
        <span className={checkboxCheckmark} aria-hidden="true" />
      </span>
      {label !== undefined && (
        <span className={cn(checkboxLabelSizes[size], "text-era-primary")}>
          {label}
        </span>
      )}
    </label>
  ),
);

Checkbox.displayName = "Checkbox";
