import { cn } from "@/utils/cn";

export type SyncStatusState = "connected" | "syncing" | "offline";

const STATE: Record<SyncStatusState, { dot: string; text: string }> = {
  connected: {
    dot: "bg-[var(--era-intent-success)] motion-safe:animate-pulse-subtle",
    text: "연결됨",
  },
  syncing: {
    dot: "bg-[var(--era-intent-warning)] motion-safe:animate-pulse-subtle",
    text: "동기화 중",
  },
  offline: { dot: "bg-[var(--era-intent-error)]", text: "오프라인" },
};

export interface SyncStatusStyleProps {
  state?: SyncStatusState;
  className?: string;
}

export function syncStatusContainer({
  className,
}: SyncStatusStyleProps = {}): string {
  return cn(
    "inline-flex items-center gap-2 px-3 py-1 rounded-pill",
    "bg-era-sunken border-era text-xs",
    "font-era-body text-era-primary",
    className,
  );
}

export function syncStatusDot(state: SyncStatusState = "connected"): string {
  return cn("w-2 h-2 rounded-full", STATE[state].dot);
}

export const syncStatusStateMap = STATE;
