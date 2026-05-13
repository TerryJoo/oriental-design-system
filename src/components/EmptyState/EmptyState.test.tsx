import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState title="비어 있어요" description="아직 데이터가 없습니다" />,
    );
    expect(screen.getByText("비어 있어요")).toBeInTheDocument();
    expect(screen.getByText("아직 데이터가 없습니다")).toBeInTheDocument();
  });

  it("renders icon", () => {
    render(<EmptyState icon="🎐" title="x" />);
    expect(screen.getByText("🎐")).toBeInTheDocument();
  });

  it("renders actions", () => {
    render(<EmptyState actions={<button>새로 만들기</button>} />);
    expect(screen.getByText("새로 만들기")).toBeInTheDocument();
  });
});
