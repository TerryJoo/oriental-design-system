import { cn } from "@/utils/cn";

export const accordionRoot = cn(
  "w-full rounded-card border-era overflow-hidden",
  "bg-era-raised",
);

export const accordionItem = "border-b border-era-soft last:border-b-0";

export const accordionHeader = cn(
  "flex w-full items-center justify-between px-4 py-3",
  "font-era-display tracking-era-display case-era font-bold text-sm",
  "text-era-primary text-start",
  "hover:bg-[rgb(var(--accent-500)/0.06)]",
  "transition-colors duration-era ease-era-brush",
  "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-500)/0.3)] focus:ring-inset",
);

export const accordionChevron = cn(
  "motion-safe:transition-transform duration-era ease-era-brush text-era-muted",
);

export const accordionChevronOpen = "rotate-90 [color:rgb(var(--accent-600))]";

export const accordionBody = cn(
  "overflow-hidden motion-safe:transition-[max-height,padding] duration-era ease-era-brush",
  "text-sm text-era-muted",
);

export const accordionBodyClosed = "max-h-0 px-4";
export const accordionBodyOpen = "max-h-[400px] px-4 pb-3.5";
