import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";
import {
  inputSizes,
  inputVariants,
  type InputSize,
  type InputVariant,
} from "./Input.styles";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="이름" />);
    expect(screen.getByPlaceholderText("이름")).toBeInTheDocument();
  });

  it("forwards value", () => {
    render(<Input defaultValue="x" />);
    expect((screen.getByDisplayValue("x") as HTMLInputElement).value).toBe("x");
  });

  it("calls onChange", () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} placeholder="x" />);
    fireEvent.change(screen.getByPlaceholderText("x"), {
      target: { value: "abc" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  describe("Size", () => {
    (["sm", "md", "lg"] as const).forEach((size: InputSize) => {
      it(`size=${size}`, () => {
        render(<Input inputSize={size} placeholder="x" />);
        const el = screen.getByPlaceholderText("x");
        inputSizes[size].split(" ").forEach((cls) => {
          expect(el.className).toContain(cls);
        });
      });
    });
  });

  describe("Variant", () => {
    (["default", "error"] as const).forEach((variant: InputVariant) => {
      it(`variant=${variant}`, () => {
        render(<Input variant={variant} placeholder="x" />);
        const el = screen.getByPlaceholderText("x");
        inputVariants[variant].split(" ").forEach((cls) => {
          expect(el.className).toContain(cls);
        });
      });
    });
  });

  it("supports type=password", () => {
    render(<Input type="password" placeholder="비밀번호" />);
    expect(screen.getByPlaceholderText("비밀번호")).toHaveAttribute(
      "type",
      "password",
    );
  });
});
