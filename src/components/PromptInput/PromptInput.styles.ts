import { cn } from "@/utils/cn";

export const promptInputWrap = "flex flex-col gap-1.5 w-full max-w-xl";

export const promptInputLabel = cn(
  "font-era-display tracking-era-display case-era",
  "text-xs font-semibold text-era-muted",
);

export const promptInputShell = cn(
  "relative flex items-end gap-2 px-2.5 py-2 rounded-card",
  "bg-era-raised border-era shadow-era-card",
  "transition-colors duration-era ease-era-brush",
);

export const promptInputShellError = cn(
  "border border-[var(--era-intent-error)]",
  "focus-within:ring-2 focus-within:ring-[rgb(255,82,104/0.25)]",
);

export const promptInputRoot = cn(promptInputShell, "w-full max-w-xl");

export const promptInputTextarea = cn(
  "flex-1 px-2 py-1 outline-none resize-none bg-transparent",
  "font-era-body text-sm text-era-primary",
  "placeholder:text-era-muted",
  "min-h-[26px] max-h-48",
  "disabled:cursor-not-allowed",
);

export const promptInputSendStyles = cn(
  "w-9 h-9 rounded-full grid place-items-center cursor-pointer border-0",
  "bg-[rgb(var(--accent-600))] text-era-inverse [[data-era=neon]_&]:text-white",
  "transition-transform duration-era-fast ease-era-brush",
  "motion-safe:hover:scale-110",
  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-500)/0.4)]",
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
);

export const promptInputFooter = "flex items-start justify-between gap-3";

export const promptInputHelp = "text-[11px] text-era-muted";

export const promptInputHelpError = cn(
  "text-[11px] font-medium",
  "text-[var(--era-intent-error)]",
);

export const promptInputCounter = cn(
  "text-[11px] tabular-nums text-era-muted",
  "ml-auto",
);

export const promptInputCounterExceeded = cn(
  "text-[11px] tabular-nums font-medium ml-auto",
  "text-[var(--era-intent-error)]",
);

export const promptInputLoadingOverlay = cn(
  "absolute inset-0 grid place-items-center rounded-card",
  "bg-era-raised/60 pointer-events-none",
);
