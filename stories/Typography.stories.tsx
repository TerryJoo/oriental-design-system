import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties, ReactNode } from "react";
import { typography } from "@/tokens/typography";
import { textStyles } from "@/tokens/textStyles";
import { bothEras } from "./_shared/argTypes";

// ---------------------------------------------------------------------------
// Token introspection helpers — typography.ts is the source of truth.
// ---------------------------------------------------------------------------

type FontSizeMap = typeof typography.fontSize;
type FontSizeKey = keyof FontSizeMap;

interface SizeRow {
  name: FontSizeKey;
  size: string;
  lineHeight: string;
}

function fontSizeRows(): SizeRow[] {
  return (Object.keys(typography.fontSize) as FontSizeKey[]).map((name) => {
    const entry = typography.fontSize[name] as readonly [
      string,
      { lineHeight: string },
    ];
    return { name, size: entry[0], lineHeight: entry[1].lineHeight };
  });
}

interface FamilyRow {
  name: string;
  stack: string;
  /** Specimen text shown in this stack. */
  sample: string;
}

function familyRows(): FamilyRow[] {
  const rows: FamilyRow[] = [
    {
      name: "fontFamily.sans",
      stack: typography.fontFamily.sans.join(", "),
      sample: "Pretendard 한글 12345 — body UI default",
    },
    {
      name: "fontFamily.serif",
      stack: typography.fontFamily.serif.join(", "),
      sample: "Noto Serif KR 한글 12345 — body classic",
    },
    {
      name: "fontFamily.mono",
      stack: typography.fontFamily.mono.join(", "),
      sample: "JetBrains Mono → const x = 42;",
    },
    {
      name: "heritageDisplay",
      stack: typography.fontFamilies.heritageDisplay.join(", "),
      sample: "한지 위에 먹빛 — Heritage display",
    },
    {
      name: "heritageBody",
      stack: typography.fontFamilies.heritageBody.join(", "),
      sample: "한지 위에 먹빛 — Heritage body",
    },
    {
      name: "heritageLatin",
      stack: typography.fontFamilies.heritageLatin.join(", "),
      sample: "Cormorant Garamond — Heritage Latin",
    },
    {
      name: "neonDisplay",
      stack: typography.fontFamilies.neonDisplay.join(", "),
      sample: "ORBITRON — NEON DISPLAY 12345",
    },
    {
      name: "neonBody",
      stack: typography.fontFamilies.neonBody.join(", "),
      sample: "IBM Plex Sans KR — Neon body",
    },
  ];
  return rows;
}

// ---------------------------------------------------------------------------
// Specimen primitives
// ---------------------------------------------------------------------------

function Specimen({
  size,
  lineHeight,
  fontFamily,
  weight,
  letterSpacing,
  children,
}: {
  size: string;
  lineHeight: string;
  fontFamily?: string;
  weight?: string | number;
  letterSpacing?: string;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    fontSize: size,
    lineHeight,
    fontFamily,
    fontWeight: weight,
    letterSpacing,
  };
  return (
    <span className="text-era-primary" style={style}>
      {children}
    </span>
  );
}

function Row({
  label,
  meta,
  children,
}: {
  label: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-era/40 py-3 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wide text-era-muted">
          {label}
        </span>
        <span className="font-mono text-[10px] text-era-muted">{meta}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

const SAMPLE = "오방색 디자인 시스템 — Oriental Design System";

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Typography tokens. All sizes, families, weights and presets come " +
          "from `src/tokens/typography.ts` and `src/tokens/textStyles.ts`. " +
          "Era-aware utilities (`font-era-display`, `font-era-body`, " +
          "`tracking-era-display`) read CSS variables, so flipping the era " +
          "toolbar swaps the active stack live.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <div className="flex flex-col gap-6 text-era-primary">
      {/* All sizes */}
      <section className="rounded-card border border-era bg-era-base p-6">
        <h3 className="mb-1 text-base font-semibold">All font sizes</h3>
        <p className="mb-5 text-xs text-era-muted">
          Iterating <span className="font-mono">typography.fontSize</span>.
        </p>
        <div className="flex flex-col">
          {fontSizeRows().map((row) => (
            <Row
              key={row.name}
              label={String(row.name)}
              meta={`${row.size} · lh ${row.lineHeight}`}
            >
              <Specimen size={row.size} lineHeight={row.lineHeight}>
                {SAMPLE}
              </Specimen>
            </Row>
          ))}
        </div>
      </section>

      {/* Weights */}
      <section className="rounded-card border border-era bg-era-base p-6">
        <h3 className="mb-1 text-base font-semibold">Font weights</h3>
        <p className="mb-5 text-xs text-era-muted">
          Iterating <span className="font-mono">typography.fontWeight</span>.
        </p>
        <div className="flex flex-col">
          {Object.entries(typography.fontWeight).map(([name, weight]) => (
            <Row key={name} label={name} meta={String(weight)}>
              <Specimen size="1.125rem" lineHeight="1.6" weight={weight}>
                {SAMPLE}
              </Specimen>
            </Row>
          ))}
        </div>
      </section>
    </div>
  ),
};

export const Display: Story = {
  render: () => (
    <div className="rounded-card border border-era bg-era-base p-6 text-era-primary">
      <h3 className="mb-1 text-base font-semibold">Display & Heading</h3>
      <p className="mb-5 text-xs text-era-muted">
        Sourced from <span className="font-mono">textStyles.display</span>,{" "}
        <span className="font-mono">textStyles.heading</span>.
      </p>
      <div className="flex flex-col">
        {Object.entries(textStyles.display).map(([k, p]) => (
          <Row
            key={`display-${k}`}
            label={`display.${k}`}
            meta={`${p.fontSize} · lh ${p.lineHeight} · ls ${p.letterSpacing}`}
          >
            <Specimen
              size={p.fontSize}
              lineHeight={p.lineHeight}
              letterSpacing={p.letterSpacing}
              weight={600}
              fontFamily="var(--font-display)"
            >
              {SAMPLE}
            </Specimen>
          </Row>
        ))}
        {Object.entries(textStyles.heading).map(([k, p]) => (
          <Row
            key={`heading-${k}`}
            label={`heading.${k}`}
            meta={`${p.fontSize} · lh ${p.lineHeight} · ls ${p.letterSpacing}`}
          >
            <Specimen
              size={p.fontSize}
              lineHeight={p.lineHeight}
              letterSpacing={p.letterSpacing}
              weight={600}
              fontFamily="var(--font-display)"
            >
              {SAMPLE}
            </Specimen>
          </Row>
        ))}
      </div>
    </div>
  ),
};

export const Text: Story = {
  render: () => {
    const presets: ReadonlyArray<
      readonly [string, (typeof textStyles)["body1"]]
    > = [
      ["body1", textStyles.body1],
      ["body2", textStyles.body2],
      ["body3", textStyles.body3],
      ["label", textStyles.label],
      ["caption", textStyles.caption],
      ["overline", textStyles.overline],
    ] as const;
    return (
      <div className="rounded-card border border-era bg-era-base p-6 text-era-primary">
        <h3 className="mb-1 text-base font-semibold">Body / caption presets</h3>
        <p className="mb-5 text-xs text-era-muted">
          Iterating presets from <span className="font-mono">textStyles</span>.
        </p>
        <div className="flex flex-col">
          {presets.map(([name, p]) => (
            <Row
              key={name}
              label={name}
              meta={`${p.fontSize} · lh ${p.lineHeight} · ls ${p.letterSpacing}`}
            >
              <Specimen
                size={p.fontSize}
                lineHeight={p.lineHeight}
                letterSpacing={p.letterSpacing}
                fontFamily="var(--font-body)"
              >
                {SAMPLE}
              </Specimen>
            </Row>
          ))}
        </div>
      </div>
    );
  },
};

export const Tokens: Story = {
  render: () => (
    <div className="rounded-card border border-era bg-era-base p-6 text-era-primary">
      <h3 className="mb-1 text-base font-semibold">Font family stacks</h3>
      <p className="mb-5 text-xs text-era-muted">
        Iterating <span className="font-mono">typography.fontFamily</span> and{" "}
        <span className="font-mono">typography.fontFamilies</span>.
      </p>
      <div className="flex flex-col">
        {familyRows().map((row) => (
          <Row key={row.name} label={row.name} meta={row.stack}>
            <span
              className="block text-era-primary"
              style={{ fontFamily: row.stack, fontSize: "1.25rem" }}
            >
              {row.sample}
            </span>
          </Row>
        ))}
      </div>
    </div>
  ),
};

/**
 * Heritage / Neon side-by-side. The two panels use [data-era] so the
 * `--font-display` / `--font-body` CSS variables resolve to the era-specific
 * stack — the same display/heading specimens render in two distinct type
 * personalities without a React re-render.
 */
export const EraCompare: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "The same display, heading, and body specimens rendered in Heritage and Neon so the era-specific font stacks (`var(--font-display)` and `var(--font-body)`) can be compared directly. No `forceEra` outside this dedicated comparison story.",
      },
    },
  },
  render: () =>
    bothEras(() => (
      <div className="flex flex-col gap-3">
        <Row
          label="display.lg"
          meta={`${textStyles.display.lg.fontSize} · era display stack`}
        >
          <Specimen
            size={textStyles.display.lg.fontSize}
            lineHeight={textStyles.display.lg.lineHeight}
            letterSpacing={textStyles.display.lg.letterSpacing}
            weight={600}
            fontFamily="var(--font-display)"
          >
            오방색
          </Specimen>
        </Row>
        <Row
          label="heading.h2"
          meta={`${textStyles.heading.h2.fontSize} · era display stack`}
        >
          <Specimen
            size={textStyles.heading.h2.fontSize}
            lineHeight={textStyles.heading.h2.lineHeight}
            letterSpacing={textStyles.heading.h2.letterSpacing}
            weight={600}
            fontFamily="var(--font-display)"
          >
            Oriental Design System
          </Specimen>
        </Row>
        <Row
          label="body1"
          meta={`${textStyles.body1.fontSize} · era body stack`}
        >
          <Specimen
            size={textStyles.body1.fontSize}
            lineHeight={textStyles.body1.lineHeight}
            letterSpacing={textStyles.body1.letterSpacing}
            fontFamily="var(--font-body)"
          >
            {SAMPLE}
          </Specimen>
        </Row>
      </div>
    )),
};
