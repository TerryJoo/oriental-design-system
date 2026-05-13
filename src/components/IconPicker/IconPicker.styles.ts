import { cn } from "@/utils/cn";

export const iconPickerGrid = cn(
  "grid gap-1.5 w-full",
  "grid-cols-[repeat(auto-fill,minmax(40px,1fr))]",
);

export interface IconPickerCellStyleProps {
  active?: boolean;
  className?: string;
}

export function iconPickerCellStyles({
  active,
  className,
}: IconPickerCellStyleProps = {}): string {
  return cn(
    "aspect-square grid place-items-center cursor-pointer",
    "rounded-md text-lg",
    "motion-safe:transition-all duration-era-fast ease-era-brush",
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-500)/0.3)]",
    active
      ? "bg-[rgb(var(--accent-600))] text-era-inverse [[data-era=neon]_&]:text-white"
      : "bg-era-sunken border-era text-era-primary motion-safe:hover:scale-105 hover:border-era-strong",
    className,
  );
}
