import { useEffect, useState } from "react";

export type Dir = "ltr" | "rtl";

/**
 * Reads the active text direction from `<html dir="...">` and updates whenever
 * the attribute changes (e.g. via the Storybook Direction toolbar, an i18n
 * library, or runtime user preference). Components use this when keyboard
 * arrow keys must preserve LOGICAL meaning under RTL — `ArrowRight` should
 * always advance toward the inline-end side regardless of physical layout.
 *
 * Defaults to `"ltr"` during SSR / before hydration so server output and the
 * initial client render agree.
 */
export function useDir(): Dir {
  const [dir, setDir] = useState<Dir>(() => {
    if (typeof document === "undefined") return "ltr";
    const value = document.documentElement.getAttribute("dir");
    return value === "rtl" ? "rtl" : "ltr";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    const sync = () => {
      const value = root.getAttribute("dir");
      setDir(value === "rtl" ? "rtl" : "ltr");
    };

    sync();

    // Watch for runtime flips (Storybook toolbar writes `dir` directly on
    // <html>, and consumer apps may toggle via locale switches).
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);

  return dir;
}
