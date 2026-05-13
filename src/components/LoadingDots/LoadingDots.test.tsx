import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingDots } from "./LoadingDots";
import {
  loadingDotsSpeedMap,
  type LoadingDotsSpeed,
} from "./LoadingDots.styles";

describe("LoadingDots", () => {
  it("has role=status and accessible label", () => {
    render(<LoadingDots label="잠시만요" />);
    expect(
      screen.getByRole("status", { name: "잠시만요" }),
    ).toBeInTheDocument();
  });

  it("renders three dots", () => {
    const { container } = render(<LoadingDots />);
    expect(container.querySelectorAll("span > span")).toHaveLength(3);
  });

  describe("Speed", () => {
    (["slow", "normal", "fast"] as const).forEach((speed: LoadingDotsSpeed) => {
      it(`speed=${speed}`, () => {
        const { container } = render(<LoadingDots speed={speed} />);
        const dot = container.querySelector("span > span");
        expect(dot?.className).toContain(loadingDotsSpeedMap[speed]);
      });
    });
  });
});
