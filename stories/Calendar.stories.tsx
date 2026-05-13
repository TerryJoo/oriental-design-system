import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useState } from "react";
import { Calendar } from "@/components/Calendar";
import { bothEras } from "./_shared/argTypes";

/**
 * Calendar exposes a single-month grid driven by ISO date strings (`yyyy-mm-dd`).
 * The component is self-contained — no `date-fns` / `dayjs` dependency — and
 * computes a fixed 42-cell grid (6 weeks) so layout never reflows when the
 * month boundary moves. Selection is controlled or uncontrolled via
 * `value` / `defaultValue`, the displayed month is seeded by `defaultMonth`,
 * and day-of-week labels can be swapped with `dayOfWeekLabels` (defaults
 * to the CJK kanji `日 月 火 水 木 金 土`).
 */
const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Calendar is a self-contained month-view date picker. It implements its own " +
          "month-grid algorithm (no `date-fns` / `dayjs`) and always renders 42 cells " +
          "so the surrounding layout never reflows when the month boundary moves. " +
          "Selection is exposed as ISO date strings (`yyyy-mm-dd`) — `onChange` " +
          "receives a string, not a `Date`. Day-of-week labels default to the CJK " +
          "kanji `日 月 火 水 木 金 土`; pass `dayOfWeekLabels` to localize. " +
          "\n\n" +
          "**WAI-ARIA date-grid pattern coverage:**\n\n" +
          '* `role="grid"` on the container — **PASS** (with `aria-label`, default `달력`, overridable via the `aria-label` prop)\n' +
          '* `role="row"` wrappers — **PASS** (1 weekday header row + 6 week rows)\n' +
          '* `role="columnheader"` on weekday labels — **PASS**\n' +
          '* `role="gridcell"` on day cells — **PASS**\n' +
          "* `aria-selected` on the selected cell — **PASS**\n" +
          '* `aria-current="date"` on today — **PASS**\n' +
          "* Roving tabindex (only one cell `tabIndex=0`) — **PASS**\n" +
          "* Arrow-key navigation (Left/Right/Up/Down) — **PASS** (cross month boundaries auto-navigate)\n" +
          "* `Home` / `End` (start / end of current week) — **PASS**\n" +
          "* `PageUp` / `PageDown` (previous / next month) — **PASS**\n" +
          "* `Shift+PageUp` / `Shift+PageDown` (previous / next year) — **PASS**\n" +
          "* `Enter` / `Space` to select the focused cell — **PASS**\n" +
          "* `aria-disabled` on disabled cells — **PASS** (`disabledDate` / `minDate` / `maxDate` mark cells non-interactive; keyboard nav skips them)",
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "text" },
      description:
        "Currently selected date (`yyyy-mm-dd`). Controlled when set; pair with `onChange`.",
    },
    defaultValue: {
      control: { type: "text" },
      description:
        "Initial selected date (`yyyy-mm-dd`) for the uncontrolled case.",
    },
    defaultMonth: {
      control: false,
      description:
        "Initial month to display, as a `Date`. Defaults to today. Only the " +
        "year + month fields are read.",
    },
    dayOfWeekLabels: {
      control: false,
      description:
        "Override the seven day-of-week column headers. Order is Sunday → Saturday; " +
        "the component rotates them to match `weekStartsOn`. " +
        "Defaults to CJK kanji (`日 月 火 水 木 金 土`).",
    },
    disabledDate: {
      control: false,
      description:
        "Predicate `(iso) => boolean` that marks a date as disabled. " +
        'Disabled cells get `aria-disabled="true"`, ignore clicks, and are ' +
        "skipped by keyboard navigation.",
    },
    minDate: {
      control: { type: "text" },
      description:
        "Inclusive lower bound (`yyyy-mm-dd`). Anything before is disabled.",
    },
    maxDate: {
      control: { type: "text" },
      description:
        "Inclusive upper bound (`yyyy-mm-dd`). Anything after is disabled.",
    },
    weekStartsOn: {
      control: { type: "select" },
      options: [0, 1, 2, 3, 4, 5, 6],
      description:
        "First column of the week. `0` = Sunday (default), `1` = Monday, etc.",
    },
    locale: {
      control: { type: "text" },
      description:
        "BCP-47 locale tag for the month-title and (default) weekday labels via " +
        "`Intl.DateTimeFormat`. When omitted, the title uses CJK characters " +
        "(`2026年 5月`).",
    },
    onChange: {
      control: false,
      description:
        "Fired on day click with the selected date as an ISO string (`yyyy-mm-dd`).",
    },
  },
  args: {
    defaultMonth: new Date(2026, 4, 1), // 2026-05 (month is 0-indexed)
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof Calendar>;

// Stable reference month used across deterministic stories so date assertions
// don't drift with the system clock. May 2026 starts on a Friday and ends on
// a Sunday, exercising both the leading- and trailing-week padding.
const MAY_2026 = new Date(2026, 4, 1);

export const Default: Story = {
  args: {
    defaultMonth: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Renders the current month with no preselected date. Today is highlighted via " +
          "the `today` style branch (accent-700 + bold) and the grid always has 42 cells.",
      },
    },
  },
};

export const WithSelectedDate: Story = {
  args: {
    defaultMonth: MAY_2026,
    defaultValue: "2026-05-15",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uncontrolled selection seeded via `defaultValue`. The selected day picks up the " +
          '`bg-[rgb(var(--accent-600))]` + `text-era-inverse` style and `aria-selected="true"`.',
      },
    },
  },
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Controlled mode — the parent owns `value` via `useState` and reflects every " +
          "change in an external display. `onChange` receives an ISO string (`yyyy-mm-dd`), " +
          "not a `Date`.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | undefined>("2026-05-15");
      return (
        <div className="flex flex-col gap-3 items-start">
          <Calendar defaultMonth={MAY_2026} value={value} onChange={setValue} />
          <div className="text-xs text-era-muted">
            Selected:{" "}
            <span className="text-era-primary font-bold">
              {value ?? "(none)"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setValue(undefined)}
            className="text-xs px-2 py-1 rounded-md border-era text-era-muted hover:text-era-primary"
          >
            Clear
          </button>
        </div>
      );
    };
    return <Demo />;
  },
};

export const WithDisabledDates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass a `disabledDate` predicate `(iso) => boolean` to mark specific " +
          'dates as non-interactive. Disabled cells get `aria-disabled="true"`, ' +
          "ignore clicks, and keyboard navigation walks past them in the natural " +
          "direction of the key. This story disables every Saturday and Sunday in " +
          "May 2026.",
      },
    },
  },
  args: {
    defaultMonth: MAY_2026,
    disabledDate: (iso: string) => {
      const [y, m, d] = iso.split("-").map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      return dow === 0 || dow === 6;
    },
  },
};

export const WithMinMax: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `minDate` / `maxDate` (`yyyy-mm-dd`, inclusive on both ends) to " +
          "clamp the selectable window. Cells outside `[minDate, maxDate]` get " +
          '`aria-disabled="true"` and are skipped by keyboard navigation. ' +
          "This story restricts selection to `2026-05-10 ~ 2026-05-25`.",
      },
    },
  },
  args: {
    defaultMonth: MAY_2026,
    defaultValue: "2026-05-15",
    minDate: "2026-05-10",
    maxDate: "2026-05-25",
  },
};

export const WeekStartsOnMonday: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`weekStartsOn={1}` rotates the column order so Monday is the first " +
          "column. Header labels and the leading-padding offset both follow the " +
          "rotation; `Home` / `End` jump to the start / end of the rotated week.",
      },
    },
  },
  args: {
    defaultMonth: MAY_2026,
    weekStartsOn: 1,
  },
};

export const EnglishLocale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass `locale="en-US"` (or any BCP-47 tag) to format the month title ' +
          "and (default) weekday labels via `Intl.DateTimeFormat`. The CJK title " +
          "(`2026年 5月`) is the no-locale default; here it becomes `May 2026` " +
          "and the column headers render `Sun Mon Tue …`.",
      },
    },
  },
  args: {
    defaultMonth: MAY_2026,
    locale: "en-US",
  },
};

export const MonthNavigation: Story = {
  args: {
    defaultMonth: MAY_2026,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The header chevrons (`‹` / `›`) decrement and increment the displayed month. " +
          'The buttons expose `aria-label="이전 달"` / `aria-label="다음 달"` for ' +
          "screen readers. December → January (and vice versa) rolls the year over " +
          "via the `setMonth` reducer — try clicking `‹` past January 2026 to confirm " +
          "the year decrements to 2025.",
      },
    },
  },
};

export const KoreanLocale: Story = {
  args: {
    defaultMonth: MAY_2026,
    dayOfWeekLabels: ["일", "월", "화", "수", "목", "금", "토"] as const,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Calendar has no `locale` prop — the default labels are CJK kanji " +
          "(`日 月 火 水 木 金 土`). Korean weekday headers are achieved by passing " +
          "`dayOfWeekLabels` (Sunday-first ordering). The month title (`2026年 5月`) " +
          "uses CJK characters and is not driven by `dayOfWeekLabels`; consumers that " +
          "need a fully-Korean header would need to fork the title rendering or " +
          "request a `formatTitle` prop.",
      },
    },
  },
};

export const EmptyMonth: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Edge cases for the leading / trailing padding logic. The grid is always " +
          "exactly 42 cells, so months that start on Sunday (no leading padding) and " +
          "months that end on Saturday (no trailing padding) push the most padding " +
          "onto the opposite edge. Three reference months are shown:" +
          "\n\n" +
          "* **2026-02** starts Sunday, ends Saturday — minimum padding both sides (5 weeks visually + leading/trailing rows of muted cells).\n" +
          "* **2026-03** starts Sunday, ends Tuesday — no leading padding, heavy trailing padding.\n" +
          "* **2026-08** starts Saturday — heaviest leading padding (6 muted cells before day 1).",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-widest text-era-muted">
          Starts Sun, ends Sat (Feb 2026)
        </div>
        <Calendar defaultMonth={new Date(2026, 1, 1)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-widest text-era-muted">
          Starts Sun, ends Tue (Mar 2026)
        </div>
        <Calendar defaultMonth={new Date(2026, 2, 1)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase tracking-widest text-era-muted">
          Starts Sat (Aug 2026)
        </div>
        <Calendar defaultMonth={new Date(2026, 7, 1)} />
      </div>
    </div>
  ),
};

/**
 * `Calendar` does not expose an events / appointments API, so its
 * "empty" state is the **natural** state: the month grid with no
 * external indicators painted on top of it. This story documents that
 * convention so future consumers know the empty UX is "render the
 * calendar as-is" — they should not introduce a separate `EmptyState`
 * placeholder inside the grid.
 *
 * If/when an events extension lands, the surrounding card / sidebar
 * (not the grid itself) is the right home for an `<EmptyState>` —
 * mirroring the DataTable pattern of placing the empty placeholder in
 * the body region, not in place of structural chrome.
 */
export const Empty: Story = {
  args: {
    defaultMonth: MAY_2026,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Calendar has no events / annotations API in this iteration, so the natural empty state is just the month grid with no external indicators. This story is a documentation anchor for that convention: do **not** swap the grid for an `<EmptyState>` — instead, render any zero-event placeholder in the surrounding chrome (e.g. a sibling card listing 'today's events') and leave the grid intact so users can still navigate dates with the keyboard.",
      },
    },
  },
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side. Surface (`bg-era-raised`), border " +
          "(`border-era`), display font (`font-era-display`), title casing " +
          "(`case-era`), muted/primary text, and the cell hover transition " +
          "(`duration-era-fast` + `ease-era-brush`) all swap with the era token " +
          "layer — no React re-render is required.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <Calendar defaultMonth={MAY_2026} defaultValue="2026-05-15" />
    )),
};

export const Interactive: Story = {
  args: {
    defaultMonth: MAY_2026,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Play function asserts the contract:\n\n" +
          '1. The grid renders exactly 42 `gridcell` buttons inside a `role="grid"` container.\n' +
          '2. Clicking day `15` fires `onChange` with the ISO string `2026-05-15` and the cell flips to `aria-selected="true"`.\n' +
          "3. Clicking the `이전 달` button decrements the displayed month to `2026年 4月`.\n" +
          "4. **Roving tabindex** — exactly one cell has `tabIndex=0`; tabbing into the grid lands on that cell, not on every cell sequentially.\n" +
          "5. **Arrow-key navigation** — `ArrowRight` moves the focused cell by 1 day, `ArrowDown` by 7 days, and `PageDown` advances to the next month.\n" +
          "6. **`Enter` activation** — pressing Enter on the focused cell fires `onChange` with the focused date.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. Always 42 day cells inside a grid container.
    const grid = canvas.getByRole("grid");
    expect(grid).toBeInTheDocument();
    const cells = canvas.getAllByRole("gridcell");
    expect(cells).toHaveLength(42);

    // 2. Clicking day 15 (current month, not muted) fires onChange with the
    //    ISO string and flips aria-selected on that cell.
    const day15 = cells.find(
      (el) =>
        el.textContent?.trim() === "15" &&
        !el.className.includes("text-era-muted"),
    );
    expect(day15).toBeTruthy();
    await userEvent.click(day15!);
    expect(args.onChange).toHaveBeenCalledWith("2026-05-15");
    expect(day15!).toHaveAttribute("aria-selected", "true");

    // 3. Header reflects the seeded month, then decrements on prev-month click.
    expect(canvas.getByText(/2026年 5月/)).toBeInTheDocument();
    const prev = canvas.getByLabelText("이전 달");
    await userEvent.click(prev);
    expect(canvas.getByText(/2026年 4月/)).toBeInTheDocument();

    // Move back to May for the keyboard-nav assertions.
    await userEvent.click(canvas.getByLabelText("다음 달"));
    expect(canvas.getByText(/2026年 5月/)).toBeInTheDocument();

    // 4. Roving tabindex — only one gridcell is tabbable at a time. The
    //    selected cell (day 15, set above) is the tabbable one.
    const tabbableCells = canvas
      .getAllByRole("gridcell")
      .filter((c) => (c as HTMLElement).tabIndex === 0);
    expect(tabbableCells).toHaveLength(1);
    expect(tabbableCells[0]).toHaveTextContent("15");

    // Tab from the prev-month chevron lands on the next-month chevron, then
    // into the grid — and lands on the single tabbable day cell.
    prev.focus();
    expect(prev).toHaveFocus();
    await userEvent.tab(); // → next-month chevron
    expect(canvas.getByLabelText("다음 달")).toHaveFocus();
    await userEvent.tab(); // → roving-tabbable gridcell (day 15)
    const focusedAfterGridEntry = document.activeElement as HTMLElement;
    expect(focusedAfterGridEntry.getAttribute("role")).toBe("gridcell");
    expect(focusedAfterGridEntry).toHaveTextContent("15");

    // 5. Arrow-key navigation: ArrowRight moves focus by 1 day, ArrowDown by
    //    7 days. Use keyboard typing on the document since focus is already
    //    inside the grid.
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveTextContent("16");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toHaveTextContent("23");

    // PageDown advances the month — June 2026.
    await userEvent.keyboard("{PageDown}");
    expect(canvas.getByText(/2026年 6月/)).toBeInTheDocument();

    // 6. Enter activates the focused cell — selection should fire onChange
    //    with the focused date (2026-06-23).
    await userEvent.keyboard("{Enter}");
    expect(args.onChange).toHaveBeenLastCalledWith("2026-06-23");

    // Wait for the selected cell's CSS color transition
    // (`duration-era-fast` = `--era-dur-fast` = 220ms in Heritage) to settle
    // BEFORE the test-runner's postVisit hook samples colors with axe-core.
    // Without this, axe captures intermediate transition pixels — the
    // unselected→selected swap moves bg from `bg-era-raised` (`#fbf5e8`) to
    // `rgb(var(--accent-600))` (`rgb(138, 80, 48)`) and color from
    // `text-era-primary` (`#2b1d10`) to `text-era-inverse` (`#fbf5e8`).
    // Mid-flight pixels fail contrast even though both endpoints pass AA
    // (cream on terracotta ≈ 6.23:1, cream on hanji ≈ 12.5:1).
    // Mirrors the Sidebar pattern (Wave 5b2-Top5 / Round3).
    const selectedAfterEnter = canvas
      .getAllByRole("gridcell")
      .find((c) => c.getAttribute("aria-selected") === "true")!;
    await waitFor(
      () => {
        const cs = window.getComputedStyle(selectedAfterEnter);
        // Heritage final state: accent-600 = rgb(138, 80, 48). The toolbar
        // doesn't set `[data-era]` for this story, so :root defaults apply.
        expect(cs.backgroundColor).toBe("rgb(138, 80, 48)");
      },
      { timeout: 1000 },
    );
  },
};
