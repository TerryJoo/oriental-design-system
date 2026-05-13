import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/utils/cn";
import {
  markdownEditorBody,
  markdownEditorBodySplit,
  markdownEditorBodyStacked,
  markdownEditorPreview,
  markdownEditorPreviewSplit,
  markdownEditorPreviewStacked,
  markdownEditorRoot,
  markdownEditorTextarea,
  markdownEditorTextareaDisabled,
  markdownEditorToolbar,
  markdownEditorToolButton,
  markdownEditorToolButtonDisabled,
} from "./MarkdownEditor.styles";

export interface MarkdownToolbarAction {
  /** Unique key. */
  key: string;
  /** Visible label, e.g. `<b>B</b>`. */
  label: ReactNode;
  /** Markdown wrap markers. e.g. `**` for bold. */
  wrap?: string;
  /** Line prefix, e.g. `# `, `> `, `- `. */
  prefix?: string;
  /** Title for screen readers. */
  title?: string;
}

const DEFAULT_ACTIONS: ReadonlyArray<MarkdownToolbarAction> = [
  { key: "b", label: <b>B</b>, wrap: "**", title: "굵게" },
  { key: "i", label: <i>I</i>, wrap: "*", title: "기울임" },
  { key: "h1", label: "H1", prefix: "# ", title: "제목 1" },
  { key: "h2", label: "H2", prefix: "## ", title: "제목 2" },
  { key: "quote", label: ">", prefix: "> ", title: "인용" },
  { key: "list", label: "•", prefix: "- ", title: "목록" },
  { key: "task", label: "[ ]", prefix: "- [ ] ", title: "체크리스트" },
  { key: "code", label: "</>", wrap: "`", title: "인라인 코드" },
];

export interface MarkdownEditorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Override toolbar actions. */
  actions?: ReadonlyArray<MarkdownToolbarAction>;
  /** Pass through to the inner textarea. */
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "defaultValue" | "onChange" | "placeholder" | "className"
  >;
  /**
   * Disables the textarea AND every toolbar button. Wins over
   * `textareaProps.disabled` so the top-level prop is the canonical lock.
   * Leave undefined / false to preserve the legacy `textareaProps.disabled`
   * escape hatch (textarea-only lock, toolbar stays interactive).
   */
  disabled?: boolean;
  /**
   * Renderer for the live preview pane. When omitted, MarkdownEditor renders
   * a single textarea (legacy behavior). When provided, the editor splits
   * into a textarea + preview region; the renderer receives the current
   * markdown source string and may return any ReactNode (consumer brings
   * their own parser — `marked`, `react-markdown`, regex, etc.).
   */
  renderPreview?: (markdown: string) => ReactNode;
  /**
   * Layout for the preview pane when `renderPreview` is provided.
   * `'split'` (default): side-by-side on md+, stacked on narrow viewports.
   * `'stacked'`: textarea on top, preview below — always vertical.
   */
  previewLayout?: "split" | "stacked";
  /** Extra className applied to the preview pane wrapper. */
  previewClassName?: string;
  /**
   * Accessible name for the preview region. Defaults to a Korean label
   * matching the editor's textarea label conventions.
   */
  previewAriaLabel?: string;
  className?: string;
}

export const MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      placeholder = "마크다운으로 입력하세요…",
      actions = DEFAULT_ACTIONS,
      textareaProps,
      disabled = false,
      renderPreview,
      previewLayout = "split",
      previewClassName,
      previewAriaLabel = "마크다운 미리보기",
      className,
      ...rest
    },
    ref,
  ) => {
    // Top-level `disabled` is the canonical lock; `textareaProps.disabled`
    // remains an escape hatch that disables only the textarea (legacy).
    const textareaDisabled = disabled || textareaProps?.disabled === true;
    const taRef = useRef<HTMLTextAreaElement | null>(null);
    // Mirror the latest value for the preview pane. Controlled mode reads
    // the `value` prop directly. Uncontrolled mode initializes from
    // `defaultValue` and updates via the textarea's onChange so the preview
    // tracks keystrokes. The state hook is unconditional (rules of hooks);
    // the preview pane itself renders only when `renderPreview` is provided.
    const hasPreview = typeof renderPreview === "function";
    const [uncontrolledValue, setUncontrolledValue] = useState<string>(
      defaultValue ?? "",
    );
    const previewSource = value !== undefined ? value : uncontrolledValue;

    const apply = useCallback(
      (action: MarkdownToolbarAction) => {
        const ta = taRef.current;
        if (!ta) return;
        const { selectionStart: start, selectionEnd: end, value: v } = ta;
        let next = v;
        if (action.wrap) {
          const left = v.slice(0, start);
          const middle = v.slice(start, end);
          const right = v.slice(end);
          next = `${left}${action.wrap}${middle || "텍스트"}${action.wrap}${right}`;
        } else if (action.prefix) {
          // Insert prefix at the start of the current line(s)
          const before = v.slice(0, start);
          const lineStart = before.lastIndexOf("\n") + 1;
          next = `${v.slice(0, lineStart)}${action.prefix}${v.slice(lineStart)}`;
        }
        // Reflect to controlled or uncontrolled. In uncontrolled mode we
        // also bump internal state so the preview pane refreshes.
        if (value === undefined) {
          ta.value = next;
          setUncontrolledValue(next);
        }
        onChange?.(next);
      },
      [onChange, value],
    );

    const textarea = (
      <textarea
        ref={taRef}
        aria-label="마크다운 편집기"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={(e) => {
          const next = e.target.value;
          if (value === undefined) setUncontrolledValue(next);
          onChange?.(next);
        }}
        placeholder={placeholder}
        {...textareaProps}
        // Top-level `disabled` overrides any textareaProps.disabled, so
        // applying it after the spread is intentional precedence.
        disabled={textareaDisabled}
        className={cn(
          markdownEditorTextarea,
          textareaDisabled && markdownEditorTextareaDisabled,
        )}
      />
    );

    return (
      <div ref={ref} className={cn(markdownEditorRoot, className)} {...rest}>
        <div
          role="toolbar"
          aria-label="서식 도구"
          className={markdownEditorToolbar}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              title={action.title}
              aria-label={action.title ?? action.key}
              onClick={() => apply(action)}
              disabled={disabled}
              className={cn(
                markdownEditorToolButton,
                disabled && markdownEditorToolButtonDisabled,
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
        {hasPreview ? (
          <div
            className={cn(
              markdownEditorBody,
              previewLayout === "stacked"
                ? markdownEditorBodyStacked
                : markdownEditorBodySplit,
            )}
          >
            {textarea}
            <div
              role="region"
              aria-label={previewAriaLabel}
              // Per-keystroke updates: the preview *renders* on every change
              // (cheap regex/component output), but `aria-live="polite"` on
              // the region throttles screen-reader announcements at the
              // assistive-tech layer — politely waiting for typing pauses
              // rather than firing once per keypress. This avoids extra
              // debounce machinery while preventing announcement spam.
              aria-live="polite"
              className={cn(
                markdownEditorPreview,
                previewLayout === "stacked"
                  ? markdownEditorPreviewStacked
                  : markdownEditorPreviewSplit,
                previewClassName,
              )}
            >
              {renderPreview(previewSource)}
            </div>
          </div>
        ) : (
          textarea
        )}
      </div>
    );
  },
);

MarkdownEditor.displayName = "MarkdownEditor";
