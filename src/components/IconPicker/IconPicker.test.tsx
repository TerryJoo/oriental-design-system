import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IconPicker } from "./IconPicker";

const OPTS = [
  { value: "dragon", icon: "龍", label: "용" },
  { value: "tiger", icon: "虎", label: "호랑이" },
  { value: "phoenix", icon: "鳳", label: "봉황" },
];

describe("IconPicker", () => {
  it("renders options as radios", () => {
    render(<IconPicker options={OPTS} value="dragon" />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("marks active option with aria-checked", () => {
    render(<IconPicker options={OPTS} value="tiger" />);
    expect(screen.getByLabelText("호랑이")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("reports onChange when clicking", () => {
    const onChange = vi.fn();
    render(
      <IconPicker options={OPTS} defaultValue="dragon" onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText("봉황"));
    expect(onChange).toHaveBeenCalledWith("phoenix");
  });
});
