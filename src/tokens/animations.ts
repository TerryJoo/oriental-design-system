/**
 * Oriental Design System Animation Tokens
 * Subtle base animations + era-aware motion presets (ink brush, neon breath).
 */
export const animations = {
  keyframes: {
    fadeIn: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    fadeOut: {
      "0%": { opacity: "1" },
      "100%": { opacity: "0" },
    },
    slideUp: {
      "0%": { opacity: "0", transform: "translateY(8px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    slideDown: {
      "0%": { opacity: "0", transform: "translateY(-8px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    slideLeft: {
      "0%": { opacity: "0", transform: "translateX(8px)" },
      "100%": { opacity: "1", transform: "translateX(0)" },
    },
    slideRight: {
      "0%": { opacity: "0", transform: "translateX(-8px)" },
      "100%": { opacity: "1", transform: "translateX(0)" },
    },
    scaleIn: {
      "0%": { opacity: "0", transform: "scale(0.95)" },
      "100%": { opacity: "1", transform: "scale(1)" },
    },
    scaleOut: {
      "0%": { opacity: "1", transform: "scale(1)" },
      "100%": { opacity: "0", transform: "scale(0.95)" },
    },
    pulseSubtle: {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.7" },
    },
    shimmer: {
      "0%": { backgroundPosition: "-200% 0" },
      "100%": { backgroundPosition: "200% 0" },
    },
    dotPulse: {
      "0%, 20%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
      "10%": { opacity: "1", transform: "scale(1)" },
    },
    /** Heritage — ink spreads from blurred to sharp */
    heritageInkSpread: {
      "0%": { opacity: "0", filter: "blur(6px)" },
      "100%": { opacity: "1", filter: "blur(0)" },
    },
    /** Heritage — seal stamp impact */
    heritageSeal: {
      "0%": { opacity: "0", transform: "scale(1.35) rotate(-4deg)" },
      "60%": { opacity: "1", transform: "scale(0.95) rotate(0deg)" },
      "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
    },
    /** Neon — breathing glow */
    neonBreath: {
      "0%, 100%": { boxShadow: "var(--era-shadow-card)" },
      "50%": {
        boxShadow: "var(--era-shadow-card), 0 0 20px rgba(90, 80, 255, 0.55)",
      },
    },
    /** Neon — scanline sweep */
    neonScan: {
      "0%": { transform: "translateY(-100%)" },
      "100%": { transform: "translateY(100%)" },
    },
  },

  animation: {
    "fade-in": "fadeIn 200ms ease-out",
    "fade-out": "fadeOut 200ms ease-out",
    "slide-up": "slideUp 300ms ease-out",
    "slide-down": "slideDown 300ms ease-out",
    "slide-left": "slideLeft 300ms ease-out",
    "slide-right": "slideRight 300ms ease-out",
    "scale-in": "scaleIn 200ms ease-out",
    "scale-out": "scaleOut 200ms ease-out",
    "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
    shimmer: "shimmer 2s ease-in-out infinite",
    "spin-slow": "spin 1.5s linear infinite",
    "spin-fast": "spin 0.5s linear infinite",
    "dot-pulse": "dotPulse 1.4s ease-in-out infinite",
    "dot-pulse-slow": "dotPulse 2s ease-in-out infinite",
    "dot-pulse-fast": "dotPulse 0.8s ease-in-out infinite",
    "ink-spread": "heritageInkSpread 640ms cubic-bezier(0.22, 0.61, 0.36, 1)",
    "heritage-seal": "heritageSeal 420ms cubic-bezier(0.22, 0.61, 0.36, 1)",
    "neon-breath": "neonBreath 2.4s ease-in-out infinite",
    "neon-scan": "neonScan 2.4s linear infinite",
  },

  transitionDuration: {
    "0": "0ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  transitionTimingFunction: {
    DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    brush: "cubic-bezier(0.22, 0.61, 0.36, 1)",
    charge: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};
