import type { Meta, StoryObj } from "@storybook/react";
import { expect, screen, userEvent, waitFor, within } from "@storybook/test";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Modal, type ModalSize } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Stack } from "@/components/Stack";
import { boolArg, bothEras, radioArg } from "./_shared/argTypes";

const SIZES = ["sm", "md", "lg"] as const satisfies readonly ModalSize[];

/**
 * Reusable trigger + Modal pair. Each story renders an explicit `<Button>` to
 * open the dialog so the play function (and humans) can interact with it the
 * same way an end user would.
 *
 * `triggerVariant` defaults to `"primary"` — but stories that render under
 * the Neon era (e.g., `EraCompare`) should pass `"secondary"`. The primary
 * button's `bg-accent-600` (electric indigo) + `text-era-inverse` (#0b0e18)
 * pair only clears ~3.76:1 in Neon, which fails axe's WCAG AA contrast rule.
 * `secondary` uses `text-era-primary` on a transparent fill so contrast is
 * driven by the era surface, which is AA-tuned in both eras.
 */
const ModalDemo = ({
  triggerLabel = "모달 열기",
  triggerTestId = "modal-trigger",
  triggerVariant = "primary",
  closeLabel = "닫기",
  size,
  title,
  description,
  footer,
  closeOnBackdropClick,
  closeOnEscape,
  children,
  initialOpen = false,
  onOpenChange,
}: {
  triggerLabel?: string;
  triggerTestId?: string;
  triggerVariant?: "primary" | "secondary";
  closeLabel?: string;
  size?: ModalSize;
  title?: ReactNode;
  description?: ReactNode;
  footer?: (close: () => void) => ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  children?: ReactNode;
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [open, setOpen] = useState(initialOpen);
  const close = () => {
    setOpen(false);
    onOpenChange?.(false);
  };
  const openModal = () => {
    setOpen(true);
    onOpenChange?.(true);
  };

  return (
    <>
      <Button
        variant={triggerVariant}
        onClick={openModal}
        data-testid={triggerTestId}
      >
        {triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={close}
        size={size}
        title={title}
        description={description}
        footer={footer ? footer(close) : undefined}
        closeOnBackdropClick={closeOnBackdropClick}
        closeOnEscape={closeOnEscape}
      >
        {children}
        {!footer && (
          <Stack direction="row" gap="2" justify="end">
            <Button
              variant="secondary"
              onClick={close}
              data-testid="modal-close"
            >
              {closeLabel}
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  );
};

const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          'Modal renders a portaled `role="dialog"` panel with `aria-modal="true"`,',
          "centered over a dimmed `bg-era-overlay` backdrop. Era-aware tokens",
          "(`bg-era-raised`, `border-era`, `shadow-era-modal`, `font-era-display`) flip",
          "the panel's surface, border, elevation, and title typography between Heritage",
          "and Neon without re-rendering React.",
          "",
          "**Behavior:**",
          "- Mounts to `document.body` via a portal — queries from a story `play`",
          "  function must use `screen` or `within(document.body)` because the dialog",
          "  is not a descendant of `canvasElement`.",
          "- `closeOnEscape` (default `true`): pressing Escape calls `onClose`.",
          "- `closeOnBackdropClick` (default `true`): clicking outside the panel calls",
          '  `onClose`. The backdrop carries `role="presentation"`.',
          "",
          "**WAI-ARIA dialog pattern (implemented):**",
          "- **Unique ids**: title and description ids are derived from `useId()`,",
          "  so multiple Modals can coexist without id collisions. `aria-labelledby`",
          "  is wired only when `title` is provided; `aria-describedby` only when",
          "  `description` is provided.",
          "- **Initial focus**: on open, focus moves to the first focusable",
          "  descendant inside the panel, falling back to the panel itself when no",
          "  focusable descendant exists. Pass `initialFocusRef` to override.",
          "- **Focus trap**: Tab and Shift+Tab cycle within the panel; focus cannot",
          "  escape to the page behind the backdrop.",
          "- **Focus restoration**: the element focused before the dialog opened is",
          "  refocused on close (Escape, backdrop, or programmatic).",
          "- **Body scroll lock**: `document.body.style.overflow = 'hidden'` while",
          "  any modal is open. A stacking counter keeps the lock engaged for nested",
          "  modals and releases it only when the last one closes.",
          "- **`role`**: defaults to `'dialog'`; pass `role=\"alertdialog\"` for",
          "  critical, interrupting confirmations (see the Confirm story).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    open: boolArg(
      "Whether the dialog is rendered. Controlled by the consumer.",
    ),
    size: radioArg(SIZES, "Panel max-width preset"),
    closeOnBackdropClick: boolArg(
      "Close when clicking the backdrop. Defaults to true.",
    ),
    closeOnEscape: boolArg("Close when pressing Escape. Defaults to true."),
    title: { control: "text", description: "Optional dialog heading" },
    description: {
      control: "text",
      description: "Optional supporting copy below the title",
    },
  },
  args: {
    size: "md",
    closeOnBackdropClick: true,
    closeOnEscape: true,
    title: "확인",
    description: "이 작업은 되돌릴 수 없습니다. 계속 진행하시겠습니까?",
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof Modal>;

/**
 * Default modal opened from a trigger button. Demonstrates the minimum
 * required wiring: an `open` boolean and an `onClose` callback.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Simplest usage: a trigger button toggles `open`, and the dialog renders into a portal with `role="dialog"`. Pressing Escape or clicking outside the panel both invoke `onClose`.',
      },
    },
  },
  render: () => (
    <ModalDemo
      title="환영합니다"
      description="첫 번째 모달입니다. 닫으려면 닫기 버튼을 누르세요."
    >
      <p className="text-sm text-era-secondary mb-5">
        모달은 포털을 통해 `document.body`로 마운트되며
        `role=&quot;dialog&quot;`와 `aria-modal=&quot;true&quot;`를 자동으로
        부여합니다.
      </p>
    </ModalDemo>
  ),
};

/**
 * All three size presets in one comparison view. Each trigger opens its own
 * dialog so consumers can preview the relative panel widths.
 */
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`size` controls the panel's `max-width` token: `sm` (`max-w-sm`), `md` (`max-w-lg`, the default), and `lg` (`max-w-2xl`). The panel always fills `100%` of the available space up to that cap, so the visible difference scales with the viewport.",
      },
    },
  },
  render: () => (
    <Stack direction="row" gap="3" align="center">
      {SIZES.map((size) => (
        <ModalDemo
          key={size}
          size={size}
          triggerLabel={`Open ${size}`}
          triggerTestId={`modal-trigger-${size}`}
          title={`Size: ${size}`}
          description={`max-width preset: ${size}`}
        >
          <p className="text-sm text-era-secondary mb-5">
            이 모달의 크기 프리셋은 <code>{size}</code>입니다.
          </p>
        </ModalDemo>
      ))}
    </Stack>
  ),
};

/**
 * Modal with title, scrollable body, and a footer slot containing primary +
 * secondary action buttons.
 */
export const WithFooter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The `footer` slot is rendered after `children` inside `flex justify-end gap-2`, so it naturally hosts a row of action buttons. The body region above the footer is the consumer's responsibility to style — here it uses `max-h-[40vh] overflow-y-auto` to demonstrate internal scroll.",
      },
    },
  },
  render: () => (
    <ModalDemo
      title="이용 약관"
      description="아래 약관에 동의하셔야 서비스를 이용할 수 있습니다."
      footer={(close) => (
        <>
          <Button variant="ghost" onClick={close}>
            거절
          </Button>
          <Button variant="primary" onClick={close}>
            동의하고 계속
          </Button>
        </>
      )}
    >
      <div className="max-h-[40vh] overflow-y-auto pr-2 mb-5 text-sm text-era-secondary space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <p key={i}>
            제 {i + 1} 조 — 본 약관은 서비스 이용에 관한 권리와 의무를 정합니다.
            오방색은 청·적·황·백·흑의 다섯 빛깔로 동·남·중앙·서·북의 다섯 방위를
            상징하며, 본 디자인 시스템은 이를 토큰으로 추상화합니다.
          </p>
        ))}
      </div>
    </ModalDemo>
  ),
};

/**
 * Body content that vastly exceeds the viewport. The dialog locks page
 * scrolling while open and lets the consumer-supplied internal scroll
 * container handle overflow.
 */
export const LongContent: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "The body renders 40 paragraphs inside an internal `overflow-y-auto`",
          "container. While the modal is open the page behind the backdrop is",
          "scroll-locked via `document.body.style.overflow = 'hidden'`; the",
          "previous overflow value is captured and restored on close. Stacked",
          "modals share a single lock through an internal counter.",
        ].join("\n"),
      },
    },
  },
  render: () => (
    <ModalDemo
      size="lg"
      title="긴 본문"
      description="내부 스크롤이 동작하는지 확인하세요. 본문이 뷰포트 높이를 크게 초과합니다."
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2 mb-5 text-sm text-era-secondary space-y-3">
        {Array.from({ length: 40 }).map((_, i) => (
          <p key={i}>
            {i + 1}. 단락 — Heritage 시대층은 한지·먹·청자의 질감을, Neon
            시대층은 회로·스캔라인의 발광면을 표현합니다. 동일한 마크업이 두
            시대층 위에서 자연스럽게 재해석됩니다.
          </p>
        ))}
      </div>
    </ModalDemo>
  ),
};

/**
 * Confirmation dialog pattern: short title, descriptive body, destructive +
 * cancel buttons. Demonstrates a typical "are you sure?" interaction.
 */
export const Confirm: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "Confirmation flow built on top of the generic `Modal`. The cancel",
          "button calls `onClose`; the destructive primary button performs the",
          "action and then closes.",
          "",
          'Uses `role="alertdialog"` because the dialog interrupts the user',
          "for a critical, irreversible decision — this is the WAI-ARIA pattern",
          "for destructive confirmations.",
        ].join("\n"),
      },
    },
  },
  render: () => {
    const ConfirmDemo = () => {
      const [open, setOpen] = useState(false);
      const [result, setResult] = useState<"none" | "confirmed" | "cancelled">(
        "none",
      );
      const close = () => setOpen(false);
      return (
        <Stack direction="column" gap="3" align="start">
          <Button
            variant="primary"
            onClick={() => {
              setResult("none");
              setOpen(true);
            }}
            data-testid="open-confirm"
          >
            계정 삭제…
          </Button>
          <span className="text-xs text-era-muted" data-testid="confirm-result">
            결과: {result}
          </span>
          <Modal
            open={open}
            onClose={close}
            role="alertdialog"
            size="sm"
            title="계정을 삭제할까요?"
            description="삭제 후에는 복구할 수 없습니다. 모든 데이터가 영구적으로 사라집니다."
            footer={
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setResult("cancelled");
                    close();
                  }}
                  data-testid="confirm-cancel"
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setResult("confirmed");
                    close();
                  }}
                  data-testid="confirm-accept"
                >
                  삭제
                </Button>
              </>
            }
          />
        </Stack>
      );
    };
    return <ConfirmDemo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByTestId("open-confirm");
    await userEvent.click(trigger);
    const alert = await screen.findByRole("alertdialog");
    await expect(alert).toHaveAttribute("aria-modal", "true");
    // Close to leave a clean DOM for subsequent stories.
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
  },
};

/**
 * Form modal — typical "edit profile" or "create item" pattern.
 */
export const Form: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "When a form lives inside the dialog, focusing the first input on",
          "open is part of WAI-ARIA's expected behavior. The Modal moves focus",
          "to the first focusable descendant by default, so the first `Input`",
          "is focused on open without any extra wiring. Pass `initialFocusRef`",
          "to override which element receives focus.",
        ].join("\n"),
      },
    },
  },
  render: () => {
    const FormDemo = () => {
      const [open, setOpen] = useState(false);
      const firstInputRef = useRef<HTMLInputElement>(null);
      useEffect(() => {
        if (open) {
          // Wait one tick so the portal child has mounted before focusing.
          const id = window.setTimeout(() => firstInputRef.current?.focus(), 0);
          return () => window.clearTimeout(id);
        }
      }, [open]);
      const close = () => setOpen(false);
      return (
        <>
          <Button
            variant="primary"
            onClick={() => setOpen(true)}
            data-testid="open-form"
          >
            프로필 수정
          </Button>
          <Modal
            open={open}
            onClose={close}
            size="md"
            title="프로필 수정"
            description="아래 정보를 업데이트하면 즉시 반영됩니다."
            footer={
              <>
                <Button variant="ghost" onClick={close}>
                  취소
                </Button>
                <Button variant="primary" onClick={close}>
                  저장
                </Button>
              </>
            }
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                close();
              }}
              className="space-y-3 mb-5"
            >
              <label className="block">
                <span className="block text-sm text-era-primary mb-1">
                  이름
                </span>
                <Input
                  ref={firstInputRef}
                  defaultValue="김유신"
                  data-testid="form-first-input"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-era-primary mb-1">
                  이메일
                </span>
                <Input
                  type="email"
                  defaultValue="kim@example.com"
                  data-testid="form-email"
                />
              </label>
            </form>
          </Modal>
        </>
      );
    };
    return <FormDemo />;
  },
};

/**
 * Two stacked Modals. Opening the inner dialog while the outer is open is
 * supported because each panel uses its own `useId()`-derived title id, and
 * focus restoration cascades correctly: closing the inner dialog returns
 * focus to the trigger inside the outer; closing the outer returns focus to
 * the original page trigger.
 */
export const Nested: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "The outer modal contains a button that opens a second modal. Both",
          "panels are rendered into `document.body` via the same portal, so",
          "they coexist without z-index conflicts (`z-modal` for the panel and",
          "`z-modal-backdrop` for the overlay).",
          "",
          "Each modal's title id is generated from `useId()`, so two open",
          "dialogs never collide on `aria-labelledby`. Body scroll lock is",
          "shared via an internal stacking counter — the lock is released only",
          "when the last modal closes.",
          "",
          "Focus restoration is automatic: the previously focused element is",
          "captured on open and re-focused on close.",
        ].join("\n"),
      },
    },
  },
  render: () => {
    const NestedDemo = () => {
      const [outer, setOuter] = useState(false);
      const [inner, setInner] = useState(false);
      return (
        <>
          <Button
            variant="primary"
            onClick={() => setOuter(true)}
            data-testid="open-outer"
          >
            바깥 모달 열기
          </Button>
          <Modal
            open={outer}
            onClose={() => setOuter(false)}
            size="md"
            title="바깥 모달"
            footer={
              <Button
                variant="secondary"
                onClick={() => setOuter(false)}
                data-testid="close-outer"
              >
                바깥 닫기
              </Button>
            }
          >
            <p className="text-sm text-era-secondary mb-5">
              바깥 모달 안에서 또 다른 모달을 열 수 있습니다.
            </p>
            <Stack direction="row" gap="2">
              <Button
                variant="primary"
                onClick={() => setInner(true)}
                data-testid="open-inner"
              >
                안쪽 모달 열기
              </Button>
            </Stack>
          </Modal>
          <Modal
            open={inner}
            onClose={() => setInner(false)}
            size="sm"
            description="이 모달은 바깥 모달 위에 떠 있습니다."
            footer={
              <Button
                variant="primary"
                onClick={() => setInner(false)}
                data-testid="close-inner"
              >
                안쪽 닫기
              </Button>
            }
          />
        </>
      );
    };
    return <NestedDemo />;
  },
};

/**
 * `closeOnBackdropClick={false}` — only an explicit action button can close
 * the dialog. Useful for forms where accidental dismissal would lose data.
 */
export const NoBackdropClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "With `closeOnBackdropClick={false}` the backdrop's click handler short-circuits, so users cannot dismiss by clicking outside. Escape still closes unless `closeOnEscape={false}` is also set. This pairing is appropriate for irreversible flows or unsaved-data guards.",
      },
    },
  },
  render: () => (
    <ModalDemo
      title="저장하지 않은 변경사항"
      description="이 모달은 바깥을 클릭해도 닫히지 않습니다. 명시적 액션만 허용됩니다."
      closeOnBackdropClick={false}
      footer={(close) => (
        <Button variant="primary" onClick={close} data-testid="explicit-close">
          확인
        </Button>
      )}
    >
      <p className="text-sm text-era-secondary mb-5">
        실수로 닫히면 안 되는 흐름에서 사용하세요.
      </p>
    </ModalDemo>
  ),
};

/**
 * Programmatic open/close via the forwarded ref. The ref points at the panel
 * `<div role="dialog">`, so it can be queried/inspected but the open state
 * itself is owned by React (no imperative `open()`/`close()` API exists).
 */
export const WithRef: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "`Modal` forwards its ref to the dialog panel `<div>`. The story",
          "logs `ref.current` when the dialog opens to demonstrate that the",
          "panel element is reachable, e.g., to attach a `MutationObserver`",
          "or to scroll a child into view.",
          "",
          "**Note:** because `open` is a controlled prop, the ref does not",
          "expose imperative `open()` / `close()` methods — toggling open is",
          "done by setting React state.",
        ].join("\n"),
      },
    },
  },
  render: () => {
    const RefDemo = () => {
      const [open, setOpen] = useState(false);
      const [tag, setTag] = useState<string>("(none)");
      const dialogRef = useRef<HTMLDivElement>(null);
      useEffect(() => {
        if (open) {
          const id = window.setTimeout(() => {
            const node = dialogRef.current;
            setTag(
              node
                ? `${node.tagName.toLowerCase()}[role=${node.getAttribute("role")}]`
                : "(null)",
            );
          }, 0);
          return () => window.clearTimeout(id);
        }
      }, [open]);
      return (
        <Stack direction="column" gap="3" align="start">
          <Button
            variant="primary"
            onClick={() => setOpen(true)}
            data-testid="open-ref"
          >
            ref 모달 열기
          </Button>
          <span className="text-xs text-era-muted" data-testid="ref-tag">
            ref.current → {tag}
          </span>
          <Modal
            ref={dialogRef}
            open={open}
            onClose={() => setOpen(false)}
            title="forwardRef 데모"
            description="콘솔에서 ref.current를 확인하세요."
            footer={
              <Button
                variant="primary"
                onClick={() => setOpen(false)}
                data-testid="ref-close"
              >
                닫기
              </Button>
            }
          />
        </Stack>
      );
    };
    return <RefDemo />;
  },
};

/**
 * Heritage / Neon side-by-side. Triggers in each panel open their own modal
 * — both modals will appear over the entire viewport because they portal
 * to `document.body`, but only the era under the panel that owns the open
 * state is captured in the panel's CSS variable scope.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: [
          "Same `Modal` markup rendered with two trigger panels — Heritage on",
          "the left, Neon on the right. Each trigger opens its own dialog;",
          "the panel surface, border, modal shadow, and title font flip via",
          "the era CSS layer.",
          "",
          "**Caveat:** because the modal portals to `document.body` (outside",
          "the era panel's subtree), it picks up the *root* `data-era` rather",
          "than the surrounding panel's. To see Heritage and Neon styling",
          "inside the dialog itself, change the toolbar Era global between",
          "openings.",
        ].join("\n"),
      },
    },
  },
  render: () =>
    bothEras(({ era }) => (
      <ModalDemo
        triggerLabel={`${era} 모달`}
        triggerTestId={`era-trigger-${era}`}
        // Use the outlined variant so contrast is driven by the era surface
        // (AA-tuned in both eras), not the indigo accent fill which dips
        // below 4.5:1 in Neon. See ModalDemo's `triggerVariant` doc.
        triggerVariant="secondary"
        title={`${era} dialog`}
        description={`Era 토큰이 어떻게 적용되는지 확인하세요. 현재: ${era}`}
      >
        <p className="text-sm text-era-secondary mb-5">
          {era === "heritage"
            ? "한지 표면, 청자 그림자, 곡선이 부드러운 윤곽."
            : "어두운 배경, 발광 윤곽, 직선적 타이포그래피."}
        </p>
      </ModalDemo>
    )),
};

/**
 * Interaction proof. Verifies portal-based queries, role/aria attributes,
 * the WAI-ARIA dialog pattern (initial focus, focus restoration), and the
 * three close paths (Escape, backdrop, explicit button).
 */
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: [
          "Automated proof of the WAI-ARIA dialog pattern:",
          "1. Trigger renders inside the canvas.",
          '2. Clicking the trigger mounts a portaled `role="dialog"` with',
          '   `aria-modal="true"` and `aria-labelledby` referencing the real',
          "   title element id (queried via `screen` because the portal lives",
          "   outside `canvasElement`).",
          "3. Initial focus moves *inside* the dialog on open.",
          "4. Pressing Escape closes the dialog and restores focus to the",
          "   trigger button.",
          "5. Re-opening, then clicking the backdrop closes the dialog.",
          "6. Re-opening, then clicking the explicit close button closes it.",
        ].join("\n"),
      },
    },
  },
  render: () => (
    <ModalDemo
      triggerLabel="Run interactive test"
      triggerTestId="play-trigger"
      title="Interactive dialog"
      description="play 함수가 이 모달을 검증합니다."
    >
      <p className="text-sm text-era-secondary mb-5">
        Escape, 백드롭 클릭, 닫기 버튼 — 세 가지 닫기 경로를 모두 검증합니다.
      </p>
    </ModalDemo>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByTestId("play-trigger");

    await step(
      "opens with role=dialog, aria-modal=true, and aria-labelledby pointing at a real id",
      async () => {
        await userEvent.click(trigger);
        const dialog = await screen.findByRole("dialog");
        await expect(dialog).toHaveAttribute("aria-modal", "true");
        const labelledBy = dialog.getAttribute("aria-labelledby");
        await expect(labelledBy).toBeTruthy();
        const labelEl = labelledBy ? document.getElementById(labelledBy) : null;
        await expect(labelEl).not.toBeNull();
        await expect(labelEl).toHaveTextContent("Interactive dialog");
      },
    );

    await step("moves initial focus inside the dialog", async () => {
      const dialog = await screen.findByRole("dialog");
      // The component schedules focus on a setTimeout(0); poll briefly.
      await waitFor(() => {
        const active = document.activeElement;
        expect(active === dialog || (active && dialog.contains(active))).toBe(
          true,
        );
      });
    });

    await step(
      "closes on Escape and restores focus to the trigger",
      async () => {
        await userEvent.keyboard("{Escape}");
        await waitFor(() =>
          expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
        );
        await waitFor(() => expect(trigger).toHaveFocus());
      },
    );

    await step("closes on backdrop click", async () => {
      await userEvent.click(trigger);
      const backdrop = await screen.findByRole("presentation");
      await userEvent.click(backdrop);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    await step("closes on explicit close button", async () => {
      await userEvent.click(trigger);
      const closeButton = await screen.findByTestId("modal-close");
      await userEvent.click(closeButton);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });
  },
};
