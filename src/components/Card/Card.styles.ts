import { cn } from "@/utils/cn";

export type CardVariant = "default" | "scroll" | "glass";
export type CardPadding = "none" | "sm" | "md" | "lg";

export const cardVariants: Record<CardVariant, string> = {
  default: cn(
    "bg-era-raised border-era rounded-card shadow-era-card",
    "transition duration-era ease-era-brush",
  ),
  scroll: cn(
    "bg-era-raised border-era shadow-era-card",
    // Heritage feels like a scroll edge; Neon reads as glass with a thin neon accent.
    "[border-radius:6px_6px_10px_10px/18px_18px_10px_10px]",
    "transition duration-era ease-era-brush",
  ),
  glass: cn(
    "bg-era-raised border-era rounded-card shadow-era-card backdrop-blur-md",
    "transition duration-era ease-era-brush",
  ),
};

export const cardPaddings: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
};

export interface CardStyleProps {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  className?: string;
}

export function cardStyles({
  variant = "default",
  padding = "md",
  interactive = false,
  className,
}: CardStyleProps = {}): string {
  return cn(
    cardVariants[variant],
    cardPaddings[padding],
    interactive && "cursor-pointer hover:-translate-y-0.5",
    className,
  );
}
