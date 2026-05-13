import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { cn } from "@/utils/cn";
import {
  calendarDayStyles,
  calendarDow,
  calendarGrid,
  calendarHeader,
  calendarNavButton,
  calendarRoot,
  calendarTitle,
  calendarWeekRow,
  calendarWeekdayRow,
} from "./Calendar.styles";

const DOW_KO = ["日", "月", "火", "水", "木", "金", "土"] as const;

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CalendarProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Currently selected date (yyyy-mm-dd). */
  value?: string;
  defaultValue?: string;
  onChange?: (date: string) => void;
  /** Initial month to display (yyyy-mm-01). Defaults to today. */
  defaultMonth?: Date;
  /**
   * Override day-of-week labels. Order is always Sunday-first; the component
   * rotates them to match `weekStartsOn`. When omitted and `locale` is set,
   * weekday labels are derived from `Intl.DateTimeFormat`.
   */
  dayOfWeekLabels?: ReadonlyArray<string>;
  /**
   * Predicate marking a date as disabled. Receives ISO `yyyy-mm-dd`. Disabled
   * cells are non-interactive, get `aria-disabled="true"`, and are skipped by
   * keyboard navigation (Arrow keys / Home / End / Page keys walk past them).
   */
  disabledDate?: (iso: string) => boolean;
  /** Inclusive lower bound (`yyyy-mm-dd`). Anything before is disabled. */
  minDate?: string;
  /** Inclusive upper bound (`yyyy-mm-dd`). Anything after is disabled. */
  maxDate?: string;
  /** First column of the week. 0 = Sunday (default), 1 = Monday, etc. */
  weekStartsOn?: WeekStartsOn;
  /**
   * BCP-47 locale tag. When provided, the month-title and (default) weekday
   * labels are formatted via `Intl.DateTimeFormat`. When omitted, the title
   * uses CJK characters (`2026年 5月`) and weekday labels fall back to the
   * `dayOfWeekLabels` prop or the CJK kanji default.
   */
  locale?: string;
  /** Accessible label for the date grid. Defaults to "달력". */
  "aria-label"?: string;
  className?: string;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function parseYmd(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function clampDay(year: number, month: number, day: number): Date {
  // Last valid day of (year, month). month is 0-indexed.
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

// Compare ISO strings lexicographically — safe because `yyyy-mm-dd` zero-pads
// every field. Used for min/max bound checks without `new Date()` round-trips.
function isoLt(a: string, b: string): boolean {
  return a < b;
}
function isoGt(a: string, b: string): boolean {
  return a > b;
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      defaultMonth,
      dayOfWeekLabels,
      disabledDate,
      minDate,
      maxDate,
      weekStartsOn = 0,
      locale,
      "aria-label": ariaLabel = "달력",
      className,
      ...rest
    },
    ref,
  ) => {
    const today = new Date();
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue,
    );
    const isControlled = value !== undefined;
    const selected = isControlled ? value : internalValue;

    const initialMonth = defaultMonth ?? today;
    const [view, setView] = useState<{ year: number; month: number }>(() => ({
      year: initialMonth.getFullYear(),
      month: initialMonth.getMonth(),
    }));

    // Resolved disabled-predicate combining minDate / maxDate / disabledDate.
    const isDisabled = useCallback(
      (iso: string): boolean => {
        if (minDate && isoLt(iso, minDate)) return true;
        if (maxDate && isoGt(iso, maxDate)) return true;
        if (disabledDate && disabledDate(iso)) return true;
        return false;
      },
      [minDate, maxDate, disabledDate],
    );

    // Roving-tabindex focus target. Distinct from `selected` (the persistent
    // value). Initialized to selected → today (if in displayed month) → 1st of
    // displayed month.
    const [focusedDate, setFocusedDate] = useState<string>(() => {
      if (defaultValue) return defaultValue;
      const todayIso = ymd(today);
      const todayInView =
        today.getFullYear() === initialMonth.getFullYear() &&
        today.getMonth() === initialMonth.getMonth();
      if (todayInView) return todayIso;
      return ymd(
        new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
      );
    });

    // Track whether focus should be moved to the focused cell on next render.
    // We avoid stealing focus on the very first mount.
    const shouldFocusRef = useRef(false);
    const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    const days = useMemo(() => {
      const first = new Date(view.year, view.month, 1);
      // Leading-padding count respects weekStartsOn. e.g. month starts on Wed
      // (firstDow=3) with weekStartsOn=1 (Mon) → leading = (3 - 1 + 7) % 7 = 2.
      const firstDow = first.getDay();
      const leading = (firstDow - weekStartsOn + 7) % 7;
      const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
      const prevMonthDays = new Date(view.year, view.month, 0).getDate();

      const cells: Array<{ date: Date; muted: boolean }> = [];
      for (let i = leading - 1; i >= 0; i--) {
        cells.push({
          date: new Date(view.year, view.month - 1, prevMonthDays - i),
          muted: true,
        });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(view.year, view.month, d), muted: false });
      }
      while (cells.length % 7 !== 0 || cells.length < 42) {
        const last = cells[cells.length - 1].date;
        const next = new Date(last);
        next.setDate(last.getDate() + 1);
        cells.push({
          date: next,
          muted: cells.length >= daysInMonth + leading,
        });
        if (cells.length >= 42) break;
      }
      return cells.slice(0, 42);
    }, [view, weekStartsOn]);

    // Group cells into 6 week rows of 7 cells each for role="row" wrappers.
    const weekRows = useMemo(() => {
      const rows: Array<Array<{ date: Date; muted: boolean }>> = [];
      for (let r = 0; r < 6; r++) {
        rows.push(days.slice(r * 7, r * 7 + 7));
      }
      return rows;
    }, [days]);

    // Resolved weekday header labels in column order. Three sources, in order
    // of precedence: explicit `dayOfWeekLabels` (rotated to weekStartsOn),
    // `Intl.DateTimeFormat` (when locale is set), CJK kanji fallback.
    const resolvedDowLabels = useMemo(() => {
      const sundayFirst = dayOfWeekLabels
        ? dayOfWeekLabels
        : locale
          ? (() => {
              const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
              // Use any known week — 2024-01-07 was a Sunday — and pull 7 days.
              return Array.from({ length: 7 }, (_, i) =>
                fmt.format(new Date(2024, 0, 7 + i)),
              );
            })()
          : DOW_KO;
      // Rotate Sunday-first array by weekStartsOn so column 0 == weekStartsOn.
      return Array.from(
        { length: 7 },
        (_, i) => sundayFirst[(i + weekStartsOn) % 7],
      );
    }, [dayOfWeekLabels, locale, weekStartsOn]);

    // Resolved title — Intl-driven when `locale` set, else legacy CJK form.
    const titleText = useMemo(() => {
      if (locale) {
        const fmt = new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "long",
        });
        return fmt.format(new Date(view.year, view.month, 1));
      }
      return `${view.year}年 ${view.month + 1}月`;
    }, [locale, view]);

    const setMonth = (delta: number) => {
      setView((v) => {
        const m = v.month + delta;
        return {
          year: v.year + Math.floor(m / 12),
          month: ((m % 12) + 12) % 12,
        };
      });
    };

    const select = useCallback(
      (date: Date) => {
        const next = ymd(date);
        if (isDisabled(next)) return;
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange, isDisabled],
    );

    // Move focused date to a new Date, syncing the displayed month and
    // requesting that the matching cell receive DOM focus on next render.
    const moveFocusedDate = useCallback((next: Date) => {
      const iso = ymd(next);
      setFocusedDate(iso);
      setView({ year: next.getFullYear(), month: next.getMonth() });
      shouldFocusRef.current = true;
    }, []);

    // Walk by `step` days (positive or negative) until we land on an enabled
    // cell. Bounded by `maxIter` (default 366) so a fully-disabled future
    // doesn't lock keyboard nav. Returns null when no enabled cell is found.
    const walkToEnabled = useCallback(
      (start: Date, step: number, maxIter = 366): Date | null => {
        let cursor = new Date(start);
        for (let i = 0; i < maxIter; i++) {
          if (!isDisabled(ymd(cursor))) return cursor;
          cursor = new Date(cursor);
          cursor.setDate(cursor.getDate() + step);
        }
        return null;
      },
      [isDisabled],
    );

    // After state updates, push DOM focus to the cell matching focusedDate
    // (only when an arrow/page key triggered the move — never on mount).
    useEffect(() => {
      if (!shouldFocusRef.current) return;
      shouldFocusRef.current = false;
      const el = cellRefs.current.get(focusedDate);
      if (el) el.focus();
    }, [focusedDate, view]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const key = event.key;
      const navKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        "Enter",
        " ",
      ];
      if (!navKeys.includes(key)) return;

      const current = parseYmd(focusedDate);
      // Direction step used to skip disabled targets. Per-key direction is
      // declared up-front so the post-switch resolver can walk past blocked
      // cells without each branch re-implementing the skip.
      let target: Date | null = null;
      let direction = 1;

      switch (key) {
        case "ArrowLeft": {
          target = new Date(current);
          target.setDate(current.getDate() - 1);
          direction = -1;
          break;
        }
        case "ArrowRight": {
          target = new Date(current);
          target.setDate(current.getDate() + 1);
          direction = 1;
          break;
        }
        case "ArrowUp": {
          target = new Date(current);
          target.setDate(current.getDate() - 7);
          direction = -1;
          break;
        }
        case "ArrowDown": {
          target = new Date(current);
          target.setDate(current.getDate() + 7);
          direction = 1;
          break;
        }
        case "Home": {
          // First column of the current week. Offset relative to weekStartsOn,
          // not always Sunday — so Mon-first weeks land on Monday, etc.
          const dow = current.getDay();
          const offsetFromWeekStart = (dow - weekStartsOn + 7) % 7;
          target = new Date(current);
          target.setDate(current.getDate() - offsetFromWeekStart);
          // Walk forward when start-of-week is itself disabled.
          direction = 1;
          break;
        }
        case "End": {
          const dow = current.getDay();
          const offsetFromWeekStart = (dow - weekStartsOn + 7) % 7;
          const toEnd = 6 - offsetFromWeekStart;
          target = new Date(current);
          target.setDate(current.getDate() + toEnd);
          direction = -1;
          break;
        }
        case "PageUp": {
          if (event.shiftKey) {
            target = clampDay(
              current.getFullYear() - 1,
              current.getMonth(),
              current.getDate(),
            );
          } else {
            target = clampDay(
              current.getFullYear(),
              current.getMonth() - 1,
              current.getDate(),
            );
          }
          direction = -1;
          break;
        }
        case "PageDown": {
          if (event.shiftKey) {
            target = clampDay(
              current.getFullYear() + 1,
              current.getMonth(),
              current.getDate(),
            );
          } else {
            target = clampDay(
              current.getFullYear(),
              current.getMonth() + 1,
              current.getDate(),
            );
          }
          direction = 1;
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          select(current);
          return;
        }
      }

      if (target) {
        event.preventDefault();
        // Skip past disabled cells in the natural direction of the key.
        const enabled = walkToEnabled(target, direction);
        if (enabled) moveFocusedDate(enabled);
      }
    };

    return (
      <div ref={ref} className={cn(calendarRoot, className)} {...rest}>
        <div className={calendarHeader}>
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => setMonth(-1)}
            className={calendarNavButton}
          >
            ‹
          </button>
          <h5 className={calendarTitle}>{titleText}</h5>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => setMonth(1)}
            className={calendarNavButton}
          >
            ›
          </button>
        </div>
        <div
          role="grid"
          aria-label={ariaLabel}
          className={calendarGrid}
          onKeyDown={handleKeyDown}
        >
          <div role="row" className={calendarWeekdayRow}>
            {resolvedDowLabels.map((d, i) => (
              <div
                key={`${i}-${d}`}
                role="columnheader"
                className={calendarDow}
              >
                {d}
              </div>
            ))}
          </div>
          {weekRows.map((row, rowIdx) => (
            <div key={`week-${rowIdx}`} role="row" className={calendarWeekRow}>
              {row.map(({ date, muted }) => {
                const iso = ymd(date);
                const isToday = iso === ymd(today);
                const isSelected = iso === selected;
                const isTabbable = iso === focusedDate;
                const disabled = isDisabled(iso);
                return (
                  <button
                    key={iso}
                    ref={(el) => {
                      if (el) cellRefs.current.set(iso, el);
                      else cellRefs.current.delete(iso);
                    }}
                    type="button"
                    role="gridcell"
                    tabIndex={isTabbable ? 0 : -1}
                    aria-selected={isSelected}
                    aria-current={isToday ? "date" : undefined}
                    aria-disabled={disabled || undefined}
                    onClick={() => {
                      if (disabled) return;
                      setFocusedDate(iso);
                      select(date);
                    }}
                    className={calendarDayStyles({
                      selected: isSelected,
                      today: isToday,
                      muted,
                      disabled,
                    })}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

Calendar.displayName = "Calendar";
