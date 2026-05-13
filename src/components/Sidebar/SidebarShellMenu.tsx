import {
  forwardRef,
  useState,
  createContext,
  useContext,
  useCallback,
  useId,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  sidebarShellMenuStyles,
  sidebarShellMenuButtonStyles,
  sidebarShellMenuSubStyles,
  sidebarShellMenuSubSubStyles,
  sidebarShellMenuSubItemStyles,
  sidebarShellMenuSubButtonStyles,
  sidebarShellChevronStyles,
} from "./Sidebar.styles";
import { useSidebarShellContext } from "./SidebarShell";

// --- Internal SubMenu context ---------------------------------------------

interface SubMenuContextValue {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
  subMenuId: string;
}

const SubMenuContext = createContext<SubMenuContextValue | null>(null);

function useSubMenuContext(): SubMenuContextValue | null {
  return useContext(SubMenuContext);
}

// --- ChevronDown icon ------------------------------------------------------

interface ChevronDownIconProps {
  className?: string;
}

function ChevronDownIcon({ className }: ChevronDownIconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- SidebarShell.Menu -----------------------------------------------------

export interface SidebarShellMenuProps extends HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

export const SidebarShellMenu = forwardRef<
  HTMLUListElement,
  SidebarShellMenuProps
>(({ className, children, onKeyDown, ...props }, ref) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      onKeyDown?.(e);

      const list = e.currentTarget;
      const focusable = Array.from(
        list.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const current = document.activeElement as HTMLElement;
      const index = focusable.indexOf(current);

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = index < focusable.length - 1 ? index + 1 : 0;
          focusable[next]?.focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = index > 0 ? index - 1 : focusable.length - 1;
          focusable[prev]?.focus();
          break;
        }
        case "Home": {
          e.preventDefault();
          focusable[0]?.focus();
          break;
        }
        case "End": {
          e.preventDefault();
          focusable[focusable.length - 1]?.focus();
          break;
        }
      }
    },
    [onKeyDown],
  );

  return (
    <ul
      ref={ref}
      role="list"
      className={sidebarShellMenuStyles({ className })}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </ul>
  );
});
SidebarShellMenu.displayName = "SidebarShellMenu";

// --- SidebarShell.MenuItem -------------------------------------------------

export interface SidebarShellMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Default expanded state (uncontrolled). */
  defaultExpanded?: boolean;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}

export const SidebarShellMenuItem = forwardRef<
  HTMLLIElement,
  SidebarShellMenuItemProps
>(
  (
    {
      defaultExpanded = false,
      expanded: controlledExpanded,
      onExpandedChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isControlled = controlledExpanded !== undefined;
    const expanded = isControlled ? controlledExpanded : internalExpanded;
    const subMenuId = useId();

    const setExpanded = useCallback(
      (value: boolean) => {
        if (!isControlled) setInternalExpanded(value);
        onExpandedChange?.(value);
      },
      [isControlled, onExpandedChange],
    );

    const toggleExpanded = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded, setExpanded]);

    return (
      <SubMenuContext.Provider
        value={{ expanded, setExpanded, toggleExpanded, subMenuId }}
      >
        <li ref={ref} className={className} {...props}>
          {children}
        </li>
      </SubMenuContext.Provider>
    );
  },
);
SidebarShellMenuItem.displayName = "SidebarShellMenuItem";

// --- SidebarShell.MenuButton ----------------------------------------------

export interface SidebarShellMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** "nav" = navigation item (default), "action" = action trigger. */
  variant?: "nav" | "action";
  /** Icon element (24x24 recommended). */
  icon?: ReactNode;
  /** Active state. */
  active?: boolean;
  /** Whether this button has a sub-menu. Toggles expansion. */
  hasSub?: boolean;
  /** Whether to show this item (just the icon) when sidebar is collapsed. */
  showWhenCollapsed?: boolean;
  children?: ReactNode;
}

export const SidebarShellMenuButton = forwardRef<
  HTMLButtonElement,
  SidebarShellMenuButtonProps
>(
  (
    {
      variant = "nav",
      icon,
      active,
      hasSub,
      showWhenCollapsed,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { collapsed } = useSidebarShellContext();
    const subCtx = useSubMenuContext();

    const handleClick = useCallback(
      (e: ReactMouseEvent<HTMLButtonElement>) => {
        if (hasSub && subCtx) {
          subCtx.toggleExpanded();
        }
        onClick?.(e);
      },
      [hasSub, subCtx, onClick],
    );

    if (collapsed && variant !== "action" && !showWhenCollapsed) {
      return null;
    }

    return (
      <button
        ref={ref}
        type="button"
        className={sidebarShellMenuButtonStyles({
          variant,
          active,
          hasSub,
          className,
        })}
        onClick={handleClick}
        aria-expanded={hasSub && subCtx ? subCtx.expanded : undefined}
        aria-controls={hasSub && subCtx ? subCtx.subMenuId : undefined}
        aria-current={active ? "page" : undefined}
        {...props}
      >
        {icon && (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        {children && (
          <span className="flex-1 truncate text-start">{children}</span>
        )}
        {hasSub && (
          <ChevronDownIcon
            className={sidebarShellChevronStyles({
              expanded: subCtx?.expanded,
            })}
          />
        )}
      </button>
    );
  },
);
SidebarShellMenuButton.displayName = "SidebarShellMenuButton";

// --- SidebarShell.MenuSub --------------------------------------------------

export interface SidebarShellMenuSubProps extends HTMLAttributes<HTMLUListElement> {
  /** Whether this is a nested sub-menu (Level 3+); uses tighter indentation. */
  nested?: boolean;
  children: ReactNode;
}

export const SidebarShellMenuSub = forwardRef<
  HTMLUListElement,
  SidebarShellMenuSubProps
>(({ nested = false, className, children, ...props }, ref) => {
  const { collapsed } = useSidebarShellContext();
  const subCtx = useSubMenuContext();

  if (collapsed) return null;

  const isHidden = subCtx ? !subCtx.expanded : false;

  return (
    <ul
      ref={ref}
      id={subCtx?.subMenuId}
      role="list"
      aria-hidden={isHidden}
      className={
        nested
          ? sidebarShellMenuSubSubStyles({ hidden: isHidden, className })
          : sidebarShellMenuSubStyles({ hidden: isHidden, className })
      }
      {...props}
    >
      {children}
    </ul>
  );
});
SidebarShellMenuSub.displayName = "SidebarShellMenuSub";

// --- SidebarShell.MenuSubItem ---------------------------------------------

export interface SidebarShellMenuSubItemProps extends HTMLAttributes<HTMLLIElement> {
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
}

export const SidebarShellMenuSubItem = forwardRef<
  HTMLLIElement,
  SidebarShellMenuSubItemProps
>(
  (
    {
      defaultExpanded = false,
      expanded: controlledExpanded,
      onExpandedChange,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
    const isControlled = controlledExpanded !== undefined;
    const expanded = isControlled ? controlledExpanded : internalExpanded;
    const subMenuId = useId();

    const setExpanded = useCallback(
      (value: boolean) => {
        if (!isControlled) setInternalExpanded(value);
        onExpandedChange?.(value);
      },
      [isControlled, onExpandedChange],
    );

    const toggleExpanded = useCallback(() => {
      setExpanded(!expanded);
    }, [expanded, setExpanded]);

    return (
      <SubMenuContext.Provider
        value={{ expanded, setExpanded, toggleExpanded, subMenuId }}
      >
        <li
          ref={ref}
          className={sidebarShellMenuSubItemStyles({ expanded, className })}
          {...props}
        >
          {children}
        </li>
      </SubMenuContext.Provider>
    );
  },
);
SidebarShellMenuSubItem.displayName = "SidebarShellMenuSubItem";

// --- SidebarShell.MenuSubButton -------------------------------------------

export interface SidebarShellMenuSubButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  active?: boolean;
  /** Header style (B2 medium) vs list style (B3 medium). */
  isHeader?: boolean;
  /** Whether this button has a nested sub-menu. */
  hasSub?: boolean;
  /** Whether to show this item (just the icon) when sidebar is collapsed. */
  showWhenCollapsed?: boolean;
  children: ReactNode;
}

export const SidebarShellMenuSubButton = forwardRef<
  HTMLButtonElement,
  SidebarShellMenuSubButtonProps
>(
  (
    {
      icon,
      active,
      isHeader,
      hasSub,
      showWhenCollapsed,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { collapsed } = useSidebarShellContext();
    const subCtx = useSubMenuContext();

    const handleClick = useCallback(
      (e: ReactMouseEvent<HTMLButtonElement>) => {
        if (hasSub && subCtx) {
          subCtx.toggleExpanded();
        }
        onClick?.(e);
      },
      [hasSub, subCtx, onClick],
    );

    if (collapsed && !showWhenCollapsed) {
      return null;
    }

    const inExpandedGroup = !!(hasSub && subCtx?.expanded);

    return (
      <button
        ref={ref}
        type="button"
        className={sidebarShellMenuSubButtonStyles({
          active,
          isHeader,
          hasSub,
          collapsed,
          inExpandedGroup,
          className,
        })}
        onClick={handleClick}
        aria-expanded={hasSub && subCtx ? subCtx.expanded : undefined}
        aria-controls={hasSub && subCtx ? subCtx.subMenuId : undefined}
        aria-current={active ? "page" : undefined}
        {...props}
      >
        {icon && (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        {!collapsed && children && (
          <span className="flex-1 truncate text-start">{children}</span>
        )}
        {!collapsed && hasSub && (
          <ChevronDownIcon
            className={sidebarShellChevronStyles({
              expanded: subCtx?.expanded,
            })}
          />
        )}
      </button>
    );
  },
);
SidebarShellMenuSubButton.displayName = "SidebarShellMenuSubButton";
