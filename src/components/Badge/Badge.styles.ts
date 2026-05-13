import { cn } from "@/utils/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "rounded" | "pill" | "square";

/**
 * Badge variants are era-aware and tuned for WCAG AA in BOTH eras.
 *
 * History note — translucent fills (`bg-[rgb(... /0.14)]`) tripped axe's
 * `color-contrast` rule across eras. axe walks the ancestor chain to
 * resolve the effective background; with a transparent body (Storybook
 * iframe defaults to `rgba(0,0,0,0)` until an era is set) the chain is
 * indeterminate and the rule fails. We now ship SOLID, tonally-tinted
 * fills per intent so axe can compute contrast deterministically — and
 * the visual remains a soft tinted chip rather than a flat block.
 *
 * Heritage (parchment surface, `--era-surface-base #f6efe1`):
 *   • `bg-{intent}-50` lifts a faint hue off cream.
 *   • `text-{intent}-700` is the dark anchor; AA easily met.
 *
 * Neon (near-black glass surface, `--era-surface-base #0b0e18`):
 *   • `bg-{intent}-900` is a dark tonal block that lifts ≥1.5× off the
 *     glass surface (visual chrome) without burning luminance.
 *   • `text-{intent}-200` is the era's light anchor; AA met against
 *     the -900 fill.
 */
export const badgeVariants: Record<
  BadgeVariant,
  { bg: string; text: string; ring: string; dot: string }
> = {
  default: {
    // Accent palette is CSS-variable driven so `accent-50/900` already
    // flips with the era. No `[data-era=neon]` override needed for the
    // fill; only the text needs to flip from the dark era ink to the
    // light era ink (which `text-era-primary` already does via
    // `--era-ink-primary`).
    bg: cn("bg-accent-50", "[[data-era=neon]_&]:bg-accent-900"),
    text: "text-era-primary",
    ring: cn(
      "ring-[rgb(var(--accent-500)/0.35)]",
      "[[data-era=neon]_&]:ring-[rgb(var(--accent-300)/0.5)]",
    ),
    dot: "bg-era-muted",
  },
  primary: {
    bg: cn("bg-accent-100", "[[data-era=neon]_&]:bg-accent-800"),
    // Heritage: accent-700 (#6C3D24) on accent-100 (#F3E0C7) ≈ 7:1.
    // Neon: accent-700 fails — use accent-200 (#AFD0FF) light tint.
    text: cn("text-accent-700", "[[data-era=neon]_&]:text-accent-200"),
    ring: cn(
      "ring-[rgb(var(--accent-500)/0.45)]",
      "[[data-era=neon]_&]:ring-[rgb(var(--accent-300)/0.6)]",
    ),
    dot: "bg-accent-500",
  },
  success: {
    // Heritage: success-50 (#F1F7EE) + success-700 (#305625) ≈ 10:1.
    // Neon:     success-900 (#172B13) + success-200 (#B6D5A4) ≈ 8:1.
    bg: cn("bg-success-50", "[[data-era=neon]_&]:bg-success-900"),
    text: cn("text-success-700", "[[data-era=neon]_&]:text-success-200"),
    ring: cn("ring-success-300", "[[data-era=neon]_&]:ring-success-700"),
    dot: "bg-success-500",
  },
  warning: {
    // Heritage: warning-50 (#FEF8E8) + warning-700 (#7D561A) ≈ 6.5:1.
    // Neon:     warning-900 (#3B280C) + warning-200 (#F6D48A) ≈ 9:1.
    bg: cn("bg-warning-50", "[[data-era=neon]_&]:bg-warning-900"),
    text: cn("text-warning-700", "[[data-era=neon]_&]:text-warning-200"),
    ring: cn("ring-warning-300", "[[data-era=neon]_&]:ring-warning-700"),
    dot: "bg-warning-500",
  },
  error: {
    // Heritage: error-50 (#FDF1F0) + error-700 (#672014) ≈ 9:1.
    // Neon:     error-900 (#2F0F08) + error-200 (#F5ADA4) ≈ 8:1.
    bg: cn("bg-error-50", "[[data-era=neon]_&]:bg-error-900"),
    text: cn("text-error-700", "[[data-era=neon]_&]:text-error-200"),
    ring: cn("ring-error-300", "[[data-era=neon]_&]:ring-error-700"),
    dot: "bg-error-500",
  },
  info: {
    // Heritage: info-50 (#EEF3F8) + info-700 (#213955) ≈ 11:1.
    // Neon:     info-900 (#101C2B) + info-200 (#A9BFD7) ≈ 9:1.
    bg: cn("bg-info-50", "[[data-era=neon]_&]:bg-info-900"),
    text: cn("text-info-700", "[[data-era=neon]_&]:text-info-200"),
    ring: cn("ring-info-300", "[[data-era=neon]_&]:ring-info-700"),
    dot: "bg-info-500",
  },
};

export const badgeSizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
  lg: "px-3 py-1 text-base",
};

export const badgeShapes: Record<BadgeShape, string> = {
  rounded: "rounded-md",
  pill: "rounded-full",
  square: "rounded-none",
};

export interface BadgeStyleProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  pulse?: boolean;
  className?: string;
}

export function badgeStyles(props: BadgeStyleProps = {}): string {
  const {
    variant = "default",
    size = "md",
    shape = "rounded",
    pulse = false,
    className,
  } = props;
  const styles = badgeVariants[variant];

  return cn(
    "inline-flex items-center gap-1.5 font-medium",
    // Wave 5b2-C3 overflow contract: cap the chip width and clamp the
    // contents to a single line. `truncate` on an inline-flex container
    // sets `overflow-hidden text-ellipsis whitespace-nowrap`; the dot
    // (when present) carries `shrink-0` so it stays visible while the
    // surrounding text node clips. Matches the Tag ceiling so chip
    // rows have a consistent visual rhythm under long copy.
    "max-w-[16rem] truncate",
    "ring-1 ring-inset",
    // Era-aware typography — Korean serif lower-case in Heritage,
    // Orbitron-like sans uppercase + faint glow in Neon.
    "font-era-display",
    "tracking-era-display",
    "case-era",
    "[text-shadow:var(--era-glow-text)]",
    styles.bg,
    styles.text,
    styles.ring,
    badgeSizes[size],
    badgeShapes[shape],
    // NOTE: removed `animate-fade-in` — it ran a 200ms opacity 0→1 keyframe
    // every render, which made the test-runner sample opacity mid-fade and
    // (with the foreground anchor diluted) trip axe `color-contrast`
    // intermittently. Status-indicator badges shouldn't need an entrance
    // animation; consumers wanting one can wrap in their own transition.
    pulse && "motion-safe:animate-pulse-subtle",
    className,
  );
}

export function badgeDotStyles(variant: BadgeVariant = "default"): string {
  return cn(
    // Static dimensions on the dot so it doesn't shrink under the
    // truncate contract on the outer chip.
    "w-2 h-2 shrink-0 rounded-full",
    badgeVariants[variant].dot,
  );
}
