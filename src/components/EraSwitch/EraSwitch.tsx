import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import { applyEra } from "@/themes";
import type { EraName } from "@/themes";
import {
  eraSwitchContainer,
  eraSwitchSegmentStyles,
  eraSwitchSizes,
  type EraSwitchSize,
} from "./EraSwitch.styles";

export type { EraSwitchSize } from "./EraSwitch.styles";

export interface EraSwitchProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Currently selected era (controlled). */
  era?: EraName;
  /** Default era when uncontrolled. */
  defaultEra?: EraName;
  /** Fires whenever the user picks an era. */
  onEraChange?: (era: EraName) => void;
  /**
   * When uncontrolled, EraSwitch calls `applyEra(document.documentElement, …)`
   * automatically. Set false if you only want the toggle UI without a side effect.
   */
  applyToDocument?: boolean;
  /** Visual size. */
  size?: EraSwitchSize;
  /** Override the rendered labels (Hangul + Latin). */
  labels?: { heritage?: ReactNode; neon?: ReactNode };
  className?: string;
}

const DEFAULT_LABELS = {
  heritage: (
    <>
      過 <span className="ml-0.5 font-normal">Heritage</span>
    </>
  ),
  neon: (
    <>
      現 <span className="ml-0.5 font-normal">Neon</span>
    </>
  ),
};

const ERAS: readonly EraName[] = ["heritage", "neon"] as const;

export const EraSwitch = forwardRef<HTMLDivElement, EraSwitchProps>(
  (
    {
      era,
      defaultEra = "heritage",
      onEraChange,
      applyToDocument = true,
      size = "md",
      labels,
      className,
      ...rest
    },
    ref,
  ) => {
    const isControlled = era !== undefined;
    const [internalEra, setInternalEra] = useState<EraName>(defaultEra);
    const current = isControlled ? era : internalEra;

    // When uncontrolled, sync the documentElement to keep CSS in sync.
    useEffect(() => {
      if (!isControlled && applyToDocument && typeof document !== "undefined") {
        applyEra(document.documentElement, internalEra);
      }
    }, [isControlled, applyToDocument, internalEra]);

    const handleSelect = (next: EraName) => {
      if (next === current) return;
      if (!isControlled) setInternalEra(next);
      if (applyToDocument && typeof document !== "undefined") {
        applyEra(document.documentElement, next);
      }
      onEraChange?.(next);
    };

    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label="시대 전환 · Era switch"
        className={cn(eraSwitchContainer, eraSwitchSizes[size], className)}
        {...rest}
      >
        {ERAS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={current === name}
            data-era-target={name}
            onClick={() => handleSelect(name)}
            className={eraSwitchSegmentStyles({
              active: current === name,
              size,
            })}
          >
            {resolvedLabels[name]}
          </button>
        ))}
      </div>
    );
  },
);

EraSwitch.displayName = "EraSwitch";
