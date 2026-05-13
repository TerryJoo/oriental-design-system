import { cn } from "@/utils/cn";

export type SwitchSize = "sm" | "md" | "lg";

const TRACK: Record<SwitchSize, string> = {
  sm: "w-8 h-[18px]",
  md: "w-10 h-[22px]",
  lg: "w-12 h-7",
};

const THUMB: Record<SwitchSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

// peer-checked variants must target the *sibling* of the input. The thumb is
// nested inside the track, so we drive its translate/color from the track via
// the arbitrary child selector `[&>span]:` — that turns
// `peer-checked:[&>span]:…` into `.peer:checked ~ .track > span { … }`.
//
// We also use the translate-x utility (sets --tw-translate-x) instead of
// `[transform:translateX(...)]`, so the thumb's vertical centering
// (`-translate-y-1/2`) is preserved when the switch is on.
const THUMB_TRANSLATE: Record<SwitchSize, string> = {
  sm: "peer-checked:[&>span]:translate-x-[14px]",
  md: "peer-checked:[&>span]:translate-x-[18px]",
  lg: "peer-checked:[&>span]:translate-x-[20px]",
};

export const switchSizes = TRACK;
export const switchThumbSizes = THUMB;

export const switchWrap =
  "inline-flex items-center gap-2 cursor-pointer select-none";

export function switchTrackStyles(size: SwitchSize = "md"): string {
  return cn(
    "relative inline-flex items-center shrink-0 rounded-full",
    "bg-era-sunken border-era",
    "transition-colors duration-era ease-era-brush",
    "peer-checked:bg-[rgb(var(--accent-600))]",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-[rgb(var(--accent-500)/0.3)]",
    "peer-disabled:opacity-40",
    TRACK[size],
    THUMB_TRANSLATE[size],
    "peer-checked:[&>span]:bg-era-inverse",
  );
}

export function switchThumbStyles(size: SwitchSize = "md"): string {
  return cn(
    "absolute left-[2px] top-1/2 -translate-y-1/2 rounded-full",
    "bg-era-primary",
    "motion-safe:transition-transform duration-era ease-era-brush",
    THUMB[size],
  );
}
