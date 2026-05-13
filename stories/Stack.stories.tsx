import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { Stack } from "@/components/Stack";
import {
  type StackAlign,
  type StackDirection,
  type StackGap,
  type StackJustify,
} from "@/components/Stack/Stack.styles";
import { boolArg, bothEras, radioArg, selectArg } from "./_shared/argTypes";

const DIRECTIONS: readonly StackDirection[] = [
  "row",
  "column",
  "row-reverse",
  "column-reverse",
] as const;

const ALIGNS: readonly StackAlign[] = [
  "start",
  "center",
  "end",
  "stretch",
  "baseline",
] as const;

const JUSTIFIES: readonly StackJustify[] = [
  "start",
  "center",
  "end",
  "between",
  "around",
  "evenly",
] as const;

const GAPS: readonly StackGap[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "8",
  "10",
  "12",
] as const;

/**
 * Visible swatch used inside demo stacks. Uses era-aware utilities so it
 * adapts to Heritage/Neon without hardcoding any colors. Sized in arbitrary
 * Tailwind units so layout effects (alignment, justification, wrapping)
 * are obvious in the canvas.
 */
const Swatch = ({
  children,
  style,
}: {
  children?: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    className="flex min-h-10 min-w-10 items-center justify-center rounded-md border border-era-soft bg-era-base px-3 py-2 text-sm font-medium text-era-primary shadow-era-card"
    style={style}
  >
    {children}
  </div>
);

/**
 * Outlined frame used to make container bounds visible for alignment and
 * justification stories. Uses era-aware border tokens; no hex/rem leaks.
 */
const Frame = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    className="rounded-lg border border-dashed border-era-soft p-3"
    style={style}
  >
    {children}
  </div>
);

const meta = {
  title: "Components/Stack",
  component: Stack,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Stack is a flexbox layout primitive that arranges children along a single axis. " +
          "It exposes `direction`, `align`, `justify`, `gap`, and `wrap` props, plus a polymorphic " +
          "`as` prop for rendering as any HTML element while preserving forwarded refs.",
      },
    },
  },
  argTypes: {
    direction: selectArg(DIRECTIONS, "Flex direction (main axis)"),
    align: selectArg(ALIGNS, "Cross-axis alignment (align-items)"),
    justify: selectArg(JUSTIFIES, "Main-axis distribution (justify-content)"),
    gap: selectArg(GAPS, "Spacing token between children"),
    wrap: boolArg("Allow children to wrap onto new lines"),
    as: radioArg(
      ["div", "section", "ul"] as const,
      "Polymorphic element override",
    ),
  },
  args: {
    direction: "column",
    align: "stretch",
    justify: "start",
    gap: "3",
    wrap: false,
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  render: (args) => (
    <Stack {...args}>
      <Swatch>One</Swatch>
      <Swatch>Two</Swatch>
      <Swatch>Three</Swatch>
    </Stack>
  ),
};

export const Horizontal: Story = {
  args: { direction: "row", gap: "4", align: "center" },
  render: (args) => (
    <Stack {...args}>
      <Swatch>A</Swatch>
      <Swatch>B</Swatch>
      <Swatch>C</Swatch>
      <Swatch>D</Swatch>
    </Stack>
  ),
};

export const Vertical: Story = {
  args: { direction: "column", gap: "3" },
  render: (args) => (
    <Stack {...args} style={{ width: 220 }}>
      <Swatch>First</Swatch>
      <Swatch>Second</Swatch>
      <Swatch>Third</Swatch>
    </Stack>
  ),
};

export const Gaps: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every gap token rendered side-by-side. Gaps map directly to Tailwind `gap-*` utilities.",
      },
    },
  },
  render: () => (
    <Stack direction="column" gap="6">
      {GAPS.map((g) => (
        <Stack key={g} direction="column" gap="2">
          <span className="text-xs uppercase tracking-wide text-era-muted">
            gap={g}
          </span>
          <Stack direction="row" gap={g}>
            <Swatch>1</Swatch>
            <Swatch>2</Swatch>
            <Swatch>3</Swatch>
            <Swatch>4</Swatch>
          </Stack>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Alignment: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Align (cross-axis) and justify (main-axis) demonstrated on a fixed-size frame so the effect of each option is unambiguous.",
      },
    },
  },
  render: () => (
    <Stack direction="column" gap="6">
      <Stack direction="column" gap="3">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          align (row direction, fixed height)
        </span>
        <Stack direction="row" gap="3" wrap>
          {ALIGNS.map((a) => (
            <Stack key={a} direction="column" gap="1">
              <span className="text-xs text-era-muted">{a}</span>
              <Frame style={{ height: 120, width: 200 }}>
                <Stack
                  direction="row"
                  align={a}
                  gap="2"
                  style={{ height: "100%" }}
                >
                  <Swatch style={{ height: 32 }}>S</Swatch>
                  <Swatch style={{ height: 56 }}>M</Swatch>
                  <Swatch style={{ height: 80 }}>L</Swatch>
                </Stack>
              </Frame>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack direction="column" gap="3">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          justify (row direction, fixed width)
        </span>
        <Stack direction="row" gap="3" wrap>
          {JUSTIFIES.map((j) => (
            <Stack key={j} direction="column" gap="1">
              <span className="text-xs text-era-muted">{j}</span>
              <Frame style={{ width: 280 }}>
                <Stack direction="row" justify={j} gap="2">
                  <Swatch>1</Swatch>
                  <Swatch>2</Swatch>
                  <Swatch>3</Swatch>
                </Stack>
              </Frame>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  ),
};

export const Wrap: Story = {
  args: { direction: "row", wrap: true, gap: "3" },
  parameters: {
    docs: {
      description: {
        story:
          "With `wrap` enabled, children flow to additional lines once the container is too narrow to fit them on a single row.",
      },
    },
  },
  render: (args) => (
    <Frame style={{ width: 320 }}>
      <Stack {...args}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Swatch key={i}>{`Item ${i + 1}`}</Swatch>
        ))}
      </Stack>
    </Frame>
  ),
};

export const Nested: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Stacks compose freely. A column Stack containing two row Stacks is a common card-header layout.",
      },
    },
  },
  render: () => (
    <Stack direction="column" gap="4" style={{ width: 360 }}>
      <Stack direction="row" justify="between" align="center" gap="3">
        <Swatch>Title</Swatch>
        <Stack direction="row" gap="2">
          <Swatch>Edit</Swatch>
          <Swatch>More</Swatch>
        </Stack>
      </Stack>
      <Stack direction="column" gap="2">
        <Swatch>Body line 1</Swatch>
        <Swatch>Body line 2</Swatch>
        <Swatch>Body line 3</Swatch>
      </Stack>
      <Stack direction="row" justify="end" gap="2">
        <Swatch>Cancel</Swatch>
        <Swatch>Confirm</Swatch>
      </Stack>
    </Stack>
  ),
};

export const AsProp: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The `as` prop swaps the rendered element while preserving every flex utility. Useful for landmarks (`section`, `nav`, `header`) and lists (`ul`, `ol`).",
      },
    },
  },
  render: () => (
    <Stack direction="column" gap="4">
      <Stack as="section" direction="column" gap="2" data-testid="as-section">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          rendered as &lt;section&gt;
        </span>
        <Stack direction="row" gap="2">
          <Swatch>Section child A</Swatch>
          <Swatch>Section child B</Swatch>
        </Stack>
      </Stack>
      <Stack as="ul" direction="row" gap="2" data-testid="as-list">
        <li>
          <Swatch>List item 1</Swatch>
        </li>
        <li>
          <Swatch>List item 2</Swatch>
        </li>
        <li>
          <Swatch>List item 3</Swatch>
        </li>
      </Stack>
    </Stack>
  ),
};

export const WithRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Stack forwards refs to the underlying element. Click the button to scroll the last item into view via the forwarded ref.",
      },
    },
  },
  render: () => {
    const ScrollDemo = () => {
      const scrollerRef = useRef<HTMLDivElement>(null);
      return (
        <Stack direction="column" gap="3" style={{ width: 320 }}>
          <button
            type="button"
            data-testid="scroll-trigger"
            className="rounded-md border border-era-soft bg-era-base px-3 py-2 text-sm font-medium text-era-primary shadow-era-card"
            onClick={() => {
              const node = scrollerRef.current;
              if (!node) return;
              node.scrollTo({ left: node.scrollWidth, behavior: "smooth" });
            }}
          >
            Scroll to end
          </button>
          <Stack
            ref={scrollerRef}
            direction="row"
            gap="3"
            data-testid="scroller"
            // Horizontally scrollable regions must be keyboard-reachable so
            // sighted users on keyboards can scroll them with Arrow keys
            // (axe `scrollable-region-focusable` / WCAG 2.1.1). Marking the
            // region with role+name also gives assistive tech a landmark.
            tabIndex={0}
            role="region"
            aria-label="Items"
            style={{
              overflowX: "auto",
              padding: 8,
              width: "100%",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <Swatch
                key={i}
                style={{ minWidth: 96 }}
              >{`Item ${i + 1}`}</Swatch>
            ))}
          </Stack>
        </Stack>
      );
    };
    return <ScrollDemo />;
  },
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same Stack content rendered in Heritage and Neon eras side-by-side. Demonstrates that Stack is era-agnostic — children inherit era surfaces while Stack itself only contributes layout.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <Stack direction="column" gap="4">
        <Stack direction="row" justify="between" align="center" gap="3">
          <Swatch>Header</Swatch>
          <Swatch>Action</Swatch>
        </Stack>
        <Stack direction="row" gap="2" wrap>
          <Swatch>Tag 1</Swatch>
          <Swatch>Tag 2</Swatch>
          <Swatch>Tag 3</Swatch>
          <Swatch>Tag 4</Swatch>
        </Stack>
      </Stack>
    )),
};

export const Interactive: Story = {
  args: {
    direction: "row",
    gap: "6",
    align: "center",
    justify: "between",
    wrap: false,
  },
  render: (args) => (
    <Stack {...args} data-testid="interactive-stack">
      <Swatch>Alpha</Swatch>
      <Swatch>Beta</Swatch>
      <Swatch>Gamma</Swatch>
    </Stack>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Children are rendered in order.
    const alpha = canvas.getByText("Alpha");
    const beta = canvas.getByText("Beta");
    const gamma = canvas.getByText("Gamma");
    await expect(alpha).toBeInTheDocument();
    await expect(beta).toBeInTheDocument();
    await expect(gamma).toBeInTheDocument();

    // The container is a flex row with the requested gap and justification.
    const stack = canvas.getByTestId("interactive-stack");
    await expect(stack.className).toContain("flex");
    await expect(stack.className).toContain(
      `flex-${args.direction === "column" ? "col" : "row"}`,
    );
    await expect(stack.className).toContain(`gap-${args.gap}`);
    await expect(stack.className).toContain(`justify-${args.justify}`);

    // Hovering a child should not disturb sibling order or count.
    await userEvent.hover(beta);
    await expect(stack.children).toHaveLength(3);
  },
};
