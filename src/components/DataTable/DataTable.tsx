import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/EmptyState";
import {
  dataTableEmptyCell,
  dataTableRoot,
  dataTableRow,
  dataTableTd,
  dataTableTh,
  dataTableThead,
} from "./DataTable.styles";

export interface DataTableColumn<T> {
  /** Column key — must be unique. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** Renderer for the cell. */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** Optional custom alignment. */
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> extends HTMLAttributes<HTMLTableElement> {
  data: ReadonlyArray<T>;
  columns: ReadonlyArray<DataTableColumn<T>>;
  /** Optional row key extractor. Defaults to index. */
  rowKey?: (row: T, index: number) => string | number;
  /** Caption announced to screen readers. */
  caption?: ReactNode;
  /**
   * Custom empty-state slot rendered inside the `<tbody>` (as a single
   * full-width cell) when `data.length === 0`. Defaults to an
   * `<EmptyState>` with a Korean "데이터가 없습니다" message — pass any
   * `ReactNode` to override (e.g. a localised message, an action button,
   * or `null` to render an empty `<tbody>` like the original behaviour).
   */
  emptyState?: ReactNode;
  className?: string;
}

const ALIGN: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-start",
  center: "text-center",
  right: "text-end",
};

function DataTableInner<T>(
  {
    data,
    columns,
    rowKey,
    caption,
    emptyState,
    className,
    ...rest
  }: DataTableProps<T>,
  ref: Ref<HTMLTableElement>,
) {
  // Resolve empty-state content. `undefined` (the default) → render a
  // canonical `<EmptyState>` with a Korean default message. Any other
  // value (including `null`) is honoured as-is so consumers can suppress
  // or fully customise the placeholder.
  const isEmpty = data.length === 0;
  const empty =
    emptyState === undefined ? (
      <EmptyState
        title="데이터가 없습니다"
        description="표시할 행이 없습니다. 필터를 조정하거나 새 항목을 추가해 보세요."
      />
    ) : (
      emptyState
    );

  return (
    <table ref={ref} className={cn(dataTableRoot, className)} {...rest}>
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead className={dataTableThead}>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              scope="col"
              className={cn(dataTableTh, col.align && ALIGN[col.align])}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isEmpty ? (
          <tr>
            <td
              colSpan={columns.length || 1}
              className={dataTableEmptyCell}
              data-testid="datatable-empty"
            >
              {empty}
            </td>
          </tr>
        ) : (
          data.map((row, rIdx) => (
            <tr
              key={rowKey ? rowKey(row, rIdx) : rIdx}
              className={dataTableRow}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(dataTableTd, col.align && ALIGN[col.align])}
                >
                  {col.cell(row, rIdx)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export const DataTable = forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & { ref?: Ref<HTMLTableElement> },
) => ReturnType<typeof DataTableInner>;

(DataTable as unknown as { displayName?: string }).displayName = "DataTable";
