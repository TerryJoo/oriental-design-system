import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useId, useState, type ReactNode } from "react";
import {
  MarkdownEditor,
  type MarkdownToolbarAction,
} from "@/components/MarkdownEditor";
import { boolArg, bothEras } from "./_shared/argTypes";

/* ------------------------------------------------------------------ */
/* Sample content                                                      */
/* ------------------------------------------------------------------ */

const SAMPLE_SHORT = "이번 수는 **두터움**을 우선하는 굳힘이 좋아 보입니다.";

const SAMPLE_MULTILINE = [
  "# 대국 분석",
  "",
  "## 핵심 수순",
  "",
  "1. 우상귀 굳힘으로 두터움 확보",
  "2. 좌변 전개로 실리 균형",
  "3. 중앙 진출로 세력 확장",
  "",
  "## 변화도",
  "",
  "- 흑이 침입할 경우 좌하귀 응수",
  "- 백이 굳힐 경우 우변 갈라치기",
  "",
  "> 두터움과 실리의 균형이 핵심.",
].join("\n");

const SAMPLE_RICH = [
  "# 오리엔탈 디자인 시스템",
  "",
  "**Heritage**와 **Neon** 두 시대를 모두 지원하는 컴포넌트 라이브러리입니다.",
  "",
  "## 기능",
  "",
  "- 오방색 기반 팔레트",
  "- `data-era` 속성으로 시대 전환",
  "- *런타임 리렌더링 없음*",
  "",
  "## 코드 예시",
  "",
  "```ts",
  "import { applyEra } from '@jyi/design-system/core';",
  "applyEra(document.documentElement, 'heritage');",
  "```",
  "",
  "## 비교표",
  "",
  "| 시대 | 폰트 | 분위기 |",
  "| --- | --- | --- |",
  "| Heritage | Gowun Batang | 고요함 |",
  "| Neon | Orbitron | 미래적 |",
  "",
  "- [x] 토큰 정의",
  "- [x] 컴포넌트 구현",
  "- [ ] 다크 모드 검토",
].join("\n");

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

const meta = {
  title: "Components/MarkdownEditor",
  component: MarkdownEditor,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "MarkdownEditor pairs a real `<textarea>` with a customizable toolbar of " +
          "wrap/prefix actions. Selecting text and clicking a toolbar entry wraps the " +
          "selection (e.g. `**bold**`) or — for prefix actions — prepends a marker " +
          "(`# `, `> `, `- `) at the start of the current line. With no selection, " +
          "wrap actions insert the placeholder token `텍스트` between the markers. " +
          "The component supports both controlled (`value`/`onChange`) and uncontrolled " +
          "(`defaultValue`) modes; `onChange` receives the next string value, not the " +
          "DOM event. The default toolbar exposes 8 actions (Bold, Italic, H1, H2, " +
          "Quote, List, Task, Inline-code) and can be replaced wholesale via the " +
          "`actions` prop with a `MarkdownToolbarAction[]`. Textarea-level concerns " +
          "(`disabled`, `maxLength`, `aria-*`) are forwarded through `textareaProps`. " +
          "Pass `renderPreview` to opt into a built-in live preview pane (split or " +
          "stacked) — the consumer brings their own markdown renderer (e.g. " +
          "`marked`, `react-markdown`, or a simple regex transform). Character " +
          "counters and syntax highlighters remain composition recipes — see the " +
          "stories below.",
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Controlled markdown source. Pair with `onChange`.",
    },
    defaultValue: {
      control: "text",
      description: "Initial uncontrolled markdown source.",
    },
    placeholder: {
      control: "text",
      description: "Textarea placeholder.",
    },
    actions: {
      control: false,
      description:
        "Toolbar actions. Each item is a `MarkdownToolbarAction` with a unique " +
        "`key`, a visible `label` (ReactNode), and either a `wrap` marker or a " +
        "line `prefix`. Defaults to the 8-action set.",
    },
    textareaProps: {
      control: false,
      description:
        "Forwarded to the inner `<textarea>` (excluding value/defaultValue/" +
        "onChange/placeholder/className). Use this for `disabled`, `maxLength`, " +
        "`aria-*`, or `rows`.",
    },
    renderPreview: {
      control: false,
      description:
        "Optional `(markdown: string) => ReactNode` renderer. When provided, " +
        "MarkdownEditor renders a built-in preview pane next to (or below) " +
        "the textarea. The consumer brings their own markdown parser.",
    },
    previewLayout: {
      control: { type: "radio" },
      options: ["split", "stacked"],
      description:
        "Preview pane layout when `renderPreview` is provided. `split` " +
        "(default) sits beside the textarea on md+ viewports; `stacked` is " +
        "always vertical.",
    },
    previewClassName: {
      control: false,
      description: "Extra className applied to the preview pane wrapper.",
    },
    previewAriaLabel: {
      control: "text",
      description:
        "Accessible name for the preview region. Defaults to '마크다운 미리보기'.",
    },
    onChange: { action: "change" },
  },
  args: {
    placeholder: "마크다운으로 입력하세요…",
  },
} satisfies Meta<typeof MarkdownEditor>;

export default meta;
type Story = StoryObj<typeof MarkdownEditor>;

/* ------------------------------------------------------------------ */
/* Basic states                                                        */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Empty editor with the default 8-action toolbar (Bold, Italic, H1, H2, " +
          "Quote, List, Task, Inline-code). Type into the textarea or click a toolbar " +
          "button to insert markers around the current selection (or a `텍스트` " +
          "placeholder when nothing is selected).",
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
          "Pre-filled markdown via the uncontrolled `defaultValue` prop. The bold " +
          "markers are stored as raw `**…**` tokens — MarkdownEditor does not render " +
          "the formatted output (see `RichContent` for the full token spectrum).",
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
          "A long markdown document covering H1/H2 headings, ordered and unordered " +
          "lists, and a blockquote. The textarea is `resize-y`, so users can drag " +
          "the bottom edge to enlarge the editing surface vertically.",
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Custom toolbar                                                      */
/* ------------------------------------------------------------------ */

const CUSTOM_ACTIONS: MarkdownToolbarAction[] = [
  { key: "strike", label: <s>S</s>, wrap: "~~", title: "취소선" },
  { key: "h3", label: "H3", prefix: "### ", title: "제목 3" },
  {
    key: "callout",
    label: <span aria-hidden="true">★</span>,
    prefix: "> 💡 ",
    title: "강조 인용",
  },
  { key: "code-block", label: "{ }", wrap: "```\n", title: "코드 블록" },
  { key: "hr", label: "—", prefix: "---\n", title: "구분선" },
];

export const CustomToolbar: Story = {
  args: {
    actions: CUSTOM_ACTIONS,
    defaultValue: "본문에서 일부 단어를 선택하고 도구를 눌러 보세요.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Replaces the default toolbar with a custom `MarkdownToolbarAction[]`. " +
          "Each action declares a `key`, a visible `label` (any ReactNode — string, " +
          "icon, or styled tag), and either a `wrap` marker (applied around the " +
          "current selection) or a line `prefix` (applied at the start of the " +
          "current line). The `title` shows up as a native browser tooltip **and** " +
          "is mirrored into `aria-label` for the accessible name (with a fallback " +
          "to `key` when `title` is omitted), so icon-only labels — like the " +
          "`★` callout below wrapped in `aria-hidden` — still expose a button name.",
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Built-in preview — `renderPreview` prop                             */
/* ------------------------------------------------------------------ */

const renderInlineMarkdown = (line: string): string =>
  line
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");

// Lightweight markdown→ReactNode renderer used by the preview stories.
// Production consumers should swap this for `marked`, `react-markdown`, or
// any battle-tested parser. Because `renderPreview` is just a function, the
// editor itself stays parser-agnostic.
const renderPreviewBlocks = (source: string): ReactNode => {
  // Two-pass: render each line into either a list item (string) or a
  // standalone block, then collapse runs of list items into a single
  // <ul>. This keeps <li> elements properly contained per WCAG
  // (axe rule: listitem) while preserving the line-driven layout.
  type Node =
    | { kind: "block"; el: ReactNode }
    | { kind: "li"; key: string; text: string };

  const nodes: Node[] = source.split("\n").map((line, i) => {
    const key = `${i}-${line}`;
    if (line.startsWith("# ")) {
      return {
        kind: "block",
        el: (
          <h1 key={key} className="text-lg font-bold text-era-primary">
            {renderInlineMarkdown(line.slice(2))}
          </h1>
        ),
      };
    }
    if (line.startsWith("## ")) {
      return {
        kind: "block",
        el: (
          <h2 key={key} className="text-base font-semibold text-era-primary">
            {renderInlineMarkdown(line.slice(3))}
          </h2>
        ),
      };
    }
    if (line.startsWith("> ")) {
      return {
        kind: "block",
        el: (
          <blockquote
            key={key}
            className="border-l-2 border-era-soft pl-3 italic text-era-muted"
          >
            {renderInlineMarkdown(line.slice(2))}
          </blockquote>
        ),
      };
    }
    if (line.startsWith("- ")) {
      return { kind: "li", key, text: line.slice(2) };
    }
    if (line.trim() === "") {
      return {
        kind: "block",
        el: <div key={key} aria-hidden="true" className="h-2" />,
      };
    }
    return {
      kind: "block",
      el: (
        <p key={key} className="text-era-primary">
          {renderInlineMarkdown(line)}
        </p>
      ),
    };
  });

  const out: ReactNode[] = [];
  let bucket: { key: string; text: string }[] = [];
  const flush = () => {
    if (bucket.length === 0) return;
    const ulKey = `ul-${bucket[0].key}`;
    out.push(
      <ul key={ulKey} className="ml-5 list-disc text-era-primary">
        {bucket.map((item) => (
          <li key={item.key}>{renderInlineMarkdown(item.text)}</li>
        ))}
      </ul>,
    );
    bucket = [];
  };
  for (const node of nodes) {
    if (node.kind === "li") {
      bucket.push({ key: node.key, text: node.text });
    } else {
      flush();
      out.push(node.el);
    }
  }
  flush();
  return <div className="flex flex-col gap-1">{out}</div>;
};

export const WithPreview: Story = {
  args: {
    defaultValue: SAMPLE_MULTILINE,
    renderPreview: renderPreviewBlocks,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass `renderPreview={(md) => ReactNode}` to opt into a first-class " +
          "preview pane. The editor renders the textarea on the left and the " +
          "preview on the right (collapsing to stacked on narrow viewports). " +
          "The preview region is wired with `role='region'`, an `aria-label`, " +
          "and `aria-live='polite'` so screen readers announce updates as the " +
          "user pauses typing. The renderer below is a small regex-based demo — " +
          "production consumers can plug in `marked`, `markdown-it`, " +
          "`react-markdown`, or any custom transform without changes to " +
          "MarkdownEditor itself.",
      },
    },
  },
};

export const WithPreviewStacked: Story = {
  args: {
    defaultValue: SAMPLE_MULTILINE,
    renderPreview: renderPreviewBlocks,
    previewLayout: "stacked",
  },
  parameters: {
    docs: {
      description: {
        story:
          "`previewLayout='stacked'` always renders the preview below the " +
          "textarea — useful for narrow viewports, sidebar embeds, or when the " +
          "horizontal split would crowd the editing surface. The preview pane " +
          "still exposes `role='region'` + `aria-live='polite'`, so the " +
          "accessibility story is identical to the split layout.",
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* Disabled                                                            */
/* ------------------------------------------------------------------ */

export const Disabled: Story = {
  args: {
    defaultValue: "이 편집기는 현재 잠겨 있습니다.",
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Setting the top-level `disabled` prop locks both the textarea **and** " +
          "every toolbar button — they all receive the native `disabled` " +
          "attribute, so neither typing nor toolbar clicks mutate the value. " +
          "The legacy `textareaProps={{ disabled: true }}` escape hatch still " +
          "works for textarea-only locks, but the top-level prop wins when " +
          "both are set.",
      },
    },
  },
};

export const DisabledTextareaOnly: Story = {
  args: {
    defaultValue: "텍스트 입력만 잠겨 있습니다 — 도구는 여전히 동작합니다.",
    textareaProps: { disabled: true },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Backwards-compat path: forwarding `disabled: true` through " +
          "`textareaProps` disables only the textarea. Toolbar buttons remain " +
          "interactive, mirroring the historical behavior before the top-level " +
          "`disabled` prop existed. Prefer the top-level prop for new code; " +
          "this escape hatch is documented for migration.",
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/* MaxLength via textareaProps                                         */
/* ------------------------------------------------------------------ */

export const WithMaxLength: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The component itself has no `maxLength` prop — pass it through " +
          "`textareaProps`. This story adds a live character counter that " +
          "announces the remaining count via `aria-live='polite'` and links to " +
          "the textarea via `aria-describedby`. **Note:** because toolbar " +
          "wrap/prefix actions push characters into the textarea programmatically " +
          "via `onChange` rather than the keyboard, the native `maxLength` cap " +
          "may be exceeded by toolbar insertions; enforce final limits in your " +
          "`onChange` handler if strict capping is required.",
      },
    },
  },
  render: (args) => {
    const MAX = 240;
    const CounterDemo = () => {
      const [value, setValue] = useState(
        "이 편집기는 240자 제한이 있습니다. 도구를 사용하면 표시기가 갱신됩니다.",
      );
      const counterId = useId();
      const remaining = MAX - value.length;
      const nearLimit = remaining <= 32;
      return (
        <div className="flex w-full max-w-xl flex-col gap-2">
          <MarkdownEditor
            {...args}
            value={value}
            onChange={(next) => {
              setValue(next);
              args.onChange?.(next);
            }}
            textareaProps={{
              maxLength: MAX,
              "aria-describedby": counterId,
            }}
          />
          <p
            id={counterId}
            aria-live="polite"
            className={
              nearLimit
                ? "text-right text-xs font-medium text-error-700"
                : "text-right text-xs text-era-muted"
            }
          >
            {value.length} / {MAX}
          </p>
        </div>
      );
    };
    return <CounterDemo />;
  },
};

/* ------------------------------------------------------------------ */
/* Rich content                                                        */
/* ------------------------------------------------------------------ */

export const RichContent: Story = {
  args: { defaultValue: SAMPLE_RICH },
  parameters: {
    docs: {
      description: {
        story:
          "A near-comprehensive markdown sample: H1/H2 headings, bold/italic/" +
          "inline-code, fenced code blocks, bullet lists, GitHub-style task lists, " +
          "and a pipe table. MarkdownEditor stores these as raw text — the " +
          "textarea preserves whitespace and `\\n` newlines exactly. Pair with the " +
          "preview pattern shown in `WithPreview` for a rendered split view.",
      },
    },
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
          "Heritage and Neon eras side-by-side. The container surface, toolbar " +
          "divider, hover accent, focus background, and monospace stack all flow " +
          "from `--era-*` and `--accent-*` custom properties — the same markup " +
          "renders without any era-conditional logic.",
      },
    },
  },
  render: (args) =>
    bothEras(({ era }) => (
      <MarkdownEditor
        {...args}
        defaultValue={
          era === "heritage"
            ? "## 전통의 깊이\n\n*붓끝*에서 흘러나오는 **고요한** 결을 담습니다."
            : "## 미래의 광채\n\n*전류*가 흐르는 **선명한** 격자를 그립니다."
        }
      />
    )),
};

/* ------------------------------------------------------------------ */
/* Interactive — play function                                         */
/* ------------------------------------------------------------------ */

export const Interactive: Story = {
  args: {
    onChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Drives MarkdownEditor end-to-end with `@storybook/test`. Verifies " +
          "(1) the toolbar exposes `role='toolbar'` with an accessible name, " +
          "(2) toolbar buttons each carry an `aria-label` derived from the " +
          "action's `title` (or `key` as fallback), (3) typing into the " +
          "textarea fires `onChange` and updates the value, and (4) clicking " +
          "the Bold button wraps the inserted placeholder token with `**` " +
          "markers when there is no selection.",
      },
    },
  },
  render: (args) => <MarkdownEditor {...args} data-testid="md-editor" />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // 1. Toolbar uses role="toolbar" with an accessible name.
    const toolbar = canvas.getByRole("toolbar", { name: "서식 도구" });
    await expect(toolbar).toBeInTheDocument();

    // 2. Toolbar buttons expose an accessible name via aria-label
    //    (sourced from action.title — falls back to action.key for icon-
    //    only actions). axe `button-name` passes regardless of label
    //    ReactNode shape.
    const boldButton = within(toolbar).getByRole("button", { name: "굵게" });
    await expect(boldButton).toBeInTheDocument();
    await expect(boldButton).toHaveAttribute("title", "굵게");
    await expect(boldButton).toHaveAttribute("aria-label", "굵게");

    // The H1 prefix button uses its title="제목 1" as the accessible name.
    const h1Button = within(toolbar).getByRole("button", { name: "제목 1" });
    await expect(h1Button).toBeInTheDocument();

    // 3. Typing into the textarea updates the value and fires onChange.
    const textbox = canvas.getByRole("textbox") as HTMLTextAreaElement;
    await expect(textbox.tagName).toBe("TEXTAREA");
    await userEvent.click(textbox);
    await userEvent.type(textbox, "굵게 만들기");
    await expect(textbox.value).toBe("굵게 만들기");
    await expect(args.onChange).toHaveBeenCalled();

    // 4. With the cursor at end and no selection, clicking Bold inserts the
    //    placeholder token "텍스트" wrapped in `**` markers.
    textbox.setSelectionRange(textbox.value.length, textbox.value.length);
    await userEvent.click(boldButton);
    const lastCall = (args.onChange as ReturnType<typeof fn>).mock.calls.at(
      -1,
    ) as [string];
    await expect(lastCall[0]).toContain("**텍스트**");
    await expect(lastCall[0].startsWith("굵게 만들기")).toBe(true);
  },
};

/* ------------------------------------------------------------------ */
/* a11y note (kept here for audit traceability — see story body):      */
/*                                                                     */
/* - Editor area: real <textarea>. role="textbox" is implicit;         */
/*   aria-multiline is implied by the tag, no extra attribute needed.  */
/*   Default `aria-label="마크다운 편집기"` guarantees an accessible    */
/*   name; consumers can override via `textareaProps['aria-label']` or */
/*   wire up an external <label> + `aria-labelledby`.                  */
/* - Toolbar: role="toolbar" + aria-label="서식 도구" ✓                 */
/* - Toolbar buttons: each <button> carries an `aria-label` derived    */
/*   from `action.title` (or `action.key` as a fallback when no title  */
/*   is supplied). This makes the accessible name independent of the   */
/*   `label` ReactNode — icon-only labels (`<svg>`, decorative spans)  */
/*   no longer trip the axe `button-name` rule. The native `title`     */
/*   attribute is preserved for the browser-tooltip affordance.        */
/* - Toggle/active state: no `aria-pressed` is wired up because the    */
/*   component does not track which markers are currently active in   */
/*   the selection. If future work adds an "is bold" detection, the   */
/*   buttons should switch to `aria-pressed="true|false"`.             */
/* - Disabled: top-level `disabled` prop locks the textarea AND every */
/*   toolbar button (native `disabled` on each <button>). Legacy       */
/*   `textareaProps={{ disabled: true }}` remains a textarea-only      */
/*   escape hatch (see DisabledTextareaOnly story).                    */
/* - Preview pane (renderPreview): wrapped in role="region" with an    */
/*   `aria-label` ("마크다운 미리보기" by default, overridable via     */
/*   `previewAriaLabel`) and `aria-live="polite"`. Per-keystroke       */
/*   *renders* are unthrottled (the consumer renderer is presumed      */
/*   cheap), but assistive-tech announcements are throttled by the    */
/*   live-region politeness setting itself — screen readers wait for  */
/*   typing pauses instead of firing on every keypress.                */
/* - Boolean placeholder note: we use boolArg only via shared builders */
/*   when applicable; this component has no boolean root props, so    */
/*   none are declared at the meta level.                              */
/* ------------------------------------------------------------------ */
// boolArg is re-exported via _shared/argTypes for consistency with sibling
// stories; not used here because MarkdownEditor exposes no boolean root prop.
void boolArg;
