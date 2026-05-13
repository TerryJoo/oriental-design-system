import { cn } from "@/utils/cn";

export const pageTreeRoot = "text-sm font-era-body w-full";
export const pageTreeNode = cn(
  "flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer",
  "text-era-primary",
  "transition-colors duration-era ease-era-brush",
  "hover:bg-[rgb(var(--accent-500)/0.08)]",
);
export const pageTreeNodeActive =
  "bg-[rgb(var(--accent-500)/0.12)] text-accent-700 font-semibold";
// In LTR the caret renders as `▶` and rotates 90deg to `▼` when open.
// Under `[dir="rtl"]` the closed caret should point inline-end (which is
// physical left), so we flip 180deg horizontally. The `▼` open state is
// orientation-neutral and stays the same in both directions, so the open
// rotation overrides the RTL flip via class order.
export const pageTreeCaret = cn(
  "w-2.5 inline-block motion-safe:transition-transform duration-era-fast",
  "[[dir=rtl]_&]:rotate-180",
);
export const pageTreeCaretOpen = "rotate-90 [[dir=rtl]_&]:rotate-90";
// `ps-4` / `border-s` / `ms-3` are RTL-aware logical-property utilities.
// In LTR they read as left-padding, left-border, left-margin (matches the
// previous physical layout). In RTL they automatically swap to the
// inline-end side so the indented branch and connector line both grow
// toward the right edge of the page, mirroring the tree's visual flow.
export const pageTreeChildren = "ps-4 border-s border-era-soft ms-3";

/**
 * Wrapper used when `nodes.length === 0`. Mirrors `pageTreeRoot`'s width
 * and font so consumers swapping between "loading", "empty", and
 * "loaded" states do not see a layout jump. Vertical padding gives the
 * embedded `EmptyState` (or any custom slot) breathing room.
 */
export const pageTreeEmptyWrap = "text-sm font-era-body w-full py-2";
