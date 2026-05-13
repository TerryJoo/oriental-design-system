import { cn } from "@/utils/cn";

/**
 * Outer wrapper. Holds two children: the inner `role="list"` element and
 * (optionally) the visually-hidden live region. Layout is identical to
 * the previous flat layout — the visible list still flows column-wise
 * with `gap-1.5`, and the live region is absolutely positioned out of
 * flow so it never affects spacing.
 */
export const dragDropList = "relative w-full";

/**
 * Inner `role="list"` element. Carries the same flex column layout that
 * was previously on the outer wrapper. Splitting list semantics from the
 * wrapper keeps the live region (which cannot live inside `role="list"`
 * without tripping axe `aria-required-children`) as a sibling.
 */
export const dragDropListInner = "flex flex-col gap-1.5 w-full";

export const dragDropItem = cn(
  "flex items-center gap-2.5 px-3.5 py-2.5 rounded-md cursor-grab",
  "bg-era-raised border-era text-era-primary text-sm",
  "motion-safe:transition-transform duration-era-fast ease-era-brush",
  // The hover nudge points inline-end. In LTR that is `translate-x-0.5`;
  // in RTL we negate so the nudge still moves toward the inline-end side
  // (which is physical left under RTL).
  "motion-safe:hover:translate-x-0.5 [[dir=rtl]_&]:motion-safe:hover:-translate-x-0.5",
  "hover:[border-color:var(--era-edge-color-hard)]",
  // Keyboard reorder pattern: items are focusable so sighted keyboard
  // users can grab and move rows. Focus ring uses the same accent token
  // as Sidebar/Tabs/Pagination so the visual language is consistent across
  // both eras.
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-[rgb(var(--accent-500))]",
);

/** Native HTML5 drag in flight (mouse user has the row picked up). */
export const dragDropItemDragging = "opacity-50";

/**
 * Keyboard "grabbed" state — visible high-contrast indicator so sighted
 * keyboard users always know which row is currently being moved. The ring
 * uses the same accent token family as `focus-visible` and stays applied
 * even after Tab leaves and re-enters during the gesture (which it does
 * not, since Tab cancels the grab — but the ring also covers the case
 * where a screen reader virtual cursor leaves and returns).
 */
export const dragDropItemGrabbed = cn(
  "ring-2 ring-[rgb(var(--accent-500))] ring-offset-1",
  "[ring-offset-color:var(--era-surface-base)]",
  "bg-[rgb(var(--accent-500)/0.08)]",
);

export const dragDropHandle = "text-era-muted cursor-grab";

/**
 * Visually-hidden live region for AT announcements. Standard sr-only
 * recipe — clipped 1×1 box, no whitespace, absolute-positioned out of
 * flow so it never disturbs layout in either era.
 */
export const dragDropLiveRegion = cn(
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap",
  "border-0 [clip:rect(0,0,0,0)]",
);
