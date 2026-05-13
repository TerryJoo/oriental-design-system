import { cn } from "@/utils/cn";

/**
 * Era-aware typography presets.
 *
 * Display tiers (`h1`/`h2`/`h3`) use `font-era-display` so headings render
 * in Gowun Batang (Heritage) or Orbitron (Neon). Body tiers use
 * `font-era-body` for Noto Serif KR / IBM Plex Sans KR.
 */
export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "body-sm"
  | "caption"
  | "accent"
  | "code";

export type TypographyTone =
  | "default"
  | "muted"
  | "inverse"
  | "accent"
  | "seal";

export const typographyVariants: Record<TypographyVariant, string> = {
  h1: cn(
    "font-era-display tracking-era-display case-era",
    "text-[clamp(28px,4vw,40px)] leading-tight font-bold",
  ),
  h2: cn(
    "font-era-display tracking-era-display case-era",
    "text-[clamp(22px,3vw,30px)] leading-tight font-bold",
  ),
  h3: cn(
    "font-era-display tracking-era-display case-era",
    "text-[clamp(18px,2.4vw,22px)] leading-snug font-semibold",
  ),
  h4: cn(
    "font-era-display tracking-era-display case-era",
    "text-base leading-snug font-semibold",
  ),
  body: cn("font-era-body tracking-era-body text-base leading-relaxed"),
  "body-sm": cn("font-era-body tracking-era-body text-sm leading-relaxed"),
  caption: cn("font-era-body tracking-era-body text-xs leading-normal"),
  accent: cn(
    "font-era-accent text-lg italic",
    // Neon flips italic off via case-era's uppercase metric — body falls
    // back to regular italic Latin.
  ),
  code: cn("font-mono text-sm leading-snug"),
};

export const typographyTones: Record<TypographyTone, string> = {
  default: "text-era-primary",
  muted: "text-era-muted",
  inverse: "text-era-inverse",
  accent: "text-accent-700",
  seal: "text-era-seal",
};

export interface TypographyStyleProps {
  variant?: TypographyVariant;
  tone?: TypographyTone;
  className?: string;
}

export function typographyStyles({
  variant = "body",
  tone = "default",
  className,
}: TypographyStyleProps = {}): string {
  return cn(typographyVariants[variant], typographyTones[tone], className);
}
