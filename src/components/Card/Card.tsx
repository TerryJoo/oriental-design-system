import { forwardRef, type HTMLAttributes } from "react";
import { cardStyles, type CardPadding, type CardVariant } from "./Card.styles";

export type { CardVariant, CardPadding } from "./Card.styles";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      interactive = false,
      className,
      ...rest
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cardStyles({ variant, padding, interactive, className })}
      {...rest}
    />
  ),
);

Card.displayName = "Card";
