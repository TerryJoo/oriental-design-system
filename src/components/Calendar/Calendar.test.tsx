import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  it("renders month title and 42 day cells", () => {
    render(<Calendar defaultMonth={new Date(2026, 3, 1)} />);
    expect(screen.getByText(/2026年 4月/)).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  });

  it("calls onChange when a day is clicked", () => {
    const onChange = vi.fn();
    render(
      <Calendar defaultMonth={new Date(2026, 3, 1)} onChange={onChange} />,
    );
    fireEvent.click(
      screen.getAllByRole("gridcell").find((el) => el.textContent === "15")!,
    );
    expect(onChange).toHaveBeenCalledWith("2026-04-15");
  });

  it("navigates between months", () => {
    render(<Calendar defaultMonth={new Date(2026, 3, 1)} />);
    fireEvent.click(screen.getByLabelText("다음 달"));
    expect(screen.getByText(/2026年 5月/)).toBeInTheDocument();
  });

  describe("WAI-ARIA grid structure", () => {
    it('exposes role="grid" with a default aria-label', () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} />);
      const grid = screen.getByRole("grid");
      expect(grid).toHaveAttribute("aria-label", "달력");
    });

    it("accepts a custom aria-label", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          aria-label="Event calendar"
        />,
      );
      expect(screen.getByRole("grid")).toHaveAttribute(
        "aria-label",
        "Event calendar",
      );
    });

    it('wraps cells in role="row" containers (1 weekday header + 6 weeks)', () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} />);
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(7);
    });

    it("exposes columnheader cells for weekday labels", () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} />);
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(7);
      expect(headers[0]).toHaveTextContent("日");
      expect(headers[6]).toHaveTextContent("土");
    });

    it('marks today with aria-current="date"', () => {
      const today = new Date();
      render(<Calendar defaultMonth={today} />);
      const cells = screen.getAllByRole("gridcell");
      const todayCells = cells.filter(
        (c) => c.getAttribute("aria-current") === "date",
      );
      expect(todayCells).toHaveLength(1);
      expect(todayCells[0]).toHaveTextContent(String(today.getDate()));
    });

    it("does not mark today when displayed month is different", () => {
      // Use a month far from today so today is not visible.
      render(<Calendar defaultMonth={new Date(2099, 0, 1)} />);
      const cells = screen.getAllByRole("gridcell");
      const todayCells = cells.filter(
        (c) => c.getAttribute("aria-current") === "date",
      );
      expect(todayCells).toHaveLength(0);
    });
  });

  describe("Roving tabindex", () => {
    it("makes exactly one cell tabbable", () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} />);
      const cells = screen.getAllByRole("gridcell");
      const tabbable = cells.filter((c) => c.tabIndex === 0);
      expect(tabbable).toHaveLength(1);
    });

    it("uses defaultValue (selected) as the tabbable cell when provided", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const cells = screen.getAllByRole("gridcell");
      const tabbable = cells.find((c) => c.tabIndex === 0)!;
      expect(tabbable).toHaveTextContent("15");
      expect(tabbable).toHaveAttribute("aria-selected", "true");
    });

    it("falls back to the first day of the month when neither selection nor today is in view", () => {
      render(<Calendar defaultMonth={new Date(2099, 0, 1)} />);
      const cells = screen.getAllByRole("gridcell");
      const tabbable = cells.find((c) => c.tabIndex === 0)!;
      expect(tabbable).toHaveTextContent("1");
      // It should be the non-muted "1" (current month), not the previous-month
      // padding "1" — the fallback is the first of *this* month. Muted cells
      // are styled with `text-era-muted` (no opacity modifier) after the Wave 5b2
      // contrast fix; non-muted current-month cells use `text-era-primary`.
      expect(tabbable.className).toMatch(/text-era-primary/);
      expect(tabbable.className).not.toMatch(/text-era-muted/);
    });
  });

  describe("Keyboard navigation", () => {
    // Returns the non-muted (current-month) cell whose label matches `day`.
    // Filtering on the non-muted class disambiguates against leading /
    // trailing padding cells that show the same number from a neighbour month.
    // Muted cells use `text-era-muted` after the Wave 5b2 contrast fix; current
    // month cells use `text-era-primary`.
    function getCellByText(day: number) {
      const cells = screen.getAllByRole("gridcell");
      return cells.find(
        (c) =>
          c.textContent?.trim() === String(day) &&
          !c.className.includes("text-era-muted"),
      )!;
    }

    it("ArrowRight moves focus by 1 day", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      const start = getCellByText(15);
      start.focus();
      fireEvent.keyDown(grid, { key: "ArrowRight" });
      const next = getCellByText(16);
      expect(next.tabIndex).toBe(0);
      expect(next).toHaveFocus();
    });

    it("ArrowLeft moves focus by 1 day", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowLeft" });
      const next = getCellByText(14);
      expect(next.tabIndex).toBe(0);
      expect(next).toHaveFocus();
    });

    it("ArrowDown moves focus by 7 days", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowDown" });
      const next = getCellByText(22);
      expect(next.tabIndex).toBe(0);
      expect(next).toHaveFocus();
    });

    it("ArrowUp moves focus by 7 days", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowUp" });
      const next = getCellByText(8);
      expect(next.tabIndex).toBe(0);
      expect(next).toHaveFocus();
    });

    it("Home jumps to the start (Sunday) of the current week", () => {
      // 2026-05-15 is a Friday → Home should land on 2026-05-10 (Sunday).
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "Home" });
      const next = getCellByText(10);
      expect(next.tabIndex).toBe(0);
      expect(next).toHaveFocus();
    });

    it("End jumps to the end (Saturday) of the current week", () => {
      // 2026-05-15 is a Friday → End should land on 2026-05-16 (Saturday).
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "End" });
      const next = getCellByText(16);
      expect(next.tabIndex).toBe(0);
      expect(next).toHaveFocus();
    });

    it("PageDown advances focus to the same day next month", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "PageDown" });
      // Header should now show June.
      expect(screen.getByText(/2026年 6月/)).toBeInTheDocument();
      const next = getCellByText(15);
      expect(next.tabIndex).toBe(0);
    });

    it("PageUp moves focus to the same day previous month", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "PageUp" });
      expect(screen.getByText(/2026年 4月/)).toBeInTheDocument();
      const next = getCellByText(15);
      expect(next.tabIndex).toBe(0);
    });

    it("Shift+PageDown advances focus to the same day next year", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "PageDown", shiftKey: true });
      expect(screen.getByText(/2027年 5月/)).toBeInTheDocument();
    });

    it("Shift+PageUp moves focus to the same day previous year", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "PageUp", shiftKey: true });
      expect(screen.getByText(/2025年 5月/)).toBeInTheDocument();
    });

    it("ArrowLeft from the 1st crosses the month boundary", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-01"
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowLeft" });
      // View should have flipped to April 2026.
      expect(screen.getByText(/2026年 4月/)).toBeInTheDocument();
    });

    it("Enter selects the focused date and fires onChange", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
          onChange={onChange}
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowRight" });
      fireEvent.keyDown(grid, { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith("2026-05-16");
    });

    it("Space selects the focused date and fires onChange", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
          onChange={onChange}
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: " " });
      expect(onChange).toHaveBeenCalledWith("2026-05-15");
    });

    it("ignores unrelated keys", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
          onChange={onChange}
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "a" });
      expect(onChange).not.toHaveBeenCalled();
      // tabbable cell should still be the original 15.
      const cells = screen.getAllByRole("gridcell");
      const tabbable = cells.find((c) => c.tabIndex === 0)!;
      expect(tabbable).toHaveTextContent("15");
    });
  });

  describe("disabledDate / minDate / maxDate", () => {
    // Picks the current-month (non-padding) cell whose text matches `day`.
    // Padding cells use `text-era-muted` *without* `line-through`; disabled
    // current-month cells use `text-era-muted` *with* `line-through`. So the
    // padding-vs-current-month disambiguator is "muted but not struck-through".
    function getCellByText(day: number) {
      const cells = screen.getAllByRole("gridcell");
      return cells.find((c) => {
        if (c.textContent?.trim() !== String(day)) return false;
        const isPaddingMuted =
          c.className.includes("text-era-muted") &&
          !c.className.includes("line-through");
        return !isPaddingMuted;
      })!;
    }

    it('disabledDate predicate marks cells with aria-disabled="true"', () => {
      // Disable the 15th of any month.
      const disabledDate = (iso: string) => iso.endsWith("-15");
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          disabledDate={disabledDate}
        />,
      );
      const cell15 = getCellByText(15);
      expect(cell15).toHaveAttribute("aria-disabled", "true");
      const cell14 = getCellByText(14);
      expect(cell14).not.toHaveAttribute("aria-disabled");
    });

    it("ignores click on a disabled date (no onChange fired)", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          disabledDate={(iso) => iso === "2026-05-15"}
          onChange={onChange}
        />,
      );
      fireEvent.click(getCellByText(15));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("minDate disables anything strictly before (boundary inclusive)", () => {
      render(
        <Calendar defaultMonth={new Date(2026, 4, 1)} minDate="2026-05-10" />,
      );
      // 2026-05-09 → disabled, 2026-05-10 (boundary) → enabled.
      expect(getCellByText(9)).toHaveAttribute("aria-disabled", "true");
      expect(getCellByText(10)).not.toHaveAttribute("aria-disabled");
    });

    it("maxDate disables anything strictly after (boundary inclusive)", () => {
      render(
        <Calendar defaultMonth={new Date(2026, 4, 1)} maxDate="2026-05-25" />,
      );
      expect(getCellByText(25)).not.toHaveAttribute("aria-disabled");
      expect(getCellByText(26)).toHaveAttribute("aria-disabled", "true");
    });

    it("ArrowRight skips a disabled cell to the next enabled one", () => {
      // Disable 16; ArrowRight from 15 should land on 17, not 16.
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
          disabledDate={(iso) => iso === "2026-05-16"}
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "ArrowRight" });
      expect(getCellByText(17)).toHaveFocus();
    });

    it("Enter on a disabled focused cell does not fire onChange", () => {
      const onChange = vi.fn();
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
          disabledDate={(iso) => iso === "2026-05-15"}
          onChange={onChange}
        />,
      );
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "Enter" });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("a value that lies on a disabled date is still rendered as selected", () => {
      // Even when the selected date matches `disabledDate`, the visual
      // selection is preserved (consumer's responsibility to sanitize value).
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          value="2026-05-15"
          disabledDate={(iso) => iso === "2026-05-15"}
        />,
      );
      const cell15 = getCellByText(15);
      expect(cell15).toHaveAttribute("aria-selected", "true");
      expect(cell15).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("weekStartsOn", () => {
    it("rotates the weekday header so column 0 matches weekStartsOn=1 (Mon)", () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} weekStartsOn={1} />);
      const headers = screen.getAllByRole("columnheader");
      // Default Sunday-first order is [日,月,火,水,木,金,土].
      // weekStartsOn=1 rotates → [月,火,水,木,金,土,日].
      expect(headers[0]).toHaveTextContent("月");
      expect(headers[6]).toHaveTextContent("日");
    });

    it("offsets the leading-padding count when weekStartsOn=1", () => {
      // May 2026 starts on Friday (dow=5). Sunday-first leading pad = 5;
      // Monday-first leading pad = (5 - 1 + 7) % 7 = 4.
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} weekStartsOn={1} />);
      const cells = screen.getAllByRole("gridcell");
      // First 4 cells should be muted (April padding), 5th cell is May 1.
      expect(cells[0].className).toMatch(/text-era-muted/);
      expect(cells[3].className).toMatch(/text-era-muted/);
      expect(cells[4]).toHaveTextContent("1");
      expect(cells[4].className).not.toMatch(/text-era-muted/);
    });
  });

  describe("locale", () => {
    it('formats the title via Intl.DateTimeFormat when locale="en-US"', () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} locale="en-US" />);
      // en-US "long" month for May 2026.
      expect(screen.getByText(/May 2026/)).toBeInTheDocument();
    });
  });

  describe("Color contrast (Wave 5b2 a11y)", () => {
    // May 2026 starts on Friday → leading 5-cell padding from April.
    it("muted padding cells use text-era-muted at full opacity (no opacity modifier)", () => {
      render(<Calendar defaultMonth={new Date(2026, 4, 1)} />);
      const cells = screen.getAllByRole("gridcell");
      // The first 5 cells are muted padding from April 2026.
      const padding = cells.slice(0, 5);
      for (const cell of padding) {
        expect(cell.className).toMatch(/text-era-muted/);
        // Old failing combination must no longer be present — opacity-40
        // dropped effective contrast to ~1.5:1 in Heritage.
        expect(cell.className).not.toMatch(/opacity-40/);
        expect(cell.className).not.toMatch(/opacity-60/);
      }
    });

    it("selected cell ships a Neon override flipping inverse → white text", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const cells = screen.getAllByRole("gridcell");
      const selected = cells.find(
        (c) => c.getAttribute("aria-selected") === "true",
      )!;
      // Heritage default: cream on terracotta (text-era-inverse) — ~6.2:1, AA pass.
      expect(selected.className).toMatch(/text-era-inverse/);
      // Neon override: pure white on accent-600 (cool purple) — ~5.15:1, AA pass.
      // Plain text-era-primary (`#e8ecff`) only reaches ~3.6:1 against this hue.
      expect(selected.className).toMatch(/\[\[data-era=neon\]_&\]:text-white/);
    });

    // Wave 5b2-Round4: Calendar's only residual axe violation was a
    // `color-contrast` flake on the selected cell, triggered when axe sampled
    // the post-Enter color transition mid-flight. The fix lives in the
    // Interactive story's play function (a `waitFor` poll on the selected
    // cell's computed background until it settles to the final
    // `rgb(var(--accent-600))` value). This regression guard pins the
    // class-level contract that the play function depends on: the selected
    // cell MUST end with `bg-[rgb(var(--accent-600))]` so the Sidebar-style
    // poll has a well-defined fixed point. Removing the accent-600 background
    // from the selected branch would invalidate the play-function timing fix
    // and the violation would return.
    it("selected cell's final background is bg-[rgb(var(--accent-600))] (anchors play-function waitFor)", () => {
      render(
        <Calendar
          defaultMonth={new Date(2026, 4, 1)}
          defaultValue="2026-05-15"
        />,
      );
      const selected = screen
        .getAllByRole("gridcell")
        .find((c) => c.getAttribute("aria-selected") === "true")!;
      expect(selected.className).toMatch(/bg-\[rgb\(var\(--accent-600\)\)\]/);
    });
  });
});
