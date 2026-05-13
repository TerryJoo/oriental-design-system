import type { Meta, StoryObj } from "@storybook/react";
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from "@storybook/test";
import { useState, type ReactNode } from "react";
import { DragDrop, type DragDropItemData } from "@/components/DragDrop";
import { Button } from "@/components/Button";
import { Stack } from "@/components/Stack";
import { Tag } from "@/components/Tag";
import { bothEras } from "./_shared/argTypes";

/**
 * Three short reorderable items reused across the simpler stories. Each
 * story makes its own copy when it wants to mutate (custom labels, longer
 * lists, rich content) so Storybook re-renders never bleed across stories.
 */
const BASE_ITEMS: ReadonlyArray<DragDropItemData> = [
  { id: "stone", content: "1. 돌 종류 선택" },
  { id: "place", content: "2. 위치 지정" },
  { id: "end", content: "3. 턴 종료" },
];

/**
 * Inline 16-px outline icon used by the WithRichContent story. Stroke
 * uses `currentColor` so the icon picks up `text-era-primary` /
 * `text-era-muted` automatically across both eras.
 */
const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-1.5 inline-block h-4 w-4 align-[-2px]"
  >
    {children}
  </svg>
);

const StoneIcon = (
  <Icon>
    <circle cx="12" cy="12" r="8" />
  </Icon>
);

const PlaceIcon = (
  <Icon>
    <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2" />
  </Icon>
);

const EndIcon = (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);

const meta = {
  title: "Components/DragDrop",
  component: DragDrop,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "DragDrop is a **list-reorder primitive** built on the native HTML5 " +
          "drag-and-drop API. It accepts an `items` array of `{ id, content }` " +
          'records, renders each as a `role="listitem"` row with a visual handle, ' +
          "and fires `onChange(orderedIds)` after every successful reorder.\n\n" +
          "The component is **not a file dropzone** — it does not accept " +
          "`accept`, `maxSize`, `multiple`, error, loading, or disabled props. " +
          "Pair it with a separate file-input component if you need uploads.\n\n" +
          "**Accessibility — keyboard reorder alternative.** Each row is " +
          "focusable (`tabIndex=0`). The implemented WAI-ARIA APG pattern is:\n\n" +
          "- **Tab / Shift+Tab** — move focus through rows.\n" +
          "- **Space or Enter** on a focused row — grab it. The row gets " +
          '`data-grabbed="true"` and a visible accent ring so sighted ' +
          "keyboard users can see what is being moved. AT users hear the " +
          "pickup through the polite live region (we do not put `aria-pressed` " +
          'on `role="listitem"` — axe `aria-allowed-attr` rejects it).\n' +
          "- **ArrowUp / ArrowDown** while grabbed — move the row by one " +
          "position. `onChange` fires per move (live preview), matching the " +
          "pointer path which also reorders during `dragover`.\n" +
          "- **Space or Enter** again — drop the row at its current position.\n" +
          "- **Escape** while grabbed — cancel and restore the pre-grab " +
          "order. `onChange` fires once with the original sequence.\n" +
          "- **Tab away** while grabbed — drops in place (matches pointer " +
          "drop semantics; intermediate moves are committed).\n\n" +
          '**Live region.** A visually-hidden `role="status"` element with ' +
          '`aria-live="polite"` and `aria-atomic="true"` announces every ' +
          'grab / move / drop / cancel transition. Pass `liveRegion="off"` ' +
          'to suppress announcements, or `"assertive"` if a use case ' +
          "requires interruption (rare). When `content` is rich JSX rather " +
          "than a string, supply `ariaLabel` on the item so the announcement " +
          "reads a real label rather than the id.\n\n" +
          "**Pointer support is unchanged** — native HTML5 `draggable`, " +
          "`onDragStart`, and `onDragOver` continue to work for mouse and " +
          "touch users; the keyboard pattern is purely additive.",
      },
    },
  },
  args: {
    items: BASE_ITEMS,
  },
} satisfies Meta<typeof DragDrop>;

export default meta;
type Story = StoryObj<typeof DragDrop>;

/**
 * Default uncontrolled list. Three items with text-only `content`,
 * default era surfaces, no external state — drag a row over another row
 * to reorder.
 */
export const Default: Story = {
  args: {
    items: BASE_ITEMS,
  },
};

/**
 * Each item's `content` is arbitrary `ReactNode`, so an icon + label
 * combination is just JSX. Icons inherit the row's `text-era-primary`
 * via `currentColor` and re-tint when the era flips.
 */
export const WithRichContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`content` accepts any `ReactNode`. This story uses an icon + label " +
          "pair per row; the icon picks up the current era's text color " +
          "automatically because its stroke is `currentColor`.",
      },
    },
  },
  args: {
    items: [
      {
        id: "stone",
        content: <span>{StoneIcon}돌 종류 선택</span>,
      },
      {
        id: "place",
        content: <span>{PlaceIcon}위치 지정</span>,
      },
      {
        id: "end",
        content: <span>{EndIcon}턴 종료</span>,
      },
    ] as ReadonlyArray<DragDropItemData>,
  },
};

/**
 * `content` is unconstrained — it can mix tags, secondary text, and
 * other primitives. Drag still works because the wrapping row carries
 * `draggable`, regardless of what lives inside.
 */
export const WithMixedContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`content` can hold composite layouts (tag + label + meta). The " +
          "outer row remains the drag target, so nested children do not " +
          "break the reorder gesture.",
      },
    },
  },
  args: {
    items: [
      {
        id: "draft",
        content: (
          <Stack direction="row" align="center" gap="2">
            <Tag size="sm">draft</Tag>
            <span>초안 — 검토 대기</span>
          </Stack>
        ),
      },
      {
        id: "review",
        content: (
          <Stack direction="row" align="center" gap="2">
            <Tag size="sm">review</Tag>
            <span>리뷰 — 의견 수렴</span>
          </Stack>
        ),
      },
      {
        id: "ready",
        content: (
          <Stack direction="row" align="center" gap="2">
            <Tag size="sm">ready</Tag>
            <span>완료 — 게시 가능</span>
          </Stack>
        ),
      },
    ] as ReadonlyArray<DragDropItemData>,
  },
};

/**
 * Twelve items render in a single list. The component does not paginate
 * or virtualize — every row stays in the DOM and is independently
 * draggable. Useful for verifying that long lists still reorder
 * smoothly.
 */
export const ManyItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Twelve items in one list. There is no virtualization; every row " +
          "remains in the DOM and is draggable. Use this story to sanity " +
          "check reorder performance on long lists.",
      },
    },
  },
  render: () => {
    const items: ReadonlyArray<DragDropItemData> = Array.from({
      length: 12,
    }).map((_, i) => ({
      id: `item-${i + 1}`,
      content: `항목 ${i + 1}`,
    }));
    return (
      <div style={{ width: 320 }}>
        <DragDrop items={items} />
      </div>
    );
  },
};

/**
 * External state observes every reorder. The component itself owns the
 * order internally; `onChange` is a one-way notification, so the panel
 * below only mirrors the latest order without trying to control it.
 */
export const WithOnChange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`onChange` fires after every successful reorder with the new id " +
          "order. The component is *not* controllable — passing `items` in " +
          "a new order does not reset the internal state. Treat `onChange` " +
          "as a one-way notification and persist the order externally if " +
          "needed.",
      },
    },
  },
  render: () => {
    const ObserverDemo = () => {
      const [order, setOrder] = useState<string[]>(
        BASE_ITEMS.map((it) => it.id),
      );
      return (
        <Stack direction="column" gap="3" style={{ width: 360 }}>
          <DragDrop items={BASE_ITEMS} onChange={setOrder} />
          <div className="rounded-md border border-era-soft bg-era-base px-3 py-2 text-xs text-era-muted">
            현재 순서: {order.join(" → ")}
          </div>
        </Stack>
      );
    };
    return <ObserverDemo />;
  },
};

/**
 * Reset-to-initial demo. The DragDrop component is uncontrolled, so a
 * fresh `key` is the simplest way to discard internal order state and
 * re-mount with the original `items` order.
 */
export const ResetViaKey: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Because internal order state is keyed on first mount, changing " +
          "the React `key` re-mounts the component with the original order. " +
          "This is the documented escape hatch for resetting an " +
          "uncontrolled DragDrop without touching its internals.",
      },
    },
  },
  render: () => {
    const ResetDemo = () => {
      const [seq, setSeq] = useState(0);
      return (
        <Stack direction="column" gap="3" style={{ width: 360 }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSeq((n) => n + 1)}
          >
            순서 초기화
          </Button>
          <DragDrop key={seq} items={BASE_ITEMS} />
        </Stack>
      );
    };
    return <ResetDemo />;
  },
};

/**
 * Heritage / Neon side-by-side. Same `DragDrop` markup; era-aware tokens
 * (`bg-era-raised`, `border-era`, `text-era-primary`, `text-era-muted`,
 * `duration-era-fast`, `ease-era-brush`) account for every visual delta.
 * Switching eras does not re-render React.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `DragDrop` markup rendered in Heritage and Neon. Surface, " +
          "border, text, and motion tokens flip via the era CSS layer alone.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div style={{ width: 320 }}>
        <DragDrop items={BASE_ITEMS} />
      </div>
    )),
};

/**
 * Interaction proof. Two reorder paths are exercised:
 *
 *   A. **Pointer / native HTML5** — `dragstart` on the source row and
 *      `dragover` on the target row, exactly the events the component
 *      subscribes to. Asserts new DOM order and `onChange` payload.
 *
 *   B. **Keyboard / WAI-ARIA APG** — Tab to a row, Space to grab,
 *      ArrowDown to move, Space to drop. Asserts `data-grabbed`
 *      transitions, `onChange` per arrow-key move, the final order, and
 *      that the live region speaks the grab/drop announcements.
 */
export const Interactive: Story = {
  args: {
    items: BASE_ITEMS,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Two-path reorder proof. **Pointer:** fires `dragstart` + " +
          "`dragover` on a source/target pair to drive the native HTML5 " +
          "path. **Keyboard:** Tab → Space (grab) → ArrowDown × 2 → Space " +
          "(drop) drives the WAI-ARIA APG path. Both paths assert the " +
          "post-reorder DOM order and `onChange` payload; the keyboard " +
          "path additionally asserts `data-grabbed` transitions and that " +
          'the visually-hidden `role="status"` live region announces ' +
          "pickup, move, and drop.",
      },
    },
  },
  render: (args) => {
    const InteractiveDemo = (props: typeof args) => {
      const [lastOrder, setLastOrder] = useState<string[] | null>(null);
      return (
        <Stack direction="column" gap="3" style={{ width: 360 }}>
          <DragDrop {...props} onChange={setLastOrder} />
          <div
            data-testid="order-readout"
            className="rounded-md border border-era-soft bg-era-base px-3 py-2 text-xs text-era-muted"
          >
            {lastOrder ? lastOrder.join(",") : "initial"}
          </div>
        </Stack>
      );
    };
    return <InteractiveDemo {...args} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // ─── 1. Initial DOM order matches the `items` prop. ────────────────
    const items = canvas.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("돌 종류 선택");
    expect(items[1]).toHaveTextContent("위치 지정");
    expect(items[2]).toHaveTextContent("턴 종료");

    // Each row is draggable per the native HTML5 contract and focusable
    // per the WAI-ARIA APG keyboard alternative.
    expect(items[0]).toHaveAttribute("draggable", "true");
    expect(items[0]).toHaveAttribute("tabIndex", "0");
    expect(items[2]).toHaveAttribute("draggable", "true");

    // ─── 2. Pointer path: drag row 3 onto row 1. ───────────────────────
    //
    // The component reorders during `dragover` (preventDefault +
    // moveBefore), not on `drop`, so we fire the exact pair the
    // component listens for.
    const source = items[2];
    const target = items[0];

    const dataTransfer = new DataTransfer();
    // `fireEvent` from `@storybook/test` returns a Promise — without awaiting
    // each step, React's batched state update from `dragstart` would not have
    // committed before `dragover` reads the source id, and the row-reorder
    // never lands. The component's internal ref-mirror bridges the same-tick
    // gap, but we still await so the assertions read the post-commit DOM.
    await fireEvent.dragStart(source, { dataTransfer });
    await fireEvent.dragOver(target, { dataTransfer });
    await fireEvent.dragEnd(source, { dataTransfer });

    // Wait for the React commit + paint that follows the `setOrder` state
    // update inside `dragover`. `waitFor` polls until the assertion
    // passes (or times out), which is more robust than reading the DOM
    // synchronously immediately after the awaited `fireEvent` resolves —
    // Chromium does not flush React's batched render in the same tick the
    // promise resolves.
    await waitFor(() => {
      const rows = canvas.getAllByRole("listitem");
      expect(rows[0]).toHaveTextContent("턴 종료");
    });
    let reordered = canvas.getAllByRole("listitem");
    expect(reordered[0]).toHaveTextContent("턴 종료");
    expect(reordered[1]).toHaveTextContent("돌 종류 선택");
    expect(reordered[2]).toHaveTextContent("위치 지정");

    const readout = canvas.getByTestId("order-readout");
    expect(readout).toHaveTextContent("end,stone,place");

    // ─── 3. Keyboard path: Tab → Space → ArrowDown × 2 → Space. ────────
    //
    // After step 2 the order is [end, stone, place]. We focus the first
    // row (id "end"), grab it, move it down twice, and drop. Final
    // expected order: [stone, place, end].
    reordered[0].focus();
    expect(reordered[0]).toHaveFocus();

    await userEvent.keyboard(" ");
    // Re-query so we read the post-state attributes from the same node.
    // `data-grabbed` is the visual + test hook for grab state. We removed
    // `aria-pressed` because it is invalid on `role="listitem"`; the live
    // region (asserted just below) is the AT channel.
    let grabbed = canvas
      .getAllByRole("listitem")
      .find((row) => row.getAttribute("data-grabbed") === "true");
    expect(grabbed).toBeDefined();
    expect(grabbed).not.toHaveAttribute("aria-pressed");

    // Live region announces pickup.
    const live = canvas.getByRole("status");
    expect(live).toHaveTextContent(/Picked up .*턴 종료.*position 1 of 3/);

    await userEvent.keyboard("{ArrowDown}");
    expect(readout).toHaveTextContent("stone,end,place");
    expect(live).toHaveTextContent(/moved to position 2 of 3/);

    await userEvent.keyboard("{ArrowDown}");
    expect(readout).toHaveTextContent("stone,place,end");

    await userEvent.keyboard(" ");
    grabbed = canvas
      .getAllByRole("listitem")
      .find((row) => row.getAttribute("data-grabbed") === "true");
    expect(grabbed).toBeUndefined();
    expect(live).toHaveTextContent(/Dropped .*턴 종료.* at position 3 of 3/);

    // Final DOM order reflects both reorder paths.
    reordered = canvas.getAllByRole("listitem");
    expect(reordered[0]).toHaveTextContent("돌 종류 선택");
    expect(reordered[1]).toHaveTextContent("위치 지정");
    expect(reordered[2]).toHaveTextContent("턴 종료");
  },
};
