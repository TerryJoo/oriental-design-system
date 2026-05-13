import { cn } from "@/utils/cn";

export const kanbanBoard = "grid gap-3 w-full";

/**
 * Wrapper used when the board has zero columns. Keeps the same horizontal
 * footprint as the live grid (`w-full`) so consumers swapping between
 * "empty" and "loaded" don't see a layout jump, and provides vertical
 * breathing room for the embedded `EmptyState`.
 */
export const kanbanBoardEmptyWrap = "w-full py-4";

export const kanbanColumn = cn(
  "rounded-card p-3 min-h-[160px]",
  "bg-era-sunken border-era",
);
export const kanbanColumnHeader = cn(
  "text-[11px] uppercase tracking-[0.1em] font-bold mb-2.5 px-1",
  "font-era-display text-era-muted",
);

/**
 * Card list inside each column. Resets default `<ul>` margin / padding /
 * list-style so the role="list" semantics flip on without a visual change.
 */
export const kanbanCardList = "list-none p-0 m-0 flex flex-col";

export const kanbanCard = cn(
  "rounded-md p-2.5 mb-1.5 text-xs cursor-grab",
  // `text-era-primary` ensures the card text always paints with the era's
  // ink-primary token (Heritage `#2b1d10`, Neon `#e8ecff`) instead of
  // inheriting from whatever wraps the board. The EraCompare panel does
  // not propagate ink color reliably, which axe flagged as a contrast
  // violation when default `<body>` color (white-ish) bled through onto
  // the translucent Neon `bg-era-raised` surface.
  "text-era-primary bg-era-raised border-era shadow-era-card",
  "motion-safe:transition-transform duration-era-fast ease-era-brush",
  "motion-safe:hover:-translate-y-0.5",
  // Keyboard reorder pattern: cards are focusable so sighted keyboard
  // users can grab and move them across columns. Focus ring uses the same
  // accent token as DragDrop / Sidebar / Tabs for a consistent visual
  // language across both eras.
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-[rgb(var(--accent-500))]",
);

/**
 * Keyboard "grabbed" state — visible high-contrast indicator so sighted
 * keyboard users always know which card is currently being moved. Mirrors
 * the DragDrop grabbed style so users encountering both components get the
 * same visual cue.
 */
export const kanbanCardGrabbed = cn(
  "ring-2 ring-[rgb(var(--accent-500))] ring-offset-1",
  "[ring-offset-color:var(--era-surface-base)]",
  "bg-[rgb(var(--accent-500)/0.08)]",
);

/**
 * Visually-hidden live region for AT announcements. Standard sr-only
 * recipe — clipped 1×1 box, no whitespace, absolute-positioned out of
 * flow so it never disturbs layout in either era.
 */
export const kanbanLiveRegion = cn(
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap",
  "border-0 [clip:rect(0,0,0,0)]",
);
