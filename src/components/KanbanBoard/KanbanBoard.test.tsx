import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { KanbanBoard } from "./KanbanBoard";

const COLS = [
  {
    id: "todo",
    title: "대기",
    cards: [
      { id: "c1", content: "토큰 정의" },
      { id: "c2", content: "PatternBackground" },
    ],
  },
  {
    id: "doing",
    title: "진행",
    cards: [{ id: "c3", content: "EraSwitch 검증" }],
  },
  { id: "done", title: "완료", cards: [] },
];

/**
 * Re-query the live `<li>` for a card by its visible text. Cross-column
 * keyboard moves remount the `<li>` under a new parent, so a reference
 * captured before the move points at a detached DOM node — re-resolving
 * after each move keeps `fireEvent` targeting the live element.
 */
const cardLi = (text: string): HTMLLIElement => {
  const el = screen.getByText(text).closest("li");
  if (!el) throw new Error(`No <li> ancestor for "${text}"`);
  return el as HTMLLIElement;
};

describe("KanbanBoard", () => {
  it("renders columns and cards", () => {
    render(<KanbanBoard columns={COLS} />);
    expect(screen.getByText("대기")).toBeInTheDocument();
    expect(screen.getByText("토큰 정의")).toBeInTheDocument();
    expect(screen.getByText("PatternBackground")).toBeInTheDocument();
  });

  it("makes cards draggable", () => {
    render(<KanbanBoard columns={COLS} />);
    expect(cardLi("토큰 정의")).toHaveAttribute("draggable", "true");
  });

  it("renders each column's card stack with role='list' and an aria-label", () => {
    render(<KanbanBoard columns={COLS} />);
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(3);
    expect(lists[0]).toHaveAttribute("aria-label", "대기");
    expect(lists[1]).toHaveAttribute("aria-label", "진행");
    expect(lists[2]).toHaveAttribute("aria-label", "완료");
  });

  it("renders cards as listitems with tabIndex=0", () => {
    render(<KanbanBoard columns={COLS} />);
    const items = screen.getAllByRole("listitem");
    // 2 cards in todo + 1 in doing + 0 in done = 3 listitems total
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(item).toHaveAttribute("tabindex", "0");
    }
  });

  it("Space grabs the focused card and marks it grabbed", () => {
    render(<KanbanBoard columns={COLS} />);
    const card = cardLi("토큰 정의");
    card.focus();
    fireEvent.keyDown(card, { key: " " });
    // `data-grabbed` is the canonical grab-state hook for both styling
    // (kanbanCardGrabbed is composed by the component when grabbed) and AT
    // observation through the polite live region. We deliberately do
    // **not** expose `aria-pressed`: that attribute is only valid on
    // `role="button"` and breaks axe's `aria-allowed-attr` when stamped
    // on a `<li role="listitem">`.
    expect(card).toHaveAttribute("data-grabbed", "true");
    expect(card).not.toHaveAttribute("aria-pressed");
  });

  it("listitem cards expose only listitem-compatible ARIA attributes", () => {
    // Regression guard for the Wave 5b2 a11y fix: stamping `aria-pressed`
    // on a listitem violates `aria-allowed-attr`. We keep
    // `aria-roledescription` (a global state, allowed on every role) and
    // `data-grabbed` (a `data-*` hook never gated by ARIA), but the role
    // must remain `listitem` and `aria-pressed` must never appear — even
    // while the card is grabbed.
    render(<KanbanBoard columns={COLS} />);
    const card = cardLi("토큰 정의");
    expect(card).toHaveAttribute("role", "listitem");
    expect(card).toHaveAttribute("aria-roledescription", "draggable card");
    expect(card).not.toHaveAttribute("aria-pressed");

    card.focus();
    fireEvent.keyDown(card, { key: " " });
    expect(card).toHaveAttribute("data-grabbed", "true");
    expect(card).not.toHaveAttribute("aria-pressed");
  });

  it("ArrowDown moves a grabbed card within its column", () => {
    render(<KanbanBoard columns={COLS} />);
    // Grab the first todo card.
    const card = cardLi("토큰 정의");
    card.focus();
    fireEvent.keyDown(card, { key: " " });
    fireEvent.keyDown(card, { key: "ArrowDown" });

    // After ArrowDown, the todo column lists "PatternBackground" first and
    // "토큰 정의" second.
    const todoList = screen.getAllByRole("list")[0];
    const items = within(todoList).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("PatternBackground");
    expect(items[1]).toHaveTextContent("토큰 정의");
  });

  it("ArrowRight moves a grabbed card to the next column", () => {
    render(<KanbanBoard columns={COLS} />);
    fireEvent.keyDown(cardLi("토큰 정의"), { key: " " });
    fireEvent.keyDown(cardLi("토큰 정의"), { key: "ArrowRight" });

    // The card now lives in the "진행" (doing) column.
    const doingList = screen.getAllByRole("list")[1];
    const items = within(doingList).getAllByRole("listitem");
    expect(items.some((it) => it.textContent === "토큰 정의")).toBe(true);
  });

  it("Space drops and fires onMove with (cardId, fromCol, toCol) when crossing columns", () => {
    const onMove = vi.fn();
    render(<KanbanBoard columns={COLS} onMove={onMove} />);
    fireEvent.keyDown(cardLi("토큰 정의"), { key: " " }); // grab
    fireEvent.keyDown(cardLi("토큰 정의"), { key: "ArrowRight" }); // todo → doing
    fireEvent.keyDown(cardLi("토큰 정의"), { key: " " }); // drop

    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith("c1", "todo", "doing");
  });

  it("pointer drop visually moves the card across columns in uncontrolled mode", () => {
    const onMove = vi.fn();
    const { container } = render(
      <KanbanBoard columns={COLS} onMove={onMove} />,
    );

    expect(
      within(screen.getAllByRole("list")[0]).getByText("토큰 정의"),
    ).toBeInTheDocument();

    const data = new Map<string, string>();
    const dataTransfer = {
      setData: (k: string, v: string) => {
        data.set(k, v);
      },
      getData: (k: string) => data.get(k) ?? "",
    } as unknown as DataTransfer;

    fireEvent.dragStart(cardLi("토큰 정의"), { dataTransfer });
    const doingColumn = container.querySelector(
      '[data-column-id="doing"]',
    ) as HTMLElement;
    fireEvent.drop(doingColumn, { dataTransfer });

    expect(onMove).toHaveBeenCalledWith("c1", "todo", "doing");
    expect(
      within(screen.getAllByRole("list")[0]).queryByText("토큰 정의"),
    ).toBeNull();
    expect(
      within(screen.getAllByRole("list")[1]).getByText("토큰 정의"),
    ).toBeInTheDocument();
  });

  it("Escape cancels the grab without firing onMove", () => {
    const onMove = vi.fn();
    render(<KanbanBoard columns={COLS} onMove={onMove} />);
    fireEvent.keyDown(cardLi("토큰 정의"), { key: " " }); // grab
    fireEvent.keyDown(cardLi("토큰 정의"), { key: "ArrowRight" }); // preview move
    fireEvent.keyDown(cardLi("토큰 정의"), { key: "Escape" }); // cancel

    expect(onMove).not.toHaveBeenCalled();
    // Card returns to its original column.
    const todoList = screen.getAllByRole("list")[0];
    const items = within(todoList).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("토큰 정의");
    expect(items[1]).toHaveTextContent("PatternBackground");
  });

  it("announces moves through a polite live region", () => {
    render(<KanbanBoard columns={COLS} />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");

    fireEvent.keyDown(cardLi("토큰 정의"), { key: " " });
    expect(liveRegion).toHaveTextContent(/Picked up 토큰 정의 from 대기/);

    fireEvent.keyDown(cardLi("토큰 정의"), { key: "ArrowRight" });
    expect(liveRegion).toHaveTextContent(/moved to 진행/);

    fireEvent.keyDown(cardLi("토큰 정의"), { key: " " });
    expect(liveRegion).toHaveTextContent(/Dropped 토큰 정의 in 진행/);
  });

  it("announces cancellation when Escape is pressed", () => {
    render(<KanbanBoard columns={COLS} />);
    const liveRegion = screen.getByRole("status");
    fireEvent.keyDown(cardLi("토큰 정의"), { key: " " });
    fireEvent.keyDown(cardLi("토큰 정의"), { key: "ArrowRight" });
    fireEvent.keyDown(cardLi("토큰 정의"), { key: "Escape" });
    expect(liveRegion).toHaveTextContent(
      /Cancelled\. 토큰 정의 returned to 대기/,
    );
  });

  it("suppresses the live region when liveRegion='off'", () => {
    render(<KanbanBoard columns={COLS} liveRegion="off" />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  describe("RTL keyboard semantics", () => {
    afterEach(() => {
      document.documentElement.removeAttribute("dir");
    });

    it("ArrowRight still advances toward inline-end (next column) under RTL", () => {
      document.documentElement.setAttribute("dir", "rtl");
      const onMove = vi.fn();
      render(<KanbanBoard columns={COLS} onMove={onMove} />);
      fireEvent.keyDown(cardLi("토큰 정의"), { key: " " }); // grab
      fireEvent.keyDown(cardLi("토큰 정의"), { key: "ArrowLeft" }); // logical next under RTL
      fireEvent.keyDown(cardLi("토큰 정의"), { key: " " }); // drop

      // ArrowLeft under RTL = "logical next" = todo → doing.
      expect(onMove).toHaveBeenCalledWith("c1", "todo", "doing");
    });

    it("ArrowLeft moves toward inline-start (previous column) under RTL", () => {
      document.documentElement.setAttribute("dir", "rtl");
      const onMove = vi.fn();
      render(<KanbanBoard columns={COLS} onMove={onMove} />);
      // Card c3 starts in `doing`. ArrowRight under RTL = logical prev = doing → todo.
      fireEvent.keyDown(cardLi("EraSwitch 검증"), { key: " " });
      fireEvent.keyDown(cardLi("EraSwitch 검증"), { key: "ArrowRight" });
      fireEvent.keyDown(cardLi("EraSwitch 검증"), { key: " " });

      expect(onMove).toHaveBeenCalledWith("c3", "doing", "todo");
    });
  });

  describe("Board-level empty state", () => {
    it("renders the default EmptyState when columns is empty", () => {
      render(<KanbanBoard columns={[]} />);
      expect(screen.getByTestId("kanban-board-empty")).toBeInTheDocument();
      // Default Korean copy from the resolved EmptyState slot.
      expect(screen.getByText("보드가 비어 있습니다")).toBeInTheDocument();
      // Empty boards have nothing to drop on, so the per-column live region
      // is also absent (no columns to host one).
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("renders a custom emptyState ReactNode when provided", () => {
      render(
        <KanbanBoard
          columns={[]}
          emptyState={<span>커스텀 보드 비어있음</span>}
        />,
      );
      expect(screen.getByText("커스텀 보드 비어있음")).toBeInTheDocument();
      expect(
        screen.queryByText("보드가 비어 있습니다"),
      ).not.toBeInTheDocument();
    });

    it("does not render the empty wrapper when columns has at least one entry (even with zero cards)", () => {
      // A column with zero cards is still a valid drop target and should
      // not trigger the board-level empty placeholder.
      render(
        <KanbanBoard columns={[{ id: "todo", title: "대기", cards: [] }]} />,
      );
      expect(screen.queryByTestId("kanban-board-empty")).toBeNull();
      expect(
        screen.queryByText("보드가 비어 있습니다"),
      ).not.toBeInTheDocument();
      // The single empty column still renders its header.
      expect(screen.getByText("대기")).toBeInTheDocument();
    });
  });
});
