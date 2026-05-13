import { forwardRef, type InputHTMLAttributes } from "react";
import { inputStyles, type InputSize, type InputVariant } from "./Input.styles";

export type { InputSize, InputVariant } from "./Input.styles";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /** Visual size. */
  inputSize?: InputSize;
  /** Visual variant; `error` paints the border in the era-aware error color. */
  variant?: InputVariant;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      inputSize = "md",
      variant = "default",
      className,
      type = "text",
      ...rest
    },
    ref,
  ) => (
    <input
      ref={ref}
      type={type}
      className={inputStyles({ size: inputSize, variant, className })}
      {...rest}
    />
  ),
);

Input.displayName = "Input";
