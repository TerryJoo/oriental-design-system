import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Portal } from "@/utils/Portal";
import { cn } from "@/utils/cn";
import {
  modalBackdrop,
  modalDescription,
  modalFooter,
  modalPanelStyles,
  modalTitle,
  type ModalSize,
} from "./Modal.styles";

export type { ModalSize } from "./Modal.styles";

export type ModalRole = "dialog" | "alertdialog";

export interface ModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title" | "role"
> {
  open: boolean;
  onClose?: () => void;
  size?: ModalSize;
  title?: ReactNode;
  description?: ReactNode;
  /** Footer slot — usually action buttons. */
  footer?: ReactNode;
  /** Close when clicking the backdrop. Defaults true. */
  closeOnBackdropClick?: boolean;
  /** Close when pressing Escape. Defaults true. */
  closeOnEscape?: boolean;
  /**
   * ARIA role. Use `"alertdialog"` for critical, interrupting confirmations
   * (e.g., destructive actions). Defaults to `"dialog"`.
   */
  role?: ModalRole;
  /**
   * Element to receive focus when the dialog opens. If omitted, the first
   * focusable descendant inside the panel is focused; if none exist, the
   * panel itself receives focus.
   */
  initialFocusRef?: RefObject<HTMLElement>;
  className?: string;
}

// Module-level counter so nested modals share a single body scroll lock.
let openModalCount = 0;
let previousBodyOverflow: string | null = null;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
  "audio[controls]",
  "video[controls]",
  "details > summary:first-of-type",
].join(",");

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

function isElementInDocument(el: Element | null): el is HTMLElement {
  return !!el && typeof document !== "undefined" && document.body.contains(el);
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      size = "md",
      title,
      description,
      footer,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      role = "dialog",
      initialFocusRef,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const reactId = useId();
    const titleId = `${reactId}-title`;
    const descId = `${reactId}-desc`;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = useRef<Element | null>(null);

    // Allow consumers to receive the panel ref while we keep an internal one.
    useImperativeHandle(ref, () => panelRef.current as HTMLDivElement, []);

    const handleBackdrop = useCallback(
      (e: ReactMouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && closeOnBackdropClick) onClose?.();
      },
      [closeOnBackdropClick, onClose],
    );

    // Escape close — keep window-level so users outside the panel can dismiss.
    useEffect(() => {
      if (!open || !closeOnEscape) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose?.();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, closeOnEscape, onClose]);

    // Body scroll lock with stacking counter (SSR-safe).
    useEffect(() => {
      if (!open) return;
      if (typeof document === "undefined") return;
      if (openModalCount === 0) {
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      openModalCount += 1;
      return () => {
        openModalCount = Math.max(0, openModalCount - 1);
        if (openModalCount === 0 && typeof document !== "undefined") {
          document.body.style.overflow = previousBodyOverflow ?? "";
          previousBodyOverflow = null;
        }
      };
    }, [open]);

    // Initial focus + focus restoration.
    useEffect(() => {
      if (!open) return;
      if (typeof document === "undefined") return;

      // Capture the element that was focused before opening.
      previouslyFocusedRef.current = document.activeElement;

      // Defer one tick so the portal has mounted the panel into the DOM.
      const handle = window.setTimeout(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const target =
          initialFocusRef?.current ?? getFocusableElements(panel)[0] ?? panel;
        try {
          target.focus();
        } catch {
          /* focus may throw in degraded environments */
        }
      }, 0);

      return () => {
        window.clearTimeout(handle);
        const previous = previouslyFocusedRef.current;
        if (isElementInDocument(previous)) {
          try {
            previous.focus();
          } catch {
            /* ignore */
          }
        } else if (typeof document !== "undefined") {
          document.body.focus?.();
        }
        previouslyFocusedRef.current = null;
      };
    }, [open, initialFocusRef]);

    // Focus trap — intercept Tab/Shift+Tab on the panel.
    const handlePanelKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLDivElement>) => {
        if (e.key !== "Tab") return;
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = getFocusableElements(panel);
        if (focusables.length === 0) {
          // Nothing to cycle through — keep focus on the panel.
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey) {
          if (active === first || !panel.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !panel.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      },
      [],
    );

    if (!open) return null;

    return (
      <Portal>
        <div
          role="presentation"
          className={modalBackdrop}
          onClick={handleBackdrop}
        >
          <div
            ref={panelRef}
            role={role}
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
            className={cn(modalPanelStyles(size), className)}
            {...rest}
          >
            {title && (
              <h2 id={titleId} className={modalTitle}>
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className={modalDescription}>
                {description}
              </p>
            )}
            {children}
            {footer && <div className={modalFooter}>{footer}</div>}
          </div>
        </div>
      </Portal>
    );
  },
);

Modal.displayName = "Modal";
