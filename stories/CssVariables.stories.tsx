import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, type CSSProperties } from "react";
import { heritageEra } from "@/themes/era/heritage";
import { neonEra } from "@/themes/era/neon";

// ---------------------------------------------------------------------------
// Variable categorisation
// ---------------------------------------------------------------------------
//
// We never hardcode the variable list — both era objects are the source of
// truth. We classify each variable name into a *category* (drives filtering)
// and a *kind* (drives swatch rendering).

type Category =
  | "accent"
  | "surface"
  | "ink"
  | "edge"
  | "shadow"
  | "material"
  | "intent"
  | "motion"
  | "typography"
  | "other";

type Kind =
  | "color-rgb-triplet" // "138 80 48" → rgb(138 80 48)
  | "color" // hex/rgba/named colour
  | "shadow"
  | "border-shorthand" // e.g. "1px solid rgba(...)"
  | "background" // url(...)/gradient/pattern
  | "duration"
  | "easing"
  | "font-family"
  | "css-text" // letter-spacing, line-height, text-transform, etc.
  | "unknown";

interface VarRow {
  name: string;
  heritage: string;
  neon: string;
  category: Category;
  kind: Kind;
}

const CATEGORY_LABEL: Record<Category, string> = {
  accent: "Accent",
  surface: "Surface",
  ink: "Ink (text)",
  edge: "Edge",
  shadow: "Shadow",
  material: "Material",
  intent: "Intent",
  motion: "Motion",
  typography: "Typography",
  other: "Other",
};

const CATEGORY_ORDER: Category[] = [
  "accent",
  "surface",
  "ink",
  "edge",
  "shadow",
  "material",
  "intent",
  "motion",
  "typography",
  "other",
];

function categorize(name: string): Category {
  if (name.startsWith("--accent-")) return "accent";
  if (name.startsWith("--era-surface-")) return "surface";
  if (name.startsWith("--era-ink-")) return "ink";
  if (name.startsWith("--era-edge-")) return "edge";
  if (name.startsWith("--era-shadow-")) return "shadow";
  if (name.startsWith("--era-material-")) return "material";
  if (name.startsWith("--era-intent-")) return "intent";
  if (name.startsWith("--era-ease-") || name.startsWith("--era-dur-"))
    return "motion";
  if (
    name.startsWith("--font-") ||
    name.endsWith("-letter-spacing") ||
    name.endsWith("-line-height") ||
    name === "--ui-text-transform"
  )
    return "typography";
  return "other";
}

function classify(name: string, value: string): Kind {
  // RGB triplet (e.g. "138 80 48") used by Tailwind colour utilities.
  if (/^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/.test(value.trim()))
    return "color-rgb-triplet";

  if (name.startsWith("--era-shadow-")) return "shadow";

  if (
    name.startsWith("--era-edge-") &&
    /\bsolid\b|\bdashed\b|\bdotted\b/.test(value)
  )
    return "border-shorthand";

  if (name.startsWith("--era-ease-")) return "easing";
  if (name.startsWith("--era-dur-")) return "duration";

  if (name.startsWith("--font-")) return "font-family";

  if (name.startsWith("--era-material-")) return "background";
  if (/^var\(/.test(value.trim()) || /\burl\(|gradient\(/.test(value))
    return "background";

  if (
    name === "--ui-text-transform" ||
    name.endsWith("-letter-spacing") ||
    name.endsWith("-line-height")
  )
    return "css-text";

  if (
    /^#[0-9a-f]{3,8}$/i.test(value.trim()) ||
    /^rgba?\(/i.test(value.trim()) ||
    /^hsla?\(/i.test(value.trim())
  )
    return "color";

  return "unknown";
}

function buildRows(): VarRow[] {
  const heritageVars = heritageEra.variables;
  const neonVars = neonEra.variables;
  const allNames = Array.from(
    new Set([...Object.keys(heritageVars), ...Object.keys(neonVars)]),
  );

  const rows: VarRow[] = allNames.map((name) => {
    const heritage = heritageVars[name] ?? "";
    const neon = neonVars[name] ?? "";
    const refValue = heritage || neon;
    return {
      name,
      heritage,
      neon,
      category: categorize(name),
      kind: classify(name, refValue),
    };
  });

  // Sort by category order, then by variable name.
  rows.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name);
  });

  return rows;
}

// ---------------------------------------------------------------------------
// Swatch — visual preview of the *currently active* era's value.
// We always render `var(<name>)` so when applyEra() flips the document
// attribute the swatch updates without React re-rendering.
// ---------------------------------------------------------------------------

interface SwatchProps {
  row: VarRow;
}

function Swatch({ row }: SwatchProps) {
  const ref = `var(${row.name})`;

  switch (row.kind) {
    case "color-rgb-triplet": {
      const style: CSSProperties = { background: `rgb(${ref})` };
      return (
        <span
          role="img"
          aria-label={`Colour swatch for ${row.name}`}
          style={style}
          className="inline-block h-8 w-16 rounded border border-era"
        />
      );
    }
    case "color": {
      const style: CSSProperties = { background: ref };
      return (
        <span
          role="img"
          aria-label={`Colour swatch for ${row.name}`}
          style={style}
          className="inline-block h-8 w-16 rounded border border-era"
        />
      );
    }
    case "shadow": {
      const style: CSSProperties = { boxShadow: ref };
      return (
        <span
          role="img"
          aria-label={`Shadow preview for ${row.name}`}
          style={style}
          className="inline-block h-10 w-20 rounded bg-era-raised"
        />
      );
    }
    case "border-shorthand": {
      const style: CSSProperties = { border: ref };
      return (
        <span
          role="img"
          aria-label={`Border preview for ${row.name}`}
          style={style}
          className="inline-block h-8 w-16 rounded bg-era-base"
        />
      );
    }
    case "background": {
      const style: CSSProperties = { backgroundImage: ref };
      return (
        <span
          role="img"
          aria-label={`Pattern preview for ${row.name}`}
          style={style}
          className="inline-block h-10 w-20 rounded border border-era bg-era-base bg-cover bg-center"
        />
      );
    }
    case "duration": {
      const style: CSSProperties = {
        animationDuration: ref,
        animationName: "css-vars-pulse",
        animationIterationCount: "infinite",
        animationTimingFunction: "linear",
      };
      return (
        <span
          role="img"
          aria-label={`Duration preview for ${row.name}`}
          className="inline-flex h-4 w-24 items-center overflow-hidden rounded bg-era-raised"
        >
          <style>{`@keyframes css-vars-pulse { 0% { transform: translateX(-100%);} 50% { transform: translateX(0%);} 100% { transform: translateX(100%);} }`}</style>
          <span
            className="block h-full w-1/3 rounded bg-[rgb(var(--accent-500))]"
            style={style}
          />
        </span>
      );
    }
    case "easing": {
      const style: CSSProperties = {
        animationTimingFunction: ref,
        animationDuration: "1.4s",
        animationName: "css-vars-ease",
        animationIterationCount: "infinite",
      };
      return (
        <span
          role="img"
          aria-label={`Easing preview for ${row.name}`}
          className="inline-flex h-4 w-24 items-center overflow-hidden rounded bg-era-raised"
        >
          <style>{`@keyframes css-vars-ease { 0% { transform: translateX(0%);} 50% { transform: translateX(150%);} 100% { transform: translateX(0%);} }`}</style>
          <span
            className="block h-full w-1/4 rounded bg-[rgb(var(--accent-500))]"
            style={style}
          />
        </span>
      );
    }
    case "font-family": {
      const style: CSSProperties = { fontFamily: ref };
      return (
        <span
          role="img"
          aria-label={`Font preview for ${row.name}`}
          style={style}
          className="inline-block min-w-16 px-2 text-base text-era-primary"
        >
          가나 Aa
        </span>
      );
    }
    case "css-text": {
      // Show the literal value (letter-spacing / line-height / text-transform).
      return (
        <span className="inline-block font-mono text-xs text-era-muted">
          {row.heritage} → {row.neon}
        </span>
      );
    }
    default:
      return (
        <span className="inline-block font-mono text-xs text-era-muted">
          {row.heritage}
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// Table component
// ---------------------------------------------------------------------------

type CategoryFilter = Category | "all";

interface TableProps {
  filter?: CategoryFilter;
}

function CssVariablesTable({ filter = "all" }: TableProps) {
  const rows = useMemo(() => buildRows(), []);
  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.category === filter)),
    [rows, filter],
  );

  // Group by category for clearer presentation.
  const grouped = useMemo(() => {
    const map = new Map<Category, VarRow[]>();
    for (const r of filtered) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map(
      (c) => [c, map.get(c)!] as const,
    );
  }, [filtered]);

  if (filtered.length === 0) {
    return (
      <p className="p-6 text-era-muted">
        No CSS variables match the current filter.
      </p>
    );
  }

  return (
    <div className="rounded-card border border-era bg-era-base p-4 text-era-primary">
      <p className="mb-4 text-sm text-era-muted">
        {filtered.length} variable{filtered.length === 1 ? "" : "s"} • Toggle
        the Storybook era toolbar to compare swatches live.
      </p>
      {grouped.map(([category, list]) => (
        <section key={category} className="mb-6 last:mb-0">
          <h3 className="mb-2 text-base font-semibold text-era-primary">
            {CATEGORY_LABEL[category]}{" "}
            <span className="text-era-muted">({list.length})</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-era text-left text-xs uppercase tracking-wide text-era-muted">
                  <th className="px-3 py-2 font-semibold">Variable</th>
                  <th className="px-3 py-2 font-semibold">Heritage value</th>
                  <th className="px-3 py-2 font-semibold">Neon value</th>
                  <th className="px-3 py-2 font-semibold">
                    Swatch (current era)
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-era/50 last:border-b-0"
                  >
                    <td className="px-3 py-2 align-top font-mono text-xs text-era-primary">
                      {row.name}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-era-muted">
                      {row.heritage || (
                        <span className="italic">— not set —</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs text-era-muted">
                      {row.neon || <span className="italic">— not set —</span>}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <Swatch row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof CssVariablesTable> = {
  title: "Foundations/CSS Variables",
  component: CssVariablesTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Catalogue of every era CSS custom property exposed by `applyEra()`. " +
          "Heritage and Neon values are read directly from the era theme objects " +
          "(`heritageEra.variables`, `neonEra.variables`) so the table stays in " +
          "sync as new variables are added. The Swatch column reads `var(--…)` " +
          "at runtime, so flipping the era toolbar updates every swatch without a " +
          "React re-render.",
      },
    },
  },
  argTypes: {
    filter: {
      control: "select",
      options: ["all", ...CATEGORY_ORDER] as const,
      description: "Narrow the table to a single category.",
    },
  },
  args: {
    filter: "all",
  },
};

export default meta;
type Story = StoryObj<typeof CssVariablesTable>;

export const Default: Story = {};

export const SurfacesOnly: Story = {
  args: { filter: "surface" },
};

export const Typography: Story = {
  args: { filter: "typography" },
};

export const Shadows: Story = {
  args: { filter: "shadow" },
};

export const Motion: Story = {
  args: { filter: "motion" },
};
