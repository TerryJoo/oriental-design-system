import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";
import {
  cardPaddings,
  cardVariants,
  type CardPadding,
  type CardVariant,
} from "./Card.styles";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>안녕</Card>);
    expect(screen.getByText("안녕")).toBeInTheDocument();
  });

  describe("Variants", () => {
    (["default", "scroll", "glass"] as const).forEach(
      (variant: CardVariant) => {
        it(`applies ${variant} variant classes`, () => {
          render(
            <Card variant={variant} data-testid="c">
              x
            </Card>,
          );
          cardVariants[variant].split(" ").forEach((cls) => {
            expect(screen.getByTestId("c").className).toContain(cls);
          });
        });
      },
    );
  });

  describe("Padding", () => {
    (["none", "sm", "md", "lg"] as const).forEach((padding: CardPadding) => {
      it(`padding=${padding}`, () => {
        render(
          <Card padding={padding} data-testid="c">
            x
          </Card>,
        );
        expect(screen.getByTestId("c")).toHaveClass(cardPaddings[padding]);
      });
    });
  });

  it("interactive adds cursor-pointer", () => {
    render(
      <Card interactive data-testid="c">
        x
      </Card>,
    );
    expect(screen.getByTestId("c")).toHaveClass("cursor-pointer");
  });
});
