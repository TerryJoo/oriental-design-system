import { cn } from "@/utils/cn";

export type AlertIntent = "info" | "success" | "warning" | "error";

export const alertIntents: Record<
  AlertIntent,
  { wrap: string; bar: string; title: string }
> = {
  info: {
    wrap: "bg-[rgb(var(--accent-500)/0.08)]",
    bar: "border-s-4 border-[rgb(var(--accent-600))]",
    title: "text-[rgb(var(--era-accent-strong))]",
  },
  success: {
    wrap: "bg-[rgb(50,224,161/0.08)]",
    bar: "border-s-4 border-[var(--era-intent-success)]",
    title: "text-success-700 [[data-era=neon]_&]:text-success-300",
  },
  warning: {
    wrap: "bg-[rgb(255,192,68/0.08)]",
    bar: "border-s-4 border-[var(--era-intent-warning)]",
    title: "text-warning-700 [[data-era=neon]_&]:text-warning-300",
  },
  error: {
    wrap: "bg-[rgb(255,82,104/0.08)]",
    bar: "border-s-4 border-[var(--era-intent-error)]",
    title: "text-error-700 [[data-era=neon]_&]:text-error-300",
  },
};

export interface AlertStyleProps {
  intent?: AlertIntent;
  className?: string;
}

export function alertStyles({
  intent = "info",
  className,
}: AlertStyleProps = {}): string {
  const i = alertIntents[intent];
  return cn(
    "flex items-start gap-3 px-4 py-3 rounded-card",
    "transition-colors duration-era ease-era-brush",
    i.wrap,
    i.bar,
    className,
  );
}

export function alertTitleStyles(intent: AlertIntent = "info"): string {
  return cn(
    "font-era-display tracking-era-display case-era font-bold text-sm",
    alertIntents[intent].title,
  );
}

export const alertMessageStyles = "text-era-muted text-xs leading-relaxed";
