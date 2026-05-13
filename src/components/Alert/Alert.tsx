import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  alertMessageStyles,
  alertStyles,
  alertTitleStyles,
  type AlertIntent,
} from "./Alert.styles";

export type { AlertIntent } from "./Alert.styles";

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  intent?: AlertIntent;
  /** Strong heading for the alert. Accepts JSX. */
  title?: ReactNode;
  /** Custom leading icon node. Falls back to a default per intent. */
  icon?: ReactNode;
  className?: string;
}

const DEFAULT_ICON: Record<AlertIntent, string> = {
  info: "ℹ︎",
  success: "✓",
  warning: "!",
  error: "✕",
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ intent = "info", title, icon, children, className, ...rest }, ref) => {
    // The default icon is purely decorative (info/✓/!/✕ glyphs already
    // conveyed by `role="alert"` + intent semantics) and is hidden from
    // assistive tech. When the consumer supplies a custom node — which may
    // contain interactive content such as a close <button> — we MUST NOT
    // wrap it in `aria-hidden="true"` (axe `aria-hidden-focus`: focusable
    // descendants of an aria-hidden ancestor are forbidden).
    const usingDefaultIcon = icon === undefined;
    return (
      <div
        ref={ref}
        role="alert"
        className={alertStyles({ intent, className })}
        {...rest}
      >
        <span
          {...(usingDefaultIcon ? { "aria-hidden": "true" } : {})}
          className="text-lg leading-none mt-0.5"
        >
          {icon ?? DEFAULT_ICON[intent]}
        </span>
        <div className="flex-1">
          {title && <div className={alertTitleStyles(intent)}>{title}</div>}
          {children && <div className={alertMessageStyles}>{children}</div>}
        </div>
      </div>
    );
  },
);

Alert.displayName = "Alert";
