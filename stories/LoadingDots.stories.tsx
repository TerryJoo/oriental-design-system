import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { LoadingDots, loadingDotsSpeedMap } from "@/components/LoadingDots";
import { bothEras, radioArg } from "./_shared/argTypes";

const SPEED_OPTIONS = Object.keys(loadingDotsSpeedMap) as ReadonlyArray<
  keyof typeof loadingDotsSpeedMap
>;

const meta = {
  title: "Components/LoadingDots",
  component: LoadingDots,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`LoadingDots` is a three-dot loading indicator with `slow` / `normal` / `fast` rhythms. " +
          "It announces itself to assistive tech via `role='status'` + `aria-label`, and the dot ink follows the era's `accent-600` token.",
      },
    },
  },
  argTypes: {
    speed: radioArg(SPEED_OPTIONS, "Animation speed"),
    label: { control: "text" },
  },
  args: {
    speed: "normal",
    label: "Loading",
  },
} satisfies Meta<typeof LoadingDots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Speeds: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every speed token rendered side-by-side so designers can pick the rhythm that matches the surrounding latency.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-6">
      {SPEED_OPTIONS.map((speed) => (
        <div key={speed} className="flex flex-col items-center gap-2">
          <LoadingDots speed={speed} label={`Loading (${speed})`} />
          <span className="text-xs text-era-muted">{speed}</span>
        </div>
      ))}
    </div>
  ),
};

export const InContext: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Inline usage next to a status string — the most common production placement (e.g. chat reply generation).",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3 p-4 rounded-card bg-era-raised border-era">
      <span className="text-sm text-era-primary font-era-body">
        Generating reply
      </span>
      <LoadingDots speed="normal" label="Generating reply" />
    </div>
  ),
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side. The dots inherit `accent-600` from each era so the rhythm reads correctly against either background.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex items-center gap-6">
        {SPEED_OPTIONS.map((speed) => (
          <LoadingDots key={speed} speed={speed} label={`Loading (${speed})`} />
        ))}
      </div>
    )),
};

// Preserved alias for backward link compatibility.
export const EraComparison: Story = EraCompare;

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that the live region exposes the configured `aria-label` to assistive tech via `role='status'`.",
      },
    },
  },
  args: {
    label: "Translating",
    speed: "normal",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");

    await expect(status).toHaveAttribute("aria-label", args.label);
    // Verify the three dots are rendered as the visible payload.
    await expect(status.children).toHaveLength(3);
  },
};
