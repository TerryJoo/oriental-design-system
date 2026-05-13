import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import { bothEras } from "./_shared/argTypes";

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Breadcrumb implements the WAI-ARIA breadcrumb pattern: a `<nav>` landmark labelled `현재 위치`, " +
          "intermediate items rendered as anchors, and the final crumb rendered as a non-link `<span>` " +
          'marked with `aria-current="page"`. The visual separator is `aria-hidden` so screen readers ' +
          "announce only the trail of locations, and all colors, typography, and transitions flow through " +
          "era-aware tokens so the trail adapts to Heritage and Neon without re-rendering.",
      },
    },
  },
  argTypes: {
    items: {
      control: false,
      description:
        "Ordered list of breadcrumb items (root → current). The last item is always rendered as the current page.",
    },
    separator: {
      control: { type: "text" },
      description:
        'ReactNode placed between items. Decorative only (`aria-hidden`). Defaults to `"/"`.',
    },
  },
  args: {
    items: [
      { label: "홈", href: "/" },
      { label: "서재", href: "/library" },
      { label: "龍虎相搏" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// Inline icons (mirror Button.stories.tsx convention).
const HomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
  </svg>
);

const FolderIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const FileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const labelWithIcon = (icon: ReactNode, text: string) => (
  <span className="inline-flex items-center gap-1.5">
    {icon}
    <span>{text}</span>
  </span>
);

export const Default: Story = {};

export const LongPath: Story = {
  args: {
    items: [
      { label: "홈", href: "/" },
      { label: "서재", href: "/library" },
      { label: "한문 고전", href: "/library/classics" },
      { label: "조선왕조실록", href: "/library/classics/sillok" },
      { label: "세종실록", href: "/library/classics/sillok/sejong" },
      { label: "권 제 102", href: "/library/classics/sillok/sejong/102" },
      { label: "龍虎相搏" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "With seven crumbs the trail wraps onto a second line via `flex-wrap` " +
          "instead of clipping — Breadcrumb has no built-in collapse, so the natural " +
          "overflow behavior is wrap.",
      },
    },
  },
};

export const WithMaxItems: Story = {
  args: {
    items: [
      { label: "홈", href: "/" },
      { label: "서재", href: "/library" },
      { label: "…" },
      { label: "세종실록", href: "/library/classics/sillok/sejong" },
      { label: "龍虎相搏" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Breadcrumb does not ship a `maxItems` prop; collapse the middle of a long " +
          "trail in user-land by replacing intermediate crumbs with a single ellipsis " +
          "item (no `href`, so it renders as a non-interactive `<span>`).",
      },
    },
  },
};

export const CustomSeparator: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Breadcrumb {...args} separator="/" />
      <Breadcrumb {...args} separator="›" />
      <Breadcrumb {...args} separator="•" />
      <Breadcrumb {...args} separator={<ChevronRight />} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Separator accepts any `ReactNode`. It is decorative only — wrapped in an " +
          "`aria-hidden` span — so screen readers announce only the location trail.",
      },
    },
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { label: labelWithIcon(<HomeIcon />, "홈"), href: "/" },
      { label: labelWithIcon(<FolderIcon />, "서재"), href: "/library" },
      { label: labelWithIcon(<FileIcon />, "龍虎相搏") },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "`label` accepts any `ReactNode`, so leading icons are composed by the " +
          "consumer. Icons are marked `aria-hidden` and the human-readable text " +
          "remains the accessible name of each crumb.",
      },
    },
  },
};

export const CurrentPage: Story = {
  args: {
    items: [
      { label: "홈", href: "/" },
      { label: "서재", href: "/library" },
      { label: "龍虎相搏 (현재 페이지)" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "The final item is always rendered as the current page: a non-link `<span>` " +
          'with `aria-current="page"`, styled bolder via the `text-era-primary ' +
          "font-semibold` token combo so it stands out from the upstream links.",
      },
    },
  },
};

export const LinksAndButtons: Story = {
  render: () => {
    const items: BreadcrumbItem[] = [
      { label: "홈", href: "/" },
      {
        // Item with no `href` renders as a <span>; nesting a <button> inside
        // gives the crumb true button semantics for SPA route handlers.
        label: (
          <button
            type="button"
            className="cursor-pointer bg-transparent p-0 text-inherit underline-offset-2 hover:underline"
            onClick={() => {
              /* router.push("/library") */
            }}
          >
            서재 (button)
          </button>
        ),
      },
      { label: "龍虎相搏" },
    ];
    return <Breadcrumb items={items} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Items with `href` render as anchors; items without `href` render as `<span>`. " +
          "For SPA routers that need a click handler instead of a real URL, embed a " +
          "`<button>` inside the `label` ReactNode — the wrapping span keeps the visual " +
          "rhythm consistent with the rest of the trail.",
      },
    },
  },
};

export const Truncated: Story = {
  render: (args) => (
    <div
      style={{ width: "320px" }}
      className="border border-dashed border-era-muted/40 p-3"
    >
      <Breadcrumb {...args} />
    </div>
  ),
  args: {
    items: [
      { label: "홈", href: "/" },
      {
        label: "유난히-아주-긴-카테고리-이름-길이-검증용-folder-name",
        href: "/library/very-long",
      },
      {
        label:
          "이 항목의 라벨도 충분히 길어서 줄바꿈 동작을 확인할 수 있어야 합니다",
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Constrained to 320px wide. Because `breadcrumbNav` uses `flex-wrap`, very " +
          "long labels wrap rather than overflow horizontally. Crumbs themselves do " +
          "not truncate with an ellipsis by default — apply your own `max-w` + " +
          "`truncate` utilities on the label if single-line truncation is required.",
      },
    },
  },
};

export const LongText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Wave 5b2-C3 overflow proof. Demonstrates **two** truncation behaviors on a single component:\n\n" +
          "1. **Per-segment truncation** — each crumb caps at `max-w-[12rem]` and clamps to a single line " +
          "with an ellipsis. The middle crumb here exceeds that ceiling and clips visibly.\n\n" +
          "2. **`maxItems` collapse** — when the trail length exceeds `maxItems`, the middle crumbs " +
          "collapse to a non-interactive `…` span; the first crumb and the last two crumbs always " +
          "remain rendered. Pass `maxItems={0}` (or omit) to disable collapse and let the trail wrap " +
          "naturally via `flex-wrap`.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          per-segment truncate (long single crumb)
        </span>
        <Breadcrumb
          items={[
            { label: "홈", href: "/" },
            {
              label: "조선왕조-실록-편찬-위원회-국역사업-담당-부서",
              href: "/library",
            },
            { label: "현재 페이지" },
          ]}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-era-muted">
          maxItems=4 (collapse middle crumbs to `…`)
        </span>
        <Breadcrumb
          maxItems={4}
          items={[
            { label: "홈", href: "/" },
            { label: "서재", href: "/library" },
            { label: "한문 고전", href: "/library/classics" },
            { label: "조선왕조실록", href: "/library/classics/sillok" },
            {
              label: "세종실록",
              href: "/library/classics/sillok/sejong",
            },
            { label: "권 제 102", href: "/library/classics/sillok/sejong/102" },
            { label: "龍虎相搏" },
          ]}
        />
      </div>
    </div>
  ),
};

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage vs Neon side-by-side. Link, current-page, and separator colors all " +
          "resolve through `text-era-muted` / `text-era-primary` tokens, and the hover " +
          "transition uses `duration-era` + `ease-era-brush` so the animation curve also " +
          "swaps with the era.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "홈", href: "/" },
            { label: "서재", href: "/library" },
            { label: "龍虎相搏" },
          ]}
        />
        <Breadcrumb
          separator="›"
          items={[
            { label: "홈", href: "/" },
            { label: "서재", href: "/library" },
            { label: "한문 고전", href: "/library/classics" },
            { label: "龍虎相搏" },
          ]}
        />
      </div>
    )),
};

export const Interactive: Story = {
  args: {
    onClick: fn(),
    items: [
      { label: "홈", href: "#home" },
      { label: "서재", href: "#library" },
      { label: "龍虎相搏" },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Play function asserts the WAI-ARIA contract: a single `nav` landmark, the " +
          'current page exposes `aria-current="page"` and is NOT a link, and Tab keyboard ' +
          "navigation traverses the upstream anchors in DOM order. Click on `홈` bubbles " +
          "to `onClick` on the `<nav>` (event delegation), and pressing Enter on a " +
          "focused link activates it.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. nav landmark exposes the right accessible name.
    const nav = canvas.getByRole("navigation", { name: "현재 위치" });
    expect(nav).toBeInTheDocument();

    // 2. Only the upstream items are links.
    const links = canvas.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAccessibleName("홈");
    expect(links[1]).toHaveAccessibleName("서재");

    // 3. Last item is the current page (span, not link), with aria-current=page.
    const current = canvas.getByText("龍虎相搏");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).toBe("SPAN");
    expect(
      canvas.queryByRole("link", { name: "龍虎相搏" }),
    ).not.toBeInTheDocument();

    // 4. Click on a non-current item bubbles to onClick on the nav.
    //    (Prevent default navigation since href="#home" would scroll the canvas.)
    const homeLink = links[0] as HTMLAnchorElement;
    homeLink.addEventListener("click", (e) => e.preventDefault(), {
      once: true,
    });
    await userEvent.click(homeLink);
    expect(args.onClick).toHaveBeenCalled();

    // 5. Keyboard navigation: Tab walks through links in DOM order.
    homeLink.focus();
    expect(homeLink).toHaveFocus();
    await userEvent.tab();
    expect(links[1]).toHaveFocus();

    // 6. Enter on a focused link activates it (anchor click semantics).
    const activated = fn();
    links[1].addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        activated();
      },
      { once: true },
    );
    await userEvent.keyboard("{Enter}");
    expect(activated).toHaveBeenCalled();
  },
};
