import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  dropdownMenuItemStyles,
  dropdownMenuRoot,
  dropdownMenuSeparator,
} from "./DropdownMenu.styles";

export interface DropdownMenuItem {
  /** Unique key. */
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuSection {
  items: ReadonlyArray<DropdownMenuItem>;
}

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Single flat list, OR sections separated by dividers. */
  items: ReadonlyArray<DropdownMenuItem> | ReadonlyArray<DropdownMenuSection>;
  className?: string;
  /**
   * Called when the menu should close — fires on Escape, on Tab/Shift+Tab
   * leaving the surface, and after item activation when `closeOnSelect` is
   * true. The consumer is responsible for unmounting the menu and (optionally)
   * restoring focus to the trigger.
   */
  onClose?: () => void;
  /**
   * Whether activating a menu item via Enter, Space, or click should call
   * `onClose` automatically. Defaults to `true`. Set to `false` for
   * checkbox/radio-style menus where the menu must remain open while the
   * user toggles multiple values.
   */
  closeOnSelect?: boolean;
}

function isSectioned(
  items: ReadonlyArray<DropdownMenuItem> | ReadonlyArray<DropdownMenuSection>,
): items is ReadonlyArray<DropdownMenuSection> {
  return items.length > 0 && "items" in (items[0] as DropdownMenuSection);
}

/**
 * Flattens sectioned input into a single ordered list of items, preserving
 * the original index so onSelect handlers fire in the right order.
 */
function flatten(
  sections: ReadonlyArray<DropdownMenuSection>,
): ReadonlyArray<DropdownMenuItem> {
  const out: DropdownMenuItem[] = [];
  for (const section of sections) {
    for (const item of section.items) out.push(item);
  }
  return out;
}

function findFirstEnabled(items: ReadonlyArray<DropdownMenuItem>): number {
  for (let i = 0; i < items.length; i += 1) {
    if (!items[i]!.disabled) return i;
  }
  return -1;
}

function findLastEnabled(items: ReadonlyArray<DropdownMenuItem>): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (!items[i]!.disabled) return i;
  }
  return -1;
}

function findNextEnabled(
  items: ReadonlyArray<DropdownMenuItem>,
  from: number,
): number {
  if (items.length === 0) return -1;
  for (let step = 1; step <= items.length; step += 1) {
    const idx = (from + step) % items.length;
    if (!items[idx]!.disabled) return idx;
  }
  return -1;
}

function findPrevEnabled(
  items: ReadonlyArray<DropdownMenuItem>,
  from: number,
): number {
  if (items.length === 0) return -1;
  for (let step = 1; step <= items.length; step += 1) {
    const idx = (from - step + items.length) % items.length;
    if (!items[idx]!.disabled) return idx;
  }
  return -1;
}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  (
    { items, className, onClose, closeOnSelect = true, onKeyDown, ...rest },
    ref,
  ) => {
    // Normalize input: sectioned and flat shapes are unified into a single
    // flat list of items so downstream hooks operate on a consistent
    // ReadonlyArray<DropdownMenuItem>. The original `items` prop is the
    // dependency, not the derived `sections`/`flatItems` arrays.
    const flatItems = useMemo<ReadonlyArray<DropdownMenuItem>>(
      () =>
        isSectioned(items)
          ? flatten(items)
          : (items as ReadonlyArray<DropdownMenuItem>),
      [items],
    );

    const sections: ReadonlyArray<DropdownMenuSection> = isSectioned(items)
      ? items
      : [{ items: items as ReadonlyArray<DropdownMenuItem> }];

    const initialFocusIndex = useMemo(
      () => findFirstEnabled(flatItems),
      [flatItems],
    );

    const [focusedIndex, setFocusedIndex] = useState<number>(initialFocusIndex);

    // If items shrink/grow such that the focused index is now invalid, clamp it.
    useEffect(() => {
      if (focusedIndex >= flatItems.length || focusedIndex < 0) {
        setFocusedIndex(findFirstEnabled(flatItems));
        return;
      }
      if (flatItems[focusedIndex]?.disabled) {
        setFocusedIndex(findFirstEnabled(flatItems));
      }
    }, [flatItems, focusedIndex]);

    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const surfaceRef = useRef<HTMLDivElement | null>(null);

    // Forward our internal ref to the consumer's ref while keeping our own
    // handle on the DOM node for focus management.
    useImperativeHandle(ref, () => surfaceRef.current as HTMLDivElement, []);

    // Keep the refs array sized correctly across re-renders.
    if (itemRefs.current.length !== flatItems.length) {
      itemRefs.current = new Array(flatItems.length).fill(null);
    }

    // Focus the initial item when the menu mounts (or when the focusable
    // target changes because items changed). rAF ensures the DOM node
    // exists even when the menu is rendered conditionally inside a parent
    // and lets the focus land within one frame after mount.
    useEffect(() => {
      if (initialFocusIndex < 0) return;
      const handle = window.requestAnimationFrame(() => {
        itemRefs.current[initialFocusIndex]?.focus();
      });
      return () => window.cancelAnimationFrame(handle);
    }, [initialFocusIndex]);

    const focusIndex = useCallback((idx: number) => {
      setFocusedIndex(idx);
      itemRefs.current[idx]?.focus();
    }, []);

    const activate = useCallback(
      (idx: number) => {
        const item = flatItems[idx];
        if (!item || item.disabled) return;
        item.onSelect?.();
        if (closeOnSelect) onClose?.();
      },
      [flatItems, closeOnSelect, onClose],
    );

    const handleKeyDown = useCallback(
      (e: ReactKeyboardEvent<HTMLDivElement>) => {
        // Allow consumer-provided onKeyDown to run first; if it calls
        // preventDefault we treat the event as handled and bail out.
        onKeyDown?.(e);
        if (e.defaultPrevented) return;

        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            const next = findNextEnabled(flatItems, focusedIndex);
            if (next >= 0) focusIndex(next);
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            const prev = findPrevEnabled(flatItems, focusedIndex);
            if (prev >= 0) focusIndex(prev);
            break;
          }
          case "Home": {
            e.preventDefault();
            const first = findFirstEnabled(flatItems);
            if (first >= 0) focusIndex(first);
            break;
          }
          case "End": {
            e.preventDefault();
            const last = findLastEnabled(flatItems);
            if (last >= 0) focusIndex(last);
            break;
          }
          case "Enter":
          case " ": {
            e.preventDefault();
            activate(focusedIndex);
            break;
          }
          case "Escape": {
            e.preventDefault();
            onClose?.();
            break;
          }
          case "Tab": {
            // Let focus proceed naturally to the next/prev focusable element
            // outside the menu, but signal the consumer to unmount/close.
            onClose?.();
            break;
          }
          default:
            break;
        }
      },
      [activate, flatItems, focusIndex, focusedIndex, onClose, onKeyDown],
    );

    // Render — flat index counter is shared across sections so refs/tabIndex
    // remain stable regardless of how items are grouped.
    let flatIdx = 0;

    return (
      <div
        ref={surfaceRef}
        role="menu"
        className={cn(dropdownMenuRoot, className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {sections.map((section, sIdx) => (
          <Fragment key={sIdx}>
            {sIdx > 0 && (
              <div role="separator" className={dropdownMenuSeparator} />
            )}
            {section.items.map((item) => {
              const currentIdx = flatIdx;
              flatIdx += 1;
              const isFocused = currentIdx === focusedIndex;
              return (
                <button
                  key={item.key}
                  ref={(node) => {
                    itemRefs.current[currentIdx] = node;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={isFocused && !item.disabled ? 0 : -1}
                  disabled={item.disabled}
                  onClick={() => activate(currentIdx)}
                  onMouseEnter={() => {
                    if (!item.disabled) setFocusedIndex(currentIdx);
                  }}
                  className={dropdownMenuItemStyles({
                    danger: item.danger,
                    disabled: item.disabled,
                  })}
                >
                  {item.icon && <span aria-hidden="true">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    );
  },
);

DropdownMenu.displayName = "DropdownMenu";
