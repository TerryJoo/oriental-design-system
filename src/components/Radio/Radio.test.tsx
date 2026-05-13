import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Radio } from "./Radio";

describe("Radio", () => {
  it("renders label and selects on click", () => {
    const onChange = vi.fn();
    render(
      <>
        <Radio name="r" value="a" label="A" onChange={onChange} />
        <Radio name="r" value="b" label="B" onChange={onChange} />
      </>,
    );
    fireEvent.click(screen.getByLabelText("B"));
    expect((screen.getByLabelText("B") as HTMLInputElement).checked).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it("supports disabled", () => {
    render(<Radio label="x" disabled />);
    expect(screen.getByLabelText("x")).toBeDisabled();
  });
});
