import type { EraTheme } from "./types";

/**
 * Neon Era (현대) — glassmorphism, circuit patterns, electric indigo.
 */
export const neonEra: EraTheme = {
  name: "neon",
  variables: {
    // Accent — 전자 청람
    "--accent-50": "240 246 255",
    "--accent-100": "214 230 255",
    "--accent-200": "175 208 255",
    "--accent-300": "125 178 255",
    "--accent-400": "88 143 255",
    "--accent-500": "70 114 255",
    "--accent-600": "90 80 255",
    "--accent-700": "68 60 220",
    "--accent-800": "48 40 170",
    "--accent-900": "28 22 110",
    "--accent-950": "14 12 56",

    // Era-aware emphasized accent for text on the era surface. Neon falls
    // back to accent-300 (#7db2ff) — 8.96:1 on the void surface — because
    // accent-700 only clears 2.7:1 there.
    "--era-accent-strong": "125 178 255",

    // Surface — 글래스 / 흑요석
    "--era-surface-base": "#0b0e18",
    "--era-surface-raised": "rgba(255, 255, 255, 0.06)",
    "--era-surface-sunken": "#06070d",
    "--era-surface-overlay": "rgba(4, 8, 22, 0.6)",

    // Material
    "--era-material-grain": "none",
    "--era-material-pattern": "var(--pattern-circuit)",
    "--era-material-scanline": "var(--pattern-scanline)",
    "--era-material-inkwash": "none",
    "--era-material-paper": "var(--pattern-paper)",

    // Ink
    "--era-ink-primary": "#e8ecff",
    "--era-ink-muted": "rgba(232, 236, 255, 0.55)",
    "--era-ink-inverse": "#0b0e18",

    // Edge — 네온 라인 (color-only AND full border-shorthand)
    "--era-edge-color-soft": "rgba(120, 150, 255, 0.3)",
    "--era-edge-color-hard": "rgba(120, 150, 255, 0.7)",
    "--era-edge-color-seal": "#58f7ff",
    "--era-edge-soft": "1px solid rgba(120, 150, 255, 0.3)",
    "--era-edge-hard": "1.5px solid rgba(120, 150, 255, 0.7)",
    "--era-edge-seal": "2px solid #58f7ff",

    // Shadow — 네온 글로우
    "--era-shadow-card":
      "0 0 0 1px rgba(120, 150, 255, 0.25), 0 10px 30px -12px rgba(90, 80, 255, 0.5)",
    "--era-shadow-modal":
      "0 0 0 1px rgba(120, 150, 255, 0.3), 0 30px 80px -20px rgba(90, 80, 255, 0.6)",
    "--era-shadow-tooltip": "0 0 14px rgba(120, 150, 255, 0.45)",
    "--era-shadow-pressed": "inset 0 0 14px rgba(90, 80, 255, 0.4)",

    // Motion — 스냅
    "--era-ease-brush": "cubic-bezier(0.2, 0, 0, 1)",
    "--era-ease-charge": "cubic-bezier(0.5, 0, 0.1, 1)",
    "--era-dur-fast": "120ms",
    "--era-dur-normal": "220ms",
    "--era-dur-slow": "360ms",

    // Intent
    "--era-intent-success": "#32e0a1",
    "--era-intent-warning": "#ffc044",
    "--era-intent-error": "#ff5268",

    // Boardgame — SealStamp / DiceRoll / ScrollReveal / CardDraw / Frame
    "--era-seal-ink": "#00dcff",
    "--era-seal-paper": "rgba(11, 14, 24, 0.85)",
    "--era-seal-edge": "#58f7ff",
    "--era-dice-face": "#161a26",
    "--era-dice-pip": "#58f7ff",
    "--era-dice-edge": "rgba(120, 150, 255, 0.55)",
    "--era-scroll-edge-start": "#06070d",
    "--era-scroll-edge-end": "rgba(6, 7, 13, 0)",
    "--era-scroll-shadow": "0 0 22px rgba(88, 247, 255, 0.45)",
    "--era-card-back": "var(--pattern-card-back)",
    "--era-frame-ornament": "var(--pattern-frame-ornament)",

    // Fonts
    "--font-display":
      'Orbitron, "Avenir Next Condensed", Futura, "Helvetica Neue", "Arial Narrow", "Apple SD Gothic Neo", Pretendard, sans-serif',
    "--font-body":
      '"IBM Plex Sans KR", Pretendard, "Apple SD Gothic Neo", "Helvetica Neue", Inter, "SF Pro Text", sans-serif',
    "--font-accent":
      'Orbitron, "Avenir Next Condensed", Futura, "Helvetica Neue", sans-serif',
    "--display-letter-spacing": "0.08em",
    "--body-letter-spacing": "0.01em",
    "--body-line-height": "1.55",
    "--ui-text-transform": "uppercase",
  },
};
