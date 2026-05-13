import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  switchThumbStyles,
  switchTrackStyles,
  switchWrap,
  type SwitchSize,
} from "./Switch.styles";

export type { SwitchSize } from "./Switch.styles";

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  size?: SwitchSize;
  label?: ReactNode;
  className?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ size = "md", label, className, disabled, ...rest }, ref) => (
    <label
      className={cn(
        switchWrap,
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className="peer sr-only"
        disabled={disabled}
        {...rest}
      />
      <span className={switchTrackStyles(size)}>
        <span className={switchThumbStyles(size)} />
      </span>
      {label !== undefined && (
        <span className="text-sm text-era-primary">{label}</span>
      )}
    </label>
  ),
);

Switch.displayName = "Switch";
