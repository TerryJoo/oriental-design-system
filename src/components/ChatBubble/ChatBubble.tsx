import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  chatBubbleMeta,
  chatBubbleStyles,
  chatThread,
  type ChatBubbleAuthor,
} from "./ChatBubble.styles";

export type { ChatBubbleAuthor } from "./ChatBubble.styles";

export interface ChatBubbleProps extends HTMLAttributes<HTMLDivElement> {
  author?: ChatBubbleAuthor;
  /** Optional avatar slot rendered next to the bubble. */
  avatar?: ReactNode;
  /** Optional metadata line (timestamp, sender name) under the bubble. */
  meta?: ReactNode;
  className?: string;
}

export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ author = "ai", avatar, meta, className, children, ...rest }, ref) => (
    <div
      className={cn(
        "flex items-start gap-2 max-w-full",
        author === "me" ? "self-end flex-row-reverse" : "self-start",
      )}
    >
      {avatar && <div aria-hidden="true">{avatar}</div>}
      <div className="flex flex-col">
        <div
          ref={ref}
          role="group"
          data-author={author}
          className={chatBubbleStyles({ author, className })}
          {...rest}
        >
          {children}
        </div>
        {meta && (
          <span className={cn(chatBubbleMeta, author === "me" && "text-end")}>
            {meta}
          </span>
        )}
      </div>
    </div>
  ),
);

ChatBubble.displayName = "ChatBubble";

export interface ChatThreadProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const ChatThread = forwardRef<HTMLDivElement, ChatThreadProps>(
  ({ className, ...rest }, ref) => (
    <div
      ref={ref}
      role="log"
      aria-live="polite"
      className={cn(chatThread, className)}
      {...rest}
    />
  ),
);

ChatThread.displayName = "ChatThread";
