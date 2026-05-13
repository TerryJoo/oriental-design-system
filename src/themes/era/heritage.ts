import type { EraTheme } from "./types";

/**
 * Heritage Era (과거) — hanji, wood grain, celadon, ink brush.
 */
export const heritageEra: EraTheme = {
  name: "heritage",
  variables: {
    // Accent — 적토(terracotta) / 구운 도자기
    "--accent-50": "252 245 236",
    "--accent-100": "243 224 199",
    "--accent-200": "230 196 158",
    "--accent-300": "211 164 122",
    "--accent-400": "192 133 92",
    "--accent-500": "167 106 68",
    "--accent-600": "138 80 48",
    "--accent-700": "108 61 36",
    "--accent-800": "78 43 25",
    "--accent-900": "54 30 17",
    "--accent-950": "31 17 10",

    // Era-aware emphasized accent for text on the era surface.
    // Heritage paints accent-700 (terracotta) on hanji — 7.6:1, AAA.
    "--era-accent-strong": "108 61 36",

    // Surface — 한지 / 목판
    "--era-surface-base": "#f6efe1",
    "--era-surface-raised": "#fbf5e8",
    "--era-surface-sunken": "#e7dcc4",
    "--era-surface-overlay": "rgba(44, 30, 17, 0.55)",

    // Material
    "--era-material-grain": "var(--pattern-woodgrain)",
    "--era-material-pattern": "var(--pattern-porcelain)",
    "--era-material-scanline": "none",
    "--era-material-inkwash": "var(--mask-inkwash)",
    "--era-material-paper": "var(--pattern-paper)",

    // Ink
    "--era-ink-primary": "#2b1d10",
    "--era-ink-muted": "#6e5a3f",
    "--era-ink-inverse": "#fbf5e8",

    // Edge — 먹선 (color-only AND full border-shorthand)
    "--era-edge-color-soft": "rgba(43, 29, 16, 0.22)",
    "--era-edge-color-hard": "rgba(43, 29, 16, 0.6)",
    "--era-edge-color-seal": "#7a2d1a",
    "--era-edge-soft": "1px solid rgba(43, 29, 16, 0.22)",
    "--era-edge-hard": "1.5px solid rgba(43, 29, 16, 0.6)",
    "--era-edge-seal": "2px solid #7a2d1a",

    // Shadow — 종이 두께
    "--era-shadow-card":
      "0 1px 0 rgba(78, 56, 30, 0.12), 0 6px 18px -10px rgba(60, 40, 20, 0.35)",
    "--era-shadow-modal": "0 12px 40px -12px rgba(60, 40, 20, 0.45)",
    "--era-shadow-tooltip": "0 2px 10px -2px rgba(60, 40, 20, 0.3)",
    "--era-shadow-pressed": "inset 0 2px 6px rgba(60, 40, 20, 0.25)",

    // Motion — 붓 느낌 (느리고 부드럽게)
    "--era-ease-brush": "cubic-bezier(0.22, 0.61, 0.36, 1)",
    "--era-ease-charge": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--era-dur-fast": "220ms",
    "--era-dur-normal": "380ms",
    "--era-dur-slow": "640ms",

    // Intent
    "--era-intent-success": "#4f7a3c",
    "--era-intent-warning": "#c88d2b",
    "--era-intent-error": "#a3341f",

    // Boardgame — SealStamp / DiceRoll / ScrollReveal / CardDraw / Frame
    "--era-seal-ink": "#7a1c14",
    "--era-seal-paper": "#fbf5e8",
    "--era-seal-edge": "#5c140e",
    "--era-dice-face": "#f3e7c8",
    "--era-dice-pip": "#7a1c14",
    "--era-dice-edge": "rgba(60, 40, 20, 0.45)",
    "--era-scroll-edge-start": "#f6efe1",
    "--era-scroll-edge-end": "rgba(246, 239, 225, 0)",
    "--era-scroll-shadow": "0 8px 22px -10px rgba(60, 40, 20, 0.5)",
    "--era-card-back": "var(--pattern-card-back)",
    "--era-frame-ornament": "var(--pattern-frame-ornament)",

    // Fonts
    "--font-display":
      '"Gowun Batang", "Cormorant Garamond", "AppleMyungjo", "Hoefler Text", Didot, "Apple SD Gothic Neo", "Malgun Gothic", serif',
    "--font-body":
      '"Noto Serif KR", "Gowun Batang", "AppleMyungjo", "Hoefler Text", Georgia, "Apple SD Gothic Neo", serif',
    "--font-accent":
      '"Cormorant Garamond", "Hoefler Text", Didot, "Times New Roman", serif',
    "--display-letter-spacing": "-0.01em",
    "--body-letter-spacing": "0em",
    "--body-line-height": "1.7",
    "--ui-text-transform": "none",
  },
};
