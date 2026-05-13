import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { tagLabel, tagRemove, tagStyles, type TagSize } from "./Tag.styles";

export type { TagSize } from "./Tag.styles";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  size?: TagSize;
  /** When provided, renders an × button that calls back. */
  onRemove?: () => void;
  removeLabel?: string;
  children?: ReactNode;
  className?: string;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      size = "md",
      onRemove,
      removeLabel = "제거",
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <span ref={ref} className={tagStyles({ size, className })} {...rest}>
      <span className={tagLabel}>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className={tagRemove}
        >
          ×
        </button>
      )}
    </span>
  ),
);

Tag.displayName = "Tag";
