import {
  Fragment,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  sidebarHeading,
  sidebarItemStyles,
  sidebarRoot,
} from "./Sidebar.styles";

export interface SidebarItem {
  /** Unique value for `active` matching. */
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
}

export interface SidebarSection {
  heading?: ReactNode;
  items: ReadonlyArray<SidebarItem>;
}

export interface SidebarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onChange"
> {
  sections: ReadonlyArray<SidebarSection>;
  /** Currently active item value. */
  value?: string;
  onChange?: (value: string) => void;
  /**
   * Accessible name for the navigation landmark. Defaults to "사이드 메뉴".
   * Override when multiple sidebars coexist on the same page or when a
   * different label fits the application context.
   */
  "aria-label"?: string;
  className?: string;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      sections,
      value,
      onChange,
      className,
      "aria-label": ariaLabel = "사이드 메뉴",
      ...rest
    },
    ref,
  ) => (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={cn(sidebarRoot, className)}
      {...rest}
    >
      {sections.map((section, idx) => (
        <Fragment key={idx}>
          {section.heading && (
            <div className={sidebarHeading}>{section.heading}</div>
          )}
          {section.items.map((item) => (
            // Items are plain anchors inside a <nav>: the WCAG-preferred
            // navigation pattern. Assistive tech announces the landmark and
            // its links without an explicit `role="menuitem"` (which would
            // require a `role="menu"` parent and full menu keyboard model).
            <a
              key={item.value}
              href={item.href ?? "#"}
              aria-current={value === item.value ? "page" : undefined}
              onClick={(e) => {
                if (!item.href) e.preventDefault();
                onChange?.(item.value);
              }}
              className={sidebarItemStyles({ active: value === item.value })}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
            </a>
          ))}
        </Fragment>
      ))}
    </nav>
  ),
);

Sidebar.displayName = "Sidebar";
