import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import {
  buttonStyles,
  buttonIconSizes,
  type ButtonVariant,
  type ButtonSize,
  type ButtonShape,
} from "./Button.styles";

export type { ButtonVariant, ButtonSize, ButtonShape } from "./Button.styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button shape */
  shape?: ButtonShape;
  /** Loading state — shows spinner and disables button */
  loading?: boolean;
  /** Icon placed before children */
  leftIcon?: React.ReactNode;
  /** Icon placed after children */
  rightIcon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Button content */
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      shape = "rounded",
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const iconSize = buttonIconSizes[size];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        className={buttonStyles({
          variant,
          size,
          shape,
          disabled,
          loading,
          hasLeftIcon: !!leftIcon,
          hasRightIcon: !!rightIcon,
          className,
        })}
        {...props}
      >
        {loading && (
          <span
            data-testid="button-spinner"
            aria-hidden="true"
            className="absolute w-4 h-4 border-2 border-current border-b-transparent rounded-full motion-safe:animate-spin"
          />
        )}
        {leftIcon && (
          <span
            data-testid="button-left-icon"
            aria-hidden="true"
            className={cn(
              "inline-flex items-center justify-center shrink-0",
              iconSize,
              "[&>svg]:w-full [&>svg]:h-full",
              loading && "invisible",
            )}
          >
            {leftIcon}
          </span>
        )}
        {/*
         * During `loading`, the children span uses `opacity-0` instead of
         * `invisible` (visibility:hidden) so the accessible name stays in
         * the a11y tree. axe `button-name` previously flagged the loading
         * Button because `visibility:hidden` strips its only label source.
         * `opacity-0` hides it visually, preserves layout, and keeps the
         * name discoverable for screen readers — paired with `aria-busy`
         * the loading state is announced correctly.
         */}
        <span className={cn(loading && "opacity-0")}>{children}</span>
        {rightIcon && (
          <span
            data-testid="button-right-icon"
            aria-hidden="true"
            className={cn(
              "inline-flex items-center justify-center shrink-0",
              iconSize,
              "[&>svg]:w-full [&>svg]:h-full",
              loading && "invisible",
            )}
          >
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
