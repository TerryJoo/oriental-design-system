import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Accordion } from "./Accordion";

const ITEMS = [
  { value: "rules", title: "규칙", content: "규칙 내용", defaultOpen: true },
  { value: "win", title: "승리 조건", content: "승리 내용" },
];

describe("Accordion", () => {
  it("renders all titles", () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.getByText("규칙")).toBeInTheDocument();
    expect(screen.getByText("승리 조건")).toBeInTheDocument();
  });

  it("opens default-open items", () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.getByText("규칙").closest("button")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("toggles on click", () => {
    const onChange = vi.fn();
    render(<Accordion items={ITEMS} onChange={onChange} />);
    fireEvent.click(screen.getByText("승리 조건"));
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByText("승리 조건").closest("button")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("respects multiple=false", () => {
    render(<Accordion items={ITEMS} multiple={false} />);
    fireEvent.click(screen.getByText("승리 조건"));
    expect(screen.getByText("규칙").closest("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("wires aria-controls on trigger to the matching panel id", () => {
    render(<Accordion items={ITEMS} />);
    const rulesTrigger = screen.getByText("규칙").closest("button")!;
    const controls = rulesTrigger.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    const panel = document.getElementById(controls!);
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("role", "region");
  });

  it("wires aria-labelledby on panel to the matching trigger id", () => {
    render(<Accordion items={ITEMS} />);
    const rulesTrigger = screen.getByText("규칙").closest("button")!;
    const triggerId = rulesTrigger.id;
    expect(triggerId).toBeTruthy();
    const panel = document.getElementById(
      rulesTrigger.getAttribute("aria-controls")!,
    )!;
    expect(panel).toHaveAttribute("aria-labelledby", triggerId);
  });

  it("hides the panel of a closed item from the a11y tree", () => {
    render(<Accordion items={ITEMS} />);
    const winTrigger = screen.getByText("승리 조건").closest("button")!;
    const winPanel = document.getElementById(
      winTrigger.getAttribute("aria-controls")!,
    )!;
    expect(winPanel).toHaveAttribute("hidden");

    // Open default-open "rules" — panel must NOT be hidden.
    const rulesTrigger = screen.getByText("규칙").closest("button")!;
    const rulesPanel = document.getElementById(
      rulesTrigger.getAttribute("aria-controls")!,
    )!;
    expect(rulesPanel).not.toHaveAttribute("hidden");
  });

  it("toggles hidden when an item opens or closes", () => {
    render(<Accordion items={ITEMS} />);
    const winTrigger = screen.getByText("승리 조건").closest("button")!;
    const winPanel = document.getElementById(
      winTrigger.getAttribute("aria-controls")!,
    )!;
    expect(winPanel).toHaveAttribute("hidden");
    fireEvent.click(winTrigger);
    expect(winPanel).not.toHaveAttribute("hidden");
    fireEvent.click(winTrigger);
    expect(winPanel).toHaveAttribute("hidden");
  });

  it("generates unique trigger and panel ids across items", () => {
    render(<Accordion items={ITEMS} />);
    const rulesTrigger = screen.getByText("규칙").closest("button")!;
    const winTrigger = screen.getByText("승리 조건").closest("button")!;
    expect(rulesTrigger.id).toBeTruthy();
    expect(winTrigger.id).toBeTruthy();
    expect(rulesTrigger.id).not.toBe(winTrigger.id);
    expect(rulesTrigger.getAttribute("aria-controls")).not.toBe(
      winTrigger.getAttribute("aria-controls"),
    );
  });

  it("generates unique ids across multiple accordions on the same page", () => {
    render(
      <>
        <Accordion items={ITEMS} />
        <Accordion items={ITEMS} />
      </>,
    );
    const triggers = screen.getAllByRole("button");
    const ids = triggers.map((t) => t.id);
    const controls = triggers.map((t) => t.getAttribute("aria-controls"));
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(controls).size).toBe(controls.length);
  });
});
