import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tooltip } from "./Tooltip";
import {
  tooltipBubbleStyles,
  tooltipPlacementMap,
  type TooltipPlacement,
} from "./Tooltip.styles";

describe("Tooltip", () => {
  it("renders the trigger and a hidden bubble by default", () => {
    render(
      <Tooltip content="설명">
        <button>?</button>
      </Tooltip>,
    );
    const bubble = screen.getByRole("tooltip");
    expect(bubble).toHaveTextContent("설명");
    expect(bubble.className).toContain("opacity-0");
  });

  it("shows the bubble on mouseenter", () => {
    render(
      <Tooltip content="설명">
        <button>?</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button");
    fireEvent.mouseEnter(trigger.parentElement!);
    expect(screen.getByRole("tooltip").className).toContain("opacity-100");
  });

  it("respects controlled open prop", () => {
    render(
      <Tooltip content="설명" open>
        <button>?</button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip").className).toContain("opacity-100");
  });

  describe("Placement", () => {
    (["top", "bottom", "left", "right"] as const).forEach(
      (placement: TooltipPlacement) => {
        it(`placement=${placement}`, () => {
          render(
            <Tooltip content="x" placement={placement} open>
              <button>?</button>
            </Tooltip>,
          );
          tooltipPlacementMap[placement].split(" ").forEach((cls) => {
            expect(screen.getByRole("tooltip").className).toContain(cls);
          });
        });
      },
    );
  });

  describe("aria-describedby wiring (WAI-ARIA tooltip pattern)", () => {
    it("trigger receives aria-describedby matching the tooltip id while open", () => {
      render(
        <Tooltip content="설명" open>
          <button>?</button>
        </Tooltip>,
      );
      const trigger = screen.getByRole("button");
      const tooltip = screen.getByRole("tooltip");
      const describedBy = trigger.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      expect(describedBy?.split(" ")).toContain(tooltip.id);
    });

    it("removes its contribution from aria-describedby while closed", () => {
      render(
        <Tooltip content="설명">
          <button>?</button>
        </Tooltip>,
      );
      const trigger = screen.getByRole("button");
      const tooltip = screen.getByRole("tooltip");
      const describedBy = trigger.getAttribute("aria-describedby");
      // Either the attribute is absent, or it does not reference the tooltip id.
      if (describedBy !== null) {
        expect(describedBy.split(" ")).not.toContain(tooltip.id);
      }
    });

    it("toggles aria-describedby on hover open/close", () => {
      render(
        <Tooltip content="설명">
          <button>?</button>
        </Tooltip>,
      );
      const trigger = screen.getByRole("button");
      const tooltip = screen.getByRole("tooltip");
      const wrapper = trigger.parentElement!;

      // Closed initially
      const initial = trigger.getAttribute("aria-describedby");
      if (initial !== null) {
        expect(initial.split(" ")).not.toContain(tooltip.id);
      }

      // Hover → opens → describedby present
      fireEvent.mouseEnter(wrapper);
      expect(trigger.getAttribute("aria-describedby")?.split(" ")).toContain(
        tooltip.id,
      );

      // Unhover → closes → describedby removed
      fireEvent.mouseLeave(wrapper);
      const afterClose = trigger.getAttribute("aria-describedby");
      if (afterClose !== null) {
        expect(afterClose.split(" ")).not.toContain(tooltip.id);
      }
    });

    it("preserves consumer-provided aria-describedby alongside tooltip id while open", () => {
      render(
        <Tooltip content="설명" open>
          <button aria-describedby="external-help">?</button>
        </Tooltip>,
      );
      const trigger = screen.getByRole("button");
      const tooltip = screen.getByRole("tooltip");
      const tokens = trigger.getAttribute("aria-describedby")?.split(" ") ?? [];
      expect(tokens).toContain("external-help");
      expect(tokens).toContain(tooltip.id);
    });

    it("preserves only consumer-provided aria-describedby while closed", () => {
      render(
        <Tooltip content="설명">
          <button aria-describedby="external-help">?</button>
        </Tooltip>,
      );
      const trigger = screen.getByRole("button");
      const tooltip = screen.getByRole("tooltip");
      const tokens = trigger.getAttribute("aria-describedby")?.split(" ") ?? [];
      expect(tokens).toContain("external-help");
      expect(tokens).not.toContain(tooltip.id);
    });
  });

  describe("a11y regression — no opacity ramp", () => {
    // Wave 5b2-Round3 lock: the bubble must NOT carry a CSS transition
    // that ramps `opacity` between 0 and 1. axe-playwright samples
    // contrast at a single frame; mid-fade samples drop the foreground
    // anchor below WCAG AA and trip the `color-contrast` rule. The
    // visibility states (`opacity-0` / `opacity-100`) themselves are
    // fine — they're either fully transparent (no contrast check) or
    // fully opaque (full contrast). What's banned is the easing
    // between the two. Same invariant guards Toast/Popover/Badge.
    it("does not declare a transition on opacity", () => {
      const closed = tooltipBubbleStyles({ open: false });
      const open = tooltipBubbleStyles({ open: true });
      // No `transition-opacity` utility — that re-introduces the ramp.
      expect(closed).not.toContain("transition-opacity");
      expect(open).not.toContain("transition-opacity");
      // No bare `transition` (Tailwind's `transition` utility includes
      // opacity in its default property list).
      expect(closed.split(" ")).not.toContain("transition");
      expect(open.split(" ")).not.toContain("transition");
      // No `transition-all` either — same problem.
      expect(closed.split(" ")).not.toContain("transition-all");
      expect(open.split(" ")).not.toContain("transition-all");
    });

    it("preserves the opacity visibility classes (test contract)", () => {
      // Other tests + the Storybook play function assert these exact
      // class tokens to detect open/close state. Don't drop them.
      expect(tooltipBubbleStyles({ open: false })).toContain("opacity-0");
      expect(tooltipBubbleStyles({ open: true })).toContain("opacity-100");
    });
  });

  describe("overflow / ellipsis contract (Wave 5b2-C3)", () => {
    // Wave 5b2-C3 lock: long tooltip copy MUST wrap inside a 16rem
    // ceiling. Earlier the bubble used `whitespace-nowrap`, which
    // forced any content onto a single line and could push the bubble
    // off-canvas. The replacement is `whitespace-normal max-w-[16rem]`.
    it("uses whitespace-normal (not nowrap) so long copy wraps", () => {
      const open = tooltipBubbleStyles({ open: true });
      const closed = tooltipBubbleStyles({ open: false });
      expect(open.split(" ")).not.toContain("whitespace-nowrap");
      expect(closed.split(" ")).not.toContain("whitespace-nowrap");
      expect(open).toContain("whitespace-normal");
      expect(closed).toContain("whitespace-normal");
    });

    it("caps the bubble width at 16rem", () => {
      expect(tooltipBubbleStyles({ open: true })).toContain("max-w-[16rem]");
    });
  });
});
