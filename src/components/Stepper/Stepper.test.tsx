import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stepper, type StepItem } from "./Stepper";

const STEPS = [
  { label: "入場" },
  { label: "編成" },
  { label: "對局" },
  { label: "結算" },
];

describe("Stepper", () => {
  it("renders all step labels", () => {
    render(<Stepper steps={STEPS} current={2} />);
    expect(screen.getByText("入場")).toBeInTheDocument();
    expect(screen.getByText("結算")).toBeInTheDocument();
  });

  it("marks the current step with aria-current=step", () => {
    render(<Stepper steps={STEPS} current={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items[2]).toHaveAttribute("aria-current", "step");
  });

  it("renders ✓ on done steps", () => {
    render(<Stepper steps={STEPS} current={2} />);
    const checks = screen.getAllByText("✓");
    expect(checks.length).toBeGreaterThanOrEqual(2);
  });

  it("renders default state without aria-invalid or sr-only state text", () => {
    render(<Stepper steps={STEPS} current={1} />);
    const items = screen.getAllByRole("listitem");
    const currentCircle = items[1].firstElementChild as HTMLElement;
    expect(currentCircle).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("validation error")).not.toBeInTheDocument();
    expect(screen.queryByText("completed")).not.toBeInTheDocument();
  });

  it("renders error state with aria-invalid, ✕ glyph, and sr-only text", () => {
    const errorSteps: ReadonlyArray<StepItem> = [
      { label: "入場" },
      { label: "編成", state: "error", description: "덱이 비어 있습니다" },
      { label: "對局" },
      { label: "結算" },
    ];
    render(<Stepper steps={errorSteps} current={1} />);
    const items = screen.getAllByRole("listitem");
    const errorCircle = items[1].firstElementChild as HTMLElement;
    expect(errorCircle).toHaveAttribute("aria-invalid", "true");
    expect(errorCircle.textContent).toContain("✕");
    expect(screen.getByText("validation error")).toBeInTheDocument();
    // current + description → aria-describedby wired
    expect(errorCircle).toHaveAttribute("aria-describedby");
    const describedby = errorCircle.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedby)?.textContent).toBe(
      "덱이 비어 있습니다",
    );
  });

  it("renders explicit completed state with ✓ glyph and sr-only completed text", () => {
    const completedSteps: ReadonlyArray<StepItem> = [
      { label: "入場" },
      { label: "編成", state: "completed" },
      { label: "對局" },
      { label: "結算" },
    ];
    render(<Stepper steps={completedSteps} current={2} />);
    const items = screen.getAllByRole("listitem");
    const completedCircle = items[1].firstElementChild as HTMLElement;
    expect(completedCircle.textContent).toContain("✓");
    expect(screen.getByText("completed")).toBeInTheDocument();
  });
});
