import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/Button";
import {
  DropdownMenu,
  type DropdownMenuItem,
  type DropdownMenuSection,
} from "@/components/DropdownMenu";
import { Stack } from "@/components/Stack";
import { boolArg, bothEras } from "./_shared/argTypes";

/**
 * Inline SVG icon helper used by `WithIcons`. Kept local so the story file
 * has zero runtime dependencies beyond the design-system surface.
 */
const Icon = ({ path }: { path: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

const ICONS = {
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  trash:
    "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6",
  more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  check: "M20 6 9 17l-5-5",
  copy: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
} as const;

/**
 * Default 4-item flat list reused by Default, Controlled, OnButton, and
 * Interactive. Kept frozen so reordering across stories is impossible.
 */
const BASE_ITEMS: ReadonlyArray<DropdownMenuItem> = [
  { key: "profile", label: "프로필" },
  { key: "settings", label: "설정" },
  { key: "team", label: "팀 관리" },
  { key: "logout", label: "로그아웃" },
];

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    // DropdownMenu's surface mounts via a portal, so `#storybook-root`
    // (what the test-runner screenshots) only ever contains the trigger
    // button. The resulting snapshot is just button pixels — meaningless
    // as a menu regression test and prone to cross-OS font-rendering
    // jitter.
    visualSnapshot: { disable: true },
    docs: {
      description: {
        component:
          "DropdownMenu renders a `role='menu'` surface with one `<button role='menuitem'>` per item. Item groups separated by `role='separator'` are rendered when `items` is supplied as `ReadonlyArray<DropdownMenuSection>`. Each item supports a leading `icon`, a `disabled` flag (mapped to native `<button disabled>`), a `danger` flag (visual-only emphasis), and an `onSelect` handler.\n\n" +
          "**WAI-ARIA menu keyboard pattern (implemented)**:\n" +
          "- **Roving tabindex** — only the focused item has `tabindex=0`; all other items have `tabindex=-1`. The first non-disabled item receives `tabindex=0` on mount.\n" +
          "- **Initial focus** — when the menu mounts (i.e. when the consumer renders it), focus moves to the first non-disabled item within one frame.\n" +
          "- **Arrow keys** — `ArrowDown`/`ArrowUp` move focus, wrapping at the ends and skipping disabled items.\n" +
          "- **Home / End** — jump to first / last non-disabled item.\n" +
          "- **Enter / Space** — activate the focused item (calls `onSelect`) and, by default, calls `onClose` so the consumer can unmount.\n" +
          "- **Escape** — calls `onClose` without activating an item.\n" +
          "- **Tab / Shift+Tab** — calls `onClose` and lets focus proceed naturally to the next/prev focusable element on the page (the menu does not trap Tab).\n\n" +
          "**Consumer responsibilities**: `DropdownMenu` is presentation-only — it does NOT render a trigger or own open/close state. Wire `onClose` to set your `open` flag to `false`, and restore focus to the trigger via a ref (see the `Controlled` and `OnButton` stories for the canonical pattern).\n\n" +
          "**Behavior change vs. previous build**: items previously sat in the native Tab order; consumers relying on Tab to cycle through every item will now see Tab close the menu instead. Use ArrowDown/ArrowUp inside the menu.\n\n" +
          "**Out of scope for this build**: typeahead (typing letters to jump to matching items), submenu navigation (`aria-haspopup` on items, Right/Left to open/close submenus), `menuitemcheckbox`/`menuitemradio` first-class roles. The checkbox and radio stories below emulate the visual pattern with plain `menuitem` + a `closeOnSelect={false}` toggle.\n\n" +
          "Era-aware tokens (`bg-era-raised`, `border-era`, `shadow-era-card`, `bg-era-soft`, `text-era-primary`, `--era-intent-error`, `duration-era-fast`, `ease-era-brush`) make the surface flip cleanly between Heritage and Neon without re-rendering React.",
      },
    },
  },
  argTypes: {
    className: boolArg("Optional className passthrough on the menu surface"),
  },
  args: {
    items: BASE_ITEMS,
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

/**
 * Default flat menu with four items. The surface is rendered open at all
 * times because `DropdownMenu` does not own open/close state — wire it to a
 * trigger in your app (see `OnButton`).
 */
export const Default: Story = {
  args: {
    items: BASE_ITEMS,
  },
};

/**
 * Items render an optional leading `icon` slot (any `ReactNode`). The icon
 * is wrapped in a `<span aria-hidden='true'>` so it is announced as
 * decorative only — labels remain the accessible name.
 */
export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each item declares an `icon` ReactNode. The component wraps the icon in `<span aria-hidden='true'>`, so screen readers announce the label only.",
      },
    },
  },
  args: {
    items: [
      { key: "profile", label: "프로필", icon: <Icon path={ICONS.user} /> },
      { key: "settings", label: "설정", icon: <Icon path={ICONS.settings} /> },
      { key: "share", label: "공유", icon: <Icon path={ICONS.share} /> },
      { key: "logout", label: "로그아웃", icon: <Icon path={ICONS.logout} /> },
    ] as ReadonlyArray<DropdownMenuItem>,
  },
};

/**
 * Pass `items` as `ReadonlyArray<DropdownMenuSection>` to insert a
 * `role='separator'` between groups. A separator is rendered only between
 * sections (never as the first or last child).
 */
export const WithDividers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Sectioned mode: `items` is a `ReadonlyArray<DropdownMenuSection>`. The component inserts a `role='separator'` between each section and detects the shape via the presence of an `items` field on the first element.",
      },
    },
  },
  args: {
    items: [
      {
        items: [
          { key: "profile", label: "프로필", icon: <Icon path={ICONS.user} /> },
          {
            key: "settings",
            label: "설정",
            icon: <Icon path={ICONS.settings} />,
          },
        ],
      },
      {
        items: [
          { key: "copy", label: "복사", icon: <Icon path={ICONS.copy} /> },
          { key: "share", label: "공유", icon: <Icon path={ICONS.share} /> },
        ],
      },
      {
        items: [
          {
            key: "logout",
            label: "로그아웃",
            icon: <Icon path={ICONS.logout} />,
          },
        ],
      },
    ] as ReadonlyArray<DropdownMenuSection>,
  },
};

/**
 * Disabled items map to native `<button disabled>`. The keyboard pattern
 * (ArrowDown/ArrowUp/Home/End) skips disabled items, and the native button
 * is also dropped from the document tab order — so neither path can land
 * focus on a disabled item.
 */
export const WithDisabledItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The middle item is disabled. ArrowDown/ArrowUp navigation skips it, and because the underlying element is `<button disabled>`, native Tab also bypasses it.",
      },
    },
  },
  args: {
    items: [
      { key: "edit", label: "편집", icon: <Icon path={ICONS.edit} /> },
      {
        key: "duplicate",
        label: "복제 (잠김)",
        icon: <Icon path={ICONS.copy} />,
        disabled: true,
      },
      { key: "share", label: "공유", icon: <Icon path={ICONS.share} /> },
      {
        key: "logout",
        label: "로그아웃",
        icon: <Icon path={ICONS.logout} />,
      },
    ] as ReadonlyArray<DropdownMenuItem>,
  },
};

/**
 * Items can flag themselves as `danger` for destructive actions. The flag
 * recolors the item to `--era-intent-error` and gives it a low-alpha red
 * hover background, but does *not* add any accessibility marker — confirm
 * destructive intent in your handler (e.g., a confirm dialog).
 */
export const WithDestructiveItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The trash item carries `danger: true`, which paints the label and icon with `text-[var(--era-intent-error)]`. **Reported gap**: there is no `aria-roledescription`, `data-destructive`, or other a11y marker — destructive emphasis is purely visual.",
      },
    },
  },
  args: {
    items: [
      { key: "edit", label: "편집", icon: <Icon path={ICONS.edit} /> },
      { key: "share", label: "공유", icon: <Icon path={ICONS.share} /> },
      {
        key: "delete",
        label: "삭제",
        icon: <Icon path={ICONS.trash} />,
        danger: true,
      },
    ] as ReadonlyArray<DropdownMenuItem>,
  },
};

/**
 * Submenu support is **not implemented** in this build. The closest
 * available approximation is a labelled section, shown here. Use it as a
 * placeholder until a real `submenu` API ships.
 */
export const Submenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Out of scope for this build**: `DropdownMenu` does not expose nested-submenu items, `aria-haspopup` on items, or Right/Left arrow key handling for submenu open/close. This story renders a labelled section as a flat fallback so the visual hierarchy still reads. Do not rely on it for keyboard submenu navigation.",
      },
    },
  },
  args: {
    items: [
      {
        items: [
          {
            key: "new-doc",
            label: "새 문서",
            icon: <Icon path={ICONS.edit} />,
          },
          { key: "new-team", label: "새 팀", icon: <Icon path={ICONS.user} /> },
        ],
      },
      {
        items: [
          {
            key: "share-link",
            label: "공유 링크 복사",
            icon: <Icon path={ICONS.copy} />,
          },
          {
            key: "share-email",
            label: "이메일로 보내기",
            icon: <Icon path={ICONS.share} />,
          },
        ],
      },
    ] as ReadonlyArray<DropdownMenuSection>,
  },
};

/**
 * `menuitemcheckbox` is **not implemented** as a first-class role. This
 * story emulates multi-select toggles by setting `closeOnSelect={false}` so
 * the menu stays open while the user toggles values, and rendering a
 * leading checkmark. The underlying role is still plain `menuitem`.
 */
export const WithCheckbox: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Reported gap**: `DropdownMenu` does not support `role='menuitemcheckbox'` or `aria-checked`. This story sets `closeOnSelect={false}` so the menu stays open across toggles, and emulates the visual pattern by rendering a leading check icon driven by local state. The role under the hood is still `menuitem`, which screen readers will announce as a one-shot action rather than a togglable state.",
      },
    },
  },
  render: () => {
    const CheckboxDemo = () => {
      const [checked, setChecked] = useState<Record<string, boolean>>({
        bold: true,
        italic: false,
        underline: false,
      });
      const toggle = (key: string) =>
        setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
      const renderLabel = (key: string, label: string): ReactNode => (
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: "16px",
              justifyContent: "center",
              opacity: checked[key] ? 1 : 0,
            }}
          >
            <Icon path={ICONS.check} />
          </span>
          {label}
        </span>
      );
      return (
        <DropdownMenu
          closeOnSelect={false}
          items={
            [
              {
                key: "bold",
                label: renderLabel("bold", "굵게"),
                onSelect: () => toggle("bold"),
              },
              {
                key: "italic",
                label: renderLabel("italic", "기울임"),
                onSelect: () => toggle("italic"),
              },
              {
                key: "underline",
                label: renderLabel("underline", "밑줄"),
                onSelect: () => toggle("underline"),
              },
            ] as ReadonlyArray<DropdownMenuItem>
          }
        />
      );
    };
    return <CheckboxDemo />;
  },
};

/**
 * `menuitemradio` is **not implemented**. This story emulates a single-
 * select radio group with a leading checkmark on the active item; the
 * underlying role is still plain `menuitem`. `closeOnSelect={false}` keeps
 * the menu open so the user can sample multiple options.
 */
export const WithRadio: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "**Reported gap**: `DropdownMenu` does not support `role='menuitemradio'`, `aria-checked`, or implicit grouping. This story emulates a radio group by tracking a single active key and rendering a leading check icon. `closeOnSelect={false}` keeps the menu open across selections. Treat as a visual-only fallback.",
      },
    },
  },
  render: () => {
    const RadioDemo = () => {
      const [active, setActive] = useState<string>("medium");
      const renderLabel = (key: string, label: string): ReactNode => (
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: "16px",
              justifyContent: "center",
              opacity: active === key ? 1 : 0,
            }}
          >
            <Icon path={ICONS.check} />
          </span>
          {label}
        </span>
      );
      return (
        <DropdownMenu
          closeOnSelect={false}
          items={
            [
              {
                key: "small",
                label: renderLabel("small", "작게"),
                onSelect: () => setActive("small"),
              },
              {
                key: "medium",
                label: renderLabel("medium", "보통"),
                onSelect: () => setActive("medium"),
              },
              {
                key: "large",
                label: renderLabel("large", "크게"),
                onSelect: () => setActive("large"),
              },
            ] as ReadonlyArray<DropdownMenuItem>
          }
        />
      );
    };
    return <RadioDemo />;
  },
};

/**
 * Controlled open/close demonstrating the canonical trigger-focus pattern:
 * `onClose` clears `isOpen`, and a `ref` to the trigger button is used to
 * restore focus after the menu unmounts. The play function asserts that
 * focus returns to the trigger after Escape.
 */
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Because `DropdownMenu` is presentation-only, controlled mode is implemented in the consumer. This story tracks `isOpen` in `useState`, wires the trigger with `aria-haspopup='menu'`, `aria-expanded`, and `aria-controls`, and **demonstrates the focus-restoration pattern**: a `useRef` on the trigger, an `onClose` handler that closes the menu and re-focuses the trigger ref. Press Escape (or pick an item) to see focus return to the trigger.",
      },
    },
  },
  render: () => {
    const ControlledDemo = () => {
      const [isOpen, setIsOpen] = useState(false);
      const [lastChoice, setLastChoice] = useState<string | null>(null);
      const triggerRef = useRef<HTMLButtonElement | null>(null);
      const menuId = "controlled-dropdown-menu";
      const closeAndRestoreFocus = () => {
        setIsOpen(false);
        // Focus restoration runs after the menu unmounts on the next tick.
        requestAnimationFrame(() => triggerRef.current?.focus());
      };
      const select = (label: string) => {
        setLastChoice(label);
        // onClose will fire automatically (closeOnSelect default = true).
      };
      return (
        <Stack direction="column" gap="3" style={{ width: 240 }}>
          <Stack direction="row" gap="2" align="center">
            <Button
              ref={triggerRef}
              data-testid="controlled-trigger"
              variant="secondary"
              size="sm"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              aria-controls={menuId}
              onClick={() => setIsOpen((v) => !v)}
            >
              {isOpen ? "닫기" : "열기"}
            </Button>
            <span className="text-xs text-era-muted">
              마지막 선택: {lastChoice ?? "—"}
            </span>
          </Stack>
          {isOpen && (
            <DropdownMenu
              id={menuId}
              onClose={closeAndRestoreFocus}
              items={
                [
                  {
                    key: "profile",
                    label: "프로필",
                    onSelect: () => select("프로필"),
                  },
                  {
                    key: "settings",
                    label: "설정",
                    onSelect: () => select("설정"),
                  },
                  {
                    key: "logout",
                    label: "로그아웃",
                    onSelect: () => select("로그아웃"),
                  },
                ] as ReadonlyArray<DropdownMenuItem>
              }
            />
          )}
        </Stack>
      );
    };
    return <ControlledDemo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByTestId("controlled-trigger");

    // Open the menu via the trigger.
    await userEvent.click(trigger);
    await waitFor(() => expect(canvas.getByRole("menu")).toBeInTheDocument());
    // Initial focus lands on the first menuitem.
    const items = canvas.getAllByRole("menuitem");
    await waitFor(() => expect(items[0]).toHaveFocus());

    // Escape closes and restores focus to the trigger.
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/**
 * Same menu attached to a labelled `<Button>` trigger versus an icon-only
 * trigger. Both triggers wire `aria-haspopup`, `aria-expanded`, and
 * `aria-controls` and use refs for focus restoration on `onClose`.
 */
export const OnButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Two triggers, one menu pattern. Left: a labelled `<Button>`. Right: an icon-only `<Button>` with `aria-label='더보기'`. Both wire `aria-haspopup='menu'`, `aria-expanded`, and `aria-controls`, and both restore focus to their trigger via a ref when the menu's `onClose` fires (Escape, item activation, or Tab-leave). The play function opens the labelled trigger, picks the first item, and asserts focus returned to the trigger.",
      },
    },
  },
  render: () => {
    const TriggerCompare = () => {
      const [openA, setOpenA] = useState(false);
      const [openB, setOpenB] = useState(false);
      const triggerARef = useRef<HTMLButtonElement | null>(null);
      const triggerBRef = useRef<HTMLButtonElement | null>(null);
      const closeA = () => {
        setOpenA(false);
        requestAnimationFrame(() => triggerARef.current?.focus());
      };
      const closeB = () => {
        setOpenB(false);
        requestAnimationFrame(() => triggerBRef.current?.focus());
      };
      const ITEMS: ReadonlyArray<DropdownMenuItem> = [
        { key: "edit", label: "편집", icon: <Icon path={ICONS.edit} /> },
        { key: "share", label: "공유", icon: <Icon path={ICONS.share} /> },
        {
          key: "delete",
          label: "삭제",
          icon: <Icon path={ICONS.trash} />,
          danger: true,
        },
      ];
      return (
        <Stack direction="row" gap="6" align="start">
          <Stack direction="column" gap="2" style={{ width: 200 }}>
            <span className="text-xs uppercase tracking-wide text-era-muted">
              Labelled trigger
            </span>
            <Button
              ref={triggerARef}
              data-testid="onbutton-trigger-a"
              variant="secondary"
              size="sm"
              aria-haspopup="menu"
              aria-expanded={openA}
              aria-controls="dd-button-trigger"
              onClick={() => setOpenA((v) => !v)}
            >
              메뉴
            </Button>
            {openA && (
              <DropdownMenu
                id="dd-button-trigger"
                onClose={closeA}
                items={ITEMS}
              />
            )}
          </Stack>
          <Stack direction="column" gap="2" style={{ width: 200 }}>
            <span className="text-xs uppercase tracking-wide text-era-muted">
              Icon-only trigger
            </span>
            <Button
              ref={triggerBRef}
              data-testid="onbutton-trigger-b"
              variant="ghost"
              size="sm"
              aria-label="더보기"
              aria-haspopup="menu"
              aria-expanded={openB}
              aria-controls="dd-icon-trigger"
              onClick={() => setOpenB((v) => !v)}
            >
              <Icon path={ICONS.more} />
            </Button>
            {openB && (
              <DropdownMenu
                id="dd-icon-trigger"
                onClose={closeB}
                items={ITEMS}
              />
            )}
          </Stack>
        </Stack>
      );
    };
    return <TriggerCompare />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggerA = canvas.getByTestId("onbutton-trigger-a");

    // Open the labelled menu.
    await userEvent.click(triggerA);
    await waitFor(() => expect(canvas.getByRole("menu")).toBeInTheDocument());
    const items = canvas.getAllByRole("menuitem");
    await waitFor(() => expect(items[0]).toHaveFocus());

    // Activating the first item should call onClose, unmount the menu, and
    // restore focus to the trigger.
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(triggerA).toHaveFocus());
  },
};

/**
 * Heritage / Neon side-by-side. The same DropdownMenu markup renders in
 * both era panels; era-aware tokens (`bg-era-raised`, `border-era`,
 * `shadow-era-card`, `bg-era-soft`, `--era-intent-error`,
 * `duration-era-fast`, `ease-era-brush`) account for every visual delta.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `DropdownMenu` markup in Heritage and Neon. Surface, divider, focus-ring, and destructive item color all flip via the era CSS layer — no React re-render involved.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <DropdownMenu
        items={
          [
            {
              items: [
                {
                  key: "profile",
                  label: "프로필",
                  icon: <Icon path={ICONS.user} />,
                },
                {
                  key: "settings",
                  label: "설정",
                  icon: <Icon path={ICONS.settings} />,
                },
              ],
            },
            {
              items: [
                {
                  key: "delete",
                  label: "삭제",
                  icon: <Icon path={ICONS.trash} />,
                  danger: true,
                },
              ],
            },
          ] as ReadonlyArray<DropdownMenuSection>
        }
      />
    )),
};

/**
 * Interaction proof. Validates the WAI-ARIA menu keyboard pattern that
 * `DropdownMenu` now implements:
 *
 *  1. The surface exposes `role='menu'` and the right number of `menuitem`s.
 *  2. Roving tabindex: first non-disabled item is `tabindex=0`, all others
 *     are `tabindex=-1`. The first non-disabled item also has DOM focus
 *     within one frame of mount.
 *  3. ArrowDown moves focus to the next non-disabled item.
 *  4. ArrowDown again skips the disabled item.
 *  5. End jumps to the last item; Home jumps back to the first.
 *  6. Enter on the focused item fires `onSelect` *and* `onClose`.
 *  7. Re-opening and pressing Escape calls `onClose` without activating
 *     any item.
 *
 * **Out of scope** (intentionally NOT covered): typeahead and submenu
 * navigation. See the component-level docs for the rationale.
 */
// Hoisted mocks for the Interactive story so the play function can assert
// on them without crossing render closures. Each mock is reset by the
// `beforeEach` parameter below so re-running the story is deterministic.
const interactiveMocks = {
  onSelectProfile: fn(),
  onSelectSettings: fn(),
  onSelectLogout: fn(),
  onClose: fn(),
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Automated interaction proof. Validates `role='menu'`, item count, roving tabindex on first render, ArrowDown navigation (including disabled-skip), Home/End jumps, Enter activation calling both `onSelect` and `onClose`, and Escape calling `onClose` without activating an item. Typeahead and submenu navigation are explicitly out of scope for this hotfix.",
      },
    },
  },
  beforeEach: () => {
    interactiveMocks.onSelectProfile.mockClear();
    interactiveMocks.onSelectSettings.mockClear();
    interactiveMocks.onSelectLogout.mockClear();
    interactiveMocks.onClose.mockClear();
  },
  render: () => {
    const { onSelectProfile, onSelectSettings, onSelectLogout, onClose } =
      interactiveMocks;
    const InteractiveDemo = () => {
      const [open, setOpen] = useState(true);
      const handleClose = () => {
        onClose();
        setOpen(false);
      };
      return (
        <div>
          {open && (
            <DropdownMenu
              data-testid="interactive-menu"
              onClose={handleClose}
              items={
                [
                  {
                    key: "profile",
                    label: "프로필",
                    icon: <Icon path={ICONS.user} />,
                    onSelect: onSelectProfile,
                  },
                  {
                    key: "settings",
                    label: "설정",
                    icon: <Icon path={ICONS.settings} />,
                    onSelect: onSelectSettings,
                  },
                  {
                    key: "duplicate",
                    label: "복제 (잠김)",
                    icon: <Icon path={ICONS.copy} />,
                    disabled: true,
                  },
                  {
                    key: "logout",
                    label: "로그아웃",
                    icon: <Icon path={ICONS.logout} />,
                    onSelect: onSelectLogout,
                  },
                ] as ReadonlyArray<DropdownMenuItem>
              }
            />
          )}
          {!open && (
            <button
              type="button"
              data-testid="reopen-trigger"
              onClick={() => setOpen(true)}
            >
              re-open
            </button>
          )}
        </div>
      );
    };
    return <InteractiveDemo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 1. Surface exposes role="menu" and four menuitems (one disabled).
    const menu = canvas.getByRole("menu");
    await expect(menu).toBeInTheDocument();
    const items = canvas.getAllByRole("menuitem");
    await expect(items).toHaveLength(4);

    const profile = canvas.getByRole("menuitem", { name: /프로필/ });
    const settings = canvas.getByRole("menuitem", { name: /설정/ });
    const duplicate = canvas.getByRole("menuitem", { name: /복제/ });
    const logout = canvas.getByRole("menuitem", { name: /로그아웃/ });

    // 2. Roving tabindex on first render + initial focus on first item.
    await waitFor(() => expect(profile).toHaveFocus());
    await expect(profile).toHaveAttribute("tabindex", "0");
    await expect(settings).toHaveAttribute("tabindex", "-1");
    await expect(duplicate).toHaveAttribute("tabindex", "-1");
    await expect(logout).toHaveAttribute("tabindex", "-1");

    // 3. ArrowDown moves focus to the second item.
    await userEvent.keyboard("{ArrowDown}");
    await expect(settings).toHaveFocus();
    await expect(settings).toHaveAttribute("tabindex", "0");
    await expect(profile).toHaveAttribute("tabindex", "-1");

    // 4. ArrowDown again skips the disabled item and lands on logout.
    await expect(duplicate).toBeDisabled();
    await userEvent.keyboard("{ArrowDown}");
    await expect(logout).toHaveFocus();
    await expect(duplicate).not.toHaveFocus();

    // 5. End → last; Home → first.
    await userEvent.keyboard("{End}");
    await expect(logout).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(profile).toHaveFocus();

    // 6. Enter on focused item activates onSelect AND fires onClose.
    await userEvent.keyboard("{Enter}");
    await waitFor(() =>
      expect(interactiveMocks.onSelectProfile).toHaveBeenCalledTimes(1),
    );
    await expect(interactiveMocks.onClose).toHaveBeenCalledTimes(1);

    // 7. Re-open and press Escape.
    const reopen = await canvas.findByTestId("reopen-trigger");
    await userEvent.click(reopen);
    await waitFor(() => expect(canvas.getByRole("menu")).toBeInTheDocument());
    const profileAgain = canvas.getByRole("menuitem", { name: /프로필/ });
    await waitFor(() => expect(profileAgain).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    await expect(interactiveMocks.onClose).toHaveBeenCalledTimes(2);
    // onSelect was not called again.
    await expect(interactiveMocks.onSelectProfile).toHaveBeenCalledTimes(1);
  },
};
