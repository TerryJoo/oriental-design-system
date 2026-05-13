import { cn } from "@/utils/cn";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

const PLACEMENT: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export interface TooltipStyleProps {
  placement?: TooltipPlacement;
  open?: boolean;
  className?: string;
}

export const tooltipWrapStyles = "relative inline-block";

export function tooltipBubbleStyles({
  placement = "top",
  open,
  className,
}: TooltipStyleProps = {}): string {
  return cn(
    // Wave 5b2-C3: wrap long tooltip copy. Earlier the bubble used
    // `whitespace-nowrap`, which forced any tooltip text onto a single
    // line and could push the bubble off-canvas with verbose copy.
    // Bound the bubble at 16rem and let text wrap normally; consumers
    // wanting a single-line tooltip can override via `className`.
    "absolute z-tooltip max-w-[16rem] whitespace-normal pointer-events-none",
    "px-2.5 py-1 rounded-md text-xs",
    "bg-[var(--era-ink-primary)] text-era-inverse shadow-era-tooltip",
    // Visibility uses opacity classes (kept for test invariants:
    // tests assert `opacity-0` while closed and `opacity-100` while
    // open). The transition was previously `transition-opacity` which
    // ramped 0→1 over `--era-dur-normal` and let axe sample the bubble
    // mid-fade — the foreground anchor against partially-transparent
    // ink dropped under WCAG AA and the test-runner flagged
    // `color-contrast`. The opacity transition is now removed so the
    // open state snaps to `opacity-100` immediately: the bubble is
    // either fully invisible (no contrast check) or fully opaque
    // (full contrast). We deliberately do NOT add a transform-based
    // entrance animation here because the placement classes
    // (`-translate-x-1/2` / `-translate-y-1/2`) already write into
    // Tailwind's `--tw-translate-*` variables — a `transform: scale()`
    // keyframe would shadow those and break centering during the
    // animation. Snap reveal is the safest choice for tooltips and
    // matches the no-opacity-ramp invariant set by Toast/Popover.
    PLACEMENT[placement],
    open ? "opacity-100" : "opacity-0",
    className,
  );
}

export const tooltipPlacementMap = PLACEMENT;
