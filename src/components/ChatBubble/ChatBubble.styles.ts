import { cn } from "@/utils/cn";

export type ChatBubbleAuthor = "me" | "ai";

export const chatThread = "flex flex-col gap-2.5 w-full max-w-xl";

export interface ChatBubbleStyleProps {
  author: ChatBubbleAuthor;
  className?: string;
}

export function chatBubbleStyles({
  author,
  className,
}: ChatBubbleStyleProps): string {
  return cn(
    "max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed",
    "transition-colors duration-era ease-era-brush",
    "font-era-body",
    author === "me"
      ? cn(
          "self-end",
          // Heritage: cream `text-era-inverse` (#fbf5e8) on terracotta
          // accent-600 (#8A5030) → 5.91:1, AA ✓.
          // Neon: `--era-ink-inverse` is `#0b0e18` (near-black) on accent-600
          // (#5A50FF) — unreadable. The previous override used `text-era-primary`
          // (#e8ecff) but that lands at 4.44:1 — fails AA 4.5:1 by a hair.
          // Switch Neon to literal white (5.22:1, AA ✓). Both eras now meet AA.
          "bg-[rgb(var(--accent-600))] text-era-inverse",
          "[[data-era=neon]_&]:text-white",
          "[border-radius:var(--chat-bubble,14px)_var(--chat-bubble,14px)_4px_var(--chat-bubble,14px)]",
        )
      : cn(
          "self-start",
          "bg-era-sunken text-era-primary border-era",
          "[border-radius:var(--chat-bubble,14px)_var(--chat-bubble,14px)_var(--chat-bubble,14px)_4px]",
        ),
    className,
  );
}

export const chatBubbleMeta =
  "text-[10px] text-era-muted mt-1 px-1 font-era-body";
