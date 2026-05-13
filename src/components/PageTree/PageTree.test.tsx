import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PageTree } from "./PageTree";

const NODES = [
  {
    value: "root",
    label: "동양 컬렉션",
    defaultOpen: true,
    children: [
      { value: "dragon", label: "龍虎相搏" },
      { value: "five", label: "五行연환" },
    ],
  },
];

/**
 * A nested fixture used by the keyboard-navigation tests. Two top-level
 * branches, each with two leaves. Both branches start collapsed so we can
 * exercise expand/collapse explicitly.
 */
const NESTED = [
  {
    value: "a",
    label: "갑",
    children: [
      { value: "a1", label: "갑1" },
      { value: "a2", label: "갑2" },
    ],
  },
  {
    value: "b",
    label: "을",
    children: [
      { value: "b1", label: "을1" },
      { value: "b2", label: "을2" },
    ],
  },
];

/**
 * Returns the inner clickable row for a node with the given accessible label.
 * The roving-tabindex / focus / click handlers all live on this inner div,
 * not the outer treeitem wrapper.
 */
const innerRow = (label: string) => {
  const treeitem = screen.getByText(label).closest('[role="treeitem"]');
  expect(treeitem).not.toBeNull();
  // The inner row is the first element child of the treeitem.
  return treeitem!.firstElementChild as HTMLDivElement;
};

/**
 * Pumps a requestAnimationFrame so the deferred focusItem() call fires before
 * we make assertions.
 */
const flushRaf = async () => {
  await act(async () => {
    await new Promise((r) =>
      requestAnimationFrame(() => {
        requestAnimationFrame(() => r(undefined));
      }),
    );
  });
};

describe("PageTree", () => {
  it("renders tree structure", () => {
    render(<PageTree nodes={NODES} />);
    expect(screen.getByText("동양 컬렉션")).toBeInTheDocument();
  });

  it("expands children by defaultOpen", () => {
    render(<PageTree nodes={NODES} />);
    expect(screen.getByText("龍虎相搏")).toBeInTheDocument();
  });

  it("calls onChange when selecting", () => {
    const onChange = vi.fn();
    render(<PageTree nodes={NODES} onChange={onChange} />);
    fireEvent.click(screen.getByText("龍虎相搏"));
    expect(onChange).toHaveBeenCalledWith("dragon");
  });

  it("toggles caret on parent click", () => {
    render(<PageTree nodes={NODES} />);
    const parent = screen.getByText("동양 컬렉션");
    fireEvent.click(parent);
    expect(screen.queryByText("龍虎相搏")).not.toBeInTheDocument();
  });

  describe("WAI-ARIA tree pattern", () => {
    it("makes only one treeitem tabbable on initial render (roving tabindex)", () => {
      render(<PageTree nodes={NESTED} />);
      const rows = [innerRow("갑"), innerRow("을")];
      const tabbable = rows.filter((r) => r.tabIndex === 0);
      expect(tabbable).toHaveLength(1);
      // Default tabbable is the first visible item when nothing is selected.
      expect(rows[0]!.tabIndex).toBe(0);
      expect(rows[1]!.tabIndex).toBe(-1);
    });

    it("tabbable item defaults to the selected value when one is provided", () => {
      render(<PageTree nodes={NESTED} value="b" />);
      expect(innerRow("을").tabIndex).toBe(0);
      expect(innerRow("갑").tabIndex).toBe(-1);
    });

    it("sets aria-selected on the selected treeitem", () => {
      render(<PageTree nodes={NESTED} value="b" />);
      const selectedItem = screen.getByText("을").closest('[role="treeitem"]')!;
      const otherItem = screen.getByText("갑").closest('[role="treeitem"]')!;
      expect(selectedItem).toHaveAttribute("aria-selected", "true");
      expect(otherItem).toHaveAttribute("aria-selected", "false");
    });

    it("ArrowDown moves focus to the next visible item", async () => {
      render(<PageTree nodes={NESTED} />);
      const first = innerRow("갑");
      first.focus();
      fireEvent.keyDown(first, { key: "ArrowDown" });
      await flushRaf();
      expect(innerRow("을").tabIndex).toBe(0);
      expect(document.activeElement).toBe(innerRow("을"));
    });

    it("ArrowUp moves focus to the previous visible item", async () => {
      render(<PageTree nodes={NESTED} />);
      const second = innerRow("을");
      second.focus();
      fireEvent.keyDown(second, { key: "ArrowUp" });
      await flushRaf();
      expect(innerRow("갑").tabIndex).toBe(0);
      expect(document.activeElement).toBe(innerRow("갑"));
    });

    it("ArrowRight on a collapsed parent expands it", () => {
      render(<PageTree nodes={NESTED} />);
      const parent = innerRow("갑");
      parent.focus();
      // Children are not yet rendered.
      expect(screen.queryByText("갑1")).not.toBeInTheDocument();
      fireEvent.keyDown(parent, { key: "ArrowRight" });
      expect(screen.getByText("갑1")).toBeInTheDocument();
      expect(parent.closest('[role="treeitem"]')).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });

    it("ArrowRight on an expanded parent moves focus to the first child", async () => {
      render(<PageTree nodes={NESTED} />);
      const parent = innerRow("갑");
      parent.focus();
      // Expand first.
      fireEvent.keyDown(parent, { key: "ArrowRight" });
      // Now move into the first child.
      fireEvent.keyDown(parent, { key: "ArrowRight" });
      await flushRaf();
      expect(document.activeElement).toBe(innerRow("갑1"));
      expect(innerRow("갑1").tabIndex).toBe(0);
    });

    it("ArrowLeft on an expanded parent collapses it", () => {
      render(<PageTree nodes={NESTED} />);
      const parent = innerRow("갑");
      parent.focus();
      fireEvent.keyDown(parent, { key: "ArrowRight" }); // expand
      expect(screen.getByText("갑1")).toBeInTheDocument();
      fireEvent.keyDown(parent, { key: "ArrowLeft" }); // collapse
      expect(screen.queryByText("갑1")).not.toBeInTheDocument();
      expect(parent.closest('[role="treeitem"]')).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });

    it("ArrowLeft on a leaf moves focus to its parent", async () => {
      render(<PageTree nodes={NESTED} />);
      const parent = innerRow("갑");
      parent.focus();
      fireEvent.keyDown(parent, { key: "ArrowRight" }); // expand
      fireEvent.keyDown(parent, { key: "ArrowRight" }); // into first child
      await flushRaf();
      const leaf = innerRow("갑1");
      fireEvent.keyDown(leaf, { key: "ArrowLeft" });
      await flushRaf();
      expect(document.activeElement).toBe(innerRow("갑"));
    });

    it("Home jumps focus to the first visible item", async () => {
      render(<PageTree nodes={NESTED} />);
      const second = innerRow("을");
      second.focus();
      fireEvent.keyDown(second, { key: "Home" });
      await flushRaf();
      expect(document.activeElement).toBe(innerRow("갑"));
    });

    it("End jumps focus to the last visible item", async () => {
      render(<PageTree nodes={NESTED} />);
      const first = innerRow("갑");
      first.focus();
      fireEvent.keyDown(first, { key: "End" });
      await flushRaf();
      expect(document.activeElement).toBe(innerRow("을"));
    });

    it("Enter activates the focused item and fires onChange", () => {
      const onChange = vi.fn();
      render(<PageTree nodes={NESTED} onChange={onChange} />);
      const first = innerRow("갑");
      first.focus();
      fireEvent.keyDown(first, { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith("a");
    });

    it("Space also activates the focused item", () => {
      const onChange = vi.fn();
      render(<PageTree nodes={NESTED} onChange={onChange} />);
      const first = innerRow("갑");
      first.focus();
      fireEvent.keyDown(first, { key: " " });
      expect(onChange).toHaveBeenCalledWith("a");
    });
  });

  describe("RTL keyboard semantics", () => {
    afterEach(() => {
      document.documentElement.removeAttribute("dir");
    });

    it("ArrowLeft expands a collapsed parent under RTL (logical 'next')", () => {
      document.documentElement.setAttribute("dir", "rtl");
      render(<PageTree nodes={NESTED} />);
      const parent = innerRow("갑");
      parent.focus();
      expect(screen.queryByText("갑1")).not.toBeInTheDocument();
      fireEvent.keyDown(parent, { key: "ArrowLeft" }); // logical expand
      expect(screen.getByText("갑1")).toBeInTheDocument();
    });

    it("ArrowRight collapses an expanded parent under RTL (logical 'prev')", () => {
      document.documentElement.setAttribute("dir", "rtl");
      render(<PageTree nodes={NESTED} />);
      const parent = innerRow("갑");
      parent.focus();
      fireEvent.keyDown(parent, { key: "ArrowLeft" }); // expand
      expect(screen.getByText("갑1")).toBeInTheDocument();
      fireEvent.keyDown(parent, { key: "ArrowRight" }); // logical collapse
      expect(screen.queryByText("갑1")).not.toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("renders the default EmptyState when nodes is empty", () => {
      render(<PageTree nodes={[]} />);
      expect(screen.getByTestId("pagetree-empty")).toBeInTheDocument();
      expect(screen.getByText("페이지가 없습니다")).toBeInTheDocument();
      // The empty branch deliberately does NOT use role="tree" — an empty
      // tree would violate aria-required-children. Consumers who need a
      // landmark should wrap the result themselves.
      expect(screen.queryByRole("tree")).toBeNull();
    });

    it("renders a custom emptyState ReactNode when provided", () => {
      render(
        <PageTree nodes={[]} emptyState={<span>커스텀 트리 비어있음</span>} />,
      );
      expect(screen.getByText("커스텀 트리 비어있음")).toBeInTheDocument();
      expect(screen.queryByText("페이지가 없습니다")).not.toBeInTheDocument();
    });

    it("does not render the empty wrapper when nodes has at least one entry", () => {
      render(<PageTree nodes={NODES} />);
      expect(screen.queryByTestId("pagetree-empty")).toBeNull();
      expect(screen.queryByText("페이지가 없습니다")).not.toBeInTheDocument();
      // The non-empty branch keeps the WAI-ARIA tree pattern.
      expect(screen.getByRole("tree")).toBeInTheDocument();
    });
  });
});
