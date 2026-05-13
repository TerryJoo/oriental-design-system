import { cn } from "@/utils/cn";

export type FilterSize = "sm" | "md";

export const filterContainer = "inline-flex flex-wrap gap-2 items-center";

export const filterChipSizes: Record<FilterSize, string> = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export interface FilterChipStyleProps {
  active?: boolean;
  size?: FilterSize;
  className?: string;
}

export function filterChipStyles({
  active,
  size = "md",
  className,
}: FilterChipStyleProps = {}): string {
  return cn(
    "inline-flex items-center gap-1.5 cursor-pointer rounded-pill",
    "font-era-display tracking-era-display case-era font-semibold",
    "border transition-colors duration-era ease-era-brush",
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-500)/0.3)]",
    filterChipSizes[size],
    active
      ? cn(
          // Heritage: cream (`text-era-inverse` → `--era-ink-inverse: #fbf5e8`)
          // on accent-600 terracotta (#8A5030) clears WCAG AA at 4.5:1.
          "bg-[rgb(var(--accent-600))] text-era-inverse border-[rgb(var(--accent-700))]",
          // Neon: `--era-ink-inverse` is `#0b0e18` (near-black) and the era's
          // `--era-ink-primary` `#e8ecff` only nets ~4.28:1 against accent-600
          // (#5A50FF) — short of AA for body text. Pure white nets ~4.86:1
          // and matches the era's high-contrast neon vocabulary.
          "[[data-era=neon]_&]:text-white",
        )
      : "bg-transparent text-era-primary border-era-soft hover:bg-[rgb(var(--accent-500)/0.08)]",
    className,
  );
}

/**
 * Count badge inside a chip. Avoids `opacity-70` on the active chip because
 * 70% of `--era-ink-inverse` on accent-600 dropped under WCAG AA in both eras
 * (axe `color-contrast`). Inactive chips use `text-era-muted` for hierarchy
 * without compromising contrast.
 */
export interface FilterChipCountStyleProps {
  active?: boolean;
  className?: string;
}

export function filterChipCountStyles({
  active,
  className,
}: FilterChipCountStyleProps = {}): string {
  return cn(
    "tabular-nums",
    active
      ? // Inherit the chip's accessible text color (cream in Heritage,
        // era-primary in Neon). No opacity reduction on the active path.
        "text-inherit"
      : // Inactive chip: muted but still ≥AA against era-base.
        "text-era-muted",
    className,
  );
}
