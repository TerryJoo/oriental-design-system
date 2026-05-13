import { cn } from "@/utils/cn";

export type StackDirection =
  | "row"
  | "column"
  | "row-reverse"
  | "column-reverse";
export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";
export type StackGap =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "8"
  | "10"
  | "12";

const DIRECTION: Record<StackDirection, string> = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

const ALIGN: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const JUSTIFY: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const GAP: Record<StackGap, string> = {
  "0": "gap-0",
  "1": "gap-1",
  "2": "gap-2",
  "3": "gap-3",
  "4": "gap-4",
  "5": "gap-5",
  "6": "gap-6",
  "8": "gap-8",
  "10": "gap-10",
  "12": "gap-12",
};

export interface StackStyleProps {
  direction?: StackDirection;
  align?: StackAlign;
  justify?: StackJustify;
  gap?: StackGap;
  wrap?: boolean;
  className?: string;
}

export function stackStyles({
  direction = "column",
  align = "stretch",
  justify = "start",
  gap = "3",
  wrap = false,
  className,
}: StackStyleProps = {}): string {
  return cn(
    "flex",
    DIRECTION[direction],
    ALIGN[align],
    JUSTIFY[justify],
    GAP[gap],
    wrap && "flex-wrap",
    className,
  );
}

export const stackDirectionMap = DIRECTION;
export const stackAlignMap = ALIGN;
export const stackJustifyMap = JUSTIFY;
export const stackGapMap = GAP;
