import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Filter } from "./Filter";
import { filterChipCountStyles, filterChipStyles } from "./Filter.styles";

const OPTS = [
  { value: "all", label: "전체", count: 32 },
  { value: "open", label: "진행중", count: 12 },
  { value: "done", label: "완료", count: 20 },
];

describe("Filter", () => {
  it("renders chips and reports clicks", () => {
    const onChange = vi.fn();
    render(<Filter options={OPTS} value="all" onChange={onChange} />);
    fireEvent.click(screen.getByText("진행중"));
    expect(onChange).toHaveBeenCalledWith("open");
  });

  it("marks active chip with aria-pressed=true", () => {
    render(<Filter options={OPTS} value="open" />);
    expect(screen.getByText("진행중").closest("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("renders count badge", () => {
    render(<Filter options={OPTS} defaultValue="all" />);
    expect(screen.getByText("32")).toBeInTheDocument();
  });

  describe("a11y wiring", () => {
    it("provides a default accessible name on the group role", () => {
      render(<Filter options={OPTS} defaultValue="all" data-testid="filter" />);
      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-label", "Filter options");
    });

    it("respects a consumer-supplied aria-label", () => {
      render(
        <Filter options={OPTS} defaultValue="all" aria-label="Status filter" />,
      );
      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-label", "Status filter");
    });

    it("respects aria-labelledby and does not synthesize aria-label", () => {
      render(
        <>
          <span id="filter-label">My filters</span>
          <Filter
            options={OPTS}
            defaultValue="all"
            aria-labelledby="filter-label"
          />
        </>,
      );
      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-labelledby", "filter-label");
      expect(group).not.toHaveAttribute("aria-label");
    });

    it("renders each chip as a toggle button with aria-pressed", () => {
      render(<Filter options={OPTS} value="open" />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(OPTS.length);
      buttons.forEach((b) => {
        expect(b).toHaveAttribute("aria-pressed");
        expect(b).toHaveAttribute("type", "button");
      });
    });

    it("count badge is exposed to AT (not aria-hidden) so SR users hear it", () => {
      render(<Filter options={OPTS} defaultValue="all" />);
      const count = screen.getByText("32");
      expect(count).not.toHaveAttribute("aria-hidden");
    });
  });

  describe("style helpers", () => {
    it("active count drops opacity-70 to keep WCAG AA contrast", () => {
      const cls = filterChipCountStyles({ active: true });
      // The fix replaces opacity-70 (which dropped active count below AA)
      // with text-inherit, so the count rides the chip's accessible color.
      expect(cls).not.toContain("opacity-70");
      expect(cls).toContain("text-inherit");
    });

    it("inactive count uses era-muted token, not raw opacity", () => {
      const cls = filterChipCountStyles({ active: false });
      expect(cls).not.toContain("opacity-70");
      expect(cls).toContain("text-era-muted");
    });

    it("active chip overrides text color in Neon era for AA contrast", () => {
      const cls = filterChipStyles({ active: true });
      // Heritage path keeps text-era-inverse (cream on terracotta).
      expect(cls).toContain("text-era-inverse");
      // Neon: era-ink-inverse is near-black and era-ink-primary nets ~4.28:1
      // on accent-600 (under AA). Pure white clears 4.5:1.
      expect(cls).toContain("[[data-era=neon]_&]:text-white");
    });
  });
});
