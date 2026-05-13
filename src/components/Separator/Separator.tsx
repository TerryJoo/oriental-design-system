import { forwardRef, type HTMLAttributes } from "react";
import {
  separatorFadeStyle,
  separatorStyles,
  type SeparatorOrientation,
  type SeparatorVariant,
} from "./Separator.styles";

export type {
  SeparatorOrientation,
  SeparatorVariant,
} from "./Separator.styles";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation;
  variant?: SeparatorVariant;
  /**
   * Decorative separators are not announced to screen readers.
   * Set false when the divider conveys structural meaning.
   */
  decorative?: boolean;
  className?: string;
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      orientation = "horizontal",
      variant = "solid",
      decorative = true,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const fadeStyle =
      variant === "fade" ? separatorFadeStyle(orientation) : undefined;
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        className={separatorStyles({ orientation, variant, className })}
        style={{ ...fadeStyle, ...style }}
        {...rest}
      />
    );
  },
);

Separator.displayName = "Separator";
