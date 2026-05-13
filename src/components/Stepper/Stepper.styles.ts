import { cn } from "@/utils/cn";

export const stepperRoot = "flex items-start w-full";
export const stepperStep =
  "flex flex-col items-center gap-1.5 min-w-[64px] flex-shrink-0";
export const stepperLabel = cn(
  "text-[11px] font-era-display tracking-era-display case-era",
  "text-era-muted",
);
export const stepperDescription = cn(
  "text-[10px] font-era-display text-era-muted",
  "max-w-[120px] text-center",
);

export type StepResolvedState =
  | "todo"
  | "current"
  | "done"
  | "error"
  | "completed";

export interface StepCircleStyleProps {
  state: StepResolvedState;
}

export function stepperCircleStyles({ state }: StepCircleStyleProps): string {
  return cn(
    "w-7 h-7 rounded-full grid place-items-center text-xs font-bold",
    "border-[2px] font-era-display",
    "transition-colors duration-era ease-era-brush",
    state === "done" &&
      "bg-[rgb(var(--accent-600))] text-white border-[rgb(var(--accent-700))]",
    state === "current" &&
      "border-[rgb(var(--accent-600))] text-accent-700 [box-shadow:0_0_0_3px_rgb(var(--accent-500)/0.2)]",
    state === "todo" && "bg-era-sunken border-era-soft text-era-muted",
    state === "error" &&
      "bg-[var(--era-intent-error)] text-white border-[var(--era-intent-error)]",
    state === "completed" &&
      "bg-[var(--era-intent-success)] text-white border-[var(--era-intent-success)]",
  );
}

export const stepperLine = "flex-1 h-0.5 bg-era-soft self-start mt-3.5 -mx-1.5";
export const stepperLineDone = "bg-[rgb(var(--accent-600))]";
export const stepperLineCompleted = "bg-[var(--era-intent-success)]";
