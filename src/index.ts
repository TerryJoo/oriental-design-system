// Full bundle — components + utilities + tokens + themes
export * from "./components";

// Utilities
export { cn } from "./utils/cn";
export { Portal, type PortalProps } from "./utils/Portal";
export { useDir, type Dir } from "./utils/useDir";

// Design tokens
export { colors } from "./tokens/colors";
export { typography } from "./tokens/typography";
export { borderRadius } from "./tokens/spacing";
export { animations } from "./tokens/animations";
export { shadows } from "./tokens/shadows";
export { gradients } from "./tokens/gradients";
export { zIndex } from "./tokens/zIndex";
export {
  textStyles as textStylePresets,
  type TextStylePreset,
} from "./tokens/textStyles";
export { era, type EraTokens } from "./tokens/era";

// Themes
export {
  heritageEra,
  neonEra,
  applyEra,
  type EraName,
  type EraTheme,
} from "./themes";
