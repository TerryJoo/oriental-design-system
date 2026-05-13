import { cn } from "@/utils/cn";

export const markdownEditorRoot = cn(
  "w-full rounded-card overflow-hidden",
  "bg-era-raised border-era shadow-era-card",
);

// When `renderPreview` is provided we wrap the textarea + preview in a flex
// container; the toolbar still spans full width above. Split = side-by-side
// (md+), Stacked = top/bottom always. We default to grid so the textarea and
// preview share equal width without a manual `flex-basis`.
export const markdownEditorBody = cn("grid w-full");

export const markdownEditorBodySplit = cn("grid-cols-1 md:grid-cols-2");

export const markdownEditorBodyStacked = cn("grid-cols-1");

// Subtle separator that adapts to the layout: a left border in split mode
// (only on md+ where the columns sit side-by-side) and a top border in
// stacked mode. We attach it to the preview pane so the textarea retains its
// resize-y handle visually unencumbered.
export const markdownEditorPreview = cn(
  "min-h-[140px] px-3 py-2.5 overflow-auto",
  "bg-era-base text-era-primary",
  "text-sm leading-relaxed",
);

export const markdownEditorPreviewSplit = cn(
  "border-t border-era-soft md:border-t-0 md:border-s md:border-era-soft",
);

export const markdownEditorPreviewStacked = cn("border-t border-era-soft");

export const markdownEditorToolbar = cn(
  "flex flex-wrap gap-1 px-2 py-1.5 border-b border-era-soft",
  "bg-era-sunken",
);

export const markdownEditorToolButton = cn(
  "px-2.5 py-1 rounded text-xs font-bold cursor-pointer font-mono",
  "text-era-muted bg-transparent border-0",
  "transition-colors duration-era-fast ease-era-brush",
  "hover:bg-[rgb(var(--accent-500)/0.15)] hover:text-era-primary",
  "focus:outline-none focus:bg-[rgb(var(--accent-500)/0.15)]",
);

// Mirrors Button's disabled treatment (buttonDisabledVariants + cursor-not-allowed):
// neutralize hover/focus accents and downshift to era-muted so the toolbar reads
// inert without losing era-aware contrast.
export const markdownEditorToolButtonDisabled = cn(
  "cursor-not-allowed text-era-muted opacity-60",
  "hover:bg-transparent hover:text-era-muted",
  "focus:bg-transparent",
);

export const markdownEditorTextarea = cn(
  "w-full min-h-[140px] px-3 py-2.5 outline-none resize-y",
  "bg-era-raised text-era-primary",
  "font-mono text-sm leading-relaxed",
  "placeholder:text-era-muted",
);

export const markdownEditorTextareaDisabled = cn(
  "cursor-not-allowed opacity-60",
);
