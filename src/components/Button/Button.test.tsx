import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import {
  buttonVariants,
  buttonDisabledVariants,
  buttonSizes,
  buttonShapes,
} from "./Button.styles";

describe("Button Component", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole("button", { name: /click me/i }),
      ).toBeInTheDocument();
    });

    it("should render children correctly", () => {
      render(<Button>Submit Form</Button>);
      expect(screen.getByText("Submit Form")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<Button className="custom-class">Test</Button>);
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });
  });

  describe("Variants", () => {
    it("should render primary variant by default", () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole("button");
      buttonVariants.primary.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should render secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      buttonVariants.secondary.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should render ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      buttonVariants.ghost.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should render seal variant (낙관)", () => {
      render(<Button variant="seal">印</Button>);
      const button = screen.getByRole("button");
      buttonVariants.seal.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should render danger variant", () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole("button");
      buttonVariants.danger.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      buttonSizes.sm.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should render medium size by default", () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole("button");
      buttonSizes.md.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should render large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      buttonSizes.lg.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });
  });

  describe("Shapes", () => {
    it("should render rounded shape by default", () => {
      render(<Button>Rounded</Button>);
      expect(screen.getByRole("button")).toHaveClass(buttonShapes.rounded);
    });

    it("should render pill shape", () => {
      render(<Button shape="pill">Pill</Button>);
      expect(screen.getByRole("button")).toHaveClass(buttonShapes.pill);
    });
  });

  describe("Icons", () => {
    it("should render left icon", () => {
      render(
        <Button leftIcon={<svg data-testid="left-svg" />}>With Icon</Button>,
      );
      expect(screen.getByTestId("button-left-icon")).toBeInTheDocument();
      expect(screen.getByTestId("left-svg")).toBeInTheDocument();
    });

    it("should render right icon", () => {
      render(
        <Button rightIcon={<svg data-testid="right-svg" />}>With Icon</Button>,
      );
      expect(screen.getByTestId("button-right-icon")).toBeInTheDocument();
    });

    it("should render both icons", () => {
      render(
        <Button
          leftIcon={<svg data-testid="left-svg" />}
          rightIcon={<svg data-testid="right-svg" />}
        >
          Both
        </Button>,
      );
      expect(screen.getByTestId("button-left-icon")).toBeInTheDocument();
      expect(screen.getByTestId("button-right-icon")).toBeInTheDocument();
    });

    it("should adjust padding when left icon is present", () => {
      render(
        <Button leftIcon={<svg />} size="md">
          Icon
        </Button>,
      );
      expect(screen.getByRole("button")).toHaveClass("pl-[18px]");
    });

    it("should adjust padding when right icon is present", () => {
      render(
        <Button rightIcon={<svg />} size="md">
          Icon
        </Button>,
      );
      expect(screen.getByRole("button")).toHaveClass("pr-[18px]");
    });
  });

  describe("States", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("cursor-not-allowed");
    });

    it("should apply disabled colors for primary variant", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      buttonDisabledVariants.primary.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should apply disabled colors for secondary variant", () => {
      render(
        <Button variant="secondary" disabled>
          Disabled
        </Button>,
      );
      const button = screen.getByRole("button");
      buttonDisabledVariants.secondary.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should apply disabled colors for ghost variant", () => {
      render(
        <Button variant="ghost" disabled>
          Disabled
        </Button>,
      );
      const button = screen.getByRole("button");
      buttonDisabledVariants.ghost.split(" ").forEach((cls) => {
        expect(button.className).toContain(cls);
      });
    });

    it("should show loading state", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
    });

    it("should visually hide children text via opacity when loading", () => {
      // `opacity-0` keeps the text in the a11y tree (so the button retains
      // an accessible name) while hiding it from sighted users — fixes axe
      // `button-name` which `visibility:hidden` (`invisible`) used to break.
      render(<Button loading>Hidden Text</Button>);
      const text = screen.getByText("Hidden Text");
      expect(text).toHaveClass("opacity-0");
      expect(text).not.toHaveClass("invisible");
    });

    it("should hide icons when loading", () => {
      render(
        <Button loading leftIcon={<svg />} rightIcon={<svg />}>
          Loading
        </Button>,
      );
      expect(screen.getByTestId("button-left-icon")).toHaveClass("invisible");
      expect(screen.getByTestId("button-right-icon")).toHaveClass("invisible");
    });
  });

  describe("Events", () => {
    it("should call onClick when clicked", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when loading", () => {
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have aria-disabled when disabled", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("should have aria-busy when loading", () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });

    it("should support aria-label", () => {
      render(<Button aria-label="Close dialog">X</Button>);
      expect(screen.getByLabelText("Close dialog")).toBeInTheDocument();
    });

    it("should preserve accessible name during loading state", () => {
      // axe `button-name` requires a discernible accessible name even when
      // the visual children are hidden. `opacity-0` keeps the children text
      // in the a11y tree so `getByRole('button', { name })` resolves.
      render(<Button loading>Save changes</Button>);
      expect(
        screen.getByRole("button", { name: /save changes/i }),
      ).toBeInTheDocument();
    });

    it("should mark spinner as aria-hidden so it does not pollute the name", () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByTestId("button-spinner")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("should mark icons as aria-hidden (decorative when paired with text)", () => {
      render(
        <Button leftIcon={<svg />} rightIcon={<svg />}>
          Action
        </Button>,
      );
      expect(screen.getByTestId("button-left-icon")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.getByTestId("button-right-icon")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("HTML attributes", () => {
    it("should support type attribute", () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    it("defaults to type='button'", () => {
      render(<Button>Default Type</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("should pass through additional HTML attributes", () => {
      render(<Button data-testid="custom-button">Test</Button>);
      expect(screen.getByTestId("custom-button")).toBeInTheDocument();
    });
  });
});
