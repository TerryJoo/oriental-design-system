import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Popover, type PopoverPlacement } from "@/components/Popover";
import { Stack } from "@/components/Stack";
import { boolArg, bothEras, selectArg } from "./_shared/argTypes";

const PLACEMENTS = [
  "bottom-start",
  "bottom-end",
  "top-start",
  "top-end",
] as const satisfies readonly PopoverPlacement[];

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Anchored, click-activated overlay panel for secondary content (menus, mini-forms, ",
          "context summaries). Distinct from a `Modal`: a Popover is **non-modal** — it does not ",
          "render a backdrop, does not block the page, and lets keyboard focus leave the panel ",
          "freely via Tab. The component renders inline (no portal); the panel is absolutely ",
          "positioned relative to the wrapping `<span>`.",
          "",
          "**Behavior wired in this build:**",
          "",
          '- Trigger toggle on click. The trigger receives `aria-haspopup="dialog"`, ',
          "  `aria-expanded={open}`, and `aria-controls` pointing at the panel id (generated ",
          "  via `useId`) — all applied via `cloneElement`.",
          '- Panel uses `role="dialog"` (no `aria-modal`, since it is non-modal) and carries the ',
          "  matching `id` plus `tabIndex={-1}` so it can receive programmatic focus.",
          "- Outside `mousedown` on `document` closes the panel.",
          "- `Escape` key closes the panel and calls `onOpenChange(false)`.",
          "- Focus management: on open, focus moves to the first focusable element inside the ",
          "  panel (or the panel root if none). On close, focus returns to the trigger. Focus is ",
          "  **not** trapped — Tab can leave the panel freely (correct for non-modal). An optional ",
          "  `initialFocusRef` prop overrides the default first-focusable target.",
          "- Era-aware tokens (`bg-era-raised`, `border-era`, `shadow-era-modal`, ",
          "  `text-era-primary`) flip cleanly between Heritage and Neon — no React re-render.",
          "",
          "**WAI-ARIA non-modal dialog pattern coverage:**",
          "",
          "| Behaviour | Wired |",
          "| --- | --- |",
          '| `role="dialog"` on panel | YES |',
          '| `aria-haspopup="dialog"` on trigger | YES |',
          "| `aria-expanded` on trigger | YES |",
          "| `aria-controls` on trigger | YES |",
          "| Escape closes panel | YES |",
          "| Focus moves into panel on open | YES |",
          "| Focus returns to trigger on close | YES |",
          "| Focus trap (Tab cycle) | NO — non-modal, intentional |",
          "| `aria-labelledby` auto-wired | NO — authors must label panel content themselves |",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    placement: selectArg(
      PLACEMENTS,
      "Where the panel anchors relative to the trigger. Only the four corner placements are supported.",
    ),
    open: boolArg(
      "Controlled open state. When defined, internal state is overridden.",
    ),
    defaultOpen: boolArg("Uncontrolled initial open state."),
    onOpenChange: {
      action: "openChange",
      description: "Fires whenever the open state toggles.",
    },
  },
  args: {
    placement: "bottom-start",
    defaultOpen: false,
    trigger: <Button variant="secondary">메뉴 열기</Button>,
    content: (
      <div className="text-era-primary">
        <p className="text-sm">팝오버 안의 보조 콘텐츠입니다.</p>
      </div>
    ),
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof Popover>;

/**
 * Basic uncontrolled popover. Click the trigger to toggle the panel; click
 * anywhere outside to close it.
 */
export const Default: Story = {};

/**
 * Every supported placement, all forced open via `defaultOpen` so the four
 * corner anchors are visible at once. The component does not currently
 * support `top`, `bottom`, `left`, or `right` (centered) placements — only
 * the four `*-start` / `*-end` corners.
 */
export const Placements: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "All four supported `PopoverPlacement` values rendered simultaneously. Each cell uses its own trigger so the panels do not collide. Note: this build exposes only corner placements; centered (`top` / `bottom` / `left` / `right`) placements are not implemented.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-2 gap-12 p-16 place-items-center">
      {PLACEMENTS.map((p) => (
        <div key={p} className="flex items-center justify-center min-h-[120px]">
          <Popover
            placement={p}
            defaultOpen
            trigger={
              <Button variant="secondary" size="sm">
                {p}
              </Button>
            }
            content={
              <div className="text-era-primary text-sm">
                <strong className="font-semibold">{p}</strong>
                <p className="text-era-muted text-xs mt-1">
                  panel anchored {p}
                </p>
              </div>
            }
          />
        </div>
      ))}
    </div>
  ),
};

/**
 * **Spec deviation:** the current `Popover` API does not render a positioning
 * arrow. The panel is a plain rounded rectangle anchored via Tailwind utility
 * classes. This story documents the absence so consumers do not assume an
 * arrow exists. Adding an arrow would require a new style token (e.g.,
 * `popoverArrowStyles`) and corresponding placement-specific CSS.
 */
export const WithArrow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Popover does not implement a positioning arrow in the current API. The panel renders as a flat card anchored to one of the four corners. If an arrow is desired, this is reportable as a token + style addition (per-placement arrow offset). The example below shows the arrow-less default.",
      },
    },
  },
  render: () => (
    <div className="flex items-center justify-center p-16">
      <Popover
        defaultOpen
        placement="bottom-start"
        trigger={
          <Button variant="secondary" size="sm">
            no-arrow trigger
          </Button>
        }
        content={
          <div className="text-era-primary text-sm">
            <p>이 빌드에는 화살표가 없습니다.</p>
            <p className="text-era-muted text-xs mt-1">
              flat card, no arrow indicator
            </p>
          </div>
        }
      />
    </div>
  ),
};

/**
 * Fully controlled popover. The parent owns `open` and `onOpenChange`; an
 * external Button writes to the same state. Useful for synchronizing the
 * panel with sibling UI (e.g., a checklist that highlights its target row
 * while the popover is open).
 */
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Pass both `open` and `onOpenChange` to drive the popover from outside React state. The external Open / Close button below toggles the same state the trigger does — they stay in sync.",
      },
    },
  },
  render: () => {
    const ControlledDemo = () => {
      const [open, setOpen] = useState(false);
      return (
        <Stack direction="row" gap="3" align="center">
          <Popover
            open={open}
            onOpenChange={setOpen}
            placement="bottom-start"
            trigger={
              <Button variant="secondary" size="sm">
                내부 트리거
              </Button>
            }
            content={
              <div className="text-era-primary text-sm">
                <p>controlled state: {String(open)}</p>
              </div>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            data-testid="external-toggle"
          >
            {open ? "외부에서 닫기" : "외부에서 열기"}
          </Button>
        </Stack>
      );
    };
    return <ControlledDemo />;
  },
};

/**
 * Outside-click dismissal. The component listens for `mousedown` on
 * `document`; any click outside the wrapping `<span>` closes the panel.
 * The neighbour buttons here are deliberately part of the dismiss surface,
 * not part of the panel.
 */
export const OutsideClickClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Clicking anywhere outside the popover wrapper closes the panel. The `mousedown` listener is attached to `document` only while the popover is open, so it does not interfere with other pages.",
      },
    },
  },
  render: () => (
    <Stack direction="row" gap="4" align="center">
      <Popover
        defaultOpen
        placement="bottom-start"
        trigger={
          <Button variant="secondary" size="sm">
            팝오버 트리거
          </Button>
        }
        content={
          <div className="text-era-primary text-sm">
            <p>여기 바깥쪽을 클릭하면 닫힙니다.</p>
          </div>
        }
      />
      <Button variant="ghost" size="sm" data-testid="outside-button">
        바깥 버튼 (클릭 시 팝오버 닫힘)
      </Button>
    </Stack>
  ),
};

/**
 * Mini form inside a popover. Demonstrates that interactive content (input
 * + submit) works under the current build — Tab cycles input → submit, and
 * the form's own `onSubmit` fires before the popover dismiss logic runs.
 *
 * **Focus management:** opening the popover moves focus to the first
 * focusable element inside the panel (the input below). Closing returns
 * focus to the trigger. Tab is **not** trapped — focus may leave the panel
 * freely, which is correct for a non-modal dialog. Pass `initialFocusRef`
 * to override the default first-focusable target.
 */
export const WithFormContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Popover holds an inline mini-form. On open, focus auto-places on the first input; on close, focus returns to the trigger. Tab cycles input → submit and is free to leave the panel (non-modal: focus is *not* trapped, unlike `Modal`). Authors can override the initial focus target with `initialFocusRef`.",
      },
    },
  },
  render: () => {
    const FormDemo = () => {
      const [submitted, setSubmitted] = useState<string | null>(null);
      return (
        <Popover
          placement="bottom-start"
          trigger={
            <Button variant="secondary" size="sm">
              빠른 검색
            </Button>
          }
          content={
            <form
              className="flex flex-col gap-2 min-w-[220px]"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                setSubmitted(String(data.get("q") ?? ""));
              }}
            >
              <label
                htmlFor="popover-q"
                className="text-era-muted text-xs uppercase tracking-wide"
              >
                검색어
              </label>
              <Input
                id="popover-q"
                name="q"
                inputSize="sm"
                placeholder="키워드..."
                data-testid="popover-input"
              />
              <Stack direction="row" gap="2" justify="end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  data-testid="popover-submit"
                >
                  검색
                </Button>
              </Stack>
              {submitted !== null && (
                <p className="text-era-muted text-xs">
                  마지막 제출: {submitted || "(빈 값)"}
                </p>
              )}
            </form>
          }
        />
      );
    };
    return <FormDemo />;
  },
};

/**
 * Header / body / footer composition. The panel's `content` accepts any
 * `ReactNode`, so authors compose structure freely. A leading `<h3>`
 * provides a visible label — but **note** that the component does not wire
 * `aria-labelledby` to the dialog automatically. The trigger does carry
 * `aria-controls` pointing at the panel id, so screen readers can navigate
 * to the panel; for an explicit accessible name, callers can render heading
 * content and rely on the trigger label, or wrap their own labelled region
 * inside `content`.
 */
export const RichContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Header + body + footer layout inside the panel. `aria-controls` on the trigger now points at the panel id, so the trigger/panel relationship is exposed to assistive tech. `aria-labelledby` is still not auto-wired — authors who need an explicit dialog name can render their own heading and associate it inside `content`.",
      },
    },
  },
  render: () => (
    <Popover
      defaultOpen
      placement="bottom-start"
      trigger={
        <Button variant="secondary" size="sm">
          상세 보기
        </Button>
      }
      content={
        <div className="min-w-[280px]">
          <header className="mb-2 border-b border-era-soft pb-2">
            <h3 className="text-era-primary text-sm font-semibold">
              필터 옵션
            </h3>
            <p className="text-era-muted text-xs">
              조건을 선택해 결과를 좁힙니다.
            </p>
          </header>
          <div className="flex flex-col gap-1 py-2 text-sm text-era-primary">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> 미해결만 보기
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> 내가 만든 것만
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> 최근 7일
            </label>
          </div>
          <footer className="mt-2 flex justify-end gap-2 border-t border-era-soft pt-2">
            <Button size="sm" variant="ghost">
              초기화
            </Button>
            <Button size="sm" variant="primary">
              적용
            </Button>
          </footer>
        </div>
      }
    />
  ),
};

/**
 * `forwardRef` exposes the wrapping `<span>`. This story uses the ref to
 * read DOM attributes (such as the wrapper's `data-testid`) and to verify
 * that the ref is wired through. The component does **not** expose
 * imperative methods (`open()` / `close()`) — programmatic toggling is
 * achieved via the controlled `open` prop, not via the ref.
 */
export const WithRef: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`Popover` forwards its ref to the wrapping `<span>`. There is no imperative handle in the current build — open/close is driven by the `open` prop, not by ref methods. The example reads the wrapper element from the ref to prove it resolves.",
      },
    },
  },
  render: () => {
    const RefDemo = () => {
      const wrapRef = useRef<HTMLSpanElement | null>(null);
      const [tag, setTag] = useState<string>("not measured");
      useEffect(() => {
        if (wrapRef.current) {
          setTag(wrapRef.current.tagName.toLowerCase());
        }
      }, []);
      return (
        <Stack direction="column" gap="2" align="start">
          <Popover
            ref={wrapRef}
            data-testid="popover-wrap"
            placement="bottom-start"
            trigger={
              <Button variant="secondary" size="sm">
                ref 트리거
              </Button>
            }
            content={
              <div className="text-era-primary text-sm">
                <p>ref → 래퍼 엘리먼트</p>
              </div>
            }
          />
          <span className="text-era-muted text-xs">
            wrapper element: <code>&lt;{tag}&gt;</code>
          </span>
        </Stack>
      );
    };
    return <RefDemo />;
  },
};

/**
 * Heritage / Neon side-by-side comparison. Both panels share identical
 * markup; the era-aware tokens (`bg-era-raised`, `border-era`,
 * `shadow-era-modal`, `text-era-primary`) account for every visual delta.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Same `Popover` markup rendered in Heritage and Neon. The panel surface, border, and shadow all flip via the era CSS layer — the React tree never changes.",
      },
    },
  },
  render: () =>
    bothEras(({ era }) => (
      <div className="flex items-center justify-center min-h-[200px]">
        <Popover
          defaultOpen
          placement="bottom-start"
          trigger={
            <Button variant="secondary" size="sm">
              {era}
            </Button>
          }
          content={
            <div className="text-era-primary text-sm">
              <strong className="font-semibold">{era} popover</strong>
              <p className="text-era-muted text-xs mt-1">
                era-aware surface + shadow
              </p>
            </div>
          }
        />
      </div>
    )),
};

/**
 * Interaction test. Verifies the implemented WAI-ARIA non-modal dialog
 * surface end-to-end:
 *
 * 1. Initially closed: `aria-expanded="false"`, no `role="dialog"` in DOM.
 * 2. Click trigger → `aria-expanded="true"`, panel with `role="dialog"`
 *    appears. `aria-haspopup="dialog"` and `aria-controls` are present on
 *    the trigger and `aria-controls` matches the panel id. Focus moves
 *    into the panel.
 * 3. Press Escape: panel closes, `onOpenChange(false)` fires, focus
 *    returns to the trigger.
 * 4. Re-open and click outside (on a sibling Button) → panel closes,
 *    `aria-expanded` flips back to `"false"`, `onOpenChange` fires with
 *    `false`.
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "Automated interaction proof. Verifies: trigger has ",
          '`aria-haspopup="dialog"`, `aria-expanded` toggles, and `aria-controls` ',
          'matches the panel id; the panel appears with `role="dialog"`; opening ',
          "moves focus into the panel; Escape closes the panel and returns focus to ",
          "the trigger; outside click dismisses; `onOpenChange` is called with the ",
          "new state.",
        ].join("\n"),
      },
    },
  },
  render: (args) => {
    const InteractiveDemo = () => (
      <Stack direction="row" gap="4" align="center">
        <Popover
          {...args}
          placement="bottom-start"
          trigger={
            <Button variant="secondary" size="sm" data-testid="popover-trigger">
              상호작용 트리거
            </Button>
          }
          content={
            <div
              className="text-era-primary text-sm"
              data-testid="popover-body"
            >
              <p>대화상자 콘텐츠</p>
            </div>
          }
        />
        <Button variant="ghost" size="sm" data-testid="outside-target">
          바깥 버튼
        </Button>
      </Stack>
    );
    return <InteractiveDemo />;
  },
  args: {
    onOpenChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByTestId("popover-trigger");

    // 1. Initially closed.
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-controls");
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();

    // 2. Click trigger → panel opens, aria-controls matches the panel id,
    //    focus moves into the panel (panel root, since content has no
    //    focusables).
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "true"),
    );
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeInTheDocument();
    await expect(dialog).toHaveTextContent("대화상자 콘텐츠");
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);

    const controls = trigger.getAttribute("aria-controls");
    await expect(controls).toBeTruthy();
    await expect(dialog).toHaveAttribute("id", controls!);

    // Focus moved into the panel (or onto the panel root when no
    // focusables exist).
    await waitFor(() => {
      const active = document.activeElement;
      expect(active === dialog || dialog.contains(active)).toBe(true);
    });

    // 3. Escape closes the panel, fires onOpenChange(false), and returns
    //    focus to the trigger.
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(trigger).toHaveFocus());

    // 4. Re-open, then click outside → panel closes, onOpenChange fires
    //    with false.
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "true"),
    );

    const outside = canvas.getByTestId("outside-target");
    await userEvent.click(outside);
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};
