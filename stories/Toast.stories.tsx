import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Toast, toastIntents } from "@/components/Toast";
import { Button } from "@/components/Button";
import { bothEras, selectArg } from "./_shared/argTypes";

const intentOptions = Object.keys(toastIntents) as Array<
  keyof typeof toastIntents
>;

type Placement = "top-right" | "top-left" | "bottom-right" | "bottom-left";
const PLACEMENTS: ReadonlyArray<Placement> = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
];
const PLACEMENT_CLASS: Record<Placement, string> = {
  "top-right": "top-3 right-3",
  "top-left": "top-3 left-3",
  "bottom-right": "bottom-3 right-3",
  "bottom-left": "bottom-3 left-3",
};

const meta = {
  title: "Components/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Toast is a transient notification surface tagged with one of four intents " +
          "(info / success / warning / error). Intent maps both to a colored left border " +
          "and to the live-region role: `status` for info/success, `alert` for " +
          "warning/error per WAI-ARIA notification pattern. The entry animation is " +
          "transform-only and wrapped in `motion-safe:` so reduced-motion users skip it.",
      },
    },
  },
  argTypes: {
    intent: selectArg(intentOptions, "Tonal intent of the toast"),
    icon: { control: false },
    onDismiss: { control: false },
  },
  args: {
    intent: "info",
    children: "Saved successfully.",
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All four intents stacked together so the left-border tone, default icon, and resolved live-region role can be compared.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3 w-[320px]">
      {intentOptions.map((intent) => (
        <Toast key={intent} intent={intent}>
          intent=&quot;{intent}&quot;
        </Toast>
      ))}
    </div>
  ),
};

export const Dismissible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass `onDismiss` to render a × button. The button receives an explicit accessible name (`dismissLabel`, default 닫기) and dismisses the toast when clicked.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      if (!open) {
        return (
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            Show toast
          </Button>
        );
      }
      return (
        <Toast intent="success" onDismiss={() => setOpen(false)}>
          저장되었습니다.
        </Toast>
      );
    };
    return <Demo />;
  },
};

export const WithAction: Story = {
  render: () => (
    <Toast intent="warning">
      <span className="flex items-center gap-3">
        <span>저장되지 않은 변경사항</span>
        <Button size="sm" variant="ghost">
          저장
        </Button>
      </span>
    </Toast>
  ),
};

export const Placements: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="relative w-full h-[400px] bg-era-base border-era rounded-md overflow-hidden">
      {PLACEMENTS.map((placement) => (
        <div
          key={placement}
          className={`absolute ${PLACEMENT_CLASS[placement]}`}
        >
          <Toast intent="info">{placement}</Toast>
        </div>
      ))}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <span className="text-xs uppercase tracking-widest text-era-muted">
          Toast container demo
        </span>
      </div>
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side. Both panels use [data-era] so the era CSS
 * layer flips without re-rendering React.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "All four intents rendered in Heritage and Neon to verify the raised surface, intent border, and ink tone tokens flip cleanly without any React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-col gap-3">
        {intentOptions.map((intent) => (
          <Toast key={intent} intent={intent}>
            {intent}
          </Toast>
        ))}
      </div>
    )),
};

/**
 * Interactive scenario: a trigger button mounts a success toast on click,
 * then asserts the live-region role is announced and that the dismiss
 * button tears the toast down again. `onDismiss` is declared via `args` +
 * `fn()` so the play function can assert against the same spy reference
 * the rendered component received (Storybook 8 test-runner does NOT
 * auto-create action args from `argTypesRegex`).
 */
export const Interactive: Story = {
  args: {
    onDismiss: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A trigger button mounts a success toast on click, then we assert that the live-region role is announced and that the dismiss button (`닫기`) tears the toast down again.",
      },
    },
  },
  render: (args) => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex flex-col gap-3 w-[320px]">
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            Show toast
          </Button>
          {open && (
            <Toast
              intent="success"
              onDismiss={() => {
                setOpen(false);
                args.onDismiss?.();
              }}
            >
              Saved successfully.
            </Toast>
          )}
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. Trigger button mounts the toast.
    const trigger = canvas.getByRole("button", { name: "Show toast" });
    await userEvent.click(trigger);

    // 2. Toast appears with the success live-region role (status).
    const toast = await canvas.findByRole("status");
    await expect(toast).toHaveTextContent("Saved successfully.");

    // 3. Dismiss button tears it down.
    const dismiss = canvas.getByRole("button", { name: "닫기" });
    await userEvent.click(dismiss);
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};
