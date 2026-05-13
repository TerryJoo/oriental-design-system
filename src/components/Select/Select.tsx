import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  selectStyles,
  selectLabel,
  selectWrap,
  type SelectSize,
  type SelectVariant,
} from "./Select.styles";

export type { SelectSize, SelectVariant } from "./Select.styles";

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  selectSize?: SelectSize;
  variant?: SelectVariant;
  children: ReactNode;
  className?: string;
  /**
   * Visible label rendered above the select. When provided, a `<label htmlFor>`
   * is wired to the select via `useId` (or the caller-supplied `id`),
   * satisfying the `select-name` a11y requirement automatically.
   *
   * If omitted, callers MUST supply `aria-label` or `aria-labelledby`
   * to give the native `<select>` an accessible name.
   */
  label?: ReactNode;
  /** Wrapper className (only applied when `label` is rendered). */
  wrapperClassName?: string;
}

/**
 * Inline chevron used as the trigger affordance after `appearance: none`
 * removes the browser's native arrow. Uses `currentColor` so it adopts the
 * `text-era-muted` from the wrapper without needing an extra fill prop.
 * 12×12 keeps it visually balanced against the `text-base` field height
 * across `sm`/`md`/`lg` sizes — the SVG scales with the parent text colour
 * but its dimensions are fixed for consistency. Mirrors the chevron pattern
 * in `SidebarShellMenu` so the system uses one chevron grammar.
 */
function SelectChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      selectSize = "md",
      variant = "default",
      className,
      children,
      label,
      id,
      wrapperClassName,
      ...rest
    },
    ref,
  ) => {
    const fallbackId = useId();
    const selectId = id ?? fallbackId;

    const control = (
      <span className="relative inline-block w-full">
        <select
          ref={ref}
          id={selectId}
          className={selectStyles({ size: selectSize, variant, className })}
          {...rest}
        >
          {children}
        </select>
        <span
          data-testid="select-chevron"
          aria-hidden="true"
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-era-muted"
        >
          <SelectChevronIcon />
        </span>
      </span>
    );

    if (!label) {
      return control;
    }

    return (
      <span className={cn(selectWrap, wrapperClassName)}>
        <label htmlFor={selectId} className={selectLabel}>
          {label}
        </label>
        {control}
      </span>
    );
  },
);

Select.displayName = "Select";
