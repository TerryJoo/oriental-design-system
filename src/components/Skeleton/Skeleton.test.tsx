import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";
import { skeletonShapeMap, type SkeletonShape } from "./Skeleton.styles";

describe("Skeleton", () => {
  it("has aria-busy and animation", () => {
    render(<Skeleton data-testid="s" />);
    const s = screen.getByTestId("s");
    expect(s).toHaveAttribute("aria-busy", "true");
    expect(s.className).toContain("animate-shimmer");
  });

  describe("Shape", () => {
    (["line", "circle", "rect"] as const).forEach((shape: SkeletonShape) => {
      it(`shape=${shape}`, () => {
        render(<Skeleton shape={shape} data-testid="s" />);
        skeletonShapeMap[shape].split(" ").forEach((cls) => {
          expect(screen.getByTestId("s").className).toContain(cls);
        });
      });
    });
  });

  it("applies width and height", () => {
    render(<Skeleton width={100} height={20} data-testid="s" />);
    expect(screen.getByTestId("s")).toHaveStyle({
      width: "100px",
      height: "20px",
    });
  });
});
