import { heritageEra } from "./heritage";
import { neonEra } from "./neon";
import type { EraName, EraTheme } from "./types";

export { heritageEra } from "./heritage";
export { neonEra } from "./neon";
export type { EraName, EraTheme } from "./types";

const registry: Record<EraName, EraTheme> = {
  heritage: heritageEra,
  neon: neonEra,
};

/**
 * Switch era on an element (typically `document.documentElement`).
 * Sets `data-era` and applies the theme's CSS variables inline.
 *
 * ```ts
 * import { applyEra } from "@jyi/design-system";
 * applyEra(document.documentElement, "heritage");
 * ```
 */
export function applyEra(element: HTMLElement, name: EraName): void {
  const theme = registry[name];
  element.dataset.era = name;
  for (const [prop, value] of Object.entries(theme.variables)) {
    element.style.setProperty(prop, value);
  }
}
