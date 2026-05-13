/**
 * Reduced-motion convention guard.
 *
 * The project rule (CLAUDE.md, Conventions Discovered) is that every
 * keyframe-driven entry animation, transform-based motion, and
 * geometry-changing transition must be gated behind Tailwind's
 * `motion-safe:` variant so users with `prefers-reduced-motion: reduce`
 * (and the Storybook Motion toolbar override) get a static UI.
 *
 * This file is intentionally a *single* centralized guard. Component
 * tests assert their own structural class set; here we sample three
 * representative components — one keyframe (Spinner), one keyframe-on-
 * conditional (Toast), one entry animation pair (Modal) — and assert
 * the rendered DOM exposes a `motion-safe:`-prefixed class for the
 * relevant motion utility. Adding a new motion component? Append a
 * case below rather than spreading the assertion across feature
 * tests.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../components/Spinner";
import { Toast } from "../components/Toast";
import { Modal } from "../components/Modal";

describe("Reduced-motion convention", () => {
  it("Spinner gates its rotating animation behind motion-safe:", () => {
    render(<Spinner data-testid="spinner" />);
    const root = screen.getByTestId("spinner");
    expect(root.className).toMatch(/motion-safe:animate-spin/);
  });

  it("Toast gates its entry keyframe behind motion-safe:", () => {
    render(<Toast data-testid="toast">알림</Toast>);
    const root = screen.getByTestId("toast");
    expect(root.className).toMatch(/motion-safe:animate-\[toast-enter/);
  });

  it("Modal gates its backdrop/panel entry animations behind motion-safe:", () => {
    render(
      <Modal open title="제목">
        body
      </Modal>,
    );
    // The rendered dialog is the panel; its parent is the backdrop.
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toMatch(/motion-safe:animate-scale-in/);
    const backdrop = dialog.parentElement;
    expect(backdrop).not.toBeNull();
    expect(backdrop!.className).toMatch(/motion-safe:animate-fade-in/);
  });
});
