import {
  Fragment,
  forwardRef,
  useId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  stepperCircleStyles,
  stepperDescription,
  stepperLabel,
  stepperLine,
  stepperLineCompleted,
  stepperLineDone,
  stepperRoot,
  stepperStep,
  type StepResolvedState,
} from "./Stepper.styles";

export type StepState = "default" | "error" | "completed";

export interface StepItem {
  label: ReactNode;
  description?: ReactNode;
  state?: StepState;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  steps: ReadonlyArray<StepItem>;
  /** Index of the current (in-progress) step (0-based). */
  current: number;
  className?: string;
}

function resolveState(
  stepState: StepState | undefined,
  idx: number,
  current: number,
): StepResolvedState {
  if (stepState === "error") return "error";
  if (stepState === "completed") return "completed";
  if (idx < current) return "done";
  if (idx === current) return "current";
  return "todo";
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  ({ steps, current, className, ...rest }, ref) => {
    const idBase = useId();
    return (
      <ol
        ref={ref}
        aria-label="진행 단계"
        className={cn(stepperRoot, className)}
        {...rest}
      >
        {steps.map((step, idx) => {
          const resolved = resolveState(step.state, idx, current);
          const isLast = idx === steps.length - 1;
          const isCurrent = idx === current;
          const isError = resolved === "error";
          const isCompleted = resolved === "completed";
          const descriptionId = step.description
            ? `${idBase}-desc-${idx}`
            : undefined;
          const lineDone =
            idx < current ||
            steps[idx]?.state === "completed" ||
            steps[idx]?.state === "error";
          const lineCompleted = steps[idx]?.state === "completed";

          let circleGlyph: ReactNode = idx + 1;
          if (resolved === "done" || resolved === "completed")
            circleGlyph = "✓";
          else if (resolved === "error") circleGlyph = "✕";

          return (
            <Fragment key={idx}>
              <li
                className={stepperStep}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={stepperCircleStyles({ state: resolved })}
                  aria-invalid={isError ? true : undefined}
                  aria-describedby={
                    isCurrent && descriptionId ? descriptionId : undefined
                  }
                >
                  {circleGlyph}
                  {isError && <span className="sr-only">validation error</span>}
                  {isCompleted && <span className="sr-only">completed</span>}
                </span>
                <span className={stepperLabel}>{step.label}</span>
                {step.description && (
                  <span id={descriptionId} className={stepperDescription}>
                    {step.description}
                  </span>
                )}
              </li>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    stepperLine,
                    lineDone && stepperLineDone,
                    lineCompleted && stepperLineCompleted,
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    );
  },
);

Stepper.displayName = "Stepper";
