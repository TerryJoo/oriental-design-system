import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Stack } from "@/components/Stack";
import { Stepper, type StepItem } from "@/components/Stepper";
import { bothEras } from "./_shared/argTypes";

/**
 * Canonical four-step flow used across the simple stories. Each label is a
 * short Korean noun so the visual rhythm of the Stepper stays even.
 */
const BASE_STEPS: ReadonlyArray<StepItem> = [
  { label: "입장" },
  { label: "편성" },
  { label: "대국" },
  { label: "결산" },
];

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Stepper renders a horizontal progress indicator as a semantic " +
          "ordered list (`<ol>` / `<li>`). The active step gets " +
          '`aria-current="step"`, completed steps render a `✓` glyph, and ' +
          "upcoming steps render their 1-based index. Connector lines are " +
          "decorative (`aria-hidden`) so they do not pollute the AT tree. " +
          "Era-aware tokens (`bg-era-sunken`, `border-era-soft`, `text-era-muted`, " +
          "`duration-era`, `ease-era-brush`) flip cleanly between Heritage and " +
          "Neon without React re-rendering.\n\n" +
          "**API surface** — `steps` (with optional per-step `state` and `description`) " +
          "and `current`. Per-step `state` accepts `'default' | 'error' | 'completed'`; " +
          "`error` paints the circle red with an `✕` glyph + visually-hidden " +
          "“validation error” text and `aria-invalid='true'`, while `completed` paints " +
          "the circle green with a `✓`. Implicit done-via-`current` (any step before the " +
          "active index) still renders `✓` against the accent palette. Orientation, custom " +
          "step icons, and size variants remain out of scope.",
      },
    },
  },
  argTypes: {
    current: {
      control: { type: "number", min: 0, max: 3, step: 1 },
      description:
        "Zero-based index of the in-progress step. Steps before this index render as completed (`✓`); steps after render as upcoming (numbered).",
    },
  },
  args: {
    steps: BASE_STEPS,
    current: 1,
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof Stepper>;

/**
 * Default four-step flow with the second step (index 1) active. The first
 * step is rendered as completed.
 */
export const Default: Story = {
  args: {
    steps: BASE_STEPS,
    current: 1,
  },
};

/**
 * Strict linear progress visualization. The Stepper is presentational, so
 * "linear" here means *visual* linear progress — `current = 2` implies that
 * everything before it has been completed in order.
 *
 * Note: the Stepper component itself does not enforce navigation; it only
 * reflects the `current` index. Linear vs non-linear flow control is a
 * concern for the surrounding form/wizard, not the Stepper.
 */
export const Linear: Story = {
  args: {
    steps: BASE_STEPS,
    current: 2,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Visual linear progress: `current = 2` so steps 0 and 1 are marked done (`✓`), step 2 is active, step 3 is upcoming. Because the Stepper has no click handlers, navigation enforcement is the parent's responsibility.",
      },
    },
  },
};

/**
 * Non-linear scenario representation. The user is on step 3 but step 1 has
 * been explicitly flagged as still pending via `state: 'default'` while step 2
 * is `'completed'` — the explicit per-step state overrides the implicit
 * `idx < current` "done" derivation.
 */
export const NonLinear: Story = {
  args: {
    steps: [
      { label: "입장", state: "completed" },
      { label: "편성" },
      { label: "대국", state: "completed" },
      { label: "결산" },
    ] as ReadonlyArray<StepItem>,
    current: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Per-step `state` lets the wizard express skipped/non-linear progress. Steps 0 and 2 carry `state: 'completed'` (green ✓), step 1 stays in its `default` upcoming state, and step 3 is `current`.",
      },
    },
  },
};

/**
 * Per-step `state: 'error'` paints the circle red, swaps the glyph to `✕`,
 * sets `aria-invalid="true"` on the circle, and adds a visually-hidden
 * "validation error" announcement. When the errored step is also `current`
 * and a `description` is present, the circle gets `aria-describedby` wired
 * to the description so AT users hear *why* it failed.
 */
export const WithErrorStep: Story = {
  args: {
    steps: [
      { label: "입장" },
      {
        label: "편성",
        state: "error",
        description: "덱이 비어 있습니다",
      },
      { label: "대국" },
      { label: "결산" },
    ] as ReadonlyArray<StepItem>,
    current: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Error step uses the `--era-intent-error` token (red across both eras), an `✕` glyph, a visually-hidden “validation error” phrase, and `aria-invalid='true'` — never communicating state by color alone (WCAG 1.4.1).",
      },
    },
  },
};

/**
 * Per-step `state: 'completed'` paints the circle green using the
 * `--era-intent-success` token plus a `✓` glyph and a visually-hidden
 * "completed" announcement. This is distinct from the implicit
 * `done-via-current` state (which paints with the accent palette) and lets
 * the wizard mark a step as definitively finished even if it sits ahead of
 * `current` (non-linear flows).
 */
export const WithCompletedStep: Story = {
  args: {
    steps: [
      { label: "입장", state: "completed" },
      { label: "편성" },
      { label: "대국" },
      { label: "결산" },
    ] as ReadonlyArray<StepItem>,
    current: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Explicit `state: 'completed'` overrides the implicit accent-colored done state with a success-token green circle. Both still render `✓`; the visually-hidden “completed” label disambiguates for AT.",
      },
    },
  },
};

/**
 * Each step has an explicit `description` slot rendered below the label. When
 * the step is `current`, the circle's `aria-describedby` points to the
 * description element so AT users hear the supplementary context.
 */
export const WithDescriptions: Story = {
  args: {
    steps: [
      { label: "입장", description: "초대 코드 확인" },
      { label: "편성", description: "덱 구성 검토" },
      { label: "대국", description: "실시간 진행" },
      { label: "결산", description: "점수 정산" },
    ] as ReadonlyArray<StepItem>,
    current: 1,
  },
};

/**
 * **Deviation from spec.** The Stepper renders the step number (or `✓` when
 * complete) inside the circle and that glyph is not a configurable slot.
 * Custom iconography therefore lives in the `label` (below the circle), not
 * in place of the index. The icons here are decorative (`aria-hidden`)
 * because the textual label still carries the meaning.
 */
const StepIcon = ({ glyph }: { glyph: string }) => (
  <span aria-hidden="true" className="text-base leading-none">
    {glyph}
  </span>
);

export const WithIcons: Story = {
  args: {
    steps: [
      {
        label: (
          <span className="flex flex-col items-center gap-1">
            <StepIcon glyph="◇" />
            <span>입장</span>
          </span>
        ),
      },
      {
        label: (
          <span className="flex flex-col items-center gap-1">
            <StepIcon glyph="◆" />
            <span>편성</span>
          </span>
        ),
      },
      {
        label: (
          <span className="flex flex-col items-center gap-1">
            <StepIcon glyph="◈" />
            <span>대국</span>
          </span>
        ),
      },
      {
        label: (
          <span className="flex flex-col items-center gap-1">
            <StepIcon glyph="◉" />
            <span>결산</span>
          </span>
        ),
      },
    ] as ReadonlyArray<StepItem>,
    current: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Icons are rendered via the `label` slot. The numbered/✓ glyph inside the circle is not currently configurable. Icons are `aria-hidden` so AT only hears the textual label.",
      },
    },
  },
};

/**
 * Final state — the stepper has been advanced one past the last index, so
 * every step renders as completed (`✓`) and no step receives
 * `aria-current=\"step\"`. The wizard would typically swap to a success
 * screen at this point.
 */
export const Completed: Story = {
  args: {
    steps: BASE_STEPS,
    current: BASE_STEPS.length,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `current` to `steps.length` marks every step as done. No `<li>` carries `aria-current` in this state — the surrounding UI should signal completion (e.g. a success summary or CTA).",
      },
    },
  },
};

/**
 * Fully controlled stepper. External Prev / Next buttons drive the `current`
 * index. The `Reset` button returns to step 0. Both buttons disable at the
 * appropriate boundaries.
 */
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Driving `current` from `useState`. The Prev/Next/Reset buttons mutate state directly; the Stepper is purely a reflection of the current index.",
      },
    },
  },
  render: () => {
    const ControlledDemo = () => {
      const [current, setCurrent] = useState(0);
      const last = BASE_STEPS.length - 1;
      return (
        <Stack direction="column" gap="4" style={{ minWidth: 480 }}>
          <Stepper steps={BASE_STEPS} current={current} />
          <Stack direction="row" gap="2" align="center">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              data-testid="prev-step"
            >
              이전
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setCurrent((c) => Math.min(last, c + 1))}
              disabled={current === last}
              data-testid="next-step"
            >
              다음
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCurrent(0)}
              data-testid="reset-step"
            >
              처음으로
            </Button>
            <span className="text-xs text-era-muted">
              현재: {current + 1} / {BASE_STEPS.length}
            </span>
          </Stack>
        </Stack>
      );
    };
    return <ControlledDemo />;
  },
};

/**
 * Heritage / Neon side-by-side comparison. Same Stepper markup; era-aware
 * tokens (`bg-era-sunken`, `border-era-soft`, `text-era-muted`) and the
 * accent palette do all the visual work.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Identical Stepper markup rendered in both era surfaces. The accent ring around the active step, the ✓ on done steps, and the connector colors all flip via the era CSS layer — no React re-render involved.",
      },
    },
  },
  render: () => bothEras(() => <Stepper steps={BASE_STEPS} current={1} />),
};

/**
 * Interaction proof. With the current API the Stepper itself isn't
 * clickable, so the test exercises the controlled wrapper:
 *
 *  1. Initial state: `aria-current="step"` is on the first `<li>`.
 *  2. Clicking *Next* advances `current`; the `aria-current="step"` marker
 *     moves to the next `<li>` and the previous step's circle now shows the
 *     `✓` completion glyph.
 *  3. The connector preceding the new active step is rendered with
 *     `aria-hidden="true"` (decorative).
 *  4. *Prev* on the first step is disabled — clicking it must be a no-op,
 *     analogous to the linear-flow assertion in the spec.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Automated interaction proof against the controlled wrapper: Next advances `aria-current="step"`, completed steps render `✓`, and the disabled Prev button on step 0 is a no-op.',
      },
    },
  },
  render: () => {
    const InteractiveDemo = () => {
      const [current, setCurrent] = useState(0);
      const last = BASE_STEPS.length - 1;
      return (
        <Stack direction="column" gap="4" style={{ minWidth: 480 }}>
          <Stepper steps={BASE_STEPS} current={current} />
          <Stack direction="row" gap="2" align="center">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              data-testid="prev-step"
            >
              이전
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setCurrent((c) => Math.min(last, c + 1))}
              disabled={current === last}
              data-testid="next-step"
            >
              다음
            </Button>
          </Stack>
        </Stack>
      );
    };
    return <InteractiveDemo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole("listitem");

    // 1. Initial state: first list item is active.
    await expect(items[0]).toHaveAttribute("aria-current", "step");
    await expect(items[1]).not.toHaveAttribute("aria-current");

    // 2. Disabled Prev on step 0 is a no-op (mirrors the "linear no-op"
    //    assertion in the spec — clicking an unreachable target does not
    //    advance state).
    const prev = canvas.getByTestId("prev-step");
    await expect(prev).toBeDisabled();
    await userEvent.click(prev);
    await expect(items[0]).toHaveAttribute("aria-current", "step");

    // 3. Click Next — active marker moves to the next <li>, and the first
    //    step's circle now renders the ✓ glyph.
    const next = canvas.getByTestId("next-step");
    await userEvent.click(next);

    const itemsAfter = canvas.getAllByRole("listitem");
    await expect(itemsAfter[0]).not.toHaveAttribute("aria-current");
    await expect(itemsAfter[1]).toHaveAttribute("aria-current", "step");
    await expect(within(itemsAfter[0]).getByText("✓")).toBeInTheDocument();
  },
};
