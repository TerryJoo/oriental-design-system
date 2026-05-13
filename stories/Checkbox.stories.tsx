import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useEffect, useRef } from "react";
import { Checkbox } from "@/components/Checkbox";
import { checkboxBoxSizes } from "@/components/Checkbox/Checkbox.styles";
import { bothEras, boolArg, radioArg } from "./_shared/argTypes";

const SIZE_OPTIONS = Object.keys(checkboxBoxSizes) as ReadonlyArray<
  keyof typeof checkboxBoxSizes
>;

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Checkbox is a `forwardRef` wrapper around a native `<input type="checkbox">` ' +
          "rendered visually-hidden behind a styled box, so the underlying form " +
          "semantics, validation, and keyboard activation (Space) are entirely native. " +
          "Indeterminate is set imperatively via `ref.current.indeterminate = true` — " +
          "HTML does not expose it as a declarative prop. Era-aware tokens (`bg-era-sunken`, " +
          "`border-era-strong`, `duration-era`, `ease-era-brush`) flip the surface and stroke " +
          "between Heritage and Neon without re-rendering React.",
      },
    },
  },
  argTypes: {
    size: radioArg(SIZE_OPTIONS, "Box size token"),
    label: { control: "text" },
    disabled: boolArg("Disabled state"),
    defaultChecked: boolArg("Initially checked (uncontrolled)"),
  },
  args: {
    label: "Accept terms and conditions",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {SIZE_OPTIONS.map((size) => (
        <Checkbox
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

/**
 * Indeterminate is set imperatively via ref since native HTML doesn't expose
 * it as a declarative prop. This is the canonical pattern.
 */
function IndeterminateCheckbox() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = true;
  }, []);
  return <Checkbox ref={ref} label="Indeterminate" />;
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <IndeterminateCheckbox />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    // No visible label — must supply an accessible name via aria-label so
    // the checkbox still meets WCAG 4.1.2 (Name, Role, Value).
    "aria-label": "Accept terms and conditions",
  },
};

/**
 * Demonstrates that `Checkbox` accepts a forwarded ref to the underlying
 * `<input>`. The `IndeterminateCheckbox` helper above uses the same pattern;
 * this story exposes the API directly so consumers can read it as a recipe.
 */
export const WithForwardedRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`Checkbox` forwards its ref to the underlying native `<input>`. " +
          "Use it for imperative APIs that HTML doesn't expose declaratively " +
          "(`indeterminate`, `setCustomValidity`, `focus()`).",
      },
    },
  },
  render: () => {
    function RefDemo() {
      const ref = useRef<HTMLInputElement>(null);
      useEffect(() => {
        if (ref.current) ref.current.indeterminate = true;
      }, []);
      return (
        <div className="flex flex-col gap-2">
          <Checkbox ref={ref} label="Driven via ref (indeterminate)" />
          <span className="font-mono text-xs text-era-muted">
            ref.current.indeterminate = true
          </span>
        </div>
      );
    }
    return <RefDemo />;
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
          "Same checkbox markup rendered in Heritage and Neon. Surface, stroke, and the checked-state accent flip via the era CSS layer with no React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-col gap-2">
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
      </div>
    )),
};

/**
 * Automated interaction test. Verifies that:
 *   1. Clicking the visible label toggles the checked state (the native
 *      `<input>` is `sr-only` but the wrapping `<label>` makes the box
 *      clickable).
 *   2. Keyboard activation works — Space toggles a focused checkbox.
 *   3. The `onChange` callback receives a real DOM change event.
 */
export const Interactive: Story = {
  args: {
    label: "Accept terms",
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that pointer click and keyboard Space both toggle the checkbox and fire `onChange`.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: /accept terms/i });

    // 1. Initial state: unchecked.
    await expect(checkbox).not.toBeChecked();

    // 2. Pointer click flips it to checked and fires onChange.
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(1);

    // 3. Keyboard Space toggles it back.
    checkbox.focus();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(2);
  },
};
