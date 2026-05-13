import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { useDir } from "@/utils/useDir";
import { EmptyState } from "@/components/EmptyState";
import {
  kanbanBoard,
  kanbanBoardEmptyWrap,
  kanbanCard,
  kanbanCardGrabbed,
  kanbanCardList,
  kanbanColumn,
  kanbanColumnHeader,
  kanbanLiveRegion,
} from "./KanbanBoard.styles";

export interface KanbanCardData {
  id: string;
  content: ReactNode;
  /**
   * Optional plain-text label for AT announcements. When `content` is a
   * `ReactNode` (icon + JSX), assistive tech cannot infer a clean label,
   * so this string is used in the live region instead. Falls back to the
   * card's `id` when omitted.
   */
  ariaLabel?: string;
}

export interface KanbanColumnData {
  id: string;
  title: ReactNode;
  cards: ReadonlyArray<KanbanCardData>;
  /**
   * Optional plain-text label for AT announcements / `aria-label` on the
   * column list. Falls back to a stringified `title` when the title is a
   * primitive, otherwise to the column `id`.
   */
  ariaLabel?: string;
}

export interface KanbanBoardProps extends HTMLAttributes<HTMLDivElement> {
  columns: ReadonlyArray<KanbanColumnData>;
  /** Drag-end / keyboard-drop callback `(cardId, fromColId, toColId)`. */
  onMove?: (cardId: string, fromColId: string, toColId: string) => void;
  /**
   * Politeness level for the AT announcement region. Defaults to
   * `'polite'` because reorder announcements should not interrupt other
   * speech. Pass `'off'` to suppress announcements entirely.
   */
  liveRegion?: "polite" | "assertive" | "off";
  /**
   * Custom **board-level** empty state, rendered when `columns.length === 0`
   * (no columns to receive cards). Defaults to an `<EmptyState>` with
   * Korean copy. Pass any `ReactNode` to override or `null` to render an
   * empty grid wrapper.
   *
   * Per-column empty rendering is unchanged: each empty column still
   * shows its header and a `min-h-[160px]` body so it remains a valid
   * drop target.
   */
  emptyState?: ReactNode;
  className?: string;
}

/** Resolve a plain-string label for a card (used by the live region). */
const cardLabelFor = (card: KanbanCardData): string => {
  if (card.ariaLabel) return card.ariaLabel;
  if (typeof card.content === "string") return card.content;
  if (typeof card.content === "number") return String(card.content);
  return card.id;
};

/** Resolve a plain-string label for a column (used by aria-label and announcements). */
const columnLabelFor = (col: KanbanColumnData): string => {
  if (col.ariaLabel) return col.ariaLabel;
  if (typeof col.title === "string") return col.title;
  if (typeof col.title === "number") return String(col.title);
  return col.id;
};

interface GrabState {
  cardId: string;
  /** Column the card was originally picked up from. */
  originColId: string;
  /** Index within the origin column at the moment of grab. */
  originIndex: number;
}

export const KanbanBoard = forwardRef<HTMLDivElement, KanbanBoardProps>(
  (
    { columns, onMove, liveRegion = "polite", emptyState, className, ...rest },
    ref,
  ) => {
    const cols = columns.length;
    const headingBaseId = useId();
    const dir = useDir();

    /**
     * Local "preview" order. Mirrors the prop on every render but lets
     * keyboard moves shuffle cards between columns without waiting for the
     * parent to re-feed `columns`. Each entry is a list of card ids in
     * insertion order.
     */
    const [order, setOrder] = useState<Record<string, string[]>>(() => {
      const seed: Record<string, string[]> = {};
      for (const c of columns) seed[c.id] = c.cards.map((card) => card.id);
      return seed;
    });

    /** Keyboard grab state — null when no grab is active. */
    const [grab, setGrab] = useState<GrabState | null>(null);

    /** Live-region message — set on grab/move/drop/cancel for AT readers. */
    const [announcement, setAnnouncement] = useState("");

    // Refs to each card so keyboard moves can re-focus the card after the
    // DOM re-orders (otherwise focus collapses back to <body>).
    const cardRefs = useRef(new Map<string, HTMLLIElement>());
    const setCardRef = useCallback(
      (id: string) => (el: HTMLLIElement | null) => {
        if (el) cardRefs.current.set(id, el);
        else cardRefs.current.delete(id);
      },
      [],
    );

    // Re-sync `order` when the parent feeds a new `columns` prop. We
    // compare a shape-stable signature (column id + ordered card ids) so
    // the local state only resets on real structural changes — never on
    // unrelated parent re-renders.
    const columnsSignature = columns
      .map((c) => `${c.id}:${c.cards.map((card) => card.id).join(",")}`)
      .join("|");
    useEffect(() => {
      const next: Record<string, string[]> = {};
      for (const c of columns) next[c.id] = c.cards.map((card) => card.id);
      setOrder(next);
      // If a grabbed card disappeared from the new prop, drop the grab
      // so we don't leave dangling state.
      setGrab((prev) => {
        if (!prev) return prev;
        const stillExists = columns.some((c) =>
          c.cards.some((card) => card.id === prev.cardId),
        );
        return stillExists ? prev : null;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnsSignature]);

    // Index of card lookups by id — useful for label resolution on
    // announcements without re-walking columns each time.
    const cardById = new Map<string, KanbanCardData>();
    const colById = new Map<string, KanbanColumnData>();
    for (const c of columns) {
      colById.set(c.id, c);
      for (const card of c.cards) cardById.set(card.id, card);
    }

    /** Find the column id currently hosting `cardId` in local order. */
    const findColumnOf = (cardId: string): string | null => {
      for (const c of columns) {
        if (order[c.id]?.includes(cardId)) return c.id;
      }
      return null;
    };

    const handleGrab = useCallback(
      (cardId: string, colId: string) => {
        const card = cardById.get(cardId);
        const col = colById.get(colId);
        if (!card || !col) return;
        const idx = order[colId]?.indexOf(cardId) ?? -1;
        if (idx === -1) return;
        setGrab({ cardId, originColId: colId, originIndex: idx });
        setAnnouncement(
          `Picked up ${cardLabelFor(card)} from ${columnLabelFor(col)}, ` +
            `position ${idx + 1} of ${order[colId].length}`,
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [order, columnsSignature],
    );

    /**
     * Move the grabbed card by one slot. `delta` is +1/-1 for vertical
     * moves; passing a non-null `targetColId` triggers a cross-column
     * jump (keeping the same index, clamped to the destination length).
     */
    const moveBy = useCallback(
      (delta: -1 | 1 | 0, targetColId: string | null) => {
        setGrab((g) => {
          if (!g) return g;
          const card = cardById.get(g.cardId);
          if (!card) return g;

          // Resolve the column the card lives in *right now* (may differ
          // from origin after a previous cross-column move during the same
          // grab gesture).
          const currentColId = findColumnOf(g.cardId);
          if (!currentColId) return g;

          if (targetColId && targetColId !== currentColId) {
            // Cross-column move: insert at the same index, clamped.
            const dest = colById.get(targetColId);
            if (!dest) return g;
            setOrder((prev) => {
              const fromList = prev[currentColId].filter(
                (id) => id !== g.cardId,
              );
              const idx = prev[currentColId].indexOf(g.cardId);
              const targetLen = prev[targetColId].length;
              const insertAt = Math.min(Math.max(idx, 0), targetLen);
              const toList = [
                ...prev[targetColId].slice(0, insertAt),
                g.cardId,
                ...prev[targetColId].slice(insertAt),
              ];
              const next = {
                ...prev,
                [currentColId]: fromList,
                [targetColId]: toList,
              };
              setAnnouncement(
                `${cardLabelFor(card)} moved to ${columnLabelFor(dest)}, ` +
                  `position ${insertAt + 1} of ${toList.length}`,
              );
              return next;
            });
          } else if (delta !== 0) {
            // Within-column move.
            setOrder((prev) => {
              const list = [...prev[currentColId]];
              const idx = list.indexOf(g.cardId);
              if (idx === -1) return prev;
              const targetIdx = idx + delta;
              if (targetIdx < 0 || targetIdx >= list.length) return prev;
              list.splice(idx, 1);
              list.splice(targetIdx, 0, g.cardId);
              const col = colById.get(currentColId)!;
              setAnnouncement(
                `${cardLabelFor(card)} moved to ${columnLabelFor(col)}, ` +
                  `position ${targetIdx + 1} of ${list.length}`,
              );
              return { ...prev, [currentColId]: list };
            });
          }

          // Re-focus the moved card on the next paint so subsequent arrow
          // presses keep flowing through the same card.
          queueMicrotask(() => {
            cardRefs.current.get(g.cardId)?.focus();
          });
          return g;
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [columnsSignature, order],
    );

    const handleDrop = useCallback(() => {
      setGrab((g) => {
        if (!g) return g;
        const card = cardById.get(g.cardId);
        const finalColId = findColumnOf(g.cardId);
        if (card && finalColId) {
          const finalCol = colById.get(finalColId)!;
          const idx = order[finalColId].indexOf(g.cardId);
          setAnnouncement(
            `Dropped ${cardLabelFor(card)} in ${columnLabelFor(finalCol)} ` +
              `at position ${idx + 1}`,
          );
          // Fire onMove only when the card actually changed columns. The
          // existing pointer drop semantics ignore same-column drops, so
          // mirror that here for keyboard parity.
          if (finalColId !== g.originColId) {
            onMove?.(g.cardId, g.originColId, finalColId);
          }
        }
        return null;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order, columnsSignature, onMove]);

    const handleCancel = useCallback(() => {
      setGrab((g) => {
        if (!g) return g;
        const card = cardById.get(g.cardId);
        const originCol = colById.get(g.originColId);
        // Restore the original column ordering by recomputing from the
        // prop (canonical source of truth at grab-start).
        const reset: Record<string, string[]> = {};
        for (const c of columns) reset[c.id] = c.cards.map((card) => card.id);
        setOrder(reset);
        if (card && originCol) {
          setAnnouncement(
            `Cancelled. ${cardLabelFor(card)} returned to ` +
              `${columnLabelFor(originCol)} at position ${g.originIndex + 1}`,
          );
        }
        // Re-focus the card on its original spot.
        queueMicrotask(() => {
          cardRefs.current.get(g.cardId)?.focus();
        });
        return null;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnsSignature]);

    const handleKeyDown = (
      event: ReactKeyboardEvent<HTMLLIElement>,
      cardId: string,
      colId: string,
    ) => {
      // Space and Enter both toggle grab/drop — APG drag-and-drop pattern.
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (grab && grab.cardId === cardId) {
          handleDrop();
        } else if (grab === null) {
          handleGrab(cardId, colId);
        }
        return;
      }

      // Escape cancels and restores the pre-grab order.
      if (event.key === "Escape" && grab && grab.cardId === cardId) {
        event.preventDefault();
        handleCancel();
        return;
      }

      // Arrow keys only move while a grab is active on this card.
      if (grab && grab.cardId === cardId) {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          moveBy(-1, null);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          moveBy(1, null);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          const currentColId = findColumnOf(cardId);
          if (!currentColId) return;
          const colIdx = columns.findIndex((c) => c.id === currentColId);
          if (colIdx === -1) return;
          // Logical direction: ArrowRight always advances toward the
          // inline-end side (next column in the data array), ArrowLeft
          // toward inline-start. Under `dir="rtl"` the physical layout
          // reverses, so we swap the two keys to keep the data semantics
          // pointing the same way the user perceives them.
          const isLogicalNext =
            dir === "rtl"
              ? event.key === "ArrowLeft"
              : event.key === "ArrowRight";
          const nextIdx = isLogicalNext ? colIdx + 1 : colIdx - 1;
          if (nextIdx < 0 || nextIdx >= columns.length) return;
          moveBy(0, columns[nextIdx].id);
        }
      }
    };

    // Board-level empty state: only triggered when there are zero
    // columns. A board with empty columns still has drop targets, so it
    // is not "empty" in the placeholder sense — per-column empties keep
    // their min-height body and stay reachable for the first card drop.
    if (cols === 0) {
      const empty =
        emptyState === undefined ? (
          <EmptyState
            title="보드가 비어 있습니다"
            description="컬럼을 추가하면 카드를 정리할 수 있습니다."
          />
        ) : (
          emptyState
        );
      return (
        <div
          ref={ref}
          className={cn(kanbanBoardEmptyWrap, className)}
          data-testid="kanban-board-empty"
          {...rest}
        >
          {empty}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(kanbanBoard, className)}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
        {...rest}
      >
        {columns.map((col) => {
          const headingId = `${headingBaseId}-${col.id}-title`;
          const orderedIds = order[col.id] ?? col.cards.map((c) => c.id);
          return (
            <div
              key={col.id}
              data-column-id={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const cardId = e.dataTransfer.getData("text/card-id");
                const fromCol = e.dataTransfer.getData("text/from-col");
                if (cardId && fromCol && fromCol !== col.id) {
                  // Optimistic local reorder so uncontrolled boards (no
                  // parent-fed columns refresh on `onMove`) still reflect
                  // the drop visually. Mirrors the keyboard cross-column
                  // path in `moveBy(0, targetColId)`.
                  setOrder((prev) => {
                    const fromList = (prev[fromCol] ?? []).filter(
                      (id) => id !== cardId,
                    );
                    const toList = [...(prev[col.id] ?? []), cardId];
                    return {
                      ...prev,
                      [fromCol]: fromList,
                      [col.id]: toList,
                    };
                  });
                  onMove?.(cardId, fromCol, col.id);
                }
              }}
              className={kanbanColumn}
            >
              <h5 id={headingId} className={kanbanColumnHeader}>
                {col.title}
              </h5>
              <ul
                role="list"
                aria-labelledby={headingId}
                aria-label={columnLabelFor(col)}
                className={kanbanCardList}
              >
                {orderedIds.map((cardId) => {
                  const card = cardById.get(cardId);
                  if (!card) return null;
                  const isGrabbed = grab?.cardId === card.id;
                  return (
                    <li
                      key={card.id}
                      ref={setCardRef(card.id)}
                      role="listitem"
                      tabIndex={0}
                      draggable
                      data-grabbed={isGrabbed ? "true" : undefined}
                      aria-roledescription="draggable card"
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/card-id", card.id);
                        e.dataTransfer.setData("text/from-col", col.id);
                      }}
                      onKeyDown={(e) => handleKeyDown(e, card.id, col.id)}
                      className={cn(kanbanCard, isGrabbed && kanbanCardGrabbed)}
                    >
                      {card.content}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {liveRegion !== "off" && (
          <div
            role="status"
            aria-live={liveRegion}
            aria-atomic="true"
            className={kanbanLiveRegion}
          >
            {announcement}
          </div>
        )}
      </div>
    );
  },
);

KanbanBoard.displayName = "KanbanBoard";
