import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Badge } from "@/components/Badge";
import type { BadgeShape, BadgeSize, BadgeVariant } from "@/components/Badge";
import { boolArg, bothEras, radioArg, selectArg } from "./_shared/argTypes";

const VARIANT_OPTIONS: readonly BadgeVariant[] = [
  "default",
  "primary",
  "success",
  "warning",
  "error",
  "info",
] as const;

const SIZE_OPTIONS: readonly BadgeSize[] = ["sm", "md", "lg"] as const;
const SHAPE_OPTIONS: readonly BadgeShape[] = [
  "rounded",
  "pill",
  "square",
] as const;

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Badge renders a compact status chip tuned for both eras. Variants map to " +
          "intent palettes (default / primary / success / warning / error / info), each " +
          "with WCAG AA contrast on Heritage parchment and Neon glass surfaces. Optional " +
          "`dot` and `pulse` props add a leading status dot and a subtle pulse animation " +
          "for live-state indicators.",
      },
    },
  },
  argTypes: {
    variant: selectArg(VARIANT_OPTIONS, "Tonal variant"),
    size: radioArg(SIZE_OPTIONS, "Size token"),
    shape: radioArg(SHAPE_OPTIONS, "Border-radius shape"),
    dot: boolArg("Show leading status dot"),
    pulse: boolArg("Enable subtle pulse animation"),
  },
  args: { children: "Badge" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: "Every supported variant rendered side-by-side.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      {VARIANT_OPTIONS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {SIZE_OPTIONS.map((size) => (
        <Badge key={size} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      {SHAPE_OPTIONS.map((shape) => (
        <Badge key={shape} shape={shape}>
          {shape}
        </Badge>
      ))}
    </div>
  ),
};

export const WithDot: Story = {
  args: { dot: true, variant: "success", children: "Online" },
};

export const Pulsing: Story = {
  args: { pulse: true, variant: "primary", children: "Live" },
};

export const LongText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Wave 5b2-C3 overflow proof. The badge caps at `max-w-[16rem]` and `truncate` clamps the label to a single line with an ellipsis when content overflows. The narrower wrapper here surfaces the ellipsis behavior on a 30+ character label; the optional dot retains its fixed dimensions (`shrink-0`) so it stays visible alongside the truncated text.",
      },
    },
  },
  render: () => (
    <div style={{ width: 220 }} className="flex flex-col gap-3">
      <Badge variant="primary">구한말-궁궐의례-국상-도구-임시-설명자료</Badge>
      <Badge variant="success" dot>
        Online · 사용자가 굉장히-긴-닉네임을-쓰고-있는-상태
      </Badge>
    </div>
  ),
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side: each variant's tonal fill flips through era-aware tokens with no React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-wrap items-center gap-2">
        {VARIANT_OPTIONS.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
    )),
};

export const Interactive: Story = {
  args: { dot: true, variant: "success", children: "Online" },
  parameters: {
    docs: {
      description: {
        story:
          "Asserts the badge renders its children as accessible text and exposes the leading dot via `data-testid` when `dot` is enabled.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Online")).toBeInTheDocument();
    await expect(canvas.getByTestId("badge-dot")).toBeInTheDocument();
  },
};
