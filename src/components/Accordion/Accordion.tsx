import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";
import {
  accordionBody,
  accordionBodyClosed,
  accordionBodyOpen,
  accordionChevron,
  accordionChevronOpen,
  accordionHeader,
  accordionItem,
  accordionRoot,
} from "./Accordion.styles";

export interface AccordionItemData {
  /** Unique value. */
  value: string;
  title: ReactNode;
  content: ReactNode;
  /** Open by default. */
  defaultOpen?: boolean;
  disabled?: boolean;
}

export interface AccordionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  items: ReadonlyArray<AccordionItemData>;
  /** Allow multiple panels open at once. Defaults true. */
  multiple?: boolean;
  /** Controlled open values. */
  value?: ReadonlyArray<string>;
  onChange?: (value: ReadonlyArray<string>) => void;
  className?: string;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, multiple = true, value, onChange, className, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const [internalOpen, setInternalOpen] = useState<ReadonlyArray<string>>(
      items.filter((it) => it.defaultOpen).map((it) => it.value),
    );
    const open = isControlled ? value : internalOpen;
    const baseId = useId();
    const triggerId = (v: string) => `${baseId}-trigger-${v}`;
    const panelId = (v: string) => `${baseId}-panel-${v}`;

    const toggle = (v: string) => {
      const next = open.includes(v)
        ? open.filter((x) => x !== v)
        : multiple
          ? [...open, v]
          : [v];
      if (!isControlled) setInternalOpen(next);
      onChange?.(next);
    };

    return (
      <div ref={ref} className={cn(accordionRoot, className)} {...rest}>
        {items.map((item) => {
          const isOpen = open.includes(item.value);
          const tId = triggerId(item.value);
          const pId = panelId(item.value);
          return (
            <div key={item.value} className={accordionItem}>
              <button
                type="button"
                id={tId}
                aria-expanded={isOpen}
                aria-controls={pId}
                disabled={item.disabled}
                onClick={() => toggle(item.value)}
                className={accordionHeader}
              >
                <span>{item.title}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    accordionChevron,
                    isOpen && accordionChevronOpen,
                  )}
                >
                  ▶
                </span>
              </button>
              <div
                id={pId}
                role="region"
                aria-labelledby={tId}
                hidden={!isOpen}
                className={cn(
                  accordionBody,
                  isOpen ? accordionBodyOpen : accordionBodyClosed,
                )}
              >
                {item.content}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = "Accordion";
