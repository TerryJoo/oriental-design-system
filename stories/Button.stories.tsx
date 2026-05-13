import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import type {
  ButtonShape,
  ButtonSize,
  ButtonVariant,
} from "@/components/Button";
import {
  bothEras,
  commonStateArgs,
  radioArg,
  selectArg,
} from "./_shared/argTypes";

const VARIANT_OPTIONS: readonly ButtonVariant[] = [
  "primary",
  "secondary",
  "ghost",
  "seal",
  "danger",
] as const;

const SIZE_OPTIONS: readonly ButtonSize[] = ["sm", "md", "lg"] as const;
const SHAPE_OPTIONS: readonly ButtonShape[] = ["rounded", "pill"] as const;

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Button is the primary action surface. Five variants cover the action-hierarchy " +
          "spectrum — primary, secondary, ghost, seal (낙관/도장), and danger — and each adapts " +
          "to the active era through tokenized fills, borders, and shadows. Loading and " +
          "disabled states are wired with `aria-busy` / `aria-disabled` so assistive tech " +
          "announces the state cleanly.",
      },
    },
  },
  argTypes: {
    variant: selectArg(VARIANT_OPTIONS, "Visual variant"),
    size: radioArg(SIZE_OPTIONS, "Size token"),
    shape: radioArg(SHAPE_OPTIONS, "Border-radius shape"),
    ...commonStateArgs,
  },
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
};

export const Ghost: Story = {
  args: { variant: "ghost" },
};

export const Seal: Story = {
  args: { variant: "seal", children: "낙관" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete" },
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every visual variant rendered together so action hierarchy and tonal balance can be compared at a glance.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      {VARIANT_OPTIONS.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {SIZE_OPTIONS.map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {SHAPE_OPTIONS.map((shape) => (
        <Button key={shape} shape={shape}>
          {shape}
        </Button>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button
        leftIcon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        }
      >
        With Left
      </Button>
      <Button
        rightIcon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        }
      >
        With Right
      </Button>
    </div>
  ),
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side: every variant flips its surface, ink, and shadow tokens through era-aware CSS variables with no React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-wrap items-center gap-3">
        {VARIANT_OPTIONS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </div>
    )),
};

export const RefForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates `forwardRef` on Button — the consumer attaches a ref and programmatically focuses the underlying `<button>` after mount.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const ref = useRef<HTMLButtonElement>(null);
      const [focused, setFocused] = useState(false);
      useEffect(() => {
        ref.current?.focus();
        setFocused(document.activeElement === ref.current);
      }, []);
      return (
        <div className="flex items-center gap-4">
          <Button
            ref={ref}
            variant="primary"
            data-testid="ref-target"
            onBlur={() => setFocused(false)}
            onFocus={() => setFocused(true)}
          >
            Programmatically focused
          </Button>
          <span className="text-era-muted text-sm">
            focused: <code className="text-era-primary">{String(focused)}</code>
          </span>
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = canvas.getByTestId("ref-target");
    await expect(target.tagName).toBe("BUTTON");
  },
};

export const Interactive: Story = {
  args: {
    variant: "primary",
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies pointer and keyboard activation both invoke `onClick`, and that the button renders its children as the accessible name.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Button" });

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    button.focus();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("[Enter]");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
