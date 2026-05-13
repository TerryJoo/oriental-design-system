import type { Meta, StoryObj } from "@storybook/react";
import { useState, type CSSProperties } from "react";
import { animations } from "@/tokens/animations";

// ---------------------------------------------------------------------------
// Token-driven helpers — never hardcode the duration / easing list.
// ---------------------------------------------------------------------------

type DurationEntry = readonly [string, string];
type EasingEntry = readonly [string, string];

function durationEntries(): DurationEntry[] {
  return Object.entries(animations.transitionDuration).map(
    ([k, v]) => [k, v] as DurationEntry,
  );
}

function easingEntries(): EasingEntry[] {
  return Object.entries(animations.transitionTimingFunction).map(
    ([k, v]) => [k, v] as EasingEntry,
  );
}

// ---------------------------------------------------------------------------
// Animated demo bar — replays on click via key bump.
// ---------------------------------------------------------------------------

interface DemoBarProps {
  duration: string;
  easing?: string;
}

function DemoBar({ duration, easing = "linear" }: DemoBarProps) {
  const [tick, setTick] = useState(0);
  const style: CSSProperties = {
    animationDuration: duration,
    animationTimingFunction: easing,
    animationName: "tokens-anim-slide",
    animationIterationCount: 1,
    animationFillMode: "both",
  };
  return (
    <button
      type="button"
      onClick={() => setTick((t) => t + 1)}
      aria-label="Replay animation"
      className="relative flex h-6 w-48 items-center overflow-hidden rounded bg-era-sunken border border-era-soft cursor-pointer"
    >
      <style>{`@keyframes tokens-anim-slide { 0% { transform: translateX(-100%);} 100% { transform: translateX(0%);} }`}</style>
      <span
        key={tick}
        className="block h-full w-full bg-[rgb(var(--accent-500))]"
        style={style}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section primitives
// ---------------------------------------------------------------------------

function TokenRow({
  name,
  value,
  preview,
}: {
  name: string;
  value: string;
  preview: React.ReactNode;
}) {
  return (
    <tr className="border-b border-era/50 last:border-b-0">
      <td className="px-3 py-2 align-middle font-mono text-xs text-era-primary">
        {name}
      </td>
      <td className="px-3 py-2 align-middle font-mono text-xs text-era-muted">
        {value}
      </td>
      <td className="px-3 py-2 align-middle">{preview}</td>
    </tr>
  );
}

function TokenTable({
  caption,
  headers,
  children,
}: {
  caption: string;
  headers: [string, string, string];
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-era bg-era-base p-4 text-era-primary">
      <h3 className="mb-3 text-base font-semibold">{caption}</h3>
      <p className="mb-3 text-xs text-era-muted">
        Click any preview bar to replay the animation. Toggle the era toolbar to
        compare the active palette.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-era text-left text-xs uppercase tracking-wide text-era-muted">
              <th className="px-3 py-2 font-semibold">{headers[0]}</th>
              <th className="px-3 py-2 font-semibold">{headers[1]}</th>
              <th className="px-3 py-2 font-semibold">{headers[2]}</th>
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Animations",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Animation tokens — `transitionDuration` and `transitionTimingFunction` " +
          "from `src/tokens/animations.ts`. Bars replay on click. Era-specific " +
          "easings (brush / charge) and durations (era-fast / era / era-slow) flow " +
          "through CSS variables, so flipping the era toolbar updates the demos " +
          "without re-rendering React.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Durations: Story = {
  render: () => (
    <TokenTable
      caption="Transition Durations"
      headers={["Token", "Value", "Preview"]}
    >
      {durationEntries().map(([name, value]) => (
        <TokenRow
          key={name}
          name={name}
          value={value}
          preview={<DemoBar duration={value} />}
        />
      ))}
    </TokenTable>
  ),
};

export const Easings: Story = {
  render: () => (
    <TokenTable
      caption="Easing Curves"
      headers={["Token", "cubic-bezier(...)", "Preview"]}
    >
      {easingEntries().map(([name, value]) => (
        <TokenRow
          key={name}
          name={name}
          value={value}
          preview={<DemoBar duration="700ms" easing={value} />}
        />
      ))}
    </TokenTable>
  ),
};
