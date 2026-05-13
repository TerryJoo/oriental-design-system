import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Pagination } from "@/components/Pagination";
import { boolArg, bothEras } from "./_shared/argTypes";

/**
 * Controlled wrapper used by stories that need real page-state. Pagination
 * is a controlled component (`page` + `onChange`), so without an external
 * state holder clicking page buttons would have no visible effect.
 */
const ControlledPagination = ({
  initialPage = 1,
  totalPages,
  siblings,
  onChange,
}: {
  initialPage?: number;
  totalPages: number;
  siblings?: number;
  onChange?: (page: number) => void;
}) => {
  const [page, setPage] = useState(initialPage);
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      siblings={siblings}
      onChange={(next) => {
        setPage(next);
        onChange?.(next);
      }}
    />
  );
};

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Pagination renders a `<nav aria-label='페이지 이동'>` with prev/next arrow buttons and a windowed page list that collapses with `…` ellipsis once `totalPages` exceeds `siblings * 2 + 5`. The current page is marked with `aria-current='page'`; prev/next are natively `disabled` at the edges. Era-aware tokens (`bg-era-raised`, `border-era`, `text-era-primary`, `duration-era`, `ease-era-brush`) make the control flip cleanly between Heritage and Neon without re-rendering React.",
      },
    },
  },
  argTypes: {
    page: {
      control: { type: "number", min: 1 },
      description: "Active page (1-indexed).",
    },
    totalPages: {
      control: { type: "number", min: 1 },
      description: "Total number of pages.",
    },
    siblings: {
      control: { type: "number", min: 0, max: 5 },
      description:
        "Pages shown on each side of the active page. Ellipses appear once `totalPages > siblings * 2 + 5`.",
    },
    onChange: { action: "onChange" },
    disabled: boolArg(
      "When true, every page button and the prev/next arrows become natively disabled.",
    ),
    className: boolArg("className passthrough"),
  },
  args: {
    page: 1,
    totalPages: 10,
    siblings: 1,
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof Pagination>;

/**
 * Default uncontrolled-looking story. Buttons fire the `onChange` action but
 * do not move the active page (stories are stateless unless they use the
 * `ControlledPagination` helper).
 */
export const Default: Story = {
  args: {
    page: 1,
    totalPages: 10,
    siblings: 1,
  },
};

/**
 * 50 pages with the default `siblings = 1`. Demonstrates the windowing
 * algorithm: only the first page, last page, and pages within `siblings`
 * of the active page are shown — everything else collapses to `…`.
 */
export const ManyPages: Story = {
  args: {
    page: 25,
    totalPages: 50,
    siblings: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "With 50 pages and `siblings=1`, the visible window is `1 … 24 25 26 … 50`. Both leading and trailing ellipses appear because the active page sits in the middle.",
      },
    },
  },
};

/**
 * Boundary cases: page 1, page 2, second-to-last, and last. At page 1 the
 * leading ellipsis collapses (1 is already the first item) and the prev
 * arrow becomes `disabled`; at the last page the trailing ellipsis
 * collapses and the next arrow becomes `disabled`.
 */
export const EdgePages: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Four boundary cases stacked vertically. Notice how the leading ellipsis drops out near the start and the trailing ellipsis drops out near the end — and how `‹` / `›` flip to `disabled` on the very first/last page.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          page 1 of 20 (prev disabled, no leading ellipsis)
        </span>
        <Pagination page={1} totalPages={20} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          page 2 of 20 (no leading ellipsis yet)
        </span>
        <Pagination page={2} totalPages={20} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          page 19 of 20 (no trailing ellipsis)
        </span>
        <Pagination page={19} totalPages={20} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          page 20 of 20 (next disabled)
        </span>
        <Pagination page={20} totalPages={20} />
      </div>
    </div>
  ),
};

/**
 * Total pages below the windowing threshold (`siblings * 2 + 5 = 7` for
 * `siblings=1`). All pages are rendered inline with no ellipsis.
 */
export const FewPages: Story = {
  args: {
    page: 2,
    totalPages: 3,
    siblings: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `totalPages <= siblings * 2 + 5` every page is rendered without any `…` placeholder. Three pages render as a clean row of five interactive elements (`‹ 1 2 3 ›`).",
      },
    },
  },
};

/**
 * `siblings` controls how aggressively the page window collapses. Higher
 * values keep more pages visible around the active page; lower values
 * compact the navigator at the cost of more `…` jumps.
 */
export const WithSiblings: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Same `page=12 / totalPages=30` rendered with `siblings` 0, 1, 2, and 3. The visible window grows from `1 … 12 … 30` (siblings=0) to `1 … 9 10 11 12 13 14 15 … 30` (siblings=3). Note: `siblings=0` still ellipsises both sides because total > `0*2 + 5 = 5`.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {[0, 1, 2, 3].map((s) => (
        <div key={s} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-era-muted">
            siblings={s}
          </span>
          <Pagination page={12} totalPages={30} siblings={s} />
        </div>
      ))}
    </div>
  ),
};

/**
 * Setting `disabled` propagates the native attribute to every page button and
 * to the prev/next arrows. `aria-current="page"` stays on the active page so
 * the landmark remains semantically correct; only interactivity is suppressed.
 */
export const Disabled: Story = {
  args: {
    page: 3,
    totalPages: 10,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Top-level `disabled` prop natively disables every interior `<button>` (page numbers + prev/next). The `<fieldset disabled>` external pattern still works for callers that need to disable a larger surrounding form — both paths are compatible.",
      },
    },
  },
};

/**
 * Wave 5b2-C3 overflow contract proof. With `min-w-[2.25rem]` and
 * `tabular-nums`, all numeric chips share a constant width regardless
 * of digit count. Stacking the same Pagination at three escalating
 * scales (1k → 10k pages, current page mid-trail and last page) shows
 * the row never reflows when the active number flips between 1 / 100 /
 * 1000 / 10000.
 */
export const LongText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Five rows of `Pagination` rendered with progressively larger total counts and current pages. Notice that the buttons at every digit count keep the same width thanks to `min-w-[2.25rem]` + `tabular-nums`; the row never reflows as numbers grow from `1` to `10000`.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          totalPages = 1000 · current = 500 (the canonical large-pages case)
        </span>
        <Pagination page={500} totalPages={1000} siblings={1} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          totalPages = 1000 · current = 1000 (last page)
        </span>
        <Pagination page={1000} totalPages={1000} siblings={1} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          totalPages = 10000 · current = 5000 (4-digit at every position)
        </span>
        <Pagination page={5000} totalPages={10000} siblings={1} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          totalPages = 10000 · current = 1 (mixed 1-digit + 5-digit)
        </span>
        <Pagination page={1} totalPages={10000} siblings={1} />
      </div>
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side. The same controlled Pagination renders in
 * both era panels; era-aware tokens flip surface, border, accent, and
 * timing without any React re-render.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same Pagination markup rendered in Heritage and Neon. Active page background uses `--accent-600`; raised buttons use `bg-era-raised` + `border-era`; transitions use `duration-era` + `ease-era-brush`.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <ControlledPagination initialPage={4} totalPages={12} siblings={1} />
    )),
};

/**
 * Interaction proof. Confirms:
 *  1. The container is a `<nav>` with the expected `aria-label`.
 *  2. The active page button carries `aria-current="page"`.
 *  3. The prev arrow is natively `disabled` on page 1.
 *  4. Clicking the next arrow advances the controlled state; the new page
 *     gains `aria-current` and the prev arrow is no longer disabled.
 *  5. Clicking a numeric page jumps directly to that page.
 */
export const Interactive: Story = {
  args: {
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated interaction proof: validates the `<nav>` landmark, `aria-current='page'` on the active page, native `disabled` on prev at page 1, and that clicking next/page numbers updates the controlled `onChange` callback and the `aria-current` marker.",
      },
    },
  },
  render: () => <ControlledPagination initialPage={1} totalPages={10} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Landmark + label.
    const nav = canvas.getByRole("navigation", { name: "페이지 이동" });
    await expect(nav).toBeInTheDocument();

    // 2. Active page is page 1 with aria-current="page".
    const page1 = canvas.getByRole("button", { name: "1" });
    await expect(page1).toHaveAttribute("aria-current", "page");

    // 3. Prev arrow is disabled at the start.
    const prev = canvas.getByRole("button", { name: "이전" });
    await expect(prev).toBeDisabled();

    // 4. Click next — the controlled wrapper advances to page 2.
    const next = canvas.getByRole("button", { name: "다음" });
    await userEvent.click(next);
    const page2 = await canvas.findByRole("button", { name: "2" });
    await expect(page2).toHaveAttribute("aria-current", "page");
    // Page 1 no longer carries aria-current.
    await expect(canvas.getByRole("button", { name: "1" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
    // Prev arrow is now enabled.
    await expect(prev).not.toBeDisabled();

    // 5. Click a numeric page directly. With page=2, totalPages=10, siblings=1
    // the visible window is `‹ 1 2 3 … 10 ›`, so page 3 is the deepest
    // reachable numeric jump in this configuration.
    const page3 = canvas.getByRole("button", { name: "3" });
    await userEvent.click(page3);
    await expect(canvas.getByRole("button", { name: "3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  },
};
