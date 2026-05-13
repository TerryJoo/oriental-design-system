import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  tooltipBubbleStyles,
  tooltipWrapStyles,
  type TooltipPlacement,
} from "./Tooltip.styles";

export type { TooltipPlacement } from "./Tooltip.styles";

export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  /** Content shown inside the bubble. */
  content: ReactNode;
  /** The element that triggers the tooltip on hover/focus. */
  children: ReactElement;
  /** Where the bubble appears relative to the trigger. */
  placement?: TooltipPlacement;
  /** Optional manual control. */
  open?: boolean;
  className?: string;
}

type TriggerProps = {
  "aria-describedby"?: string;
};

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
      content,
      children,
      placement = "top",
      open: controlledOpen,
      className,
      ...rest
    },
    ref,
  ) => {
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const open = controlledOpen ?? (hovered || focused);
    const tooltipId = useId();

    // WAI-ARIA tooltip pattern: the trigger must reference the tooltip via
    // aria-describedby while open so assistive tech can associate them.
    // Children.only enforces a single element child; non-element children
    // (strings, fragments, arrays) cannot receive aria attributes via cloneElement.
    const trigger = Children.only(children);
    if (!isValidElement<TriggerProps>(trigger)) {
      throw new Error(
        "Tooltip: `children` must be a single React element that can receive an `aria-describedby` prop. " +
          "Wrap text or fragments in a focusable element such as a <button> or <span tabIndex={0}>.",
      );
    }

    const existingDescribedBy = (trigger.props as TriggerProps)[
      "aria-describedby"
    ];
    const mergedDescribedBy = open
      ? [existingDescribedBy, tooltipId].filter(Boolean).join(" ")
      : existingDescribedBy;

    const triggerWithAria = cloneElement<TriggerProps>(trigger, {
      "aria-describedby": mergedDescribedBy || undefined,
    });

    return (
      <span
        ref={ref}
        className={cn(tooltipWrapStyles, className)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      >
        {triggerWithAria}
        <span
          id={tooltipId}
          role="tooltip"
          className={tooltipBubbleStyles({ placement, open })}
        >
          {content}
        </span>
      </span>
    );
  },
);

Tooltip.displayName = "Tooltip";
