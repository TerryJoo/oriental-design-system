import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { KanbanBoard, type KanbanColumnData } from "@/components/KanbanBoard";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Stack } from "@/components/Stack";
import { Tag } from "@/components/Tag";
import { bothEras } from "./_shared/argTypes";

/**
 * Three baseline columns reused across the simpler stories. Cards carry
 * plain-text `content`; richer stories below build their own column sets so
 * Storybook re-renders never bleed across stories.
 */
const BASE_COLUMNS: ReadonlyArray<KanbanColumnData> = [
  {
    id: "todo",
    title: "대기",
    cards: [
      { id: "t1", content: "토큰 정의" },
      { id: "t2", content: "PatternBackground" },
      { id: "t3", content: "EraSwitch 검증" },
    ],
  },
  {
    id: "doing",
    title: "진행",
    cards: [
      { id: "d1", content: "KanbanBoard 스토리" },
      { id: "d2", content: "DataTable 정렬" },
    ],
  },
  {
    id: "done",
    title: "완료",
    cards: [
      { id: "f1", content: "Button 변형" },
      { id: "f2", content: "Stack 정렬" },
      { id: "f3", content: "Tag 사이즈" },
    ],
  },
];

const meta = {
  title: "Components/KanbanBoard",
  component: KanbanBoard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "KanbanBoard renders a CSS-grid of columns, each containing a vertical " +
          "stack of draggable cards. It accepts a `columns` array of " +
          "`{ id, title, cards: { id, content }[] }` records and an " +
          "`onMove(cardId, fromColId, toColId)` callback that fires when a card " +
          "is dropped on a different column.\n\n" +
          "**Dual-modality drag-and-drop.** Pointer users see the native " +
          'HTML5 DnD contract — cards carry `draggable="true"`, columns ' +
          "listen for `dragover`/`drop`, and the card id is shipped through " +
          "`DataTransfer`. Keyboard users get a parallel grab-and-move " +
          "pattern modeled on the WAI-ARIA APG drag-and-drop guidance:\n\n" +
          "- **Tab** focuses each card (`tabIndex={0}`).\n" +
          "- **Space** or **Enter** toggles a *grabbed* state on the focused " +
          "card; the card surfaces a high-contrast ring while grabbed.\n" +
          "- **ArrowUp / ArrowDown** reorder the grabbed card within its " +
          "current column.\n" +
          "- **ArrowLeft / ArrowRight** move the grabbed card to the " +
          "adjacent column, inserting at the same index (clamped to the " +
          "destination's length).\n" +
          "- **Space / Enter** again drops the card; `onMove` fires only " +
          "when the destination column differs from the origin.\n" +
          "- **Escape** cancels the gesture and restores the original " +
          "ordering — `onMove` is **not** fired for cancellations.\n\n" +
          'Each column wraps its cards in a `<ul role="list" ' +
          "aria-labelledby=…>` (label points at the column header) and " +
          'every card is a `<li role="listitem">`, so the board exposes ' +
          "list semantics to assistive tech without changing the visual " +
          'layout. A visually-hidden `aria-live="polite"` region ' +
          '(`role="status"`) announces grab / move / drop / cancel events ' +
          'in plain text. Pass `liveRegion="off"` to suppress ' +
          "announcements (e.g. when a parent already speaks for the board), " +
          'or `"assertive"` if interruption is required.',
      },
    },
  },
  args: {
    columns: BASE_COLUMNS,
  },
  argTypes: {
    // Most KanbanBoard props are data (`columns`) or callbacks (`onMove`),
    // neither of which benefit from an interactive control. We expose the
    // function explicitly so Storybook’s Actions panel logs invocations and
    // we hide `columns` from the controls panel where editing nested JSON
    // would be clumsier than switching stories.
    columns: { control: false },
    onMove: { action: "onMove" },
  },
} satisfies Meta<typeof KanbanBoard>;

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

/**
 * Three columns — Todo / In Progress / Done — with two to three plain-text
 * cards each. Drag a card onto another column to fire `onMove`.
 */
export const Default: Story = {};

/**
 * Board-level empty state — `columns: []`. The component renders the
 * default `<EmptyState>` (Korean copy "보드가 비어 있습니다") because
 * there are zero columns to receive cards. Pass any `ReactNode` to
 * `emptyState` to customise the placeholder, or `null` to render an
 * empty grid wrapper.
 *
 * Note: a board with **columns but no cards** is **not** considered
 * empty — those columns still expose `min-h-[160px]` drop targets, so
 * the per-column empty story (`EmptyColumns`) remains the canonical
 * reference for that state.
 */
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders the new `emptyState` slot when `columns.length === 0`. Default copy is Korean (`보드가 비어 있습니다`); supply any `ReactNode` via `emptyState` to override. Boards with columns-but-no-cards do NOT trigger this slot — those columns still ship a min-height body and remain valid drop targets (see `EmptyColumns`).",
      },
    },
  },
  args: {
    columns: [],
  },
};

/**
 * Two of three columns are empty. Demonstrates the column drop affordance
 * (the column body retains its `min-h-[160px]` even with zero cards) so a
 * user can drop the first card onto an empty backlog.
 */
export const EmptyColumns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When a column has no cards it still renders its surface and the " +
          "`min-h-[160px]` body, so it remains a visible drop target. The " +
          "header text continues to mark the column even when empty.",
      },
    },
  },
  args: {
    columns: [
      {
        id: "backlog",
        title: "백로그",
        cards: [{ id: "only", content: "유일한 카드" }],
      },
      { id: "doing", title: "진행", cards: [] },
      { id: "done", title: "완료", cards: [] },
    ],
  },
};

/**
 * Card `content` accepts any `ReactNode`, so a card can compose other
 * primitives. This story uses Tag + Avatar + Button per card to mirror a
 * real ticket layout and to verify nested interactive children do not
 * intercept the outer card's `dragstart`.
 */
export const WithRichCards: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each card composes `Tag`, `Avatar`, and `Button` inside its " +
          "`content`. The outer card `<li>` is the drag source, so nested " +
          "children render normally without breaking the drag gesture. " +
          "Nested `<button>` elements remain keyboard-focusable; pressing " +
          "**Tab** while focus is inside a card moves to the next focusable " +
          "child (e.g. the “상세” button). The card-level keyboard reorder " +
          "shortcut (Space/Arrow) only fires when the `<li>` itself is " +
          "focused, so the two focus contexts coexist without conflict.",
      },
    },
  },
  args: {
    columns: [
      {
        id: "todo",
        title: "대기",
        cards: [
          {
            id: "rich-1",
            content: (
              <Stack direction="column" gap="2">
                <Stack direction="row" align="center" gap="2">
                  <Tag size="sm">design</Tag>
                  <span className="text-era-primary">아이콘 토큰 정리</span>
                </Stack>
                <Stack direction="row" align="center" gap="2">
                  <Avatar size="sm" alt="박지윤">
                    박
                  </Avatar>
                  <Button size="sm" variant="ghost">
                    상세
                  </Button>
                </Stack>
              </Stack>
            ),
          },
          {
            id: "rich-2",
            content: (
              <Stack direction="column" gap="2">
                <Stack direction="row" align="center" gap="2">
                  <Tag size="sm">spec</Tag>
                  <span className="text-era-primary">ERA 토큰 명세</span>
                </Stack>
                <Stack direction="row" align="center" gap="2">
                  <Avatar size="sm" alt="이도윤">
                    이
                  </Avatar>
                  <Button size="sm" variant="ghost">
                    상세
                  </Button>
                </Stack>
              </Stack>
            ),
          },
        ],
      },
      {
        id: "doing",
        title: "진행",
        cards: [
          {
            id: "rich-3",
            content: (
              <Stack direction="column" gap="2">
                <Stack direction="row" align="center" gap="2">
                  <Tag size="sm">build</Tag>
                  <span className="text-era-primary">tsup 듀얼 엔트리</span>
                </Stack>
                <Stack direction="row" align="center" gap="2">
                  <Avatar size="sm" alt="김민서">
                    김
                  </Avatar>
                  <Button size="sm" variant="ghost">
                    상세
                  </Button>
                </Stack>
              </Stack>
            ),
          },
        ],
      },
      {
        id: "done",
        title: "완료",
        cards: [
          {
            id: "rich-4",
            content: (
              <Stack direction="column" gap="2">
                <Stack direction="row" align="center" gap="2">
                  <Tag size="sm">qa</Tag>
                  <span className="text-era-primary">스토리북 점검</span>
                </Stack>
                <Stack direction="row" align="center" gap="2">
                  <Avatar size="sm" alt="정하늘">
                    정
                  </Avatar>
                  <Button size="sm" variant="ghost">
                    상세
                  </Button>
                </Stack>
              </Stack>
            ),
          },
        ],
      },
    ],
  },
};

/**
 * One column with eighteen cards. Verifies that a long column overflows
 * within a height-constrained viewport rather than breaking the grid. The
 * board itself does not virtualize — every card stays in the DOM.
 */
export const ManyCards: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The first column carries 18 cards. The component does not " +
          "virtualize, so every card renders. Wrapping the board in a " +
          "fixed-height scroll container (as below) is the recommended " +
          "pattern when a column may grow tall.",
      },
    },
  },
  render: () => {
    const longColumn: KanbanColumnData = {
      id: "todo",
      title: "대기 (18)",
      cards: Array.from({ length: 18 }).map((_, i) => ({
        id: `bulk-${i + 1}`,
        content: `항목 ${i + 1}`,
      })),
    };
    const columns: ReadonlyArray<KanbanColumnData> = [
      longColumn,
      { id: "doing", title: "진행", cards: [{ id: "d1", content: "리뷰" }] },
      { id: "done", title: "완료", cards: [{ id: "f1", content: "릴리즈" }] },
    ];
    return (
      <div style={{ maxHeight: 360, overflow: "auto" }}>
        <KanbanBoard columns={columns} />
      </div>
    );
  },
};

/**
 * Wires `onMove` to a logger panel so every drop across columns appears as
 * a structured event. The play function is **static** — it does not
 * synthesize drag events — so the log only populates during real
 * pointer-driven interaction in Storybook.
 */
export const WithMoveCallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`onMove(cardId, fromColId, toColId)` fires when a card is " +
          "dropped on a different column (same-column drops are ignored " +
          "by the implementation, and Escape cancels do not fire " +
          "`onMove`). The panel below appends each event for both " +
          "pointer drops and keyboard drops (Space-Arrow-Space). Static " +
          "rendering will simply show “no moves yet”.",
      },
    },
  },
  render: () => {
    type MoveEvent = { cardId: string; from: string; to: string };
    const LoggerDemo = () => {
      const [log, setLog] = useState<MoveEvent[]>([]);
      return (
        <Stack direction="column" gap="3">
          <KanbanBoard
            columns={BASE_COLUMNS}
            onMove={(cardId, from, to) =>
              setLog((prev) => [...prev, { cardId, from, to }])
            }
          />
          <div
            data-testid="move-log"
            className="rounded-md border border-era-soft bg-era-base px-3 py-2 text-xs text-era-muted"
          >
            {log.length === 0
              ? "아직 이동한 카드가 없습니다."
              : log
                  .map((e, i) => `${i + 1}. ${e.cardId}: ${e.from} → ${e.to}`)
                  .join("  •  ")}
          </div>
        </Stack>
      );
    };
    return <LoggerDemo />;
  },
};

/**
 * Heritage / Neon side-by-side. Same `KanbanBoard` markup; era-aware
 * tokens (`bg-era-sunken`, `bg-era-raised`, `border-era`, `shadow-era-card`,
 * `font-era-display`, `text-era-muted`, `duration-era-fast`,
 * `ease-era-brush`) flip via the era CSS layer alone.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `KanbanBoard` rendered under both eras. Surface, border, " +
          "shadow, typography, and motion tokens flip without React " +
          "re-rendering.",
      },
    },
  },
  render: () => bothEras(() => <KanbanBoard columns={BASE_COLUMNS} />),
};

/**
 * Structural + keyboard-reorder play assertions. Pointer drag-and-drop is
 * still **not** synthesized — synthetic `dragstart`/`dragover`/`drop`
 * against the native HTML5 path is brittle in jsdom/happy-dom and would
 * mask real bugs rather than catch them. The keyboard path is fully
 * deterministic and does get exercised here:
 *
 *   1. The expected number of columns render with their headers.
 *   2. Each column wraps its cards in a `<ul role="list">` whose
 *      `aria-label` matches the column title; cards are `<li>` listitems.
 *   3. Cards are focusable (`tabIndex={0}`) and expose
 *      `draggable="true"` for the pointer path.
 *   4. Pressing **Space** on the first card grabs it (`data-grabbed="true"`).
 *      Note: `aria-pressed` is intentionally **not** stamped on the
 *      `<li role="listitem">` because axe's `aria-allowed-attr` rule
 *      forbids it on non-button roles. Grab state is conveyed visually
 *      via `data-grabbed` (CSS state hook) and audibly via the live
 *      region.
 *   5. Two **ArrowDown** presses move the card down within its column.
 *   6. **Space** drops the card. Because the gesture stayed inside the
 *      same column, `onMove` is **not** called (mirroring the pointer
 *      same-column-drop behaviour).
 *   7. The visually-hidden `role="status"` live region exists with
 *      `aria-live="polite"` and contains the most recent announcement.
 */
export const Interactive: Story = {
  args: {
    columns: BASE_COLUMNS,
    onMove: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Structural and keyboard-reorder assertions. The play function " +
          "verifies column count + headers, list semantics " +
          '(`role="list"` + `role="listitem"`), card focusability ' +
          "(`tabIndex=0`, `draggable`), and exercises the keyboard " +
          "grab-move-drop loop end-to-end (Space → ArrowDown × 2 → Space). " +
          "Pointer drag-and-drop is intentionally not synthesized here.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. Column headers — the component renders titles inside <h5> elements.
    const headings = canvas.getAllByRole("heading", { level: 5 });
    expect(headings).toHaveLength(3);
    expect(headings[0]).toHaveTextContent("대기");
    expect(headings[1]).toHaveTextContent("진행");
    expect(headings[2]).toHaveTextContent("완료");

    // 2. Each column wraps its card stack in a <ul role="list"> whose
    //    aria-label matches the column title.
    const lists = canvas.getAllByRole("list");
    expect(lists).toHaveLength(3);
    expect(lists[0]).toHaveAttribute("aria-label", "대기");
    expect(lists[1]).toHaveAttribute("aria-label", "진행");
    expect(lists[2]).toHaveAttribute("aria-label", "완료");

    // 3. Cards render as <li role="listitem"> in source order, are
    //    focusable (tabIndex=0), and carry the native draggable contract.
    const cards = canvas.getAllByRole("listitem");
    expect(cards).toHaveLength(8);
    expect(cards[0]).toHaveTextContent("토큰 정의");
    expect(cards[1]).toHaveTextContent("PatternBackground");
    expect(cards[2]).toHaveTextContent("EraSwitch 검증");
    expect(cards[3]).toHaveTextContent("KanbanBoard 스토리");
    expect(cards[4]).toHaveTextContent("DataTable 정렬");
    expect(cards[5]).toHaveTextContent("Button 변형");
    expect(cards[6]).toHaveTextContent("Stack 정렬");
    expect(cards[7]).toHaveTextContent("Tag 사이즈");
    for (const card of cards) {
      expect(card).toHaveAttribute("draggable", "true");
      expect(card).toHaveAttribute("tabindex", "0");
    }

    // 4. Tab to the first card and grab it with Space. Grab state is
    //    surfaced through `data-grabbed`; `aria-pressed` is intentionally
    //    not used (invalid on `role="listitem"` per axe
    //    `aria-allowed-attr`). Use `userEvent` (await-based) over
    //    `fireEvent` so React state updates flush before each assertion
    //    in the production-mode bundle the test-runner serves — same
    //    pattern as `DragDrop` / `PageTree` / `CommandPalette`.
    const firstCard = cards[0] as HTMLLIElement;
    firstCard.focus();
    expect(firstCard).toHaveFocus();
    await userEvent.keyboard("[Space]");
    // Re-query the grabbed card from the live DOM rather than reusing
    // the stale `firstCard` reference; the card is still keyed by id
    // (so the node is the same), but resolving via the `data-grabbed`
    // selector documents the contract that "exactly one card is grabbed
    // at a time" and survives any future re-mount refactor.
    const grabbedAfterPick = canvas
      .getAllByRole("listitem")
      .find((it) => it.getAttribute("data-grabbed") === "true");
    expect(grabbedAfterPick).toBeDefined();
    expect(grabbedAfterPick).toHaveTextContent("토큰 정의");
    expect(grabbedAfterPick).not.toHaveAttribute("aria-pressed");

    // 5. ArrowDown twice — the card moves to the bottom of its column.
    await userEvent.keyboard("[ArrowDown]");
    await userEvent.keyboard("[ArrowDown]");
    const todoList = canvas.getAllByRole("list")[0];
    const todoItems = within(todoList).getAllByRole("listitem");
    expect(todoItems[0]).toHaveTextContent("PatternBackground");
    expect(todoItems[1]).toHaveTextContent("EraSwitch 검증");
    expect(todoItems[2]).toHaveTextContent("토큰 정의");

    // 6. Space drops. Because the card never crossed columns, `onMove`
    //    is intentionally not called — Storybook's onMove spy stays
    //    untouched. After drop, `data-grabbed` is removed entirely
    //    (rather than flipped to `false`) so the dropped card is
    //    indistinguishable from idle siblings in the DOM.
    await userEvent.keyboard("[Space]");
    const grabbedAfterDrop = canvas
      .getAllByRole("listitem")
      .find((it) => it.getAttribute("data-grabbed") === "true");
    expect(grabbedAfterDrop).toBeUndefined();
    // `aria-pressed` must still be absent on every card after the drop —
    // regression guard for the Wave 5b2 a11y fix.
    for (const card of canvas.getAllByRole("listitem")) {
      expect(card).not.toHaveAttribute("aria-pressed");
    }
    // `args.onMove` is the Storybook action spy; its `.mock` surface is
    // what `expect(...).toHaveBeenCalled()` looks at. Same-column drops
    // do not fire it.
    expect(args.onMove).not.toHaveBeenCalled();

    // 7. The visually-hidden live region exists and carries the latest
    //    announcement.
    const status = canvas.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent(/Dropped 토큰 정의 in 대기/);
  },
};
