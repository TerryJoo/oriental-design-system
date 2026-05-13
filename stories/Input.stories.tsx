import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useEffect, useRef } from "react";
import { Input } from "@/components/Input";
import { inputSizes, inputVariants } from "@/components/Input/Input.styles";
import { bothEras, boolArg, radioArg, selectArg } from "./_shared/argTypes";

const SIZE_OPTIONS = Object.keys(inputSizes) as ReadonlyArray<
  keyof typeof inputSizes
>;
const VARIANT_OPTIONS = Object.keys(inputVariants) as ReadonlyArray<
  keyof typeof inputVariants
>;
const TYPE_OPTIONS = [
  "text",
  "email",
  "password",
  "number",
  "search",
  "url",
  "tel",
] as const;

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`Input` is a token-driven text field that forwards refs to the underlying `<input>` and exposes era-aware focus, hover, and error states. " +
          "Use the `variant='error'` slot to paint the AA-compliant error border without changing layout.",
      },
    },
  },
  argTypes: {
    inputSize: radioArg(SIZE_OPTIONS, "Size token"),
    variant: radioArg(VARIANT_OPTIONS, "Visual variant"),
    type: selectArg(TYPE_OPTIONS, "HTML input type"),
    disabled: boolArg("Disabled state"),
    placeholder: { control: "text" },
  },
  args: {
    placeholder: "Type something…",
    type: "text",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      {VARIANT_OPTIONS.map((variant) => (
        <Input
          key={variant}
          {...args}
          variant={variant}
          placeholder={`variant: ${variant}`}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-80 flex-col gap-3">
      {SIZE_OPTIONS.map((size) => (
        <Input
          key={size}
          {...args}
          inputSize={size}
          placeholder={`size: ${size}`}
        />
      ))}
    </div>
  ),
};

export const Types: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input type="text" placeholder="Text" />
      <Input type="email" placeholder="you@example.com" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Number" />
      <Input type="search" placeholder="Search…" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input placeholder="Default" />
      <Input placeholder="With value" defaultValue="design system" />
      <Input variant="error" defaultValue="invalid@" placeholder="Error" />
      <Input disabled placeholder="Disabled" />
      <Input
        disabled
        defaultValue="locked input"
        placeholder="Disabled with value"
      />
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side via the shared `bothEras` helper. Both panels
 * use [data-era] which the era CSS layer picks up — no React re-render needed.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same input rendered in Heritage and Neon to verify focus rings, borders, and placeholder ink flip via era tokens.",
      },
    },
  },
  render: (args) => bothEras(() => <Input {...args} placeholder="Era input" />),
};

// Preserved alias for backward link compatibility.
export const EraComparison: Story = EraCompare;

/**
 * Demonstrates that `Input` forwards its ref to the underlying `<input>`
 * element, so consumers can call `.focus()` / `.select()` imperatively
 * (e.g. autofocus a search field on mount).
 */
export const ForwardRefDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`Input` uses `forwardRef`, so the parent can imperatively focus the underlying `<input>`. This story autofocuses on mount via a ref.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const ref = useRef<HTMLInputElement>(null);
      useEffect(() => {
        ref.current?.focus();
      }, []);
      return (
        <div className="flex w-80 flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-era-muted">
            ref.current.focus() on mount
          </span>
          <Input ref={ref} placeholder="Auto-focused via ref" />
        </div>
      );
    };
    return <Demo />;
  },
};

export const Interactive: Story = {
  args: {
    onChange: fn(),
    placeholder: "Type to see onChange fire",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that typing fires `onChange` and the input's `value` matches the typed text after the era transition settles.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Type to see onChange fire");

    await userEvent.click(input);
    await expect(input).toHaveFocus();

    await userEvent.type(input, "design");
    // userEvent.type fires one onChange per character.
    await expect(args.onChange).toHaveBeenCalled();

    await waitFor(() => expect(input).toHaveValue("design"));
  },
};
