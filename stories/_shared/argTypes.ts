import type { ArgTypes, Decorator } from "@storybook/react";
import { createElement, type ReactNode } from "react";
import { applyEra, type EraName } from "../../src/themes";

/**
 * Build a `select` argType from a fixed list of options.
 * Use for variants/styles where option count > 3.
 */
export const selectArg = <T extends string>(
  options: readonly T[],
  description?: string,
) => ({
  control: { type: "select" as const },
  options: [...options],
  description,
});

/**
 * Build a `radio` argType. Use for sizes/shapes where option count <= 3.
 */
export const radioArg = <T extends string>(
  options: readonly T[],
  description?: string,
) => ({
  control: { type: "radio" as const },
  options: [...options],
  description,
});

/** Boolean toggle. */
export const boolArg = (description?: string) => ({
  control: { type: "boolean" as const },
  description,
});

/**
 * Standard size argType (sm | md | lg). Components with non-standard sizes
 * (Avatar's xl, Filter's sm/md only, etc.) should declare their own.
 */
export const sizeArg = (description = "Size variant") =>
  radioArg(["sm", "md", "lg"] as const, description);

/** Standard disabled state. */
export const disabledArg = boolArg("Disabled state");

/** Standard loading state. */
export const loadingArg = boolArg("Loading state");

/**
 * Common state args bundle for interactive components.
 * Spread into a story's `argTypes` to get disabled+loading consistently.
 */
export const commonStateArgs = {
  disabled: disabledArg,
  loading: loadingArg,
} satisfies ArgTypes;

/**
 * Force a specific era inside a story regardless of the toolbar global.
 * Use ONLY for stories that demonstrate era-specific behavior side-by-side
 * (e.g., a "Heritage vs Neon" comparison panel). For all other stories,
 * rely on the global `era` toolbar — the `withEra` decorator in preview.ts
 * will reapply on every render.
 */
export const forceEra = (era: EraName): Decorator => {
  const decorator: Decorator = (Story) => {
    const ref = (node: HTMLDivElement | null) => {
      if (node) applyEra(node, era);
    };
    return createElement(
      "div",
      { ref, style: { display: "contents" } },
      createElement(Story),
    );
  };
  return decorator;
};

/**
 * Side-by-side renderer for Heritage vs Neon comparison stories.
 *
 * ```tsx
 * export const EraCompare: Story = {
 *   render: (args) => bothEras((props) => <Button {...args} {...props} />),
 * };
 * ```
 */
export const bothEras = (render: (props: { era: EraName }) => ReactNode) =>
  createElement(
    "div",
    { className: "grid grid-cols-2 gap-6 p-4" },
    createElement(EraPanel, { era: "heritage", render }),
    createElement(EraPanel, { era: "neon", render }),
  );

const EraPanel = ({
  era,
  render,
}: {
  era: EraName;
  render: (props: { era: EraName }) => ReactNode;
}) => {
  const ref = (node: HTMLDivElement | null) => {
    if (node) applyEra(node, era);
  };
  // Era-aware tokens drive surface and ink, so the panel inherits the era's
  // contrast pair without any opacity tricks. The earlier inline styles used
  // `--era-text-primary` (a typo of `--era-ink-primary`) and `opacity: 0.6`
  // on the label, which together accounted for ~90 axe color-contrast
  // violations across every `EraCompare` story. The label now uses
  // `text-era-muted` — a token specifically tuned for AA-compliant muted text
  // in both eras.
  return createElement(
    "div",
    {
      ref,
      "data-era-panel": era,
      className: "min-h-[120px] rounded-xl bg-era-base p-6 text-era-primary",
    },
    createElement(
      "div",
      {
        className:
          "mb-3 text-xs uppercase tracking-[0.08em] text-era-muted font-era-body",
      },
      era,
    ),
    render({ era }),
  );
};
