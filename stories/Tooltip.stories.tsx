import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Tooltip, type TooltipPlacement } from "@/components/Tooltip";
import { boolArg, bothEras, selectArg } from "./_shared/argTypes";

const PLACEMENTS = [
  "top",
  "bottom",
  "left",
  "right",
] as const satisfies readonly TooltipPlacement[];

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Lightweight hover/focus tooltip with era-aware ink surface and shadow tokens.",
          "",
          'Follows the WAI-ARIA Tooltip pattern: the bubble carries `role="tooltip"` and a generated',
          "`id`, and the trigger child is cloned to receive `aria-describedby={tooltipId}` while open",
          "(merged with any consumer-provided value). On close the contribution is removed. The bubble",
          "appears on hover (mouse) and focus (keyboard). On touch devices, hover is unreliable —",
          "users typically rely on a longpress affordance or focus fallback (this build relies on focus).",
          "",
          "**API note:** `children` must be a single React element (enforced via `Children.only`). Wrap",
          "raw strings or fragments in a focusable element such as a `<button>` or `<span tabIndex={0}>`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    placement: selectArg(
      PLACEMENTS,
      "Where the bubble appears relative to the trigger",
    ),
    open: boolArg("Manually controlled open state (overrides hover/focus)"),
    content: { control: "text", description: "Bubble content" },
  },
  args: {
    content: "툴팁 내용",
    placement: "top",
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary">Hover me</Button>
    </Tooltip>
  ),
};

export const Placements: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All four supported placements arranged in a 3×3 cross pattern around their triggers. " +
          "Tooltips are forced open via the `open` prop so all four are visible simultaneously.",
      },
    },
  },
  render: () => {
    const cell = "flex items-center justify-center min-h-[72px]";
    return (
      <div className="grid grid-cols-3 gap-6 p-12 place-items-center">
        <div className={cell} />
        <div className={cell}>
          <Tooltip content="top" placement="top" open>
            <Button variant="secondary" size="sm">
              top
            </Button>
          </Tooltip>
        </div>
        <div className={cell} />

        <div className={cell}>
          <Tooltip content="left" placement="left" open>
            <Button variant="secondary" size="sm">
              left
            </Button>
          </Tooltip>
        </div>
        <div className={cell}>
          <span className="text-era-secondary text-xs uppercase tracking-widest">
            trigger
          </span>
        </div>
        <div className={cell}>
          <Tooltip content="right" placement="right" open>
            <Button variant="secondary" size="sm">
              right
            </Button>
          </Tooltip>
        </div>

        <div className={cell} />
        <div className={cell}>
          <Tooltip content="bottom" placement="bottom" open>
            <Button variant="secondary" size="sm">
              bottom
            </Button>
          </Tooltip>
        </div>
        <div className={cell} />
      </div>
    );
  },
};

export const WithDelay: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "**Spec deviation:** the current `Tooltip` API does not expose `openDelay` / `closeDelay`",
          "props — open/close are immediate transitions driven by `mouseenter` / `mouseleave` and",
          "`focus` / `blur`. This story documents the absence so consumers know hover commits",
          "instantly. Recommend adding `openDelay` / `closeDelay` to match common WAI-ARIA tooltip",
          "patterns (e.g., 150–300 ms open delay to suppress accidental flicker on transit).",
        ].join("\n"),
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Tooltip content="즉시 열림 (no delay)">
        <Button variant="secondary">Immediate</Button>
      </Tooltip>
      <span className="text-era-secondary text-xs">
        delay props not yet implemented
      </span>
    </div>
  ),
};

export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Wave 5b2-C3 overflow proof. The bubble caps at `max-w-[16rem]` and uses " +
          "`whitespace-normal`, so long copy wraps onto multiple lines instead of pushing the " +
          "bubble off-canvas (the previous `whitespace-nowrap` flagged in C3). Short tips remain " +
          "single-line because they don't reach the cap.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-6 p-12">
      <Tooltip content="A short tip." open>
        <Button variant="secondary" size="sm">
          short
        </Button>
      </Tooltip>
      <Tooltip
        content="This tooltip wraps onto multiple lines once it exceeds the 16rem ceiling, instead of forcing the bubble off-screen on a single line."
        open
      >
        <Button variant="secondary" size="sm">
          long (wraps)
        </Button>
      </Tooltip>
    </div>
  ),
};

export const LongText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Wave 5b2-C3: a 100-character tooltip wraps inside the 16rem ceiling. Verifies the bubble " +
          "no longer extends horizontally beyond its trigger and keeps the content readable across " +
          "multiple lines.",
      },
    },
  },
  render: () => (
    <div className="flex items-center justify-center min-h-[200px] p-12">
      <Tooltip
        content="이 툴팁은 일부러 길게 작성한 100자 이상 분량의 안내문이며, 16rem 한계를 넘는 경우에는 자동으로 줄바꿈되어 화면 밖으로 밀려나지 않습니다."
        open
      >
        <Button variant="secondary" size="sm">
          100자 툴팁
        </Button>
      </Tooltip>
    </div>
  ),
};

export const RichContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tooltip `content` accepts any `ReactNode`, so callers can mix bold text, inline " +
          "code, icons, or compact key/value pairs. Keep content terse — tooltips are for " +
          "supplemental description, not primary content.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-6 p-10">
      <Tooltip
        content={
          <span className="inline-flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <strong className="font-semibold">Heads up</strong>
            <code className="text-[10px] opacity-80">aria-describedby</code>
          </span>
        }
        open
      >
        <Button variant="secondary" size="sm">
          Rich
        </Button>
      </Tooltip>
    </div>
  ),
};

export const OnDisabledTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "Native `disabled` buttons swallow pointer events in some browsers, so wrapping a",
          "`<button disabled>` directly in `Tooltip` may suppress hover on certain platforms.",
          'The recommended a11y pattern is to use `aria-disabled="true"` (instead of the native',
          "`disabled` attribute) so the element remains focusable and dispatches hover events,",
          "while still being announced as unavailable. The right-hand example shows that pattern.",
          "",
          "**Observation:** because the `Tooltip` wrapper owns the hover listeners, the native-`disabled`",
          "case still opens the tooltip on hover of the wrapper region — but the trigger itself is not",
          "focusable, so keyboard users cannot reveal it. Prefer `aria-disabled` for accessible behavior.",
        ].join("\n"),
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-6 p-6">
      <div className="flex flex-col items-start gap-2">
        <span className="text-era-secondary text-xs uppercase tracking-wide">
          native disabled
        </span>
        <Tooltip content="Save is disabled while the form is invalid">
          <Button variant="primary" disabled>
            Save
          </Button>
        </Tooltip>
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-era-secondary text-xs uppercase tracking-wide">
          aria-disabled (recommended)
        </span>
        <Tooltip content="Save is disabled while the form is invalid">
          <Button
            variant="primary"
            aria-disabled="true"
            onClick={(e) => e.preventDefault()}
            className="opacity-60 cursor-not-allowed"
          >
            Save
          </Button>
        </Tooltip>
      </div>
    </div>
  ),
};

const ControlledExample = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Tooltip content="Controlled bubble" open={open}>
        <Button variant="secondary">Trigger</Button>
      </Tooltip>
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
        {open ? "Close" : "Open"} tooltip
      </Button>
    </div>
  );
};

export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tooltip supports a controlled `open` prop. When provided, internal hover/focus state " +
          "is overridden — useful for tutorials, onboarding hints, or pinning a tooltip during " +
          "demos. Pass `undefined` (or omit) to fall back to the hover/focus default.",
      },
    },
  },
  render: () => <ControlledExample />,
};

export const EraCompare: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Side-by-side Heritage vs Neon. The bubble background reads from `--era-ink-primary` " +
          "and the elevation reads `shadow-era-tooltip`, so switching eras restyles the bubble " +
          "without component re-renders.",
      },
    },
  },
  render: () =>
    bothEras(({ era }) => (
      <div className="flex items-center justify-center min-h-[120px]">
        <Tooltip content={`${era} tooltip`} open>
          <Button variant="secondary" size="sm">
            {era}
          </Button>
        </Tooltip>
      </div>
    )),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "Play function exercises the WAI-ARIA tooltip surface: hover opens the bubble, unhover",
          "closes it, and keyboard focus opens it. Assertions read the opacity class set by the",
          "style function (`opacity-100` open / `opacity-0` closed) since the bubble is always in",
          "the DOM with `pointer-events-none`. Also asserts the trigger's `aria-describedby` is",
          "wired to the tooltip's `id` while open and removed when closed.",
        ].join("\n"),
      },
    },
  },
  render: () => (
    <Tooltip content="Tooltip text">
      <Button variant="secondary" data-testid="trigger">
        Hover or focus me
      </Button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByTestId("trigger");
    const wrapper = trigger.parentElement as HTMLElement;
    const tooltip = canvas.getByRole("tooltip");

    // Initial: closed
    await expect(tooltip).toHaveTextContent("Tooltip text");
    await expect(tooltip.className).toContain("opacity-0");
    const initialDescribedBy = trigger.getAttribute("aria-describedby");
    if (initialDescribedBy !== null) {
      await expect(initialDescribedBy.split(" ")).not.toContain(tooltip.id);
    }

    // Hover the wrapper (listeners live there) → opens
    await userEvent.hover(wrapper);
    await waitFor(() => expect(tooltip.className).toContain("opacity-100"));
    await waitFor(() =>
      expect(trigger.getAttribute("aria-describedby")?.split(" ")).toContain(
        tooltip.id,
      ),
    );

    // Unhover → closes
    await userEvent.unhover(wrapper);
    await waitFor(() => expect(tooltip.className).toContain("opacity-0"));
    await waitFor(() => {
      const after = trigger.getAttribute("aria-describedby");
      if (after !== null) {
        expect(after.split(" ")).not.toContain(tooltip.id);
      }
    });

    // Keyboard focus on the trigger → opens (focus bubbles to wrapper)
    trigger.focus();
    await waitFor(() => expect(tooltip.className).toContain("opacity-100"));
    await waitFor(() =>
      expect(trigger.getAttribute("aria-describedby")?.split(" ")).toContain(
        tooltip.id,
      ),
    );

    // Blur → closes
    trigger.blur();
    await waitFor(() => expect(tooltip.className).toContain("opacity-0"));
    await waitFor(() => {
      const after = trigger.getAttribute("aria-describedby");
      if (after !== null) {
        expect(after.split(" ")).not.toContain(tooltip.id);
      }
    });
  },
};
