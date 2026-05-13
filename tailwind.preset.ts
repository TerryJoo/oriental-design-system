/**
 * Oriental Design System — Tailwind CSS Preset
 *
 * Use in your tailwind.config.js:
 *   module.exports = {
 *     presets: [require('@jyi/design-system/tailwind-preset')],
 *     content: [...your paths],
 *   };
 *
 * All values are sourced from src/tokens/* — do NOT duplicate here.
 */
import { colors } from "./src/tokens/colors";
import { typography } from "./src/tokens/typography";
import { borderRadius } from "./src/tokens/spacing";
import { animations } from "./src/tokens/animations";
import { shadows } from "./src/tokens/shadows";
import { zIndex } from "./src/tokens/zIndex";
import { gradients } from "./src/tokens/gradients";

function withDefault<T extends Record<string, unknown>>(
  obj: T,
): Omit<T, "default"> & { DEFAULT?: string } {
  if (!("default" in obj))
    return obj as Omit<T, "default"> & { DEFAULT?: string };
  const { default: defaultVal, ...rest } = obj;
  return { ...rest, DEFAULT: defaultVal } as Omit<T, "default"> & {
    DEFAULT?: string;
  };
}

const config = {
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        gray: colors.gray,
        indigo: colors.indigo,
        gold: colors.gold,
        jade: colors.jade,
        coral: colors.coral,
        // Boardgame — supplementary palettes for SealStamp ink (and any
        // explicit non-era-aware oxblood/cyan-seal usage). Era-aware code
        // should prefer the `era-seal-*` semantic utilities below.
        oxblood: colors.oxblood,
        "cyan-seal": colors["cyan-seal"],
        accent: colors.accent,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        surface: withDefault(colors.surface),
        interactive: withDefault(colors.interactive),
        link: withDefault(colors.link),
        destructive: withDefault(colors.destructive),
        // Era-aware text colors
        "era-primary": "var(--era-ink-primary)",
        "era-muted": "var(--era-ink-muted)",
        "era-inverse": "var(--era-ink-inverse)",
        // Era-aware seal accent (도장/낙관 stroke; cyan in Neon, oxblood in Heritage)
        "era-seal": "var(--era-edge-color-seal)",
        // Era-aware boardgame slots
        "era-seal-ink": "var(--era-seal-ink)",
        "era-seal-paper": "var(--era-seal-paper)",
        "era-seal-edge": "var(--era-seal-edge)",
        "era-dice-face": "var(--era-dice-face)",
        "era-dice-pip": "var(--era-dice-pip)",
        "era-dice-edge": "var(--era-dice-edge)",
        "era-scroll-edge-start": "var(--era-scroll-edge-start)",
        "era-scroll-edge-end": "var(--era-scroll-edge-end)",
      },

      backgroundColor: {
        "era-base": "var(--era-surface-base)",
        "era-raised": "var(--era-surface-raised)",
        "era-sunken": "var(--era-surface-sunken)",
        "era-overlay": "var(--era-surface-overlay)",
      },

      backgroundImage: {
        ...gradients,
        "era-grain": "var(--era-material-grain)",
        "era-pattern": "var(--era-material-pattern)",
        "era-scanline": "var(--era-material-scanline)",
        "era-inkwash": "var(--era-material-inkwash)",
        // Boardgame surfaces (paper texture · card back · frame ornament)
        "era-paper": "var(--era-material-paper)",
        "era-card-back": "var(--era-card-back)",
        "era-frame-ornament": "var(--era-frame-ornament)",
      },

      fontFamily: {
        sans: typography.fontFamily.sans,
        serif: typography.fontFamily.serif,
        mono: typography.fontFamily.mono,
        "heritage-display": typography.fontFamilies.heritageDisplay,
        "heritage-body": typography.fontFamilies.heritageBody,
        "heritage-latin": typography.fontFamilies.heritageLatin,
        "neon-display": typography.fontFamilies.neonDisplay,
        "neon-body": typography.fontFamilies.neonBody,
        // Era-aware (reads CSS vars)
        "era-display": "var(--font-display)",
        "era-body": "var(--font-body)",
        "era-accent": "var(--font-accent)",
      },

      fontSize: {
        "display-lg": typography.fontSize["display-lg"],
        "display-md": typography.fontSize["display-md"],
        "heading-1": typography.fontSize["heading-1"],
        "heading-2": typography.fontSize["heading-2"],
        "heading-3": typography.fontSize["heading-3"],
        "heading-4": typography.fontSize["heading-4"],
        "body-1": typography.fontSize["body-1"],
        "body-2": typography.fontSize["body-2"],
        "body-3": typography.fontSize["body-3"],
        label: typography.fontSize["label"],
      },

      letterSpacing: {
        tighter: typography.letterSpacing.tighter,
        tight: typography.letterSpacing.tight,
        normal: typography.letterSpacing.normal,
        wide: typography.letterSpacing.wide,
        wider: typography.letterSpacing.wider,
        widest: typography.letterSpacing.widest,
        // Era-aware: −0.01em in Heritage, +0.08em in Neon
        "era-display": "var(--display-letter-spacing)",
        // Body tracking — 0em in Heritage, +0.01em in Neon
        "era-body": "var(--body-letter-spacing)",
      },

      borderRadius: {
        card: borderRadius.card,
        button: borderRadius.button,
        pill: borderRadius.pill,
        input: borderRadius.input,
        "chat-bubble": borderRadius["chat-bubble"],
        seal: borderRadius.seal,
      },

      borderColor: {
        // Era-aware via CSS variables.
        // Heritage: rgba(43,29,16,0.22) / 0.6 / #7a2d1a
        // Neon:     rgba(120,150,255,0.3) / 0.7 / #58f7ff
        "era-soft": "var(--era-edge-color-soft)",
        "era-hard": "var(--era-edge-color-hard)",
        "era-seal": "var(--era-edge-color-seal)",
      },

      keyframes: animations.keyframes,
      animation: animations.animation,

      transitionDuration: {
        fast: animations.transitionDuration.fast,
        normal: animations.transitionDuration.normal,
        slow: animations.transitionDuration.slow,
        slower: animations.transitionDuration.slower,
        "era-fast": "var(--era-dur-fast)",
        era: "var(--era-dur-normal)",
        "era-slow": "var(--era-dur-slow)",
      },

      transitionTimingFunction: {
        ...animations.transitionTimingFunction,
        "era-brush": "var(--era-ease-brush)",
        "era-charge": "var(--era-ease-charge)",
      },

      boxShadow: {
        ...shadows,
        // Era-aware shadows — paper depth in Heritage, neon glow in Neon.
        "era-card": "var(--era-shadow-card)",
        "era-modal": "var(--era-shadow-modal)",
        "era-tooltip": "var(--era-shadow-tooltip)",
        "era-pressed": "var(--era-shadow-pressed)",
        // Boardgame — ScrollReveal cast shadow + SealStamp impression ring.
        "era-scroll": "var(--era-scroll-shadow)",
        "era-seal-stamp": "0 0 0 2px var(--era-seal-edge)",
      },

      zIndex: {
        hide: String(zIndex.hide),
        docked: String(zIndex.docked),
        dropdown: String(zIndex.dropdown),
        sticky: String(zIndex.sticky),
        fixed: String(zIndex.fixed),
        "modal-backdrop": String(zIndex.modalBackdrop),
        modal: String(zIndex.modal),
        popover: String(zIndex.popover),
        tooltip: String(zIndex.tooltip),
        toast: String(zIndex.toast),
      },
    },
  },
};

export default config;
