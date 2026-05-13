import { cn } from "@/utils/cn";

export const breadcrumbNav = "flex items-center gap-1.5 text-sm flex-wrap";
// Wave 5b2-C3: each crumb caps at 12rem and clamps to a single line.
// `truncate` resolves to `overflow-hidden text-ellipsis whitespace-nowrap`,
// which is well-defined on inline-block / inline-flex anchors and
// spans — exactly what each crumb renders as.
const breadcrumbItemBase = "inline-block max-w-[12rem] truncate align-bottom";
export const breadcrumbLink = cn(
  breadcrumbItemBase,
  "text-era-muted hover:text-[rgb(var(--accent-700))]",
  "transition-colors duration-era ease-era-brush",
);
export const breadcrumbCurrent = cn(
  breadcrumbItemBase,
  "text-era-primary font-semibold",
);
// `[[dir=rtl]_&]:-scale-x-100` mirrors directional separators (›, ▶, →)
// horizontally so they visually point inline-end in both reading
// directions. Symmetric separators ("/", "·") render identically under
// the transform — `scale-x(-1)` on a symmetric glyph is a no-op.
export const breadcrumbSeparator = cn(
  "text-era-muted opacity-50 select-none inline-block",
  "[[dir=rtl]_&]:-scale-x-100",
);
