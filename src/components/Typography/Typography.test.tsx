import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Typography } from "./Typography";
import {
  typographyVariants,
  typographyTones,
  type TypographyTone,
  type TypographyVariant,
} from "./Typography.styles";

describe("Typography", () => {
  describe("Rendering", () => {
    it("renders body variant as <p> by default", () => {
      render(<Typography>본문</Typography>);
      const el = screen.getByText("본문");
      expect(el.tagName).toBe("P");
    });

    it("renders h1/h2/h3/h4 with the correct heading tag", () => {
      const { rerender } = render(<Typography variant="h1">제목</Typography>);
      expect(screen.getByText("제목").tagName).toBe("H1");
      rerender(<Typography variant="h2">제목</Typography>);
      expect(screen.getByText("제목").tagName).toBe("H2");
      rerender(<Typography variant="h3">제목</Typography>);
      expect(screen.getByText("제목").tagName).toBe("H3");
      rerender(<Typography variant="h4">제목</Typography>);
      expect(screen.getByText("제목").tagName).toBe("H4");
    });

    it("supports `as` to override the rendered tag", () => {
      render(
        <Typography variant="body" as="div">
          override
        </Typography>,
      );
      expect(screen.getByText("override").tagName).toBe("DIV");
    });
  });

  describe("Variants", () => {
    (
      [
        "h1",
        "h2",
        "h3",
        "h4",
        "body",
        "body-sm",
        "caption",
        "accent",
        "code",
      ] as const
    ).forEach((variant: TypographyVariant) => {
      it(`applies ${variant} classes`, () => {
        render(<Typography variant={variant}>x</Typography>);
        const el = screen.getByText("x");
        typographyVariants[variant].split(" ").forEach((cls) => {
          expect(el.className).toContain(cls);
        });
      });
    });
  });

  describe("Tones", () => {
    (["default", "muted", "inverse", "accent", "seal"] as const).forEach(
      (tone: TypographyTone) => {
        it(`applies ${tone} tone class`, () => {
          render(<Typography tone={tone}>x</Typography>);
          expect(screen.getByText("x")).toHaveClass(typographyTones[tone]);
        });
      },
    );
  });

  describe("HTML attributes", () => {
    it("passes through className", () => {
      render(<Typography className="custom">x</Typography>);
      expect(screen.getByText("x")).toHaveClass("custom");
    });

    it("forwards id and data attributes", () => {
      render(
        <Typography id="t1" data-testid="t1">
          x
        </Typography>,
      );
      const el = screen.getByTestId("t1");
      expect(el).toHaveAttribute("id", "t1");
    });
  });
});
