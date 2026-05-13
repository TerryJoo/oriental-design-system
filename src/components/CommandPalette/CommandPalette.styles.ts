import { cn } from "@/utils/cn";

export const commandPaletteRoot = cn(
  "w-full max-w-md rounded-card overflow-hidden",
  "bg-era-raised border-era shadow-era-modal",
);

export const commandPaletteInput = cn(
  "w-full px-4 py-3 text-sm bg-transparent outline-none",
  "border-b border-era-soft",
  "font-era-body text-era-primary placeholder:text-era-muted",
);

export const commandPaletteList = "p-1.5 max-h-64 overflow-y-auto";

export interface CommandItemStyleProps {
  selected?: boolean;
  className?: string;
}

export function commandPaletteItemStyles({
  selected,
  className,
}: CommandItemStyleProps = {}): string {
  return cn(
    "flex items-center justify-between px-2.5 py-2 rounded-md text-sm cursor-pointer",
    // Animate background only — animating `color` causes axe to catch
    // mid-transition rgb values when era CSS variables flip on mount,
    // producing false-positive color-contrast violations in EraCompare.
    "transition-[background-color] duration-era-fast ease-era-brush",
    selected
      ? "bg-[rgb(var(--accent-500)/0.12)] text-era-primary"
      : "text-era-primary hover:bg-[rgb(var(--accent-500)/0.08)]",
    className,
  );
}

export const commandPaletteKbd = cn(
  "px-1.5 py-0.5 rounded border border-era-soft text-[10px] text-era-muted",
  "font-mono",
);

export const commandPaletteEmpty =
  "px-3 py-6 text-center text-xs text-era-muted";
