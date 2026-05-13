import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  dragDropHandle,
  dragDropItem,
  dragDropItemDragging,
  dragDropItemGrabbed,
  dragDropList,
  dragDropListInner,
  dragDropLiveRegion,
} from "./DragDrop.styles";

export interface DragDropItemData {
  id: string;
  content: ReactNode;
  /**
   * Optional plain-text label for AT announcements. When `content` is a
   * `ReactNode` (icon + JSX), assistive tech cannot infer a clean label,
   * so this string is used in the live region instead. Falls back to the
   * item's `id` when omitted.
   */
  ariaLabel?: string;
}

export interface DragDropProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: ReadonlyArray<DragDropItemData>;
  /**
   * Called with the new id order whenever the order changes. Fires per
   * arrow-key move during a keyboard grab (live preview), on pointer
   * drop, and on Escape cancel (with the original order).
   */
  onChange?: (orderedIds: string[]) => void;
  /**
   * Politeness level for the AT announcement region. Defaults to
   * `'polite'` because reorder announcements should not interrupt other
   * speech. Pass `'off'` to suppress announcements entirely.
   */
  liveRegion?: "polite" | "assertive" | "off";
  className?: string;
}

/**
 * Resolve the announcement label for an item. Plain-string `content`
 * is the happiest path; rich content falls back to an explicit
 * `ariaLabel` and finally to the id so we never announce an empty string.
 */
const labelFor = (item: DragDropItemData): string => {
  if (item.ariaLabel) return item.ariaLabel;
  if (typeof item.content === "string") return item.content;
  if (typeof item.content === "number") return String(item.content);
  return item.id;
};

export const DragDrop = forwardRef<HTMLDivElement, DragDropProps>(
  ({ items, onChange, liveRegion = "polite", className, ...rest }, ref) => {
    const [order, setOrder] = useState<string[]>(items.map((it) => it.id));

    /**
     * Pointer drag state — id of the row currently held by the mouse.
     *
     * We store the value in BOTH a ref and React state because the two
     * call sites have different needs:
     *
     * - `onDragOver` reads `draggingIdRef.current` synchronously. React
     *   batches state updates triggered inside a `dragstart` handler,
     *   which means by the time the very next `dragover` fires, the
     *   component has not re-rendered yet and a `useState` closure would
     *   still see `null`. The ref is updated synchronously so the next
     *   `dragover` correctly identifies the source row.
     * - The visual `opacity-50` style on the source row is keyed on the
     *   React state — refs never trigger a re-render, so a state mirror
     *   is needed for that.
     */
    const draggingIdRef = useRef<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    /** Keyboard grab state — id of the row currently picked up via Space/Enter. */
    const [grabbedId, setGrabbedId] = useState<string | null>(null);

    /** Order at the moment the keyboard grab started, used by Escape to restore. */
    const grabStartOrderRef = useRef<string[] | null>(null);

    /** Live region message — set on grab/move/drop/cancel for AT readers. */
    const [announcement, setAnnouncement] = useState("");

    // Refs for each row so keyboard moves can re-focus the moved item
    // (otherwise focus stays on the slot index, not the moved item).
    const itemRefs = useRef(new Map<string, HTMLDivElement>());

    const setItemRef = useCallback(
      (id: string) => (el: HTMLDivElement | null) => {
        if (el) {
          itemRefs.current.set(id, el);
        } else {
          itemRefs.current.delete(id);
        }
      },
      [],
    );

    /**
     * Pointer-driven reorder. Used by `onDragOver` and re-used by the
     * keyboard `move-by-one-step` implementation. Returns the new order
     * so callers can fire `onChange` once with the canonical sequence.
     */
    const moveBefore = (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return;
      setOrder((prev) => {
        const without = prev.filter((id) => id !== sourceId);
        const idx = without.indexOf(targetId);
        const next = [
          ...without.slice(0, idx),
          sourceId,
          ...without.slice(idx),
        ];
        onChange?.(next);
        return next;
      });
    };

    /**
     * Keyboard helper — move the grabbed row by `delta` (-1 up, +1 down)
     * within `order`. Clamps at the list edges so ArrowUp at index 0 and
     * ArrowDown at the last index are no-ops (no announcement, no
     * `onChange`). Fires `onChange` per move so consumers see the same
     * live-preview behavior as the pointer path.
     */
    const moveByKeyboard = useCallback(
      (id: string, delta: -1 | 1) => {
        setOrder((prev) => {
          const idx = prev.indexOf(id);
          if (idx === -1) return prev;
          const targetIdx = idx + delta;
          if (targetIdx < 0 || targetIdx >= prev.length) return prev;
          const next = [...prev];
          next.splice(idx, 1);
          next.splice(targetIdx, 0, id);
          onChange?.(next);
          // Re-focus the moved row on the next paint so subsequent
          // ArrowUp/ArrowDown presses keep flowing through the same row.
          queueMicrotask(() => {
            itemRefs.current.get(id)?.focus();
          });
          // Build the announcement against `next` so position math
          // matches what the user just saw.
          const item = items.find((it) => it.id === id);
          if (item) {
            setAnnouncement(
              `${labelFor(item)} moved to position ${targetIdx + 1} of ${next.length}`,
            );
          }
          return next;
        });
      },
      [items, onChange],
    );

    const handleGrab = useCallback(
      (id: string) => {
        const item = items.find((it) => it.id === id);
        if (!item) return;
        grabStartOrderRef.current = order;
        setGrabbedId(id);
        const position = order.indexOf(id) + 1;
        setAnnouncement(
          `Picked up ${labelFor(item)}, position ${position} of ${order.length}`,
        );
      },
      [items, order],
    );

    const handleDrop = useCallback(
      (id: string) => {
        const item = items.find((it) => it.id === id);
        if (!item) return;
        const position = order.indexOf(id) + 1;
        setGrabbedId(null);
        grabStartOrderRef.current = null;
        setAnnouncement(
          `Dropped ${labelFor(item)} at position ${position} of ${order.length}`,
        );
      },
      [items, order],
    );

    const handleCancel = useCallback(
      (id: string) => {
        const item = items.find((it) => it.id === id);
        const original = grabStartOrderRef.current;
        if (original) {
          setOrder(original);
          onChange?.(original);
        }
        setGrabbedId(null);
        grabStartOrderRef.current = null;
        if (item && original) {
          const position = original.indexOf(id) + 1;
          setAnnouncement(
            `Cancelled. ${labelFor(item)} returned to position ${position} of ${original.length}`,
          );
        }
      },
      [items, onChange],
    );

    const handleKeyDown = (
      event: ReactKeyboardEvent<HTMLDivElement>,
      id: string,
    ) => {
      // Space and Enter both toggle grab/drop — APG drag-and-drop pattern.
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (grabbedId === id) {
          handleDrop(id);
        } else if (grabbedId === null) {
          handleGrab(id);
        }
        return;
      }

      // Escape cancels and restores the pre-grab order.
      if (event.key === "Escape" && grabbedId === id) {
        event.preventDefault();
        handleCancel(id);
        return;
      }

      // Arrow keys only move while a grab is active on this row.
      if (grabbedId === id) {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          moveByKeyboard(id, -1);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          moveByKeyboard(id, 1);
        }
      }
    };

    // Cancel any active grab when focus leaves the row (e.g. via Tab).
    // Use ref tracking so the cancel does not also restore order — Tab
    // out is a quiet "drop in place" rather than an Escape: the user has
    // already accepted intermediate moves implicitly. We commit here to
    // match the pointer drop semantics.
    const handleBlur = (id: string) => {
      if (grabbedId === id) {
        const item = items.find((it) => it.id === id);
        const position = order.indexOf(id) + 1;
        setGrabbedId(null);
        grabStartOrderRef.current = null;
        if (item) {
          setAnnouncement(
            `Dropped ${labelFor(item)} at position ${position} of ${order.length}`,
          );
        }
      }
    };

    // If the parent re-mounts with a different `items` length, keep the
    // grab state from pointing at a now-missing id.
    useEffect(() => {
      if (grabbedId && !items.some((it) => it.id === grabbedId)) {
        setGrabbedId(null);
        grabStartOrderRef.current = null;
      }
    }, [items, grabbedId]);

    const sorted = order
      .map((id) => items.find((it) => it.id === id))
      .filter((it): it is DragDropItemData => Boolean(it));

    return (
      <div ref={ref} className={cn(dragDropList, className)} {...rest}>
        {/*
         * `role="list"` is required so each child `role="listitem"` has the
         * parent role axe expects (aria-required-parent). The list is its
         * own wrapper rather than the outer div so the polite live region
         * can sit *outside* the list — putting it inside trips axe
         * `aria-required-children` because role=list disallows children
         * other than `listitem` / `group` / `separator`.
         */}
        <div role="list" className={dragDropListInner}>
          {sorted.map((item) => {
            const isGrabbed = grabbedId === item.id;
            return (
              <div
                key={item.id}
                ref={setItemRef(item.id)}
                role="listitem"
                tabIndex={0}
                draggable
                // `data-grabbed` drives the visible ring style and is what
                // tests and the live-region announcement key off. We
                // deliberately do NOT use `aria-pressed` here — it is only
                // valid on role=button and triggers axe `aria-allowed-attr`.
                // Screen readers receive the grab/drop state through the
                // polite live region instead, matching the WAI-ARIA APG
                // drag-and-drop guidance for non-button reorder rows.
                data-grabbed={isGrabbed ? "true" : undefined}
                aria-roledescription="draggable item"
                onDragStart={() => {
                  // Update the ref synchronously so the very next
                  // `dragover` (fired in the same tick) sees the source id
                  // even though React has not flushed the state-driven
                  // re-render yet. The state mirror powers the visual
                  // `opacity-50` style on the dragged row.
                  draggingIdRef.current = item.id;
                  setDraggingId(item.id);
                }}
                onDragEnd={() => {
                  draggingIdRef.current = null;
                  setDraggingId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  const source = draggingIdRef.current;
                  if (source && source !== item.id) {
                    moveBefore(source, item.id);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                onBlur={() => handleBlur(item.id)}
                className={cn(
                  dragDropItem,
                  draggingId === item.id && dragDropItemDragging,
                  isGrabbed && dragDropItemGrabbed,
                )}
              >
                <span aria-hidden="true" className={dragDropHandle}>
                  ⋮⋮
                </span>
                <span>{item.content}</span>
              </div>
            );
          })}
        </div>
        {liveRegion !== "off" && (
          <div
            role="status"
            aria-live={liveRegion}
            aria-atomic="true"
            className={dragDropLiveRegion}
          >
            {announcement}
          </div>
        )}
      </div>
    );
  },
);

DragDrop.displayName = "DragDrop";
