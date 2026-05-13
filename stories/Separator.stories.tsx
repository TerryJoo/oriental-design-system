import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { createRef, useEffect, useRef, useState } from "react";
import { Separator } from "@/components/Separator";
import {
  type SeparatorOrientation,
  type SeparatorVariant,
} from "@/components/Separator/Separator.styles";
import { boolArg, bothEras, radioArg } from "./_shared/argTypes";

const VARIANTS: readonly SeparatorVariant[] = ["solid", "fade", "dashed"];
const ORIENTATIONS: readonly SeparatorOrientation[] = [
  "horizontal",
  "vertical",
];

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Era-aware divider that renders as `solid`, `fade`, or `dashed`. The `fade` variant uses an inline gradient driven by the era-aware `--era-edge-color-hard` custom property, so its ink color shifts automatically between Heritage (먹선) and Neon (네온 라인). When `decorative` is `false`, the element exposes `role="separator"` and `aria-orientation` for assistive tech.',
      },
    },
  },
  argTypes: {
    orientation: radioArg(ORIENTATIONS, "Layout axis of the divider"),
    variant: radioArg(VARIANTS, "Visual treatment of the divider"),
    decorative: boolArg(
      "When true (default) the separator is hidden from AT (role=none). Set false to expose role=separator with aria-orientation.",
    ),
  },
  args: {
    orientation: "horizontal",
    variant: "solid",
    decorative: true,
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: (args) => (
    <div className="w-80 max-w-full">
      <p className="text-era-primary text-sm">
        오방색은 청·적·황·백·흑의 다섯 빛깔이다.
      </p>
      <Separator {...args} className="my-4" />
      <p className="text-era-muted text-sm">
        Each color anchors a cardinal direction in traditional Korean design.
      </p>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="w-80 max-w-full space-y-6">
      {VARIANTS.map((variant) => (
        <div key={variant}>
          <div className="text-era-muted text-xs uppercase tracking-widest mb-2">
            {variant}
          </div>
          <Separator variant={variant} />
        </div>
      ))}
    </div>
  ),
};

export const Orientations: Story = {
  render: () => (
    <div className="flex items-stretch gap-6 h-24">
      <div className="flex-1 flex flex-col justify-between">
        <span className="text-era-primary text-sm">Above</span>
        <Separator orientation="horizontal" />
        <span className="text-era-muted text-sm">Below</span>
      </div>
      <Separator orientation="vertical" />
      <div className="flex-1 flex items-center justify-center">
        <span className="text-era-primary text-sm">Right column</span>
      </div>
    </div>
  ),
};

export const Decorative: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Compare the rendered DOM in the a11y panel: the first separator is decorative (`role="none"`, no `aria-orientation`), the second is semantic (`role="separator"` with `aria-orientation`).',
      },
    },
  },
  render: () => (
    <div className="w-80 max-w-full space-y-6">
      <div>
        <div className="text-era-muted text-xs uppercase tracking-widest mb-2">
          decorative = true (role=none)
        </div>
        <Separator decorative />
      </div>
      <div>
        <div className="text-era-muted text-xs uppercase tracking-widest mb-2">
          decorative = false (role=separator)
        </div>
        <Separator decorative={false} />
      </div>
    </div>
  ),
};

export const InMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Realistic usage — separators group menu items into logical sections. Decorative is fine here because the `<ul>` and group headings already convey structure.",
      },
    },
  },
  render: () => (
    <ul
      className="w-56 rounded-md bg-era-surface text-era-primary text-sm py-2 shadow-era-card"
      role="menu"
    >
      <li role="menuitem" className="px-3 py-2 hover:bg-era-soft">
        Profile
      </li>
      <li role="menuitem" className="px-3 py-2 hover:bg-era-soft">
        Account
      </li>
      <li aria-hidden className="my-1">
        <Separator />
      </li>
      <li role="menuitem" className="px-3 py-2 hover:bg-era-soft">
        Settings
      </li>
      <li role="menuitem" className="px-3 py-2 hover:bg-era-soft">
        Keyboard shortcuts
      </li>
      <li aria-hidden className="my-1">
        <Separator variant="fade" />
      </li>
      <li
        role="menuitem"
        className="px-3 py-2 hover:bg-era-soft text-era-muted"
      >
        Sign out
      </li>
    </ul>
  ),
};

export const WithRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates `forwardRef` — the ref attaches to the underlying `div`. The badge below reads back the resolved `role` from the ref to prove the attachment.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const ref = useRef<HTMLDivElement>(null);
      const [role, setRole] = useState<string | null>(null);
      useEffect(() => {
        setRole(ref.current?.getAttribute("role") ?? null);
      }, []);
      return (
        <div className="w-80 max-w-full space-y-3">
          <Separator ref={ref} decorative={false} data-testid="ref-target" />
          <div className="text-era-muted text-xs">
            ref.current.role = <code className="text-era-primary">{role}</code>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = await canvas.findByTestId("ref-target");
    expect(target.tagName.toLowerCase()).toBe("div");
    expect(target).toHaveAttribute("role", "separator");
  },
};

export const EraCompare: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side Heritage vs Neon. Note how the `fade` variant tints differently in each era — the gradient pulls from `--era-edge-color-hard`, so Heritage shows a 먹선 ink fade and Neon shows a luminous line.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="space-y-6">
        {VARIANTS.map((variant) => (
          <div key={variant}>
            <div className="text-era-muted text-xs uppercase tracking-widest mb-2">
              {variant}
            </div>
            <Separator variant={variant} />
          </div>
        ))}
      </div>
    )),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Asserts ARIA semantics: decorative separators expose `role="none"`, semantic separators expose `role="separator"` with the matching `aria-orientation`.',
      },
    },
  },
  render: () => {
    // Each separator is given a stable testid so the play function can target it.
    const refDecorative = createRef<HTMLDivElement>();
    return (
      <div className="w-80 max-w-full space-y-4">
        <Separator data-testid="sep-decorative" ref={refDecorative} />
        <Separator data-testid="sep-semantic-h" decorative={false} />
        <div className="flex h-12 items-stretch gap-4">
          <span className="text-era-primary text-sm self-center">A</span>
          <Separator
            data-testid="sep-semantic-v"
            orientation="vertical"
            decorative={false}
          />
          <span className="text-era-primary text-sm self-center">B</span>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const decorative = await canvas.findByTestId("sep-decorative");
    expect(decorative).toHaveAttribute("role", "none");
    expect(decorative).not.toHaveAttribute("aria-orientation");

    const semanticH = await canvas.findByTestId("sep-semantic-h");
    expect(semanticH).toHaveAttribute("role", "separator");
    expect(semanticH).toHaveAttribute("aria-orientation", "horizontal");

    const semanticV = await canvas.findByTestId("sep-semantic-v");
    expect(semanticV).toHaveAttribute("role", "separator");
    expect(semanticV).toHaveAttribute("aria-orientation", "vertical");
  },
};
