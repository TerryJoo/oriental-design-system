import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stack } from "./Stack";
import {
  stackAlignMap,
  stackDirectionMap,
  stackGapMap,
  stackJustifyMap,
  type StackAlign,
  type StackDirection,
  type StackGap,
  type StackJustify,
} from "./Stack.styles";

describe("Stack", () => {
  it("renders children", () => {
    render(
      <Stack>
        <span>a</span>
        <span>b</span>
      </Stack>,
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("defaults to flex-col with gap-3", () => {
    render(
      <Stack data-testid="s">
        <span>x</span>
      </Stack>,
    );
    const el = screen.getByTestId("s");
    expect(el).toHaveClass("flex", "flex-col", "gap-3");
  });

  describe("Direction", () => {
    (["row", "column", "row-reverse", "column-reverse"] as const).forEach(
      (direction: StackDirection) => {
        it(`applies ${direction}`, () => {
          render(
            <Stack direction={direction} data-testid="s">
              x
            </Stack>,
          );
          expect(screen.getByTestId("s")).toHaveClass(
            stackDirectionMap[direction],
          );
        });
      },
    );
  });

  describe("Align / Justify / Gap", () => {
    (["start", "center", "end", "stretch", "baseline"] as const).forEach(
      (align: StackAlign) => {
        it(`align=${align}`, () => {
          render(
            <Stack align={align} data-testid="s">
              x
            </Stack>,
          );
          expect(screen.getByTestId("s")).toHaveClass(stackAlignMap[align]);
        });
      },
    );
    (
      ["start", "center", "end", "between", "around", "evenly"] as const
    ).forEach((justify: StackJustify) => {
      it(`justify=${justify}`, () => {
        render(
          <Stack justify={justify} data-testid="s">
            x
          </Stack>,
        );
        expect(screen.getByTestId("s")).toHaveClass(stackJustifyMap[justify]);
      });
    });
    (["0", "2", "6", "12"] as const).forEach((gap: StackGap) => {
      it(`gap=${gap}`, () => {
        render(
          <Stack gap={gap} data-testid="s">
            x
          </Stack>,
        );
        expect(screen.getByTestId("s")).toHaveClass(stackGapMap[gap]);
      });
    });
  });

  it("supports wrap", () => {
    render(
      <Stack wrap data-testid="s">
        x
      </Stack>,
    );
    expect(screen.getByTestId("s")).toHaveClass("flex-wrap");
  });

  it("can render as a different element", () => {
    render(
      <Stack as="section" data-testid="s">
        x
      </Stack>,
    );
    expect(screen.getByTestId("s").tagName).toBe("SECTION");
  });
});
