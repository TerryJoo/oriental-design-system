import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";

const ITEMS = [
  { label: "홈", href: "/" },
  { label: "보드", href: "/boards" },
  { label: "龍虎相搏" },
];

describe("Breadcrumb", () => {
  it("renders items with anchors except the last", () => {
    render(<Breadcrumb items={ITEMS} />);
    expect(screen.getByRole("link", { name: "홈" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.queryByRole("link", { name: "龍虎相搏" }),
    ).not.toBeInTheDocument();
  });

  it("marks the last item with aria-current=page", () => {
    render(<Breadcrumb items={ITEMS} />);
    expect(screen.getByText("龍虎相搏")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("supports a custom separator", () => {
    render(<Breadcrumb items={ITEMS} separator="›" />);
    expect(screen.getAllByText("›")).toHaveLength(2);
  });

  describe("overflow / ellipsis contract (Wave 5b2-C3)", () => {
    // Per-segment truncation locks: each crumb caps at 12rem and
    // clamps with `truncate`. Used together with the optional
    // `maxItems` collapse below.
    it("each crumb caps at max-w-[12rem] and truncates", () => {
      render(<Breadcrumb items={ITEMS} />);
      const home = screen.getByRole("link", { name: "홈" });
      expect(home.className).toContain("max-w-[12rem]");
      expect(home.className).toContain("truncate");
      const current = screen.getByText("龍虎相搏");
      expect(current.className).toContain("max-w-[12rem]");
      expect(current.className).toContain("truncate");
    });

    it("collapses the middle crumbs to a single … span when maxItems exceeds", () => {
      const longTrail = [
        { label: "홈", href: "/" },
        { label: "서재", href: "/library" },
        { label: "한문 고전", href: "/library/classics" },
        { label: "조선왕조실록", href: "/library/classics/sillok" },
        { label: "세종실록", href: "/library/classics/sillok/sejong" },
        { label: "권 제 102", href: "/library/classics/sillok/sejong/102" },
        { label: "龍虎相搏" },
      ];
      render(<Breadcrumb items={longTrail} maxItems={4} />);
      // First crumb is preserved (link to root).
      expect(screen.getByRole("link", { name: "홈" })).toBeInTheDocument();
      // Last two crumbs are preserved.
      expect(
        screen.getByRole("link", { name: "권 제 102" }),
      ).toBeInTheDocument();
      expect(screen.getByText("龍虎相搏")).toHaveAttribute(
        "aria-current",
        "page",
      );
      // Middle crumbs collapse to a single ellipsis span (no href, so
      // no link role).
      expect(screen.getByText("…")).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "한문 고전" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "세종실록" }),
      ).not.toBeInTheDocument();
    });

    it("does not collapse when maxItems is 0 (default)", () => {
      const longTrail = [
        { label: "홈", href: "/" },
        { label: "서재", href: "/library" },
        { label: "한문 고전", href: "/library/classics" },
        { label: "조선왕조실록", href: "/library/classics/sillok" },
        { label: "龍虎相搏" },
      ];
      render(<Breadcrumb items={longTrail} />);
      // Every crumb renders; no collapsed `…` appears.
      expect(screen.queryByText("…")).not.toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "한문 고전" }),
      ).toBeInTheDocument();
    });
  });
});
