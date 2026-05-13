import { cn } from "@/utils/cn";

export const textFieldWrap = "flex flex-col gap-1.5 w-full";
export const textFieldLabel = cn(
  "font-era-display tracking-era-display case-era",
  "text-xs font-semibold text-era-muted",
);
export const textFieldHelp = "text-[11px] text-era-muted";
export const textFieldHelpError = "text-[11px] text-[var(--era-intent-error)]";
