import {
  Fragment,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  breadcrumbCurrent,
  breadcrumbLink,
  breadcrumbNav,
  breadcrumbSeparator,
} from "./Breadcrumb.styles";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: ReadonlyArray<BreadcrumbItem>;
  /** Separator between items. Defaults to "/". */
  separator?: ReactNode;
  /**
   * When the trail length exceeds this number, intermediate crumbs
   * collapse to a non-interactive ellipsis span (`…`). The first crumb
   * and the last two crumbs are always rendered. `0` (default) disables
   * collapse — every item renders. Wave 5b2-C3 overflow contract.
   */
  maxItems?: number;
  className?: string;
}

/**
 * Collapse the middle of a long trail into a single ellipsis crumb.
 * Returns the input untouched when `maxItems` is 0 or the trail is
 * already short enough. The collapsed item has no `href` so it renders
 * as a non-interactive `<span>` (matches the WAI-ARIA breadcrumb
 * pattern — only navigable links should be focusable).
 */
function collapseItems(
  items: ReadonlyArray<BreadcrumbItem>,
  maxItems: number,
): ReadonlyArray<BreadcrumbItem> {
  if (maxItems <= 0 || items.length <= maxItems) return items;
  // 1 ... N-1 N — keep first crumb, collapse middle, keep last 2.
  const first = items[0];
  const tail = items.slice(-2);
  return [first, { label: "…" }, ...tail];
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = "/", maxItems = 0, className, ...rest }, ref) => {
    const visible = collapseItems(items, maxItems);
    return (
      <nav
        ref={ref}
        aria-label="현재 위치"
        className={cn(breadcrumbNav, className)}
        {...rest}
      >
        {visible.map((item, i) => {
          const isLast = i === visible.length - 1;
          return (
            <Fragment key={i}>
              {item.href && !isLast ? (
                <a href={item.href} className={breadcrumbLink}>
                  {item.label}
                </a>
              ) : (
                <span
                  className={isLast ? breadcrumbCurrent : breadcrumbLink}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className={breadcrumbSeparator}>
                  {separator}
                </span>
              )}
            </Fragment>
          );
        })}
      </nav>
    );
  },
);

Breadcrumb.displayName = "Breadcrumb";
