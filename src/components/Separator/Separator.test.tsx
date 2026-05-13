import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "./Separator";
import { separatorFadeStyle } from "./Separator.styles";
import {
  separatorOrientationMap,
  type SeparatorOrientation,
} from "./Separator.styles";

describe("Separator", () => {
  describe("Rendering", () => {
    it("renders a decorative element by default (role=none)", () => {
      render(<Separator data-testid="s" />);
      expect(screen.getByTestId("s")).toHaveAttribute("role", "none");
    });

    it("becomes role=separator when decorative=false", () => {
      render(<Separator data-testid="s" decorative={false} />);
      expect(screen.getByTestId("s")).toHaveAttribute("role", "separator");
      expect(screen.getByTestId("s")).toHaveAttribute(
        "aria-orientation",
        "horizontal",
      );
    });
  });

  describe("Orientation", () => {
    (["horizontal", "vertical"] as const).forEach(
      (orientation: SeparatorOrientation) => {
        it(`applies ${orientation} classes`, () => {
          render(<Separator orientation={orientation} data-testid="s" />);
          separatorOrientationMap[orientation].split(" ").forEach((cls) => {
            expect(screen.getByTestId("s").className).toContain(cls);
          });
        });
      },
    );
  });

  describe("Variants", () => {
    it("solid uses era-aware background", () => {
      render(<Separator data-testid="s" />);
      expect(screen.getByTestId("s").className).toContain("bg-era-soft");
    });
    it("fade renders without error and applies a gradient via the helper", () => {
      render(<Separator variant="fade" data-testid="s" />);
      expect(screen.getByTestId("s")).toBeInTheDocument();
      // happy-dom drops gradient values from CSSOM, so we verify the
      // style helper directly — the component just spreads its return value.
      const style = separatorFadeStyle("horizontal");
      expect(style.background).toContain("linear-gradient");
    });
    it("dashed uses border-dashed", () => {
      render(<Separator variant="dashed" data-testid="s" />);
      expect(screen.getByTestId("s").className).toContain("border-dashed");
    });
  });
});
