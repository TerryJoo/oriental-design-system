import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { shadows } from "@/tokens/shadows";
import { heritageEra } from "@/themes/era/heritage";
import { neonEra } from "@/themes/era/neon";

// ---------------------------------------------------------------------------
// Token grouping. We never hardcode the shadow list — `shadows` from
// tokens.ts is the source for the shared/static tier, and the era theme
// objects supply the era-specific values.
// ---------------------------------------------------------------------------

interface ShadowEntry {
  name: string;
  value: string;
}

function staticShadows(): ShadowEntry[] {
  // Filter out era pointers (`var(--era-shadow-*)`) — those belong in the
  // Heritage / Neon tabs where we render their resolved values directly.
  return Object.entries(shadows)
    .filter(([, v]) => !v.startsWith("var(--era-"))
    .map(([name, value]) => ({ name, value }));
}

function eraShadows(era: typeof heritageEra): ShadowEntry[] {
  return Object.entries(era.variables)
    .filter(([k]) => k.startsWith("--era-shadow-"))
    .map(([name, value]) => ({ name, value }));
}

// ---------------------------------------------------------------------------
// Swatch — 96×96 raised card so the shadow has somewhere to fall.
// ---------------------------------------------------------------------------

function ShadowSwatch({ name, value }: ShadowEntry) {
  const style: CSSProperties = { boxShadow: value };
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="img"
        aria-label={`Shadow preview for ${name}`}
        className="h-24 w-24 rounded-md bg-era-raised border border-era-soft"
        style={style}
      />
      <div className="font-mono text-xs text-era-primary">{name}</div>
      <div
        className="max-w-[12rem] truncate text-center font-mono text-[10px] text-era-muted"
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function ShadowGrid({
  title,
  description,
  entries,
}: {
  title: string;
  description?: string;
  entries: ShadowEntry[];
}) {
  return (
    <section className="rounded-card border border-era bg-era-base p-6">
      <h3 className="mb-1 text-base font-semibold text-era-primary">{title}</h3>
      {description && (
        <p className="mb-5 text-xs text-era-muted">{description}</p>
      )}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {entries.map((e) => (
          <ShadowSwatch key={e.name} {...e} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Foundations/Shadows",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Shadow tokens. The `Shared` group renders static elevation tokens " +
          "from `src/tokens/shadows.ts`. The `Heritage` and `Neon` groups read " +
          "the era theme objects directly so era-specific shadows (paper depth " +
          "vs neon glow) are always shown with their **resolved** values, not " +
          "as `var(--era-shadow-…)` pointers.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-6 text-era-primary">
      <ShadowGrid
        title="Shared / Static"
        description="Era-neutral elevation scale from src/tokens/shadows.ts."
        entries={staticShadows()}
      />
      <ShadowGrid
        title="Heritage — 종이 두께 (paper depth)"
        description="Resolved from heritageEra.variables. These appear when [data-era='heritage'] is active."
        entries={eraShadows(heritageEra)}
      />
      <ShadowGrid
        title="Neon — glow"
        description="Resolved from neonEra.variables. These appear when [data-era='neon'] is active."
        entries={eraShadows(neonEra)}
      />
    </div>
  ),
};

export const Heritage: Story = {
  render: () => (
    <ShadowGrid
      title="Heritage shadows"
      description="Resolved values from heritageEra.variables — soft, paper-thick, brown-tinted."
      entries={eraShadows(heritageEra)}
    />
  ),
};

export const Neon: Story = {
  render: () => (
    <ShadowGrid
      title="Neon shadows"
      description="Resolved values from neonEra.variables — sharp, glow-driven, electric."
      entries={eraShadows(neonEra)}
    />
  ),
};
