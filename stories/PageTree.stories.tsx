import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useState } from "react";
import { PageTree, type PageTreeNodeData } from "@/components/PageTree";
import { Button } from "@/components/Button";
import { Stack } from "@/components/Stack";
import { bothEras } from "./_shared/argTypes";

/**
 * Flat 5-node sample used by the simplest stories.
 */
const FLAT_NODES: ReadonlyArray<PageTreeNodeData> = [
  { value: "intro", label: "서문" },
  { value: "obangsaek", label: "오방색" },
  { value: "patterns", label: "전통 문양" },
  { value: "calligraphy", label: "서예" },
  { value: "tea", label: "다도" },
];

/**
 * Three-level nested tree mirroring an oriental archive sitemap.
 */
const NESTED_NODES: ReadonlyArray<PageTreeNodeData> = [
  {
    value: "collections",
    label: "동양 컬렉션",
    children: [
      {
        value: "paintings",
        label: "회화",
        children: [
          { value: "ink-landscape", label: "수묵 산수" },
          { value: "court-portrait", label: "어진 초상" },
        ],
      },
      {
        value: "ceramics",
        label: "도자기",
        children: [
          { value: "celadon", label: "청자" },
          { value: "buncheong", label: "분청사기" },
          { value: "white", label: "백자" },
        ],
      },
    ],
  },
  {
    value: "rituals",
    label: "의례",
    children: [
      { value: "wedding", label: "혼례" },
      { value: "ancestral", label: "제례" },
    ],
  },
  { value: "glossary", label: "용어집" },
];

/**
 * Same shape as `NESTED_NODES` but with `defaultOpen` set on a few branches
 * so the tree renders pre-expanded for the uncontrolled story.
 */
const PRE_EXPANDED_NODES: ReadonlyArray<PageTreeNodeData> = [
  {
    value: "collections",
    label: "동양 컬렉션",
    defaultOpen: true,
    children: [
      {
        value: "paintings",
        label: "회화",
        defaultOpen: true,
        children: [
          { value: "ink-landscape", label: "수묵 산수" },
          { value: "court-portrait", label: "어진 초상" },
        ],
      },
      {
        value: "ceramics",
        label: "도자기",
        children: [
          { value: "celadon", label: "청자" },
          { value: "buncheong", label: "분청사기" },
          { value: "white", label: "백자" },
        ],
      },
    ],
  },
  {
    value: "rituals",
    label: "의례",
    children: [
      { value: "wedding", label: "혼례" },
      { value: "ancestral", label: "제례" },
    ],
  },
];

/**
 * Inline SVG icons used by the "WithIcons" story so the file stays tokens-first
 * (no hardcoded colors — every stroke uses `currentColor`).
 */
const FolderIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const PageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
  </svg>
);

const ICON_NODES: ReadonlyArray<PageTreeNodeData> = [
  {
    value: "favorites",
    label: "즐겨찾기",
    icon: <StarIcon />,
    defaultOpen: true,
    children: [
      { value: "fav-celadon", label: "청자 운학문 매병", icon: <PageIcon /> },
      { value: "fav-tea", label: "다도 입문", icon: <PageIcon /> },
    ],
  },
  {
    value: "library",
    label: "서고",
    icon: <FolderIcon />,
    children: [
      { value: "lib-poetry", label: "시조집", icon: <PageIcon /> },
      { value: "lib-essay", label: "수필", icon: <PageIcon /> },
    ],
  },
  { value: "readme", label: "README", icon: <PageIcon /> },
];

/**
 * Synthesises a 30+ node tree procedurally so the LargeTree story can
 * verify visual density and performance under deeper nesting.
 */
const buildLargeTree = (): ReadonlyArray<PageTreeNodeData> => {
  const branches = ["청", "적", "황", "백", "흑"];
  return branches.map((color, ci) => ({
    value: `branch-${ci}`,
    label: `${color} 갈래`,
    defaultOpen: ci < 2,
    children: Array.from({ length: 4 }).map((_, gi) => ({
      value: `branch-${ci}-group-${gi}`,
      label: `${color}-${gi + 1} 분류`,
      defaultOpen: ci === 0 && gi === 0,
      children: Array.from({ length: 3 }).map((_, li) => ({
        value: `branch-${ci}-group-${gi}-leaf-${li}`,
        label: `${color}-${gi + 1}-${li + 1} 항목`,
      })),
    })),
  }));
};

const LARGE_NODES = buildLargeTree();

const meta = {
  title: "Components/PageTree",
  component: PageTree,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "PageTree renders a hierarchical sitemap of pages or content nodes. " +
          "Selection is controlled via `value` + `onChange`; expand state is " +
          "uncontrolled and seeded from `defaultOpen` on each node. Clicking a " +
          "parent node both toggles its caret and fires `onChange` with the " +
          "parent's value. \n\n" +
          '**WAI-ARIA tree pattern**: the root has `role="tree"`, every node ' +
          'is a `treeitem`, and each child group is wrapped in `role="group"`. ' +
          "Parent items expose `aria-expanded` (true/false), every item " +
          "exposes `aria-selected`, and a roving `tabindex` keeps exactly one " +
          "item in the tab order at a time. Era-aware tokens " +
          "(`text-era-primary`, `border-era-soft`, `duration-era`, " +
          "`ease-era-brush`) make the tree flip cleanly between Heritage and " +
          "Neon without re-rendering.\n\n" +
          "**Keyboard navigation** (full WAI-ARIA tree pattern):\n" +
          "- `Tab` / `Shift+Tab` — enter/leave the tree (lands on the roving-tabbable item).\n" +
          "- `ArrowDown` / `ArrowUp` — move focus through visible items.\n" +
          "- `ArrowRight` — expand a collapsed parent, or move into the first child of an expanded parent.\n" +
          "- `ArrowLeft` — collapse an expanded parent, or jump focus to the parent of a leaf.\n" +
          "- `Home` / `End` — focus first / last visible item.\n" +
          "- `Enter` / `Space` — activate the focused item (fires `onChange`).\n\n" +
          "Typeahead (single-character search) is not yet implemented — see Wave 5b2 backlog.",
      },
    },
  },
  args: {
    nodes: FLAT_NODES,
  },
} satisfies Meta<typeof PageTree>;

export default meta;
type Story = StoryObj<typeof PageTree>;

/**
 * A flat tree of five nodes with no nesting. Every item renders without a
 * caret and clicking one fires `onChange` with that node's `value`.
 */
export const Default: Story = {
  args: {
    nodes: FLAT_NODES,
  },
};

/**
 * Three-level nested tree (collections → category → leaf). Branches start
 * collapsed; click a parent to toggle its children.
 */
export const Nested: Story = {
  args: {
    nodes: NESTED_NODES,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Multi-level tree showing how nested children render under " +
          '`role="group"` containers. The same data shape is recursive — ' +
          "each `PageTreeNodeData` may carry its own `children` array.",
      },
    },
  },
};

/**
 * Uncontrolled expand state seeded by `defaultOpen` on selected branches. The
 * tree opens to a useful starting view without external state.
 */
export const DefaultExpanded: Story = {
  args: {
    nodes: PRE_EXPANDED_NODES,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Per-node `defaultOpen` lets you ship the tree with branches " +
          "pre-expanded. The component still owns expand state internally — " +
          "user toggles take over after the first interaction.",
      },
    },
  },
};

/**
 * Fully controlled selection. `useState` holds the current `value`, and
 * external Buttons jump selection between leaves. The tree's internal expand
 * state remains uncontrolled in this implementation.
 */
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass `value` + `onChange` to drive selection from outside React " +
          "state. The Buttons demonstrate writing to `value` directly. Note " +
          "that expand state is not controllable in this implementation — " +
          "only selection is.",
      },
    },
  },
  render: () => {
    const ControlledDemo = () => {
      const [value, setValue] = useState<string>("celadon");
      return (
        <Stack direction="column" gap="3" style={{ width: 320 }}>
          <Stack direction="row" gap="2" align="center">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setValue("celadon")}
              data-testid="select-celadon"
            >
              청자
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setValue("white")}
              data-testid="select-white"
            >
              백자
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setValue("")}
              data-testid="select-clear"
            >
              해제
            </Button>
          </Stack>
          <span className="text-xs text-era-muted">
            selected: {value || "—"}
          </span>
          <PageTree
            nodes={PRE_EXPANDED_NODES}
            value={value}
            onChange={setValue}
          />
        </Stack>
      );
    };
    return <ControlledDemo />;
  },
};

/**
 * Nodes with leading icons (folder for branches, page for leaves, star for
 * favourites). Icons use `currentColor` so they inherit era-aware text colour
 * and require no token overrides.
 */
export const WithIcons: Story = {
  args: {
    nodes: ICON_NODES,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Each node may carry an optional `icon` ReactNode rendered before " +
          "the label. Icons use `currentColor` so Heritage / Neon text colours " +
          "carry through automatically.",
      },
    },
  },
};

/**
 * One node is selected. The active row uses the `pageTreeNodeActive` style
 * (accent-tinted background and bold accent-700 label).
 */
export const WithActiveNode: Story = {
  args: {
    nodes: PRE_EXPANDED_NODES,
    value: "celadon",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass a `value` matching one of the node `value`s to mark it active. " +
          "Active styling pulls from accent tokens (`accent-500/0.12` " +
          "background, `accent-700` text).",
      },
    },
  },
};

/**
 * Procedurally-generated 60-leaf tree to verify visual density at depth and
 * confirm the component handles non-trivial node counts without lag.
 */
export const LargeTree: Story = {
  args: {
    nodes: LARGE_NODES,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Five top-level branches × four sub-groups × three leaves = 60+ " +
          "nodes across three depth levels. Two branches start expanded so the " +
          "first paint shows real depth and density.",
      },
    },
  },
};

/**
 * Empty `nodes` array. The component renders the new `emptyState` slot
 * (default: `<EmptyState>` with Korean copy) instead of the WAI-ARIA
 * tree wrapper. Pass `emptyState={...}` to customise the placeholder, or
 * `emptyState={null}` to render an empty container.
 *
 * Note: the empty branch intentionally does NOT carry `role="tree"` — an
 * empty `tree` would violate `aria-required-children`. Once nodes
 * resolve, the standard tree semantics return.
 */
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `nodes.length === 0` the tree renders the new `emptyState` slot. Default copy is `페이지가 없습니다`. Override via the `emptyState?: ReactNode` prop. Consumers who need a landmark wrapper around the empty state should compose one themselves — the empty branch drops `role="tree"` to avoid an axe `aria-required-children` violation.',
      },
    },
  },
  args: {
    nodes: [],
  },
};

/**
 * Heritage / Neon side-by-side. Both panels render the same nested tree;
 * surface, border, and caret colours flip via the era CSS layer alone — no
 * React re-render is involved.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `PageTree` markup rendered in Heritage and Neon. Hover " +
          "background, border-left of child groups, and active accent tint all " +
          "swap via era tokens.",
      },
    },
  },
  render: () =>
    bothEras(() => <PageTree nodes={PRE_EXPANDED_NODES} value="celadon" />),
};

/**
 * Interaction test exercising the full WAI-ARIA tree pattern:
 *
 *  1. The first visible item is roving-tabbable on initial render and Tab
 *     lands focus on it.
 *  2. ArrowDown / ArrowUp move focus through visible items.
 *  3. ArrowRight on a collapsed parent expands it; a second ArrowRight moves
 *     focus into the first child.
 *  4. ArrowLeft on a leaf jumps focus back to its parent.
 *  5. Home / End jump to first / last visible item.
 *  6. Enter activates the focused item and fires `onChange`.
 *  7. Click still works (collapse via parent click, leaf select via click).
 */
export const Interactive: Story = {
  args: {
    nodes: NESTED_NODES,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof of the full keyboard contract: Tab lands on the " +
          "roving-tabbable item, Arrow keys roam, ArrowRight expands and " +
          "descends, ArrowLeft collapses or ascends, Home/End jump to ends, " +
          "and Enter selects.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Helper: the inner clickable / focusable row for a label is the first
    // child div of the treeitem wrapper — that's where tabIndex / focus /
    // keyboard handlers live.
    const rowFor = (label: string) =>
      canvas.getByText(label).closest('[role="treeitem"]')!
        .firstElementChild as HTMLElement;

    // 1. Initial state: collapsed parent has aria-expanded="false", children
    //    are not in the DOM, and only the first row is in the tab order.
    const collectionsItem = canvas
      .getByText("동양 컬렉션")
      .closest('[role="treeitem"]') as HTMLElement;
    await expect(collectionsItem).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByText("회화")).not.toBeInTheDocument();
    await expect(rowFor("동양 컬렉션").tabIndex).toBe(0);
    await expect(rowFor("의례").tabIndex).toBe(-1);

    // 2. Tab moves focus into the tree, landing on the roving-tabbable row.
    //    NOTE: PageTree's keyboard handler defers focus moves via
    //    requestAnimationFrame so newly-mounted children are reachable on
    //    expand. Wrap focus assertions in `waitFor` so they survive the rAF.
    await userEvent.tab();
    await waitFor(() => expect(rowFor("동양 컬렉션")).toHaveFocus());

    // 3. ArrowDown moves focus to the next visible item.
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(rowFor("의례")).toHaveFocus());

    // 4. ArrowUp moves focus back.
    await userEvent.keyboard("{ArrowUp}");
    await waitFor(() => expect(rowFor("동양 컬렉션")).toHaveFocus());

    // 5. ArrowRight on a collapsed parent expands it (children appear, focus
    //    stays on the parent).
    await userEvent.keyboard("{ArrowRight}");
    await expect(collectionsItem).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("회화")).toBeInTheDocument();
    await waitFor(() => expect(rowFor("동양 컬렉션")).toHaveFocus());

    // 6. ArrowRight again moves focus into the first child.
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(rowFor("회화")).toHaveFocus());

    // 7. ArrowLeft on a child (collapsed-leaf style) jumps to the parent.
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => expect(rowFor("동양 컬렉션")).toHaveFocus());

    // 8. Home jumps to first visible item, End jumps to last visible item.
    //    With "동양 컬렉션" expanded, the visible list is:
    //    [동양 컬렉션, 회화, 도자기, 의례, 용어집]
    await userEvent.keyboard("{End}");
    await waitFor(() => expect(rowFor("용어집")).toHaveFocus());
    await userEvent.keyboard("{Home}");
    await waitFor(() => expect(rowFor("동양 컬렉션")).toHaveFocus());

    // 9. Enter on a leaf fires onChange with its value. Navigate down to "회화"
    //    (which is itself a parent) and expand it, then descend to "수묵 산수".
    await userEvent.keyboard("{ArrowDown}"); // → 회화
    await userEvent.keyboard("{ArrowRight}"); // expand 회화
    await userEvent.keyboard("{ArrowRight}"); // → 수묵 산수
    await waitFor(() => expect(rowFor("수묵 산수")).toHaveFocus());
    await userEvent.keyboard("{Enter}");
    const onChange = args.onChange;
    await expect(onChange).toHaveBeenCalledWith("ink-landscape");

    // 10. Click still selects (regression check).
    await userEvent.click(canvas.getByText("어진 초상"));
    await expect(onChange).toHaveBeenCalledWith("court-portrait");

    // 11. Container still exposes role="tree".
    await expect(canvas.getByRole("tree")).toBeInTheDocument();
  },
};
