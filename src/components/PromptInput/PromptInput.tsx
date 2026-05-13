import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "../Spinner";
import {
  promptInputCounter,
  promptInputCounterExceeded,
  promptInputFooter,
  promptInputHelp,
  promptInputHelpError,
  promptInputLabel,
  promptInputLoadingOverlay,
  promptInputSendStyles,
  promptInputShell,
  promptInputShellError,
  promptInputTextarea,
  promptInputWrap,
} from "./PromptInput.styles";

export interface PromptInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "onSubmit"
> {
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires when Enter (no Shift) is pressed or send is clicked. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Visible label rendered above the textarea, linked via `htmlFor`. */
  label?: ReactNode;
  /** Helper text under the textarea. Replaced by `error` when set. */
  helperText?: ReactNode;
  /** When non-empty, applies error styling and replaces helper text. */
  error?: ReactNode;
  /** Hard character limit; renders a live counter and forwards the native cap. */
  maxLength?: number;
  /** When true, renders a spinner overlay and makes the input inert. */
  loading?: boolean;
  /** Localized SR label for the loading state. */
  loadingLabel?: string;
  /** Explicit id for the textarea; auto-generated when omitted. */
  id?: string;
  /** Custom send icon. Defaults to ➤. */
  sendIcon?: ReactNode;
  sendLabel?: string;
  /** Pass-through for the textarea. Internal props win on conflicts. */
  textareaProps?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    | "value"
    | "defaultValue"
    | "onChange"
    | "placeholder"
    | "className"
    | "id"
    | "maxLength"
  >;
  /** Wrapper className (outer column). */
  wrapperClassName?: string;
  /** Shell className (the bordered surface around the textarea + send). */
  className?: string;
}

export const PromptInput = forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onSubmit,
      placeholder = "다음 수를 묻거나 전략을 입력하세요…",
      disabled,
      label,
      helperText,
      error,
      maxLength,
      loading = false,
      loadingLabel = "로딩 중",
      id,
      sendIcon = "➤",
      sendLabel = "전송",
      textareaProps,
      wrapperClassName,
      className,
      ...rest
    },
    ref,
  ) => {
    const taRef = useRef<HTMLTextAreaElement | null>(null);
    const fallbackId = useId();
    const fieldId = id ?? fallbackId;
    const helpId = `${fieldId}-help`;
    const counterId = `${fieldId}-counter`;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      defaultValue ?? "",
    );
    const currentValue = isControlled ? (value ?? "") : internalValue;
    const currentLength = currentValue.length;
    const hasMax = typeof maxLength === "number";
    const exceeded = hasMax && currentLength > (maxLength as number);

    const inert = disabled || loading;

    const resize = useCallback(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 192)}px`;
    }, []);

    useEffect(() => {
      resize();
    }, [resize, currentValue]);

    const submit = () => {
      const v = taRef.current?.value ?? "";
      const trimmed = v.trim();
      if (!trimmed) return;
      onSubmit?.(trimmed);
    };

    const describedByParts: string[] = [];
    if (error || helperText) describedByParts.push(helpId);
    if (hasMax) describedByParts.push(counterId);
    const externalDescribedBy = textareaProps?.["aria-describedby"];
    if (typeof externalDescribedBy === "string" && externalDescribedBy) {
      describedByParts.push(externalDescribedBy);
    }
    const describedBy = describedByParts.length
      ? describedByParts.join(" ")
      : undefined;

    const showFooter = !!error || !!helperText || hasMax;

    return (
      <div className={cn(promptInputWrap, wrapperClassName)}>
        {label && (
          <label htmlFor={fieldId} className={promptInputLabel}>
            {label}
          </label>
        )}
        <div
          ref={ref}
          className={cn(
            promptInputShell,
            "w-full",
            error && promptInputShellError,
            className,
          )}
          {...rest}
        >
          <textarea
            {...textareaProps}
            ref={taRef}
            id={fieldId}
            rows={1}
            value={isControlled ? value : undefined}
            defaultValue={!isControlled ? defaultValue : undefined}
            placeholder={placeholder}
            disabled={inert}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            maxLength={maxLength}
            onChange={(e) => {
              if (!isControlled) setInternalValue(e.target.value);
              onChange?.(e.target.value);
              resize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            className={promptInputTextarea}
          />
          <button
            type="button"
            aria-label={sendLabel}
            disabled={inert}
            onClick={submit}
            className={promptInputSendStyles}
          >
            {sendIcon}
          </button>
          {loading && (
            <span className={promptInputLoadingOverlay}>
              <Spinner size="sm" label={loadingLabel} />
            </span>
          )}
        </div>
        {showFooter && (
          <div className={promptInputFooter}>
            {(error || helperText) && (
              <span
                id={helpId}
                className={error ? promptInputHelpError : promptInputHelp}
              >
                {error || helperText}
              </span>
            )}
            {hasMax && (
              <span
                id={counterId}
                aria-live="polite"
                className={
                  exceeded ? promptInputCounterExceeded : promptInputCounter
                }
              >
                {currentLength} / {maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

PromptInput.displayName = "PromptInput";
