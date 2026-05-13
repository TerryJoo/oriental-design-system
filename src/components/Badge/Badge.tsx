import React, { forwardRef, type HTMLAttributes } from "react";
import {
  badgeStyles,
  badgeDotStyles,
  type BadgeVariant,
  type BadgeSize,
  type BadgeShape,
} from "./Badge.styles";

export type { BadgeVariant, BadgeSize, BadgeShape } from "./Badge.styles";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Badge shape */
  shape?: BadgeShape;
  /** Show dot indicator */
  dot?: boolean;
  /** Enable pulse animation */
  pulse?: boolean;
  children: React.ReactNode;
}

/**
 * Badge component for status indicators and labels.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      shape = "rounded",
      dot = false,
      pulse = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={badgeStyles({ variant, size, shape, pulse, className })}
        {...props}
      >
        {dot && (
          <span data-testid="badge-dot" className={badgeDotStyles(variant)} />
        )}
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
