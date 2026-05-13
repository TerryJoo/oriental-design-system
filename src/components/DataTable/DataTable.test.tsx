import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable } from "./DataTable";

interface Row {
  rank: number;
  name: string;
  rate: string;
}

const ROWS: Row[] = [
  { rank: 1, name: "龍王", rate: "87%" },
  { rank: 2, name: "虎王", rate: "82%" },
];

describe("DataTable", () => {
  it("renders headers and rows", () => {
    render(
      <DataTable<Row>
        data={ROWS}
        columns={[
          { key: "rank", header: "순위", cell: (r) => r.rank },
          { key: "name", header: "기사", cell: (r) => r.name },
          { key: "rate", header: "승률", cell: (r) => r.rate },
        ]}
      />,
    );
    expect(screen.getByText("순위")).toBeInTheDocument();
    expect(screen.getByText("龍王")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
  });

  it("uses rowKey when provided", () => {
    const { container } = render(
      <DataTable<Row>
        data={ROWS}
        rowKey={(r) => r.name}
        columns={[{ key: "name", header: "기사", cell: (r) => r.name }]}
      />,
    );
    expect(container.querySelectorAll("tbody tr")).toHaveLength(2);
  });

  describe("Empty state", () => {
    const COLUMNS = [
      { key: "rank", header: "순위", cell: (r: Row) => r.rank },
      { key: "name", header: "기사", cell: (r: Row) => r.name },
    ];

    it("renders the default EmptyState when data is empty and emptyState is omitted", () => {
      render(<DataTable<Row> data={[]} columns={COLUMNS} />);
      // Default Korean copy comes from DataTable's resolved EmptyState slot.
      expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
      // The placeholder lives inside a single full-width cell that spans
      // every column.
      const cell = screen.getByTestId("datatable-empty");
      expect(cell.tagName).toBe("TD");
      expect(cell).toHaveAttribute("colspan", String(COLUMNS.length));
    });

    it("renders a custom emptyState ReactNode when provided", () => {
      render(
        <DataTable<Row>
          data={[]}
          columns={COLUMNS}
          emptyState={<span>커스텀 비어있음</span>}
        />,
      );
      expect(screen.getByText("커스텀 비어있음")).toBeInTheDocument();
      // Default copy must NOT be present when overridden.
      expect(screen.queryByText("데이터가 없습니다")).not.toBeInTheDocument();
    });

    it("respects emptyState={null} as an explicit suppression signal", () => {
      const { container } = render(
        <DataTable<Row> data={[]} columns={COLUMNS} emptyState={null} />,
      );
      // The placeholder cell still renders (so the table structure stays
      // intact), but the inner content is empty.
      const cell = container.querySelector(
        '[data-testid="datatable-empty"]',
      ) as HTMLElement;
      expect(cell).not.toBeNull();
      expect(cell.textContent).toBe("");
    });

    it("does not render the empty cell when data has rows", () => {
      render(<DataTable<Row> data={ROWS} columns={COLUMNS} />);
      expect(screen.queryByTestId("datatable-empty")).toBeNull();
      expect(screen.queryByText("데이터가 없습니다")).not.toBeInTheDocument();
    });
  });
});
