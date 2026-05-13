import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("links label to input via htmlFor", () => {
    render(<TextField label="이름" placeholder="이름" />);
    expect(screen.getByLabelText("이름")).toBe(
      screen.getByPlaceholderText("이름"),
    );
  });

  it("renders helper text when provided", () => {
    render(<TextField helperText="설명입니다" placeholder="x" />);
    expect(screen.getByText("설명입니다")).toBeInTheDocument();
  });

  it("renders error and sets aria-invalid", () => {
    render(<TextField error="잘못된 형식" placeholder="x" />);
    const input = screen.getByPlaceholderText("x");
    expect(screen.getByText("잘못된 형식")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
