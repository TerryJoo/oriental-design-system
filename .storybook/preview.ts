import type { Preview, Decorator } from "@storybook/react";
import { createElement } from "react";
import { useEffect, useGlobals } from "@storybook/preview-api";
import { applyEra, type EraName } from "../src/themes";
import "../src/styles/globals.css";
import "../src/styles/eras/heritage.css";
import "../src/styles/eras/neon.css";

const ERA_SURFACE: Record<"heritage" | "neon", string> = {
  heritage: "#f6efe1",
  neon: "#0b0e18",
};

// Stylesheet that simulates `prefers-reduced-motion: reduce` regardless of
// the OS setting. Activated when the toolbar's Motion toggle is set to
// "reduce". Implementation pattern: a `<style id="sb-motion-reduce">` tag
// keyed off `<html data-motion="reduce">` so the rule cascade is scoped
// and removable. The duration values match the WCAG-recommended minimum
// (`0.001ms`) — non-zero so animation/transition events still fire,
// preserving any state machines that rely on `transitionend` /
// `animationend` callbacks.
const MOTION_REDUCE_STYLE_ID = "sb-motion-reduce";
const MOTION_REDUCE_CSS = `
[data-motion="reduce"] *,
[data-motion="reduce"] *::before,
[data-motion="reduce"] *::after {
  animation-duration: 0.001ms !important;
  animation-delay: 0ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  transition-delay: 0ms !important;
}
`;

// Single decorator drives both:
//  1. <html data-era> attribute + inlined era CSS variables (era-aware
//     token activation).
//  2. Storybook backgrounds global. Writing `globals.backgrounds.value`
//     lets addon-backgrounds paint the correct surface natively in BOTH
//     canvas (.sb-show-main) and docs (#anchor--{id} .docs-story) — without
//     this, the addon's `!important` styling would mask the era surface.
const withEra: Decorator = (Story, context) => {
  const [globals, updateGlobals] = useGlobals();
  const era = (context.globals.era ?? "") as "heritage" | "neon" | "";
  const desiredBg = era ? ERA_SURFACE[era] : undefined;
  const bgGlobal = globals.backgrounds as { value?: string } | null | undefined;
  const currentBg = bgGlobal?.value;

  useEffect(() => {
    const root = document.documentElement;
    if (era) {
      // applyEra sets `data-era` AND inlines the era's CSS variables so
      // stories pick up the toolbar selection regardless of stylesheet
      // load order or selector specificity.
      applyEra(root, era as EraName);
    } else {
      root.removeAttribute("data-era");
    }
  }, [era]);

  useEffect(() => {
    // Only enforce era surface while an era is active; when no era is
    // selected, leave backgrounds untouched so the user's manual toolbar
    // choice (or the addon's no-op default) governs.
    if (era && desiredBg && desiredBg !== currentBg) {
      updateGlobals({
        backgrounds: { ...(bgGlobal ?? {}), value: desiredBg },
      });
    }
  }, [era, desiredBg, currentBg, bgGlobal, updateGlobals]);

  return createElement(Story);
};

// Toolbar-driven `<html dir>` toggle. Runs independently of era/accent so
// the three globals do not contend over `<html>` attribute updates. RTL
// flips logical-property utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`,
// `start-*`, `end-*`, `text-start`, `text-end`, `border-s*`, `border-e*`,
// `rounded-s-*`, `rounded-e-*`) automatically — components migrated to
// these utilities mirror without further work.
const withDir: Decorator = (Story, context) => {
  const dir = (context.globals.dir ?? "ltr") as "ltr" | "rtl";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
  }, [dir]);

  return createElement(Story);
};

// Toolbar-driven simulation of `prefers-reduced-motion`. When motion is
// "reduce", we (1) inject the override stylesheet once per iframe and
// (2) set `<html data-motion="reduce">` so the rule cascade activates.
// When motion is "auto", we remove the attribute so OS-level
// `prefers-reduced-motion: reduce` can still take effect via the
// `motion-safe:` Tailwind variants.
const withMotion: Decorator = (Story, context) => {
  const motion = (context.globals.motion ?? "auto") as "auto" | "reduce";

  useEffect(() => {
    const root = document.documentElement;
    let styleEl = document.getElementById(MOTION_REDUCE_STYLE_ID) as
      | HTMLStyleElement
      | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = MOTION_REDUCE_STYLE_ID;
      styleEl.textContent = MOTION_REDUCE_CSS;
      document.head.appendChild(styleEl);
    }
    if (motion === "reduce") {
      root.setAttribute("data-motion", "reduce");
    } else {
      root.removeAttribute("data-motion");
    }
  }, [motion]);

  return createElement(Story);
};

const preview: Preview = {
  globalTypes: {
    era: {
      description: "Era theme (Heritage ↔ Neon)",
      toolbar: {
        title: "Era",
        icon: "globe",
        items: [
          { value: "", title: "Default (no era)" },
          { value: "heritage", title: "Heritage (과거)" },
          { value: "neon", title: "Neon (현대)" },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      description: "Reduced motion simulation",
      toolbar: {
        title: "Motion",
        icon: "lightning",
        items: [
          { value: "auto", title: "Auto (OS preference)" },
          {
            value: "reduce",
            title: "Reduce (simulate prefers-reduced-motion)",
          },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: "Text direction (ltr ↔ rtl)",
      toolbar: {
        title: "Direction",
        icon: "globe",
        items: [
          { value: "ltr", title: "LTR (left-to-right)" },
          { value: "rtl", title: "RTL (right-to-left)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    era: "",
    motion: "auto",
    dir: "ltr",
  },
  // Apply autodocs to every story by default. Per-story opt-out via
  // `tags: ['!autodocs']` remains available.
  tags: ["autodocs"],
  decorators: [withEra, withMotion, withDir],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      // No `default` here. With a default, addon-backgrounds force-paints
      // `.sb-show-main` / `.docs-story` with `!important` on every render,
      // masking the era surface. Without it, the addon stays idle until
      // the user (or `withEra`) writes to `globals.backgrounds.value`.
      values: [
        { name: "light", value: "#ffffff" },
        { name: "paper", value: "#f6efe1" },
        { name: "dark", value: "#0b0e18" },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile (360)",
          styles: { width: "360px", height: "640px" },
          type: "mobile",
        },
        mobileLarge: {
          name: "Mobile L (414)",
          styles: { width: "414px", height: "896px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet (768)",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop (1280)",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        wide: {
          name: "Wide (1920)",
          styles: { width: "1920px", height: "1080px" },
          type: "desktop",
        },
      },
    },
    a11y: {
      // Run axe on every story; surface violations in the a11y panel.
      // Rules tightened for design-system primitives where 'serious'
      // findings on color-contrast and focus-order should fail review.
      element: "#storybook-root",
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "focus-order-semantics", enabled: true },
          { id: "aria-allowed-attr", enabled: true },
          { id: "button-name", enabled: true },
          { id: "label", enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        },
      },
    },
    layout: "centered",
    options: {
      // Top-level category ordering. Sub-categories sort alphabetically.
      storySort: {
        order: [
          "Foundations",
          ["Introduction", "Colors", "Typography", "SpacingRadius", "Shadows", "Animations", "CssVariables"],
          "Components",
          ["EraSwitch", "*"],
          "Patterns",
          "Examples",
        ],
      },
    },
  },
};

export default preview;
