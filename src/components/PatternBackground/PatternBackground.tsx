import {
  forwardRef,
  type HTMLAttributes,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  patternBackgroundClasses,
  patternBackgroundLayerStyle,
  type PatternIntensity,
  type PatternVariant,
} from "./PatternBackground.styles";

export type {
  PatternVariant,
  PatternIntensity,
} from "./PatternBackground.styles";

export interface PatternBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  /** Which surface texture to render. `auto` follows the active era. */
  variant?: PatternVariant;
  /** Visual loudness — `subtle` (default) layers behind text; `strong` showcases. */
  intensity?: PatternIntensity;
  /** HTML element to render as. Defaults to `div`. */
  as?: ElementType;
  /** Render the pattern as a fixed full-bleed background instead of inline. */
  fixed?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * `PatternBackground` paints a non-interactive textural layer behind its
 * children. The layer is era-aware via CSS custom properties, so a single
 * `<PatternBackground variant="auto" />` swaps between woodgrain/porcelain
 * (Heritage) and circuit/scanline (Neon) automatically.
 *
 * Fixed mode positions the layer to fill the viewport so app shells can
 * place a single background near the root and let it bleed under content.
 */
export const PatternBackground = forwardRef<
  HTMLDivElement,
  PatternBackgroundProps
>(
  (
    {
      variant = "auto",
      intensity = "subtle",
      as: Component = "div",
      fixed = false,
      className,
      children,
      style,
      ...rest
    },
    ref,
  ) => {
    const layerStyle = patternBackgroundLayerStyle({ variant, intensity });
    if (fixed) {
      layerStyle.position = "fixed";
      layerStyle.zIndex = -1;
    }

    return (
      <Component
        ref={ref}
        className={cn(patternBackgroundClasses(), className)}
        style={style}
        {...rest}
      >
        <span
          aria-hidden="true"
          data-testid="pattern-layer"
          style={layerStyle}
        />
        {children}
      </Component>
    );
  },
);

PatternBackground.displayName = "PatternBackground";
