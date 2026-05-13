import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const ITEMS = [
  { value: "overview", label: "개요", content: "개요 내용" },
  { value: "rules", label: "규칙", content: "규칙 내용" },
  { value: "history", label: "역사", content: "역사 내용", disabled: true },
];

describe("Tabs", () => {
  it("renders all tab labels", () => {
    render(<Tabs items={ITEMS} />);
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("shows the panel of the active tab", () => {
    render(<Tabs items={ITEMS} defaultValue="overview" />);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("개요 내용");
  });

  it("switches active tab on click", () => {
    const onChange = vi.fn();
    render(<Tabs items={ITEMS} defaultValue="overview" onChange={onChange} />);
    fireEvent.click(screen.getByRole("tab", { name: "규칙" }));
    expect(onChange).toHaveBeenCalledWith("rules");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("규칙 내용");
  });

  it("disables disabled tabs", () => {
    render(<Tabs items={ITEMS} />);
    expect(screen.getByRole("tab", { name: "역사" })).toBeDisabled();
  });

  describe("ARIA wiring", () => {
    it("connects each tab to its panel via aria-controls and aria-labelledby", () => {
      render(<Tabs items={ITEMS} defaultValue="overview" />);
      const overviewTab = screen.getByRole("tab", { name: "개요" });
      const panel = screen.getByRole("tabpanel");

      const controls = overviewTab.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      expect(panel).toHaveAttribute("id", controls!);

      const labelledBy = panel.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      expect(overviewTab).toHaveAttribute("id", labelledBy!);
    });

    it("sets aria-orientation on the tablist", () => {
      render(<Tabs items={ITEMS} />);
      expect(screen.getByRole("tablist")).toHaveAttribute(
        "aria-orientation",
        "horizontal",
      );
    });

    it("gives the active panel tabIndex=0 so it is keyboard-scrollable", () => {
      render(<Tabs items={ITEMS} defaultValue="overview" />);
      expect(screen.getByRole("tabpanel")).toHaveAttribute("tabindex", "0");
    });
  });

  describe("Roving tabindex", () => {
    it("only the selected tab is in the tab order", () => {
      render(<Tabs items={ITEMS} defaultValue="rules" />);
      const overview = screen.getByRole("tab", { name: "개요" });
      const rules = screen.getByRole("tab", { name: "규칙" });
      const history = screen.getByRole("tab", { name: "역사" });

      expect(overview).toHaveAttribute("tabindex", "-1");
      expect(rules).toHaveAttribute("tabindex", "0");
      expect(history).toHaveAttribute("tabindex", "-1");
    });

    it("updates roving tabindex when selection changes", () => {
      render(<Tabs items={ITEMS} defaultValue="overview" />);
      fireEvent.click(screen.getByRole("tab", { name: "규칙" }));
      expect(screen.getByRole("tab", { name: "개요" })).toHaveAttribute(
        "tabindex",
        "-1",
      );
      expect(screen.getByRole("tab", { name: "규칙" })).toHaveAttribute(
        "tabindex",
        "0",
      );
    });
  });

  describe("Keyboard navigation (manual activation)", () => {
    it("ArrowRight moves focus to the next tab without changing selection", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Tabs items={ITEMS} defaultValue="overview" onChange={onChange} />,
      );
      const overview = screen.getByRole("tab", { name: "개요" });
      const rules = screen.getByRole("tab", { name: "규칙" });

      overview.focus();
      await user.keyboard("{ArrowRight}");

      expect(rules).toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
      // Selection unchanged.
      expect(overview).toHaveAttribute("aria-selected", "true");
      expect(rules).toHaveAttribute("aria-selected", "false");
    });

    it("ArrowLeft moves focus to the previous tab and wraps at the start", async () => {
      const user = userEvent.setup();
      // Use 2 enabled items so wrap is observable without disabled-skip noise.
      const items = [
        { value: "a", label: "A", content: "A content" },
        { value: "b", label: "B", content: "B content" },
      ];
      render(<Tabs items={items} defaultValue="a" />);
      const a = screen.getByRole("tab", { name: "A" });
      const b = screen.getByRole("tab", { name: "B" });

      a.focus();
      await user.keyboard("{ArrowLeft}");
      expect(b).toHaveFocus();
    });

    it("Home focuses the first enabled tab", async () => {
      const user = userEvent.setup();
      render(<Tabs items={ITEMS} defaultValue="rules" />);
      const rules = screen.getByRole("tab", { name: "규칙" });
      const overview = screen.getByRole("tab", { name: "개요" });

      rules.focus();
      await user.keyboard("{Home}");
      expect(overview).toHaveFocus();
    });

    it("End focuses the last enabled tab (skipping a disabled trailing tab)", async () => {
      const user = userEvent.setup();
      // ITEMS' last entry is disabled, so End should land on the middle one.
      render(<Tabs items={ITEMS} defaultValue="overview" />);
      const overview = screen.getByRole("tab", { name: "개요" });
      const rules = screen.getByRole("tab", { name: "규칙" });

      overview.focus();
      await user.keyboard("{End}");
      expect(rules).toHaveFocus();
    });

    it("ArrowRight skips disabled tabs and wraps to the first enabled tab", async () => {
      const user = userEvent.setup();
      // overview, rules (disabled), history → ArrowRight from overview
      // should land on history (skip rules).
      const items = [
        { value: "overview", label: "개요", content: "a" },
        { value: "rules", label: "규칙", content: "b", disabled: true },
        { value: "history", label: "역사", content: "c" },
      ];
      render(<Tabs items={items} defaultValue="overview" />);
      const overview = screen.getByRole("tab", { name: "개요" });
      const history = screen.getByRole("tab", { name: "역사" });

      overview.focus();
      await user.keyboard("{ArrowRight}");
      expect(history).toHaveFocus();

      // From history, ArrowRight wraps back to overview (rules is skipped).
      await user.keyboard("{ArrowRight}");
      expect(overview).toHaveFocus();
    });

    it("Enter on a focused tab activates it", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Tabs items={ITEMS} defaultValue="overview" onChange={onChange} />,
      );
      const overview = screen.getByRole("tab", { name: "개요" });
      const rules = screen.getByRole("tab", { name: "규칙" });

      overview.focus();
      await user.keyboard("{ArrowRight}");
      expect(rules).toHaveFocus();
      await user.keyboard("{Enter}");

      expect(onChange).toHaveBeenCalledWith("rules");
      expect(rules).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("규칙 내용");
    });

    it("Space on a focused tab activates it", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Tabs items={ITEMS} defaultValue="overview" onChange={onChange} />,
      );
      const overview = screen.getByRole("tab", { name: "개요" });
      const rules = screen.getByRole("tab", { name: "규칙" });

      overview.focus();
      await user.keyboard("{ArrowRight}");
      expect(rules).toHaveFocus();
      await user.keyboard("[Space]");

      expect(onChange).toHaveBeenCalledWith("rules");
      expect(rules).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("overflow / ellipsis contract (Wave 5b2-C3)", () => {
    // Each tab trigger caps at 10rem and uses `truncate`, so a runaway
    // label clips with an ellipsis rather than forcing the tablist
    // wider. The list itself remains horizontally scrollable.
    it("each tab trigger caps at max-w-[10rem] and truncates", () => {
      render(<Tabs items={ITEMS} defaultValue="overview" />);
      const overview = screen.getByRole("tab", { name: "개요" });
      expect(overview.className).toContain("max-w-[10rem]");
      expect(overview.className).toContain("truncate");
    });
  });

  describe("Active label contrast", () => {
    // Regression for axe color-contrast on the Neon era. accent-700 alone
    // clears only ~2.7:1 on the Neon void; the active tab now reads from
    // --era-accent-strong, which falls back to accent-300 in Neon and stays
    // accent-700 in Heritage.
    it("active tab paints from --era-accent-strong, not a hard-coded shade", () => {
      render(<Tabs items={ITEMS} defaultValue="overview" />);
      const overview = screen.getByRole("tab", { name: "개요" });
      expect(overview.className).toContain(
        "text-[rgb(var(--era-accent-strong))]",
      );
      expect(overview.className).not.toContain("text-accent-700");
    });
  });
});
