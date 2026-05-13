/**
 * Era-aware semantic tokens (Heritage ↔ Neon).
 *
 * Slot names are identical across eras — values differ. Components read these
 * via CSS custom properties, so runtime era switching requires zero re-render.
 */
export const era = {
  surface: {
    base: "var(--era-surface-base)",
    raised: "var(--era-surface-raised)",
    sunken: "var(--era-surface-sunken)",
    overlay: "var(--era-surface-overlay)",
  },
  material: {
    grain: "var(--era-material-grain)",
    pattern: "var(--era-material-pattern)",
    scanline: "var(--era-material-scanline)",
    inkwash: "var(--era-material-inkwash)",
    /** Paper texture — Heritage hanji grain · Neon iridescent film. */
    paper: "var(--era-material-paper)",
  },
  ink: {
    primary: "var(--era-ink-primary)",
    muted: "var(--era-ink-muted)",
    inverse: "var(--era-ink-inverse)",
  },
  edge: {
    soft: "var(--era-edge-soft)",
    hard: "var(--era-edge-hard)",
    seal: "var(--era-edge-seal)",
  },
  shadow: {
    card: "var(--era-shadow-card)",
    modal: "var(--era-shadow-modal)",
    tooltip: "var(--era-shadow-tooltip)",
    pressed: "var(--era-shadow-pressed)",
  },
  motion: {
    easeBrush: "var(--era-ease-brush)",
    easeCharge: "var(--era-ease-charge)",
    durFast: "var(--era-dur-fast)",
    durNormal: "var(--era-dur-normal)",
    durSlow: "var(--era-dur-slow)",
  },
  intent: {
    accent: "rgb(var(--accent-600))",
    success: "var(--era-intent-success)",
    warning: "var(--era-intent-warning)",
    error: "var(--era-intent-error)",
  },
  // ── Boardgame slots — pre-design tokens for Wave 5 components ────────────
  /** SealStamp (낙관/도장) — oxblood in Heritage, electric cyan in Neon. */
  seal: {
    ink: "var(--era-seal-ink)",
    paper: "var(--era-seal-paper)",
    edge: "var(--era-seal-edge)",
  },
  /** DiceRoll — face/pip/edge for rolled dice surfaces. */
  dice: {
    face: "var(--era-dice-face)",
    pip: "var(--era-dice-pip)",
    edge: "var(--era-dice-edge)",
  },
  /** ScrollReveal — gradient + cast shadow for the unrolling edge. */
  scroll: {
    edgeStart: "var(--era-scroll-edge-start)",
    edgeEnd: "var(--era-scroll-edge-end)",
    shadow: "var(--era-scroll-shadow)",
  },
  /** CardDraw — pattern reference for the obverse (back) of a flipping card. */
  card: {
    back: "var(--era-card-back)",
  },
  /** Frame — corner-cartouche ornament reference (SVG-backed). */
  frame: {
    ornament: "var(--era-frame-ornament)",
  },
} as const;

export type EraTokens = typeof era;
