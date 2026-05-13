import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  syncStatusContainer,
  syncStatusDot,
  syncStatusStateMap,
  type SyncStatusState,
} from "./SyncStatus.styles";

export type { SyncStatusState } from "./SyncStatus.styles";

export interface SyncStatusProps extends HTMLAttributes<HTMLSpanElement> {
  state?: SyncStatusState;
  /** Override the default localized label. */
  label?: ReactNode;
  className?: string;
}

export const SyncStatus = forwardRef<HTMLSpanElement, SyncStatusProps>(
  ({ state = "connected", label, className, ...rest }, ref) => (
    <span
      ref={ref}
      role="status"
      className={syncStatusContainer({ className })}
      {...rest}
    >
      <span aria-hidden="true" className={syncStatusDot(state)} />
      {label ?? syncStatusStateMap[state].text}
    </span>
  ),
);

SyncStatus.displayName = "SyncStatus";
