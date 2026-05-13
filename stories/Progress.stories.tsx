import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Progress, progressTrack } from "@/components/Progress";
import { boolArg, bothEras, radioArg } from "./_shared/argTypes";

const SIZE_OPTIONS = Object.keys(progressTrack) as ReadonlyArray<
  keyof typeof progressTrack
>;

const meta = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`Progress` is a determinate or indeterminate progress bar with `sm` / `md` / `lg` track heights. " +
          "It exposes `role='progressbar'` with `aria-valuenow` (when determinate) or omits the value (when indeterminate) and always carries an `aria-label`.",
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: radioArg(SIZE_OPTIONS, "Track height token"),
    indeterminate: boolArg("Show looping animation instead of a value"),
    label: { control: "text" },
  },
  args: {
    value: 60,
    size: "md",
    indeterminate: false,
    label: "Progress",
  },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {SIZE_OPTIONS.map((size) => (
        <div key={size} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-era-muted">
            size={size}
          </span>
          <Progress value={65} size={size} label={`Progress (${size})`} />
        </div>
      ))}
    </div>
  ),
};

export const Values: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {[0, 25, 50, 75, 100].map((value) => (
        <div key={value} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-era-muted">
            <span>Upload</span>
            <span>{value}%</span>
          </div>
          <Progress value={value} label={`Upload ${value}%`} />
        </div>
      ))}
    </div>
  ),
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: "Loading…" },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-era-muted font-era-body">번역 중</span>
        <span className="text-era-primary font-mono">42%</span>
      </div>
      <Progress value={42} label="번역 진행률" />
    </div>
  ),
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage and Neon side-by-side at every size token, so designers can verify the gradient fill and track ink read correctly under both eras.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-col gap-3">
        {SIZE_OPTIONS.map((size) => (
          <Progress
            key={size}
            value={65}
            size={size}
            label={`Progress (${size})`}
          />
        ))}
      </div>
    )),
};

// Preserved alias for backward link compatibility.
export const EraComparison: Story = EraCompare;

export const Interactive: Story = {
  args: {
    value: 73,
    label: "Upload",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that the determinate progress bar reports the configured value via ARIA — `aria-valuenow` matches `value`, and `aria-label` is exposed.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");

    await expect(bar).toHaveAttribute("aria-valuenow", String(args.value));
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
    await expect(bar).toHaveAttribute("aria-label", args.label);
  },
};
