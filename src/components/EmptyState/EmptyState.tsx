import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import {
  emptyStateIcon,
  emptyStateMessage,
  emptyStateTitle,
  emptyStateWrap,
} from "./EmptyState.styles";

export interface EmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Optional action button(s) below the message. */
  actions?: ReactNode;
  className?: string;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, actions, className, ...rest }, ref) => (
    <div ref={ref} className={cn(emptyStateWrap, className)} {...rest}>
      {icon && <span className={emptyStateIcon}>{icon}</span>}
      {title && <h4 className={emptyStateTitle}>{title}</h4>}
      {description && <p className={emptyStateMessage}>{description}</p>}
      {actions && (
        <div className="flex justify-center gap-2 mt-2">{actions}</div>
      )}
    </div>
  ),
);

EmptyState.displayName = "EmptyState";
