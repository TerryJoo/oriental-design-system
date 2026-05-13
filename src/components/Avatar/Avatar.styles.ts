import { cn } from "@/utils/cn";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

export const avatarSizes: Record<AvatarSize, string> = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-lg",
};

export interface AvatarStyleProps {
  size?: AvatarSize;
  className?: string;
}

export function avatarStyles({
  size = "md",
  className,
}: AvatarStyleProps = {}): string {
  return cn(
    "inline-grid place-items-center rounded-full overflow-hidden shrink-0",
    "bg-era-sunken border-era-strong text-[rgb(var(--era-accent-strong))] font-era-display font-bold",
    avatarSizes[size],
    className,
  );
}

export const avatarGroup = "inline-flex -space-x-2";
