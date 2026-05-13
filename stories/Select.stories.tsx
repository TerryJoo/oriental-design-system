import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useRef } from "react";
import { Select } from "@/components/Select";
import { inputSizes, inputVariants } from "@/components/Input/Input.styles";
import { bothEras, boolArg, radioArg } from "./_shared/argTypes";

// Select reuses Input's size/variant axes via the SelectSize / SelectVariant
// type aliases in Select.styles.ts.
const SIZE_OPTIONS = Object.keys(inputSizes) as ReadonlyArray<
  keyof typeof inputSizes
>;
const VARIANT_OPTIONS = Object.keys(inputVariants) as ReadonlyArray<
  keyof typeof inputVariants
>;

const SAMPLE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "celadon", label: "청자 — Celadon" },
  { value: "gold", label: "황 — Gold" },
  { value: "indigo", label: "청 — Indigo" },
  { value: "jade", label: "취 — Jade" },
  { value: "coral", label: "주 — Coral" },
];

const renderOptions = (placeholder?: string) => (
  <>
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {SAMPLE_OPTIONS.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </>
);

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Select is a forwardRef-wrapped native `<select>` styled with era-aware tokens. When the optional `label` prop is supplied a wired `<label htmlFor>` is rendered automatically (using `useId` when no `id` is passed); otherwise callers must supply `aria-label` or `aria-labelledby`. Size and variant axes are shared with `Input`.\n\n" +
          "**Native option styling — known limitation.** The open option panel is rendered by browser/OS chrome and is not fully themeable. Heritage/Neon colour and `color-scheme` (light vs dark panel) are honoured by Chromium and Firefox; Safari mostly ignores `<option>` overrides on its native popup. Hover state is browser-controlled and cannot be themed cross-browser. For pixel-perfect option-panel styling, type-ahead, virtualisation, and multi-select chips, see the future Combobox component (TODO.md §F).",
      },
    },
  },
  argTypes: {
    selectSize: radioArg(SIZE_OPTIONS, "Size token (shared with Input)"),
    variant: radioArg(VARIANT_OPTIONS, "Visual variant (shared with Input)"),
    disabled: boolArg("Disabled state"),
    label: { control: "text", description: "Visible label" },
  },
  args: {
    label: "Color",
    children: renderOptions(),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-72">
      <Select {...args}>{renderOptions()}</Select>
    </div>
  ),
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every visual variant rendered side-by-side. `error` uses the era-aware intent colour and applies a thicker border so the affordance survives both Heritage and Neon surfaces.",
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {VARIANT_OPTIONS.map((variant) => (
        <Select
          key={variant}
          variant={variant}
          defaultValue="celadon"
          label={`Color (${variant})`}
        >
          {renderOptions()}
        </Select>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {SIZE_OPTIONS.map((size) => (
        <Select
          key={size}
          selectSize={size}
          defaultValue="celadon"
          label={`Color (${size})`}
        >
          {renderOptions()}
        </Select>
      ))}
    </div>
  ),
};

export const WithPlaceholder: Story = {
  render: () => (
    <div className="w-72">
      <Select defaultValue="" label="Color">
        {renderOptions("Choose a color…")}
      </Select>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select defaultValue="" label="Default">
        {renderOptions("Default (placeholder)")}
      </Select>
      <Select defaultValue="celadon" label="Filled">
        {renderOptions()}
      </Select>
      <Select variant="error" defaultValue="" label="Error">
        {renderOptions("Error — please select")}
      </Select>
      <Select disabled defaultValue="celadon" label="Disabled">
        {renderOptions()}
      </Select>
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
      <div className="w-64">
        <Select defaultValue="celadon" label={`Color (${era})`}>
          {renderOptions()}
        </Select>
      </div>
    )),
};

/**
 * Demonstrates that `Select` accepts a forwarded ref to the underlying
 * `<select>`. Useful for imperative APIs (`focus`, `setCustomValidity`,
 * reading the selected `<option>` element).
 */
export const WithForwardedRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`Select` forwards its ref to the underlying native `<select>`. The button below calls `selectRef.current.focus()` to prove the ref is wired through.",
      },
    },
  },
  render: () => {
    function RefDemo() {
      const selectRef = useRef<HTMLSelectElement>(null);
      return (
        <div className="flex w-72 flex-col gap-3">
          <Select ref={selectRef} defaultValue="celadon" label="Color">
            {renderOptions()}
          </Select>
          <button
            type="button"
            onClick={() => selectRef.current?.focus()}
            className="self-start rounded-md border border-era-soft bg-era-base px-3 py-1.5 text-sm text-era-primary"
          >
            Focus the select
          </button>
        </div>
      );
    }
    return <RefDemo />;
  },
};

/**
 * Automated proof that pointer + keyboard activation reach the underlying
 * native `<select>` and that `onChange` fires when the value changes.
 */
export const Interactive: Story = {
  args: {
    onChange: fn(),
    label: "Pick a color",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies that `onChange` fires when the value is changed via `userEvent.selectOptions` and that the underlying `<select>` reports the new value.",
      },
    },
  },
  render: (args) => (
    <div className="w-72">
      <Select {...args} defaultValue="celadon">
        {renderOptions()}
      </Select>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole("combobox", { name: /Pick a color/i });

    // userEvent.selectOptions fires `change` on a native <select>.
    await userEvent.selectOptions(select, "indigo");
    await expect(args.onChange).toHaveBeenCalled();
    await expect(select).toHaveValue("indigo");
  },
};
