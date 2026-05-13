import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders label and checks on click", () => {
    const onChange = vi.fn();
    render(<Checkbox label="동의" onChange={onChange} />);
    const cb = screen.getByLabelText("동의") as HTMLInputElement;
    expect(cb.checked).toBe(false);
    fireEvent.click(cb);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders disabled state", () => {
    render(<Checkbox label="x" disabled />);
    expect(screen.getByLabelText("x")).toBeDisabled();
  });

  it("supports defaultChecked", () => {
    render(<Checkbox label="기본 체크" defaultChecked />);
    expect(
      (screen.getByLabelText("기본 체크") as HTMLInputElement).checked,
    ).toBe(true);
  });

  it("forwards aria-label when no visible label is provided", () => {
    // Labelless checkboxes still need an accessible name (WCAG 4.1.2).
    // The native input must receive aria-label so screen readers announce it.
    render(<Checkbox aria-label="Accept terms" />);
    expect(screen.getByLabelText("Accept terms")).toBeInTheDocument();
  });
});
