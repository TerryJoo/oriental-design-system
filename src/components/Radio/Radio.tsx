import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  radioDotStyles,
  radioLabelSizes,
  radioWrap,
  type RadioSize,
} from "./Radio.styles";

export type { RadioSize } from "./Radio.styles";

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> {
  size?: RadioSize;
  label?: ReactNode;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ size = "md", label, className, disabled, ...rest }, ref) => (
    <label
      className={cn(
        radioWrap,
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        ref={ref}
        type="radio"
        className="peer sr-only"
        disabled={disabled}
        {...rest}
      />
      <span className={radioDotStyles(size)} />
      {label !== undefined && (
        <span className={cn(radioLabelSizes[size], "text-era-primary")}>
          {label}
        </span>
      )}
    </label>
  ),
);

Radio.displayName = "Radio";
