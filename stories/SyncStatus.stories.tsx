import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { SyncStatus, syncStatusStateMap } from "@/components/SyncStatus";
import { bothEras, radioArg } from "./_shared/argTypes";

const stateOptions = Object.keys(syncStatusStateMap) as Array<
  keyof typeof syncStatusStateMap
>;

const meta = {
  title: "Components/SyncStatus",
  component: SyncStatus,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "SyncStatus surfaces a real-time connection state as a small pill " +
          "(connected / syncing / offline) with a colored dot and Korean default label. " +
          'The root element renders with `role="status"` so assistive tech announces ' +
          "state transitions politely; the dot itself is `aria-hidden`.",
      },
    },
  },
  argTypes: {
    state: radioArg(stateOptions, "Connection state"),
    label: { control: "text" },
  },
  args: {
    state: "connected",
  },
} satisfies Meta<typeof SyncStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All three connection states rendered together so the dot tone and default Korean label can be compared.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      {stateOptions.map((state) => (
        <SyncStatus key={state} state={state} />
      ))}
    </div>
  ),
};

export const CustomLabel: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The default localized label is overridable via the `label` prop. Useful for English copy or progress counters.",
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      <SyncStatus state="connected" label="Online" />
      <SyncStatus state="syncing" label="Syncing 12/40" />
      <SyncStatus state="offline" label="No connection" />
    </div>
  ),
};

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between w-[420px] px-4 py-3 rounded-card bg-era-raised border-era">
      <span className="font-era-display tracking-era-display case-era font-bold text-sm text-era-primary">
        문서 편집기
      </span>
      <SyncStatus state="syncing" />
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
          "Same three states rendered in Heritage and Neon to verify era-aware tokens (intent dot colors, surface tint) flip cleanly without any React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex items-center gap-3 flex-wrap">
        {stateOptions.map((state) => (
          <SyncStatus key={state} state={state} />
        ))}
      </div>
    )),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verifies the live region exposes `role="status"` and that the resolved label text matches the active state — the contract assistive tech relies on for non-interrupting announcements.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");
    await expect(status).toBeInTheDocument();
    await expect(status).toHaveTextContent(syncStatusStateMap.connected.text);
  },
};
