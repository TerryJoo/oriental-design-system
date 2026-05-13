import { cn } from "@/utils/cn";

export type CheckboxSize = "sm" | "md" | "lg";

export const checkboxBoxSizes: Record<CheckboxSize, string> = {
  sm: "w-4 h-4",
  md: "w-[18px] h-[18px]",
  lg: "w-5 h-5",
};

export const checkboxLabelSizes: Record<CheckboxSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const checkboxWrap =
  "inline-flex items-center gap-2 cursor-pointer select-none";

export function checkboxBoxStyles(size: CheckboxSize = "md"): string {
  return cn(
    "relative inline-flex items-center justify-center shrink-0",
    "rounded bg-era-sunken border-era-strong",
    "transition-colors duration-era ease-era-brush",
    "peer-checked:bg-[rgb(var(--accent-600))] peer-checked:border-[rgb(var(--accent-700))]",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--accent-500)/0.3)]",
    "peer-disabled:opacity-40",
    // Toggle the checkmark child from the box (box is the peer-sibling).
    // `peer-checked:[&>span]:…` compiles to `.peer:checked ~ .box > span { … }`,
    // which is the only way to drive a nested element from `:checked` state.
    "[&>span]:hidden peer-checked:[&>span]:block",
    checkboxBoxSizes[size],
  );
}

export const checkboxCheckmark = cn(
  "border-r-2 border-b-2 border-era-inverse",
  "w-[5px] h-[10px] rotate-45 -translate-y-px",
);
