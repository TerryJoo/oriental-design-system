import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tag } from "./Tag";
import { tagStyles } from "./Tag.styles";

describe("Tag", () => {
  it("renders content", () => {
    render(<Tag>전략</Tag>);
    expect(screen.getByText("전략")).toBeInTheDocument();
  });

  it("renders × when onRemove provided", () => {
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>전략</Tag>);
    fireEvent.click(screen.getByRole("button", { name: "제거" }));
    expect(onRemove).toHaveBeenCalled();
  });

  it("does not render × by default", () => {
    render(<Tag>전략</Tag>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  describe("a11y regression — solid background fills", () => {
    // Wave 5b2-Round3 lock: the chip body MUST NOT use translucent
    // backgrounds (`bg-[rgb(var(--accent-X)/<alpha>)]`). Translucent
    // fills force axe to walk the ancestor chain to resolve the
    // effective background; on the Storybook iframe (transparent
    // body) and within stacked era panels the chain yields an
    // indeterminate composite and the `color-contrast` rule fires
    // conservatively (Wave 6a flagged 2 nodes on neon era). Solid
    // tonal fills (`bg-accent-50` Heritage / `bg-accent-900` Neon)
    // give axe a deterministic background to score against. Same
    // invariant guards Badge.
    it("uses solid (no-alpha) background utilities for both eras", () => {
      const classes = tagStyles().split(" ");
      // Heritage default: solid `bg-accent-50`, NOT
      // `bg-[rgb(var(--accent-500)/0.14)]`.
      expect(classes).toContain("bg-accent-50");
      expect(
        classes.some(
          (c) => c.startsWith("bg-[rgb(var(--accent") && c.includes("/0."),
        ),
      ).toBe(false);

      // Neon override: solid `bg-accent-900`, NOT
      // `[[data-era=neon]_&]:bg-[rgb(var(--accent-400)/0.18)]`.
      expect(classes).toContain("[[data-era=neon]_&]:bg-accent-900");
      expect(
        classes.some(
          (c) =>
            c.startsWith("[[data-era=neon]_&]:bg-[rgb(var(--accent") &&
            c.includes("/0."),
        ),
      ).toBe(false);
    });

    it("pairs each solid fill with a high-contrast text anchor", () => {
      const classes = tagStyles().split(" ");
      // Heritage: deep oxblood ink on parchment fill.
      expect(classes).toContain("text-accent-800");
      // Neon: ice-blue text on deep indigo fill.
      expect(classes).toContain("[[data-era=neon]_&]:text-accent-200");
    });
  });

  describe("overflow / ellipsis contract (Wave 5b2-C3)", () => {
    // Lock the standardized overflow pattern: outer chip caps at 16rem,
    // inner label clamps to a single line with truncate. Prevents a
    // runaway label from forcing horizontal scroll inside chip rows.
    it("caps the outer chip width at 16rem", () => {
      expect(tagStyles().split(" ")).toContain("max-w-[16rem]");
    });

    it("clamps the inner label with truncate", () => {
      render(<Tag>매우 긴 라벨이 들어옵니다</Tag>);
      // The inner span (first span child of the chip) is the label
      // wrapper. It should expose `truncate` so the text clips with
      // an ellipsis.
      const chip = screen.getByText("매우 긴 라벨이 들어옵니다");
      expect(chip.className).toContain("truncate");
    });
  });
});
