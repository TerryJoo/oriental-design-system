import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Accordion, type AccordionItemData } from "@/components/Accordion";
import { Button } from "@/components/Button";
import { Stack } from "@/components/Stack";
import { Tag } from "@/components/Tag";
import { boolArg, bothEras } from "./_shared/argTypes";

/**
 * Three short items used by the simple stories. Mutable copies are made
 * inside each story so toggling `defaultOpen` etc. doesn't bleed across
 * Storybook re-renders.
 */
const BASE_ITEMS: ReadonlyArray<AccordionItemData> = [
  {
    value: "rules",
    title: "규칙",
    content:
      "각 차례마다 한 번씩 행동할 수 있으며, 행동을 마치면 다음 플레이어에게 차례가 넘어갑니다.",
  },
  {
    value: "win",
    title: "승리 조건",
    content: "상대의 모든 자원을 소진시키거나 본진을 점령하면 승리합니다.",
  },
  {
    value: "lose",
    title: "패배 조건",
    content: "본진이 점령당하거나 자원이 모두 소진되면 패배합니다.",
  },
];

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Accordion is a vertically stacked, collapsible panel list. It supports both " +
          "single-open (`multiple={false}`) and multi-open (`multiple={true}`, the default) " +
          "modes, plus controlled (`value` + `onChange`) and uncontrolled (`defaultOpen` per " +
          "item) usage. Each header is a real `<button>` with `aria-expanded` and " +
          '`aria-controls` pointing at its panel; the panel carries `role="region"` and ' +
          "`aria-labelledby` back to its trigger, so screen readers announce the panel by " +
          "its trigger label. Closed panels use the native `hidden` attribute, removing them " +
          "from both the accessibility tree and the tab order. Triggers are reachable via " +
          "Tab and activated with Enter/Space per the WAI-ARIA accordion pattern. " +
          "Era-aware tokens (`bg-era-raised`, `border-era`, `border-era-soft`, " +
          "`duration-era`, `ease-era-brush`) make the component flip cleanly between " +
          "Heritage and Neon without re-rendering React. " +
          "Known gap (deferred to Wave 5b2): Up/Down/Home/End arrow-key navigation between " +
          "triggers is not yet implemented — Tab/Shift+Tab is the only keyboard path today.",
      },
    },
  },
  argTypes: {
    multiple: boolArg(
      "Allow multiple panels to be open simultaneously. Defaults to `true`.",
    ),
  },
  args: {
    multiple: true,
    items: BASE_ITEMS,
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof Accordion>;

/**
 * Default uncontrolled accordion. No items are pre-expanded; `multiple`
 * defaults to `true` so users can open every panel independently.
 */
export const Default: Story = {
  args: {
    items: BASE_ITEMS,
  },
};

/**
 * Single-open mode. Opening a new panel automatically closes the previously
 * open one.
 */
export const Single: Story = {
  args: {
    multiple: false,
    items: BASE_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "With `multiple={false}` the accordion behaves like a radio group: only one panel can be open at a time.",
      },
    },
  },
};

/**
 * Multi-open mode (the default). Both panels can be open at once.
 */
export const Multiple: Story = {
  args: {
    multiple: true,
    items: BASE_ITEMS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "With `multiple={true}` (the default) every panel toggles independently and any number can be open simultaneously.",
      },
    },
  },
};

/**
 * Uncontrolled accordion with two items pre-expanded via the per-item
 * `defaultOpen` flag.
 */
export const DefaultExpanded: Story = {
  args: {
    items: [
      { ...BASE_ITEMS[0], defaultOpen: true },
      BASE_ITEMS[1],
      { ...BASE_ITEMS[2], defaultOpen: true },
    ] as ReadonlyArray<AccordionItemData>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Items can be opened on mount via `defaultOpen` per item. The accordion remains uncontrolled — internal state takes over after the first user toggle.",
      },
    },
  },
};

/**
 * Fully controlled accordion. External buttons drive expand-all and
 * collapse-all by writing to the `value` prop directly.
 */
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass both `value` and `onChange` to drive the accordion from outside React state. The Expand all / Collapse all buttons demonstrate writing to `value` directly.",
      },
    },
  },
  render: (args) => {
    const ControlledDemo = () => {
      const [open, setOpen] = useState<ReadonlyArray<string>>(["rules"]);
      const allValues = BASE_ITEMS.map((it) => it.value);
      return (
        <Stack direction="column" gap="3" style={{ width: 480 }}>
          <Stack direction="row" gap="2" align="center">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setOpen(allValues)}
              data-testid="expand-all"
            >
              Expand all
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setOpen([])}
              data-testid="collapse-all"
            >
              Collapse all
            </Button>
            <span className="text-xs text-era-muted">
              open: [{open.join(", ") || "—"}]
            </span>
          </Stack>
          <Accordion
            {...args}
            items={BASE_ITEMS}
            value={open}
            onChange={setOpen}
          />
        </Stack>
      );
    };
    return <ControlledDemo />;
  },
};

/**
 * One item is disabled; its trigger is not focusable via Tab and ignores
 * pointer activation. The remaining items behave normally.
 */
export const WithDisabledItem: Story = {
  args: {
    items: [
      BASE_ITEMS[0],
      { ...BASE_ITEMS[1], disabled: true },
      BASE_ITEMS[2],
    ] as ReadonlyArray<AccordionItemData>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The middle item is disabled. Tab moves directly from the first trigger to the third, skipping the disabled button — a native `<button disabled>` is not in the tab order.",
      },
    },
  },
};

/**
 * Bodies can hold any React content. This story embeds Tags, Buttons, and
 * a nested Stack to mimic a realistic detail panel.
 */
export const RichContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Accordion bodies accept any `ReactNode`, so Tags, Buttons, and nested layout primitives compose naturally inside a panel.",
      },
    },
  },
  args: {
    items: [
      {
        value: "summary",
        title: "프로젝트 요약",
        defaultOpen: true,
        content: (
          <Stack direction="column" gap="3">
            <Stack direction="row" gap="2" wrap>
              <Tag size="sm">React</Tag>
              <Tag size="sm">Tailwind</Tag>
              <Tag size="sm">Heritage</Tag>
              <Tag size="sm">Neon</Tag>
            </Stack>
            <p className="text-sm text-era-muted">
              이 패널은 태그, 본문, 그리고 액션 버튼을 함께 보여줍니다.
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
        title: "주요 지표",
        content: (
          <Stack direction="row" gap="4">
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
          </Stack>
        ),
      },
    ] as ReadonlyArray<AccordionItemData>,
  },
};

/**
 * The body uses `max-h-[400px]` when open, which means very long content
 * may scroll inside the panel rather than expanding without bound. This
 * story makes that behaviour visible.
 */
export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When body content exceeds the open `max-h-[400px]` cap the body scrolls instead of pushing the page. This story renders a ten-paragraph block to demonstrate the cap.",
      },
    },
  },
  args: {
    items: [
      {
        value: "essay",
        title: "긴 본문",
        defaultOpen: true,
        content: (
          <Stack direction="column" gap="3">
            {Array.from({ length: 10 }).map((_, i) => (
              <p key={i} className="text-sm text-era-muted">
                {i + 1}. 단락 — 오방색은 청·적·황·백·흑의 다섯 가지 빛깔로,
                동·남·중앙·서·북의 다섯 방위와 사계절의 흐름을 동시에
                상징합니다. 디자인 시스템은 이 다섯 방위를 토큰으로 추상화하여
                Heritage와 Neon 두 시대층이 같은 의미를 다른 표면 위에서
                구현하도록 합니다.
              </p>
            ))}
          </Stack>
        ),
      },
      BASE_ITEMS[1],
    ] as ReadonlyArray<AccordionItemData>,
  },
};

/**
 * The header `title` accepts any `ReactNode`. This story renders rich
 * trigger content (icon + text + meta tag) entirely through `title`.
 *
 * Note: the component does not expose a separate `renderTrigger` API —
 * any layout you want inside the trigger goes into `title`.
 */
const TitleWithMeta = ({
  icon,
  label,
  meta,
}: {
  icon: ReactNode;
  label: string;
  meta: string;
}) => (
  <span className="flex items-center gap-2">
    <span aria-hidden="true" className="text-base text-era-muted">
      {icon}
    </span>
    <span>{label}</span>
    <Tag size="sm">{meta}</Tag>
  </span>
);

export const CustomTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Although Accordion does not expose a `renderTrigger` slot, the per-item `title` accepts arbitrary `ReactNode`. Compose icons, labels, and meta tags directly into `title`.",
      },
    },
  },
  args: {
    items: [
      {
        value: "general",
        title: <TitleWithMeta icon="◆" label="일반 설정" meta="필수" />,
        content: "기본 환경설정 항목들입니다.",
      },
      {
        value: "advanced",
        title: <TitleWithMeta icon="◇" label="고급 설정" meta="선택" />,
        content: "전문 사용자를 위한 옵션입니다.",
      },
    ] as ReadonlyArray<AccordionItemData>,
  },
};

/**
 * Heritage / Neon side-by-side comparison. Both panels share the same
 * markup; the era-aware tokens (`bg-era-raised`, `border-era`,
 * `border-era-soft`, `text-era-primary`) account for every visual delta.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `Accordion` markup rendered in Heritage and Neon. Surfaces, borders, and the open chevron color all flip via the era CSS layer — no React re-render involved.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <Accordion
        items={
          [
            { ...BASE_ITEMS[0], defaultOpen: true },
            BASE_ITEMS[1],
            BASE_ITEMS[2],
          ] as ReadonlyArray<AccordionItemData>
        }
      />
    )),
};

/**
 * Interaction test. Verifies:
 *  1. A closed trigger has `aria-expanded="false"` and clicking it flips it
 *     to `"true"`.
 *  2. Tab moves to the next trigger and pressing Enter expands it.
 *  3. In single-open mode, expanding a new item collapses the previously
 *     open one.
 *  4. WAI-ARIA wiring: trigger `aria-controls` matches the panel `id`,
 *     panel `aria-labelledby` matches the trigger `id`, and closed panels
 *     are `hidden` (out of the a11y tree and tab order).
 */
export const Interactive: Story = {
  args: {
    multiple: false,
    items: BASE_ITEMS,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated interaction proof: click expands, Tab + Enter expands the next trigger, and single-open mode collapses the previous panel when a new one opens. Also asserts WAI-ARIA wiring (`aria-controls` ↔ panel `id`, `aria-labelledby` ↔ trigger `id`) and that closed panels carry the native `hidden` attribute.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const rulesTrigger = canvas.getByRole("button", { name: /규칙/ });
    const winTrigger = canvas.getByRole("button", { name: /승리 조건/ });
    const loseTrigger = canvas.getByRole("button", { name: /패배 조건/ });

    // 1. Initial state: nothing is expanded; every panel is hidden, so no
    //    `role="region"` is exposed in the a11y tree.
    await expect(rulesTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(winTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(loseTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryAllByRole("region")).toHaveLength(0);

    // 2. Click the first trigger — its panel becomes visible AND named.
    await userEvent.click(rulesTrigger);
    await expect(rulesTrigger).toHaveAttribute("aria-expanded", "true");

    // The opened panel is queryable by its accessible name (the trigger
    // label) thanks to aria-labelledby.
    const rulesRegion = canvas.getByRole("region", { name: /규칙/ });
    // aria-controls on the trigger must point at the open panel.
    await expect(rulesTrigger.getAttribute("aria-controls")).toBe(
      rulesRegion.id,
    );
    // The panel's aria-labelledby must point back at the trigger.
    await expect(rulesRegion.getAttribute("aria-labelledby")).toBe(
      rulesTrigger.id,
    );
    // Other panels remain hidden / out of the a11y tree.
    await expect(canvas.queryAllByRole("region")).toHaveLength(1);

    // 3. Tab to the next trigger and press Enter to activate it.
    rulesTrigger.focus();
    await userEvent.tab();
    await expect(winTrigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(winTrigger).toHaveAttribute("aria-expanded", "true");

    // 4. Single-open mode: opening "win" must collapse "rules".
    await expect(rulesTrigger).toHaveAttribute("aria-expanded", "false");

    // 5. The previously open "rules" panel is now hidden again, and only
    //    the "승리 조건" region is in the a11y tree.
    await expect(canvas.queryAllByRole("region")).toHaveLength(1);
    canvas.getByRole("region", { name: /승리 조건/ });
  },
};
