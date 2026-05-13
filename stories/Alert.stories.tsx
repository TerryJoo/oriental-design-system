import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Alert, alertIntents } from "@/components/Alert";
import { Button } from "@/components/Button";
import { bothEras, selectArg } from "./_shared/argTypes";

const intentOptions = Object.keys(alertIntents) as Array<
  keyof typeof alertIntents
>;

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Alert surfaces a short, status-toned message with an optional title and " +
          "leading icon. The intent prop maps to era-aware tonal fills (info, success, " +
          "warning, error) so the same markup reads as ink-on-paper in Heritage and " +
          'luminous tones in Neon. The root element renders with `role="alert"` for ' +
          "assistive tech.",
      },
    },
  },
  argTypes: {
    intent: selectArg(intentOptions, "Tonal intent of the alert"),
    title: { control: "text" },
    icon: { control: false },
  },
  args: {
    intent: "info",
    title: "정보",
    children:
      "Heritage tones reflect ink on paper; Neon shifts to luminous tones.",
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every supported intent (info / success / warning / error) rendered together " +
          "so contrast and tonal hierarchy can be compared.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3 w-[480px]">
      {intentOptions.map((intent) => (
        <Alert key={intent} intent={intent} title={intent.toUpperCase()}>
          intent=&quot;{intent}&quot; — short message describing the alert.
        </Alert>
      ))}
    </div>
  ),
};

export const TitleOnly: Story = {
  args: { title: "Title only", children: undefined },
};

export const MessageOnly: Story = {
  args: { title: undefined, children: "Body without a title." },
};

export const Dismissible: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      if (!open) {
        return (
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            Restore alert
          </Button>
        );
      }
      return (
        <div className="w-[480px]">
          <Alert
            intent="warning"
            title="저장되지 않은 변경사항"
            icon={
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setOpen(false)}
                className="text-era-muted hover:text-era-primary leading-none"
              >
                ×
              </button>
            }
          >
            Your changes will be lost when you leave this page.
          </Alert>
        </div>
      );
    };
    return <Demo />;
  },
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side: the same intent palette flips through era-aware tokens with no React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-col gap-3">
        {intentOptions.map((intent) => (
          <Alert key={intent} intent={intent} title={intent}>
            Tone for {intent}.
          </Alert>
        ))}
      </div>
    )),
};

export const Interactive: Story = {
  args: {
    intent: "warning",
    title: "저장되지 않은 변경사항",
    children: "Your changes will be lost when you leave this page.",
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Verifies the alert exposes `role="alert"`, that the rendered title and body are reachable, and that pointer events bubble to consumer-supplied handlers.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    await expect(alert).toBeInTheDocument();
    await expect(
      canvas.getByText("저장되지 않은 변경사항"),
    ).toBeInTheDocument();
    await userEvent.click(alert);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
