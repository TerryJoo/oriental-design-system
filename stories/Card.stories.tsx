import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useEffect, useRef, useState } from "react";
import { Card, cardVariants, cardPaddings } from "@/components/Card";
import { Button } from "@/components/Button";
import { boolArg, bothEras, selectArg } from "./_shared/argTypes";

const variantOptions = Object.keys(cardVariants) as Array<
  keyof typeof cardVariants
>;
const paddingOptions = Object.keys(cardPaddings) as Array<
  keyof typeof cardPaddings
>;

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Card is the foundational container surface. Three variants (default / scroll / glass) " +
          "each adapt to the active era through tokenized backgrounds, borders, and shadows. " +
          "The `interactive` flag opts the card into a pointer-friendly hover lift, useful when " +
          "the entire card is a clickable target. Padding is tokenized through the `padding` prop.",
      },
    },
  },
  argTypes: {
    variant: selectArg(variantOptions, "Surface variant"),
    padding: selectArg(paddingOptions, "Internal padding token"),
    interactive: boolArg("Enable hover-lift affordance"),
  },
  args: {
    variant: "default",
    padding: "md",
    interactive: false,
    children: (
      <div className="flex flex-col gap-2">
        <h3 className="font-era-display tracking-era-display case-era text-base font-bold text-era-primary">
          Card Title
        </h3>
        <p className="text-era-muted text-sm leading-relaxed">
          Cards group related content. They adapt across Heritage and Neon eras
          via tokenized surfaces, borders, and shadows.
        </p>
        <div className="mt-2">
          <Button size="sm" variant="primary">
            Action
          </Button>
        </div>
      </div>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story: "Every supported surface variant rendered together.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {variantOptions.map((variant) => (
        <Card key={variant} variant={variant}>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-era-muted">
              variant
            </span>
            <span className="font-era-display font-bold text-era-primary">
              {variant}
            </span>
          </div>
        </Card>
      ))}
    </div>
  ),
};

export const Paddings: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {paddingOptions.map((padding) => (
        <Card key={padding} padding={padding}>
          <span className="text-xs text-era-muted">padding={padding}</span>
        </Card>
      ))}
    </div>
  ),
};

export const InteractiveCard: Story = {
  args: { interactive: true },
  parameters: {
    docs: {
      description: {
        story:
          "When `interactive` is true the card lifts on hover, signaling the entire surface is a click target.",
      },
    },
  },
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side: surface fills, borders, and shadows flip through era-aware tokens with no React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <Card>
        <div className="flex flex-col gap-1">
          <span className="font-era-display font-bold text-era-primary">
            Era card
          </span>
          <span className="text-xs text-era-muted">
            Tokenized surfaces flip seamlessly.
          </span>
        </div>
      </Card>
    )),
};

export const RefForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates `forwardRef` on Card — the consumer attaches a ref and reads the live DOM dimensions after mount, proving the underlying div node is exposed.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const ref = useRef<HTMLDivElement>(null);
      const [size, setSize] = useState<{ w: number; h: number } | null>(null);
      useEffect(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
        }
      }, []);
      return (
        <div className="flex flex-col gap-3">
          <Card ref={ref} data-testid="ref-target">
            <div className="flex flex-col gap-1">
              <span className="font-era-display font-bold text-era-primary">
                Measured card
              </span>
              <span className="text-xs text-era-muted">
                size:{" "}
                <code className="text-era-primary">
                  {size ? `${size.w}×${size.h}px` : "…"}
                </code>
              </span>
            </div>
          </Card>
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = canvas.getByTestId("ref-target");
    await expect(target.tagName).toBe("DIV");
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    onClick: fn(),
    children: (
      <div data-testid="interactive-content" className="flex flex-col gap-2">
        <span className="font-era-display font-bold text-era-primary">
          Click me
        </span>
        <span className="text-xs text-era-muted">
          The whole card is the target.
        </span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Verifies pointer events on an interactive card propagate to the consumer-supplied `onClick` handler and that nested content remains queryable.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const content = canvas.getByTestId("interactive-content");
    await expect(content).toBeInTheDocument();
    await userEvent.click(content);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
