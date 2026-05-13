import { describe, it, expect, beforeEach } from "vitest";
import { heritageEra, neonEra, applyEra } from "./index";

describe("EraTheme", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("div");
  });

  it("applyEra('heritage') sets data-era and heritage variables", () => {
    applyEra(el, "heritage");
    expect(el.dataset.era).toBe("heritage");
    expect(el.style.getPropertyValue("--era-surface-base")).toBe("#f6efe1");
    expect(el.style.getPropertyValue("--era-dur-normal")).toBe("380ms");
  });

  it("applyEra('neon') sets data-era and neon variables", () => {
    applyEra(el, "neon");
    expect(el.dataset.era).toBe("neon");
    expect(el.style.getPropertyValue("--era-surface-base")).toBe("#0b0e18");
    expect(el.style.getPropertyValue("--era-dur-normal")).toBe("220ms");
  });

  it("era themes share the same semantic slot names", () => {
    const heritageKeys = Object.keys(heritageEra.variables).sort();
    const neonKeys = Object.keys(neonEra.variables).sort();
    expect(heritageKeys).toEqual(neonKeys);
  });
});
