import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarShell, SidebarTrigger } from "./SidebarShell";
import {
  SidebarShellHeader,
  SidebarShellContent,
  SidebarShellFooter,
  SidebarShellGroup,
  SidebarShellGroupLabel,
} from "./SidebarShellLayout";
import {
  SidebarShellMenu,
  SidebarShellMenuItem,
  SidebarShellMenuButton,
  SidebarShellMenuSub,
  SidebarShellMenuSubItem,
  SidebarShellMenuSubButton,
} from "./SidebarShellMenu";
import { SidebarShellUserProfile } from "./SidebarShellUserProfile";
import {
  sidebarShellMenuButtonStyles,
  sidebarShellMenuSubButtonStyles,
} from "./Sidebar.styles";

const SECTIONS = [
  {
    heading: "메뉴",
    items: [
      { value: "home", label: "홈", icon: "🏠" },
      { value: "boards", label: "보드 목록", icon: "🎲" },
    ],
  },
  {
    heading: "관리",
    items: [{ value: "settings", label: "설정", icon: "⚙︎" }],
  },
];

describe("Sidebar", () => {
  it("renders sections with headings and items", () => {
    render(<Sidebar sections={SECTIONS} />);
    expect(screen.getByText("메뉴")).toBeInTheDocument();
    expect(screen.getByText("보드 목록")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
  });

  it("marks active item with aria-current=page", () => {
    render(<Sidebar sections={SECTIONS} value="boards" />);
    expect(screen.getByText("보드 목록").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("calls onChange on click", () => {
    const onChange = vi.fn();
    render(<Sidebar sections={SECTIONS} onChange={onChange} />);
    fireEvent.click(screen.getByText("홈"));
    expect(onChange).toHaveBeenCalledWith("home");
  });

  it("exposes items as links (role=link) inside a navigation landmark", () => {
    render(<Sidebar sections={SECTIONS} />);
    // The <nav> with aria-label is a navigation landmark.
    const nav = screen.getByRole("navigation", { name: "사이드 메뉴" });
    expect(nav.tagName).toBe("NAV");

    // All items are anchors → exposed as role=link, not role=menuitem.
    // role=menuitem requires a role=menu parent (WAI-ARIA aria-required-parent).
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(screen.queryAllByRole("menuitem")).toHaveLength(0);
  });

  it("uses default aria-label when none provided", () => {
    render(<Sidebar sections={SECTIONS} />);
    expect(
      screen.getByRole("navigation", { name: "사이드 메뉴" }),
    ).toBeInTheDocument();
  });

  it("respects custom aria-label", () => {
    render(<Sidebar sections={SECTIONS} aria-label="Primary nav" />);
    expect(
      screen.getByRole("navigation", { name: "Primary nav" }),
    ).toBeInTheDocument();
  });

  it("places items in the document order so Tab flows naturally", () => {
    render(<Sidebar sections={SECTIONS} />);
    const links = screen.getAllByRole("link");
    // Anchors with href are tabbable by default; assert order matches
    // SECTIONS declaration (홈 → 보드 목록 → 설정). Icons (emoji) sit
    // inside aria-hidden spans, so each link's accessible name is the
    // label only.
    expect(links.map((a) => a.getAttribute("aria-current"))).toEqual([
      null,
      null,
      null,
    ]);
    expect(links[0]).toHaveTextContent("홈");
    expect(links[1]).toHaveTextContent("보드 목록");
    expect(links[2]).toHaveTextContent("설정");
    // No tabindex hacks — we rely on native anchor behavior.
    for (const link of links) {
      expect(link).not.toHaveAttribute("tabindex");
    }
  });

  it("does not set role=menuitem on items (avoids aria-required-parent)", () => {
    render(<Sidebar sections={SECTIONS} value="home" />);
    const links = screen.getAllByRole("link");
    for (const link of links) {
      expect(link).not.toHaveAttribute("role");
    }
  });

  // Contrast regression guard (Wave 5b2-Round3): the active item uses an
  // explicit `text-white` foreground on `accent-600`. Earlier revisions used
  // `text-era-inverse`, which produced 4.44:1 in Neon (failing WCAG AA).
  // White passes AA in every accent palette we ship (Heritage 6.42:1,
  // Neon 5.22:1). If someone re-introduces `text-era-inverse`
  // here this test will catch it before axe ever runs.
  it("active item uses text-white on accent-600 for AA-passing contrast", () => {
    render(<Sidebar sections={SECTIONS} value="boards" />);
    const active = screen.getByText("보드 목록").closest("a");
    expect(active).not.toBeNull();
    expect(active!.className).toContain("bg-[rgb(var(--accent-600))]");
    expect(active!.className).toContain("text-white");
    // The era-coupled `text-era-inverse` must NOT come back — it inverts
    // poorly on Neon's purple-blue accent and produced phantom contrast
    // failures in axe.
    expect(active!.className).not.toContain("text-era-inverse");
    // Inactive items must not carry the active-only color tokens.
    const inactive = screen.getByText("홈").closest("a");
    expect(inactive!.className).not.toContain("bg-[rgb(var(--accent-600))]");
    expect(inactive!.className).not.toContain("text-white");
  });

  it("icon span is aria-hidden so the link's accessible name is the label only", () => {
    // Regression guard for `aria-hidden-focus`: the icon wrapper carries
    // `aria-hidden="true"` but is NOT focusable and contains no focusable
    // descendants — only the parent <a> is focusable. axe's
    // aria-hidden-focus rule fires when an aria-hidden subtree contains a
    // tabbable element; this test asserts that pattern stays clean.
    render(<Sidebar sections={SECTIONS} />);
    const link = screen.getByText("홈").closest("a")!;
    const iconSpan = link.querySelector('span[aria-hidden="true"]');
    expect(iconSpan).not.toBeNull();
    // The icon span itself must not be focusable.
    expect(iconSpan).not.toHaveAttribute("tabindex");
    // No focusable descendants inside the aria-hidden subtree.
    expect(
      iconSpan!.querySelectorAll(
        "a, button, input, select, textarea, [tabindex]",
      ),
    ).toHaveLength(0);
    // Accessible name is the label, not the icon.
    expect(link).toHaveAccessibleName("홈");
  });
});

// ==========================================================================
// SidebarShell (compound API)
// ==========================================================================

describe("SidebarShell", () => {
  describe("Root", () => {
    it("renders nav with role and aria-label", () => {
      render(
        <SidebarShell>
          <div>content</div>
        </SidebarShell>,
      );
      const nav = screen.getByRole("navigation", { name: /sidebar/i });
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe("NAV");
    });

    it("uses default aria-label when omitted and honors custom aria-label override", () => {
      const { rerender } = render(
        <SidebarShell>
          <div>content</div>
        </SidebarShell>,
      );
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "Sidebar navigation",
      );

      rerender(
        <SidebarShell aria-label="관리자 메뉴">
          <div>content</div>
        </SidebarShell>,
      );
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "관리자 메뉴",
      );
    });

    // Wave 5b2-A5: explicit-prop coverage. The interface now documents
    // `aria-label` as a first-class prop (no longer just an HTMLAttributes
    // spread coincidence), so we assert that consumer-supplied labels
    // surface as the navigation landmark's accessible name without any
    // additional ARIA wiring on the consumer side.
    it("renders with a consumer-supplied aria-label as the navigation accessible name", () => {
      render(
        <SidebarShell aria-label="관리자 메뉴">
          <div>content</div>
        </SidebarShell>,
      );
      expect(
        screen.getByRole("navigation", { name: /관리자 메뉴/ }),
      ).toBeInTheDocument();
    });

    it("forwards ref to nav element", () => {
      const ref = createRef<HTMLElement>();
      render(
        <SidebarShell ref={ref}>
          <div>x</div>
        </SidebarShell>,
      );
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName).toBe("NAV");
    });

    it("respects controlled collapsed state", () => {
      const { rerender } = render(
        <SidebarShell collapsed={false}>
          <div>x</div>
        </SidebarShell>,
      );
      const nav = screen.getByRole("navigation");
      expect(nav.className).toContain("w-[284px]");

      rerender(
        <SidebarShell collapsed>
          <div>x</div>
        </SidebarShell>,
      );
      expect(nav.className).toContain("w-16");
    });

    it("uses defaultCollapsed when uncontrolled", () => {
      render(
        <SidebarShell defaultCollapsed>
          <div>x</div>
        </SidebarShell>,
      );
      expect(screen.getByRole("navigation").className).toContain("w-16");
    });

    it("exposes sub-components as static members (dot notation)", () => {
      expect(SidebarShell.Header).toBe(SidebarShellHeader);
      expect(SidebarShell.Content).toBe(SidebarShellContent);
      expect(SidebarShell.Footer).toBe(SidebarShellFooter);
      expect(SidebarShell.Group).toBe(SidebarShellGroup);
      expect(SidebarShell.GroupLabel).toBe(SidebarShellGroupLabel);
      expect(SidebarShell.Menu).toBe(SidebarShellMenu);
      expect(SidebarShell.MenuItem).toBe(SidebarShellMenuItem);
      expect(SidebarShell.MenuButton).toBe(SidebarShellMenuButton);
      expect(SidebarShell.MenuSub).toBe(SidebarShellMenuSub);
      expect(SidebarShell.MenuSubItem).toBe(SidebarShellMenuSubItem);
      expect(SidebarShell.MenuSubButton).toBe(SidebarShellMenuSubButton);
      expect(SidebarShell.UserProfile).toBe(SidebarShellUserProfile);
      expect(SidebarShell.Trigger).toBe(SidebarTrigger);
    });

    it("throws when sub-components used outside SidebarShell context", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<SidebarShellHeader title="X" />)).toThrow(
        /SidebarShell/i,
      );
      spy.mockRestore();
    });
  });

  describe("Trigger", () => {
    it("toggles collapsed state when clicked (uncontrolled)", () => {
      render(
        <SidebarShell>
          <SidebarTrigger />
        </SidebarShell>,
      );
      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("calls onCollapsedChange when controlled", () => {
      const onCollapsedChange = vi.fn();
      render(
        <SidebarShell collapsed={false} onCollapsedChange={onCollapsedChange}>
          <SidebarTrigger />
        </SidebarShell>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onCollapsedChange).toHaveBeenCalledWith(true);
    });

    it("renders default hamburger icon when no children", () => {
      const { container } = render(
        <SidebarShell>
          <SidebarTrigger />
        </SidebarShell>,
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders custom children if provided", () => {
      render(
        <SidebarShell>
          <SidebarTrigger>
            <span>Toggle</span>
          </SidebarTrigger>
        </SidebarShell>,
      );
      expect(screen.getByText("Toggle")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------- A1 layout members

  describe("Header", () => {
    it("renders title when not collapsed", () => {
      render(
        <SidebarShell>
          <SidebarShellHeader title="My App" />
        </SidebarShell>,
      );
      expect(screen.getByText("My App")).toBeInTheDocument();
    });

    it("hides title when collapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellHeader title="My App" />
        </SidebarShell>,
      );
      expect(screen.queryByText("My App")).not.toBeInTheDocument();
    });

    it("renders trigger when showTrigger=true", () => {
      render(
        <SidebarShell>
          <SidebarShellHeader title="X" showTrigger />
        </SidebarShell>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("renders logo when not collapsed", () => {
      render(
        <SidebarShell>
          <SidebarShellHeader logo={<span data-testid="logo">L</span>} />
        </SidebarShell>,
      );
      expect(screen.getByTestId("logo")).toBeInTheDocument();
    });

    it("hides logo when collapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellHeader logo={<span data-testid="logo">L</span>} />
        </SidebarShell>,
      );
      expect(screen.queryByTestId("logo")).not.toBeInTheDocument();
    });

    it("renders children below the title row", () => {
      render(
        <SidebarShell>
          <SidebarShellHeader title="X">
            <div data-testid="extra">extra</div>
          </SidebarShellHeader>
        </SidebarShell>,
      );
      expect(screen.getByTestId("extra")).toBeInTheDocument();
    });

    it("forwards ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <SidebarShell>
          <SidebarShellHeader ref={ref} title="X" />
        </SidebarShell>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Content", () => {
    it("renders children", () => {
      render(
        <SidebarShell>
          <SidebarShellContent>
            <div>body</div>
          </SidebarShellContent>
        </SidebarShell>,
      );
      expect(screen.getByText("body")).toBeInTheDocument();
    });

    it("uses overflow-y-auto when not collapsed", () => {
      render(
        <SidebarShell>
          <SidebarShellContent data-testid="content">
            <div />
          </SidebarShellContent>
        </SidebarShell>,
      );
      expect(screen.getByTestId("content").className).toContain(
        "overflow-y-auto",
      );
    });

    it("uses overflow-visible when collapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellContent data-testid="content">
            <div />
          </SidebarShellContent>
        </SidebarShell>,
      );
      expect(screen.getByTestId("content").className).toContain(
        "overflow-visible",
      );
    });

    it("forwards ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <SidebarShell>
          <SidebarShellContent ref={ref}>
            <div />
          </SidebarShellContent>
        </SidebarShell>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    // axe `scrollable-region-focusable` (WCAG 2.1.1): scrollable
    // containers must be reachable by keyboard. The expanded content
    // div is `overflow-y-auto`, so it gets `tabIndex=0` automatically.
    it("is keyboard-focusable when expanded (scrollable-region-focusable)", () => {
      render(
        <SidebarShell>
          <SidebarShellContent data-testid="content">
            <div />
          </SidebarShellContent>
        </SidebarShell>,
      );
      expect(screen.getByTestId("content")).toHaveAttribute("tabindex", "0");
    });

    it("does not add a tabindex when collapsed (no scroll, no tab stop)", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellContent data-testid="content">
            <div />
          </SidebarShellContent>
        </SidebarShell>,
      );
      // When collapsed the wrapper is `overflow-visible` so we leave
      // tabindex unset to avoid an empty tab stop on the rail.
      expect(screen.getByTestId("content")).not.toHaveAttribute("tabindex");
    });

    it("respects an explicit tabIndex override", () => {
      render(
        <SidebarShell>
          <SidebarShellContent data-testid="content" tabIndex={-1}>
            <div />
          </SidebarShellContent>
        </SidebarShell>,
      );
      expect(screen.getByTestId("content")).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("Footer", () => {
    it("renders children", () => {
      render(
        <SidebarShell>
          <SidebarShellFooter>
            <div>foot</div>
          </SidebarShellFooter>
        </SidebarShell>,
      );
      expect(screen.getByText("foot")).toBeInTheDocument();
    });

    it("forwards ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <SidebarShell>
          <SidebarShellFooter ref={ref}>
            <div />
          </SidebarShellFooter>
        </SidebarShell>,
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Group", () => {
    it("renders with role=group", () => {
      render(
        <SidebarShell>
          <SidebarShellGroup>
            <div>g</div>
          </SidebarShellGroup>
        </SidebarShell>,
      );
      expect(screen.getByRole("group")).toBeInTheDocument();
    });
  });

  describe("GroupLabel", () => {
    it("renders label when not collapsed", () => {
      render(
        <SidebarShell>
          <SidebarShellGroupLabel>메뉴</SidebarShellGroupLabel>
        </SidebarShell>,
      );
      expect(screen.getByText("메뉴")).toBeInTheDocument();
    });

    it("hides itself entirely when collapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellGroupLabel>메뉴</SidebarShellGroupLabel>
        </SidebarShell>,
      );
      expect(screen.queryByText("메뉴")).not.toBeInTheDocument();
    });
  });

  // ------------------------------------------------------- A2 menu members

  describe("Menu", () => {
    it("renders ul with role=list", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>홈</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const list = screen.getByRole("list");
      expect(list.tagName).toBe("UL");
    });

    it("supports ArrowDown / ArrowUp keyboard navigation", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu data-testid="menu">
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>A</SidebarShellMenuButton>
            </SidebarShellMenuItem>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>B</SidebarShellMenuButton>
            </SidebarShellMenuItem>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>C</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const buttons = screen.getAllByRole("button");
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      fireEvent.keyDown(screen.getByTestId("menu"), { key: "ArrowDown" });
      expect(document.activeElement).toBe(buttons[1]);

      fireEvent.keyDown(screen.getByTestId("menu"), { key: "ArrowDown" });
      expect(document.activeElement).toBe(buttons[2]);

      // wraps
      fireEvent.keyDown(screen.getByTestId("menu"), { key: "ArrowDown" });
      expect(document.activeElement).toBe(buttons[0]);

      // up wraps to last
      fireEvent.keyDown(screen.getByTestId("menu"), { key: "ArrowUp" });
      expect(document.activeElement).toBe(buttons[2]);
    });

    it("supports Home / End", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu data-testid="menu">
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>A</SidebarShellMenuButton>
            </SidebarShellMenuItem>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>B</SidebarShellMenuButton>
            </SidebarShellMenuItem>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>C</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const buttons = screen.getAllByRole("button");
      buttons[1].focus();
      fireEvent.keyDown(screen.getByTestId("menu"), { key: "Home" });
      expect(document.activeElement).toBe(buttons[0]);
      fireEvent.keyDown(screen.getByTestId("menu"), { key: "End" });
      expect(document.activeElement).toBe(buttons[2]);
    });

    it("calls user-supplied onKeyDown alongside built-in handler", () => {
      const onKeyDown = vi.fn();
      render(
        <SidebarShell>
          <SidebarShellMenu data-testid="menu" onKeyDown={onKeyDown}>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>A</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      fireEvent.keyDown(screen.getByTestId("menu"), { key: "ArrowDown" });
      expect(onKeyDown).toHaveBeenCalled();
    });
  });

  describe("MenuItem", () => {
    it("renders an li", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem data-testid="item">
              <SidebarShellMenuButton>홈</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.getByTestId("item").tagName).toBe("LI");
    });

    it("controlled expanded prop drives sub-menu visibility", () => {
      const { rerender } = render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem expanded={false}>
              <SidebarShellMenuButton hasSub>Group</SidebarShellMenuButton>
              <SidebarShellMenuSub data-testid="sub">
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton>Child</SidebarShellMenuSubButton>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.getByTestId("sub").className).toContain("hidden");

      rerender(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem expanded={true}>
              <SidebarShellMenuButton hasSub>Group</SidebarShellMenuButton>
              <SidebarShellMenuSub data-testid="sub">
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton>Child</SidebarShellMenuSubButton>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.getByTestId("sub").className).not.toContain("hidden");
    });

    it("calls onExpandedChange when toggled", () => {
      const onExpandedChange = vi.fn();
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem onExpandedChange={onExpandedChange}>
              <SidebarShellMenuButton hasSub>Group</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    });
  });

  describe("MenuButton", () => {
    it("renders text content and active aria-current", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton active>홈</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("aria-current", "page");
      expect(btn.textContent).toContain("홈");
    });

    it("renders icon", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton icon={<span data-testid="icon">i</span>}>
                홈
              </SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("hides nav variant button when collapsed without showWhenCollapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton>홈</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows nav variant button when collapsed with showWhenCollapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton showWhenCollapsed>
                홈
              </SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("always shows action variant when collapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton variant="action">
                +
              </SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("toggles parent expanded when hasSub", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton hasSub>Group</SidebarShellMenuButton>
              <SidebarShellMenuSub data-testid="sub">
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton>X</SidebarShellMenuSubButton>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const sub = screen.getByTestId("sub");
      expect(sub.className).toContain("hidden");
      fireEvent.click(screen.getAllByRole("button")[0]);
      expect(sub.className).not.toContain("hidden");
    });

    it("sets aria-expanded and aria-controls when hasSub", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton hasSub>Group</SidebarShellMenuButton>
              <SidebarShellMenuSub data-testid="sub">
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton>X</SidebarShellMenuSubButton>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const btn = screen.getAllByRole("button")[0];
      expect(btn).toHaveAttribute("aria-expanded", "false");
      const controlsId = btn.getAttribute("aria-controls");
      expect(controlsId).toBeTruthy();
      expect(screen.getByTestId("sub").id).toBe(controlsId);
    });

    it("applies expected style classes via style fn", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton active>홈</SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const btn = screen.getByRole("button");
      const expected = sidebarShellMenuButtonStyles({ active: true });
      // Every class fragment from the style fn must appear on the button
      for (const cls of expected.split(/\s+/).filter(Boolean)) {
        expect(btn.className).toContain(cls);
      }
    });

    // axe `color-contrast` (WCAG 1.4.3): the active label must clear AA
    // on both Heritage and Neon surfaces. We paint it from
    // `--era-accent-strong` (accent-700 in Heritage / accent-300 in Neon)
    // — NOT a hard-coded `--accent-700`, which lands at ~2.7:1 on Neon.
    it("active button paints from --era-accent-strong (era-aware contrast)", () => {
      const active = sidebarShellMenuButtonStyles({ active: true });
      expect(active).toContain("text-[rgb(var(--era-accent-strong))]");
      expect(active).not.toContain("text-[rgb(var(--accent-700))]");
    });

    it("calls user onClick", () => {
      const onClick = vi.fn();
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem>
              <SidebarShellMenuButton onClick={onClick}>
                홈
              </SidebarShellMenuButton>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("MenuSub / MenuSubItem / MenuSubButton", () => {
    it("MenuSub does not render when sidebar collapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellMenu>
            <SidebarShellMenuItem expanded>
              <SidebarShellMenuButton showWhenCollapsed hasSub>
                Group
              </SidebarShellMenuButton>
              <SidebarShellMenuSub data-testid="sub">
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton>X</SidebarShellMenuSubButton>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      expect(screen.queryByTestId("sub")).not.toBeInTheDocument();
    });

    it("MenuSub uses nested styles when nested=true", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem expanded>
              <SidebarShellMenuButton hasSub>Group</SidebarShellMenuButton>
              <SidebarShellMenuSub nested data-testid="sub">
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton>X</SidebarShellMenuSubButton>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      // nested uses ps-6, non-nested uses ps-[38px]
      expect(screen.getByTestId("sub").className).toContain("ps-6");
    });

    // axe `color-contrast`: every active/expanded sub-button label is
    // painted via `--era-accent-strong` so it clears AA in BOTH eras.
    // Hard-coded `--accent-700` is dark-purple in Neon and fails AA on
    // the void surface — covered by the era-compare a11y gate.
    it("MenuSubButton uses --era-accent-strong for all active/expanded states", () => {
      const list = sidebarShellMenuSubButtonStyles({ active: true });
      const headerActive = sidebarShellMenuSubButtonStyles({
        active: true,
        isHeader: true,
      });
      const headerExpanded = sidebarShellMenuSubButtonStyles({
        isHeader: true,
        inExpandedGroup: true,
      });
      for (const out of [list, headerActive, headerExpanded]) {
        expect(out).toContain("text-[rgb(var(--era-accent-strong))]");
        expect(out).not.toContain("text-[rgb(var(--accent-700))]");
      }
    });

    it("MenuSubButton renders header style and forwards aria-current when active", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem expanded>
              <SidebarShellMenuButton hasSub>Group</SidebarShellMenuButton>
              <SidebarShellMenuSub>
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton active isHeader>
                    Header
                  </SidebarShellMenuSubButton>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const buttons = screen.getAllByRole("button");
      const headerBtn = buttons[buttons.length - 1];
      expect(headerBtn).toHaveAttribute("aria-current", "page");
      const expected = sidebarShellMenuSubButtonStyles({
        active: true,
        isHeader: true,
      });
      for (const cls of expected.split(/\s+/).filter(Boolean)) {
        expect(headerBtn.className).toContain(cls);
      }
    });

    it("MenuSubButton with hasSub toggles its own expanded state", () => {
      render(
        <SidebarShell>
          <SidebarShellMenu>
            <SidebarShellMenuItem expanded>
              <SidebarShellMenuButton hasSub>L1</SidebarShellMenuButton>
              <SidebarShellMenuSub>
                <SidebarShellMenuSubItem>
                  <SidebarShellMenuSubButton hasSub isHeader>
                    L2
                  </SidebarShellMenuSubButton>
                  <SidebarShellMenuSub nested data-testid="l3">
                    <SidebarShellMenuSubItem>
                      <SidebarShellMenuSubButton>L3</SidebarShellMenuSubButton>
                    </SidebarShellMenuSubItem>
                  </SidebarShellMenuSub>
                </SidebarShellMenuSubItem>
              </SidebarShellMenuSub>
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      const l3 = screen.getByTestId("l3");
      expect(l3.className).toContain("hidden");
      // Click L2 (the second button in the tree: L1 is index 0, L2 is index 1)
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[1]);
      expect(l3.className).not.toContain("hidden");
    });

    it("MenuSubButton hidden when collapsed and not showWhenCollapsed", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellMenu>
            <SidebarShellMenuItem expanded>
              <SidebarShellMenuButton showWhenCollapsed hasSub>
                Group
              </SidebarShellMenuButton>
              {/* MenuSub itself returns null when collapsed, so we won't see SubButton anyway */}
            </SidebarShellMenuItem>
          </SidebarShellMenu>
        </SidebarShell>,
      );
      // Only the parent menu button should remain.
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });

  // ----------------------------------------------------------- A3 user profile

  describe("UserProfile", () => {
    const USER = { displayName: "Terry", plan: "Pro" };

    it("renders display name and plan", () => {
      render(
        <SidebarShell>
          <SidebarShellUserProfile user={USER} />
        </SidebarShell>,
      );
      expect(screen.getByText("Terry")).toBeInTheDocument();
      expect(screen.getByText(/Pro/)).toBeInTheDocument();
    });

    it("renders avatar fallback initial", () => {
      render(
        <SidebarShell>
          <SidebarShellUserProfile user={USER} />
        </SidebarShell>,
      );
      expect(screen.getByText("T")).toBeInTheDocument();
    });

    it("renders as a button", () => {
      render(
        <SidebarShell>
          <SidebarShellUserProfile user={USER} />
        </SidebarShell>,
      );
      const btn = screen.getByRole("button");
      expect(btn).toBeInTheDocument();
      expect(btn.tagName).toBe("BUTTON");
    });

    it("calls onClick when clicked", () => {
      const onClick = vi.fn();
      render(
        <SidebarShell>
          <SidebarShellUserProfile user={USER} onClick={onClick} />
        </SidebarShell>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalled();
    });

    it("forwards ref", () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <SidebarShell>
          <SidebarShellUserProfile ref={ref} user={USER} />
        </SidebarShell>,
      );
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("hides text when collapsed but keeps the button", () => {
      render(
        <SidebarShell defaultCollapsed>
          <SidebarShellUserProfile user={USER} />
        </SidebarShell>,
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.queryByText("Terry")).not.toBeInTheDocument();
    });
  });
});
