import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useId, useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { boolArg, bothEras } from "./_shared/argTypes";

const SAMPLE_SHORT = "어디에 두면 좋을까?";

const SAMPLE_MULTILINE = [
  "이번 수는 흑이 우상귀를 굳히는 굳힘이 좋아 보인다.",
  "다만 백이 좌하귀에서 침입할 여지가 남아 있어",
  "굳힘 직후 좌변 전개를 어디까지 할지 결정해야 한다.",
  "전략적으로는 두터움을 우선하되,",
  "실리도 함께 챙기는 양면 전략을 추천한다.",
].join("\n");

const meta = {
  title: "Components/PromptInput",
  component: PromptInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "PromptInput is a chat-style prompt entry control built around a single-line " +
          "auto-resizing `<textarea>` plus a circular send button. " +
          "Press **Enter** to submit; **Shift+Enter** inserts a newline. " +
          "The textarea grows up to a max height (~12rem / `max-h-48`) and then scrolls. " +
          "Empty/whitespace-only values are not submitted. " +
          "Supports both controlled (`value`/`onChange`) and uncontrolled (`defaultValue`) modes. " +
          "First-class props: `label` (linked via `htmlFor`/`id`), `error` (toggles `aria-invalid` " +
          "and red ring), `helperText` (replaced when `error` is set), `maxLength` (renders a live " +
          "`current/max` counter linked via `aria-describedby`), and `loading` (overlays a Spinner " +
          "and makes the input inert). Arbitrary `<textarea>` attributes still pass through " +
          "`textareaProps` for advanced cases (`@mention` combobox, etc.).",
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Controlled value. Pair with `onChange`.",
    },
    defaultValue: {
      control: "text",
      description: "Initial uncontrolled value.",
    },
    placeholder: {
      control: "text",
      description: "Textarea placeholder.",
    },
    sendLabel: {
      control: "text",
      description: "Accessible name for the send button (`aria-label`).",
    },
    sendIcon: {
      control: false,
      description: "Visual content of the send button. Defaults to `➤`.",
    },
    label: {
      control: "text",
      description:
        "Visible label rendered above the textarea, linked via `htmlFor`.",
    },
    helperText: {
      control: "text",
      description: "Helper text below the input. Hidden when `error` is set.",
    },
    error: {
      control: "text",
      description:
        "Error message; sets `aria-invalid`, replaces helper text, and applies a red ring.",
    },
    maxLength: {
      control: "number",
      description:
        "Hard character cap. Renders a live `current/max` counter under the input.",
    },
    loading: boolArg(
      "Overlays a Spinner and makes the textarea + send button inert.",
    ),
    disabled: boolArg("Disable both the textarea and the send button."),
    onChange: { action: "change" },
    onSubmit: { action: "submit" },
  },
  args: {
    placeholder: "다음 수를 묻거나 전략을 입력하세요…",
    sendLabel: "전송",
    disabled: false,
    loading: false,
  },
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof PromptInput>;

/* ------------------------------------------------------------------ */
/* Basic states                                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty input with placeholder copy. Single-line height; the textarea will grow as the user types.",
      },
    },
  },
};

export const WithValue: Story = {
  args: { defaultValue: SAMPLE_SHORT },
  parameters: {
    docs: {
      description: {
        story:
          "Pre-filled with sample text using the uncontrolled `defaultValue` prop.",
      },
    },
  },
};

export const Multiline: Story = {
  args: { defaultValue: SAMPLE_MULTILINE },
  parameters: {
    docs: {
      description: {
        story:
          "Long multi-paragraph content forces line wraps and triggers auto-resize. " +
          "Once the textarea reaches `max-h-48` (~192px), it stops growing and scrolls internally.",
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Label / helper / error / counter — first-class props                */
/* ------------------------------------------------------------------ */

export const WithLabel: Story = {
  args: {
    label: "프롬프트",
    helperText: "Enter 키로 전송, Shift+Enter 로 줄바꿈을 입력합니다.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `label` prop renders a visible label and links it to the underlying textarea via " +
          "`htmlFor`/`id` (auto-generated through `useId`). The `helperText` prop renders a helper " +
          "row below the input.",
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: "프롬프트",
    error: "메시지를 입력한 후 전송해 주세요.",
    helperText: "이 텍스트는 error가 있는 동안 숨겨집니다.",
    defaultValue: "",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting `error` (a) toggles `aria-invalid='true'` on the textarea, (b) replaces helper " +
          "text with the error message in the era-aware error color, and (c) paints the shell with " +
          "a red border and focus ring. The error node id is auto-linked via `aria-describedby`.",
      },
    },
  },
};

export const WithMaxLength: Story = {
  args: {
    label: "짧은 프롬프트",
    maxLength: 80,
    helperText: "최대 80자까지 입력할 수 있습니다.",
    defaultValue: "이 메시지는 거의 한도에 도달했습니다. 짧게 줄여 주세요.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `maxLength` is set, PromptInput renders a live `current/max` counter under the " +
          "textarea. The counter element is linked via `aria-describedby` with `aria-live='polite'` " +
          "and switches to the error color once the user reaches the cap.",
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Submission shortcuts                                                */
/* ------------------------------------------------------------------ */

export const WithSubmitButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "PromptInput always renders a send button — there is no opt-out. The submission shortcut is **Enter** " +
          "(no modifier). **Shift+Enter** inserts a newline instead of submitting. The send button click is " +
          "equivalent to pressing Enter. The most recent submitted value is shown below for visual confirmation.",
      },
    },
  },
  render: (args) => {
    const SubmitDemo = () => {
      const [last, setLast] = useState<string>("");
      return (
        <div className="flex w-full max-w-xl flex-col gap-2">
          <PromptInput
            {...args}
            onSubmit={(v) => {
              setLast(v);
              args.onSubmit?.(v);
            }}
            data-testid="submit-demo"
          />
          <p className="text-xs text-era-muted">
            <span className="font-medium text-era-primary">
              Last submitted:
            </span>{" "}
            {last ? (
              <code className="font-era-mono">{last}</code>
            ) : (
              <em>(none)</em>
            )}
          </p>
          <p className="text-xs text-era-muted">
            Try: type a message and press{" "}
            <kbd className="font-era-mono">Enter</kbd> to submit, or{" "}
            <kbd className="font-era-mono">Shift</kbd>+
            <kbd className="font-era-mono">Enter</kbd> to add a newline.
          </p>
        </div>
      );
    };
    return <SubmitDemo />;
  },
};

/* ------------------------------------------------------------------ */
/* Loading / disabled                                                  */
/* ------------------------------------------------------------------ */

export const Loading: Story = {
  args: {
    loading: true,
    defaultValue: "이 수를 분석해 줘",
    label: "프롬프트",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The `loading` prop overlays a Spinner on the input shell, makes both the textarea and " +
          "the send button inert, and announces the loading state to assistive tech via the " +
          "Spinner's built-in `role='status'` + visually-hidden label.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "전송할 수 없는 상태입니다",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully disabled. The native `disabled` attribute is forwarded to both the textarea and the " +
          "send button, so neither participates in keyboard focus order.",
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Mentions / attachments — composition stories (component does not  */
/* ship these affordances natively, so we demo accessible patterns).  */
/* ------------------------------------------------------------------ */

const MENTION_OPTIONS = ["@white", "@black", "@coach", "@reviewer"] as const;

export const WithMentions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "PromptInput does not include a mention/slash-command popup. This story illustrates how a " +
          "consumer can detect a leading `@` token and render an associated listbox above the input. " +
          "The popup is wired with `role='listbox'` and the textarea declares `aria-controls`, " +
          "`aria-expanded`, and `aria-activedescendant` so a screen reader can announce the active " +
          "suggestion.",
      },
    },
  },
  render: (args) => {
    const MentionDemo = () => {
      const [value, setValue] = useState("");
      const listboxId = useId();
      const lastWord = value.split(/\s+/).pop() ?? "";
      const open = lastWord.startsWith("@");
      const filter = lastWord.slice(1).toLowerCase();
      const matches = MENTION_OPTIONS.filter((m) =>
        m.slice(1).toLowerCase().startsWith(filter),
      );
      const activeId = open && matches[0] ? `${listboxId}-0` : undefined;
      return (
        <div className="relative flex w-full max-w-xl flex-col gap-2">
          {open && matches.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="멘션 후보"
              className="rounded-md border border-era-soft bg-era-raised p-1 text-sm shadow-era-card"
            >
              {matches.map((m, i) => (
                <li
                  key={m}
                  id={`${listboxId}-${i}`}
                  role="option"
                  aria-selected={i === 0}
                  className={
                    i === 0
                      ? "rounded-sm bg-[rgb(var(--accent-600)/0.12)] px-2 py-1 font-medium text-era-primary"
                      : "rounded-sm px-2 py-1 text-era-muted"
                  }
                >
                  {m}
                </li>
              ))}
            </ul>
          ) : null}
          <PromptInput
            {...args}
            value={value}
            onChange={(v) => {
              setValue(v);
              args.onChange?.(v);
            }}
            placeholder="@흑 또는 @백 을 입력해 멘션하세요…"
            textareaProps={{
              role: "combobox",
              "aria-controls": listboxId,
              "aria-expanded": open,
              "aria-autocomplete": "list",
              "aria-activedescendant": activeId,
            }}
          />
          <p className="text-xs text-era-muted">
            Type <code className="font-era-mono">@</code> to open the mention
            list.
          </p>
        </div>
      );
    };
    return <MentionDemo />;
  },
};

export const WithAttachments: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "PromptInput has no built-in attachment slot. A consumer can render attachment chips above " +
          "the input and an attach button alongside the send button. The custom `sendIcon` prop is " +
          "intentionally not used here — instead, the attach control is a sibling element with its own " +
          "accessible name.",
      },
    },
  },
  render: (args) => {
    const AttachmentDemo = () => {
      const [files, setFiles] = useState<string[]>(["board-state.sgf"]);
      return (
        <div className="flex w-full max-w-xl flex-col gap-2">
          {files.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="첨부 파일">
              {files.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-1 rounded-full border border-era-soft bg-era-raised px-3 py-1 text-xs text-era-primary"
                >
                  <span aria-hidden="true">📎</span>
                  <span>{f}</span>
                  <button
                    type="button"
                    aria-label={`${f} 첨부 제거`}
                    className="ml-1 rounded-full px-1 text-era-muted hover:text-era-primary"
                    onClick={() =>
                      setFiles((prev) => prev.filter((x) => x !== f))
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex w-full items-end gap-2">
            <button
              type="button"
              aria-label="파일 첨부"
              className="grid h-9 w-9 place-items-center rounded-full border border-era-soft bg-era-raised text-era-primary shadow-era-card"
              onClick={() =>
                setFiles((prev) =>
                  prev.includes("notes.md") ? prev : [...prev, "notes.md"],
                )
              }
            >
              <span aria-hidden="true">＋</span>
            </button>
            <div className="flex-1">
              <PromptInput {...args} defaultValue="첨부와 함께 전송할 메시지" />
            </div>
          </div>
        </div>
      );
    };
    return <AttachmentDemo />;
  },
};

/* ------------------------------------------------------------------ */
/* Era comparison                                                      */
/* ------------------------------------------------------------------ */

export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Heritage and Neon eras side-by-side. The container surface, border, send button accent, " +
          "and typography all flow from `--era-*` and `--accent-*` custom properties, so the same " +
          "PromptInput markup adapts without any conditional logic.",
      },
    },
  },
  render: (args) =>
    bothEras(({ era }) => (
      <PromptInput
        {...args}
        defaultValue={
          era === "heritage"
            ? "두터움을 우선하는 전략을 제안해 줘."
            : "이 수의 승률을 분석해 줘."
        }
        placeholder={
          era === "heritage" ? "전략을 입력하세요…" : "프롬프트 입력…"
        }
      />
    )),
};

/* ------------------------------------------------------------------ */
/* Interactive — play function                                         */
/* ------------------------------------------------------------------ */

export const Interactive: Story = {
  args: {
    onSubmit: fn(),
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Drives PromptInput end-to-end with `@storybook/test`. Verifies (1) the underlying element is " +
          "a real `<textarea>` (so `aria-multiline` is implicit), (2) typing fires `onChange` per " +
          "keystroke, (3) Shift+Enter inserts a newline rather than submitting, (4) Enter alone fires " +
          "`onSubmit` with the trimmed value, (5) auto-resize grows `scrollHeight` past the initial " +
          "single-line height when the content wraps, and (6) the send button exposes its accessible " +
          "name via `aria-label='전송'`.",
      },
    },
  },
  render: (args) => <PromptInput {...args} data-testid="interactive-prompt" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const textbox = canvas.getByRole("textbox") as HTMLTextAreaElement;
    await expect(textbox.tagName).toBe("TEXTAREA");

    const send = canvas.getByRole("button", { name: "전송" });
    await expect(send).toBeInTheDocument();

    await userEvent.click(textbox);
    await userEvent.type(textbox, "Hello world");
    await expect(textbox.value).toBe("Hello world");
    await expect(args.onChange).toHaveBeenCalled();

    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    await expect(textbox.value).toContain("\n");
    await expect(args.onSubmit).not.toHaveBeenCalled();

    const initialHeight = textbox.scrollHeight;
    await userEvent.type(
      textbox,
      "line two with more text{Shift>}{Enter}{/Shift}line three with even more text{Shift>}{Enter}{/Shift}line four pushes the height further",
    );
    await expect(textbox.scrollHeight).toBeGreaterThan(initialHeight);

    await userEvent.keyboard("{Enter}");
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const submittedValue = (args.onSubmit as ReturnType<typeof fn>).mock
      .calls[0][0] as string;
    await expect(submittedValue).toBe(submittedValue.trim());
    await expect(submittedValue.startsWith("Hello world")).toBe(true);
  },
};
