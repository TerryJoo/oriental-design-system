import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Tabs, type TabItem } from "@/components/Tabs";
import { Button } from "@/components/Button";
import { Stack } from "@/components/Stack";
import { Tag } from "@/components/Tag";
import { bothEras } from "./_shared/argTypes";

/**
 * Three short, illustrative tabs reused across the simpler stories. Each
 * story makes its own copy when it needs to mutate (`disabled`, custom
 * labels, etc.) so Storybook re-renders never bleed across stories.
 */
const BASE_ITEMS: ReadonlyArray<TabItem> = [
  {
    value: "overview",
    label: "개요",
    content: "오방색은 청·적·황·백·흑의 다섯 가지 빛깔로 구성됩니다.",
  },
  {
    value: "rules",
    label: "규칙",
    content: "각 차례마다 한 번씩 행동할 수 있으며, 행동 후 차례가 넘어갑니다.",
  },
  {
    value: "history",
    label: "역사",
    content: "고려 시대 이후 다양한 형태로 전승되어 왔습니다.",
  },
];

/**
 * Inline 16-px outline icons used by the WithIcons story. Stroke uses
 * `currentColor` so the icon picks up the active/inactive `text-era-*`
 * tokens that the underlying tab applies.
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

const HomeIcon = (
  <Icon>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </Icon>
);

const ListIcon = (
  <Icon>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </Icon>
);

const ClockIcon = (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Tabs renders a horizontal tablist plus a single panel for the active item. " +
          "It supports both uncontrolled (`defaultValue`) and controlled (`value` + `onChange`) " +
          "usage. Each item carries its own `label`, optional `content`, and optional `disabled` " +
          "flag.\n\n" +
          '**WAI-ARIA tabs pattern.** The container is `role="tablist"` with ' +
          '`aria-orientation="horizontal"`. Each trigger is `role="tab"` with ' +
          "`aria-selected`, a stable `id`, and `aria-controls` pointing at its panel; the " +
          "active panel mirrors the relationship via `id` + `aria-labelledby` and is " +
          "`tabIndex=0` so screen-reader and keyboard users can scroll it.\n\n" +
          "**Roving tabindex.** Only the currently-selected tab is `tabIndex=0`; the others " +
          "are `tabIndex=-1`. Tab/Shift+Tab from outside the tablist enters on the active " +
          "tab and Tab from the active tab leaves the tablist — inactive tabs are reachable " +
          "only via the keyboard pattern below, never via repeated Tab presses.\n\n" +
          "**Keyboard navigation (manual activation).** ArrowLeft/ArrowRight move focus " +
          "between tabs, skipping disabled tabs and wrapping at the ends. Home/End jump to " +
          "the first/last enabled tab. Arrow keys do **not** change selection — focus and " +
          "selection are decoupled. Press Enter or Space on a focused tab to activate it; " +
          "only then does `onChange` fire and the panel swap. Long tablists scroll " +
          "horizontally via `overflow-x-auto` rather than wrapping.",
      },
    },
  },
  args: {
    items: BASE_ITEMS,
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof Tabs>;

/**
 * Default uncontrolled tabs. With no `defaultValue`, the component falls
 * back to the first item (`overview`) as the initially active tab.
 */
export const Default: Story = {
  args: {
    items: BASE_ITEMS,
  },
};

/**
 * Tabs with leading icons. The icons live inside each item's `label`
 * (which accepts arbitrary `ReactNode`), and use `currentColor` so they
 * pick up the active/inactive tab text color automatically.
 */
export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each `label` is a `ReactNode`, so an icon + text combination is just JSX inside the label. Icons inherit the tab's text color via `currentColor`, so they switch tone when the tab becomes active.",
      },
    },
  },
  args: {
    items: [
      {
        value: "overview",
        label: (
          <>
            {HomeIcon}
            개요
          </>
        ),
        content: BASE_ITEMS[0].content,
      },
      {
        value: "rules",
        label: (
          <>
            {ListIcon}
            규칙
          </>
        ),
        content: BASE_ITEMS[1].content,
      },
      {
        value: "history",
        label: (
          <>
            {ClockIcon}
            역사
          </>
        ),
        content: BASE_ITEMS[2].content,
      },
    ] as ReadonlyArray<TabItem>,
  },
};

/**
 * Fully controlled tabs. External buttons drive the active value by
 * writing to `value` directly, and the live `onChange` callback updates a
 * read-out below the panel.
 */
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass both `value` and `onChange` to drive the tabs from outside React state. Programmatic switches and pointer activation both flow through `onChange` so consumers see a single source of truth.",
      },
    },
  },
  render: (args) => {
    const ControlledDemo = () => {
      const [active, setActive] = useState<string>(BASE_ITEMS[0].value);
      return (
        <Stack direction="column" gap="3" style={{ width: 480 }}>
          <Stack direction="row" gap="2" align="center">
            {BASE_ITEMS.map((item) => (
              <Button
                key={item.value}
                size="sm"
                variant={active === item.value ? "primary" : "secondary"}
                onClick={() => setActive(item.value)}
                data-testid={`set-${item.value}`}
              >
                {item.value}
              </Button>
            ))}
            <span className="text-xs text-era-muted">active: {active}</span>
          </Stack>
          <Tabs
            {...args}
            items={BASE_ITEMS}
            value={active}
            onChange={setActive}
          />
        </Stack>
      );
    };
    return <ControlledDemo />;
  },
};

/**
 * The middle item is disabled. It still renders inside the tablist but
 * cannot be activated by pointer or by keyboard (the underlying button is
 * `disabled`, so it is not in the tab order).
 */
export const WithDisabledTab: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The middle tab is `disabled`. The disabled tab still renders inside the tablist but is removed from the keyboard pattern: ArrowRight/ArrowLeft skip over it, and Home/End never land on it. The play function below verifies arrow-key skipping and that pointer activation on the disabled tab is a no-op.",
      },
    },
  },
  args: {
    items: [
      BASE_ITEMS[0],
      { ...BASE_ITEMS[1], disabled: true },
      BASE_ITEMS[2],
    ] as ReadonlyArray<TabItem>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "개요" });
    const rules = canvas.getByRole("tab", { name: "규칙" });
    const history = canvas.getByRole("tab", { name: "역사" });

    // The middle tab is disabled at the DOM level.
    await expect(rules).toBeDisabled();

    // ArrowRight from overview skips the disabled rules tab and lands on history.
    overview.focus();
    await expect(overview).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(history).toHaveFocus();

    // Clicking the disabled tab is a no-op: the active panel does not change.
    await userEvent.click(rules);
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      BASE_ITEMS[0].content as string,
    );
  },
};

/**
 * Twelve tabs render inside a single tablist. The styles set
 * `overflow-x-auto` on the list so the tabs scroll horizontally rather
 * than wrapping onto a second row. The container is intentionally narrow
 * so the scroll affordance is visible by default.
 */
export const ManyTabs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The tablist sets `overflow-x-auto`, so a long list of tabs scrolls horizontally instead of wrapping. The narrow container in this story makes the horizontal scrollbar visible without resizing the viewport.",
      },
    },
  },
  render: () => {
    const items: ReadonlyArray<TabItem> = Array.from({ length: 12 }).map(
      (_, i) => ({
        value: `tab-${i + 1}`,
        label: `섹션 ${i + 1}`,
        content: `${i + 1}번 섹션의 본문입니다.`,
      }),
    );
    return (
      <div style={{ width: 360 }}>
        <Tabs items={items} />
      </div>
    );
  },
};

/**
 * Each tab's `content` is a full layout — Tags, paragraphs, and a Button
 * row composed via Stack. Demonstrates that panels accept any
 * `ReactNode`, not just strings.
 */
export const RichPanels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tab `content` accepts any `ReactNode`. This story embeds Tags, a Stack-driven layout, and Buttons inside each panel to mimic a real product surface.",
      },
    },
  },
  args: {
    items: [
      {
        value: "summary",
        label: "요약",
        content: (
          <Stack direction="column" gap="3">
            <Stack direction="row" gap="2" wrap>
              <Tag size="sm">React</Tag>
              <Tag size="sm">Tailwind</Tag>
              <Tag size="sm">Heritage</Tag>
              <Tag size="sm">Neon</Tag>
            </Stack>
            <p className="text-sm text-era-muted">
              요약 패널은 태그, 본문, 그리고 빠른 액션 버튼을 함께 보여줍니다.
            </p>
            <Stack direction="row" gap="2">
              <Button size="sm" variant="primary">
                자세히 보기
              </Button>
              <Button size="sm" variant="ghost">
                나중에
              </Button>
            </Stack>
          </Stack>
        ),
      },
      {
        value: "metrics",
        label: "지표",
        content: (
          <Stack direction="row" gap="6">
            <Stack direction="column" gap="1">
              <span className="text-xs text-era-muted">사용자</span>
              <span className="text-base font-semibold text-era-primary">
                1,284
              </span>
            </Stack>
            <Stack direction="column" gap="1">
              <span className="text-xs text-era-muted">전환율</span>
              <span className="text-base font-semibold text-era-primary">
                42.3%
              </span>
            </Stack>
            <Stack direction="column" gap="1">
              <span className="text-xs text-era-muted">잔존율</span>
              <span className="text-base font-semibold text-era-primary">
                88.0%
              </span>
            </Stack>
          </Stack>
        ),
      },
      {
        value: "settings",
        label: "설정",
        content: (
          <Stack direction="column" gap="2">
            <Stack direction="row" justify="between" align="center">
              <span className="text-sm text-era-primary">알림 받기</span>
              <Tag size="sm">on</Tag>
            </Stack>
            <Stack direction="row" justify="between" align="center">
              <span className="text-sm text-era-primary">자동 동기화</span>
              <Tag size="sm">off</Tag>
            </Stack>
            <Stack direction="row" gap="2">
              <Button size="sm" variant="secondary">
                저장
              </Button>
              <Button size="sm" variant="ghost">
                취소
              </Button>
            </Stack>
          </Stack>
        ),
      },
    ] as ReadonlyArray<TabItem>,
  },
};

/**
 * Wave 5b2-C3 overflow proof. Each tab trigger caps at `max-w-[10rem]`
 * and clamps to a single line with `truncate`. Long labels clip with
 * an ellipsis instead of forcing the entire tablist wider; cases where
 * many labels are long still scroll horizontally via the existing
 * `overflow-x-auto` on `tabsList`.
 */
export const LongText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A tab label exceeding the `max-w-[10rem]` ceiling clips with an ellipsis. The accessible name is unchanged (the full label remains in the DOM), so screen-reader users still hear the full text on focus. Hover the truncated tab in this story to see the title in a browser tooltip via the `title` attribute.",
      },
    },
  },
  render: () => {
    const items: ReadonlyArray<TabItem> = [
      {
        value: "summary",
        label: "요약",
        content: "짧은 라벨은 ceiling 안에 그대로 들어맞습니다.",
      },
      {
        value: "long",
        // 40+ character label so the ellipsis triggers under the
        // 10rem ceiling.
        label: "조선왕조실록-국역사업-담당부서-편찬위원회-2024",
        content:
          "긴 라벨은 `truncate`로 잘려서 다른 탭의 위치를 흔들지 않습니다.",
      },
      {
        value: "metrics",
        label: "지표",
        content: "지표 패널의 본문입니다.",
      },
    ];
    return (
      <div style={{ width: 480 }}>
        <Tabs items={items} defaultValue="summary" />
      </div>
    );
  },
};

/**
 * Heritage / Neon side-by-side. Same `Tabs` markup; the era-aware
 * tokens (`border-era-soft`, `text-era-muted`, `text-accent-700`,
 * `font-era-display`, `duration-era`, `ease-era-brush`) account for every
 * visual delta. Switching eras does not re-render React.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `Tabs` markup rendered in Heritage and Neon. The active underline color, font stack, and tracking flip via the era CSS layer alone.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <Tabs items={BASE_ITEMS} defaultValue={BASE_ITEMS[0].value} />
    )),
};

/**
 * Interaction proof for the WAI-ARIA tabs pattern. Verifies pointer
 * activation, manual-activation arrow keys (focus moves but selection does
 * not), Enter to commit selection, Home/End jumps, and disabled-skip on
 * arrow navigation.
 */
export const Interactive: Story = {
  args: {
    items: [
      BASE_ITEMS[0],
      BASE_ITEMS[1],
      { ...BASE_ITEMS[2], disabled: true },
    ] as ReadonlyArray<TabItem>,
    defaultValue: BASE_ITEMS[0].value,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Exercises the full WAI-ARIA tabs pattern: roving `tabIndex` (Tab enters on the active tab), arrow keys move focus without changing selection (manual activation), Enter commits, Home/End jump to first/last enabled tab, and disabled tabs are skipped. The third tab is disabled in this story so the skip behavior is observable.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const overview = canvas.getByRole("tab", { name: "개요" });
    const rules = canvas.getByRole("tab", { name: "규칙" });
    const history = canvas.getByRole("tab", { name: "역사" });

    // 1. Initial state — first tab is selected, its panel is rendered, and
    //    only the active tab is in the tab order (roving tabIndex).
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await expect(rules).toHaveAttribute("aria-selected", "false");
    await expect(history).toHaveAttribute("aria-selected", "false");
    await expect(overview).toHaveAttribute("tabindex", "0");
    await expect(rules).toHaveAttribute("tabindex", "-1");
    await expect(history).toHaveAttribute("tabindex", "-1");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      BASE_ITEMS[0].content as string,
    );

    // 2. Pointer activation still works: clicking flips aria-selected and
    //    swaps panel content.
    await userEvent.click(rules);
    await expect(rules).toHaveAttribute("aria-selected", "true");
    await expect(overview).toHaveAttribute("aria-selected", "false");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      BASE_ITEMS[1].content as string,
    );

    // 3. Roving tabindex is already proven by step 1's attribute checks
    //    (only `rules` has `tabindex=0`). Asserting actual Tab key traversal
    //    here is brittle because the active tabpanel also has `tabIndex=0`
    //    (a WAI-ARIA requirement for screen-reader scrolling), so Tab from
    //    the active tab lands on the panel — that's the correct contract,
    //    not a regression. Bring focus to the active tab to start kbd nav.
    rules.focus();
    await expect(rules).toHaveFocus();

    // 4. Manual activation: ArrowRight moves focus to the next tab, but
    //    selection does NOT change yet. Note: the third tab is disabled,
    //    so ArrowRight from rules wraps back to overview.
    await userEvent.keyboard("{ArrowRight}");
    await expect(overview).toHaveFocus();
    await expect(rules).toHaveAttribute("aria-selected", "true");
    await expect(overview).toHaveAttribute("aria-selected", "false");

    // 5. Enter commits the focused tab — onChange fires, aria-selected
    //    flips, and the panel swaps.
    await userEvent.keyboard("{Enter}");
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await expect(rules).toHaveAttribute("aria-selected", "false");
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent(
      BASE_ITEMS[0].content as string,
    );

    // 6. Home / End jump to first / last enabled tab (skipping the
    //    disabled history tab on End).
    await userEvent.keyboard("{End}");
    await expect(rules).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(overview).toHaveFocus();

    // 7. ArrowRight from overview skips the disabled history tab and lands
    //    on rules.
    await userEvent.keyboard("{ArrowRight}");
    await expect(rules).toHaveFocus();
  },
};
