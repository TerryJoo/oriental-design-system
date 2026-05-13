import { cn } from "@/utils/cn";

export type SkeletonShape = "line" | "circle" | "rect";

const SHAPE: Record<SkeletonShape, string> = {
  line: "rounded-md h-3",
  circle: "rounded-full",
  rect: "rounded-md",
};

export interface SkeletonStyleProps {
  shape?: SkeletonShape;
  className?: string;
}

export function skeletonStyles({
  shape = "line",
  className,
}: SkeletonStyleProps = {}): string {
  return cn(
    "block",
    "[background:linear-gradient(90deg,var(--era-surface-sunken),rgb(var(--accent-500)/0.12),var(--era-surface-sunken))]",
    "[background-size:200%_100%] motion-safe:animate-shimmer",
    SHAPE[shape],
    className,
  );
}

export const skeletonShapeMap = SHAPE;
