import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useEffect, useRef, useState } from "react";
import { Tag, tagSizes } from "@/components/Tag";
import { bothEras, radioArg } from "./_shared/argTypes";

const sizeOptions = Object.keys(tagSizes) as Array<keyof typeof tagSizes>;

const meta = {
  title: "Components/Tag",
  component: Tag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Tag is a compact pill for taxonomy and filter chips. It renders as a `<span>` " +
          "with era-aware tonal fills (Heritage parchment / Neon deep indigo via the " +
          "`[[data-era=neon]_&]:` arbitrary variant), and accepts an optional `onRemove` " +
          "callback that surfaces an accessible × button. The component forwards refs to " +
          "the outer span so consumers can measure or scroll into list items.",
      },
    },
  },
  argTypes: {
    size: radioArg(sizeOptions, "Tag size"),
    onRemove: { control: false },
    removeLabel: { control: "text" },
  },
  args: {
    size: "md",
    children: "Tag",
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Both size tokens (sm, md) rendered together so padding and text tokens can be compared at a glance.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      {sizeOptions.map((size) => (
        <Tag key={size} size={size}>
          size={size}
        </Tag>
      ))}
    </div>
  ),
};

export const Dismissible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each tag exposes an × button that calls `onRemove`. The button receives an explicit accessible name from `removeLabel` (default 제거) and is keyboard-activatable.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [items, setItems] = useState<string[]>([
        "한지",
        "청자",
        "단청",
        "나전",
      ]);
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {items.map((item) => (
            <Tag
              key={item}
              onRemove={() => setItems((xs) => xs.filter((x) => x !== item))}
              removeLabel={`Remove ${item}`}
            >
              {item}
            </Tag>
          ))}
          {items.length === 0 && (
            <span className="text-xs text-era-muted">All removed.</span>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};

export const Group: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap max-w-md">
      {["heritage", "neon", "obangsaek", "celadon", "indigo", "gold"].map(
        (label) => (
          <Tag key={label}>{label}</Tag>
        ),
      )}
    </div>
  ),
};

/**
 * forwardRef demo — the outer span exposes its ref so consumers can measure
 * the tag, scroll it into view inside a virtualized list, or wire focus
 * proxies. The text under the row reports the resolved width to prove the
 * ref reached a real DOM node.
 */
export const ForwardRefDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tag forwards its ref to the outer span. Useful for measurement, scroll-into-view in long taxonomy lists, or wiring focus proxies. The width readout below reflects the live measurement taken via the forwarded ref.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const ref = useRef<HTMLSpanElement>(null);
      const [width, setWidth] = useState<number | null>(null);
      useEffect(() => {
        if (ref.current) {
          setWidth(ref.current.getBoundingClientRect().width);
        }
      }, []);
      return (
        <div className="flex flex-col gap-2">
          <Tag ref={ref}>measured</Tag>
          <span className="text-[11px] text-era-muted">
            ref.current width:{" "}
            {width === null ? "measuring…" : `${Math.round(width)}px`}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

/**
 * Wave 5b2-C3 overflow contract proof. The Tag caps at `max-w-[16rem]`
 * and the inner label (`tagLabel`) clamps to a single line with an
 * ellipsis. This story narrows the parent further to 200px to surface
 * the ellipsis on a 30+ character label.
 */
export const LongText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Long single-line labels truncate inside the chip rather than expanding the chip beyond the 16rem ceiling. The wrapping `<div>` is intentionally narrowed to 200px so the ellipsis is visible at the default text size; the inner label uses `truncate` (overflow-hidden + text-ellipsis + whitespace-nowrap) so the dismiss button stays anchored to the right edge.",
      },
    },
  },
  render: () => (
    <div style={{ width: 200 }} className="flex flex-col gap-3">
      <Tag>경복궁-국립고궁박물관-소장-청자상감운학문매병</Tag>
      <Tag onRemove={() => {}} removeLabel="태그 제거">
        경복궁-국립고궁박물관-소장-청자상감운학문매병
      </Tag>
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side. The Tag uses the `[[data-era=neon]_&]:`
 * arbitrary variant to swap fill tokens (accent-50/800 in Heritage,
 * accent-900/200 in Neon) so axe can resolve a deterministic background.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage parchment fills vs Neon deep-indigo fills, side-by-side. Both rely on opaque tonal pairs (no alpha) so axe color-contrast samples a deterministic background under each era.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex items-center gap-2 flex-wrap">
        {sizeOptions.map((size) => (
          <Tag key={size} size={size}>
            {size}
          </Tag>
        ))}
      </div>
    )),
};

export const Interactive: Story = {
  args: {
    onRemove: fn(),
    removeLabel: "Remove tag",
    children: "interactive",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies the dismiss button is reachable by its accessible name, that pointer activation invokes `onRemove`, and that keyboard activation (Space) does too — the contract drag-and-drop and chip-list consumers depend on.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const removeBtn = canvas.getByRole("button", { name: "Remove tag" });

    // 1. Pointer activation invokes onRemove.
    await userEvent.click(removeBtn);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);

    // 2. Keyboard activation: Space on a focused button.
    removeBtn.focus();
    await expect(removeBtn).toHaveFocus();
    await userEvent.keyboard("[Space]");
    await expect(args.onRemove).toHaveBeenCalledTimes(2);
  },
};
