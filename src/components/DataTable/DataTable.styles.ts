import { cn } from "@/utils/cn";

export const dataTableRoot = cn(
  "w-full text-sm rounded-card overflow-hidden",
  "border-era",
);

export const dataTableThead =
  "bg-era-sunken text-era-muted text-[11px] uppercase tracking-[0.1em] font-era-display";

export const dataTableTh =
  "px-4 py-2.5 text-start font-bold border-b border-era-soft";
export const dataTableTd = "px-4 py-2.5 border-b border-era-soft last:border-0";

export const dataTableRow =
  "transition-colors duration-era-fast ease-era-brush hover:bg-[rgb(var(--accent-500)/0.05)]";

/**
 * Single full-width cell used when `data.length === 0`. Resets the row
 * border (the empty cell does not need a divider underneath) and centers
 * the embedded `EmptyState` (or a custom node) horizontally inside the
 * table body. Padding lifts the placeholder off the header so the dashed
 * `EmptyState` border has air on every side.
 */
export const dataTableEmptyCell = cn(
  "px-4 py-8 text-center",
  // The default `dataTableTd` has `border-b border-era-soft last:border-0`,
  // which still applies to the colspan'd cell. We want the empty placeholder
  // to feel like a single block, so we explicitly drop the bottom border.
  "border-b-0",
);
