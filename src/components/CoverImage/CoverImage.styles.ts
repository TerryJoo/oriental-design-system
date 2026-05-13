import { cn } from "@/utils/cn";

export type CoverImageRatio = "16/9" | "4/3" | "1/1" | "21/9";

const ASPECT: Record<CoverImageRatio, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
};

export interface CoverImageStyleProps {
  ratio?: CoverImageRatio;
  className?: string;
}

export function coverImageWrap({
  ratio = "16/9",
  className,
}: CoverImageStyleProps = {}): string {
  return cn(
    "relative w-full overflow-hidden rounded-card",
    "border-era bg-era-sunken",
    ASPECT[ratio],
    className,
  );
}

export const coverImageOverlay =
  "absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.65))] pointer-events-none";

export const coverImageLabel = cn(
  "absolute left-3 bottom-3 z-10 text-white",
  "font-era-display tracking-era-display case-era font-bold text-sm",
);

export const coverImagePattern = cn(
  "absolute inset-0 pointer-events-none opacity-50",
  "bg-era-pattern bg-[length:80px_80px]",
);

export const coverImageRatioMap = ASPECT;
