import { cn } from "@/utils/cn";

export type InputSize = "sm" | "md" | "lg";
export type InputVariant = "default" | "error";

export const inputSizes: Record<InputSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-3 py-2 text-base",
  lg: "px-4 py-3 text-lg",
};

export const inputVariants: Record<InputVariant, string> = {
  default: cn(
    "bg-era-sunken text-era-primary border-era",
    "focus:border-[rgb(var(--accent-600))] focus:ring-2 focus:ring-[rgb(var(--accent-500)/0.2)]",
  ),
  error: cn(
    "bg-era-sunken text-era-primary",
    "border border-[var(--era-intent-error)]",
    "focus:border-[var(--era-intent-error)] focus:ring-2 focus:ring-[rgb(255,82,104/0.25)]",
  ),
};

export interface InputStyleProps {
  size?: InputSize;
  variant?: InputVariant;
  className?: string;
}

export function inputStyles({
  size = "md",
  variant = "default",
  className,
}: InputStyleProps = {}): string {
  return cn(
    "w-full rounded-input",
    "font-era-body tracking-era-body",
    "transition-colors duration-era ease-era-brush",
    "outline-none placeholder:text-era-muted",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    inputSizes[size],
    inputVariants[variant],
    className,
  );
}
