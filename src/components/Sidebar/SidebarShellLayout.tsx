import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  sidebarShellHeaderStyles,
  sidebarShellContentStyles,
  sidebarShellFooterStyles,
  sidebarShellGroupStyles,
  sidebarShellGroupLabelStyles,
} from "./Sidebar.styles";
import { useSidebarShellContext } from "./SidebarShell";
// Note: SidebarTrigger is imported lazily via re-export to avoid a hard cycle.
// This still works because of ES module live bindings.
import { SidebarTrigger } from "./SidebarShell";

// --- SidebarShell.Header ---------------------------------------------------

export interface SidebarShellHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Logo element rendered next to the title. Hidden when collapsed. */
  logo?: ReactNode;
  /** Sidebar title string. Hidden when collapsed. */
  title?: string;
  /** Whether to show the sidebar collapse trigger automatically. */
  showTrigger?: boolean;
  children?: ReactNode;
}

export const SidebarShellHeader = forwardRef<
  HTMLDivElement,
  SidebarShellHeaderProps
>(({ logo, title, showTrigger, className, children, ...props }, ref) => {
  const { collapsed } = useSidebarShellContext();

  return (
    <div
      ref={ref}
      className={sidebarShellHeaderStyles({ className })}
      {...props}
    >
      <div className="flex h-[32px] items-center">
        {showTrigger && (
          <div className="flex shrink-0 items-center justify-center w-8 h-8">
            <SidebarTrigger />
          </div>
        )}
        {!collapsed && (logo || title) && (
          <div
            className={`flex items-center gap-2 overflow-hidden ${
              showTrigger ? "ms-3" : ""
            }`}
          >
            {logo && <span className="shrink-0">{logo}</span>}
            {title && (
              <span className="truncate text-heading-4 font-bold text-era-primary">
                {title}
              </span>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
});
SidebarShellHeader.displayName = "SidebarShellHeader";

// --- SidebarShell.Content --------------------------------------------------

export interface SidebarShellContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SidebarShellContent = forwardRef<
  HTMLDivElement,
  SidebarShellContentProps
>(({ className, children, tabIndex, ...props }, ref) => {
  const { collapsed } = useSidebarShellContext();
  // When expanded, this div is `overflow-y-auto`. axe's
  // `scrollable-region-focusable` rule (WCAG 2.1.1) requires that any
  // scrollable container be reachable by keyboard so users can scroll
  // it without a mouse. We add `tabIndex={0}` only while scrollable —
  // when collapsed the content is `overflow-visible` and adding a tab
  // stop would just trap keyboard focus on an empty wrapper.
  // Consumers can override by passing their own `tabIndex`. The parent
  // `<nav>` already provides the landmark + accessible name, so we do
  // NOT add `role="region"` here (that would create a redundant nested
  // landmark inside the nav).
  const isScrollable = !collapsed;
  return (
    <div
      ref={ref}
      className={sidebarShellContentStyles({ collapsed, className })}
      tabIndex={tabIndex ?? (isScrollable ? 0 : undefined)}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarShellContent.displayName = "SidebarShellContent";

// --- SidebarShell.Footer ---------------------------------------------------

export interface SidebarShellFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SidebarShellFooter = forwardRef<
  HTMLDivElement,
  SidebarShellFooterProps
>(({ className, children, ...props }, ref) => {
  // Touch the context so footer must live inside SidebarShell (consistency).
  useSidebarShellContext();
  return (
    <div
      ref={ref}
      className={sidebarShellFooterStyles({ className })}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarShellFooter.displayName = "SidebarShellFooter";

// --- SidebarShell.Group ----------------------------------------------------

export interface SidebarShellGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SidebarShellGroup = forwardRef<
  HTMLDivElement,
  SidebarShellGroupProps
>(({ className, children, ...props }, ref) => {
  useSidebarShellContext();
  return (
    <div
      ref={ref}
      role="group"
      className={sidebarShellGroupStyles({ className })}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarShellGroup.displayName = "SidebarShellGroup";

// --- SidebarShell.GroupLabel -----------------------------------------------

export interface SidebarShellGroupLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SidebarShellGroupLabel = forwardRef<
  HTMLDivElement,
  SidebarShellGroupLabelProps
>(({ className, children, ...props }, ref) => {
  const { collapsed } = useSidebarShellContext();

  if (collapsed) return null;

  return (
    <div
      ref={ref}
      className={sidebarShellGroupLabelStyles({ className })}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarShellGroupLabel.displayName = "SidebarShellGroupLabel";
