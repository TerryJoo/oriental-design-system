import { cn } from "@/utils/cn";

export type ToastIntent = "info" | "success" | "warning" | "error";

const ACCENT: Record<ToastIntent, string> = {
  info: "border-s-4 border-[rgb(var(--accent-600))]",
  success: "border-s-4 border-[var(--era-intent-success)]",
  warning: "border-s-4 border-[var(--era-intent-warning)]",
  error: "border-s-4 border-[var(--era-intent-error)]",
};

export interface ToastStyleProps {
  intent?: ToastIntent;
  className?: string;
}

export function toastStyles({
  intent = "info",
  className,
}: ToastStyleProps = {}): string {
  return cn(
    "flex items-center gap-3 px-4 py-3 rounded-card min-w-[240px]",
    "bg-era-raised border-era shadow-era-modal",
    "font-era-body text-era-primary text-sm",
    // Entry animation — transform-only, no opacity dip.
    // Earlier `animate-slide-up` keyframe ramped opacity 0→1, which
    // dropped contrast below WCAG AA at sample time and made axe flag
    // the body span + icon. `toast-enter` (declared via injected
    // <style> in Toast.tsx) preserves opacity:1 throughout. Wrapped in
    // `motion-safe:` so users with `prefers-reduced-motion: reduce`
    // get an instant render with zero motion.
    "motion-safe:animate-[toast-enter_300ms_ease-out_both]",
    ACCENT[intent],
    className,
  );
}

export const toastIntents = ACCENT;

/**
 * Keyframe CSS injected once per page by Toast.tsx. Defined here so
 * the styles module owns all visual primitives. Only translates Y —
 * does NOT touch opacity, which would trip color-contrast checks.
 */
export const toastEnterKeyframes = `@keyframes toast-enter {
  from { transform: translateY(8px); }
  to { transform: translateY(0); }
}`;

/**
 * Map intent → ARIA live-region role per WAI-ARIA notification pattern.
 *
 *  - info / success → `status` (polite). Non-disruptive announcements
 *    that wait for the user's idle moment.
 *  - warning / error → `alert` (assertive). Interrupts the user's
 *    current focus to surface a problem immediately.
 *
 * Both roles imply their own `aria-live` value, so we do NOT add a
 * redundant `aria-live` attribute (which axe accepts but DOM tooling
 * sometimes flags as redundant).
 */
export const toastRoleByIntent: Record<ToastIntent, "status" | "alert"> = {
  info: "status",
  success: "status",
  warning: "alert",
  error: "alert",
};
