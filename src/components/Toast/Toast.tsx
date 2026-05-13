import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  toastEnterKeyframes,
  toastRoleByIntent,
  toastStyles,
  type ToastIntent,
} from "./Toast.styles";

export type { ToastIntent } from "./Toast.styles";

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  intent?: ToastIntent;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Optional dismiss button. */
  onDismiss?: () => void;
  /**
   * Override the live-region role. By default the role is derived from
   * `intent`: `status` (polite) for info/success, `alert` (assertive)
   * for warning/error per WAI-ARIA notification pattern.
   */
  role?: "status" | "alert";
  /** Accessible label for the dismiss button. Defaults to `닫기`. */
  dismissLabel?: string;
  className?: string;
}

const DEFAULT_ICON: Record<ToastIntent, string> = {
  info: "ℹ︎",
  success: "✓",
  warning: "!",
  error: "✕",
};

// Idempotent <style> injection. Module-level so it runs once even when
// many <Toast> instances mount. SSR-safe: skipped when `document` is
// undefined; the className still resolves and the toast stays readable
// (the keyframe is purely a motion enhancement).
let toastStylesInjected = false;
const injectToastKeyframes = () => {
  if (toastStylesInjected) return;
  if (typeof document === "undefined") return;
  // Survive HMR / re-renders: dedupe by id.
  if (document.getElementById("oriental-toast-keyframes")) {
    toastStylesInjected = true;
    return;
  }
  const styleEl = document.createElement("style");
  styleEl.id = "oriental-toast-keyframes";
  styleEl.textContent = toastEnterKeyframes;
  document.head.appendChild(styleEl);
  toastStylesInjected = true;
};

if (typeof document !== "undefined") {
  injectToastKeyframes();
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      intent = "info",
      icon,
      onDismiss,
      role,
      dismissLabel = "닫기",
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // Lazy injection guard for environments where the module-level call
    // ran before <head> was available (rare but possible in micro-frontends).
    injectToastKeyframes();

    const resolvedRole = role ?? toastRoleByIntent[intent];

    return (
      <div
        ref={ref}
        role={resolvedRole}
        // `aria-atomic` keeps screen readers from announcing partial
        // updates if the toast content swaps in place. `role` already
        // carries the implicit `aria-live` value, so we don't duplicate
        // it here.
        aria-atomic="true"
        className={toastStyles({ intent, className })}
        {...rest}
      >
        <span aria-hidden="true">{icon ?? DEFAULT_ICON[intent]}</span>
        <span className="flex-1">{children}</span>
        {onDismiss && (
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={onDismiss}
            className="text-era-muted hover:text-era-primary"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    );
  },
);

Toast.displayName = "Toast";
