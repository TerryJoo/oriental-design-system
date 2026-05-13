import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { EraSwitch } from "@/components/EraSwitch";
import { Card } from "@/components/Card";
import { Typography } from "@/components/Typography";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import type { EraName } from "@/themes";
import { boolArg, bothEras, radioArg } from "./_shared/argTypes";

const SIZE_OPTIONS = ["sm", "md", "lg"] as const;
const ERA_OPTIONS = ["heritage", "neon"] as const;

const meta = {
  title: "Components/EraSwitch",
  component: EraSwitch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`EraSwitch` is the consumer-facing toggle for flipping between the " +
          "Heritage (過) and Neon (現) era layers. It is itself a `forwardRef` " +
          'component that exposes a `role="tablist"` with two `role="tab"` ' +
          "buttons. By default it calls `applyEra(document.documentElement, …)` " +
          "so the entire page reacts; set `applyToDocument={false}` to use it as " +
          "a pure UI demo without side effects. Storybook's top-bar **Era** " +
          "toolbar drives the same `applyEra` call via the preview decorator — " +
          "they are complementary surfaces of the same primitive.",
      },
    },
  },
  argTypes: {
    size: radioArg(SIZE_OPTIONS, "Size token"),
    defaultEra: radioArg(ERA_OPTIONS, "Initial era when uncontrolled"),
    applyToDocument: boolArg(
      "Apply era to document.documentElement on selection",
    ),
  },
  args: {
    size: "md",
    defaultEra: "heritage",
    applyToDocument: true,
  },
} satisfies Meta<typeof EraSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <EraSwitch size="sm" applyToDocument={false} />
      <EraSwitch size="md" applyToDocument={false} />
      <EraSwitch size="lg" applyToDocument={false} />
    </div>
  ),
};

export const CustomLabels: Story = {
  args: {
    applyToDocument: false,
    labels: {
      heritage: <>傳統 Tradition</>,
      neon: <>未來 Future</>,
    },
  },
};

export const LiveDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Click the EraSwitch to flip the era layer at runtime. The Card, " +
          "Typography, Badges, and Button all read from era CSS variables " +
          "(`--era-surface-*`, `--era-ink-*`, `--era-shadow-*`, `--font-*`) " +
          "and re-paint without any React re-render of their own.",
      },
    },
  },
  render: () => {
    function LiveSurface() {
      const [era, setEra] = useState<EraName>("heritage");
      return (
        <div className="flex w-full max-w-2xl flex-col items-center gap-6">
          <EraSwitch era={era} onEraChange={setEra} size="md" applyToDocument />

          <Card
            variant="default"
            padding="lg"
            className="w-full transition duration-era ease-era-brush"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Typography variant="h2">
                  {era === "heritage" ? "過 · Heritage" : "現 · Neon"}
                </Typography>
                <Badge variant="primary" dot>
                  {era}
                </Badge>
              </div>

              <Typography variant="body" tone="muted">
                The era layer swaps CSS custom properties on{" "}
                <code>:root[data-era]</code>. Components keep reading the same
                semantic slots — only the painted result changes.
              </Typography>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Synced</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="error" pulse>
                  Alert
                </Badge>
                <Badge variant="info">Info</Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return <LiveSurface />;
  },
};

export const WithToolbar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Storybook's top-bar **Era** toolbar (globe icon) calls the same " +
          "`applyEra(document.documentElement, …)` underneath. Use it for the " +
          "developer-side preview; ship `EraSwitch` to end users when you want " +
          "them to flip eras themselves. They are complementary surfaces — both " +
          "drive the `[data-era]` attribute and the inlined era variables. " +
          "When the toolbar is set, this story's switch is rendered with " +
          "`applyToDocument={false}` so it remains a pure UI demo and does " +
          "not fight the toolbar.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-xl flex-col items-start gap-4">
      <Typography variant="caption" tone="muted">
        Toggle the toolbar globe icon ↑ to drive the page era. The switch below
        is presentational only.
      </Typography>
      <EraSwitch applyToDocument={false} />
      <Card variant="default" padding="md" className="w-full">
        <Typography variant="body-sm" tone="muted">
          This card paints from era variables — the toolbar still controls it
          even though the switch above does not.
        </Typography>
      </Card>
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side. The switch itself is rendered with
 * `applyToDocument={false}` inside each panel so the panel-scoped
 * `applyEra` from `bothEras` drives the visual styling without competing
 * with the document-level era state. Each panel pre-selects the matching
 * era so the active segment styling is visible side-by-side.
 *
 * Edge case worth noting: `EraSwitch` is itself the era toggle, so an
 * `EraCompare` story for it is meta — it shows the toggle's *visual
 * styling* under each era rather than driving the era for surrounding
 * components.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `EraSwitch` rendered in Heritage and Neon panels with `applyToDocument={false}` so the panel-scoped era drives the visual styling. Demonstrates the toggle's own surface, ink, and active-segment treatment under each era.",
      },
    },
  },
  render: () =>
    bothEras(({ era }) => (
      <EraSwitch defaultEra={era} applyToDocument={false} />
    )),
};

/**
 * Automated interaction test. Verifies:
 *   1. The component exposes `role="tablist"` with two `role="tab"` buttons.
 *   2. The pre-selected era (`defaultEra="heritage"`) reports
 *      `aria-selected="true"`; the other is `"false"`.
 *   3. Clicking the inactive tab flips both `aria-selected` flags and fires
 *      `onEraChange` with the new era name.
 *   4. Keyboard activation (Space) on a focused tab also flips the selection.
 */
export const Interactive: Story = {
  args: {
    applyToDocument: false,
    defaultEra: "heritage",
    onEraChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that the tablist exposes the WAI-ARIA tab pattern, that pointer + keyboard activation both flip the selection, and that `onEraChange` fires with the new era name.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. Tablist is exposed with both tabs reachable.
    const tablist = canvas.getByRole("tablist");
    await expect(tablist).toBeInTheDocument();

    const tabs = canvas.getAllByRole("tab");
    await expect(tabs).toHaveLength(2);

    const heritageTab = tabs.find(
      (t) => t.getAttribute("data-era-target") === "heritage",
    );
    const neonTab = tabs.find(
      (t) => t.getAttribute("data-era-target") === "neon",
    );
    if (!heritageTab || !neonTab) {
      throw new Error("expected both heritage and neon tabs");
    }

    // 2. Initial selection reflects defaultEra="heritage".
    await expect(heritageTab).toHaveAttribute("aria-selected", "true");
    await expect(neonTab).toHaveAttribute("aria-selected", "false");

    // 3. Pointer click on the inactive tab flips selection and fires the
    //    callback with the new era name.
    await userEvent.click(neonTab);
    await expect(neonTab).toHaveAttribute("aria-selected", "true");
    await expect(heritageTab).toHaveAttribute("aria-selected", "false");
    await expect(args.onEraChange).toHaveBeenLastCalledWith("neon");

    // 4. Keyboard Space on the heritage tab flips back.
    heritageTab.focus();
    await expect(heritageTab).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(heritageTab).toHaveAttribute("aria-selected", "true");
    await expect(args.onEraChange).toHaveBeenLastCalledWith("heritage");
  },
};
