import { cn } from "@/utils/cn";

export const tabsList = cn(
  "flex border-b border-era-soft -mb-px",
  "overflow-x-auto",
);

export interface TabStyleProps {
  active?: boolean;
  className?: string;
}

export function tabStyles({ active, className }: TabStyleProps = {}): string {
  return cn(
    // Wave 5b2-C3 overflow contract: cap a single tab label at 10rem and
    // clamp to a single line. `truncate` resolves to
    // `overflow-hidden text-ellipsis whitespace-nowrap` — replaces the
    // earlier `whitespace-nowrap` so very long labels don't push neighbors
    // off-screen. The list itself remains horizontally scrollable
    // (`overflow-x-auto` on `tabsList`) for cases where many tabs do
    // overflow the available width.
    "px-4 py-2.5 cursor-pointer max-w-[10rem] truncate",
    "font-era-display tracking-era-display case-era font-semibold text-sm",
    "border-b-2 border-transparent -mb-px",
    "transition-colors duration-era ease-era-brush",
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-500)/0.3)]",
    // Active text uses --era-accent-strong (accent-700 in Heritage,
    // accent-300 in Neon) so the label clears WCAG 2 AA on both era
    // surfaces. accent-700 alone fails contrast on the Neon void (~2.7:1).
    active
      ? "text-[rgb(var(--era-accent-strong))] border-[rgb(var(--accent-600))]"
      : "text-era-muted hover:text-era-primary",
    className,
  );
}

export const tabsPanel = "pt-4 text-sm text-era-primary";
