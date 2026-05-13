import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

/**
 * PatternBackground variants — five concrete patterns plus `auto`,
 * which delegates to `--era-material-pattern` so the swatch follows
 * whichever era is active.
 */
export type PatternVariant =
  | "auto"
  | "woodgrain"
  | "porcelain"
  | "hanji"
  | "circuit"
  | "scanline";

export type PatternIntensity = "subtle" | "normal" | "strong";

/**
 * Each variant maps to a CSS variable that's already defined in
 * globals.css / eras/heritage.css / eras/neon.css. Concrete variants
 * (`woodgrain`, `porcelain`, ...) render even when the matching era is
 * not active — useful for showcasing both eras side by side.
 */
const PATTERN_BG_IMAGES: Record<PatternVariant, string> = {
  auto: "var(--era-material-pattern)",
  woodgrain: "var(--pattern-woodgrain, none)",
  porcelain: "var(--pattern-porcelain, none)",
  // hanji is a layered radial gradient that lives only at body-level in CSS;
  // we replicate it inline so the component is self-contained.
  hanji: [
    "radial-gradient(circle at 30% 20%, rgba(90,60,30,0.06), transparent 40%)",
    "radial-gradient(circle at 70% 75%, rgba(120,80,40,0.08), transparent 50%)",
    "repeating-radial-gradient(circle at 50% 50%, rgba(140,110,70,0.04) 0 1px, transparent 1px 3px)",
  ].join(","),
  circuit: "var(--pattern-circuit, none)",
  scanline: "var(--pattern-scanline, none)",
};

const PATTERN_BG_SIZES: Record<PatternVariant, string> = {
  auto: "120px 120px",
  woodgrain: "auto",
  porcelain: "120px 120px",
  hanji: "auto",
  circuit: "80px 80px",
  scanline: "auto",
};

const INTENSITY_OPACITY: Record<PatternIntensity, number> = {
  subtle: 0.4,
  normal: 0.8,
  strong: 1,
};

export interface PatternBackgroundStyleProps {
  variant: PatternVariant;
  intensity: PatternIntensity;
}

export function patternBackgroundClasses(): string {
  return cn(
    "relative isolate overflow-hidden",
    "motion-safe:transition-opacity duration-era ease-era-brush",
  );
}

export function patternBackgroundLayerStyle({
  variant,
  intensity,
}: PatternBackgroundStyleProps): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    backgroundImage: PATTERN_BG_IMAGES[variant],
    backgroundSize: PATTERN_BG_SIZES[variant],
    backgroundRepeat: "repeat",
    opacity: INTENSITY_OPACITY[intensity],
    pointerEvents: "none",
    zIndex: -1,
  };
}

export const patternBackgroundVariants = Object.keys(
  PATTERN_BG_IMAGES,
) as readonly PatternVariant[];
