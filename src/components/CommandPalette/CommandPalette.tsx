import {
  forwardRef,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  commandPaletteEmpty,
  commandPaletteInput,
  commandPaletteItemStyles,
  commandPaletteKbd,
  commandPaletteList,
  commandPaletteRoot,
} from "./CommandPalette.styles";

export interface CommandItem {
  key: string;
  label: ReactNode;
  /** Searchable text content for fuzzy matching. */
  searchText?: string;
  shortcut?: string;
  onSelect?: () => void;
}

export interface CommandPaletteProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: ReadonlyArray<CommandItem>;
  placeholder?: string;
  /** Initial selected item index. */
  defaultSelectedIndex?: number;
  emptyMessage?: ReactNode;
  className?: string;
  /**
   * Optional handler invoked when the user presses Escape inside the
   * palette. Consumers that want a closeable palette wire this to their
   * open-state setter; consumers that keep the palette always-mounted
   * simply omit this prop.
   */
  onClose?: () => void;
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      items,
      placeholder = "명령을 검색하거나 입력…",
      defaultSelectedIndex = 0,
      emptyMessage = "결과가 없습니다",
      className,
      onClose,
      ...rest
    },
    ref,
  ) => {
    const [query, setQuery] = useState("");
    const [selectedIdx, setSelectedIdx] = useState(defaultSelectedIndex);
    const baseId = useId();
    const listboxId = `${baseId}-listbox`;
    const optionId = (key: string) => `${listboxId}-option-${key}`;

    const filtered = useMemo(() => {
      if (!query) return items;
      const q = query.toLowerCase();
      return items.filter((item) => {
        const haystack = (item.searchText ?? "").toLowerCase();
        return haystack.includes(q);
      });
    }, [items, query]);

    const activeOption = filtered[selectedIdx];
    const activeDescendantId = activeOption ? optionId(activeOption.key) : "";

    const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        filtered[selectedIdx]?.onSelect?.();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    };

    const onContainerKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
      if (e.key === "Escape") {
        // Allow the input's own handler to claim the event first; the
        // container handler is a safety net for focus moved into the list.
        if (e.defaultPrevented) return;
        e.preventDefault();
        onClose?.();
      }
    };

    const hasResults = filtered.length > 0;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-label="명령 팔레트"
        className={cn(commandPaletteRoot, className)}
        onKeyDown={onContainerKeyDown}
        {...rest}
      >
        <input
          type="text"
          autoFocus
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIdx(0);
          }}
          onKeyDown={onKeyDown}
          className={commandPaletteInput}
          aria-label="검색"
          role="combobox"
          aria-controls={listboxId}
          // Per WAI-ARIA combobox+listbox: a listbox with zero options is
          // not a valid listbox (aria-required-children violation). When
          // there are no matches, expose the result region as a polite
          // live status instead and report `aria-expanded="false"`.
          aria-expanded={hasResults}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendantId || undefined}
        />
        {hasResults ? (
          <div id={listboxId} role="listbox" className={commandPaletteList}>
            {filtered.map((item, idx) => (
              <div
                key={item.key}
                id={optionId(item.key)}
                role="option"
                aria-selected={idx === selectedIdx}
                onMouseEnter={() => setSelectedIdx(idx)}
                onClick={item.onSelect}
                className={commandPaletteItemStyles({
                  selected: idx === selectedIdx,
                })}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className={commandPaletteKbd}>{item.shortcut}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            id={listboxId}
            role="status"
            aria-live="polite"
            className={cn(commandPaletteList, commandPaletteEmpty)}
          >
            {emptyMessage}
          </div>
        )}
      </div>
    );
  },
);

CommandPalette.displayName = "CommandPalette";
