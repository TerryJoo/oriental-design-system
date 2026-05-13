/**
 * Oriental Design System Color Tokens
 *
 * Traditional palette rooted in 오방색 (Obangsaek — five cardinal colors):
 *   - 청 (Blue/Green) → celadon, indigo
 *   - 황 (Yellow) → gold
 *   - 백 (White) → paper
 *   - 흑 (Black) → ink
 *   - 적 (Red) → coral, terracotta
 *
 * The `accent` palette is CSS-variable driven and swapped by the era/theme system.
 */
export const colors = {
  // Primary — Terracotta (적토 / 구운 도자기)
  primary: {
    "50": "#FCF5EC",
    "100": "#F3E0C7",
    "200": "#E6C49E",
    "300": "#D3A47A",
    "400": "#C0855C",
    "500": "#A76A44",
    "600": "#8A5030", // main
    "700": "#6C3D24",
    "800": "#4E2B19",
    "900": "#361E11",
    "950": "#1F110A",
  },

  // Secondary — Celadon (翡色 / 고려청자)
  secondary: {
    "50": "#F1F6F4",
    "100": "#D9E7E2",
    "200": "#B6D0C7",
    "300": "#8FB8AA",
    "400": "#6A9F8E",
    "500": "#4E8877",
    "600": "#3D6F61",
    "700": "#2F564C",
    "800": "#233E38",
    "900": "#192A27",
    "950": "#0D1716",
  },

  // Gray scale — Ink-tinged neutrals
  gray: {
    "50": "#F8F7F4",
    "100": "#EEECE5",
    "200": "#DDD9CE",
    "300": "#C5C0B2",
    "400": "#A39D8F",
    "500": "#7F7A6D",
    "600": "#605C52",
    "700": "#48453E",
    "800": "#2F2D28",
    "900": "#1C1A16",
    "950": "#0E0D0A",
  },

  // Indigo (靑) — traditional hanbok & celadon blue
  indigo: {
    "50": "#EEF3F8",
    "100": "#D4DFEB",
    "200": "#A9BFD7",
    "300": "#7D9FC3",
    "400": "#537FAD",
    "500": "#355F8C",
    "600": "#2B4A6F", // main
    "700": "#213955",
    "800": "#18293E",
    "900": "#101C2B",
    "950": "#090F18",
  },

  // Gold (黃金) — sunlit ochre
  gold: {
    "50": "#FDF7E8",
    "100": "#FAEAC1",
    "200": "#F3D48A",
    "300": "#E9BB5C",
    "400": "#D4A968", // preview ref
    "500": "#B8894A", // main
    "600": "#946D38",
    "700": "#72542B",
    "800": "#513B1F",
    "900": "#362713",
    "950": "#1C1409",
  },

  // Jade (翠) — verdant green
  jade: {
    "50": "#F0F5F2",
    "100": "#DAE7DF",
    "200": "#B7D0C0",
    "300": "#93B89F",
    "400": "#6D9E7E",
    "500": "#4F7E60",
    "600": "#3D6A4D",
    "700": "#2F513B",
    "800": "#22392A",
    "900": "#17271C",
    "950": "#0C1610",
  },

  // Coral (朱) — accent red for highlights (use sparingly)
  coral: {
    "50": "#FDF1ED",
    "100": "#FADBD0",
    "200": "#F3B8A1",
    "300": "#E89075",
    "400": "#C9694F",
    "500": "#A85342", // main
    "600": "#883E32",
    "700": "#682D24",
    "800": "#4A1F18",
    "900": "#30140F",
    "950": "#180906",
  },

  // Oxblood (낙관 / 도장 인주) — Heritage seal ink, traditional Korean stamp.
  // Warm red-brown tuned to read on parchment. 700 anchor used for SealStamp ink.
  // Anchor (rgb): 50 #FBEEEA · 600 rgb(140,40,30) · 700 rgb(122,28,20) · 950 rgb(36,8,5)
  oxblood: {
    "50": "#FBEEEA",
    "100": "#F4D3CA",
    "200": "#E5A99B",
    "300": "#D17E6C",
    "400": "#B85544",
    "500": "#9E3A2A",
    "600": "#8C1E1E", // main — seal ink
    "700": "#7A1C14",
    "800": "#5C140E",
    "900": "#3D0E09",
    "950": "#240805",
  },

  // Cyan-Seal (전자 인주) — Neon-era seal mark (electric cyan).
  // Reads on dark glass surfaces. 500 anchor used for SealStamp ink in Neon.
  // Anchor (rgb): 50 #E5FBFF · 500 rgb(0,220,255) · 600 rgb(0,196,232)
  "cyan-seal": {
    "50": "#E5FBFF",
    "100": "#C2F5FF",
    "200": "#8BEAFF",
    "300": "#58F7FF", // matches existing --era-edge-color-seal (Neon)
    "400": "#22DEFF",
    "500": "#00DCFF", // main — seal ink
    "600": "#00C4E8",
    "700": "#0099B8",
    "800": "#076E84",
    "900": "#08495A",
    "950": "#03242E",
  },

  // Base colors
  white: "#FFFFFF",
  black: "#000000",

  // Semantic colors — era-neutral anchors
  success: {
    "50": "#F1F7EE",
    "100": "#DBEBD2",
    "200": "#B6D5A4",
    "300": "#8FBC77",
    "400": "#6BA255",
    "500": "#4F8A3D",
    "600": "#3E7030",
    "700": "#305625",
    "800": "#223E1B",
    "900": "#172B13",
    "950": "#0B160A",
  },

  warning: {
    "50": "#FEF8E8",
    "100": "#FBEAC0",
    "200": "#F6D48A",
    "300": "#EFBA55",
    "400": "#E5A02F",
    "500": "#C88D2B",
    "600": "#A37022",
    "700": "#7D561A",
    "800": "#593D12",
    "900": "#3B280C",
    "950": "#1E1406",
  },

  error: {
    "50": "#FDF1F0",
    "100": "#FAD7D2",
    "200": "#F5ADA4",
    "300": "#EC8378",
    "400": "#D35F55",
    "500": "#A3341F",
    "600": "#862A19",
    "700": "#672014",
    "800": "#49170E",
    "900": "#2F0F08",
    "950": "#180704",
  },

  info: {
    "50": "#EEF3F8",
    "100": "#D4DFEB",
    "200": "#A9BFD7",
    "300": "#7D9FC3",
    "400": "#537FAD",
    "500": "#355F8C",
    "600": "#2B4A6F",
    "700": "#213955",
    "800": "#18293E",
    "900": "#101C2B",
    "950": "#090F18",
  },

  // Background colors
  background: {
    default: "#FFFFFF",
    card: "#FFFFFF",
    muted: "#F8F7F4",
    overlay: "rgba(28, 26, 22, 0.55)",
  },

  // Text colors
  text: {
    primary: "#1C1A16",
    secondary: "#605C52",
    muted: "#A39D8F",
    inverse: "#FBF5E8",
  },

  // Accent — CSS custom property based (era/theme swappable)
  accent: {
    50: "rgb(var(--accent-50) / <alpha-value>)",
    100: "rgb(var(--accent-100) / <alpha-value>)",
    200: "rgb(var(--accent-200) / <alpha-value>)",
    300: "rgb(var(--accent-300) / <alpha-value>)",
    400: "rgb(var(--accent-400) / <alpha-value>)",
    500: "rgb(var(--accent-500) / <alpha-value>)",
    600: "rgb(var(--accent-600) / <alpha-value>)",
    700: "rgb(var(--accent-700) / <alpha-value>)",
    800: "rgb(var(--accent-800) / <alpha-value>)",
    900: "rgb(var(--accent-900) / <alpha-value>)",
    950: "rgb(var(--accent-950) / <alpha-value>)",
  },

  // Border
  border: {
    default: "#DDD9CE",
    focus: "rgb(var(--accent-600))",
  },

  // Surface
  surface: {
    default: "#FFFFFF",
    raised: "#FFFFFF",
    sunken: "#EEECE5",
    overlay: "rgba(28, 26, 22, 0.55)",
  },

  // Interactive
  interactive: {
    default: "rgb(var(--accent-600))",
    hover: "rgb(var(--accent-700))",
    pressed: "rgb(var(--accent-800))",
    disabled: "#C5C0B2",
  },

  // Link
  link: {
    default: "#2B4A6F",
    hover: "#213955",
    visited: "#683E74",
  },

  // Destructive
  destructive: {
    default: "#A3341F",
    hover: "#862A19",
    pressed: "#672014",
    text: "#672014",
    bg: "#FAD7D2",
  },

  // Focus
  focus: {
    ring: "rgb(var(--accent-600) / 0.25)",
    outline: "rgb(var(--accent-600))",
  },
};
