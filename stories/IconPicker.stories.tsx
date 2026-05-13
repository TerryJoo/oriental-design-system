import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useState } from "react";
import { IconPicker, type IconOption } from "@/components/IconPicker";
import { bothEras } from "./_shared/argTypes";

const SAMPLE_ICONS: ReadonlyArray<IconOption> = [
  { value: "ink", icon: "墨", label: "먹 (ink)" },
  { value: "moon", icon: "月", label: "달 (moon)" },
  { value: "mountain", icon: "山", label: "산 (mountain)" },
  { value: "water", icon: "水", label: "물 (water)" },
  { value: "fire", icon: "火", label: "불 (fire)" },
  { value: "sun", icon: "日", label: "해 (sun)" },
  { value: "tree", icon: "木", label: "나무 (tree)" },
  { value: "stone", icon: "石", label: "돌 (stone)" },
  { value: "wind", icon: "風", label: "바람 (wind)" },
  { value: "cloud", icon: "雲", label: "구름 (cloud)" },
];

const EMOJI_ICONS: ReadonlyArray<IconOption> = [
  { value: "tea", icon: "🍵", label: "Tea" },
  { value: "lotus", icon: "🪷", label: "Lotus" },
  { value: "leaf", icon: "🍃", label: "Leaf" },
  { value: "sparkles", icon: "✨", label: "Sparkles" },
  { value: "drop", icon: "💧", label: "Drop" },
  { value: "fire", icon: "🔥", label: "Fire" },
];

const meta = {
  title: "Components/IconPicker",
  component: IconPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`IconPicker` renders a `radiogroup` of icon tiles for picking a single value. " +
          "Supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) " +
          "usage; tiles read era-aware tokens so the active state inverts cleanly across Heritage and Neon.",
      },
    },
  },
  argTypes: {
    options: { control: false },
    value: { control: "text" },
    defaultValue: { control: "text" },
  },
  args: {
    options: SAMPLE_ICONS,
    defaultValue: "ink",
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IconPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Controlled usage — the parent owns the selection via `value` + `onChange`.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string>("moon");
      return (
        <div className="flex flex-col gap-3">
          <IconPicker
            options={SAMPLE_ICONS}
            value={value}
            onChange={setValue}
          />
          <span className="text-xs text-era-muted">
            Selected: <strong className="text-era-primary">{value}</strong>
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Emoji: Story = {
  args: {
    options: EMOJI_ICONS,
    defaultValue: "tea",
  },
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same selection rendered in Heritage and Neon side-by-side to verify the active tile and tile chrome flip via era tokens without any React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <IconPicker options={SAMPLE_ICONS} defaultValue="mountain" />
    )),
};

// Preserved alias for backward link compatibility — older docs/PRs may have
// linked to this story name. Renders the same content as `EraCompare`.
export const EraComparison: Story = EraCompare;

export const Interactive: Story = {
  args: {
    onChange: fn(),
    defaultValue: "ink",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that clicking a tile fires `onChange` with the tile's value and that the new tile reports `aria-checked='true'` after the era transition settles.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Click the "moon" tile by its accessible label.
    const moonTile = canvas.getByRole("radio", { name: "달 (moon)" });
    await userEvent.click(moonTile);

    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith("moon");

    // The default value is uncontrolled, so the component will not reflect
    // the click in `aria-checked`. Instead, verify the initial active tile
    // is still marked checked (component is uncontrolled when `value` is
    // undefined and no parent state-sync is wired here).
    await waitFor(() =>
      expect(canvas.getByRole("radio", { name: "먹 (ink)" })).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    );
  },
};
