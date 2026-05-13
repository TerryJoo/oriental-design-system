import { cn } from "@/utils/cn";

export const calendarRoot = cn(
  "w-full max-w-xs rounded-card p-3",
  "bg-era-raised border-era",
);

export const calendarHeader = "flex justify-between items-center mb-2.5";
export const calendarTitle = cn(
  "font-era-display tracking-era-display case-era",
  "text-sm font-bold text-era-primary",
);

export const calendarNavButton = cn(
  "px-2 py-1 rounded-md text-xs cursor-pointer",
  "text-era-muted hover:bg-[rgb(var(--accent-500)/0.08)]",
);

// Outer grid container — hosts the weekday-header row plus 6 week rows.
export const calendarGrid = "flex flex-col gap-0.5 text-[11px] text-center";

// One row of 7 cells (used for both the weekday header and each week row).
// Kept as a horizontal grid so the columns align across rows.
export const calendarWeekdayRow = "grid grid-cols-7 gap-0.5";
export const calendarWeekRow = "grid grid-cols-7 gap-0.5";

export const calendarDow = cn(
  "py-1.5 text-era-muted font-bold uppercase tracking-[0.05em] text-[10px]",
);

export interface CalendarDayStyleProps {
  selected?: boolean;
  today?: boolean;
  muted?: boolean;
  disabled?: boolean;
  className?: string;
}

export function calendarDayStyles({
  selected,
  today,
  muted,
  disabled,
  className,
}: CalendarDayStyleProps = {}): string {
  return cn(
    "py-1.5 rounded-md",
    "transition-colors duration-era-fast ease-era-brush",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-500))] focus-visible:ring-offset-1",
    selected
      ? // `text-era-inverse` flips against `--era-ink-primary`. In Heritage that's
        // cream on terracotta (`#fbf5e8` on `#8a5030` ~6.2:1 — passes AA).
        // In Neon it resolves to `#0b0e18` — near-black on accent-600 (purple-blue
        // `#5a50ff`), only ~3.7:1 (fails AA). Override Neon to pure white, which
        // clears 4.5:1 against the cool accent-600 (era-primary `#e8ecff` was the
        // ChatBubble fix but only reaches ~3.6:1 — insufficient for this hue).
        cn(
          "bg-[rgb(var(--accent-600))] text-era-inverse font-bold",
          "[[data-era=neon]_&]:text-white",
        )
      : today
        ? "text-accent-700 font-bold"
        : muted
          ? // Out-of-month padding cells. The previous `opacity-40 + text-era-muted`
            // combo failed WCAG AA (effective contrast ~1.5:1 in Heritage). We drop
            // the opacity modifier entirely and lean on `text-era-muted` alone:
            // - Heritage: `#6e5a3f` on `#fbf5e8` ~ 5.2:1 (passes AA).
            // - Neon: `rgba(232,236,255,0.55)` on `#0b0e18` ~ 6.8:1 (passes AA).
            // The visual de-emphasis is preserved by the muted token's hue/value
            // contrast against era-primary on current-month cells.
            "text-era-muted"
          : "text-era-primary hover:bg-[rgb(var(--accent-500)/0.08)]",
    // Disabled cells: skip hover, drop pointer, and de-emphasize via
    // `line-through` + tonal shift. We avoid `opacity-*` (Wave 5b2 contract:
    // never rely on opacity ramps for state — they fail axe color-contrast
    // mid-frame). Instead use `text-era-muted` for tonal de-emphasis, which
    // already ships a vetted AA contrast against `bg-era-raised` in both eras.
    disabled
      ? "cursor-not-allowed text-era-muted line-through hover:bg-transparent"
      : "cursor-pointer",
    className,
  );
}
