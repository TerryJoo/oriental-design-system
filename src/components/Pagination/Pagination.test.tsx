import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("renders prev/next plus pages", () => {
    render(<Pagination page={2} totalPages={5} />);
    expect(screen.getByLabelText("이전")).toBeInTheDocument();
    expect(screen.getByLabelText("다음")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
  });

  it("disables prev on page 1", () => {
    render(<Pagination page={1} totalPages={5} />);
    expect(screen.getByLabelText("이전")).toBeDisabled();
  });

  it("calls onChange when clicking a page", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("renders ellipsis when there are many pages", () => {
    render(<Pagination page={5} totalPages={20} />);
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });

  it("marks current page with aria-current=page", () => {
    render(<Pagination page={3} totalPages={5} />);
    expect(screen.getByRole("button", { name: "3" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders every button with native disabled when disabled=true", () => {
    render(<Pagination page={3} totalPages={5} disabled />);
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });

  it("does not call onChange when clicking a page button while disabled", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  describe("overflow / ellipsis contract (Wave 5b2-C3)", () => {
    // Stable button width across page numerals 1 → 9999. Earlier
    // `min-w-[32px]` allowed the button to grow with digit count,
    // making the row reflow as the active page advanced from "9" to
    // "10" to "100". Lock the regression: page buttons share a 2.25rem
    // minimum width and tabular-nums for column alignment.
    it("page buttons render with min-w-[2.25rem] and tabular-nums", () => {
      render(<Pagination page={500} totalPages={1000} />);
      const page1 = screen.getByRole("button", { name: "1" });
      expect(page1.className).toContain("min-w-[2.25rem]");
      expect(page1.className).toContain("tabular-nums");
      // The same contract applies to a 4-digit numeric chip — the row
      // must not reflow when the active number is "1000".
      const lastPage = screen.getByRole("button", { name: "1000" });
      expect(lastPage.className).toContain("min-w-[2.25rem]");
      expect(lastPage.className).toContain("tabular-nums");
    });
  });
});
