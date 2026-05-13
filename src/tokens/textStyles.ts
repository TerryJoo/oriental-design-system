/**
 * Oriental Design System Semantic Text Style Presets
 */
export interface TextStylePreset {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
}

export const textStyles = {
  display: {
    lg: {
      fontSize: "2.75rem",
      lineHeight: "3.625rem",
      letterSpacing: "-0.02em",
    },
    md: {
      fontSize: "2.25rem",
      lineHeight: "2.75rem",
      letterSpacing: "-0.02em",
    },
  } satisfies Record<string, TextStylePreset>,

  heading: {
    h1: {
      fontSize: "1.875rem",
      lineHeight: "2.5rem",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "1.75rem",
      lineHeight: "2.25rem",
      letterSpacing: "-0.02em",
    },
    h3: {
      fontSize: "1.625rem",
      lineHeight: "2rem",
      letterSpacing: "-0.02em",
    },
    h4: {
      fontSize: "1.375rem",
      lineHeight: "1.875rem",
      letterSpacing: "-0.02em",
    },
  } satisfies Record<string, TextStylePreset>,

  body1: {
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    letterSpacing: "-0.02em",
  } satisfies TextStylePreset,

  body2: {
    fontSize: "1rem",
    lineHeight: "1.625rem",
    letterSpacing: "-0.02em",
  } satisfies TextStylePreset,

  body3: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    letterSpacing: "-0.02em",
  } satisfies TextStylePreset,

  label: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    letterSpacing: "-0.02em",
  } satisfies TextStylePreset,

  caption: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    letterSpacing: "-0.02em",
  } satisfies TextStylePreset,

  overline: {
    fontSize: "0.75rem",
    lineHeight: "1rem",
    letterSpacing: "0.05em",
  } satisfies TextStylePreset,
};
