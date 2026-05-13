import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Spinner, spinnerSizes } from "@/components/Spinner";
import { bothEras, radioArg } from "./_shared/argTypes";

const sizeOptions = Object.keys(spinnerSizes) as Array<
  keyof typeof spinnerSizes
>;

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Spinner is a presentational loading indicator. The component renders a `<span role="status" aria-live="polite">` with a visually hidden label so assistive tech announces progress; the visible ring uses an era-aware accent colour for the moving segment.',
      },
    },
  },
  argTypes: {
    size: radioArg(sizeOptions, "Size token"),
    label: {
      control: "text",
      description: "Localised label exposed to assistive tech (sr-only)",
    },
  },
  args: {
    size: "md",
    label: "Loading",
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {sizeOptions.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Spinner size={size} />
          <span className="text-xs text-era-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const OnSurface: Story = {
  render: () => (
    <div className="border-era flex items-center gap-4 rounded-card bg-era-raised p-4">
      <Spinner size="sm" />
      <span className="font-era-body text-sm text-era-primary">
        Saving changes…
      </span>
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side via the shared `bothEras` helper. Each panel
 * applies `[data-era]` so the spinner picks up era-aware accent and surface
 * tokens without any React re-render.
 */
export const EraComparison: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same markup rendered in Heritage and Neon to verify the spinner ring and accent flip cleanly.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex items-center gap-4">
        {sizeOptions.map((size) => (
          <Spinner key={size} size={size} />
        ))}
      </div>
    )),
};

/**
 * Spinner is presentational — there is no interactive behaviour to drive.
 * This play function asserts the live-region contract (`role="status"`,
 * `aria-live="polite"`) and that the localised sr-only label is rendered.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Spinner is presentational, so this play function asserts the live-region contract (`role="status"`, `aria-live="polite"`) and that the sr-only label reaches assistive tech.',
      },
    },
  },
  render: () => <Spinner size="md" label="Loading data" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const srLabel = canvas.getByText("Loading data");
    await expect(srLabel).toHaveClass("sr-only");
    const status = srLabel.closest('[role="status"]');
    if (!status) throw new Error("Spinner status wrapper not found");
    await expect(status).toHaveAttribute("aria-live", "polite");
  },
};
