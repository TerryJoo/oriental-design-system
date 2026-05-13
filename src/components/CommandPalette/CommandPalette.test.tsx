import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandPalette } from "./CommandPalette";

const ITEMS = [
  {
    key: "new",
    label: "새 대국 시작",
    searchText: "새 대국 시작 new game",
    shortcut: "⌘N",
  },
  { key: "settings", label: "환경설정", searchText: "환경설정 settings" },
  { key: "help", label: "도움말", searchText: "도움말 help" },
];

describe("CommandPalette", () => {
  it("filters items by query", () => {
    render(<CommandPalette items={ITEMS} />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "환경" },
    });
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  it("shows empty message when no matches", () => {
    render(<CommandPalette items={ITEMS} emptyMessage="없음" />);
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "xyz" },
    });
    expect(screen.getByText("없음")).toBeInTheDocument();
  });

  it("triggers onSelect on click", () => {
    const onSelect = vi.fn();
    render(<CommandPalette items={[{ ...ITEMS[0], onSelect }]} />);
    fireEvent.click(screen.getByText("새 대국 시작"));
    expect(onSelect).toHaveBeenCalled();
  });

  it("triggers onSelect on Enter key", () => {
    const onSelect = vi.fn();
    render(<CommandPalette items={[{ ...ITEMS[0], onSelect }]} />);
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(onSelect).toHaveBeenCalled();
  });

  describe("WAI-ARIA combobox semantics", () => {
    it("input exposes role=combobox with required combobox attributes", () => {
      render(<CommandPalette items={ITEMS} />);
      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-expanded", "true");
      expect(input).toHaveAttribute("aria-autocomplete", "list");
      expect(input.getAttribute("aria-controls")).toBeTruthy();
    });

    it("aria-controls on the input matches the listbox id", () => {
      render(<CommandPalette items={ITEMS} />);
      const input = screen.getByRole("combobox");
      const listbox = screen.getByRole("listbox");
      const controls = input.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      expect(listbox.id).toBe(controls);
    });

    it("aria-activedescendant matches the currently active option's id", () => {
      render(<CommandPalette items={ITEMS} />);
      const input = screen.getByRole("combobox");
      const options = screen.getAllByRole("option");
      // Default selected index is 0.
      expect(options[0]).toHaveAttribute("aria-selected", "true");
      expect(options[0].id).toBeTruthy();
      expect(input).toHaveAttribute("aria-activedescendant", options[0].id);

      // ArrowDown moves the highlight; aria-activedescendant must follow.
      fireEvent.keyDown(input, { key: "ArrowDown" });
      const optionsAfter = screen.getAllByRole("option");
      expect(optionsAfter[1]).toHaveAttribute("aria-selected", "true");
      expect(input).toHaveAttribute(
        "aria-activedescendant",
        optionsAfter[1].id,
      );
    });

    it("each option has a non-empty id derived from the listbox id", () => {
      render(<CommandPalette items={ITEMS} />);
      const listbox = screen.getByRole("listbox");
      const options = screen.getAllByRole("option");
      for (const opt of options) {
        expect(opt.id).toBeTruthy();
        expect(opt.id.startsWith(listbox.id)).toBe(true);
      }
    });

    it("aria-activedescendant is absent when the filter matches nothing", () => {
      render(<CommandPalette items={ITEMS} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "zzzzzz" } });
      expect(screen.queryAllByRole("option")).toHaveLength(0);
      expect(input).not.toHaveAttribute("aria-activedescendant");
    });
  });

  describe("Empty-state ARIA", () => {
    // axe-core's `aria-required-children` rule rejects an empty
    // role="listbox" because a listbox with zero options is invalid.
    // The empty-state branch must therefore drop the listbox role.
    it("does not render role=listbox when no items match", () => {
      render(<CommandPalette items={ITEMS} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "zzzzzz" } });
      expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("exposes the empty message via role=status with aria-live", () => {
      render(<CommandPalette items={ITEMS} emptyMessage="없음" />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "xyz" } });
      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("없음");
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("aria-controls still resolves to the empty status node id", () => {
      render(<CommandPalette items={ITEMS} />);
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "zzzzzz" } });
      const status = screen.getByRole("status");
      expect(input.getAttribute("aria-controls")).toBe(status.id);
    });

    it("aria-expanded reflects the result count", () => {
      render(<CommandPalette items={ITEMS} />);
      const input = screen.getByRole("combobox");
      // Has matches → expanded.
      expect(input).toHaveAttribute("aria-expanded", "true");
      // No matches → not expanded.
      fireEvent.change(input, { target: { value: "zzzzzz" } });
      expect(input).toHaveAttribute("aria-expanded", "false");
      // Restoring matches re-expands.
      fireEvent.change(input, { target: { value: "" } });
      expect(input).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Escape close", () => {
    it("calls onClose when Escape is pressed inside the input", () => {
      const onClose = vi.fn();
      render(<CommandPalette items={ITEMS} onClose={onClose} />);
      fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape bubbles from inside the dialog", () => {
      const onClose = vi.fn();
      render(<CommandPalette items={ITEMS} onClose={onClose} />);
      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape" });
      expect(onClose).toHaveBeenCalled();
    });

    it("Escape is a no-op when onClose is not provided", () => {
      render(<CommandPalette items={ITEMS} />);
      // Should not throw, and nothing happens.
      expect(() =>
        fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" }),
      ).not.toThrow();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Focus management", () => {
    it("auto-focuses the search input on mount", () => {
      render(<CommandPalette items={ITEMS} />);
      expect(screen.getByRole("combobox")).toHaveFocus();
    });
  });
});
