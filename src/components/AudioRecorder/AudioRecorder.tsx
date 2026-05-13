import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { cn } from "@/utils/cn";
import {
  audioRecorderButtonStyles,
  audioRecorderLiveRegion,
  audioRecorderRoot,
  audioRecorderSecondaryButton,
  audioRecorderTime,
  audioRecorderWave,
  audioRecorderWaveBar,
  audioRecorderWaveBarActive,
} from "./AudioRecorder.styles";

export interface AudioRecorderProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled recording state. */
  recording?: boolean;
  defaultRecording?: boolean;
  onRecordingChange?: (recording: boolean) => void;
  /**
   * Controlled paused state. Only meaningful while `recording` is `true`.
   * The truth table is:
   *  - `recording=false` → STOPPED (idle button)
   *  - `recording=true,  paused=false` → RECORDING (red active)
   *  - `recording=true,  paused=true`  → PAUSED (warning active)
   */
  paused?: boolean;
  defaultPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  /** Number of bars in the visualizer. Defaults 32. */
  barCount?: number;
  /** Localized labels. */
  startLabel?: string;
  stopLabel?: string;
  pauseLabel?: string;
  resumeLabel?: string;
  /**
   * Polite live-region messages for the four state transitions. Defaults
   * mirror the visible button labels in Korean (`녹음 시작 / 일시정지 /
   * 재개 / 정지`) so screen readers receive the same vocabulary as sighted
   * users. Override per locale as needed.
   */
  startedAnnouncement?: string;
  stoppedAnnouncement?: string;
  pausedAnnouncement?: string;
  resumedAnnouncement?: string;
  className?: string;
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export const AudioRecorder = forwardRef<HTMLDivElement, AudioRecorderProps>(
  (
    {
      recording: controlledRecording,
      defaultRecording = false,
      onRecordingChange,
      paused: controlledPaused,
      defaultPaused = false,
      onPause,
      onResume,
      barCount = 32,
      startLabel = "녹음 시작",
      stopLabel = "녹음 정지",
      pauseLabel = "녹음 일시정지",
      resumeLabel = "녹음 재개",
      startedAnnouncement = "녹음 시작",
      stoppedAnnouncement = "녹음 정지",
      pausedAnnouncement = "녹음 일시정지",
      resumedAnnouncement = "녹음 재개",
      className,
      ...rest
    },
    ref,
  ) => {
    const isRecordingControlled = controlledRecording !== undefined;
    const [internalRecording, setInternalRecording] =
      useState(defaultRecording);
    const recording = isRecordingControlled
      ? controlledRecording
      : internalRecording;

    const isPausedControlled = controlledPaused !== undefined;
    const [internalPaused, setInternalPaused] = useState(defaultPaused);
    const paused = isPausedControlled ? controlledPaused : internalPaused;

    const recorderState: "stopped" | "recording" | "paused" = !recording
      ? "stopped"
      : paused
        ? "paused"
        : "recording";

    const [elapsed, setElapsed] = useState(0);
    const startedAtRef = useRef<number | null>(null);
    const accumulatedRef = useRef(0);

    useEffect(() => {
      if (!recording) {
        setElapsed(0);
        startedAtRef.current = null;
        accumulatedRef.current = 0;
        return;
      }
      if (paused) {
        if (startedAtRef.current !== null) {
          accumulatedRef.current += Date.now() - startedAtRef.current;
          startedAtRef.current = null;
          setElapsed(accumulatedRef.current);
        }
        return;
      }
      startedAtRef.current = Date.now();
      const id = window.setInterval(() => {
        if (startedAtRef.current !== null) {
          setElapsed(
            accumulatedRef.current + (Date.now() - startedAtRef.current),
          );
        }
      }, 250);
      return () => window.clearInterval(id);
    }, [recording, paused]);

    const [announcement, setAnnouncement] = useState("");

    const toggleRecording = () => {
      const next = !recording;
      if (!isRecordingControlled) setInternalRecording(next);
      if (!next && !isPausedControlled) setInternalPaused(false);
      // Announce the transition so AT users hear the same state change
      // sighted users see in the icon swap. Stopping always lands on idle
      // even if the component was paused at the moment of the click.
      setAnnouncement(next ? startedAnnouncement : stoppedAnnouncement);
      onRecordingChange?.(next);
    };

    const togglePause = () => {
      if (!recording) return;
      const nextPaused = !paused;
      if (!isPausedControlled) setInternalPaused(nextPaused);
      if (nextPaused) {
        setAnnouncement(pausedAnnouncement);
        onPause?.();
      } else {
        setAnnouncement(resumedAnnouncement);
        onResume?.();
      }
    };

    const mainAriaLabel = recording ? stopLabel : startLabel;
    const mainGlyph = recording ? "■" : "●";

    const wavesActive = recording && !paused;

    return (
      <div ref={ref} className={cn(audioRecorderRoot, className)} {...rest}>
        <button
          type="button"
          aria-label={mainAriaLabel}
          aria-pressed={recording}
          onClick={toggleRecording}
          className={audioRecorderButtonStyles({ recorderState })}
        >
          {mainGlyph}
        </button>
        <button
          type="button"
          aria-label={paused ? resumeLabel : pauseLabel}
          aria-pressed={paused}
          onClick={togglePause}
          disabled={!recording}
          className={audioRecorderSecondaryButton}
        >
          {paused ? "▶" : "❚❚"}
        </button>
        <div
          aria-hidden="true"
          className={audioRecorderWave}
          data-recording={wavesActive || undefined}
          data-paused={recording && paused ? true : undefined}
        >
          {Array.from({ length: barCount }, (_, i) => (
            <span
              key={i}
              className={cn(
                audioRecorderWaveBar,
                wavesActive && audioRecorderWaveBarActive,
              )}
              style={{
                animationDelay: `${(i * 40) % 1000}ms`,
                height: wavesActive ? undefined : 6,
              }}
            />
          ))}
        </div>
        <span className={audioRecorderTime} aria-live="polite">
          {formatTime(elapsed)}
        </span>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={audioRecorderLiveRegion}
        >
          {announcement}
        </div>
      </div>
    );
  },
);

AudioRecorder.displayName = "AudioRecorder";
