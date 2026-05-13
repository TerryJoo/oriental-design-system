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
  type ForwardRefExoticComponent,
  type RefAttributes,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  sidebarShellStyles,
  sidebarShellTriggerStyles,
} from "./Sidebar.styles";
import {
  SidebarShellHeader,
  SidebarShellContent,
  SidebarShellFooter,
  SidebarShellGroup,
  SidebarShellGroupLabel,
} from "./SidebarShellLayout";
import {
  SidebarShellMenu,
  SidebarShellMenuItem,
  SidebarShellMenuButton,
  SidebarShellMenuSub,
  SidebarShellMenuSubItem,
  SidebarShellMenuSubButton,
} from "./SidebarShellMenu";
import { SidebarShellUserProfile } from "./SidebarShellUserProfile";

// --- Sidebar Context -------------------------------------------------------

interface SidebarShellContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  sidebarId: string;
}

const SidebarShellContext = createContext<SidebarShellContextValue | null>(
  null,
);

export function useSidebarShellContext(): SidebarShellContextValue {
  const ctx = useContext(SidebarShellContext);
  if (!ctx) {
    throw new Error(
      "SidebarShell sub-components must be used within <SidebarShell>",
    );
  }
  return ctx;
}

// --- SidebarShell root ----------------------------------------------------

export interface SidebarShellProps extends HTMLAttributes<HTMLElement> {
  /** Controlled collapsed state. */
  collapsed?: boolean;
  /** Callback when collapsed state changes (controlled or uncontrolled). */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Default collapsed state for uncontrolled usage. */
  defaultCollapsed?: boolean;
  /**
   * Accessible label for the sidebar landmark.
   * Defaults to `"Sidebar navigation"`. Override for localization
   * (e.g. `"관리자 메뉴"`) or to disambiguate multiple sidebars on a page.
   */
  "aria-label"?: string;
  children: ReactNode;
}

interface SidebarShellComponent extends ForwardRefExoticComponent<
  SidebarShellProps & RefAttributes<HTMLElement>
> {
  Header: typeof SidebarShellHeader;
  Content: typeof SidebarShellContent;
  Footer: typeof SidebarShellFooter;
  Group: typeof SidebarShellGroup;
  GroupLabel: typeof SidebarShellGroupLabel;
  Menu: typeof SidebarShellMenu;
  MenuItem: typeof SidebarShellMenuItem;
  MenuButton: typeof SidebarShellMenuButton;
  MenuSub: typeof SidebarShellMenuSub;
  MenuSubItem: typeof SidebarShellMenuSubItem;
  MenuSubButton: typeof SidebarShellMenuSubButton;
  UserProfile: typeof SidebarShellUserProfile;
  Trigger: typeof SidebarTrigger;
}

const SidebarShellInner = forwardRef<HTMLElement, SidebarShellProps>(
  (
    {
      collapsed: controlledCollapsed,
      onCollapsedChange,
      defaultCollapsed = false,
      className,
      children,
      "aria-label": ariaLabel = "Sidebar navigation",
      ...props
    },
    ref,
  ) => {
    const [internalCollapsed, setInternalCollapsed] =
      useState(defaultCollapsed);
    const isControlled = controlledCollapsed !== undefined;
    const collapsed = isControlled ? controlledCollapsed : internalCollapsed;
    const sidebarId = useId();

    const setCollapsed = useCallback(
      (value: boolean) => {
        if (!isControlled) setInternalCollapsed(value);
        onCollapsedChange?.(value);
      },
      [isControlled, onCollapsedChange],
    );

    const toggleCollapsed = useCallback(() => {
      setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    return (
      <SidebarShellContext.Provider
        value={{ collapsed, setCollapsed, toggleCollapsed, sidebarId }}
      >
        <nav
          ref={ref}
          id={sidebarId}
          role="navigation"
          aria-label={ariaLabel}
          className={sidebarShellStyles({ collapsed, className })}
          {...props}
        >
          {children}
        </nav>
      </SidebarShellContext.Provider>
    );
  },
);
SidebarShellInner.displayName = "SidebarShell";

export const SidebarShell = SidebarShellInner as SidebarShellComponent;

// --- SidebarTrigger -------------------------------------------------------

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional override for accessible label. */
  "aria-label"?: string;
}

export const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(({ className, children, onClick, ...props }, ref) => {
  const { collapsed, toggleCollapsed, sidebarId } = useSidebarShellContext();

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>) => {
      toggleCollapsed();
      onClick?.(e);
    },
    [toggleCollapsed, onClick],
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={!collapsed}
      aria-controls={sidebarId}
      aria-label={props["aria-label"] ?? "메뉴 여닫기"}
      onClick={handleClick}
      className={sidebarShellTriggerStyles({ className })}
      {...props}
    >
      {children ?? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 5h14M3 10h14M3 15h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

// --- Static member assignment (dot notation) ------------------------------

SidebarShell.Header = SidebarShellHeader;
SidebarShell.Content = SidebarShellContent;
SidebarShell.Footer = SidebarShellFooter;
SidebarShell.Group = SidebarShellGroup;
SidebarShell.GroupLabel = SidebarShellGroupLabel;
SidebarShell.Menu = SidebarShellMenu;
SidebarShell.MenuItem = SidebarShellMenuItem;
SidebarShell.MenuButton = SidebarShellMenuButton;
SidebarShell.MenuSub = SidebarShellMenuSub;
SidebarShell.MenuSubItem = SidebarShellMenuSubItem;
SidebarShell.MenuSubButton = SidebarShellMenuSubButton;
SidebarShell.UserProfile = SidebarShellUserProfile;
SidebarShell.Trigger = SidebarTrigger;
