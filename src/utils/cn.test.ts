import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn (classNames utility)", () => {
  it("should merge simple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const isIncluded = true;
    const isExcluded = false;
    expect(cn("base", isIncluded && "included", isExcluded && "excluded")).toBe(
      "base included",
    );
  });

  it("should handle undefined and null values", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("should merge Tailwind classes correctly (last wins)", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should handle conflicting Tailwind utility classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle array of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should handle complex nested inputs", () => {
    expect(
      cn("base", ["nested", { conditional: true }], { another: false }),
    ).toBe("base nested conditional");
  });

  it("should return empty string for no valid inputs", () => {
    expect(cn()).toBe("");
    expect(cn(null, undefined, false)).toBe("");
  });
});
