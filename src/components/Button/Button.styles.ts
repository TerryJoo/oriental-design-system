import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "seal"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "pill" | "rounded";

/**
 * Era-aware Button.
 *
 *  • `primary`   — `bg-accent-600 → terracotta (Heritage) / electric indigo (Neon).
 *                  Always rendered with `shadow-era-card` so the era-shadow shape
 *                  (paper depth vs. neon glow) reads on the button surface.
 *  • `secondary` — Outlined with `border-era-soft`, fills with translucent accent
 *                  on hover. Stays legible on both light parchment and dark glass.
 *  • `ghost`     — No fill, no border. Text uses `text-era-primary`.
 *  • `seal`      — 낙관/도장 styling: thicker `border-era-seal` with `text-era-seal`.
 *                  Heritage = oxblood red, Neon = cyan.
 *  • `danger`    — Destructive action. Stays red across both eras.
 */
export const buttonVariants: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-accent-600 text-white",
    "hover:bg-accent-700",
    "shadow-era-card hover:shadow-era-card",
    "[text-shadow:var(--era-glow-inverse)]",
    "focus:ring-accent-500/30",
  ),
  secondary: cn(
    "bg-transparent border-[1.5px] border-era-soft text-era-primary",
    "hover:border-era-hard hover:bg-[rgb(var(--accent-500)/0.08)]",
    "focus:ring-accent-500/20",
  ),
  ghost: cn(
    "bg-transparent text-era-primary",
    "hover:bg-[rgb(var(--accent-500)/0.10)]",
    "focus:ring-accent-500/20",
  ),
  seal: cn(
    "bg-transparent border-[2px] border-era-seal text-era-seal",
    "tracking-widest font-bold",
    "hover:bg-[rgb(var(--accent-500)/0.06)]",
    "focus:ring-2 focus:ring-[var(--era-edge-color-seal)]",
  ),
  danger: cn(
    "bg-error-600 text-white",
    "hover:bg-error-700",
    "shadow-era-card",
    "focus:ring-error-500/30",
  ),
};

export const buttonDisabledVariants: Record<ButtonVariant, string> = {
  primary: "bg-era-sunken text-era-muted",
  secondary: "bg-transparent border-[1.5px] border-era-soft text-era-muted",
  ghost: "bg-transparent text-era-muted",
  seal: "bg-transparent border-[2px] border-era-soft text-era-muted",
  danger: "bg-era-sunken text-era-muted",
};

export const buttonShapes: Record<ButtonShape, string> = {
  pill: "rounded-pill",
  rounded: "rounded-button",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "py-2 px-6 text-sm font-medium",
  md: "py-3 px-6 text-base font-medium",
  lg: "py-3.5 px-6 text-lg font-semibold",
};

export const buttonIconGaps: Record<ButtonSize, string> = {
  sm: "gap-[7px]",
  md: "gap-[7px]",
  lg: "gap-1",
};

export const buttonIconSizes: Record<ButtonSize, string> = {
  sm: "w-4 h-4",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export const buttonIconPadding: Record<
  ButtonSize,
  { left: string; right: string }
> = {
  sm: { left: "pl-3.5 pr-4", right: "pl-4 pr-3.5" },
  md: { left: "pl-[18px] pr-5", right: "pl-5 pr-[18px]" },
  lg: { left: "pl-5", right: "pr-5" },
};

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  disabled?: boolean;
  loading?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
  className?: string;
}

export function buttonStyles(props: ButtonStyleProps = {}): string {
  const {
    variant = "primary",
    size = "md",
    shape = "rounded",
    disabled = false,
    loading = false,
    hasLeftIcon = false,
    hasRightIcon = false,
    className,
  } = props;
  const isDisabled = disabled || loading;

  return cn(
    // Base layout
    "inline-flex items-center justify-center whitespace-nowrap",
    // Era-aware typography
    "font-era-display",
    "tracking-era-display",
    "case-era",
    // Era-aware motion
    "transition-colors duration-era ease-era-brush",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    buttonShapes[shape],
    buttonSizes[size],
    buttonIconGaps[size],
    isDisabled
      ? cn(buttonDisabledVariants[variant], "cursor-not-allowed")
      : buttonVariants[variant],
    hasLeftIcon && buttonIconPadding[size].left,
    hasRightIcon && buttonIconPadding[size].right,
    className,
  );
}
