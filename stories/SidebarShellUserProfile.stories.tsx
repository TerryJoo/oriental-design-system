import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { SidebarShell } from "@/components/Sidebar";
import {
  SidebarShellUserProfile,
  type SidebarShellUser,
} from "@/components/Sidebar";
import { bothEras } from "./_shared/argTypes";

/**
 * Compose a `SidebarShellUserProfile` inside its canonical context: a
 * `SidebarShell` with a `SidebarShell.Footer` slot. The shell context
 * is required because the profile button reads the `collapsed` flag
 * from `useSidebarShellContext()` to decide whether to render the
 * name/plan stack alongside the avatar.
 */
const ProfileInFooter = ({
  user,
  collapsed = false,
  onClick,
  ...rest
}: {
  user: SidebarShellUser;
  collapsed?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & Omit<
  React.ComponentProps<typeof SidebarShellUserProfile>,
  "user" | "onClick"
>) => (
  <div style={{ height: 320, display: "flex" }}>
    <SidebarShell collapsed={collapsed}>
      <SidebarShell.Header title="오리엔탈" showTrigger={false} />
      <SidebarShell.Content>
        <SidebarShell.Group>
          <SidebarShell.Menu>
            <SidebarShell.MenuItem>
              <SidebarShell.MenuButton>홈</SidebarShell.MenuButton>
            </SidebarShell.MenuItem>
          </SidebarShell.Menu>
        </SidebarShell.Group>
      </SidebarShell.Content>
      <SidebarShell.Footer>
        <SidebarShellUserProfile user={user} onClick={onClick} {...rest} />
      </SidebarShell.Footer>
    </SidebarShell>
  </div>
);

const DEFAULT_USER: SidebarShellUser = {
  displayName: "김도담",
  photoURL: undefined,
  plan: "프리미엄",
};

const meta = {
  title: "Components/SidebarShellUserProfile",
  component: SidebarShellUserProfile,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Footer-anchored profile trigger for `SidebarShell`. Renders an `Avatar` (initial fallback derived from `user.displayName.charAt(0)`) plus, when the shell is expanded, a two-line stack with the display name and an optional `plan` line. Typical placement: inside `SidebarShell.Footer` as the bottom-most action — clicking it opens an account menu, opens settings, or signs out. The component reacts to the parent shell's `collapsed` state via context, so the same button shrinks to an avatar-only target when the shell is collapsed. The accessible name comes from `aria-label={user.displayName}`, and the rendered element is a native `<button type='button'>` so it is focusable and supports keyboard activation.",
      },
    },
  },
  argTypes: {
    user: {
      control: "object",
      description:
        "User payload: `displayName` (required, used as accessible name + avatar fallback initial), optional `photoURL`, optional `plan` shown as a sub-line when the shell is expanded.",
    },
    onClick: {
      action: "clicked",
      description:
        "Native button click handler. Forwarded to the underlying `<button>` along with the rest of the `ButtonHTMLAttributes`.",
    },
  },
  args: {
    user: DEFAULT_USER,
  },
} satisfies Meta<typeof SidebarShellUserProfile>;

export default meta;
type Story = StoryObj<typeof SidebarShellUserProfile>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Default placement inside `SidebarShell.Footer` with a name + plan + avatar. The avatar falls back to the initial of `displayName` when `photoURL` is omitted.",
      },
    },
  },
  render: (args) => <ProfileInFooter user={args.user} onClick={args.onClick} />,
};

export const WithoutEmail: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "When `plan` is omitted, only the display name renders alongside the avatar — the second line is dropped entirely (no empty space reserved). The component does not surface an `email` prop; this story uses the closest equivalent — a single-line label with no secondary metadata.",
      },
    },
  },
  args: {
    user: { displayName: "이단아" },
  },
  render: (args) => <ProfileInFooter user={args.user} onClick={args.onClick} />,
};

export const WithLongName: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Long display names truncate via `truncate` (single-line ellipsis) inside a `min-w-0 flex-1` container so the avatar stays at full size and the text shrinks. The `plan` line truncates independently. Hover the row to confirm the button does not overflow the footer.",
      },
    },
  },
  args: {
    user: {
      displayName: "김아주아주아주긴이름의사용자입니다정말로깁니다",
      plan: "엔터프라이즈 연간 결제 플랜",
    },
  },
  render: (args) => <ProfileInFooter user={args.user} onClick={args.onClick} />,
};

export const EraCompare: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Heritage vs Neon side by side. The profile row reads era tokens (`text-era-primary`, `text-era-muted`, `hover:bg-[rgb(var(--accent-500)/0.10)]`, `duration-era`, `ease-era-brush`), so the swap happens via CSS custom properties without re-rendering React.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <ProfileInFooter
        user={{ displayName: "박세영", plan: "프로" }}
        onClick={() => undefined}
      />
    )),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Play-function assertion: the rendered element has `role='button'` (it is a native `<button type='button'>`), exposes `user.displayName` as its accessible name via `aria-label`, and fires `onClick` when activated. Confirms keyboard/pointer parity by clicking with `userEvent`.",
      },
    },
  },
  args: {
    user: { displayName: "최정인", plan: "스탠다드" },
    onClick: fn(),
  },
  render: (args) => <ProfileInFooter user={args.user} onClick={args.onClick} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    const profile = await canvas.findByRole("button", { name: "최정인" });
    expect(profile).toBeInTheDocument();
    expect(profile.tagName).toBe("BUTTON");
    expect(profile).toHaveAttribute("type", "button");
    expect(profile).toHaveAttribute("aria-label", "최정인");

    await userEvent.click(profile);
    expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
