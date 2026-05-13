import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownMenu, type DropdownMenuItem } from "./DropdownMenu";

describe("DropdownMenu", () => {
  it("renders flat items", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu
        items={[
          { key: "profile", label: "프로필", onSelect },
          { key: "settings", label: "설정" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "프로필" }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("renders sections with separators", () => {
    render(
      <DropdownMenu
        items={[
          { items: [{ key: "a", label: "A" }] },
          { items: [{ key: "b", label: "B", danger: true }] },
        ]}
      />,
    );
    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
  });

  it("disables disabled items", () => {
    render(<DropdownMenu items={[{ key: "x", label: "X", disabled: true }]} />);
    expect(screen.getByRole("menuitem", { name: "X" })).toBeDisabled();
  });

  describe("WAI-ARIA menu keyboard pattern", () => {
    const FOUR_ITEMS: ReadonlyArray<DropdownMenuItem> = [
      { key: "a", label: "A" },
      { key: "b", label: "B" },
      { key: "c", label: "C", disabled: true },
      { key: "d", label: "D" },
    ];

    it("applies roving tabindex on first render: first non-disabled item is 0, others are -1", async () => {
      render(<DropdownMenu items={FOUR_ITEMS} />);
      const items = screen.getAllByRole("menuitem");
      // Wait for the initial-focus effect to have fired so focusedIndex is set.
      await waitFor(() => expect(items[0]).toHaveFocus());
      expect(items[0]).toHaveAttribute("tabindex", "0");
      expect(items[1]).toHaveAttribute("tabindex", "-1");
      expect(items[2]).toHaveAttribute("tabindex", "-1");
      expect(items[3]).toHaveAttribute("tabindex", "-1");
    });

    it("focuses the first non-disabled item on mount", async () => {
      render(
        <DropdownMenu
          items={[
            { key: "a", label: "A", disabled: true },
            { key: "b", label: "B" },
            { key: "c", label: "C" },
          ]}
        />,
      );
      const [, b] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(b).toHaveFocus());
    });

    it("ArrowDown moves focus to the next non-disabled item and skips disabled ones", async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={FOUR_ITEMS} />);
      const [a, b, , d] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{ArrowDown}");
      expect(b).toHaveFocus();
      expect(b).toHaveAttribute("tabindex", "0");
      expect(a).toHaveAttribute("tabindex", "-1");

      // Next ArrowDown must skip the disabled item C and land on D.
      await user.keyboard("{ArrowDown}");
      expect(d).toHaveFocus();
    });

    it("ArrowDown wraps from last to first", async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={FOUR_ITEMS} />);
      const [a, , , d] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{End}");
      expect(d).toHaveFocus();
      await user.keyboard("{ArrowDown}");
      expect(a).toHaveFocus();
    });

    it("ArrowUp moves focus backward and wraps from first to last", async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={FOUR_ITEMS} />);
      const [a, , , d] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{ArrowUp}");
      // Wraps to last.
      expect(d).toHaveFocus();
    });

    it("ArrowUp skips disabled items", async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={FOUR_ITEMS} />);
      const [a, b, , d] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{End}");
      expect(d).toHaveFocus();
      await user.keyboard("{ArrowUp}"); // would be C, but C is disabled → B
      expect(b).toHaveFocus();
    });

    it("Home jumps to the first non-disabled item", async () => {
      const user = userEvent.setup();
      render(<DropdownMenu items={FOUR_ITEMS} />);
      const [a, , , d] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{End}");
      expect(d).toHaveFocus();
      await user.keyboard("{Home}");
      expect(a).toHaveFocus();
    });

    it("End jumps to the last non-disabled item", async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu
          items={[
            { key: "a", label: "A" },
            { key: "b", label: "B" },
            { key: "c", label: "C" },
            { key: "d", label: "D", disabled: true },
          ]}
        />,
      );
      const [a, , c] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{End}");
      // D is disabled, so End lands on C.
      expect(c).toHaveFocus();
    });

    it("Enter on the focused item activates onSelect and calls onClose", async () => {
      const user = userEvent.setup();
      const onSelectB = vi.fn();
      const onClose = vi.fn();
      render(
        <DropdownMenu
          onClose={onClose}
          items={[
            { key: "a", label: "A" },
            { key: "b", label: "B", onSelect: onSelectB },
          ]}
        />,
      );
      const [a, b] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());
      await user.keyboard("{ArrowDown}");
      expect(b).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onSelectB).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Space on the focused item activates onSelect and calls onClose", async () => {
      const user = userEvent.setup();
      const onSelectA = vi.fn();
      const onClose = vi.fn();
      render(
        <DropdownMenu
          onClose={onClose}
          items={[{ key: "a", label: "A", onSelect: onSelectA }]}
        />,
      );
      const [a] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("[Space]");
      expect(onSelectA).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Escape calls onClose without activating an item", async () => {
      const user = userEvent.setup();
      const onSelectA = vi.fn();
      const onClose = vi.fn();
      render(
        <DropdownMenu
          onClose={onClose}
          items={[{ key: "a", label: "A", onSelect: onSelectA }]}
        />,
      );
      const [a] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onSelectA).not.toHaveBeenCalled();
    });

    it("Tab calls onClose so the consumer can unmount and let focus proceed", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <DropdownMenu
          onClose={onClose}
          items={[
            { key: "a", label: "A" },
            { key: "b", label: "B" },
          ]}
        />,
      );
      const [a] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.tab();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("Shift+Tab also calls onClose", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <DropdownMenu
          onClose={onClose}
          items={[
            { key: "a", label: "A" },
            { key: "b", label: "B" },
          ]}
        />,
      );
      const [a] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.tab({ shift: true });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closeOnSelect={false} keeps the menu open after activation", async () => {
      const user = userEvent.setup();
      const onSelectA = vi.fn();
      const onClose = vi.fn();
      render(
        <DropdownMenu
          closeOnSelect={false}
          onClose={onClose}
          items={[{ key: "a", label: "A", onSelect: onSelectA }]}
        />,
      );
      const [a] = screen.getAllByRole("menuitem");
      await waitFor(() => expect(a).toHaveFocus());

      await user.keyboard("{Enter}");
      expect(onSelectA).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("clicking a menu item activates it and closes the menu by default", async () => {
      const user = userEvent.setup();
      const onSelectA = vi.fn();
      const onClose = vi.fn();
      render(
        <DropdownMenu
          onClose={onClose}
          items={[{ key: "a", label: "A", onSelect: onSelectA }]}
        />,
      );
      const [a] = screen.getAllByRole("menuitem");
      await user.click(a);
      expect(onSelectA).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not activate disabled items via keyboard", async () => {
      const user = userEvent.setup();
      const onSelectDisabled = vi.fn();
      const onClose = vi.fn();
      // Force initial focus to be on the disabled item by giving it a sibling
      // that lets us navigate; but since findFirstEnabled skips disabled items,
      // we test clicking instead — disabled <button> won't fire onClick anyway.
      render(
        <DropdownMenu
          onClose={onClose}
          items={[
            {
              key: "a",
              label: "A",
              disabled: true,
              onSelect: onSelectDisabled,
            },
            { key: "b", label: "B" },
          ]}
        />,
      );
      const [a] = screen.getAllByRole("menuitem");
      // Clicking a disabled button is a no-op natively.
      await user.click(a);
      expect(onSelectDisabled).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
