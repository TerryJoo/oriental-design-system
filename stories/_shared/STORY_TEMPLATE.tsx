/**
 * Story standard template — copy this file as `stories/<Component>.stories.tsx`
 * and replace the placeholder `MyComponent` import with the real one.
 *
 * This file is intentionally NOT named `*.stories.tsx`, so Storybook's glob
 * (`stories/**\/*.stories.@(js|jsx|mjs|ts|tsx)` in `.storybook/main.ts`) will
 * NOT pick it up. It only exists as a copy-paste starting point that the
 * Story Checklist in `CLAUDE.md` is structured around.
 *
 * Usage:
 *   1. cp stories/_shared/STORY_TEMPLATE.tsx stories/<Component>.stories.tsx
 *   2. Replace `MyComponent` (and the local placeholder definition) with the
 *      real `import { ComponentName } from "@/components/ComponentName";`
 *   3. Replace VARIANT_OPTIONS / SIZE_OPTIONS with the component's real
 *      union types (import them from `<Component>.styles.ts` when possible).
 *   4. Walk the Story Checklist in `CLAUDE.md` ("Adding a New Component" →
 *      "Story checklist") and tick each box before committing.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import type { ReactNode } from "react";
import {
  bothEras,
  commonStateArgs,
  radioArg,
  selectArg,
  // boolArg,  // ← uncomment for one-off boolean toggles outside the
  //              standard `disabled`/`loading` pair.
} from "./argTypes";

// ---------------------------------------------------------------------------
// Placeholder component
// ---------------------------------------------------------------------------
//
// Replace the entire block below with a single import line, e.g.:
//   import { Component } from "@/components/Component";
//
// The placeholder lives here so the template type-checks in isolation. It is
// not meant to be functional; its only job is to give Storybook a typed
// component shape that mirrors a typical design-system component contract:
//   - variant   (selectArg, > 3 options)
//   - size      (sizeArg / radioArg, ≤ 3 options)
//   - disabled  (boolArg / commonStateArgs.disabled)
//   - onClick   (callback covered by a play function)
//   - children  (slot content)

type MyVariant = "primary" | "secondary" | "ghost" | "danger";
type MySize = "sm" | "md" | "lg";

interface MyComponentProps {
  variant?: MyVariant;
  size?: MySize;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

/**
 * Placeholder component. Replace with the real import. The element is a
 * <button> only so play-function interactions (`userEvent.click`) work
 * out-of-the-box against the template; your real component may be anything.
 */
function MyComponent({
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  children,
}: MyComponentProps) {
  return (
    <button
      type="button"
      data-variant={variant}
      data-size={size}
      data-testid="my-component"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md border border-era-soft bg-era-base px-3 py-2 text-sm font-medium text-era-primary shadow-era-card"
    >
      {children}
    </button>
  );
}
// ---------------------------------------------------------------------------

// Option lists used by argTypes. When the component exports its own union
// types (recommended), import them from `<Component>.styles.ts` instead of
// re-declaring the literal arrays here.
const VARIANT_OPTIONS: readonly MyVariant[] = [
  "primary",
  "secondary",
  "ghost",
  "danger",
] as const;

const SIZE_OPTIONS: readonly MySize[] = ["sm", "md", "lg"] as const;

const meta = {
  // Title MUST follow `Components/<ComponentName>` so storySort in
  // preview.ts can group your component under the Components category.
  title: "Components/MyComponent",
  component: MyComponent,
  // The global preview already enables autodocs, but keeping the tag local
  // makes the intent explicit and survives any future preview-level opt-out.
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          // 1–3 sentences describing the component's purpose and key API.
          // Mention controlled vs uncontrolled, era-awareness, and any known
          // gaps (e.g., keyboard nav not yet implemented).
          "MyComponent is a placeholder. Replace this description with one " +
          "that names the component, summarises its main props, and calls " +
          "out anything era-specific or accessibility-relevant.",
      },
    },
  },
  argTypes: {
    // Always prefer the shared builders over hand-rolled control objects —
    // they keep `description`, `control.type`, and `options` in sync across
    // every story file.
    variant: selectArg(VARIANT_OPTIONS, "Visual variant"),
    size: radioArg(SIZE_OPTIONS, "Size token"),
    // commonStateArgs bundles `disabled` and `loading`. Spread it when you
    // need both; pull individual builders (boolArg) for one-offs.
    ...commonStateArgs,
  },
  args: {
    // Default arg values used by every story unless overridden.
    variant: "primary",
    size: "md",
    disabled: false,
    children: "Click me",
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// 1. Default — single canonical example.
// ---------------------------------------------------------------------------
export const Default: Story = {};

// ---------------------------------------------------------------------------
// 2. Variants — one render per visual variant. If the variant set is small
//    (≤ 4) prefer a single `Variants` story that lays them out side-by-side.
// ---------------------------------------------------------------------------
export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every visual variant rendered side-by-side so docs readers can compare them at a glance.",
      },
    },
  },
  render: (args) => (
    <div className="flex items-center gap-3">
      {VARIANT_OPTIONS.map((variant) => (
        <MyComponent key={variant} {...args} variant={variant}>
          {variant}
        </MyComponent>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 3. Sizes — one render per size token. Drop this story if the component
//    has no size axis.
// ---------------------------------------------------------------------------
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {SIZE_OPTIONS.map((size) => (
        <MyComponent key={size} {...args} size={size}>
          {size}
        </MyComponent>
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 4. State stories — one per non-default state (Disabled / Loading / Error
//    / etc). Keep them as small `args`-only stories.
// ---------------------------------------------------------------------------
export const Disabled: Story = {
  args: { disabled: true },
};

// ---------------------------------------------------------------------------
// 5. EraCompare — Heritage vs Neon side-by-side. This is the ONLY story that
//    should call `bothEras`. Every other story should rely on the global
//    Era toolbar (`withEra` decorator in preview.ts).
// ---------------------------------------------------------------------------
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same markup rendered in Heritage and Neon to verify era-aware tokens flip cleanly without any React re-render.",
      },
    },
  },
  render: (args) =>
    bothEras(() => <MyComponent {...args}>{args.children}</MyComponent>),
};

// ---------------------------------------------------------------------------
// 6. Interactive — automated play function. Verifies real behavior the
//    component supports (click, keyboard, focus). Don't assert against
//    features the component doesn't implement.
//
//    NOTE on action args: callbacks consumed inside a play function MUST be
//    declared explicitly on `args` using `fn()` from `@storybook/test`.
//    Storybook 8's test-runner does NOT auto-create them from
//    `parameters.actions.argTypesRegex`.
//
//    NOTE on transitions: components with `transition-colors duration-era`
//    (~380ms) can leak mid-flight pixels into axe sampling. After a click or
//    keyboard interaction that triggers a color change, wrap focus/contrast
//    assertions in `waitFor(() => expect(...).to...)` so axe samples the
//    settled state.
// ---------------------------------------------------------------------------
export const Interactive: Story = {
  args: {
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Automated proof that pointer and keyboard activation both invoke `onClick`, and that the component reaches its post-interaction state cleanly.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId("my-component");

    // 1. Pointer activation invokes the callback.
    await userEvent.click(trigger);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // 2. Keyboard activation: focus moves via Tab and Space activates.
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ }");
    await expect(args.onClick).toHaveBeenCalledTimes(2);

    // 3. Wait for any era transitions to settle before any contrast / focus
    //    assertion that axe would resample. Replace this assertion with
    //    something meaningful for your component (e.g. the active state's
    //    aria-* attribute or a class-list check).
    await waitFor(() =>
      expect(trigger).toHaveAttribute(
        "data-variant",
        args.variant ?? "primary",
      ),
    );
  },
};
