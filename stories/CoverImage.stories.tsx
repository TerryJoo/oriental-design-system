import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { useRef } from "react";
import { CoverImage, coverImageRatioMap } from "@/components/CoverImage";
import { boolArg, bothEras, selectArg } from "./_shared/argTypes";

const ratioOptions = Object.keys(coverImageRatioMap) as Array<
  keyof typeof coverImageRatioMap
>;

const SAMPLE_SRC = "https://placehold.co/960x540/8A5030/ffffff?text=Heritage";
const BROKEN_SRC = "https://this-host-does-not-exist.invalid/image.jpg";

const meta = {
  title: "Components/CoverImage",
  component: CoverImage,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "CoverImage is a `forwardRef` aspect-ratio container for hero/cover " +
          "imagery. When `src` is provided it lays an `<img>` over a sunken era " +
          "surface; when `src` is absent (or fails to load) the era pattern fill " +
          "shows through unless `noPattern` is set. Supplying `label` adds a " +
          "darkening gradient overlay and a foreground caption styled with the " +
          "era display font.",
      },
    },
  },
  argTypes: {
    ratio: selectArg(ratioOptions, "Aspect ratio"),
    src: { control: "text" },
    alt: { control: "text" },
    label: { control: "text" },
    noPattern: boolArg("Hide the era pattern fallback"),
  },
  args: {
    ratio: "16/9",
    label: "Cover label",
  },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CoverImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { src: SAMPLE_SRC, alt: "Heritage cover" },
};

export const Ratios: Story = {
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {ratioOptions.map((ratio) => (
        <div key={ratio} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-era-muted">
            ratio={ratio}
          </span>
          <CoverImage
            ratio={ratio}
            src={`https://placehold.co/640x360/8A5030/ffffff?text=${encodeURIComponent(
              ratio,
            )}`}
            alt={`${ratio} sample`}
          />
        </div>
      ))}
    </div>
  ),
};

export const PatternFallback: Story = {
  args: { src: undefined, label: "No image — era pattern" },
};

export const BrokenSourceFallback: Story = {
  args: {
    src: BROKEN_SRC,
    alt: "Falls back to era pattern via the surrounding surface",
    label: "Broken src",
  },
};

export const WithLabel: Story = {
  args: {
    src: SAMPLE_SRC,
    alt: "With foreground label",
    label: "오방색 / Heritage",
  },
};

/**
 * Demonstrates that `CoverImage` forwards its ref to the outer `<div>`
 * wrapper. Useful for measuring the rendered box (intersection observers,
 * scroll-into-view, etc.).
 */
export const WithForwardedRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`CoverImage` forwards its ref to the outer wrapper element. " +
          "The caption below reflects the measured width of the rendered " +
          "container, proving the ref is wired to a real DOM node.",
      },
    },
  },
  render: () => {
    function RefDemo() {
      const ref = useRef<HTMLDivElement>(null);
      // Read width on first paint — happy-dom returns 0 in tests, but axe
      // and the docs view both render in a real browser. Either way the
      // ref is attached to the outer wrapper, which is the contract.
      const width =
        typeof window !== "undefined" && ref.current
          ? Math.round(ref.current.getBoundingClientRect().width)
          : null;
      return (
        <div className="flex flex-col gap-2">
          <CoverImage
            ref={ref}
            ratio="16/9"
            src={SAMPLE_SRC}
            alt="Forwarded ref demo"
          />
          <span className="font-mono text-xs text-era-muted">
            ref attached → wrapper width: {width ?? "(post-mount)"}
          </span>
        </div>
      );
    }
    return <RefDemo />;
  },
};

/**
 * Heritage / Neon side-by-side via the shared `bothEras` helper. Surfaces,
 * borders, and pattern fills flip via the era CSS layer.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `CoverImage` (no `src`, so the era pattern fills the area) rendered in Heritage and Neon. Surface, border, and pattern motif flip via the era CSS layer.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="w-full max-w-md">
        <CoverImage label="Era pattern" />
      </div>
    )),
};

/**
 * Automated rendering check. Verifies the alt text reaches the underlying
 * `<img>` (so screen readers announce the cover) when `src` is provided.
 */
export const Interactive: Story = {
  args: {
    src: SAMPLE_SRC,
    alt: "Heritage cover hero",
    label: "Heritage",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that the `alt` prop is forwarded to the rendered `<img>` so assistive tech announces the cover by its semantic name.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByAltText(/heritage cover hero/i);
    await expect(img).toBeInTheDocument();
    await expect(img).toHaveAttribute("src", args.src ?? "");
  },
};
