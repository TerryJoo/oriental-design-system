import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import {
  paginationButtonStyles,
  paginationContainer,
} from "./Pagination.styles";

export interface PaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onChange"
> {
  page: number;
  totalPages: number;
  onChange?: (page: number) => void;
  /** Number of pages on each side of `page` to show. */
  siblings?: number;
  /** When true, every page button and the prev/next arrows become natively `disabled`. */
  disabled?: boolean;
  className?: string;
}

/**
 * Build the visible page list with `…` ellipsis where appropriate.
 */
function buildPages(
  page: number,
  total: number,
  siblings: number,
): Array<number | "ellipsis"> {
  const range = (s: number, e: number) =>
    Array.from({ length: e - s + 1 }, (_, i) => s + i);
  if (total <= siblings * 2 + 5) return range(1, total);

  const start = Math.max(2, page - siblings);
  const end = Math.min(total - 1, page + siblings);
  const result: Array<number | "ellipsis"> = [1];
  if (start > 2) result.push("ellipsis");
  result.push(...range(start, end));
  if (end < total - 1) result.push("ellipsis");
  result.push(total);
  return result;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      page,
      totalPages,
      onChange,
      siblings = 1,
      disabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const pages = buildPages(page, totalPages, siblings);
    const go = (p: number) => {
      if (disabled) return;
      if (p < 1 || p > totalPages || p === page) return;
      onChange?.(p);
    };

    return (
      <nav
        ref={ref}
        aria-label="페이지 이동"
        className={cn(paginationContainer, className)}
        {...rest}
      >
        <button
          type="button"
          aria-label="이전"
          disabled={disabled || page === 1}
          onClick={() => go(page - 1)}
          className={paginationButtonStyles()}
        >
          <span
            aria-hidden="true"
            className="inline-block [[dir=rtl]_&]:-scale-x-100"
          >
            ‹
          </span>
        </button>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span
              key={`e-${i}`}
              aria-hidden="true"
              className="px-1.5 text-era-muted text-xs"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              disabled={disabled}
              onClick={() => go(p)}
              className={paginationButtonStyles({ active: p === page })}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="다음"
          disabled={disabled || page === totalPages}
          onClick={() => go(page + 1)}
          className={paginationButtonStyles()}
        >
          <span
            aria-hidden="true"
            className="inline-block [[dir=rtl]_&]:-scale-x-100"
          >
            ›
          </span>
        </button>
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";
