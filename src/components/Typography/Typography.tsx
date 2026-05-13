import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import {
  typographyStyles,
  type TypographyTone,
  type TypographyVariant,
} from "./Typography.styles";

export type { TypographyVariant, TypographyTone } from "./Typography.styles";

const VARIANT_TAG: Record<TypographyVariant, ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  "body-sm": "p",
  caption: "span",
  accent: "span",
  code: "code",
};

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  tone?: TypographyTone;
  /** Override the rendered HTML element. Defaults to a sensible tag per variant. */
  as?: ElementType;
  className?: string;
}

export const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ variant = "body", tone = "default", as, className, ...rest }, ref) => {
    const Component = (as ?? VARIANT_TAG[variant]) as ElementType;
    return (
      <Component
        ref={ref}
        className={typographyStyles({ variant, tone, className })}
        {...rest}
      />
    );
  },
);

Typography.displayName = "Typography";
