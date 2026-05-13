/**
 * Oriental Design System Shadow Tokens
 * Base elevation + era-ready shadow references (`era-*` utilities read the CSS variables).
 */
export const shadows = {
  none: "none",
  sm: "0 0px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 0px 6px 0px rgba(0, 0, 0, 0.1), 0 0px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 0px 15px -2px rgba(0, 0, 0, 0.1), 0 0px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 0px 25px -4px rgba(0, 0, 0, 0.1), 0 0px 10px -6px rgba(0, 0, 0, 0.1)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  focus: "0 0 0 3px rgba(138, 80, 48, 0.2)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
  dropdown: "0 0 14px 0 rgba(0, 0, 0, 0.1)",
  elevated:
    "0 4px 12px -2px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)",
  "elevated-lg":
    "0 12px 28px -4px rgba(0, 0, 0, 0.14), 0 4px 10px -2px rgba(0, 0, 0, 0.08)",
  /** Era-aware shadow slots (resolved to CSS custom properties at runtime) */
  "era-card": "var(--era-shadow-card)",
  "era-modal": "var(--era-shadow-modal)",
  "era-tooltip": "var(--era-shadow-tooltip)",
  "era-pressed": "var(--era-shadow-pressed)",
};
