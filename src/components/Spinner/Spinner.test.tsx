import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";
import { spinnerSizes, type SpinnerSize } from "./Spinner.styles";

describe("Spinner", () => {
  it("has role=status and a sr-only label", () => {
    render(<Spinner label="잠시만요" />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(screen.getByText("잠시만요")).toHaveClass("sr-only");
  });

  describe("Sizes", () => {
    (["sm", "md", "lg"] as const).forEach((size: SpinnerSize) => {
      it(`size=${size}`, () => {
        render(<Spinner size={size} data-testid="s" />);
        spinnerSizes[size].split(" ").forEach((cls) => {
          expect(screen.getByTestId("s").className).toContain(cls);
        });
      });
    });
  });
});
