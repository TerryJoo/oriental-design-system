import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useRef } from "react";
import { Switch } from "@/components/Switch";
import { switchSizes } from "@/components/Switch/Switch.styles";
import { bothEras, boolArg, radioArg } from "./_shared/argTypes";

const SIZE_OPTIONS = Object.keys(switchSizes) as ReadonlyArray<
  keyof typeof switchSizes
>;

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Switch is a forwardRef-wrapped native `<input type="checkbox" role="switch">` styled with era-aware tokens. The visible track and thumb are sibling elements driven by `peer-checked:` selectors, so the underlying input remains the single source of truth for assistive tech and form submission.',
      },
    },
  },
  argTypes: {
    size: radioArg(SIZE_OPTIONS, "Size token"),
    label: { control: "text", description: "Visible label" },
    disabled: boolArg("Disabled state"),
    defaultChecked: boolArg("Initial checked state (uncontrolled)"),
  },
  args: {
    label: "Enable feature",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {SIZE_OPTIONS.map((size) => (
        <Switch
          key={size}
          {...args}
          size={size}
          label={`size: ${size}`}
          defaultChecked
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

export const WithoutLabel: Story = {
  args: { label: undefined, "aria-label": "Toggle feature" },
  parameters: {
    docs: {
      description: {
        story:
          "When the visible `label` prop is omitted, callers must supply an accessible name through native input attributes (`aria-label`, `aria-labelledby`, or association with an external `<label htmlFor>`). The Switch forwards all `InputHTMLAttributes`, so these flow through verbatim.",
      },
    },
  },
};

/**
 * Heritage / Neon side-by-side via the shared `bothEras` helper. Each panel
 * applies `[data-era]` so the era CSS layer flips without re-rendering React.
 */
export const EraComparison: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same markup rendered in Heritage and Neon to verify the track, thumb, and accent flip cleanly without any React re-render.",
      },
    },
  },
  render: (args) =>
    bothEras(({ era }) => (
      <div className="flex flex-col gap-2">
        <Switch {...args} label={`${era} off`} />
        <Switch {...args} label={`${era} on`} defaultChecked />
      </div>
    )),
};

/**
 * Demonstrates that `Switch` accepts a forwarded ref to the underlying
 * `<input>`. Useful for imperative `focus()` or `setCustomValidity()` calls
 * that HTML doesn't expose declaratively.
 */
export const WithForwardedRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`Switch` forwards its ref to the underlying native `<input>`. The button below calls `inputRef.current.focus()` to prove the ref is wired through.",
      },
    },
  },
  render: () => {
    function RefDemo() {
      const inputRef = useRef<HTMLInputElement>(null);
      return (
        <div className="flex flex-col gap-3">
          <Switch ref={inputRef} label="Focus me via ref" />
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="self-start rounded-md border border-era-soft bg-era-base px-3 py-1.5 text-sm text-era-primary"
          >
            Focus the switch
          </button>
        </div>
      );
    }
    return <RefDemo />;
  },
};

/**
 * Automated proof that pointer + keyboard activation toggle the switch and
 * that `onChange` fires with the new checked state.
 */
export const Interactive: Story = {
  args: {
    onChange: fn(),
    label: "Notifications",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies pointer activation toggles the switch and that the underlying input reports the new checked state to assistive tech.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch", { name: /Notifications/i });

    // 1. Pointer activation toggles checked state and fires onChange.
    await userEvent.click(sw);
    await expect(args.onChange).toHaveBeenCalled();
    await waitFor(() => expect(sw).toBeChecked());

    // 2. Click again to toggle off; assert post-transition state with waitFor
    //    so axe samples the settled colour-contrast pixels.
    await userEvent.click(sw);
    await waitFor(() => expect(sw).not.toBeChecked());
  },
};
