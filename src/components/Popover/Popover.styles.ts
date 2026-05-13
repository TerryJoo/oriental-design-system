import { cn } from "@/utils/cn";

export type PopoverPlacement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

const PLACEMENT: Record<PopoverPlacement, string> = {
  "bottom-start": "top-full left-0 mt-2",
  "bottom-end": "top-full right-0 mt-2",
  "top-start": "bottom-full left-0 mb-2",
  "top-end": "bottom-full right-0 mb-2",
};

export const popoverWrap = "relative inline-block";

export interface PopoverPanelStyleProps {
  placement?: PopoverPlacement;
  className?: string;
}

export function popoverPanelStyles({
  placement = "bottom-start",
  className,
}: PopoverPanelStyleProps = {}): string {
  return cn(
    "absolute z-popover min-w-[200px]",
    "bg-era-raised border-era rounded-card shadow-era-modal p-3 text-sm text-era-primary",
    // Entry animation — transform-only, no opacity dip. The earlier
    // `animate-scale-in` keyframe ramped opacity 0→1, which left the
    // panel sub-AA on contrast at the moment the test-runner sampled
    // axe (Wave 6a flagged 18 nodes across 5 stories). `popover-enter`
    // (declared via injected <style> in Popover.tsx) keeps opacity:1
    // throughout. Wrapped in `motion-safe:` so users with
    // `prefers-reduced-motion: reduce` get an instant render with
    // zero motion. Same pattern used by Toast (see Toast.styles.ts).
    "motion-safe:animate-[popover-enter_200ms_ease-out_both]",
    PLACEMENT[placement],
    className,
  );
}

export const popoverPlacementMap = PLACEMENT;

/**
 * Keyframe CSS injected once per page by Popover.tsx. Defined here so
 * the styles module owns all visual primitives. Only scales — does NOT
 * touch opacity, which would trip color-contrast checks while the
 * panel is partially transparent.
 */
export const popoverEnterKeyframes = `@keyframes popover-enter {
  from { transform: scale(0.97); }
  to { transform: scale(1); }
}`;
