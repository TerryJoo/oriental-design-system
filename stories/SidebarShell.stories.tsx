import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import {
  SidebarShell,
  SidebarShellHeader,
  SidebarShellContent,
  SidebarShellFooter,
  SidebarShellGroup,
  SidebarShellGroupLabel,
  SidebarTrigger,
  useSidebarShellContext,
  type SidebarShellProps,
} from "@/components/Sidebar";
import { Button } from "@/components/Button";
import { Stack } from "@/components/Stack";
import { boolArg, bothEras } from "./_shared/argTypes";

/**
 * Wraps the shell in a fixed-height surface so the internal flex layout
 * (`flex-1` content + scrolling) has room to behave realistically inside
 * Storybook's `layout: "centered"` canvas.
 */
const ShellFrame = ({
  children,
  height = 520,
}: {
  children: ReactNode;
  height?: number;
}) => (
  <div
    style={{ height, display: "flex" }}
    className="rounded-card border border-era bg-era-base"
  >
    {children}
  </div>
);

/**
 * Minimal placeholder rows so each story shows realistic content density
 * without depending on the menu primitives (which are owned by another
 * agent and not in scope here).
 */
const PlaceholderRows = ({
  count,
  prefix = "Item",
}: {
  count: number;
  prefix?: string;
}) => (
  <Stack direction="column" gap="1">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-button px-3 py-2 text-body-3 text-era-primary hover:bg-era-raised"
      >
        {prefix} {i + 1}
      </div>
    ))}
  </Stack>
);

const meta: Meta<SidebarShellProps> = {
  title: "Components/SidebarShell",
  component: SidebarShell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "SidebarShell is the compound layout primitive for application " +
          "navigation chrome. The recommended composition order is " +
          "`SidebarShell` > `SidebarShellHeader` > `SidebarShellContent` " +
          "(containing one or more `SidebarShellGroup` blocks, each " +
          "optionally introduced by a `SidebarShellGroupLabel`) > " +
          "`SidebarShellFooter`. The root renders as a `<nav>` landmark " +
          'with `aria-label="Sidebar navigation"` and owns a context ' +
          "(`useSidebarShellContext`) that exposes `collapsed`, " +
          "`setCollapsed`, `toggleCollapsed`, and the sidebar's `id`. " +
          "`SidebarTrigger` is the canonical toggle: it lives anywhere " +
          "inside the same `SidebarShell` provider and wires " +
          "`aria-expanded` / `aria-controls` automatically. Collapse " +
          "state is uncontrolled by default (`defaultCollapsed`) but " +
          "supports a controlled mode via `collapsed` + " +
          "`onCollapsedChange`. The landmark's accessible name is " +
          "configurable through the `aria-label` prop (default " +
          '`"Sidebar navigation"`), which is useful for localization ' +
          '(e.g. `"관리자 메뉴"`) and for disambiguating multiple ' +
          "sidebars on the same page. All visuals run on era-aware " +
          "tokens (`bg-era-sunken`, `border-era`, `duration-era`, " +
          "`ease-era-brush`), so the shell flips between Heritage and " +
          "Neon without any React re-render.",
      },
    },
  },
  argTypes: {
    defaultCollapsed: boolArg(
      "Initial collapsed state for uncontrolled usage. Ignored when `collapsed` is provided.",
    ),
    collapsed: boolArg(
      "Controlled collapsed state. Pair with `onCollapsedChange` to drive from external state.",
    ),
    "aria-label": {
      control: { type: "text" },
      description:
        'Accessible label for the sidebar\'s `<nav>` landmark. Defaults to `"Sidebar navigation"`. Override for localization or to disambiguate multiple sidebars on the same page.',
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '"Sidebar navigation"' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<SidebarShellProps>;

/**
 * Default uncontrolled shell with a header (logo + title), a single
 * content group with a label, and a footer hosting an action button.
 */
export const Default: Story = {
  render: (args) => (
    <ShellFrame>
      <SidebarShell {...args}>
        <SidebarShellHeader title="오방색" showTrigger />
        <SidebarShellContent>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>메뉴</SidebarShellGroupLabel>
            <PlaceholderRows count={3} />
          </SidebarShellGroup>
        </SidebarShellContent>
        <SidebarShellFooter>
          <Button size="sm" variant="ghost">
            설정
          </Button>
        </SidebarShellFooter>
      </SidebarShell>
    </ShellFrame>
  ),
};

/**
 * Demonstrates overriding the navigation landmark's accessible name via
 * the `aria-label` prop. Useful for localization or for disambiguating
 * multiple sidebars on a single page (e.g. a primary nav and an admin
 * panel rail).
 */
export const CustomLabel: Story = {
  args: {
    "aria-label": "관리자 메뉴",
  },
  parameters: {
    docs: {
      description: {
        story:
          'The shell exposes `aria-label` as an explicit prop on `SidebarShellProps` so it can be documented, controlled from Storybook, and asserted in tests. The default is `"Sidebar navigation"`; here we override it with the Korean `"관리자 메뉴"`. Screen readers announce this string when a user enters the navigation landmark, and it surfaces in DevTools as the accessible name. When a page hosts multiple `<nav>` regions, every one of them needs a distinct label — the prop is the canonical way to provide one without reaching into HTMLAttributes.',
      },
    },
  },
  render: (args) => (
    <ShellFrame>
      <SidebarShell {...args}>
        <SidebarShellHeader title="관리자" showTrigger />
        <SidebarShellContent>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>운영</SidebarShellGroupLabel>
            <PlaceholderRows count={3} prefix="관리" />
          </SidebarShellGroup>
        </SidebarShellContent>
        <SidebarShellFooter>
          <Button size="sm" variant="ghost">
            로그아웃
          </Button>
        </SidebarShellFooter>
      </SidebarShell>
    </ShellFrame>
  ),
};

/**
 * Renders the shell in its collapsed width (`w-16`). Group labels and
 * the header title hide automatically; only the trigger and icons stay
 * visible. Uses `defaultCollapsed` so the shell remains uncontrolled.
 */
export const Collapsed: Story = {
  args: {
    defaultCollapsed: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`defaultCollapsed={true}` boots the uncontrolled shell into its narrow rail. `SidebarShellGroupLabel` returns null while collapsed, so the rail stays compact without manual conditional rendering.",
      },
    },
  },
  render: (args) => (
    <ShellFrame>
      <SidebarShell {...args}>
        <SidebarShellHeader title="오방색" showTrigger />
        <SidebarShellContent>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>메뉴</SidebarShellGroupLabel>
            <PlaceholderRows count={3} prefix="◆" />
          </SidebarShellGroup>
        </SidebarShellContent>
        <SidebarShellFooter>
          <SidebarTrigger />
        </SidebarShellFooter>
      </SidebarShell>
    </ShellFrame>
  ),
};

/**
 * Multiple groups separated by labels. Each group is a `role="group"`
 * landmark, so screen readers can navigate between sections.
 */
export const WithGroups: Story = {
  render: (args) => (
    <ShellFrame>
      <SidebarShell {...args}>
        <SidebarShellHeader title="대시보드" showTrigger />
        <SidebarShellContent>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>워크스페이스</SidebarShellGroupLabel>
            <PlaceholderRows count={3} prefix="작업" />
          </SidebarShellGroup>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>최근 항목</SidebarShellGroupLabel>
            <PlaceholderRows count={2} prefix="문서" />
          </SidebarShellGroup>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>도구</SidebarShellGroupLabel>
            <PlaceholderRows count={2} prefix="도구" />
          </SidebarShellGroup>
        </SidebarShellContent>
      </SidebarShell>
    </ShellFrame>
  ),
};

/**
 * `SidebarTrigger` placed *outside* the visual sidebar but still inside
 * the same `SidebarShell` provider. Demonstrates how the context-driven
 * trigger can live anywhere in the page (top bar, footer, etc.) and
 * still wire `aria-expanded` / `aria-controls` correctly.
 */
export const WithTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`SidebarTrigger` reads collapse state from `useSidebarShellContext`, so it works no matter where it is rendered as long as it shares the same `SidebarShell` parent. The button manages `aria-expanded` and `aria-controls={sidebarId}` automatically — bidirectional state, no manual wiring.",
      },
    },
  },
  render: () => (
    <SidebarShell>
      <Stack direction="row" gap="3" align="stretch">
        <ShellFrame>
          <SidebarShellHeader title="컨트롤 외부" />
          <SidebarShellContent>
            <SidebarShellGroup>
              <SidebarShellGroupLabel>섹션</SidebarShellGroupLabel>
              <PlaceholderRows count={3} />
            </SidebarShellGroup>
          </SidebarShellContent>
        </ShellFrame>
        <Stack
          direction="column"
          gap="2"
          align="start"
          style={{ paddingLeft: 12 }}
        >
          <span className="text-label text-era-muted">External controls</span>
          <SidebarTrigger />
          <span className="text-body-3 text-era-muted">
            Click to toggle the sidebar.
          </span>
        </Stack>
      </Stack>
    </SidebarShell>
  ),
};

/**
 * Bare-bones composition: only the root and the content slot. Verifies
 * the layout does not collapse without a header or footer.
 */
export const MinimalShell: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Header and footer are both optional. With only `SidebarShellContent`, the shell still fills the available height and lets the content take all of it.",
      },
    },
  },
  render: (args) => (
    <ShellFrame>
      <SidebarShell {...args}>
        <SidebarShellContent>
          <SidebarShellGroup>
            <PlaceholderRows count={4} />
          </SidebarShellGroup>
        </SidebarShellContent>
      </SidebarShell>
    </ShellFrame>
  ),
};

/**
 * The shell's content area scrolls internally (`overflow-y-auto`). The
 * header and footer remain pinned regardless of how tall the menu gets.
 */
export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Content overflow is handled by `SidebarShellContent` (`overflow-y-auto`). The header and footer stay pinned while the middle scrolls — the page itself does not gain a scrollbar.",
      },
    },
  },
  render: (args) => (
    <ShellFrame>
      <SidebarShell {...args}>
        <SidebarShellHeader title="긴 메뉴" showTrigger />
        <SidebarShellContent>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>그룹 A</SidebarShellGroupLabel>
            <PlaceholderRows count={12} prefix="A" />
          </SidebarShellGroup>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>그룹 B</SidebarShellGroupLabel>
            <PlaceholderRows count={12} prefix="B" />
          </SidebarShellGroup>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>그룹 C</SidebarShellGroupLabel>
            <PlaceholderRows count={12} prefix="C" />
          </SidebarShellGroup>
        </SidebarShellContent>
        <SidebarShellFooter>
          <span className="text-body-3 text-era-muted">고정된 푸터</span>
        </SidebarShellFooter>
      </SidebarShell>
    </ShellFrame>
  ),
};

/**
 * Footer hosting two action buttons. Demonstrates that the footer is a
 * plain layout slot — any composition is permitted.
 */
export const WithFooterActions: Story = {
  render: (args) => (
    <ShellFrame>
      <SidebarShell {...args}>
        <SidebarShellHeader title="작업 공간" showTrigger />
        <SidebarShellContent>
          <SidebarShellGroup>
            <SidebarShellGroupLabel>탐색</SidebarShellGroupLabel>
            <PlaceholderRows count={3} />
          </SidebarShellGroup>
        </SidebarShellContent>
        <SidebarShellFooter>
          <Stack direction="row" gap="2" align="center">
            <Button size="sm" variant="primary">
              새로 만들기
            </Button>
            <Button size="sm" variant="ghost">
              가져오기
            </Button>
          </Stack>
        </SidebarShellFooter>
      </SidebarShell>
    </ShellFrame>
  ),
};

/**
 * Inline child component that consumes `useSidebarShellContext` to
 * reflect collapse state. Demonstrates the public hook contract:
 * `{ collapsed, setCollapsed, toggleCollapsed, sidebarId }`.
 */
const ContextProbe = () => {
  const { collapsed, sidebarId, toggleCollapsed } = useSidebarShellContext();
  return (
    <Stack direction="column" gap="2" align="start">
      <span className="text-label text-era-muted">Context probe</span>
      <span className="text-body-3 text-era-primary">
        collapsed: <code>{String(collapsed)}</code>
      </span>
      <span className="text-body-3 text-era-primary">
        sidebarId: <code>{sidebarId}</code>
      </span>
      <Button size="sm" variant="secondary" onClick={toggleCollapsed}>
        toggleCollapsed()
      </Button>
    </Stack>
  );
};

export const UseContextDemo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Anything rendered inside `SidebarShell` — including custom children — can read shell state via `useSidebarShellContext()`. The hook throws when used outside the provider, mirroring the standard Radix-style compound contract. Returned shape: `{ collapsed, setCollapsed, toggleCollapsed, sidebarId }`.",
      },
    },
  },
  render: (args) => (
    <SidebarShell {...args}>
      <Stack direction="row" gap="4" align="stretch">
        <ShellFrame>
          <SidebarShellHeader title="컨텍스트" showTrigger />
          <SidebarShellContent>
            <SidebarShellGroup>
              <SidebarShellGroupLabel>섹션</SidebarShellGroupLabel>
              <PlaceholderRows count={3} />
            </SidebarShellGroup>
          </SidebarShellContent>
        </ShellFrame>
        <div
          className="rounded-card border border-era bg-era-raised p-4"
          style={{ minWidth: 220 }}
        >
          <ContextProbe />
        </div>
      </Stack>
    </SidebarShell>
  ),
};

/**
 * Heritage / Neon side-by-side comparison. Same markup, two eras —
 * surfaces, borders, and trigger hover states all flip via the era CSS
 * layer with no React re-render.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Identical `SidebarShell` markup rendered under Heritage and Neon. The shell never reads era values from JS — every era-specific surface, border, and motion token is resolved in CSS via `bg-era-sunken`, `border-era`, `duration-era`, and `ease-era-brush`.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div style={{ height: 420, display: "flex" }}>
        <SidebarShell>
          <SidebarShellHeader title="오방색" showTrigger />
          <SidebarShellContent>
            <SidebarShellGroup>
              <SidebarShellGroupLabel>메뉴</SidebarShellGroupLabel>
              <PlaceholderRows count={3} />
            </SidebarShellGroup>
            <SidebarShellGroup>
              <SidebarShellGroupLabel>도구</SidebarShellGroupLabel>
              <PlaceholderRows count={2} prefix="도구" />
            </SidebarShellGroup>
          </SidebarShellContent>
          <SidebarShellFooter>
            <Button size="sm" variant="ghost">
              설정
            </Button>
          </SidebarShellFooter>
        </SidebarShell>
      </div>
    )),
};

/**
 * Interaction test. Verifies:
 *  1. The shell renders a `navigation` landmark with the expected label.
 *  2. `SidebarTrigger` starts with `aria-expanded="true"` (not collapsed).
 *  3. Clicking the trigger flips `aria-expanded` to `"false"` and the
 *     external collapse callback fires with `true`.
 *  4. A second click flips it back, confirming bidirectional toggle.
 *  5. Each `SidebarShellGroup` exposes `role="group"`.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Automated proof that the shell exposes a `navigation` landmark, that `SidebarTrigger` toggles `aria-expanded` bidirectionally, and that `SidebarShellGroup` is a `role="group"` landmark. The render uses a controlled shell so the play function can also assert that `onCollapsedChange` fires with the right values.',
      },
    },
  },
  render: () => {
    const ControlledHarness = () => {
      const [collapsed, setCollapsed] = useState(false);
      const [changes, setChanges] = useState<ReadonlyArray<boolean>>([]);
      return (
        <Stack direction="column" gap="2" align="start">
          <ShellFrame>
            <SidebarShell
              collapsed={collapsed}
              onCollapsedChange={(next) => {
                setCollapsed(next);
                setChanges((prev) => [...prev, next]);
              }}
            >
              <SidebarShellHeader title="테스트" showTrigger />
              <SidebarShellContent>
                <SidebarShellGroup data-testid="group-main">
                  <SidebarShellGroupLabel>메인</SidebarShellGroupLabel>
                  <PlaceholderRows count={2} />
                </SidebarShellGroup>
              </SidebarShellContent>
            </SidebarShell>
          </ShellFrame>
          <span data-testid="change-log" className="text-label text-era-muted">
            {changes.map(String).join(",")}
          </span>
        </Stack>
      );
    };
    return <ControlledHarness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Landmark: <nav role="navigation" aria-label="Sidebar navigation">.
    const nav = canvas.getByRole("navigation", {
      name: /sidebar navigation/i,
    });
    await expect(nav).toBeInTheDocument();

    // 2. Group landmark exposed by SidebarShellGroup.
    const group = canvas.getByTestId("group-main");
    await expect(group).toHaveAttribute("role", "group");

    // 3. Trigger starts expanded (collapsed === false).
    const trigger = canvas.getByRole("button", { name: /메뉴 여닫기/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toHaveAttribute("aria-controls", nav.id);

    // 4. Click → collapses → onCollapsedChange(true).
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // 5. Click again → expands → onCollapsedChange(false).
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // 6. Both transitions were forwarded to the controlled callback.
    const log = canvas.getByTestId("change-log");
    await expect(log).toHaveTextContent("true,false");
  },
};
