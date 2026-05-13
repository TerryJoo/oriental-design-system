import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Popover } from "./Popover";
import { popoverEnterKeyframes, popoverPanelStyles } from "./Popover.styles";

describe("Popover", () => {
  it("renders trigger and reveals content on click", () => {
    render(
      <Popover trigger={<button>설정</button>} content={<span>내용</span>} />,
    );
    expect(screen.queryByText("내용")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("설정"));
    expect(screen.getByText("내용")).toBeInTheDocument();
  });

  it("supports controlled mode", () => {
    render(
      <Popover
        open
        trigger={<button>x</button>}
        content={<span>controlled</span>}
      />,
    );
    expect(screen.getByText("controlled")).toBeInTheDocument();
  });

  it("sets aria-expanded on the trigger", () => {
    render(
      <Popover open trigger={<button>x</button>} content={<span>c</span>} />,
    );
    expect(screen.getByText("x")).toHaveAttribute("aria-expanded", "true");
  });

  it("wires aria-controls on the trigger to the panel id", () => {
    render(
      <Popover
        open
        trigger={<button>trigger</button>}
        content={<span>panel</span>}
      />,
    );
    const trigger = screen.getByText("trigger");
    const dialog = screen.getByRole("dialog");
    const controls = trigger.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(dialog).toHaveAttribute("id", controls!);
  });

  it("closes when Escape is pressed and calls onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        defaultOpen
        onOpenChange={onOpenChange}
        trigger={<button>trigger</button>}
        content={<span>panel content</span>}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("moves focus into the panel on open", async () => {
    render(
      <Popover
        trigger={<button>trigger</button>}
        content={
          <div>
            <button data-testid="first-focusable">first</button>
            <button>second</button>
          </div>
        }
      />,
    );

    fireEvent.click(screen.getByText("trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("first-focusable")).toHaveFocus();
    });
  });

  it("focuses the panel itself when no focusable content exists", async () => {
    render(
      <Popover
        trigger={<button>trigger</button>}
        content={<span>no focusables here</span>}
      />,
    );

    fireEvent.click(screen.getByText("trigger"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toHaveFocus();
    });
  });

  // ---------------------------------------------------------------
  // Color-contrast safety: opacity must stay at 1 throughout entry.
  //
  // Wave 6a flagged 18 axe `color-contrast` nodes across 5 Popover
  // stories because the prior `animate-scale-in` keyframe ramped
  // opacity 0→1, making text sub-AA at every frame except the last.
  // The current entry animation must be transform-only and gated by
  // `motion-safe:` so reduced-motion users get an instant render.
  // ---------------------------------------------------------------
  it("uses the transform-only popover-enter keyframe (no opacity ramp)", () => {
    expect(popoverEnterKeyframes).toContain("@keyframes popover-enter");
    // Must NOT animate opacity — that's the entire reason we forked
    // away from `animate-scale-in`.
    expect(popoverEnterKeyframes).not.toMatch(/opacity/i);
    // Must animate transform.
    expect(popoverEnterKeyframes).toMatch(/transform/i);
  });

  it("guards the panel entry animation behind motion-safe:", () => {
    const classes = popoverPanelStyles({ placement: "bottom-start" });
    // `motion-safe:animate-[popover-enter_...]` lets users with
    // `prefers-reduced-motion: reduce` skip the animation entirely.
    expect(classes).toContain("motion-safe:animate-[popover-enter_");
    // Must not pull the legacy opacity-ramping `animate-scale-in`.
    expect(classes).not.toMatch(/(?<!\w)animate-scale-in(?!\w)/);
  });

  it("injects the popover-enter keyframes once into <head>", () => {
    // Trigger any render so the side-effect import path runs.
    render(<Popover trigger={<button>x</button>} content={<span>c</span>} />);
    const styleEl = document.getElementById("oriental-popover-keyframes");
    expect(styleEl).toBeInTheDocument();
    expect(styleEl?.textContent).toContain("@keyframes popover-enter");

    // Render a second instance — the dedupe guard must not produce
    // a second <style> with the same id.
    render(<Popover trigger={<button>y</button>} content={<span>d</span>} />);
    expect(
      document.querySelectorAll("#oriental-popover-keyframes").length,
    ).toBe(1);
  });

  it("returns focus to the trigger when closed", async () => {
    render(
      <Popover
        trigger={<button>trigger</button>}
        content={<button data-testid="inside">inside</button>}
      />,
    );

    const trigger = screen.getByText("trigger");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId("inside")).toHaveFocus();
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
