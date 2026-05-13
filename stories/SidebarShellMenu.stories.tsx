import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import type { ReactNode } from "react";
import {
  SidebarShell,
  SidebarShellContent,
  SidebarShellGroup,
  SidebarShellMenu,
  SidebarShellMenuButton,
  SidebarShellMenuItem,
  SidebarShellMenuSub,
  SidebarShellMenuSubButton,
  SidebarShellMenuSubItem,
} from "@/components/Sidebar";
import { boolArg, bothEras } from "./_shared/argTypes";

/**
 * Inline 24x24 outline icons used by the icon-bearing stories. Strokes use
 * `currentColor` so the icon adopts the era-aware `text-era-*` token applied
 * by the underlying `SidebarShellMenuButton`.
 */
const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const HomeIcon = (
  <Icon>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </Icon>
);

const InboxIcon = (
  <Icon>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Icon>
);

const FolderIcon = (
  <Icon>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);

const SettingsIcon = (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);

const UsersIcon = (
  <Icon>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

/**
 * Small layout helper that mounts the menu inside the minimal parent
 * scaffolding (`SidebarShell` → `SidebarShellContent` → `SidebarShellGroup`).
 * Without this scaffolding the menu primitives would throw because they call
 * `useSidebarShellContext()` for `collapsed` state.
 */
const MenuScaffold = ({ children }: { children: ReactNode }) => (
  <SidebarShell defaultCollapsed={false} style={{ height: 480 }}>
    <SidebarShellContent>
      <SidebarShellGroup>{children}</SidebarShellGroup>
    </SidebarShellContent>
  </SidebarShell>
);

const meta = {
  title: "Components/SidebarShellMenu",
  component: SidebarShellMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "`SidebarShellMenu` is the navigation-list primitive of the SidebarShell compound. It composes a four-level tree:\n\n" +
          "- **`SidebarShellMenu`** — `<ul role='list'>` that owns roving keyboard navigation across its descendant buttons via `ArrowUp` / `ArrowDown` / `Home` / `End`. It is **not** a WAI-ARIA `role='menu'` widget; it is a navigation list intended for application sidebars, so items render as plain `<button>`s rather than `role='menuitem'`. Tab still moves focus naturally between buttons.\n" +
          "- **`SidebarShellMenuItem`** — `<li>` that creates an internal `SubMenuContext` per item, exposing controlled (`expanded`) and uncontrolled (`defaultExpanded`) submenu state plus an `onExpandedChange` callback.\n" +
          "- **`SidebarShellMenuButton`** — the row trigger. Variants: `nav` (default, hidden when the shell is collapsed unless `showWhenCollapsed`) and `action` (always visible). Supports `icon`, `active` (paints the accent treatment and emits `aria-current='page'`), and `hasSub` (toggles the parent item's submenu on click and renders a rotating chevron). When `hasSub` is set, the button automatically wires `aria-expanded` and `aria-controls` against the submenu's auto-generated `id`.\n" +
          "- **`SidebarShellMenuSub`** — nested `<ul>` rendered with `aria-hidden` and `display:none` while collapsed; supports a `nested` flag for level-3+ indentation.\n" +
          "- **`SidebarShellMenuSubItem`** + **`SidebarShellMenuSubButton`** — same pattern at the second level, with `isHeader` (B2 medium) / list (B3 medium) styling and an `inExpandedGroup` accent applied when the parent group is open.\n\n" +
          "**Parent context required.** Every primitive in this file calls `useSidebarShellContext()` and will throw if rendered outside `<SidebarShell>`. All stories below mount the menu inside `SidebarShell` → `SidebarShellContent` → `SidebarShellGroup` as the minimum viable scaffolding. Those parent primitives are owned by separate stories — only the menu surface is the subject here.\n\n" +
          "**Era awareness.** Buttons use `text-era-primary`, `bg-era-raised`, `duration-era`, `ease-era-brush`, and `--accent-500/700` tokens, so Heritage and Neon flip via the era CSS layer without re-rendering React.",
      },
    },
  },
  argTypes: {
    className: boolArg("Optional className passthrough on the <ul> element"),
  },
} satisfies Meta<typeof SidebarShellMenu>;

export default meta;
type Story = StoryObj<typeof SidebarShellMenu>;

/**
 * Default flat menu with four navigation items. The second item is marked
 * `active` to demonstrate the accent treatment and the `aria-current='page'`
 * attribute that screen readers announce.
 */
export const Default: Story = {
  render: () => (
    <MenuScaffold>
      <SidebarShellMenu>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton>홈</SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton active>받은편지함</SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton>프로젝트</SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton>설정</SidebarShellMenuButton>
        </SidebarShellMenuItem>
      </SidebarShellMenu>
    </MenuScaffold>
  ),
};

/**
 * Each `SidebarShellMenuButton` accepts an `icon` ReactNode. The button wraps
 * the icon in a 24x24 inline-flex container marked `aria-hidden`, so screen
 * readers announce the visible label only.
 */
export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass any `ReactNode` to the `icon` prop on `SidebarShellMenuButton`. The component reserves a 24x24 leading slot and positions the chevron (when `hasSub`) at the trailing edge.",
      },
    },
  },
  render: () => (
    <MenuScaffold>
      <SidebarShellMenu>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={HomeIcon} active>
            홈
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={InboxIcon}>
            받은편지함
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={FolderIcon}>
            프로젝트
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={SettingsIcon}>
            설정
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
      </SidebarShellMenu>
    </MenuScaffold>
  ),
};

/**
 * `SidebarShellMenuSub` mounts a nested `<ul>` that the parent
 * `SidebarShellMenuItem`'s `SubMenuContext` toggles on/off. Setting `hasSub`
 * on the parent button promotes it to an expansion trigger: clicking it
 * flips `aria-expanded` against the auto-generated submenu id and rotates
 * the chevron 180°.
 */
export const WithSubmenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Click the **프로젝트** row to expand its submenu. The button wires `aria-expanded` and `aria-controls` against the submenu `<ul>`, and `SidebarShellMenuItem` accepts `defaultExpanded` (uncontrolled) or `expanded` + `onExpandedChange` (controlled).",
      },
    },
  },
  render: () => (
    <MenuScaffold>
      <SidebarShellMenu>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={HomeIcon}>홈</SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem defaultExpanded>
          <SidebarShellMenuButton icon={FolderIcon} hasSub>
            프로젝트
          </SidebarShellMenuButton>
          <SidebarShellMenuSub>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton>오리엔탈</SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton>헤리티지</SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton>네온</SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
          </SidebarShellMenuSub>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={SettingsIcon}>
            설정
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
      </SidebarShellMenu>
    </MenuScaffold>
  ),
};

/**
 * The active branch is two levels deep. The parent row uses the `inExpanded
 * Group` styling that `SidebarShellMenuSubButton` applies via the
 * `expanded` flag, while the leaf row carries `active` for the accent
 * treatment + `aria-current='page'`.
 */
export const WithActiveSubItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Marks a deep leaf as `active` to demonstrate how the parent branch indicates a contained selection. The parent `SidebarShellMenuItem` is `defaultExpanded`, the parent button rotates its chevron, and the leaf `SidebarShellMenuSubButton` receives `active` for the accent + `aria-current='page'` markers.",
      },
    },
  },
  render: () => (
    <MenuScaffold>
      <SidebarShellMenu>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={HomeIcon}>홈</SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem defaultExpanded>
          <SidebarShellMenuButton icon={FolderIcon} hasSub>
            프로젝트
          </SidebarShellMenuButton>
          <SidebarShellMenuSub>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton>오리엔탈</SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton active>
                헤리티지
              </SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton>네온</SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
          </SidebarShellMenuSub>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={UsersIcon}>
            팀 관리
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
      </SidebarShellMenu>
    </MenuScaffold>
  ),
};

/**
 * Setting `disabled` on a `SidebarShellMenuButton` maps directly to the
 * native `<button disabled>`. The roving-keyboard handler in
 * `SidebarShellMenu` queries `button:not([disabled])`, so ArrowUp/ArrowDown
 * navigation skips the disabled row, and Tab also bypasses it because
 * disabled `<button>`s drop out of the document tab order.
 */
export const DisabledItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The third row is disabled. Both the menu's roving Arrow navigation and the native Tab order skip it because the underlying element is `<button disabled>`.",
      },
    },
  },
  render: () => (
    <MenuScaffold>
      <SidebarShellMenu>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={HomeIcon}>홈</SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={InboxIcon} active>
            받은편지함
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={FolderIcon} disabled>
            프로젝트 (잠김)
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={SettingsIcon}>
            설정
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
      </SidebarShellMenu>
    </MenuScaffold>
  ),
};

/**
 * The button label slot wraps in `flex-1 truncate text-left`, so labels that
 * exceed the row width are truncated with an ellipsis rather than wrapping
 * to a second line. This keeps the row height fixed at the 46px design
 * token (`h-[46px]`).
 */
export const LongLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The label slot uses `flex-1 truncate`, so overflow is clipped with an ellipsis. The chevron and leading icon stay locked to the row edges, and the button retains its 46px row height under both eras.",
      },
    },
  },
  render: () => (
    <MenuScaffold>
      <SidebarShellMenu>
        <SidebarShellMenuItem>
          <SidebarShellMenuButton icon={HomeIcon}>
            아주 길고 긴 메뉴 항목 이름이 잘리는지 확인합니다
          </SidebarShellMenuButton>
        </SidebarShellMenuItem>
        <SidebarShellMenuItem defaultExpanded>
          <SidebarShellMenuButton icon={FolderIcon} hasSub>
            매우 긴 프로젝트 이름 — 줄바꿈 없이 말줄임표 처리
          </SidebarShellMenuButton>
          <SidebarShellMenuSub>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton>
                서브 항목도 동일하게 한 줄에서 잘립니다
              </SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
            <SidebarShellMenuSubItem>
              <SidebarShellMenuSubButton active>
                현재 선택된 매우 긴 서브 항목 이름
              </SidebarShellMenuSubButton>
            </SidebarShellMenuSubItem>
          </SidebarShellMenuSub>
        </SidebarShellMenuItem>
      </SidebarShellMenu>
    </MenuScaffold>
  ),
};

/**
 * Heritage / Neon side-by-side. The same menu markup renders in both era
 * panels; era-aware tokens (`text-era-primary`, `bg-era-raised`,
 * `--accent-500/700`, `duration-era`, `ease-era-brush`) account for every
 * visual delta — no React re-render involved.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same menu markup rendered in Heritage and Neon. Surface, accent, focus-ring, and chevron color all flip via the era CSS layer.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <MenuScaffold>
        <SidebarShellMenu>
          <SidebarShellMenuItem>
            <SidebarShellMenuButton icon={HomeIcon} active>
              홈
            </SidebarShellMenuButton>
          </SidebarShellMenuItem>
          <SidebarShellMenuItem defaultExpanded>
            <SidebarShellMenuButton icon={FolderIcon} hasSub>
              프로젝트
            </SidebarShellMenuButton>
            <SidebarShellMenuSub>
              <SidebarShellMenuSubItem>
                <SidebarShellMenuSubButton>오리엔탈</SidebarShellMenuSubButton>
              </SidebarShellMenuSubItem>
              <SidebarShellMenuSubItem>
                <SidebarShellMenuSubButton active>
                  헤리티지
                </SidebarShellMenuSubButton>
              </SidebarShellMenuSubItem>
            </SidebarShellMenuSub>
          </SidebarShellMenuItem>
          <SidebarShellMenuItem>
            <SidebarShellMenuButton icon={SettingsIcon}>
              설정
            </SidebarShellMenuButton>
          </SidebarShellMenuItem>
        </SidebarShellMenu>
      </MenuScaffold>
    )),
};

/**
 * Interaction proof. Validates the documented behavior of this menu:
 *  1. Clicking a leaf `SidebarShellMenuButton` fires the consumer `onClick`.
 *  2. Clicking a `hasSub` parent toggles `aria-expanded` and reveals the
 *     submenu (`aria-hidden` flips to `false`).
 *  3. Tab moves focus into the now-visible submenu — the menu primitive
 *     does **not** trap focus, so native Tab order governs.
 */
const interactiveMocks = {
  onClickHome: fn(),
  onClickProjects: fn(),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Automated interaction proof.\n\n" +
          "**Asserted behavior**: leaf-button clicks fire the consumer `onClick`; clicking a `hasSub` parent toggles `aria-expanded` and reveals the submenu; Tab moves focus naturally from the parent into the now-visible submenu.\n\n" +
          "**Out of scope (intentionally NOT asserted)**: typeahead, focus trapping, and `role='menu'`-style activation semantics. This component is a navigation list, not a WAI-ARIA menu widget — it owns Arrow/Home/End roving via a custom keydown handler on the `<ul>`, but otherwise relies on native button + Tab semantics.",
      },
    },
  },
  beforeEach: () => {
    interactiveMocks.onClickHome.mockClear();
    interactiveMocks.onClickProjects.mockClear();
  },
  render: () => {
    const { onClickHome, onClickProjects } = interactiveMocks;
    return (
      <MenuScaffold>
        <SidebarShellMenu data-testid="interactive-menu">
          <SidebarShellMenuItem>
            <SidebarShellMenuButton
              icon={HomeIcon}
              data-testid="home-button"
              onClick={onClickHome}
            >
              홈
            </SidebarShellMenuButton>
          </SidebarShellMenuItem>
          <SidebarShellMenuItem>
            <SidebarShellMenuButton
              icon={FolderIcon}
              hasSub
              data-testid="projects-button"
              onClick={onClickProjects}
            >
              프로젝트
            </SidebarShellMenuButton>
            <SidebarShellMenuSub data-testid="projects-sub">
              <SidebarShellMenuSubItem>
                <SidebarShellMenuSubButton data-testid="sub-oriental">
                  오리엔탈
                </SidebarShellMenuSubButton>
              </SidebarShellMenuSubItem>
              <SidebarShellMenuSubItem>
                <SidebarShellMenuSubButton data-testid="sub-heritage">
                  헤리티지
                </SidebarShellMenuSubButton>
              </SidebarShellMenuSubItem>
            </SidebarShellMenuSub>
          </SidebarShellMenuItem>
        </SidebarShellMenu>
      </MenuScaffold>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const homeButton = canvas.getByTestId("home-button");
    const projectsButton = canvas.getByTestId("projects-button");
    const projectsSub = canvas.getByTestId("projects-sub");

    // 1. Leaf-button click fires the consumer onClick.
    await userEvent.click(homeButton);
    await waitFor(() =>
      expect(interactiveMocks.onClickHome).toHaveBeenCalledTimes(1),
    );

    // 2. The hasSub parent starts collapsed: aria-expanded='false' and the
    //    submenu carries aria-hidden='true'.
    await expect(projectsButton).toHaveAttribute("aria-expanded", "false");
    await expect(projectsSub).toHaveAttribute("aria-hidden", "true");

    // 3. Click the parent: it fires onClick AND toggles expansion.
    await userEvent.click(projectsButton);
    await waitFor(() =>
      expect(interactiveMocks.onClickProjects).toHaveBeenCalledTimes(1),
    );
    await waitFor(() =>
      expect(projectsButton).toHaveAttribute("aria-expanded", "true"),
    );
    await expect(projectsSub).toHaveAttribute("aria-hidden", "false");

    // 4. aria-controls points at the submenu's id (auto-generated via useId).
    const controlsId = projectsButton.getAttribute("aria-controls");
    await expect(controlsId).toBeTruthy();
    await expect(projectsSub).toHaveAttribute("id", controlsId ?? "");

    // 5. Focus the parent and Tab into the now-visible submenu.
    projectsButton.focus();
    await expect(projectsButton).toHaveFocus();
    await userEvent.tab();
    const subOriental = canvas.getByTestId("sub-oriental");
    await waitFor(() => expect(subOriental).toHaveFocus());

    // 6. A second click on the parent collapses the submenu again.
    await userEvent.click(projectsButton);
    await waitFor(() =>
      expect(projectsButton).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(projectsSub).toHaveAttribute("aria-hidden", "true");
  },
};
