import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "solid" | "fade" | "dashed";

const ORIENTATION: Record<SeparatorOrientation, string> = {
  horizontal: "w-full h-px",
  vertical: "h-full w-px self-stretch",
};

/**
 * `solid`  — uses the era-aware soft edge color.
 * `fade`   — Heritage: 먹선 fade. Neon: 네온 라인 fade with glow.
 * `dashed` — dashed border, era color.
 */
const VARIANT: Record<SeparatorVariant, string> = {
  solid: "bg-era-soft",
  fade: "bg-transparent",
  dashed: "bg-transparent border-dashed border-t border-era-soft",
};

export interface SeparatorStyleProps {
  orientation?: SeparatorOrientation;
  variant?: SeparatorVariant;
  className?: string;
}

export function separatorStyles({
  orientation = "horizontal",
  variant = "solid",
  className,
}: SeparatorStyleProps = {}): string {
  return cn(
    ORIENTATION[orientation],
    variant !== "dashed" && VARIANT[variant],
    variant === "dashed" && orientation === "horizontal" && VARIANT.dashed,
    variant === "dashed" &&
      orientation === "vertical" &&
      "bg-transparent border-dashed border-s border-era-soft w-px h-full",
    className,
  );
}

/**
 * Optional inline style helper for the `fade` variant — produces a fade
 * gradient using the era-aware color (works for both eras since it reads
 * `--era-edge-color-soft`).
 */
export function separatorFadeStyle(
  orientation: SeparatorOrientation,
): CSSProperties {
  const direction = orientation === "horizontal" ? "to right" : "to bottom";
  return {
    background: `linear-gradient(${direction}, transparent, var(--era-edge-color-hard), transparent)`,
  };
}

export const separatorOrientationMap = ORIENTATION;
export const separatorVariantMap = VARIANT;
