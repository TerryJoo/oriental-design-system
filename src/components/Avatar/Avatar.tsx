import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { avatarStyles, type AvatarSize } from "./Avatar.styles";

export type { AvatarSize } from "./Avatar.styles";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  /** When provided, renders an image. Falls back to children/initials on error. */
  src?: string;
  alt?: string;
  /** Initials or fallback content. */
  children?: ReactNode;
  className?: string;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ size = "md", src, alt, className, children, ...rest }, ref) => (
    <span
      ref={ref}
      role="img"
      aria-label={alt}
      className={avatarStyles({ size, className })}
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        children
      )}
    </span>
  ),
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      className={["inline-flex -space-x-2", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  ),
);

AvatarGroup.displayName = "AvatarGroup";
