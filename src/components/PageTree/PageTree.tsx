import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { useDir } from "@/utils/useDir";
import { EmptyState } from "@/components/EmptyState";
import {
  pageTreeCaret,
  pageTreeCaretOpen,
  pageTreeChildren,
  pageTreeEmptyWrap,
  pageTreeNode,
  pageTreeNodeActive,
  pageTreeRoot,
} from "./PageTree.styles";

export interface PageTreeNodeData {
  /** Unique value used for selection. */
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  children?: ReadonlyArray<PageTreeNodeData>;
  /** Whether children are expanded by default. */
  defaultOpen?: boolean;
}

export interface PageTreeProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  nodes: ReadonlyArray<PageTreeNodeData>;
  /** Currently selected node value. */
  value?: string;
  onChange?: (value: string) => void;
  /**
   * Slot rendered when `nodes.length === 0`. Defaults to an
   * `<EmptyState>` with Korean copy. Pass any `ReactNode` to override or
   * `null` to render an empty `role="tree"` container.
   */
  emptyState?: ReactNode;
  className?: string;
}

/**
 * A flattened, ordered descriptor for one visible row in the tree.
 *
 * "Visible" means the node would be rendered given the current open/closed
 * state of its ancestors — collapsed branches contribute nothing.
 *
 * The shape is what the keyboard handler needs to do roving navigation,
 * expand/collapse, and parent jumps without re-traversing the source tree
 * on every keystroke.
 */
interface FlatNode {
  value: string;
  parentValue: string | null;
  hasChildren: boolean;
  open: boolean;
  /** Indices in the flat list whose `parentValue === this.value`. Empty for
   *  leaves or for collapsed parents (children are not visible). */
  childIndices: number[];
}

/**
 * Walks the source tree in depth-first order and produces only the rows that
 * would currently be rendered. Children of a closed parent are skipped.
 */
function flattenVisible(
  nodes: ReadonlyArray<PageTreeNodeData>,
  openMap: Record<string, boolean>,
  defaultOpenMap: Record<string, boolean>,
): FlatNode[] {
  const out: FlatNode[] = [];

  const walk = (
    list: ReadonlyArray<PageTreeNodeData>,
    parentValue: string | null,
  ) => {
    for (const n of list) {
      const hasChildren = (n.children?.length ?? 0) > 0;
      const isOpen = hasChildren
        ? (openMap[n.value] ?? defaultOpenMap[n.value] ?? false)
        : false;

      const flat: FlatNode = {
        value: n.value,
        parentValue,
        hasChildren,
        open: isOpen,
        childIndices: [],
      };
      const idx = out.push(flat) - 1;

      if (hasChildren && isOpen) {
        const startLen = out.length;
        walk(n.children!, n.value);
        // Capture the indices of direct children that ended up in the flat
        // list. Direct children are those whose parentValue matches n.value
        // and whose index is >= startLen (we just pushed them).
        for (let i = startLen; i < out.length; i++) {
          if (out[i]!.parentValue === n.value) {
            out[idx]!.childIndices.push(i);
          }
        }
      }
    }
  };

  walk(nodes, null);
  return out;
}

/**
 * Crawls the source tree to collect which nodes ship with `defaultOpen: true`.
 * Memoised at the root so we only do this when the `nodes` prop changes.
 */
function collectDefaultOpen(
  nodes: ReadonlyArray<PageTreeNodeData>,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  const walk = (list: ReadonlyArray<PageTreeNodeData>) => {
    for (const n of list) {
      if (n.defaultOpen) out[n.value] = true;
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

interface NodeProps {
  node: PageTreeNodeData;
  value?: string;
  onSelect: (v: string) => void;
  isOpen: (v: string) => boolean;
  setOpen: (v: string, open: boolean) => void;
  tabbableValue: string | null;
  registerRef: (v: string, el: HTMLDivElement | null) => void;
  onItemKeyDown: (e: KeyboardEvent<HTMLDivElement>, v: string) => void;
}

function TreeNode({
  node,
  value,
  onSelect,
  isOpen,
  setOpen,
  tabbableValue,
  registerRef,
  onItemKeyDown,
}: NodeProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const open = hasChildren ? isOpen(node.value) : false;
  const active = value === node.value;
  const tabbable = tabbableValue === node.value;

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? open : undefined}
      aria-selected={active}
    >
      <div
        ref={(el) => registerRef(node.value, el)}
        className={cn(
          pageTreeNode,
          active && pageTreeNodeActive,
          "outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60",
        )}
        tabIndex={tabbable ? 0 : -1}
        onClick={() => {
          if (hasChildren) setOpen(node.value, !open);
          onSelect(node.value);
        }}
        onKeyDown={(e) => onItemKeyDown(e, node.value)}
      >
        {hasChildren ? (
          <span
            aria-hidden="true"
            className={cn(pageTreeCaret, open && pageTreeCaretOpen)}
          >
            ▶
          </span>
        ) : (
          <span aria-hidden="true" className={pageTreeCaret} />
        )}
        {node.icon && <span aria-hidden="true">{node.icon}</span>}
        <span>{node.label}</span>
      </div>
      {hasChildren && open && (
        <div role="group" className={pageTreeChildren}>
          {node.children!.map((child) => (
            <TreeNode
              key={child.value}
              node={child}
              value={value}
              onSelect={onSelect}
              isOpen={isOpen}
              setOpen={setOpen}
              tabbableValue={tabbableValue}
              registerRef={registerRef}
              onItemKeyDown={onItemKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const PageTree = forwardRef<HTMLDivElement, PageTreeProps>(
  ({ nodes, value, onChange, emptyState, className, ...rest }, ref) => {
    const dir = useDir();
    // Centralized open/closed map — lifted out of TreeNode so the keyboard
    // handler can flip ancestors and the flat-list builder can know which
    // children are visible.
    const defaultOpenMap = useMemo(() => collectDefaultOpen(nodes), [nodes]);
    const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

    // Item DOM refs keyed by value, used for programmatic focus on roving.
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const registerRef = useCallback((v: string, el: HTMLDivElement | null) => {
      if (el) itemRefs.current[v] = el;
      else delete itemRefs.current[v];
    }, []);

    // The single roving-tabbable item. Defaults to the selected value if it
    // is currently in the tree, otherwise the first visible item.
    const flat = useMemo(
      () => flattenVisible(nodes, openMap, defaultOpenMap),
      [nodes, openMap, defaultOpenMap],
    );

    const initialTabbable = useMemo(() => {
      if (value && flat.some((f) => f.value === value)) return value;
      return flat[0]?.value ?? null;
    }, [flat, value]);

    const [tabbableValue, setTabbableValue] = useState<string | null>(
      initialTabbable,
    );

    // Keep tabbableValue valid: if the current one is no longer visible
    // (e.g. its parent was collapsed), fall back to the selected value or
    // the first visible item.
    useEffect(() => {
      if (tabbableValue && flat.some((f) => f.value === tabbableValue)) return;
      setTabbableValue(initialTabbable);
    }, [flat, initialTabbable, tabbableValue]);

    const isOpen = useCallback(
      (v: string) => openMap[v] ?? defaultOpenMap[v] ?? false,
      [openMap, defaultOpenMap],
    );

    const setOpen = useCallback((v: string, open: boolean) => {
      setOpenMap((prev) => ({ ...prev, [v]: open }));
    }, []);

    const handleSelect = useCallback(
      (v: string) => {
        onChange?.(v);
      },
      [onChange],
    );

    const focusItem = useCallback((v: string) => {
      setTabbableValue(v);
      // Wait a tick so newly-revealed items have mounted before focus().
      // (Synchronous focus works for already-mounted items; the rAF guards
      // the expand-then-focus-into-first-child path.)
      requestAnimationFrame(() => {
        const el = itemRefs.current[v];
        el?.focus();
      });
    }, []);

    const handleItemKeyDown = useCallback(
      (e: KeyboardEvent<HTMLDivElement>, current: string) => {
        const idx = flat.findIndex((f) => f.value === current);
        if (idx === -1) return;
        const node = flat[idx]!;

        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            const next = flat[idx + 1];
            if (next) focusItem(next.value);
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            const prev = flat[idx - 1];
            if (prev) focusItem(prev.value);
            break;
          }
          case "ArrowRight":
          case "ArrowLeft": {
            e.preventDefault();
            // Logical direction: ArrowRight always means "expand / dive in",
            // ArrowLeft always means "collapse / surface up", regardless of
            // physical layout. Under `dir="rtl"` the inline-end side is the
            // physical left, so we swap the two key handlers.
            const isExpandKey =
              dir === "rtl" ? e.key === "ArrowLeft" : e.key === "ArrowRight";
            if (isExpandKey) {
              if (node.hasChildren && !node.open) {
                setOpen(current, true);
              } else if (node.hasChildren && node.open) {
                // Move focus to first child (next item is always the first
                // child when the parent is open in DFS flat order).
                const next = flat[idx + 1];
                if (next && next.parentValue === current) focusItem(next.value);
              }
            } else if (node.hasChildren && node.open) {
              setOpen(current, false);
            } else if (node.parentValue) {
              focusItem(node.parentValue);
            }
            break;
          }
          case "Home": {
            e.preventDefault();
            const first = flat[0];
            if (first) focusItem(first.value);
            break;
          }
          case "End": {
            e.preventDefault();
            const last = flat[flat.length - 1];
            if (last) focusItem(last.value);
            break;
          }
          case "Enter":
          case " ": {
            e.preventDefault();
            handleSelect(current);
            break;
          }
          default:
            break;
        }
      },
      [flat, focusItem, handleSelect, setOpen, dir],
    );

    // Empty-state branch: when no nodes exist, render the slot in place
    // of the tree. We keep `role="tree"` off the wrapper because an empty
    // tree has no `treeitem` children, which would violate
    // `aria-required-children`. Consumers needing semantics can wrap the
    // result in their own landmark.
    if (nodes.length === 0) {
      const empty =
        emptyState === undefined ? (
          <EmptyState
            title="페이지가 없습니다"
            description="첫 페이지를 추가하면 여기에서 탐색할 수 있습니다."
          />
        ) : (
          emptyState
        );
      return (
        <div
          ref={ref}
          className={cn(pageTreeEmptyWrap, className)}
          data-testid="pagetree-empty"
          {...rest}
        >
          {empty}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="tree"
        className={cn(pageTreeRoot, className)}
        {...rest}
      >
        {nodes.map((node) => (
          <TreeNode
            key={node.value}
            node={node}
            value={value}
            onSelect={handleSelect}
            isOpen={isOpen}
            setOpen={setOpen}
            tabbableValue={tabbableValue}
            registerRef={registerRef}
            onItemKeyDown={handleItemKeyDown}
          />
        ))}
      </div>
    );
  },
);

PageTree.displayName = "PageTree";
