import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("toggles on click", () => {
    const onChange = vi.fn();
    render(<Switch label="알림" onChange={onChange} />);
    const sw = screen.getByLabelText("알림") as HTMLInputElement;
    expect(sw.checked).toBe(false);
    fireEvent.click(sw);
    expect(onChange).toHaveBeenCalled();
  });

  it("has role=switch", () => {
    render(<Switch label="x" />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("supports defaultChecked", () => {
    render(<Switch label="기본 켜짐" defaultChecked />);
    expect(
      (screen.getByLabelText("기본 켜짐") as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("forwards aria-label so label-less switches stay accessible", () => {
    // Without a visible `label`, callers must supply an accessible name via
    // aria-label / aria-labelledby. Switch spreads `InputHTMLAttributes`,
    // so this should round-trip onto the underlying input.
    render(<Switch aria-label="Toggle feature" />);
    const input = screen.getByRole("switch");
    expect(input).toHaveAttribute("aria-label", "Toggle feature");
  });
});
