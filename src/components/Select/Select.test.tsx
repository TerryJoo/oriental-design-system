import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Select } from "./Select";
import { inputSizes } from "../Input/Input.styles";

describe("Select", () => {
  it("renders options and reports change", () => {
    const onChange = vi.fn();
    render(
      <Select onChange={onChange} aria-label="난이도">
        <option value="easy">Easy</option>
        <option value="hard">Hard</option>
      </Select>,
    );
    fireEvent.change(screen.getByLabelText("난이도"), {
      target: { value: "hard" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("supports selectSize and variant", () => {
    render(
      <Select aria-label="x" selectSize="lg" variant="error">
        <option>x</option>
      </Select>,
    );
    expect(screen.getByLabelText("x")).toBeInTheDocument();
  });

  it("renders a wrapping <label> linked to the select via htmlFor/id when label prop is provided", () => {
    render(
      <Select label="Difficulty">
        <option value="easy">Easy</option>
        <option value="hard">Hard</option>
      </Select>,
    );

    // Accessible name resolves through the rendered <label>.
    const select = screen.getByLabelText("Difficulty");
    expect(select.tagName).toBe("SELECT");

    // for/id wiring uses the same generated id.
    const label = screen.getByText("Difficulty") as HTMLLabelElement;
    expect(label.tagName).toBe("LABEL");
    expect(label.htmlFor).toBeTruthy();
    expect(label.htmlFor).toBe(select.getAttribute("id"));
  });

  it("respects a caller-supplied id and links the label to it", () => {
    render(
      <Select id="difficulty-field" label="Difficulty">
        <option value="easy">Easy</option>
      </Select>,
    );

    const select = screen.getByLabelText("Difficulty");
    expect(select.getAttribute("id")).toBe("difficulty-field");
    const label = screen.getByText("Difficulty") as HTMLLabelElement;
    expect(label.htmlFor).toBe("difficulty-field");
  });

  it('renders the size="lg" class tokens on the underlying <select>', () => {
    render(
      <Select aria-label="size-test" selectSize="lg">
        <option>x</option>
      </Select>,
    );
    const select = screen.getByLabelText("size-test");
    inputSizes.lg.split(" ").forEach((cls) => {
      expect(select.className).toContain(cls);
    });
  });

  it("renders the decorative chevron icon next to the native control", () => {
    render(
      <Select aria-label="chevron-test">
        <option>x</option>
      </Select>,
    );
    const chevronWrapper = screen.getByTestId("select-chevron");
    expect(chevronWrapper).toBeInTheDocument();
    expect(chevronWrapper).toHaveAttribute("aria-hidden", "true");
    // SVG element must be present so the affordance survives
    // headless-DOM rendering and a11y trees.
    expect(chevronWrapper.querySelector("svg")).not.toBeNull();
  });
});
