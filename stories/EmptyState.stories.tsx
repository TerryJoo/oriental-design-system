import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { useRef } from "react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { bothEras } from "./_shared/argTypes";

const SampleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="36"
    height="36"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4h16v16H4z" />
    <path d="M4 9h16" />
    <path d="M9 4v16" />
  </svg>
);

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "EmptyState is a `forwardRef` placeholder block for empty/zero-result " +
          "screens. It renders an optional icon, an `<h4>` title, a muted " +
          "description, and a centered actions row. All three slots are " +
          "optional, so the same component covers icon-only, title-only, and " +
          "icon+title+description+actions layouts. Era-aware tokens carry the " +
          "dashed border, surface, and ink colors between Heritage and Neon.",
      },
    },
  },
  argTypes: {
    icon: { control: false },
    title: { control: "text" },
    description: { control: "text" },
    actions: { control: false },
  },
  args: {
    icon: <SampleIcon />,
    title: "결과가 없습니다",
    description: "검색어를 바꾸거나 필터를 조정해 보세요.",
  },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    actions: (
      <>
        <Button size="sm" variant="ghost">
          필터 초기화
        </Button>
        <Button size="sm" variant="primary">
          새 항목 추가
        </Button>
      </>
    ),
  },
};

export const TitleOnly: Story = {
  args: { description: undefined, icon: undefined },
};

export const IconOnly: Story = {
  args: {
    title: undefined,
    description: undefined,
    icon: <SampleIcon />,
  },
};

export const Emoji: Story = {
  args: {
    icon: <span className="text-4xl">🪷</span>,
    title: "수집된 항목이 없습니다",
    description: "첫 번째 컬렉션을 만들어 보세요.",
    actions: (
      <Button size="sm" variant="primary">
        컬렉션 만들기
      </Button>
    ),
  },
};

/**
 * Demonstrates that `EmptyState` forwards its ref to the outer wrapper
 * `<div>`. Useful for scrolling-into-view or measuring the empty block
 * inside a virtualized list.
 */
export const WithForwardedRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`EmptyState` forwards its ref to the outer wrapper element so " +
          "consumers can imperatively scroll the empty block into view, " +
          "measure it, or attach observers.",
      },
    },
  },
  render: () => {
    function RefDemo() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <div className="flex flex-col gap-2">
          <EmptyState
            ref={ref}
            icon={<SampleIcon />}
            title="Ref attached"
            description="The outer wrapper receives the forwarded ref."
          />
          <span className="font-mono text-xs text-era-muted">
            ref → outer &lt;div&gt; wrapper
          </span>
        </div>
      );
    }
    return <RefDemo />;
  },
};

/**
 * Heritage / Neon side-by-side via the shared `bothEras` helper.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `EmptyState` rendered in Heritage and Neon. The dashed border, surface, and ink all flip via the era CSS layer with no React re-render.",
      },
    },
  },
  render: () =>
    bothEras(({ era }) => (
      <EmptyState
        icon={<SampleIcon />}
        title={era === "heritage" ? "결과가 없습니다" : "No results"}
        description={
          era === "heritage"
            ? "다른 검색어를 시도해 보세요."
            : "Try a different keyword."
        }
        actions={
          <Button size="sm">
            {era === "heritage" ? "새로고침" : "Refresh"}
          </Button>
        }
      />
    )),
};

/**
 * Automated structural check: verifies that the title renders inside an
 * `<h4>` heading element so screen readers can list the empty state in the
 * page outline, and that an action button is reachable by its accessible
 * name.
 */
export const Interactive: Story = {
  args: {
    icon: <SampleIcon />,
    title: "결과가 없습니다",
    description: "검색어를 바꾸거나 필터를 조정해 보세요.",
    actions: (
      <Button size="sm" variant="primary">
        다시 시도
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that the title is exposed as a level-4 heading and that any rendered action is reachable by its accessible name.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. The title is rendered as an <h4> so it appears in the page outline.
    const heading = canvas.getByRole("heading", {
      level: 4,
      name: /결과가 없습니다/,
    });
    await expect(heading).toBeInTheDocument();

    // 2. The action button is reachable by its accessible name.
    const action = canvas.getByRole("button", { name: /다시 시도/ });
    await expect(action).toBeInTheDocument();
  },
};
