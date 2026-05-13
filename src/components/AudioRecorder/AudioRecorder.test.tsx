import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AudioRecorder } from "./AudioRecorder";

describe("AudioRecorder", () => {
  it("renders idle state with start label", () => {
    render(<AudioRecorder />);
    expect(screen.getByLabelText("녹음 시작")).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("toggles to recording on click", () => {
    const onRecordingChange = vi.fn();
    render(<AudioRecorder onRecordingChange={onRecordingChange} />);
    fireEvent.click(screen.getByLabelText("녹음 시작"));
    expect(onRecordingChange).toHaveBeenCalledWith(true);
  });

  it("respects controlled recording prop", () => {
    render(<AudioRecorder recording />);
    expect(screen.getByLabelText("녹음 정지")).toBeInTheDocument();
    expect(screen.getByLabelText("녹음 정지")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("renders the configured number of bars", () => {
    const { container } = render(<AudioRecorder barCount={10} />);
    expect(
      container.querySelectorAll("[aria-hidden=true] > span"),
    ).toHaveLength(10);
  });

  it("walks the four-state transition stopped → recording → paused → recording → stopped", () => {
    const onRecordingChange = vi.fn();
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(
      <AudioRecorder
        onRecordingChange={onRecordingChange}
        onPause={onPause}
        onResume={onResume}
      />,
    );

    expect(screen.getByLabelText("녹음 시작")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByLabelText("녹음 일시정지")).toBeDisabled();

    fireEvent.click(screen.getByLabelText("녹음 시작"));
    expect(onRecordingChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByLabelText("녹음 정지")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText("녹음 일시정지")).not.toBeDisabled();

    fireEvent.click(screen.getByLabelText("녹음 일시정지"));
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("녹음 재개")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByLabelText("녹음 재개"));
    expect(onResume).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("녹음 일시정지")).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    fireEvent.click(screen.getByLabelText("녹음 정지"));
    expect(onRecordingChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByLabelText("녹음 시작")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByLabelText("녹음 일시정지")).toBeDisabled();
  });

  it("uses the era-aware accent token for the focus ring (not a hardcoded rgb)", () => {
    render(<AudioRecorder />);
    const button = screen.getByLabelText("녹음 시작");
    expect(button.className).toContain(
      "focus:ring-[rgb(var(--era-accent-strong))]",
    );
    expect(button.className).not.toContain("rgb(255,82,104");
  });

  it("fires onPause and onResume when the secondary toggle is operated", () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(
      <AudioRecorder defaultRecording onPause={onPause} onResume={onResume} />,
    );
    const pauseButton = screen.getByLabelText("녹음 일시정지");
    fireEvent.click(pauseButton);
    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onResume).not.toHaveBeenCalled();

    const resumeButton = screen.getByLabelText("녹음 재개");
    fireEvent.click(resumeButton);
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("announces pause and resume transitions in the polite live region", () => {
    const { container } = render(<AudioRecorder defaultRecording />);
    const liveRegion = container.querySelector(
      '[role="status"][aria-live="polite"][aria-atomic="true"]',
    );
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toBe("");

    fireEvent.click(screen.getByLabelText("녹음 일시정지"));
    expect(liveRegion?.textContent).toBe("녹음 일시정지");

    fireEvent.click(screen.getByLabelText("녹음 재개"));
    expect(liveRegion?.textContent).toBe("녹음 재개");
  });

  it("idle → recording transition fires onRecordingChange(true)", () => {
    const onRecordingChange = vi.fn();
    render(<AudioRecorder onRecordingChange={onRecordingChange} />);

    fireEvent.click(screen.getByLabelText("녹음 시작"));

    expect(onRecordingChange).toHaveBeenCalledTimes(1);
    expect(onRecordingChange).toHaveBeenCalledWith(true);
    expect(screen.getByLabelText("녹음 정지")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("recording → paused transition fires onPause but not onResume", () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(
      <AudioRecorder defaultRecording onPause={onPause} onResume={onResume} />,
    );

    fireEvent.click(screen.getByLabelText("녹음 일시정지"));

    expect(onPause).toHaveBeenCalledTimes(1);
    expect(onResume).not.toHaveBeenCalled();
    expect(screen.getByLabelText("녹음 재개")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("paused → recording transition fires onResume but not onPause", () => {
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(
      <AudioRecorder
        defaultRecording
        defaultPaused
        onPause={onPause}
        onResume={onResume}
      />,
    );

    fireEvent.click(screen.getByLabelText("녹음 재개"));

    expect(onResume).toHaveBeenCalledTimes(1);
    expect(onPause).not.toHaveBeenCalled();
    expect(screen.getByLabelText("녹음 일시정지")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("live-region content updates on each transition across the full cycle", () => {
    render(<AudioRecorder />);
    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion.textContent).toBe("");

    // idle → recording
    fireEvent.click(screen.getByLabelText("녹음 시작"));
    expect(liveRegion.textContent).toBe("녹음 시작");

    // recording → paused
    fireEvent.click(screen.getByLabelText("녹음 일시정지"));
    expect(liveRegion.textContent).toBe("녹음 일시정지");

    // paused → recording
    fireEvent.click(screen.getByLabelText("녹음 재개"));
    expect(liveRegion.textContent).toBe("녹음 재개");

    // recording → idle (stop)
    fireEvent.click(screen.getByLabelText("녹음 정지"));
    expect(liveRegion.textContent).toBe("녹음 정지");
  });
});
