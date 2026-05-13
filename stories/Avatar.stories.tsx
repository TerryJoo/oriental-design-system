import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarGroup, avatarSizes } from "@/components/Avatar";
import { bothEras, radioArg } from "./_shared/argTypes";

const sizeOptions = Object.keys(avatarSizes) as Array<keyof typeof avatarSizes>;

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Avatar renders a circular identity badge with image fallback to initials/children. " +
          'It exposes a stable `role="img"` and `aria-label` for assistive tech, supports four ' +
          "size tokens (sm / md / lg / xl), and composes with `AvatarGroup` for stacked clusters. " +
          "Both Avatar and AvatarGroup forward refs, so consumers can measure or scroll to them.",
      },
    },
  },
  argTypes: {
    size: radioArg(sizeOptions, "Size variant"),
    src: { control: "text" },
    alt: { control: "text" },
  },
  args: {
    size: "md",
    alt: "User",
    children: "JY",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      {sizeOptions.map((size) => (
        <Avatar key={size} size={size} alt={`Size ${size}`}>
          {size.toUpperCase()}
        </Avatar>
      ))}
    </div>
  ),
};

export const WithImage: Story = {
  args: {
    src: "https://placehold.co/96x96/8A5030/ffffff?text=JY",
    alt: "User avatar",
  },
};

export const Initials: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar alt="Hong Gildong">홍</Avatar>
      <Avatar alt="Kim Soo">KS</Avatar>
      <Avatar alt="Park Min">PM</Avatar>
      <Avatar alt="Lee Ji">LJ</Avatar>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar alt="A" src="https://placehold.co/64x64/8A5030/ffffff?text=A" />
      <Avatar alt="B" src="https://placehold.co/64x64/3A6B5C/ffffff?text=B" />
      <Avatar alt="C">CD</Avatar>
      <Avatar alt="More">+5</Avatar>
    </AvatarGroup>
  ),
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side: the same avatar markup flips its surface and ink tokens without a React re-render.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <AvatarGroup>
        <Avatar alt="One">A1</Avatar>
        <Avatar alt="Two">B2</Avatar>
        <Avatar alt="Three">C3</Avatar>
      </AvatarGroup>
    )),
};

export const RefForwarding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates `forwardRef` on Avatar — the consumer attaches a ref and reads the live DOM dimensions after mount, proving the underlying span node is exposed.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const ref = useRef<HTMLSpanElement>(null);
      const [size, setSize] = useState<{ w: number; h: number } | null>(null);
      useEffect(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
        }
      }, []);
      return (
        <div className="flex items-center gap-4">
          <Avatar ref={ref} size="lg" alt="Ref target" data-testid="ref-target">
            JY
          </Avatar>
          <span className="text-era-muted text-sm">
            measured:{" "}
            <code className="text-era-primary">
              {size ? `${size.w}×${size.h}px` : "…"}
            </code>
          </span>
        </div>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const target = canvas.getByTestId("ref-target");
    await expect(target).toHaveAttribute("role", "img");
    await expect(target).toHaveAttribute("aria-label", "Ref target");
  },
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Verifies Avatar exposes `role="img"` with the supplied `alt` as its accessible name, and that fallback children render when no `src` is provided.',
      },
    },
  },
  args: {
    alt: "Hong Gildong",
    children: "홍",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole("img", { name: args.alt });
    await expect(avatar).toBeInTheDocument();
    await expect(avatar).toHaveTextContent("홍");
  },
};
