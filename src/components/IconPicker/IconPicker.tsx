import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { iconPickerCellStyles, iconPickerGrid } from "./IconPicker.styles";

export interface IconOption {
  value: string;
  /** Visible icon (emoji, hanja, or any ReactNode). */
  icon: ReactNode;
  /** Accessible label. */
  label?: string;
}

export interface IconPickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  options: ReadonlyArray<IconOption>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const IconPicker = forwardRef<HTMLDivElement, IconPickerProps>(
  ({ options, value, defaultValue, onChange, className, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const current = isControlled ? value : defaultValue;
    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(iconPickerGrid, className)}
        {...rest}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={current === opt.value}
            aria-label={opt.label ?? opt.value}
            onClick={() => onChange?.(opt.value)}
            className={iconPickerCellStyles({ active: current === opt.value })}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    );
  },
);

IconPicker.displayName = "IconPicker";
