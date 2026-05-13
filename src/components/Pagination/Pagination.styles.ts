import { cn } from "@/utils/cn";

export const paginationContainer = "inline-flex items-center gap-1";

export interface PaginationButtonStyleProps {
  active?: boolean;
  className?: string;
}

export function paginationButtonStyles({
  active,
  className,
}: PaginationButtonStyleProps = {}): string {
  return cn(
    // Wave 5b2-C3 overflow contract: stable button width across page
    // numerals 1 → 9999. Earlier `min-w-[32px]` allowed the button to
    // grow with the digit count, which made the row reflow as the
    // active page advanced from "9" to "10" to "100". Lock the width
    // to a square 2.25rem (36px) so all numeric chips share a constant
    // hit-target. The text remains centered and clips with ellipsis on
    // the unrealistic >=10000 case.
    "min-w-[2.25rem] px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer",
    "text-center tabular-nums",
    "border transition-colors duration-era ease-era-brush",
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-500)/0.3)]",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    active
      ? "bg-[rgb(var(--accent-600))] text-era-inverse border-[rgb(var(--accent-700))] [[data-era=neon]_&]:text-white"
      : "bg-era-raised border-era text-era-primary hover:bg-[rgb(var(--accent-500)/0.08)]",
    className,
  );
}
