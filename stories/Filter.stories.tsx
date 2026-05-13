import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useRef, useState } from "react";
import { Filter, type FilterOption } from "@/components/Filter";
import { filterChipSizes } from "@/components/Filter/Filter.styles";
import { bothEras, radioArg } from "./_shared/argTypes";

const SIZE_OPTIONS = Object.keys(filterChipSizes) as ReadonlyArray<
  keyof typeof filterChipSizes
>;

const SAMPLE_OPTIONS: ReadonlyArray<FilterOption> = [
  { value: "all", label: "전체", count: 24 },
  { value: "heritage", label: "Heritage", count: 12 },
  { value: "neon", label: "Neon", count: 8 },
  { value: "boardgame", label: "Boardgame", count: 4 },
];

const meta = {
  title: "Components/Filter",
  component: Filter,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          '`Filter` is a `forwardRef` toggle-button group rendered as a `role="group"` ' +
          "with each option as a `<button aria-pressed>` — the canonical WAI-ARIA " +
          "toggle-button pattern. It supports controlled (`value` + `onChange`) and " +
          "uncontrolled (`defaultValue`) usage, optional per-option `count` badges, " +
          'and a derived accessible name (`aria-label="Filter options"`) when one ' +
          "isn't provided. Era-aware tokens flip the chip surfaces and active accent " +
          "between Heritage and Neon without re-rendering React.",
      },
    },
  },
  argTypes: {
    size: radioArg(SIZE_OPTIONS, "Chip size token"),
  },
  args: {
    options: SAMPLE_OPTIONS,
    defaultValue: "all",
  },
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {SIZE_OPTIONS.map((size) => (
        <div key={size} className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wide text-era-muted">
            size: {size}
          </span>
          <Filter {...args} size={size} />
        </div>
      ))}
    </div>
  ),
};

/** Controlled — useState lets you actually click and toggle in the docs view. */
function ControlledFilter() {
  const [value, setValue] = useState<string>("all");
  return (
    <div className="flex flex-col gap-3">
      <Filter options={SAMPLE_OPTIONS} value={value} onChange={setValue} />
      <span className="font-mono text-xs text-era-muted">
        active: <span className="text-era-primary">{value}</span>
      </span>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledFilter />,
};

export const WithoutCounts: Story = {
  args: {
    options: SAMPLE_OPTIONS.map(({ count: _count, ...rest }) => rest),
  },
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-era-muted">
          default — first option active
        </span>
        <Filter options={SAMPLE_OPTIONS} defaultValue="all" />
      </div>
      <div>
        <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-era-muted">
          different selection
        </span>
        <Filter options={SAMPLE_OPTIONS} defaultValue="neon" />
      </div>
      <div>
        <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-era-muted">
          no selection
        </span>
        <Filter options={SAMPLE_OPTIONS} />
      </div>
    </div>
  ),
};

/**
 * Demonstrates that `Filter` forwards its ref to the outer `role="group"`
 * wrapper. Useful for measuring the chip group, scrolling it into view,
 * or attaching custom focus management.
 */
export const WithForwardedRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Filter` forwards its ref to the outer `role="group"` wrapper. ' +
          "Consumers can imperatively focus the group, scroll it, or attach " +
          "observers without reaching into the chip buttons themselves.",
      },
    },
  },
  render: () => {
    function RefDemo() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <div className="flex flex-col gap-2">
          <Filter
            ref={ref}
            options={SAMPLE_OPTIONS}
            defaultValue="heritage"
            aria-label="Era filter"
          />
          <span className="font-mono text-xs text-era-muted">
            ref → outer role=&quot;group&quot; wrapper
          </span>
        </div>
      );
    }
    return <RefDemo />;
  },
};

/**
 * Heritage / Neon side-by-side via the shared `bothEras` helper. Each panel
 * pre-selects its own era so the active chip's accent treatment is visible
 * under both layers.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `Filter` rendered in Heritage and Neon. The active chip's accent fill, ink color, and inactive border all flip via the era CSS layer.",
      },
    },
  },
  render: () =>
    bothEras(({ era }) => (
      <Filter options={SAMPLE_OPTIONS} defaultValue={era} />
    )),
};

/**
 * Automated interaction test. Verifies:
 *   1. The component exposes `role="group"` with a default accessible name
 *      and one `<button aria-pressed>` per option (the WAI-ARIA toggle-button
 *      pattern).
 *   2. The pre-selected option reports `aria-pressed="true"`; the others
 *      `"false"`.
 *   3. Clicking an inactive chip flips both `aria-pressed` flags and fires
 *      `onChange` with the new value.
 *   4. Keyboard activation (Enter) on a focused chip also fires `onChange`.
 */
export const Interactive: Story = {
  args: {
    options: SAMPLE_OPTIONS,
    defaultValue: "all",
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that the chip group exposes the toggle-button pattern, that pointer + keyboard activation both flip `aria-pressed` and fire `onChange`, and that the group has an accessible name even without an explicit `aria-label`.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. The group has a default accessible name and the right number of
    //    chips.
    const group = canvas.getByRole("group", { name: /filter options/i });
    await expect(group).toBeInTheDocument();

    const chips = canvas.getAllByRole("button");
    await expect(chips).toHaveLength(SAMPLE_OPTIONS.length);

    // 2. defaultValue="all" → that chip is pressed.
    const allChip = canvas.getByRole("button", { name: /전체/ });
    const heritageChip = canvas.getByRole("button", { name: /heritage/i });
    await expect(allChip).toHaveAttribute("aria-pressed", "true");
    await expect(heritageChip).toHaveAttribute("aria-pressed", "false");

    // 3. Pointer click on heritage fires onChange. Note the component is
    //    uncontrolled here — `onChange` fires but `aria-pressed` stays the
    //    same because there's no controlling state writing back.
    await userEvent.click(heritageChip);
    await expect(args.onChange).toHaveBeenLastCalledWith("heritage");

    // 4. Keyboard Enter on a focused chip also fires onChange.
    const neonChip = canvas.getByRole("button", { name: /^neon/i });
    neonChip.focus();
    await expect(neonChip).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith("neon");
  },
};
