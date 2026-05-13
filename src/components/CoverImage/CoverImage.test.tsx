import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoverImage } from "./CoverImage";
import { coverImageRatioMap, type CoverImageRatio } from "./CoverImage.styles";

describe("CoverImage", () => {
  it("renders label when provided", () => {
    render(<CoverImage label="龍의 영역" data-testid="c" />);
    expect(screen.getByText("龍의 영역")).toBeInTheDocument();
  });

  it("renders an image when src is set", () => {
    render(<CoverImage src="https://example.invalid/x.png" alt="x" />);
    expect(screen.getByAltText("x")).toBeInTheDocument();
  });

  describe("Ratios", () => {
    (["16/9", "4/3", "1/1", "21/9"] as const).forEach(
      (ratio: CoverImageRatio) => {
        it(`ratio=${ratio}`, () => {
          render(<CoverImage ratio={ratio} data-testid="c" />);
          expect(screen.getByTestId("c").className).toContain(
            coverImageRatioMap[ratio],
          );
        });
      },
    );
  });
});
