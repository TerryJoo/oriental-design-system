import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useRef } from "react";
import { Radio } from "@/components/Radio";
import { radioDotSizes } from "@/components/Radio/Radio.styles";
import { bothEras, boolArg, radioArg } from "./_shared/argTypes";

const SIZE_OPTIONS = Object.keys(radioDotSizes) as ReadonlyArray<
  keyof typeof radioDotSizes
>;

const meta = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Radio is a forwardRef-wrapped native `<input type="radio">` styled with era-aware tokens. Multiple radios coordinate via a shared `name` attribute (the canonical radio-group pattern), and the visible dot is rendered as a sibling element so the underlying input stays accessible to assistive tech.',
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
    label: "Heritage",
    name: "preview",
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {SIZE_OPTIONS.map((size) => (
        <Radio
          key={size}
          size={size}
          name={`sizes-${size}`}
          label={`size: ${size}`}
          defaultChecked
        />
      ))}
    </div>
  ),
};

/**
 * Radios coordinate via shared `name`. This is the canonical "radio group"
 * pattern: multiple <Radio> elements with the same name attribute.
 */
export const Group: Story = {
  render: () => (
    <fieldset className="flex flex-col gap-2 rounded-md border border-era-soft p-4">
      <legend className="px-2 text-xs uppercase tracking-wide text-era-muted">
        Choose an era
      </legend>
      <Radio
        name="era-preview"
        value="heritage"
        label="Heritage (과거)"
        defaultChecked
      />
      <Radio name="era-preview" value="neon" label="Neon (현대)" />
      <Radio name="era-preview" value="auto" label="Auto" disabled />
    </fieldset>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Radio name="states" value="a" label="Unchecked" />
      <Radio name="states" value="b" label="Checked" defaultChecked />
      <Radio name="states-c" value="c" label="Disabled" disabled />
      <Radio
        name="states-d"
        value="d"
        label="Disabled checked"
        disabled
        defaultChecked
      />
    </div>
  ),
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
          "Same markup rendered in Heritage and Neon to verify era-aware tokens flip cleanly without any React re-render.",
      },
    },
  },
  render: () =>
    bothEras(({ era }) => (
      <div className="flex flex-col gap-2">
        <Radio
          name={`era-${era}`}
          value="a"
          label={`${era} option 1`}
          defaultChecked
        />
        <Radio name={`era-${era}`} value="b" label={`${era} option 2`} />
      </div>
    )),
};

/**
 * Demonstrates that `Radio` accepts a forwarded ref to the underlying
 * `<input>`. Useful for imperative `focus()` or for reading checked state
 * outside React's render flow.
 */
export const WithForwardedRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Radio` forwards its ref to the underlying native `<input type="radio">`. The button below calls `inputRef.current.focus()` to prove the ref is wired through.',
      },
    },
  },
  render: () => {
    function RefDemo() {
      const inputRef = useRef<HTMLInputElement>(null);
      return (
        <div className="flex flex-col gap-3">
          <Radio
            ref={inputRef}
            name="ref-demo"
            value="a"
            label="Focus me via ref"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="self-start rounded-md border border-era-soft bg-era-base px-3 py-1.5 text-sm text-era-primary"
          >
            Focus the radio
          </button>
        </div>
      );
    }
    return <RefDemo />;
  },
};

/**
 * Automated proof that pointer activation flows through to the underlying
 * input and that `onChange` fires.
 */
export const Interactive: Story = {
  args: {
    onChange: fn(),
    label: "Interactive radio",
    name: "interactive-radio",
    value: "alpha",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies pointer activation triggers `onChange` and that focus reaches the underlying input for keyboard users.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Radio's input is sr-only; query by accessible role + accessible name.
    const radio = canvas.getByRole("radio", { name: /Interactive radio/i });

    // 1. Pointer activation triggers onChange and toggles checked state.
    await userEvent.click(radio);
    await expect(args.onChange).toHaveBeenCalled();
    await waitFor(() => expect(radio).toBeChecked());

    // 2. Imperative focus reaches the underlying input.
    radio.focus();
    await waitFor(() => expect(radio).toHaveFocus());
  },
};
