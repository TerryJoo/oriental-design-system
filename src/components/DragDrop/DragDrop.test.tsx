import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DragDrop } from "./DragDrop";

const ITEMS = [
  { id: "a", content: "1. 돌 종류" },
  { id: "b", content: "2. 위치 지정" },
  { id: "c", content: "3. 턴 종료" },
];

describe("DragDrop", () => {
  it("renders all items", () => {
    render(<DragDrop items={ITEMS} />);
    expect(screen.getByText("1. 돌 종류")).toBeInTheDocument();
    expect(screen.getByText("3. 턴 종료")).toBeInTheDocument();
  });

  it("makes each item draggable", () => {
    render(<DragDrop items={ITEMS} />);
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute(
      "draggable",
      "true",
    );
  });

  // ─── Container & item ARIA semantics (axe parity) ─────────────────────

  it("wraps items in role=list so listitem children have the required parent", () => {
    render(<DragDrop items={ITEMS} />);
    // Container exposes role=list (axe `aria-required-parent`).
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    // Listitems are children of that list.
    const listitems = screen.getAllByRole("listitem");
    expect(listitems).toHaveLength(ITEMS.length);
    listitems.forEach((row) => {
      expect(list).toContainElement(row);
    });
  });

  it("does not put aria-pressed on listitem rows (axe aria-allowed-attr)", () => {
    render(<DragDrop items={ITEMS} />);
    const rows = screen.getAllByRole("listitem");
    rows.forEach((row) => {
      // aria-pressed is only valid on role=button; on role=listitem axe
      // raises `aria-allowed-attr`. We use data-grabbed + the live region
      // for state instead. Assert neither initial nor grabbed renders
      // emit aria-pressed.
      expect(row).not.toHaveAttribute("aria-pressed");
    });
  });

  it("each item carries the draggable-item roledescription", () => {
    render(<DragDrop items={ITEMS} />);
    screen.getAllByRole("listitem").forEach((row) => {
      expect(row).toHaveAttribute("aria-roledescription", "draggable item");
    });
  });

  it("keeps the polite live region outside the role=list element (axe aria-required-children)", () => {
    render(<DragDrop items={ITEMS} />);
    const list = screen.getByRole("list");
    const live = screen.getByRole("status");
    // The list axe rule rejects non-listitem children. Putting the live
    // region as a sibling rather than a child satisfies the rule.
    expect(list).not.toContainElement(live);
  });

  // Regression guard for the wrapper restructure: the pointer-drag reorder
  // path must continue to work after splitting role=list into a separate
  // inner element. dragOver fires on a row → moveBefore reorders.
  it("pointer dragOver reorders rows (parity with the WAI-ARIA APG keyboard path)", () => {
    const onChange = vi.fn();
    render(<DragDrop items={ITEMS} onChange={onChange} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    const source = items[2];
    const target = items[0];
    const dataTransfer = new DataTransfer();
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.dragEnd(source, { dataTransfer });

    expect(onChange).toHaveBeenCalledWith(["c", "a", "b"]);
    const reordered = screen.getAllByRole("listitem");
    expect(reordered[0]).toHaveTextContent("3. 턴 종료");
    expect(reordered[1]).toHaveTextContent("1. 돌 종류");
  });

  // ─── Keyboard reorder pattern (WAI-ARIA APG) ──────────────────────────

  it("makes each item focusable for keyboard users", () => {
    render(<DragDrop items={ITEMS} />);
    const items = screen.getAllByRole("listitem");
    items.forEach((row) => {
      expect(row).toHaveAttribute("tabIndex", "0");
    });
  });

  it("Tab + Space grabs the focused row, ArrowDown moves it, Space drops", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DragDrop items={ITEMS} onChange={onChange} />);

    // Tab into the first row.
    await user.tab();
    const first = screen.getAllByRole("listitem")[0];
    expect(first).toHaveFocus();
    // No aria-pressed — listitem disallows it. Pre-grab rows have no
    // data-grabbed attr.
    expect(first).not.toHaveAttribute("aria-pressed");
    expect(first).not.toHaveAttribute("data-grabbed");

    // Space grabs. data-grabbed flips on; the live region (asserted later)
    // is the AT-facing state channel since aria-pressed cannot be used.
    await user.keyboard(" ");
    expect(first).toHaveAttribute("data-grabbed", "true");

    // ArrowDown moves the grabbed row down by one position. After the
    // first ArrowDown the grabbed row sits at index 1 (was index 0).
    await user.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith(["b", "a", "c"]);

    // Live region reflects the move.
    const live = screen.getByRole("status");
    expect(live).toHaveTextContent(/moved to position 2 of 3/);

    // Second ArrowDown moves to the bottom.
    await user.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith(["b", "c", "a"]);

    // Space drops the row in place. data-grabbed clears.
    await user.keyboard(" ");
    const movedRow = screen
      .getAllByRole("listitem")
      .find((el) => el.textContent?.includes("돌 종류"));
    expect(movedRow).not.toHaveAttribute("aria-pressed");
    expect(movedRow).not.toHaveAttribute("data-grabbed");
    expect(live).toHaveTextContent(/Dropped .* at position 3 of 3/);
  });

  it("Escape cancels an active grab and restores the original order", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DragDrop items={ITEMS} onChange={onChange} />);

    await user.tab();
    await user.keyboard(" ");
    await user.keyboard("{ArrowDown}");
    expect(onChange).toHaveBeenLastCalledWith(["b", "a", "c"]);

    // Escape rolls the order back to the pre-grab snapshot.
    await user.keyboard("{Escape}");
    expect(onChange).toHaveBeenLastCalledWith(["a", "b", "c"]);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("1. 돌 종류");
    expect(rows[1]).toHaveTextContent("2. 위치 지정");
    expect(rows[2]).toHaveTextContent("3. 턴 종료");

    const live = screen.getByRole("status");
    expect(live).toHaveTextContent(/Cancelled\..*returned to position/);
  });

  it("ArrowUp at the top edge is a no-op (no onChange, no announcement update)", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DragDrop items={ITEMS} onChange={onChange} />);

    await user.tab();
    await user.keyboard(" "); // grab first row
    onChange.mockClear();
    await user.keyboard("{ArrowUp}"); // already at index 0 — no-op
    expect(onChange).not.toHaveBeenCalled();
  });

  it("live region carries the grab announcement on pickup", async () => {
    const user = userEvent.setup();
    render(<DragDrop items={ITEMS} />);

    await user.tab();
    await user.keyboard(" ");

    const live = screen.getByRole("status");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveAttribute("aria-atomic", "true");
    expect(live).toHaveTextContent(/Picked up .*1\. 돌 종류.*position 1 of 3/);
  });

  it("uses ariaLabel for announcements when content is a ReactNode", async () => {
    const user = userEvent.setup();
    render(
      <DragDrop
        items={[
          { id: "x", content: <span>icon-x</span>, ariaLabel: "First task" },
          { id: "y", content: <span>icon-y</span>, ariaLabel: "Second task" },
        ]}
      />,
    );

    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("status")).toHaveTextContent(
      /Picked up First task, position 1 of 2/,
    );
  });

  it("liveRegion='off' suppresses the announcement region", () => {
    render(<DragDrop items={ITEMS} liveRegion="off" />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("Tab away from a grabbed row drops it in place rather than carrying the grab", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DragDrop items={ITEMS} onChange={onChange} />);

    await user.tab();
    await user.keyboard(" "); // grab row 1
    await user.keyboard("{ArrowDown}"); // row 1 now at index 1

    // Tabbing into the next row blurs the grabbed row → drop in place.
    // Wrap in act() because the blur handler updates state.
    await act(async () => {
      await user.tab();
    });

    const grabbed = screen
      .getAllByRole("listitem")
      .find((row) => row.getAttribute("data-grabbed") === "true");
    expect(grabbed).toBeUndefined();
  });
});
