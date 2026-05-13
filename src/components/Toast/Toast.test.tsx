import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders content", () => {
    render(<Toast>저장 완료</Toast>);
    expect(screen.getByText("저장 완료")).toBeInTheDocument();
  });

  it("calls onDismiss", () => {
    const onDismiss = vi.fn();
    render(<Toast onDismiss={onDismiss}>x</Toast>);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("has role=status for screen readers", () => {
    render(<Toast>x</Toast>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  describe("ARIA notification semantics", () => {
    it("uses role=status for info intent (polite)", () => {
      render(<Toast intent="info">info msg</Toast>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=status for success intent (polite)", () => {
      render(<Toast intent="success">saved</Toast>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("uses role=alert for warning intent (assertive)", () => {
      render(<Toast intent="warning">warn</Toast>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("uses role=alert for error intent (assertive)", () => {
      render(<Toast intent="error">boom</Toast>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("respects an explicit role override", () => {
      render(
        <Toast intent="error" role="status">
          quiet error
        </Toast>,
      );
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("sets aria-atomic so partial updates are announced as one unit", () => {
      render(<Toast>hello</Toast>);
      expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true");
    });

    it("hides decorative icon glyph from assistive tech", () => {
      const { container } = render(<Toast>msg</Toast>);
      // First child of the toast is the leading icon span.
      const iconSpan = container.querySelector(
        '[role="status"] > span[aria-hidden="true"]',
      );
      expect(iconSpan).toBeTruthy();
    });

    it("hides decorative dismiss glyph from assistive tech", () => {
      render(
        <Toast intent="info" onDismiss={() => {}}>
          msg
        </Toast>,
      );
      const btn = screen.getByRole("button", { name: "닫기" });
      // The visible × glyph must be inside an aria-hidden span so the
      // accessible name comes solely from `aria-label`.
      const hidden = btn.querySelector('[aria-hidden="true"]');
      expect(hidden).toBeTruthy();
      expect(hidden?.textContent).toBe("×");
    });

    it("accepts a custom dismissLabel for i18n", () => {
      render(
        <Toast onDismiss={() => {}} dismissLabel="Close">
          x
        </Toast>,
      );
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });
  });

  describe("Reduced-motion safe entry animation", () => {
    it("applies the transform-only entry animation under motion-safe", () => {
      const { container } = render(<Toast>x</Toast>);
      const root = container.querySelector('[role="status"]') as HTMLElement;
      expect(root.className).toMatch(
        /motion-safe:animate-\[toast-enter_300ms_ease-out_both\]/,
      );
    });

    it("injects the toast-enter keyframe stylesheet exactly once", () => {
      render(<Toast>a</Toast>);
      render(<Toast>b</Toast>);
      render(<Toast>c</Toast>);
      const styleNodes = document.querySelectorAll(
        "style#oriental-toast-keyframes",
      );
      expect(styleNodes).toHaveLength(1);
      expect(styleNodes[0].textContent).toContain("@keyframes toast-enter");
      // Critically: keyframe must NOT animate opacity (would drop contrast).
      expect(styleNodes[0].textContent).not.toMatch(/opacity\s*:/);
    });
  });
});
