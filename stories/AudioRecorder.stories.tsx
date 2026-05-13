import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { AudioRecorder } from "@/components/AudioRecorder";
import { Stack } from "@/components/Stack";
import { Button } from "@/components/Button";
import { boolArg, bothEras } from "./_shared/argTypes";

const meta = {
  title: "Components/AudioRecorder",
  component: AudioRecorder,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "AudioRecorder is a **UI-only** visualization for recording state. It renders a " +
          "circular toggle button, an animated waveform, and an elapsed-time readout — but it " +
          "does **not** call `MediaRecorder` / `getUserMedia` internally. Wiring real capture " +
          "(microphone permissions, audio chunks, encoding, upload) is the consumer's " +
          "responsibility; this component simply visualises whatever recording state you pass " +
          "via `recording` (controlled) or `defaultRecording` (uncontrolled). The toggle " +
          "fires `onRecordingChange(boolean)`, and an internal interval drives the elapsed " +
          "timer (`mm:ss`) only while the recording flag is `true`. Era-aware tokens " +
          "(`bg-era-sunken`, `border-era`, `text-era-primary`, `duration-era-fast`, " +
          "`ease-era-brush`) let the recorder flip cleanly between Heritage and Neon.",
      },
    },
  },
  argTypes: {
    recording: boolArg(
      "Controlled recording state. Omit to run uncontrolled with `defaultRecording`.",
    ),
    defaultRecording: boolArg(
      "Initial recording state when uncontrolled. Ignored if `recording` is set.",
    ),
    barCount: {
      control: { type: "number", min: 4, max: 96, step: 1 },
      description:
        "Number of bars in the visualizer waveform. Defaults to 32. Larger values trade " +
        "density for animation cost.",
    },
    startLabel: {
      control: { type: "text" },
      description:
        "Accessible label applied to the toggle button while idle. Drives `aria-label`.",
    },
    stopLabel: {
      control: { type: "text" },
      description:
        "Accessible label applied to the toggle button while recording. Drives `aria-label`.",
    },
    pauseLabel: {
      control: { type: "text" },
      description:
        "Accessible label applied to the pause/resume button while recording is active.",
    },
    resumeLabel: {
      control: { type: "text" },
      description:
        "Accessible label applied to the pause/resume button while paused.",
    },
    onRecordingChange: { action: "recordingChange" },
    onPause: { action: "pause" },
    onResume: { action: "resume" },
  },
  args: {
    barCount: 32,
    startLabel: "녹음 시작",
    stopLabel: "녹음 정지",
    pauseLabel: "녹음 일시정지",
    resumeLabel: "녹음 재개",
  },
} satisfies Meta<typeof AudioRecorder>;

export default meta;
type Story = StoryObj<typeof AudioRecorder>;

/**
 * Idle recorder, ready to start. The button shows the start glyph and the
 * timer is parked at `00:00`. Clicking the button toggles into the recording
 * state via uncontrolled internal state.
 */
export const Default: Story = {};

/**
 * Recording state shown via `defaultRecording`. The button flips to the stop
 * glyph, the waveform bars animate, and the timer begins ticking from zero.
 *
 * Because this is uncontrolled, the user can stop the recording by clicking
 * the button — the story will then drop back to the idle state.
 */
export const Recording: Story = {
  args: {
    defaultRecording: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uncontrolled with `defaultRecording={true}`. The waveform animates and the " +
          "timer accrues until the user clicks stop.",
      },
    },
  },
};

/**
 * Fully controlled. External buttons drive the recording flag, mirroring how
 * a real consumer would tie this UI to an actual `MediaRecorder` instance.
 * This story stands in for "paused" — the underlying component models a
 * binary recording flag, so a paused state is expressed by the consumer
 * holding `recording=false` while preserving its own captured audio buffer.
 */
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass `recording` + `onRecordingChange` to drive the visual from outside React " +
          "state. The component itself does not model a separate paused state — a real " +
          "integration would keep `recording=false` while retaining its own captured " +
          "buffer for resume.",
      },
    },
  },
  render: (args) => {
    const ControlledDemo = () => {
      const [recording, setRecording] = useState(false);
      return (
        <Stack direction="column" gap="3" style={{ width: 480 }}>
          <Stack direction="row" gap="2" align="center">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setRecording(true)}
              disabled={recording}
              data-testid="external-start"
            >
              Start
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setRecording(false)}
              disabled={!recording}
              data-testid="external-stop"
            >
              Stop
            </Button>
            <span className="text-xs text-era-muted">
              recording: {String(recording)}
            </span>
          </Stack>
          <AudioRecorder
            {...args}
            recording={recording}
            onRecordingChange={setRecording}
          />
        </Stack>
      );
    };
    return <ControlledDemo />;
  },
};

/**
 * Recording with the elapsed-time readout visible. The timer formats as
 * `mm:ss` and is the only element announced through `aria-live="polite"`
 * — assistive tech receives the running clock without re-announcing every
 * decorative bar.
 */
export const WithElapsed: Story = {
  args: {
    defaultRecording: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "While `recording` is true the elapsed counter ticks every 250ms and is " +
          'announced via `aria-live="polite"`. The waveform itself is `aria-hidden`.',
      },
    },
  },
};

/**
 * Visually disabled recorder. The component does not expose a `disabled`
 * prop, so we emulate the disabled affordance through a wrapper with
 * `aria-disabled` plus pointer-events suppression. Real consumers should
 * gate the recorder behind permission/capability state rather than letting
 * the user click into a non-functional UI.
 */
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "AudioRecorder has no native `disabled` prop. To present a disabled affordance, " +
          'wrap it in a container that sets `aria-disabled="true"` and disables pointer ' +
          "events. In production prefer to hide or replace the recorder when capture is " +
          "unavailable rather than presenting a clickable-but-inert control.",
      },
    },
  },
  render: (args) => (
    <div
      aria-disabled="true"
      className="opacity-60 pointer-events-none"
      data-testid="disabled-wrapper"
    >
      <AudioRecorder {...args} />
    </div>
  ),
};

/**
 * Compact variant via a reduced bar count. The component does not expose a
 * `size` token; density is tuned through `barCount`. 12 bars produces a
 * tighter waveform suitable for sidebars or chat composers.
 */
export const Compact: Story = {
  args: {
    barCount: 12,
    defaultRecording: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`barCount={12}` shrinks the visualizer footprint without changing the button " +
          "or timer dimensions. Use this in space-constrained surfaces such as chat " +
          "composers.",
      },
    },
  },
};

/**
 * Paused state. Recording is active but the waveform freezes and the timer
 * holds its accumulated value. The main button keeps its stop affordance,
 * while the secondary button flips to a resume glyph and re-announces in the
 * polite live region.
 */
export const Paused: Story = {
  args: {
    defaultRecording: true,
    defaultPaused: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Uncontrolled with `defaultRecording={true}` and `defaultPaused={true}`. The " +
          "secondary button shows the resume glyph; clicking it fires `onResume` and " +
          "restarts the visualizer. Pause/resume transitions are announced through a " +
          "`role=status` live region for assistive tech.",
      },
    },
  },
};

/**
 * Demonstrates the `onRecordingChange` callback. Storybook's Actions panel
 * captures every transition; check it after clicking the toggle.
 */
export const WithCallback: Story = {
  args: {
    onRecordingChange: fn(),
    onPause: fn(),
    onResume: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "`onRecordingChange(next: boolean)` fires on every toggle. A real consumer " +
          "would use this to start/stop a `MediaRecorder` and persist captured chunks.",
      },
    },
  },
};

/**
 * Heritage / Neon side-by-side. The same recorder markup re-skins entirely
 * via era CSS variables — surface, border, button focus ring, timer color,
 * and waveform pulse all flip without a React re-render.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Identical AudioRecorder markup rendered against both eras. The terracotta " +
          "record button stays warm in Heritage and reads as a high-energy accent in " +
          "Neon; surfaces and timer color flip via `bg-era-sunken` and `text-era-primary`.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <Stack direction="column" gap="3">
        <AudioRecorder />
        <AudioRecorder defaultRecording />
      </Stack>
    )),
};

/**
 * Automated interaction proof. Verifies:
 *  1. The toggle starts with `aria-pressed="false"` and the start label.
 *  2. Clicking the toggle fires `onRecordingChange(true)` and flips
 *     `aria-pressed` plus the accessible name to the stop label.
 *  3. A second click flips back to idle and fires `onRecordingChange(false)`.
 *  4. The waveform container exposes `data-recording` while active so
 *     visual regressions can pin on the active state.
 */
export const Interactive: Story = {
  args: {
    onRecordingChange: fn(),
    onPause: fn(),
    onResume: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Walks the full four-state transition: stopped → recording → paused → " +
          "recording → stopped. Each transition fires the matching callback and the " +
          "polite live region announces pause and resume for assistive tech.",
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Idle: button labelled with start text, aria-pressed=false.
    const startButton = canvas.getByRole("button", { name: "녹음 시작" });
    await expect(startButton).toHaveAttribute("aria-pressed", "false");

    // 2. Click → recording. Callback fires with true and the accessible
    // name flips to the stop label. The waveform container reflects the
    // active state via data-recording.
    await userEvent.click(startButton);
    await expect(args.onRecordingChange).toHaveBeenCalledWith(true);

    const stopButton = canvas.getByRole("button", { name: "녹음 정지" });
    await expect(stopButton).toHaveAttribute("aria-pressed", "true");

    const wave = canvasElement.querySelector("[aria-hidden='true']");
    await expect(wave).toHaveAttribute("data-recording", "true");

    // 3. Click pause → paused. onPause fires, the wave loses data-recording,
    // and the secondary button flips to the resume label.
    const pauseButton = canvas.getByRole("button", { name: "녹음 일시정지" });
    await userEvent.click(pauseButton);
    await expect(args.onPause).toHaveBeenCalledTimes(1);

    const resumeButton = canvas.getByRole("button", { name: "녹음 재개" });
    await expect(resumeButton).toHaveAttribute("aria-pressed", "true");

    // 4. Click resume → recording again. onResume fires.
    await userEvent.click(resumeButton);
    await expect(args.onResume).toHaveBeenCalledTimes(1);

    // 5. Click stop → idle. Callback fires with false; aria-pressed clears.
    const stopAgain = canvas.getByRole("button", { name: "녹음 정지" });
    await userEvent.click(stopAgain);
    await expect(args.onRecordingChange).toHaveBeenLastCalledWith(false);

    const idleAgain = canvas.getByRole("button", { name: "녹음 시작" });
    await expect(idleAgain).toHaveAttribute("aria-pressed", "false");
  },
};

/**
 * Full state-machine walk with live-region verification. Exercises the
 * complete transition graph (idle → recording → paused → recording → idle)
 * and asserts that each step updates the polite `role="status"` region with
 * the matching Korean announcement.
 *
 * Pairs with the unit-test `live-region content updates on each transition`
 * — this story is the integration counterpart that confirms the live region
 * also flips correctly inside Storybook's render path.
 */
export const FullLifecycle: Story = {
  args: {
    onRecordingChange: fn(),
    onPause: fn(),
    onResume: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Drives every transition in the AudioRecorder state machine and verifies " +
          "that the polite live region announces `녹음 시작 → 녹음 일시정지 → 녹음 " +
          "재개 → 녹음 정지` in lockstep with the visual button/icon flips.",
      },
    },
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const liveRegion = canvas.getByRole("status");
    await expect(liveRegion).toHaveAttribute("aria-live", "polite");

    // 1. idle → recording.
    await userEvent.click(canvas.getByRole("button", { name: "녹음 시작" }));
    await expect(args.onRecordingChange).toHaveBeenLastCalledWith(true);
    await expect(liveRegion).toHaveTextContent("녹음 시작");

    // 2. recording → paused.
    await userEvent.click(
      canvas.getByRole("button", { name: "녹음 일시정지" }),
    );
    await expect(args.onPause).toHaveBeenCalledTimes(1);
    await expect(liveRegion).toHaveTextContent("녹음 일시정지");

    // 3. paused → recording.
    await userEvent.click(canvas.getByRole("button", { name: "녹음 재개" }));
    await expect(args.onResume).toHaveBeenCalledTimes(1);
    await expect(liveRegion).toHaveTextContent("녹음 재개");

    // 4. recording → idle (stop).
    await userEvent.click(canvas.getByRole("button", { name: "녹음 정지" }));
    await expect(args.onRecordingChange).toHaveBeenLastCalledWith(false);
    await expect(liveRegion).toHaveTextContent("녹음 정지");
  },
};
