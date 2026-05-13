import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatternBackground } from "./PatternBackground";
import {
  patternBackgroundLayerStyle,
  patternBackgroundVariants,
  type PatternVariant,
} from "./PatternBackground.styles";

describe("PatternBackground", () => {
  describe("Rendering", () => {
    it("renders children", () => {
      render(
        <PatternBackground>
          <p>안녕</p>
        </PatternBackground>,
      );
      expect(screen.getByText("안녕")).toBeInTheDocument();
    });

    it("renders an aria-hidden pattern layer", () => {
      render(<PatternBackground />);
      const layer = screen.getByTestId("pattern-layer");
      expect(layer).toHaveAttribute("aria-hidden", "true");
    });

    it("supports the `as` prop to switch element tag", () => {
      const { container } = render(<PatternBackground as="section" />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    (patternBackgroundVariants as readonly PatternVariant[]).forEach(
      (variant) => {
        it(`renders ${variant} variant`, () => {
          // happy-dom drops var()/gradient values from CSSOM, so we smoke-test
          // the render path here and verify the layer-style helper separately.
          render(<PatternBackground variant={variant} />);
          expect(screen.getByTestId("pattern-layer")).toBeInTheDocument();
        });
      },
    );
  });

  describe("Intensity", () => {
    it("subtle uses opacity 0.4", () => {
      render(<PatternBackground intensity="subtle" />);
      expect(screen.getByTestId("pattern-layer").style.opacity).toBe("0.4");
    });
    it("strong uses opacity 1", () => {
      render(<PatternBackground intensity="strong" />);
      expect(screen.getByTestId("pattern-layer").style.opacity).toBe("1");
    });
  });

  describe("Fixed mode", () => {
    it("positions the pattern fixed so it bleeds under the viewport", () => {
      render(<PatternBackground fixed />);
      expect(screen.getByTestId("pattern-layer").style.position).toBe("fixed");
    });
    it("defaults to absolute positioning inside the wrapper", () => {
      render(<PatternBackground />);
      expect(screen.getByTestId("pattern-layer").style.position).toBe(
        "absolute",
      );
    });
  });

  describe("Style helper", () => {
    (patternBackgroundVariants as readonly PatternVariant[]).forEach(
      (variant) => {
        it(`${variant} maps to a non-empty backgroundImage`, () => {
          const style = patternBackgroundLayerStyle({
            variant,
            intensity: "subtle",
          });
          expect(style.backgroundImage).toBeTruthy();
          expect(String(style.backgroundImage).length).toBeGreaterThan(0);
        });
      },
    );
  });
});
