import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { borderRadius } from "@/tokens/spacing";

// ---------------------------------------------------------------------------
// Spacing scale. The Tailwind preset doesn't override the default spacing
// scale, so we reflect the canonical Tailwind 4-pt scale that components use
// throughout the system. (Driven by the CSS preset, not redeclared here.)
// ---------------------------------------------------------------------------

interface SpacingStep {
  /** Tailwind class suffix, e.g. "0.5", "2", "16" */
  step: string;
  /** Resolved CSS length */
  value: string;
}

// Canonical Tailwind defaults — kept in step format so the visual bar widths
// match exactly what `w-{step}` would render in the actual UI.
const SPACING_SCALE: ReadonlyArray<SpacingStep> = [
  { step: "0", value: "0px" },
  { step: "px", value: "1px" },
  { step: "0.5", value: "0.125rem" },
  { step: "1", value: "0.25rem" },
  { step: "1.5", value: "0.375rem" },
  { step: "2", value: "0.5rem" },
  { step: "2.5", value: "0.625rem" },
  { step: "3", value: "0.75rem" },
  { step: "3.5", value: "0.875rem" },
  { step: "4", value: "1rem" },
  { step: "5", value: "1.25rem" },
  { step: "6", value: "1.5rem" },
  { step: "8", value: "2rem" },
  { step: "10", value: "2.5rem" },
  { step: "12", value: "3rem" },
  { step: "16", value: "4rem" },
  { step: "20", value: "5rem" },
  { step: "24", value: "6rem" },
];

// Border radius — directly from src/tokens/spacing.ts.
type RadiusEntry = readonly [string, string];
function radiusEntries(): RadiusEntry[] {
  return Object.entries(borderRadius).map(([k, v]) => [k, v] as RadiusEntry);
}

// ---------------------------------------------------------------------------
// Spacing visualisation
// ---------------------------------------------------------------------------

function SpacingRow({ step, value }: SpacingStep) {
  // Bar width matches the literal CSS length so visual size is truthful.
  const style: CSSProperties = { width: value, minHeight: 12, height: 12 };
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 font-mono text-xs text-era-primary">{step}</span>
      <span className="w-20 font-mono text-xs text-era-muted">{value}</span>
      <span
        role="img"
        aria-label={`Spacing ${step}`}
        className="block rounded-sm bg-[rgb(var(--accent-500))]"
        style={style}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Radius visualisation
// ---------------------------------------------------------------------------

function RadiusSwatch({ name, value }: { name: string; value: string }) {
  // Some radii are in `rem`, some are pixels, some `9999px`. They all flow
  // through `borderRadius` here so the swatch shows the actual radius shape.
  const style: CSSProperties = { borderRadius: value };
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        role="img"
        aria-label={`Radius ${name}`}
        className="block h-24 w-24 bg-[rgb(var(--accent-500))]"
        style={style}
      />
      <span className="font-mono text-xs text-era-primary">{name}</span>
      <span className="font-mono text-[10px] text-era-muted">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Spacing & Radius",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Spacing and border-radius tokens. Spacing follows the canonical " +
          "Tailwind 4pt scale (the preset doesn't override it). Border radii " +
          "come from `src/tokens/spacing.ts`, including the project's semantic " +
          "tokens (button, card, pill, input, chat-bubble, seal).",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Spacing: Story = {
  render: () => (
    <div className="rounded-card border border-era bg-era-base p-6 text-era-primary">
      <h3 className="mb-1 text-base font-semibold">Spacing scale</h3>
      <p className="mb-5 text-xs text-era-muted">
        Each bar&apos;s width matches the literal CSS length so visual size is
        truthful. Use as <span className="font-mono">p-2</span>,{" "}
        <span className="font-mono">gap-4</span>,{" "}
        <span className="font-mono">mt-6</span>, etc.
      </p>
      <div className="flex flex-col gap-2">
        {SPACING_SCALE.map((s) => (
          <SpacingRow key={s.step} {...s} />
        ))}
      </div>
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="rounded-card border border-era bg-era-base p-6 text-era-primary">
      <h3 className="mb-1 text-base font-semibold">Border radius tokens</h3>
      <p className="mb-5 text-xs text-era-muted">
        Sourced from <span className="font-mono">src/tokens/spacing.ts</span>{" "}
        (re-exported by the Tailwind preset as{" "}
        <span className="font-mono">rounded-card</span>,{" "}
        <span className="font-mono">rounded-button</span>,{" "}
        <span className="font-mono">rounded-pill</span>,{" "}
        <span className="font-mono">rounded-input</span>,{" "}
        <span className="font-mono">rounded-chat-bubble</span>,{" "}
        <span className="font-mono">rounded-seal</span>).
      </p>
      <div className="grid grid-cols-3 gap-6 md:grid-cols-4 lg:grid-cols-6">
        {radiusEntries().map(([name, value]) => (
          <RadiusSwatch key={name} name={name} value={value} />
        ))}
      </div>
    </div>
  ),
};
