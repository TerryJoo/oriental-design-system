import { cn } from "@/utils/cn";

export type TagSize = "sm" | "md";

export const tagSizes: Record<TagSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

/**
 * Wave 5b2-C3 — overflow/ellipsis standardization.
 *
 * Tag is a chip whose label is the primary content. To prevent a single
 * runaway label from forcing horizontal scroll inside chip rows, the
 * wrapper caps at `max-w-[16rem]` and the inner label clamps to a single
 * line with `text-ellipsis overflow-hidden whitespace-nowrap`. The
 * 16rem cap matches Badge's overflow contract; consumers wanting a
 * different ceiling can pass a `max-w-*` utility through `className`
 * and Tailwind's later-class-wins ordering takes over.
 */
export const tagLabel = "truncate min-w-0";

export interface TagStyleProps {
  size?: TagSize;
  className?: string;
}

export function tagStyles({
  size = "md",
  className,
}: TagStyleProps = {}): string {
  return cn(
    "inline-flex items-center gap-1.5 rounded-md",
    "max-w-[16rem]",
    "font-era-body",
    // Tonally-tinted SOLID fills per era so axe can compute contrast
    // deterministically. History — earlier translucent fills
    // (`bg-[rgb(var(--accent-500)/0.14)]`) tripped axe `color-contrast`
    // on Tag's inner `<span>` children: when the chip body is
    // semi-transparent, axe walks the ancestor chain to resolve the
    // effective background, and the chain (Storybook iframe → era
    // panel → tag) yields an indeterminate composite that the rule
    // flags conservatively. Using opaque `accent-50` (Heritage) and
    // `accent-900` (Neon) eliminates the alpha resolve and matches the
    // canonical pattern set by Badge (see Badge.styles.ts comment).
    //
    // Heritage: accent-50 (#FCF5EC-ish parchment tint) + accent-800
    //   (#4E2B19 deep oxblood) ≈ 11:1 contrast.
    // Neon:     accent-900 (#1c166e deep indigo) + accent-200
    //   (#afd0ff ice blue) ≈ 9:1 contrast.
    "bg-accent-50 text-accent-800",
    "border border-[rgb(var(--accent-600)/0.5)]",
    "[[data-era=neon]_&]:bg-accent-900",
    "[[data-era=neon]_&]:text-accent-200",
    "[[data-era=neon]_&]:border-[rgb(var(--accent-300)/0.7)]",
    tagSizes[size],
    className,
  );
}

export const tagRemove = cn(
  "cursor-pointer opacity-60 hover:opacity-100",
  "motion-safe:transition-opacity duration-era ease-era-brush",
);
