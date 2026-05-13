import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import {
  stackStyles,
  type StackAlign,
  type StackDirection,
  type StackGap,
  type StackJustify,
} from "./Stack.styles";

export type {
  StackAlign,
  StackDirection,
  StackGap,
  StackJustify,
} from "./Stack.styles";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: StackDirection;
  align?: StackAlign;
  justify?: StackJustify;
  gap?: StackGap;
  wrap?: boolean;
  /** Render as a different HTML element. */
  as?: ElementType;
  className?: string;
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "column",
      align = "stretch",
      justify = "start",
      gap = "3",
      wrap = false,
      as,
      className,
      ...rest
    },
    ref,
  ) => {
    const Component = (as ?? "div") as ElementType;
    return (
      <Component
        ref={ref}
        className={stackStyles({
          direction,
          align,
          justify,
          gap,
          wrap,
          className,
        })}
        {...rest}
      />
    );
  },
);

Stack.displayName = "Stack";
