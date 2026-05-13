import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Input, type InputProps } from "../Input";
import {
  textFieldHelp,
  textFieldHelpError,
  textFieldLabel,
  textFieldWrap,
} from "./TextField.styles";

export interface TextFieldProps extends InputProps {
  /** Visible label rendered above the input. */
  label?: ReactNode;
  /** Helper text under the input. Switches to error tone when `error` is set. */
  helperText?: ReactNode;
  /** When non-empty, applies error styling and replaces helper text. */
  error?: ReactNode;
  /** Wrapper className. */
  wrapperClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, helperText, error, id, wrapperClassName, ...rest }, ref) => {
    const fallbackId = useId();
    const fieldId = id ?? fallbackId;
    const helpId = `${fieldId}-help`;

    return (
      <div className={cn(textFieldWrap, wrapperClassName)}>
        {label && (
          <label htmlFor={fieldId} className={textFieldLabel}>
            {label}
          </label>
        )}
        <Input
          ref={ref}
          id={fieldId}
          variant={error ? "error" : "default"}
          aria-invalid={!!error || undefined}
          aria-describedby={error || helperText ? helpId : undefined}
          {...rest}
        />
        {(error || helperText) && (
          <span
            id={helpId}
            className={error ? textFieldHelpError : textFieldHelp}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";
