import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Skeleton, skeletonShapeMap } from "@/components/Skeleton";
import { bothEras, radioArg } from "./_shared/argTypes";

const shapeOptions = Object.keys(skeletonShapeMap) as Array<
  keyof typeof skeletonShapeMap
>;

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Skeleton is a presentational placeholder for content that is still loading. The component renders a `<span>` with `aria-busy="true"` and `aria-live="polite"`, and uses a transform-free background-position shimmer (no opacity ramp) so axe colour-contrast sampling stays stable.',
      },
    },
  },
  argTypes: {
    shape: radioArg(shapeOptions, "Shape token"),
    width: { control: "text", description: "CSS width (number → px)" },
    height: { control: "text", description: "CSS height (number → px)" },
  },
  args: {
    shape: "line",
    width: 240,
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * Every shape variant rendered side-by-side. `circle` for avatar placeholders,
 * `rect` for image / card placeholders, `line` for text rows.
 */
export const Shapes: Story = {
  render: () => (
    <div className="flex w-[480px] items-center gap-4">
      <Skeleton shape="circle" width={48} height={48} />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton shape="line" width="80%" />
        <Skeleton shape="line" width="60%" />
      </div>
      <Skeleton shape="rect" width={96} height={48} />
    </div>
  ),
};

export const TextBlock: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-2">
      <Skeleton shape="line" width="70%" />
      <Skeleton shape="line" width="95%" />
      <Skeleton shape="line" width="85%" />
      <Skeleton shape="line" width="50%" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="border-era flex w-[320px] flex-col gap-3 rounded-card bg-era-raised p-4">
      <Skeleton shape="rect" width="100%" height={140} />
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" width={40} height={40} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton shape="line" width="60%" />
          <Skeleton shape="line" width="40%" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side via the shared `bothEras` helper. Each panel
 * applies `[data-era]` so the shimmer gradient picks up the era's surface
 * tokens without any React re-render.
 */
export const EraComparison: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same markup rendered in Heritage and Neon to verify the shimmer gradient picks up era-aware surface tokens cleanly.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex w-[320px] items-center gap-3">
        <Skeleton shape="circle" width={40} height={40} />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton shape="line" width="80%" />
          <Skeleton shape="line" width="60%" />
        </div>
      </div>
    )),
};

/**
 * Skeleton is presentational — there is no interactive behaviour to drive.
 * This story instead asserts the assistive-tech contract (`aria-busy`,
 * `aria-live`) so any regression to those attributes fails the test runner
 * deterministically.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Skeleton is presentational, so this play function asserts the live-region contract (`aria-busy="true"`, `aria-live="polite"`) instead of pointer/keyboard interaction.',
      },
    },
  },
  render: () => (
    <Skeleton shape="line" width={240} data-testid="skeleton-target" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const node = canvas.getByTestId("skeleton-target");
    await expect(node).toHaveAttribute("aria-busy", "true");
    await expect(node).toHaveAttribute("aria-live", "polite");
  },
};
