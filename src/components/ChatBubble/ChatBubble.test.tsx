import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatBubble, ChatThread } from "./ChatBubble";

describe("ChatBubble", () => {
  it("renders ai bubble by default", () => {
    render(<ChatBubble>안녕</ChatBubble>);
    expect(screen.getByText("안녕")).toBeInTheDocument();
    expect(screen.getByText("안녕")).toHaveAttribute("data-author", "ai");
  });

  it("renders me bubble when author=me", () => {
    render(<ChatBubble author="me">나의 메시지</ChatBubble>);
    expect(screen.getByText("나의 메시지")).toHaveAttribute(
      "data-author",
      "me",
    );
  });

  it("renders meta line when provided", () => {
    render(<ChatBubble meta="방금">x</ChatBubble>);
    expect(screen.getByText("방금")).toBeInTheDocument();
  });

  it("ChatThread groups multiple bubbles", () => {
    render(
      <ChatThread>
        <ChatBubble>A</ChatBubble>
        <ChatBubble author="me">B</ChatBubble>
      </ChatThread>,
    );
    expect(screen.getByRole("log")).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(2);
  });

  // Wave 5b2-Round3: pin the AA contrast contract for the `me` bubble.
  // Heritage uses `text-era-inverse` (cream on terracotta, 5.91:1) and
  // Neon overrides to literal white (5.22:1 on accent-600 indigo). The
  // previous `text-era-primary` Neon override was 4.44:1 — fails AA 4.5:1.
  it("me bubble pins AA-compliant ink in both eras", () => {
    render(<ChatBubble author="me">대비 검증</ChatBubble>);
    const bubble = screen.getByText("대비 검증");
    // Heritage default: era-inverse on accent-600.
    expect(bubble.className).toContain("text-era-inverse");
    // Neon override: literal white (Tailwind `text-white`) under
    // `[data-era=neon]` ancestors.
    expect(bubble.className).toContain("[[data-era=neon]_&]:text-white");
    // Sanity: the broken token is no longer used as the Neon override.
    expect(bubble.className).not.toContain(
      "[[data-era=neon]_&]:text-era-primary",
    );
  });

  // The `ai` bubble's ink/surface pair has always passed AA, but pin it so
  // future surface-token edits don't regress the contract.
  it("ai bubble keeps era-primary ink on era-sunken surface", () => {
    render(<ChatBubble>대비 검증</ChatBubble>);
    const bubble = screen.getByText("대비 검증");
    expect(bubble.className).toContain("text-era-primary");
    expect(bubble.className).toContain("bg-era-sunken");
  });
});
