import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";
import {
  badgeSizes,
  badgeShapes,
  badgeVariants,
  type BadgeVariant,
} from "./Badge.styles";

describe("Badge Component", () => {
  describe("Rendering", () => {
    it("renders with default props", () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText("Default")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<Badge className="custom-class">Badge</Badge>);
      expect(screen.getByText("Badge")).toHaveClass("custom-class");
    });
  });

  describe("Variants", () => {
    (
      ["default", "primary", "success", "warning", "error", "info"] as const
    ).forEach((variant) => {
      it(`renders ${variant} variant`, () => {
        render(<Badge variant={variant}>{variant}</Badge>);
        const badge = screen.getByText(variant);
        expect(badge.className).toContain(badgeVariants[variant].bg);
        expect(badge.className).toContain(badgeVariants[variant].text);
      });
    });
  });

  describe("Sizes", () => {
    (["sm", "md", "lg"] as const).forEach((size) => {
      it(`renders ${size} size`, () => {
        render(<Badge size={size}>{size}</Badge>);
        const badge = screen.getByText(size);
        badgeSizes[size].split(" ").forEach((cls) => {
          expect(badge.className).toContain(cls);
        });
      });
    });
  });

  describe("Shapes", () => {
    (["rounded", "pill", "square"] as const).forEach((shape) => {
      it(`renders ${shape} shape`, () => {
        render(<Badge shape={shape}>{shape}</Badge>);
        expect(screen.getByText(shape)).toHaveClass(badgeShapes[shape]);
      });
    });
  });

  describe("Dot indicator", () => {
    it("renders dot when dot prop is true", () => {
      render(<Badge dot>With Dot</Badge>);
      expect(screen.getByTestId("badge-dot")).toBeInTheDocument();
    });

    it("does not render dot by default", () => {
      render(<Badge>No Dot</Badge>);
      expect(screen.queryByTestId("badge-dot")).not.toBeInTheDocument();
    });

    it("applies variant-matching dot color", () => {
      render(
        <Badge dot variant="success">
          Status
        </Badge>,
      );
      const dot = screen.getByTestId("badge-dot");
      expect(dot).toHaveClass("bg-success-500");
      expect(dot).toHaveClass("rounded-full");
    });
  });

  describe("Animations", () => {
    // The default-on `animate-fade-in` was removed in Wave 5b2-Round2 — it
    // ran a 200ms opacity 0→1 keyframe that made axe `color-contrast`
    // sample mid-fade and fail intermittently in the storybook test
    // runner. Lock the regression: the badge must NOT ship the entrance
    // animation by default.
    it("does not run an entrance fade-in by default", () => {
      render(<Badge>Static</Badge>);
      expect(screen.getByText("Static")).not.toHaveClass("animate-fade-in");
    });

    it("supports pulse animation", () => {
      render(<Badge pulse>Notification</Badge>);
      expect(screen.getByText("Notification")).toHaveClass(
        "motion-safe:animate-pulse-subtle",
      );
    });
  });

  describe("Accessibility", () => {
    it("supports role attribute", () => {
      render(<Badge role="status">Status</Badge>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // The Neon era surface is near-black (#0b0e18) and the Heritage
    // surface is parchment cream (#f6efe1). Every variant ships a SOLID
    // tinted fill in BOTH eras so axe can compute color-contrast against
    // a deterministic background — translucent literals (`rgb(.../0.x)`)
    // against the Storybook iframe (transparent body until an era is
    // set) previously tripped axe regardless of the math being fine on a
    // real surface. Asserting on the raw class lets us catch regressions
    // without relying on a real browser computed style.
    describe("Era-aware contrast overrides", () => {
      const neonOverrides: Array<{
        variant: BadgeVariant;
        text: string;
        bg: string;
      }> = [
        {
          variant: "primary",
          text: "[[data-era=neon]_&]:text-accent-200",
          bg: "[[data-era=neon]_&]:bg-accent-800",
        },
        {
          variant: "success",
          text: "[[data-era=neon]_&]:text-success-200",
          bg: "[[data-era=neon]_&]:bg-success-900",
        },
        {
          variant: "warning",
          text: "[[data-era=neon]_&]:text-warning-200",
          bg: "[[data-era=neon]_&]:bg-warning-900",
        },
        {
          variant: "error",
          text: "[[data-era=neon]_&]:text-error-200",
          bg: "[[data-era=neon]_&]:bg-error-900",
        },
        {
          variant: "info",
          text: "[[data-era=neon]_&]:text-info-200",
          bg: "[[data-era=neon]_&]:bg-info-900",
        },
      ];

      neonOverrides.forEach(({ variant, text, bg }) => {
        it(`emits a Neon text override for ${variant}`, () => {
          render(<Badge variant={variant}>{variant}</Badge>);
          expect(screen.getByText(variant).className).toContain(text);
        });

        it(`emits a Neon background override for ${variant}`, () => {
          render(<Badge variant={variant}>{variant}</Badge>);
          expect(screen.getByText(variant).className).toContain(bg);
        });
      });

      it("emits a Neon override for the default variant fill", () => {
        render(<Badge variant="default">default</Badge>);
        // `text-era-primary` already flips to a light tint in Neon via the
        // CSS variable, so only the fill needs to flip from accent-50
        // (Heritage cream-tint) to accent-900 (Neon dark-tint).
        expect(screen.getByText("default").className).toContain(
          "[[data-era=neon]_&]:bg-accent-900",
        );
      });

      it("caps the chip width and clamps long labels (Wave 5b2-C3)", () => {
        render(<Badge>아주 긴 텍스트가 여기에 들어옵니다 정말로요</Badge>);
        const chip = screen.getByText(
          "아주 긴 텍스트가 여기에 들어옵니다 정말로요",
        );
        // Outer chip caps at 16rem and uses `truncate` so the label
        // clips with an ellipsis instead of pushing siblings around.
        expect(chip.className).toContain("max-w-[16rem]");
        expect(chip.className).toContain("truncate");
      });

      it("uses solid Heritage fills (no translucent rgb() literals)", () => {
        // Regression guard — the original a11y failure stemmed from
        // `bg-[rgb(... /0.x)]` literals against an indeterminate
        // ancestor. We assert NONE of the Heritage-default fills use
        // that pattern so axe always has a solid bg to evaluate.
        (
          ["default", "primary", "success", "warning", "error", "info"] as const
        ).forEach((variant) => {
          render(<Badge variant={variant}>{`${variant}-solid`}</Badge>);
          const className = screen.getByText(`${variant}-solid`).className;
          // Heritage-default bg is the FIRST `bg-*` token we author. A
          // translucent literal would look like `bg-[rgb(...)]`; the
          // solid token form is `bg-{name}-{shade}`.
          expect(className).not.toMatch(
            /(?<!\[data-era=neon\]_&\]:)bg-\[rgb\(/,
          );
        });
      });
    });
  });
});
