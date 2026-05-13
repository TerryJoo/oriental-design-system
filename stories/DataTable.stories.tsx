import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
} from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Tag } from "@/components/Tag";
import { bothEras } from "./_shared/argTypes";

/**
 * Row shape used by the basic, custom-cell, and alignment stories. Each row
 * represents a competitor in a fictional 기사(棋士) ranking table.
 */
interface PlayerRow {
  rank: number;
  name: string;
  title: string;
  rate: string;
  status: "active" | "rest" | "retired";
}

/**
 * Five-row baseline data set. Mirrors the test fixtures so the stories stay
 * recognisable next to `DataTable.test.tsx`.
 */
const PLAYERS: ReadonlyArray<PlayerRow> = [
  {
    rank: 1,
    name: "龍王",
    title: "초대 챔피언",
    rate: "87%",
    status: "active",
  },
  { rank: 2, name: "虎王", title: "도전자", rate: "82%", status: "active" },
  { rank: 3, name: "玄武", title: "수석 기사", rate: "76%", status: "rest" },
  { rank: 4, name: "朱雀", title: "신예", rate: "71%", status: "active" },
  { rank: 5, name: "白虎", title: "원로", rate: "68%", status: "retired" },
];

/**
 * Plain-text columns used by the `Default` story. No `cell` returns JSX so
 * the story shows the simplest possible API surface.
 */
const SIMPLE_COLUMNS: ReadonlyArray<DataTableColumn<PlayerRow>> = [
  { key: "rank", header: "순위", cell: (r) => r.rank },
  { key: "name", header: "기사", cell: (r) => r.name },
  { key: "title", header: "칭호", cell: (r) => r.title },
  { key: "rate", header: "승률", cell: (r) => r.rate },
];

const STATUS_TONE: Record<PlayerRow["status"], string> = {
  active: "text-era-primary",
  rest: "text-era-muted",
  retired: "text-era-muted line-through",
};

/**
 * The component is generic. Storybook's CSF3 meta cannot easily infer the
 * row type through the `as <T>(...)` cast, so the meta is typed against a
 * concrete `DataTableProps<PlayerRow>` and the component reference is
 * widened with a one-shot cast. This keeps `args`, `render`, and `play`
 * fully type-checked downstream while still resolving at runtime to the
 * real generic component.
 */
type PlayerTableProps = DataTableProps<PlayerRow>;
const PlayerDataTable = DataTable as (props: PlayerTableProps) => JSX.Element;

const meta = {
  title: "Components/DataTable",
  component: PlayerDataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "DataTable is a generic, intentionally minimal table primitive: `DataTable<T>` " +
          "renders a `<table>` from a `data: ReadonlyArray<T>` and a `columns: " +
          "ReadonlyArray<DataTableColumn<T>>` description. It does NOT ship with " +
          "sorting, selection, filtering, pagination, or virtualisation — those concerns " +
          "are intentionally left to the consumer so that each application can compose " +
          "the behaviour it actually needs (e.g. wrap the rows with a sort hook, pair the " +
          "table with a Pagination component, or wire selection through external state). " +
          "Per-column `align` (`'left' | 'center' | 'right'`) is supported. Each `<th>` " +
          'carries `scope="col"`, an optional `caption` is rendered as `sr-only` for ' +
          "screen-reader context, and `rowKey` lets you supply a stable key per row when " +
          "list identity matters (sort, filter, etc.). Era-aware tokens (`bg-era-sunken`, " +
          "`text-era-muted`, `border-era`, `border-era-soft`, `font-era-display`, " +
          "`duration-era-fast`, `ease-era-brush`) keep the table coherent across Heritage " +
          "and Neon without re-rendering React.",
      },
    },
  },
  args: {
    data: PLAYERS,
    columns: SIMPLE_COLUMNS,
  },
} satisfies Meta<typeof PlayerDataTable>;

export default meta;
type Story = StoryObj<typeof PlayerDataTable>;

/**
 * Basic 5-row, 4-column table with plain-text cells. Demonstrates the
 * smallest useful payload: just `data` + `columns`.
 */
export const Default: Story = {
  args: {
    caption: "기사 랭킹 — 기본",
    data: PLAYERS,
    columns: SIMPLE_COLUMNS,
  },
};

/**
 * Each column's `cell` returns rich JSX. The status column composes a Tag,
 * the player column a small Avatar + name layout, and the actions column
 * a Button. This is the recommended pattern for non-text columns.
 */
export const WithCustomCells: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`cell(row, rowIndex)` returns any `ReactNode`, so columns can render Tags, Avatars, Buttons, or any composition of design-system primitives. Avatars are decorative initials — they still receive an explicit `alt` so the `role="img"` element has alternative text (axe `role-img-alt`).',
      },
    },
  },
  args: {
    caption: "기사 랭킹 — 커스텀 셀",
    data: PLAYERS,
    columns: [
      { key: "rank", header: "순위", cell: (r) => r.rank },
      {
        key: "player",
        header: "기사",
        cell: (r) => (
          <span className="flex items-center gap-2">
            <Avatar size="sm" alt={`${r.name} 프로필`}>
              {r.name[0]}
            </Avatar>
            <span className="font-medium text-era-primary">{r.name}</span>
          </span>
        ),
      },
      { key: "title", header: "칭호", cell: (r) => r.title },
      {
        key: "status",
        header: "상태",
        cell: (r) => (
          <Tag size="sm" className={STATUS_TONE[r.status]}>
            {r.status}
          </Tag>
        ),
      },
      {
        key: "actions",
        header: "관리",
        cell: () => (
          <Button size="sm" variant="ghost">
            상세
          </Button>
        ),
      },
    ] satisfies ReadonlyArray<DataTableColumn<PlayerRow>>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Each Avatar in the player column is a `role="img"` with an
    // `aria-label` derived from the row's name (axe `role-img-alt`).
    // Verify the first row's avatar exposes an accessible name.
    const firstAvatar = canvas.getByRole("img", { name: "龍王 프로필" });
    await expect(firstAvatar).toBeInTheDocument();
  },
};

/**
 * Each column declares its own `align`. Numeric columns are right-aligned,
 * the status column is centred, and the name column stays left-aligned.
 * Both `<th>` and `<td>` pick up the same alignment class.
 */
export const WithAlignment: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Per-column `align` accepts `'left' | 'center' | 'right'`. The same alignment class is applied to both the header and every body cell in that column.",
      },
    },
  },
  args: {
    caption: "기사 랭킹 — 정렬",
    data: PLAYERS,
    columns: [
      { key: "rank", header: "순위", align: "right", cell: (r) => r.rank },
      { key: "name", header: "기사", align: "left", cell: (r) => r.name },
      { key: "title", header: "칭호", align: "left", cell: (r) => r.title },
      {
        key: "status",
        header: "상태",
        align: "center",
        cell: (r) => r.status,
      },
      { key: "rate", header: "승률", align: "right", cell: (r) => r.rate },
    ] satisfies ReadonlyArray<DataTableColumn<PlayerRow>>,
  },
};

/**
 * Empty `data` array. The component now renders a default `EmptyState`
 * inside a single full-width `<td colspan={columns.length}>` so users
 * always get an obvious "no data" affordance without composing extras.
 */
export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With `data: []` the component renders the headers plus a single full-width body cell (`<td colspan={columns.length}>`) that hosts an `<EmptyState>` placeholder. The default copy is Korean (`데이터가 없습니다`); override the entire slot via the new `emptyState?: ReactNode` prop. Pass `emptyState={null}` to opt back into the legacy bare-`<tbody>` layout.",
      },
    },
  },
  args: {
    caption: "기사 랭킹 — 빈 상태",
    data: [],
    columns: SIMPLE_COLUMNS,
  },
};

/**
 * `emptyState` accepts any `ReactNode`. This story passes a custom
 * `<EmptyState>` with a contextual title, description, and a Button so
 * the user can recover with one click. Mirrors a real "no rows after
 * filter" UX.
 */
export const EmptyWithCustomNode: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass any `ReactNode` to `emptyState` to fully customise the placeholder — including an action button that resets the filter, repoints the data source, etc. Keep the message scannable and the CTA singular.",
      },
    },
  },
  args: {
    caption: "기사 랭킹 — 커스텀 빈 상태",
    data: [],
    columns: SIMPLE_COLUMNS,
    emptyState: (
      <EmptyState
        title="검색 결과가 없습니다"
        description="필터를 초기화하거나 검색어를 다시 입력해 보세요."
        actions={
          <Button size="sm" variant="primary">
            필터 초기화
          </Button>
        }
      />
    ),
  },
};

/**
 * Loading variant: the consumer renders the table with a `<Skeleton>`
 * line in each cell during fetch. The component itself does not own a
 * `loading` prop — this is a pure composition pattern. Each row's
 * `<Skeleton aria-busy>` provides the screen-reader "busy" cue, and the
 * cell padding stays identical to the loaded layout so the table does
 * not jump on data resolution.
 */
const LOADING_ROWS: ReadonlyArray<PlayerRow> = Array.from({ length: 4 }).map(
  (_, i) => ({
    rank: i + 1,
    name: "",
    title: "",
    rate: "",
    status: "active" as const,
  }),
);

const LOADING_COLUMNS: ReadonlyArray<DataTableColumn<PlayerRow>> = [
  {
    key: "rank",
    header: "순위",
    cell: () => <Skeleton width={24} height={12} />,
  },
  {
    key: "name",
    header: "기사",
    cell: () => <Skeleton width={80} height={12} />,
  },
  {
    key: "title",
    header: "칭호",
    cell: () => <Skeleton width={64} height={12} />,
  },
  {
    key: "rate",
    header: "승률",
    cell: () => <Skeleton width={32} height={12} />,
  },
];

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Loading pattern: keep the table mounted, swap the row data for placeholder rows whose cells render `<Skeleton>` lines. Each `Skeleton` carries `aria-busy="true" aria-live="polite"`, so screen readers announce the busy state without the table needing its own loading prop. Once the fetch resolves, replace the placeholder rows with real data — the table layout stays stable end-to-end.',
      },
    },
  },
  args: {
    caption: "기사 랭킹 — 로딩",
    data: LOADING_ROWS,
    columns: LOADING_COLUMNS,
  },
};

/**
 * Row shape used by the long-content story. `bio` is intentionally verbose
 * so the wrap behaviour of the default style (`px-4 py-2.5`, no truncation)
 * is visible.
 */
interface ArticleRow {
  id: string;
  title: string;
  bio: string;
}

const ARTICLES: ReadonlyArray<ArticleRow> = [
  {
    id: "a1",
    title: "오방색의 다섯 방위",
    bio: "오방색은 청·적·황·백·흑의 다섯 가지 빛깔로, 동·남·중앙·서·북의 다섯 방위와 사계절의 흐름을 동시에 상징합니다. 디자인 시스템은 이 다섯 방위를 토큰으로 추상화하여 Heritage와 Neon 두 시대층이 같은 의미를 다른 표면 위에서 구현하도록 합니다.",
  },
  {
    id: "a2",
    title: "Heritage와 Neon의 공존",
    bio: "Heritage 층은 한지·먹·청자의 부드러운 표면을, Neon 층은 사이버펑크 회로와 스캔라인의 빛을 표현합니다. 두 층은 동일한 시맨틱 슬롯을 공유하므로 컴포넌트는 시대를 인식하지 않고도 동일한 코드로 자연스럽게 전환됩니다.",
  },
];

/**
 * Cells with very long text. The default styles do NOT enable ellipsis
 * truncation — long copy wraps within the cell. If you need single-line
 * ellipsis, render a `<span className="truncate ...">` inside the
 * column's `cell` function and constrain the column width yourself.
 */
const LongContentTable = DataTable as (
  props: DataTableProps<ArticleRow>,
) => JSX.Element;

export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Long copy wraps inside cells — the default styles do not truncate. For single-line ellipsis, return a `<span className="truncate">` (with a constrained column width) from the `cell` function.',
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <LongContentTable
        caption="긴 본문 예시"
        data={ARTICLES}
        columns={[
          { key: "id", header: "ID", align: "left", cell: (r) => r.id },
          { key: "title", header: "제목", cell: (r) => r.title },
          { key: "bio", header: "본문", cell: (r) => r.bio },
        ]}
      />
    </div>
  ),
};

/**
 * Generates a fixed dataset of fifty rows. Outside the meta args so each
 * story render is referentially stable.
 */
const MANY_ROWS: ReadonlyArray<PlayerRow> = Array.from({ length: 50 }).map(
  (_, i) => ({
    rank: i + 1,
    name: `기사 ${String(i + 1).padStart(2, "0")}`,
    title: i < 5 ? "마스터" : i < 20 ? "수석" : i < 40 ? "정규" : "신예",
    rate: `${(95 - i).toString()}%`,
    status: i % 7 === 0 ? "rest" : i % 11 === 0 ? "retired" : "active",
  }),
);

/**
 * Fifty-row table. The component renders all rows in one pass — there is
 * no built-in virtualisation and no sticky header. For production use with
 * thousands of rows, wrap with a virtualisation library (e.g.
 * `@tanstack/react-virtual`) and add a `<thead>` sticky wrapper externally
 * if needed.
 *
 * The scroll wrapper carries `role="region"`, an `aria-label`, and
 * `tabIndex={0}` so keyboard users can scroll the table on Safari and
 * other browsers that otherwise skip non-focusable scroll containers
 * (axe `scrollable-region-focusable`).
 */
export const ManyRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Fifty rows rendered in a single pass. The component does NOT virtualise and the header is NOT sticky — wrap the table in a scroll container with a sticky-positioned `<thead>` if the host layout requires it, or pair with a virtualisation library for very large datasets. The scroll wrapper here is a focusable `role="region"` with an `aria-label` so keyboard users can scroll it on browsers (Safari) that otherwise skip non-focusable scroll containers.',
      },
    },
  },
  render: () => (
    <div
      role="region"
      aria-label="50명 랭킹 스크롤 영역"
      tabIndex={0}
      style={{ maxHeight: 360, overflow: "auto" }}
    >
      <PlayerDataTable
        caption="50명 랭킹"
        data={MANY_ROWS}
        columns={SIMPLE_COLUMNS}
        rowKey={(r) => r.rank}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The scroll wrapper is a labelled, keyboard-focusable region so
    // screen-reader users get an accessible name and Safari users can
    // reach the scroll surface with Tab. axe `scrollable-region-focusable`
    // requires every `region` to expose all three.
    const region = canvas.getByRole("region", {
      name: "50명 랭킹 스크롤 영역",
    });
    await expect(region).toBeInTheDocument();
    await expect(region).toHaveAttribute("tabIndex", "0");
  },
};

/**
 * Heritage / Neon side-by-side comparison. Both panels share the same
 * `data` and `columns`; the era-aware tokens flip surfaces, borders, and
 * the header type colour entirely through CSS — no React re-render is
 * triggered by switching eras.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `data` and `columns` rendered under Heritage and Neon. Surfaces (`bg-era-sunken`), text (`text-era-muted`), borders (`border-era`, `border-era-soft`), and the display font (`font-era-display`) all adapt via the era CSS layer.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <PlayerDataTable
        caption="Era 비교"
        data={PLAYERS}
        columns={SIMPLE_COLUMNS}
      />
    )),
};

/**
 * Automated structural assertion. Verifies the WAI-ARIA-implicit roles
 * exposed by the underlying `<table>` markup:
 *
 *  1. The root has `role="table"` (implicit from `<table>`).
 *  2. There are exactly four `columnheader` roles (one per column).
 *  3. The total `row` count is one header row plus five body rows.
 *
 * The `caption` is rendered as `sr-only` so it is in the accessibility
 * tree but visually hidden.
 */
export const Interactive: Story = {
  args: {
    caption: "기사 랭킹 — 자동 검증",
    data: PLAYERS,
    columns: SIMPLE_COLUMNS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Automated structural proof: the root resolves to `role="table"`, four `columnheader` cells are present, and there are six `row`s total (one header + five body rows).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Implicit role="table" on the <table> element.
    const table = canvas.getByRole("table");
    await expect(table).toBeInTheDocument();

    // 2. One columnheader per column.
    const columnHeaders = canvas.getAllByRole("columnheader");
    await expect(columnHeaders).toHaveLength(SIMPLE_COLUMNS.length);
    await expect(columnHeaders[0]).toHaveTextContent("순위");
    await expect(columnHeaders[1]).toHaveTextContent("기사");
    await expect(columnHeaders[2]).toHaveTextContent("칭호");
    await expect(columnHeaders[3]).toHaveTextContent("승률");

    // 3. Header row + body rows = 1 + PLAYERS.length.
    const rows = canvas.getAllByRole("row");
    await expect(rows).toHaveLength(1 + PLAYERS.length);

    // 4. Caption is in the accessibility tree (sr-only, but present).
    await expect(canvas.getByText("기사 랭킹 — 자동 검증")).toBeInTheDocument();
  },
};
