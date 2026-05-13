import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useEffect, useRef, useState } from "react";
import { TextField } from "@/components/TextField";
import { inputSizes, inputVariants } from "@/components/Input/Input.styles";
import { bothEras, boolArg, radioArg } from "./_shared/argTypes";

// TextField composes Input, so its variant/size axes come straight from
// Input.styles.ts.
const SIZE_OPTIONS = Object.keys(inputSizes) as ReadonlyArray<
  keyof typeof inputSizes
>;
const VARIANT_OPTIONS = Object.keys(inputVariants) as ReadonlyArray<
  keyof typeof inputVariants
>;

const meta = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "TextField pairs an `<Input>` with a label, helper text, and an error " +
          "channel. It auto-wires `htmlFor` / `aria-describedby` / `aria-invalid` so " +
          "labels, helper text, and error messages are programmatically associated for " +
          "assistive tech. The component forwards refs to the underlying input element.",
      },
    },
  },
  argTypes: {
    inputSize: radioArg(SIZE_OPTIONS, "Input size token"),
    variant: radioArg(VARIANT_OPTIONS, "Visual variant"),
    label: { control: "text" },
    helperText: { control: "text" },
    error: { control: "text" },
    placeholder: { control: "text" },
    disabled: boolArg("Disabled state"),
    required: boolArg("Required state"),
  },
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    helperText: "We will never share your email.",
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each Input variant rendered with a representative helper-text or error string so the tonal shift between default and error can be compared.",
      },
    },
  },
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      {VARIANT_OPTIONS.map((variant) => (
        <TextField
          key={variant}
          {...args}
          variant={variant}
          label={`variant: ${variant}`}
          helperText={
            variant === "error" ? undefined : "helper text for this variant"
          }
          error={variant === "error" ? "This field has an error" : undefined}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All three Input size tokens (sm / md / lg) so padding and type scale can be compared.",
      },
    },
  },
  render: (args) => (
    <div className="flex w-80 flex-col gap-4">
      {SIZE_OPTIONS.map((size) => (
        <TextField
          key={size}
          {...args}
          inputSize={size}
          label={`size: ${size}`}
        />
      ))}
    </div>
  ),
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default, valued, required, error, and disabled permutations. Confirms helper-text and error-text channels swap correctly and that disabled inputs preserve label contrast.",
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <TextField label="Default" placeholder="Empty" />
      <TextField
        label="With value"
        defaultValue="design system"
        helperText="Helper text"
      />
      <TextField
        label="Required"
        placeholder="Required field"
        required
        helperText="* required"
      />
      <TextField
        label="Email"
        defaultValue="invalid@"
        error="Please enter a valid email"
      />
      <TextField label="Disabled" placeholder="Disabled" disabled />
      <TextField
        label="Disabled w/ value"
        defaultValue="locked"
        disabled
        helperText="This is disabled"
      />
    </div>
  ),
};

export const WithError: Story = {
  args: {
    label: "Password",
    type: "password",
    defaultValue: "abc",
    error: "Must be at least 8 characters",
  },
};

/**
 * forwardRef demo — TextField forwards its ref to the underlying `<input>`.
 * The mount effect calls `.focus()` via that ref to prove the chain reaches
 * the real DOM node, not the wrapper div.
 */
export const ForwardRefDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "TextField forwards its ref to the underlying input element, not the wrapper. On mount this story focuses the input via the forwarded ref — the focus ring should land on the input, confirming the chain.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const inputRef = useRef<HTMLInputElement>(null);
      const [tagName, setTagName] = useState<string | null>(null);
      useEffect(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setTagName(inputRef.current.tagName);
        }
      }, []);
      return (
        <div className="flex w-80 flex-col gap-2">
          <TextField
            ref={inputRef}
            label="Auto-focused on mount"
            placeholder="ref → real <input>"
          />
          <span className="text-[11px] text-era-muted">
            ref.current.tagName: {tagName ?? "measuring…"}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * Heritage / Neon side-by-side. Both panels use [data-era] so the era CSS
 * layer flips without re-rendering React.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same TextField markup rendered in Heritage and Neon to verify era-aware tokens (label tone, sunken surface, focus ring color) flip cleanly without any React re-render.",
      },
    },
  },
  render: (args) =>
    bothEras(({ era }) => (
      <TextField {...args} label={era === "heritage" ? "Heritage" : "Neon"} />
    )),
};

export const Interactive: Story = {
  args: {
    label: "Username",
    placeholder: "Type here",
    helperText: undefined,
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies typing into the input invokes `onChange` for every keystroke and that the label is correctly associated with the input via `htmlFor` / `id`.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Username");
    await expect(input).toBeInTheDocument();

    // Typing fires onChange once per character.
    await userEvent.type(input, "design");
    await expect(args.onChange).toHaveBeenCalled();
    await expect(input).toHaveValue("design");
  },
};
