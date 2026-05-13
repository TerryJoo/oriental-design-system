import { cn } from "@/utils/cn";

export const dropdownMenuRoot = cn(
  "min-w-[200px] rounded-card p-1.5",
  "bg-era-raised border-era shadow-era-card",
);

export interface DropdownMenuItemStyleProps {
  danger?: boolean;
  disabled?: boolean;
  className?: string;
}

export function dropdownMenuItemStyles({
  danger,
  disabled,
  className,
}: DropdownMenuItemStyleProps = {}): string {
  return cn(
    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm w-full text-start",
    "transition-colors duration-era-fast ease-era-brush",
    "focus:outline-none",
    disabled && "opacity-40 cursor-not-allowed",
    !disabled &&
      !danger &&
      "text-era-primary hover:bg-[rgb(var(--accent-500)/0.1)]",
    !disabled &&
      danger &&
      "text-[var(--era-intent-error)] hover:bg-[rgb(255,82,104/0.1)]",
    className,
  );
}

export const dropdownMenuSeparator = "h-px bg-era-soft my-1";
