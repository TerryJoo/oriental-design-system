import { describe, it, expect, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDir } from "./useDir";

describe("useDir", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("dir");
  });

  it("returns 'ltr' by default", () => {
    const { result } = renderHook(() => useDir());
    expect(result.current).toBe("ltr");
  });

  it("returns 'rtl' when <html dir='rtl'> is set before mount", () => {
    document.documentElement.setAttribute("dir", "rtl");
    const { result } = renderHook(() => useDir());
    expect(result.current).toBe("rtl");
  });

  it("updates when <html dir> changes at runtime", async () => {
    const { result } = renderHook(() => useDir());
    expect(result.current).toBe("ltr");

    document.documentElement.setAttribute("dir", "rtl");
    // MutationObserver fires asynchronously; waitFor polls until the
    // observer flushes and our setState propagates.
    await waitFor(() => expect(result.current).toBe("rtl"));

    document.documentElement.setAttribute("dir", "ltr");
    await waitFor(() => expect(result.current).toBe("ltr"));
  });

  it("treats non-rtl values as 'ltr'", () => {
    document.documentElement.setAttribute("dir", "auto");
    const { result } = renderHook(() => useDir());
    expect(result.current).toBe("ltr");
  });
});
