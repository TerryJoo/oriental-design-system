import { cn } from "@/utils/cn";

export const audioRecorderRoot = cn(
  "flex items-center gap-3 px-4 py-3 rounded-card",
  "bg-era-sunken border-era min-w-[280px]",
);

export type RecorderState = "stopped" | "recording" | "paused";

export interface RecorderButtonStyleProps {
  recorderState?: RecorderState;
  className?: string;
}

const recorderButtonStateStyles: Record<RecorderState, string> = {
  stopped: "bg-era-raised text-era-primary",
  recording:
    "bg-[var(--era-intent-error)] text-white motion-safe:animate-pulse-subtle",
  paused: "bg-[var(--era-intent-warning)] text-white",
};

export function audioRecorderButtonStyles({
  recorderState = "stopped",
  className,
}: RecorderButtonStyleProps = {}): string {
  return cn(
    "w-11 h-11 rounded-full grid place-items-center cursor-pointer",
    "border-0 text-lg",
    "motion-safe:transition-transform duration-era-fast ease-era-brush",
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--era-accent-strong))]",
    recorderButtonStateStyles[recorderState],
    className,
  );
}

export const audioRecorderSecondaryButton = cn(
  "w-11 h-11 rounded-full grid place-items-center cursor-pointer",
  "border-era bg-era-raised text-era-primary text-lg",
  "motion-safe:transition-transform duration-era-fast ease-era-brush",
  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--era-accent-strong))]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

export const audioRecorderWave =
  "flex items-center gap-0.5 flex-1 h-7 overflow-hidden";

export const audioRecorderWaveBar = cn(
  "w-[3px] rounded-sm bg-[rgb(var(--accent-600))]",
);

export const audioRecorderWaveBarActive =
  "motion-safe:animate-[wave_1s_ease-in-out_infinite]";

export const audioRecorderTime = cn(
  "font-mono text-sm font-semibold text-era-primary tabular-nums",
);

export const audioRecorderLiveRegion = cn(
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap",
  "border-0 [clip:rect(0,0,0,0)]",
);
