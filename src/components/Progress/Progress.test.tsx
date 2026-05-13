import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("has role=progressbar with aria-valuenow", () => {
    render(<Progress value={42} />);
    const p = screen.getByRole("progressbar");
    expect(p).toHaveAttribute("aria-valuenow", "42");
    expect(p).toHaveAttribute("aria-valuemin", "0");
    expect(p).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps value to 0-100", () => {
    render(<Progress value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("hides aria-valuenow in indeterminate mode", () => {
    render(<Progress indeterminate />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });
});
