import {
  cloneElement,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { cn } from "@/utils/cn";
import {
  popoverEnterKeyframes,
  popoverPanelStyles,
  popoverWrap,
  type PopoverPlacement,
} from "./Popover.styles";

export type { PopoverPlacement } from "./Popover.styles";

// Inject `@keyframes popover-enter` once per document. The keyframe is
// transform-only (scale 0.97 → 1) — opacity is held at 1 so axe
// color-contrast scans pass at every animation frame. See
// `popoverEnterKeyframes` in Popover.styles.ts for the source.
let popoverStylesInjected = false;
const injectPopoverKeyframes = () => {
  if (popoverStylesInjected) return;
  if (typeof document === "undefined") return;
  // Survive HMR / re-renders: dedupe by id.
  if (document.getElementById("oriental-popover-keyframes")) {
    popoverStylesInjected = true;
    return;
  }
  const styleEl = document.createElement("style");
  styleEl.id = "oriental-popover-keyframes";
  styleEl.textContent = popoverEnterKeyframes;
  document.head.appendChild(styleEl);
  popoverStylesInjected = true;
};

if (typeof document !== "undefined") {
  injectPopoverKeyframes();
}

interface TriggerProps {
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "dialog";
  "aria-controls"?: string;
}

export interface PopoverProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  /** Element that triggers the popover (typically a Button). */
  trigger: ReactElement<TriggerProps>;
  /** Popover content. */
  content: ReactNode;
  placement?: PopoverPlacement;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional ref to receive initial focus when the panel opens. If not
   * provided, focus moves to the first focusable element inside the panel,
   * falling back to the panel root.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

function getFirstFocusable(panel: HTMLElement): HTMLElement | null {
  const candidate = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  return candidate ?? null;
}

export const Popover = forwardRef<HTMLSpanElement, PopoverProps>(
  (
    {
      trigger,
      content,
      placement = "bottom-start",
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      initialFocusRef,
      className,
      ...rest
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const wrapRef = useRef<HTMLSpanElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const triggerElementRef = useRef<HTMLElement | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const wasOpenRef = useRef<boolean>(open);

    const panelId = useId();

    const setOpen = (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // Outside click dismissal.
    useEffect(() => {
      if (!open) return;
      const onDocClick = (e: MouseEvent) => {
        if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Escape key dismissal.
    useEffect(() => {
      if (!open) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
        }
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Focus management on open/close transitions.
    useEffect(() => {
      const wasOpen = wasOpenRef.current;
      wasOpenRef.current = open;

      if (!wasOpen && open) {
        // Opening: capture currently-focused element, then move focus into panel.
        previouslyFocusedRef.current =
          (document.activeElement as HTMLElement | null) ??
          triggerElementRef.current;

        // Defer to next microtask so the panel is mounted in the DOM.
        queueMicrotask(() => {
          const panel = panelRef.current;
          if (!panel) return;

          if (initialFocusRef?.current) {
            initialFocusRef.current.focus();
            return;
          }

          const first = getFirstFocusable(panel);
          if (first) {
            first.focus();
          } else {
            panel.focus();
          }
        });
      } else if (wasOpen && !open) {
        // Closing: restore focus to trigger (or the previously-focused element).
        const target =
          triggerElementRef.current ?? previouslyFocusedRef.current;
        if (target && typeof target.focus === "function") {
          target.focus();
        }
      }
    }, [open, initialFocusRef]);

    const originalOnClick = trigger.props.onClick;
    const originalRef = (
      trigger as ReactElement<TriggerProps> & {
        ref?: Ref<HTMLElement>;
      }
    ).ref;
    const enhancedTrigger = cloneElement(trigger, {
      onClick: (e: ReactMouseEvent<HTMLElement>) => {
        originalOnClick?.(e);
        setOpen(!open);
      },
      "aria-expanded": open,
      "aria-haspopup": "dialog",
      "aria-controls": panelId,
      ref: (node: HTMLElement | null) => {
        triggerElementRef.current = node;
        if (typeof originalRef === "function") originalRef(node);
        else if (originalRef && typeof originalRef === "object") {
          (originalRef as MutableRefObject<HTMLElement | null>).current = node;
        }
      },
    } as Partial<TriggerProps> & {
      ref: (node: HTMLElement | null) => void;
    });

    return (
      <span
        ref={(node) => {
          wrapRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(popoverWrap, className)}
        {...rest}
      >
        {enhancedTrigger}
        {open && (
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            tabIndex={-1}
            className={popoverPanelStyles({ placement })}
          >
            {content}
          </div>
        )}
      </span>
    );
  },
);

Popover.displayName = "Popover";
