import { cn } from "@/utils/cn";

export type ModalSize = "sm" | "md" | "lg";

const PANEL_SIZE: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export const modalBackdrop = cn(
  "fixed inset-0 z-modal-backdrop",
  "bg-era-overlay backdrop-blur-[4px]",
  "flex items-center justify-center p-4",
  "motion-safe:animate-fade-in",
);

export function modalPanelStyles(size: ModalSize = "md"): string {
  return cn(
    "w-full bg-era-raised border-era rounded-card shadow-era-modal",
    "p-6 z-modal",
    "motion-safe:animate-scale-in",
    PANEL_SIZE[size],
  );
}

export const modalTitle = cn(
  "font-era-display tracking-era-display case-era",
  "text-base font-bold text-era-primary mb-2",
);

export const modalDescription = "text-sm text-era-muted mb-5";

export const modalFooter = "flex justify-end gap-2";
