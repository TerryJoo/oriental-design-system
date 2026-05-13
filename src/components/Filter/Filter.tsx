import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  filterChipCountStyles,
  filterChipStyles,
  filterContainer,
  type FilterSize,
} from "./Filter.styles";

export type { FilterSize } from "./Filter.styles";

export interface FilterOption {
  value: string;
  label: ReactNode;
  /** Optional count badge appended to the label. */
  count?: number;
}

export interface FilterProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  options: ReadonlyArray<FilterOption>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: FilterSize;
  className?: string;
}

export const Filter = forwardRef<HTMLDivElement, FilterProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      size = "md",
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const current = isControlled ? value : defaultValue;
    // Toggle-button group: use `role="group"` with an accessible name. If the
    // consumer didn't provide one, fall back to a sensible default so axe
    // doesn't flag the role. Each chip is a `<button aria-pressed>` — the
    // canonical WAI-ARIA toggle-button pattern.
    const groupLabel =
      ariaLabel ?? (ariaLabelledBy ? undefined : "Filter options");
    return (
      <div
        ref={ref}
        role="group"
        aria-label={groupLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(filterContainer, className)}
        {...rest}
      >
        {options.map((opt) => {
          const isActive = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange?.(opt.value)}
              className={filterChipStyles({
                active: isActive,
                size,
              })}
            >
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span className={filterChipCountStyles({ active: isActive })}>
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  },
);

Filter.displayName = "Filter";
