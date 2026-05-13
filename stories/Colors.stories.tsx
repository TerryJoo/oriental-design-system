import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { colors } from "@/tokens/colors";

// ---------------------------------------------------------------------------
// Palette extraction — colors.ts is the source of truth.
//
// We never hardcode the palette key list: instead we look at the shape of each
// top-level entry. Anything that is `Record<scaleStep, string>` (e.g. `primary`,
// `gold`, `coral`) is treated as a tonal palette; everything else is rendered
// in the "extras" section.
// ---------------------------------------------------------------------------

type Scale = Record<string, string>;

interface PaletteRow {
  name: string;
  scale: Scale;
}

function isScale(value: unknown): value is Scale {
  if (!value || typeof value !== "object") return false;
  const keys = Object.keys(value as object);
  // A tonal scale must contain at least one numeric key (50, 100, ...).
  return keys.some((k) => /^\d{2,3}$/.test(k));
}

function extractPalettes(): Record<string, PaletteRow> {
  const out: Record<string, PaletteRow> = {};
  for (const [name, value] of Object.entries(colors)) {
    if (isScale(value)) out[name] = { name, scale: value as Scale };
  }
  return out;
}

const PALETTES = extractPalettes();

// 오방색 (obangsaek) — five cardinal colors of Korean tradition.
// Each entry maps to whichever palette in colors.ts represents that direction.
const OBANGSAEK: ReadonlyArray<{
  cardinal: string;
  korean: string;
  paletteKey: string;
  meaning: string;
}> = [
  {
    cardinal: "East",
    korean: "청 (靑)",
    paletteKey: "indigo",
    meaning: "wood · spring",
  },
  {
    cardinal: "South",
    korean: "적 (赤)",
    paletteKey: "coral",
    meaning: "fire · summer",
  },
  {
    cardinal: "West",
    korean: "백 (白)",
    paletteKey: "gray",
    meaning: "metal · autumn",
  },
  {
    cardinal: "North",
    korean: "흑 (黑)",
    paletteKey: "primary",
    meaning: "water · winter (terracotta · earth-fired)",
  },
  {
    cardinal: "Center",
    korean: "황 (黃)",
    paletteKey: "gold",
    meaning: "earth · sun",
  },
];

// Group palettes for the Default story.
const PALETTE_GROUPS: ReadonlyArray<{ title: string; keys: string[] }> = [
  {
    title: "Primary & Accent",
    keys: ["primary", "secondary"],
  },
  {
    title: "Oriental Palette (오방색 + 보조)",
    keys: ["indigo", "gold", "jade", "coral"],
  },
  {
    title: "Boardgame (Wave 2 — SealStamp ink)",
    keys: ["oxblood", "cyan-seal"],
  },
  {
    title: "Neutral",
    keys: ["gray"],
  },
  {
    title: "Semantic",
    keys: ["success", "warning", "error", "info"],
  },
];

// ---------------------------------------------------------------------------
// Swatch primitives
// ---------------------------------------------------------------------------

function Swatch({
  hex,
  step,
  label,
}: {
  hex: string;
  step: string;
  label: string;
}) {
  // CSS-var-driven swatches (`accent`) come through as `rgb(var(...) / ...)`
  // strings; static palettes are plain hex. Both work as `background`.
  const isVarRef = typeof hex === "string" && hex.startsWith("rgb(var(");
  const style: CSSProperties = { background: hex };
  return (
    <div
      className="flex flex-col items-stretch gap-1"
      title={`${label}-${step}: ${isVarRef ? hex : hex}`}
    >
      <span
        role="img"
        aria-label={`${label}-${step}`}
        className="block h-12 w-full rounded border border-era-soft"
        style={style}
      />
      <span className="font-mono text-[10px] uppercase tracking-wide text-era-muted">
        {step}
      </span>
      <span className="font-mono text-[10px] text-era-muted">
        {isVarRef ? "var(...)" : hex.toUpperCase()}
      </span>
    </div>
  );
}

function PaletteRowDisplay({ name, scale }: PaletteRow) {
  // Tonal scales are sorted numerically; non-numeric keys (like "default") go
  // last so the row reads 50 → 950.
  const entries = Object.entries(scale).sort((a, b) => {
    const an = Number(a[0]);
    const bn = Number(b[0]);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    if (Number.isFinite(an)) return -1;
    if (Number.isFinite(bn)) return 1;
    return a[0].localeCompare(b[0]);
  });
  return (
    <section className="mb-6 last:mb-0">
      <h4 className="mb-2 text-sm font-semibold text-era-primary">
        <span className="font-mono">{name}</span>
        <span className="ml-2 text-era-muted">({entries.length} steps)</span>
      </h4>
      <div className="grid grid-cols-11 gap-1.5">
        {entries.map(([step, hex]) => (
          <Swatch key={step} hex={hex} step={step} label={name} />
        ))}
      </div>
    </section>
  );
}

function PaletteGroup({
  title,
  keys,
}: {
  title: string;
  keys: ReadonlyArray<string>;
}) {
  const rows = keys
    .map((k) => PALETTES[k])
    .filter((p): p is PaletteRow => Boolean(p));
  if (rows.length === 0) return null;
  return (
    <div className="rounded-card border border-era bg-era-base p-4">
      <h3 className="mb-3 text-base font-semibold text-era-primary">{title}</h3>
      {rows.map((row) => (
        <PaletteRowDisplay key={row.name} {...row} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Colors",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Color palettes from `src/tokens/colors.ts`. The list is generated by " +
          "introspecting the tokens object — never hardcoded — so adding a new " +
          "palette automatically shows up here. The `accent` palette uses CSS " +
          "variables and reacts live when the era toolbar flips between Heritage " +
          "and Neon.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-6 text-era-primary">
      {PALETTE_GROUPS.map((g) => (
        <PaletteGroup key={g.title} {...g} />
      ))}
      {/* Accent (era-aware, CSS-variable driven) */}
      <div className="rounded-card border border-era bg-era-base p-4">
        <h3 className="mb-3 text-base font-semibold text-era-primary">
          Accent (era-aware via{" "}
          <span className="font-mono text-xs">--accent-*</span>)
        </h3>
        <p className="mb-3 text-xs text-era-muted">
          Defined as <span className="font-mono">rgb(var(--accent-XXX))</span>{" "}
          in <span className="font-mono">colors.ts</span>. Toggle the era
          toolbar to swap palettes live.
        </p>
        <PaletteRowDisplay name="accent" scale={colors.accent} />
      </div>
    </div>
  ),
};

export const Obangsaek: Story = {
  render: () => (
    <div className="rounded-card border border-era bg-era-base p-6 text-era-primary">
      <h3 className="mb-1 text-lg font-semibold">오방색 — Obangsaek</h3>
      <p className="mb-5 text-sm text-era-muted">
        Five cardinal colors of Korean tradition, each anchored to a tonal
        palette in our token set. Each row shows the palette&apos;s 600 anchor
        plus the full 50 → 950 ramp.
      </p>
      <div className="flex flex-col gap-5">
        {OBANGSAEK.map(({ cardinal, korean, paletteKey, meaning }) => {
          const palette = PALETTES[paletteKey];
          if (!palette) return null;
          const anchor = palette.scale["600"] ?? palette.scale["500"];
          return (
            <div
              key={paletteKey}
              className="rounded-md border border-era-soft bg-era-raised p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="block h-10 w-10 rounded-full border border-era-soft"
                  style={{ background: anchor }}
                />
                <div>
                  <div className="text-sm font-semibold text-era-primary">
                    {korean} · {cardinal}
                  </div>
                  <div className="text-xs text-era-muted">
                    palette: <span className="font-mono">{paletteKey}</span> ·{" "}
                    {meaning}
                  </div>
                </div>
              </div>
              <PaletteRowDisplay name={paletteKey} scale={palette.scale} />
            </div>
          );
        })}
      </div>
    </div>
  ),
};

export const Semantic: Story = {
  render: () => (
    <PaletteGroup
      title="Semantic — success / warning / error / info"
      keys={["success", "warning", "error", "info"]}
    />
  ),
};
