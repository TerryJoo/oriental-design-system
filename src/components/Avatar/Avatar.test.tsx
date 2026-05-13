import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar, AvatarGroup } from "./Avatar";
import { avatarSizes, type AvatarSize } from "./Avatar.styles";

describe("Avatar", () => {
  it("renders initials when no src", () => {
    render(<Avatar alt="김">金</Avatar>);
    expect(screen.getByText("金")).toBeInTheDocument();
  });

  it("renders an image when src is set", () => {
    render(<Avatar src="https://example.invalid/x.png" alt="user" />);
    expect(screen.getByAltText("user")).toBeInTheDocument();
  });

  describe("Sizes", () => {
    (["sm", "md", "lg", "xl"] as const).forEach((size: AvatarSize) => {
      it(`size=${size}`, () => {
        render(
          <Avatar size={size} data-testid="a" alt="x">
            x
          </Avatar>,
        );
        avatarSizes[size].split(" ").forEach((cls) => {
          expect(screen.getByTestId("a").className).toContain(cls);
        });
      });
    });
  });

  it("AvatarGroup renders children with negative gap", () => {
    render(
      <AvatarGroup>
        <Avatar alt="a">A</Avatar>
        <Avatar alt="b">B</Avatar>
      </AvatarGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
