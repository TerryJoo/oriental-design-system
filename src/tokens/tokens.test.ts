import { describe, it, expect } from "vitest";
import { colors } from "./colors";
import { typography } from "./typography";
import { animations } from "./animations";
import { shadows } from "./shadows";
import { zIndex } from "./zIndex";
import { era } from "./era";

describe("tokens", () => {
  describe("colors", () => {
    it("exposes full 50-950 scale for primary", () => {
      [
        "50",
        "100",
        "200",
        "300",
        "400",
        "500",
        "600",
        "700",
        "800",
        "900",
        "950",
      ].forEach((shade) => {
        expect(colors.primary).toHaveProperty(shade);
      });
    });

    it("provides CSS custom property driven accents", () => {
      expect(colors.accent["600"]).toContain("--accent-600");
    });

    it("includes oriental palette (indigo, gold, jade, coral)", () => {
      expect(colors.indigo["600"]).toBeDefined();
      expect(colors.gold["500"]).toBeDefined();
      expect(colors.jade["500"]).toBeDefined();
      expect(colors.coral["500"]).toBeDefined();
    });
  });

  describe("typography", () => {
    it("provides heritage and neon font stacks", () => {
      expect(typography.fontFamilies.heritageDisplay[0]).toMatch(/Gowun/);
      expect(typography.fontFamilies.neonDisplay[0]).toMatch(/Orbitron/);
    });

    it("provides semantic font sizes as tuples", () => {
      const [size, meta] = typography.fontSize["heading-2"];
      expect(typeof size).toBe("string");
      expect(meta.lineHeight).toBeDefined();
    });
  });

  describe("animations", () => {
    it("includes era-specific keyframes", () => {
      expect(animations.keyframes.heritageInkSpread).toBeDefined();
      expect(animations.keyframes.neonBreath).toBeDefined();
    });

    it("includes brush + charge easing curves", () => {
      expect(animations.transitionTimingFunction.brush).toBeDefined();
      expect(animations.transitionTimingFunction.charge).toBeDefined();
    });
  });

  describe("shadows", () => {
    it("includes era shadow slots bound to CSS variables", () => {
      expect(shadows["era-card"]).toBe("var(--era-shadow-card)");
      expect(shadows["era-modal"]).toBe("var(--era-shadow-modal)");
    });
  });

  describe("zIndex", () => {
    it("has modal layering above dropdown", () => {
      expect(zIndex.modal).toBeGreaterThan(zIndex.dropdown);
      expect(zIndex.toast).toBeGreaterThan(zIndex.modal);
    });
  });

  describe("era tokens", () => {
    it("binds slots to CSS custom properties", () => {
      expect(era.surface.base).toBe("var(--era-surface-base)");
      expect(era.motion.durFast).toBe("var(--era-dur-fast)");
      expect(era.shadow.card).toBe("var(--era-shadow-card)");
    });
  });
});
