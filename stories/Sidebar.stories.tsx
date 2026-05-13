import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Sidebar, type SidebarSection } from "@/components/Sidebar";
import { bothEras } from "./_shared/argTypes";

/**
 * Inline icon helper. Uses `currentColor` so it inherits era-aware text
 * tokens (no hex/rgb leaks). Sized in Tailwind utilities only.
 */
const Icon = ({ d }: { d: string }): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const HOME_ICON = (
  <Icon d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
);
const INBOX_ICON = (
  <Icon d="M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
);
const SEARCH_ICON = (
  <Icon d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
);
const SETTINGS_ICON = (
  <Icon d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
);
const HELP_ICON = (
  <Icon d="M12 22a10 10 0 100-20 10 10 0 000 20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
);

const DEFAULT_SECTIONS: ReadonlyArray<SidebarSection> = [
  {
    items: [
      { value: "home", label: "홈" },
      { value: "inbox", label: "받은 편지함" },
      { value: "search", label: "검색" },
      { value: "settings", label: "설정" },
    ],
  },
];

const SECTIONED: ReadonlyArray<SidebarSection> = [
  {
    heading: "메뉴",
    items: [
      { value: "home", label: "홈" },
      { value: "inbox", label: "받은 편지함" },
      { value: "search", label: "검색" },
    ],
  },
  {
    heading: "관리",
    items: [
      { value: "settings", label: "설정" },
      { value: "help", label: "도움말" },
    ],
  },
];

const ICON_SECTIONS: ReadonlyArray<SidebarSection> = [
  {
    heading: "탐색",
    items: [
      { value: "home", label: "홈", icon: HOME_ICON },
      { value: "inbox", label: "받은 편지함", icon: INBOX_ICON },
      { value: "search", label: "검색", icon: SEARCH_ICON },
    ],
  },
  {
    heading: "기타",
    items: [
      { value: "settings", label: "설정", icon: SETTINGS_ICON },
      { value: "help", label: "도움말", icon: HELP_ICON },
    ],
  },
];

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Sidebar (legacy flat API) renders a data-driven `<nav>` of grouped " +
          "items. Items are passed via `sections`; the active item is " +
          "controlled with `value` and changes are reported through `onChange`. " +
          "All visuals flow through era-aware tokens, so the component adapts " +
          "to Heritage and Neon without re-rendering. " +
          "**Note:** for new work prefer the compound `SidebarShell` API, which " +
          "supports collapsing, nested sub-menus, keyboard navigation " +
          "(ArrowUp/Down, Home/End), header/footer slots, and a user profile.",
      },
    },
  },
  argTypes: {
    value: {
      control: { type: "text" as const },
      description: "Currently active item value (matched against item.value)",
    },
    onChange: { action: "change" },
    className: { control: false },
    sections: { control: false },
  },
  args: {
    sections: SECTIONED,
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof Sidebar>;

/** Basic flat sidebar with a single (unlabeled) section of items. */
export const Default: Story = {
  args: {
    sections: DEFAULT_SECTIONS,
  },
};

/** Items grouped under section headings. Headings render in muted era text. */
export const WithSections: Story = {
  args: {
    sections: SECTIONED,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Each section optionally takes a `heading`. Headings are rendered " +
          "as visually distinct group labels but are not exposed as ARIA " +
          "landmarks — they are presentational dividers only.",
      },
    },
  },
};

/** Items with leading icons (inline SVG using `currentColor`). */
export const WithIcons: Story = {
  args: {
    sections: ICON_SECTIONS,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Icons accept any `ReactNode`. The wrapper is `aria-hidden`, so the " +
          "label remains the accessible name of the link.",
      },
    },
  },
};

/** One item marked active via the `value` prop — reflected as `aria-current="page"`. */
export const WithActiveItem: Story = {
  args: {
    sections: ICON_SECTIONS,
    value: "inbox",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Active item is driven by the controlled `value` prop. The matching " +
          'item receives `aria-current="page"` and an accent surface.',
      },
    },
  },
};

/**
 * Disabled item demonstration.
 *
 * **Deviation note:** the flat `Sidebar` component does not expose a native
 * `disabled` flag on `SidebarItem` (only `SidebarShell.MenuButton` does).
 * To approximate disabled state without modifying the component, this story
 * supplies a custom `label` element that opts out of pointer events and
 * exposes `aria-disabled`. Migrating to `SidebarShell` is recommended for
 * any UI that needs first-class disabled support.
 */
export const WithDisabledItem: Story = {
  args: {
    sections: [
      {
        heading: "메뉴",
        items: [
          { value: "home", label: "홈", icon: HOME_ICON },
          { value: "inbox", label: "받은 편지함", icon: INBOX_ICON },
          {
            value: "billing",
            label: (
              <span
                aria-disabled="true"
                className="pointer-events-none flex flex-1 items-center justify-between gap-2 opacity-50"
              >
                <span>결제</span>
                <span className="rounded-pill bg-era-raised px-2 py-0.5 text-label font-medium uppercase tracking-wide text-era-muted">
                  Soon
                </span>
              </span>
            ),
            icon: SETTINGS_ICON,
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "The flat API has no `disabled` prop on items. A disabled-looking " +
          "item is composed via a custom `label` that carries " +
          '`aria-disabled="true"` and `pointer-events-none`, plus a muted ' +
          "tag. For real disabled semantics use `SidebarShell.MenuButton`.",
      },
    },
  },
};

/** Heritage and Neon side-by-side. Same data, different era surfaces. */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Demonstrates that Sidebar is era-agnostic: layout and structure " +
          "are constant, only era-aware tokens (background, text, accent) " +
          "swap underneath.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <Sidebar sections={ICON_SECTIONS} value="inbox" onChange={() => {}} />
    )),
};

/**
 * Interactive verification:
 *  - clicking a non-active item fires `onChange` with the item's `value`
 *  - the active item exposes `aria-current="page"`
 *  - keyboard Tab moves focus through items in document order
 */
export const Interactive: Story = {
  args: {
    sections: ICON_SECTIONS,
    onChange: fn(),
  },
  render: function InteractiveRender(args) {
    const [value, setValue] = useState<string | undefined>("home");
    return (
      <Sidebar
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange?.(next);
        }}
        data-testid="sidebar"
      />
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Active item starts on "home" and is marked aria-current="page".
    const homeLink = canvas.getByText("홈").closest("a");
    if (!homeLink) throw new Error("home link not found");
    await expect(homeLink).toHaveAttribute("aria-current", "page");

    // Inbox is not yet active.
    const inboxLink = canvas.getByText("받은 편지함").closest("a");
    if (!inboxLink) throw new Error("inbox link not found");
    await expect(inboxLink).not.toHaveAttribute("aria-current");

    // Click inbox: onChange must fire with "inbox", and the active state
    // must move to inbox (controlled in the render wrapper).
    await userEvent.click(inboxLink);
    await expect(args.onChange).toHaveBeenCalledWith("inbox");
    await expect(inboxLink).toHaveAttribute("aria-current", "page");
    await expect(homeLink).not.toHaveAttribute("aria-current");

    // Keyboard Tab moves focus through the anchor list in document order.
    // Reset focus to the document body, then walk forward.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Items are plain anchors inside a <nav> landmark, exposed as role=link.
    // (Earlier revisions used role="menuitem" which violated axe's
    // `aria-required-parent` because there was no role="menu" wrapper.)
    const links = canvas.getAllByRole("link");
    await expect(links.length).toBeGreaterThan(1);

    await userEvent.tab();
    await expect(document.activeElement).toBe(links[0]);

    await userEvent.tab();
    await expect(document.activeElement).toBe(links[1]);

    await userEvent.tab();
    await expect(document.activeElement).toBe(links[2]);

    // Wait for the active item's CSS color transition (`duration-era` =
    // `--era-dur-normal`, up to ~380ms in Heritage) to settle BEFORE the
    // test-runner's postVisit hook samples colors with axe-core. Without
    // this, axe captures intermediate transition pixels (e.g., a desaturated
    // tan instead of accent-600) and reports a phantom contrast failure even
    // though the final state passes WCAG AA. We poll the computed background
    // until it matches the final accent-600 value, which is more robust than
    // a fixed sleep.
    await waitFor(
      () => {
        const active = inboxLink as HTMLAnchorElement;
        const cs = window.getComputedStyle(active);
        // Final state: bg = rgb(var(--accent-600)) = rgb(138, 80, 48)
        // (Heritage default — no era set on the toolbar in this story).
        // We only assert that the transition is no longer in flight by
        // checking the bg is the saturated end-state, not a mid-transition
        // tint.
        expect(cs.backgroundColor).toBe("rgb(138, 80, 48)");
      },
      { timeout: 1000 },
    );
  },
};
