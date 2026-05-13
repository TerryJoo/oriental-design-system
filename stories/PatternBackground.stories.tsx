import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import type { ReactNode } from "react";
import { PatternBackground } from "@/components/PatternBackground";
import {
  patternBackgroundVariants,
  type PatternIntensity,
  type PatternVariant,
} from "@/components/PatternBackground/PatternBackground.styles";
import { Card } from "@/components/Card";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { boolArg, bothEras, radioArg, selectArg } from "./_shared/argTypes";

// Source-of-truth lists (iterated, never hardcoded). Variants come straight
// from the styles module so adding a new pattern automatically expands the
// matrix. Intensity is a stable triplet on the type side.
const VARIANTS: readonly PatternVariant[] = patternBackgroundVariants;
const INTENSITIES: readonly PatternIntensity[] = ["subtle", "normal", "strong"];

const meta = {
  title: "Components/PatternBackground",
  component: PatternBackground,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "`PatternBackground` paints a non-interactive textural layer behind its children. " +
          "The `auto` variant follows whichever era is active via `--era-material-pattern`, " +
          "while the explicit variants render their own pattern regardless of era — useful for side-by-side showcases.",
      },
    },
  },
  argTypes: {
    variant: selectArg(
      VARIANTS,
      "Pattern variant; `auto` follows the active era",
    ),
    intensity: radioArg(INTENSITIES, "Visual loudness"),
    fixed: boolArg("Render as fixed full-bleed background"),
  },
  args: {
    variant: "auto",
    intensity: "subtle",
  },
} satisfies Meta<typeof PatternBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

// Shared sample content for the basic stories.
function SampleContent({ children }: { children?: ReactNode }) {
  return (
    <div className="relative z-10 flex h-full min-h-[180px] flex-col items-center justify-center gap-2 p-6 text-center">
      {children ?? (
        <>
          <Typography variant="h4">Pattern Background</Typography>
          <Typography variant="body-sm" tone="muted">
            Era-aware textural layer behind your content.
          </Typography>
        </>
      )}
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <PatternBackground
      {...args}
      className="w-[420px] rounded-card border border-era bg-era-base"
    >
      <SampleContent />
    </PatternBackground>
  ),
};

export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each tile renders a single variant from `patternBackgroundVariants`. " +
          "The `auto` tile delegates to `--era-material-pattern`, so it changes " +
          "with the era toolbar; the explicit tiles always show their own " +
          "pattern. Heritage-only patterns (`woodgrain`, `porcelain`, `hanji`) " +
          "render via `--pattern-*` tokens defined in `eras/heritage.css`; Neon " +
          "patterns (`circuit`, `scanline`) come from `eras/neon.css`.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {VARIANTS.map((variant) => (
        <PatternBackground
          key={variant}
          variant={variant}
          intensity="normal"
          className="h-[200px] w-[200px] rounded-card border border-era bg-era-base"
        >
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-1">
            <Typography variant="h4" className="capitalize">
              {variant}
            </Typography>
            <Typography variant="caption" tone="muted">
              intensity: normal
            </Typography>
          </div>
        </PatternBackground>
      ))}
    </div>
  ),
};

export const IntensityMatrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Variant rows × intensity columns. Lets designers calibrate how loud " +
          "a pattern reads under each tier (subtle / normal / strong) before " +
          "dropping it behind real content.",
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      {/* Header row showing intensity column labels. */}
      <div
        className="grid items-center gap-3 text-era-muted"
        style={{
          gridTemplateColumns: `120px repeat(${INTENSITIES.length}, minmax(140px, 1fr))`,
        }}
      >
        <span />
        {INTENSITIES.map((intensity) => (
          <Typography
            key={intensity}
            variant="caption"
            tone="muted"
            className="text-center capitalize"
          >
            {intensity}
          </Typography>
        ))}
      </div>

      {VARIANTS.map((variant) => (
        <div
          key={variant}
          className="grid items-center gap-3"
          style={{
            gridTemplateColumns: `120px repeat(${INTENSITIES.length}, minmax(140px, 1fr))`,
          }}
        >
          <Typography variant="h4" className="capitalize">
            {variant}
          </Typography>
          {INTENSITIES.map((intensity) => (
            <PatternBackground
              key={`${variant}-${intensity}`}
              variant={variant}
              intensity={intensity}
              className="h-[140px] rounded-card border border-era bg-era-base"
            >
              <div className="relative z-10 flex h-full w-full items-end justify-end p-2">
                <Typography variant="caption" tone="muted">
                  {intensity}
                </Typography>
              </div>
            </PatternBackground>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "The same `auto` variant rendered in Heritage and Neon panels. Demonstrates how the pattern follows whichever era owns the surrounding subtree via `--era-material-pattern`.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <PatternBackground
        variant="auto"
        intensity="normal"
        className="h-[200px] rounded-card border border-era bg-era-base"
      >
        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
          <Typography variant="h4">auto</Typography>
          <Typography variant="caption" tone="muted">
            follows --era-material-pattern
          </Typography>
        </div>
      </PatternBackground>
    )),
};

// Preserved alias for backward link compatibility.
export const EraComparison: Story = EraCompare;

export const Fixed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Fixed mode positions the pattern layer with `position: fixed`, so the " +
          "texture bleeds under the entire viewport while content scrolls in " +
          "front. Typically used at the app shell root, not on a single panel.",
      },
    },
  },
  render: () => (
    <PatternBackground
      variant="auto"
      intensity="subtle"
      fixed
      className="min-h-[420px] w-full"
    >
      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center justify-center gap-3 py-16 text-center">
        <Typography variant="h2">Fixed full-bleed</Typography>
        <Typography variant="body" tone="muted">
          The pattern layer is pinned to the viewport. Scroll-friendly content
          floats above it without redrawing the texture.
        </Typography>
        <Button>Primary action</Button>
      </div>
    </PatternBackground>
  ),
};

export const WithContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Layered legibility check — a Card with Typography and a Button sits " +
          "on top of a `subtle` pattern. Helps verify the pattern reads as " +
          "background and never competes with foreground UI.",
      },
    },
  },
  render: () => (
    <PatternBackground
      variant="auto"
      intensity="subtle"
      className="w-[480px] rounded-card border border-era bg-era-base p-6"
    >
      <Card variant="default" padding="lg" className="relative z-10">
        <div className="flex flex-col gap-3">
          <Typography variant="h3">Layered surface</Typography>
          <Typography variant="body" tone="muted">
            The textural layer is rendered behind this card. Foreground type and
            controls keep their full legibility while the era hint stays present
            in the periphery.
          </Typography>
          <div className="flex gap-2">
            <Button variant="primary">Continue</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </div>
      </Card>
    </PatternBackground>
  ),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that the pattern layer is rendered as `aria-hidden` so it never leaks into the assistive-tech tree.",
      },
    },
  },
  render: () => (
    <PatternBackground
      variant="auto"
      intensity="normal"
      className="h-[160px] w-[320px] rounded-card border border-era bg-era-base"
    >
      <div className="relative z-10 flex h-full items-center justify-center">
        <Typography variant="body-sm">Foreground content</Typography>
      </div>
    </PatternBackground>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layer = canvas.getByTestId("pattern-layer");

    // The decorative layer must be hidden from assistive tech.
    await expect(layer).toHaveAttribute("aria-hidden", "true");

    // Foreground content should remain queryable.
    await expect(canvas.getByText("Foreground content")).toBeInTheDocument();
  },
};
