import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert";
import { alertIntents, type AlertIntent } from "./Alert.styles";

describe("Alert", () => {
  it("renders with role=alert", () => {
    render(<Alert>알림</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders title and message", () => {
    render(<Alert title="제목">본문</Alert>);
    expect(screen.getByText("제목")).toBeInTheDocument();
    expect(screen.getByText("본문")).toBeInTheDocument();
  });

  describe("Intents", () => {
    (["info", "success", "warning", "error"] as const).forEach(
      (intent: AlertIntent) => {
        it(`applies ${intent} intent classes`, () => {
          render(
            <Alert intent={intent} data-testid="a" title="t">
              x
            </Alert>,
          );
          alertIntents[intent].wrap.split(" ").forEach((cls) => {
            expect(screen.getByTestId("a").className).toContain(cls);
          });
        });
      },
    );
  });

  it("supports a custom icon", () => {
    render(<Alert icon="🎐">메시지</Alert>);
    expect(screen.getByText("🎐")).toBeInTheDocument();
  });

  describe("Accessibility", () => {
    it("marks the default icon as aria-hidden (decorative glyph)", () => {
      render(
        <Alert intent="info" data-testid="a">
          x
        </Alert>,
      );
      const iconSpan = screen.getByTestId("a").firstElementChild;
      expect(iconSpan).not.toBeNull();
      expect(iconSpan).toHaveAttribute("aria-hidden", "true");
    });

    it("does NOT apply aria-hidden when a custom icon is provided", () => {
      // A consumer-provided icon may contain interactive content (e.g. a
      // close button in the Dismissible pattern). axe's `aria-hidden-focus`
      // rule forbids aria-hidden ancestors of focusable descendants, so the
      // wrapper must drop aria-hidden when `icon` is set.
      render(
        <Alert
          intent="warning"
          data-testid="a"
          icon={
            <button type="button" aria-label="닫기">
              ×
            </button>
          }
        >
          body
        </Alert>,
      );
      const iconSpan = screen.getByTestId("a").firstElementChild;
      expect(iconSpan).not.toBeNull();
      expect(iconSpan).not.toHaveAttribute("aria-hidden");
      // The interactive close button must be reachable to assistive tech.
      expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
    });
  });
});
