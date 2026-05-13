import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { tabStyles, tabsList, tabsPanel } from "./Tabs.styles";

export interface TabItem {
  value: string;
  label: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: ReadonlyArray<TabItem>;
  /** Active tab value (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * Find the next non-disabled tab index by stepping through `items`. Wraps
 * around at both ends. Returns the original index if every other tab is
 * disabled.
 */
function findEnabledIndex(
  items: ReadonlyArray<TabItem>,
  start: number,
  step: 1 | -1,
): number {
  const n = items.length;
  if (n === 0) return start;
  let i = start;
  for (let guard = 0; guard < n; guard += 1) {
    i = (i + step + n) % n;
    if (!items[i]?.disabled) return i;
  }
  return start;
}

function findFirstEnabled(items: ReadonlyArray<TabItem>): number {
  for (let i = 0; i < items.length; i += 1) {
    if (!items[i]?.disabled) return i;
  }
  return 0;
}

function findLastEnabled(items: ReadonlyArray<TabItem>): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (!items[i]?.disabled) return i;
  }
  return items.length - 1;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ items, value, defaultValue, onChange, className, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue ?? items[0]?.value,
    );
    const current = isControlled ? value : internalValue;
    const activeItem = items.find((it) => it.value === current);

    const baseId = useId();
    const tabId = (val: string) => `${baseId}-tab-${val}`;
    const panelId = (val: string) => `${baseId}-panel-${val}`;

    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const handleSelect = useCallback(
      (next: string) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const focusTabAt = (index: number) => {
      const el = tabRefs.current[index];
      el?.focus();
    };

    const handleKeyDown = (
      event: KeyboardEvent<HTMLButtonElement>,
      index: number,
    ) => {
      // Manual activation: arrows MOVE focus only. Enter/Space activate.
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown": {
          event.preventDefault();
          const next = findEnabledIndex(items, index, 1);
          focusTabAt(next);
          break;
        }
        case "ArrowLeft":
        case "ArrowUp": {
          event.preventDefault();
          const next = findEnabledIndex(items, index, -1);
          focusTabAt(next);
          break;
        }
        case "Home": {
          event.preventDefault();
          focusTabAt(findFirstEnabled(items));
          break;
        }
        case "End": {
          event.preventDefault();
          focusTabAt(findLastEnabled(items));
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          const item = items[index];
          if (item && !item.disabled) {
            handleSelect(item.value);
          }
          break;
        }
        default:
          break;
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...rest}>
        <div role="tablist" aria-orientation="horizontal" className={tabsList}>
          {items.map((item, index) => {
            const isSelected = current === item.value;
            return (
              <button
                key={item.value}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={tabId(item.value)}
                aria-selected={isSelected}
                aria-controls={panelId(item.value)}
                tabIndex={isSelected ? 0 : -1}
                disabled={item.disabled}
                onClick={() => handleSelect(item.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={tabStyles({ active: isSelected })}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {activeItem?.content !== undefined && (
          <div
            role="tabpanel"
            id={panelId(activeItem.value)}
            aria-labelledby={tabId(activeItem.value)}
            tabIndex={0}
            className={tabsPanel}
          >
            {activeItem.content}
          </div>
        )}
      </div>
    );
  },
);

Tabs.displayName = "Tabs";
