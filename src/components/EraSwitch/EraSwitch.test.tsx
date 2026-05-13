import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EraSwitch } from "./EraSwitch";

describe("EraSwitch", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-era");
  });

  describe("Rendering", () => {
    it("renders heritage and neon tabs", () => {
      render(<EraSwitch />);
      expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
        /heritage/i,
      );
      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("supports a custom defaultEra", () => {
      render(<EraSwitch defaultEra="neon" />);
      expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
        /neon/i,
      );
    });

    it("accepts custom labels", () => {
      render(<EraSwitch labels={{ heritage: "옛", neon: "지금" }} />);
      expect(screen.getByText("옛")).toBeInTheDocument();
      expect(screen.getByText("지금")).toBeInTheDocument();
    });
  });

  describe("Controlled mode", () => {
    it("respects the era prop", () => {
      render(<EraSwitch era="neon" />);
      expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
        /neon/i,
      );
    });

    it("calls onEraChange when selecting", () => {
      const handler = vi.fn();
      render(<EraSwitch era="heritage" onEraChange={handler} />);
      fireEvent.click(screen.getByRole("tab", { name: /neon/i }));
      expect(handler).toHaveBeenCalledWith("neon");
    });

    it("does not change selection when clicking the active tab", () => {
      const handler = vi.fn();
      render(<EraSwitch era="heritage" onEraChange={handler} />);
      fireEvent.click(screen.getByRole("tab", { name: /heritage/i }));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("Uncontrolled mode", () => {
    it("toggles internal era when clicked", () => {
      render(<EraSwitch />);
      fireEvent.click(screen.getByRole("tab", { name: /neon/i }));
      expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
        /neon/i,
      );
    });

    it("applies the era to document.documentElement by default", () => {
      render(<EraSwitch />);
      fireEvent.click(screen.getByRole("tab", { name: /neon/i }));
      expect(document.documentElement.dataset.era).toBe("neon");
    });

    it("does not touch documentElement when applyToDocument=false", () => {
      render(<EraSwitch applyToDocument={false} />);
      fireEvent.click(screen.getByRole("tab", { name: /neon/i }));
      expect(document.documentElement.dataset.era).toBeUndefined();
    });
  });

  describe("Accessibility", () => {
    it("has a tablist role with localized aria-label", () => {
      render(<EraSwitch />);
      expect(screen.getByRole("tablist")).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Era switch"),
      );
    });

    it("marks the active tab with aria-selected", () => {
      render(<EraSwitch defaultEra="neon" />);
      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });
  });
});
