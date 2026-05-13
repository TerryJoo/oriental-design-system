import { cn } from "@/utils/cn";
import {
  inputSizes,
  inputVariants,
  type InputSize,
  type InputVariant,
} from "../Input/Input.styles";

export type SelectSize = InputSize;
export type SelectVariant = InputVariant;

export interface SelectStyleProps {
  size?: SelectSize;
  variant?: SelectVariant;
  className?: string;
}

export function selectStyles({
  size = "md",
  variant = "default",
  className,
}: SelectStyleProps = {}): string {
  return cn(
    "w-full rounded-input appearance-none cursor-pointer pe-9",
    "font-era-body tracking-era-body text-era-primary",
    "transition-colors duration-era ease-era-brush",
    "outline-none disabled:opacity-50 disabled:cursor-not-allowed",
    // `select-era` is a project-scoped utility (defined in src/styles/globals.css)
    // that flips the browser-rendered option panel between light (Heritage) and
    // dark (Neon) chrome via `color-scheme` and applies era-aware
    // background-color/color on `<option>` where browsers honour it.
    // See option-styling browser matrix in Select.tsx docs.
    "select-era",
    inputSizes[size],
    inputVariants[variant],
    className,
  );
}

/**
 * Wrapper applied when the Select renders its own `<label>`. Mirrors the
 * TextField wrapper so labelled Select fields and labelled TextFields stack
 * the same way in forms.
 */
export const selectWrap = "flex flex-col gap-1.5 w-full";

/**
 * Label class for the optional Select `label` prop. Mirrors TextField's label
 * styling so Select / TextField labels read as a single visual family.
 */
export const selectLabel = cn(
  "font-era-display tracking-era-display case-era",
  "text-xs font-semibold text-era-muted",
);
