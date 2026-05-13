import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  coverImageLabel,
  coverImageOverlay,
  coverImagePattern,
  coverImageWrap,
  type CoverImageRatio,
} from "./CoverImage.styles";

export type { CoverImageRatio } from "./CoverImage.styles";

export interface CoverImageProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: CoverImageRatio;
  /** Optional image source. When omitted the era pattern fills the area. */
  src?: string;
  alt?: string;
  /** Foreground label rendered over a darkening gradient. */
  label?: ReactNode;
  /** Hide the era pattern overlay. */
  noPattern?: boolean;
  className?: string;
}

export const CoverImage = forwardRef<HTMLDivElement, CoverImageProps>(
  (
    { ratio = "16/9", src, alt = "", label, noPattern, className, ...rest },
    ref,
  ) => (
    <div ref={ref} className={coverImageWrap({ ratio, className })} {...rest}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        !noPattern && <div aria-hidden="true" className={coverImagePattern} />
      )}
      {label && (
        <>
          <div aria-hidden="true" className={coverImageOverlay} />
          <span className={coverImageLabel}>{label}</span>
        </>
      )}
    </div>
  ),
);

CoverImage.displayName = "CoverImage";
