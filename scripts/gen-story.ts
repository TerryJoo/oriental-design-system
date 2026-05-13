/**
 * gen-story.ts
 *
 * Scaffold a Storybook CSF3 story file from a component's `.styles.ts`.
 *
 * Usage:
 *   npx tsx scripts/gen-story.ts <ComponentName> [--force] [--variants a,b] [--sizes a,b] [--paddings a,b] [--shapes a,b]
 *
 * Examples:
 *   npx tsx scripts/gen-story.ts Card
 *   npx tsx scripts/gen-story.ts Card --force
 *   npx tsx scripts/gen-story.ts MyThing --variants solid,outline --sizes sm,md,lg
 *
 * Approach: hybrid.
 *   1. Read `src/components/<Name>/<Name>.styles.ts`.
 *   2. Regex-extract exported string-literal type unions and their matching
 *      `Record<TypeName, string>` constants. We rely on the project's uniform
 *      shape (see CLAUDE.md "Component File Structure").
 *   3. Any axis (variants / sizes / paddings / shapes) supplied via CLI flag
 *      overrides whatever was parsed — useful when the styles file is unusual.
 *   4. Emit `stories/<Name>.stories.tsx` with Default / Variants / Sizes /
 *      EraComparison stories, iterating over option arrays rather than
 *      hardcoding class strings (mirrors the test-style convention in
 *      CLAUDE.md).
 *
 * Constraints:
 *   - Pure Node + tsc-strip-types compatible: no external deps.
 *   - ESM-only.
 *   - Refuses to overwrite unless --force is passed.
 *
 * Limitations:
 *   - Regex parsing only handles single-line string-literal unions of the form
 *     `export type Foo = "a" | "b" | "c";` (multi-line unions are joined first).
 *   - Only recognizes maps of shape `export const fooBar: Record<Foo, string> = {`.
 *     Anything more exotic (nested records, computed keys) falls through and
 *     can be supplied via the CLI flags fallback.
 *   - The generated file is a starting point — humans should refine props,
 *     children, and ergonomics.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- paths ----------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

// ---------- CLI parsing ----------

interface CliArgs {
  componentName: string;
  force: boolean;
  variants?: string[];
  sizes?: string[];
  paddings?: string[];
  shapes?: string[];
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  let componentName: string | undefined;
  let force = false;
  let variants: string[] | undefined;
  let sizes: string[] | undefined;
  let paddings: string[] | undefined;
  let shapes: string[] | undefined;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--force") {
      force = true;
    } else if (a === "--variants") {
      variants = (args[++i] ?? "").split(",").filter(Boolean);
    } else if (a === "--sizes") {
      sizes = (args[++i] ?? "").split(",").filter(Boolean);
    } else if (a === "--paddings") {
      paddings = (args[++i] ?? "").split(",").filter(Boolean);
    } else if (a === "--shapes") {
      shapes = (args[++i] ?? "").split(",").filter(Boolean);
    } else if (a.startsWith("--")) {
      console.warn(`[gen-story] unknown flag: ${a}`);
    } else if (!componentName) {
      componentName = a;
    } else {
      console.warn(`[gen-story] ignoring extra positional arg: ${a}`);
    }
  }

  if (!componentName) {
    console.error(
      "[gen-story] missing <ComponentName>.\n" +
        "Usage: npx tsx scripts/gen-story.ts <ComponentName> [--force] [--variants a,b] [--sizes a,b] [--paddings a,b] [--shapes a,b]",
    );
    process.exit(1);
  }

  return { componentName, force, variants, sizes, paddings, shapes };
}

// ---------- styles.ts parser ----------

interface ParsedStyles {
  unions: Record<string, string[]>; // typeName -> options
  recordMaps: Record<string, string>; // mapName -> typeName it indexes
}

/**
 * Extract exported string-literal unions and `Record<TypeName, string>` consts.
 * Lines are first joined for resilient multi-line union parsing, then we run
 * tolerant regexes. Only the project's standard shape is supported.
 */
function parseStylesFile(source: string): ParsedStyles {
  // Collapse semicolon-terminated declarations onto a single logical line so
  // multi-line type unions match the one-line regex below.
  const flat = source
    .replace(/\r\n/g, "\n")
    .replace(/\n\s+/g, " ") // join continuation lines
    .replace(/\s+/g, " ");

  const unions: Record<string, string[]> = {};
  const unionRe =
    /export\s+type\s+([A-Z][A-Za-z0-9_]*)\s*=\s*((?:"[^"]+"\s*\|\s*)*"[^"]+")\s*;/g;
  for (const m of flat.matchAll(unionRe)) {
    const name = m[1]!;
    const body = m[2]!;
    const opts = Array.from(body.matchAll(/"([^"]+)"/g)).map((mm) => mm[1]!);
    unions[name] = opts;
  }

  const recordMaps: Record<string, string> = {};
  const recordRe =
    /export\s+const\s+([a-z][A-Za-z0-9_]*)\s*:\s*Record<\s*([A-Z][A-Za-z0-9_]*)\s*,\s*string\s*>\s*=/g;
  for (const m of flat.matchAll(recordRe)) {
    recordMaps[m[1]!] = m[2]!;
  }

  return { unions, recordMaps };
}

// ---------- axis resolution ----------

interface Axis {
  /** prop name on the React component (e.g. "variant", "size") */
  propName: string;
  /** ordered option labels, lowercase */
  options: string[];
}

/**
 * For a given prop axis (variant/size/padding/shape), pick options in this
 * order: (1) explicit CLI override, (2) parsed `<componentName><Axis>` union
 * (e.g. `CardVariant`), (3) any union referenced by a `<componentName><Axis>s`
 * record map, (4) undefined.
 */
function resolveAxis(
  parsed: ParsedStyles,
  componentName: string,
  propName: "variant" | "size" | "padding" | "shape",
  cliOverride: string[] | undefined,
): Axis | undefined {
  if (cliOverride && cliOverride.length) {
    return { propName, options: cliOverride };
  }
  // Try `<Component><Prop>` union (e.g. CardVariant, ButtonSize).
  const cap = propName.charAt(0).toUpperCase() + propName.slice(1);
  const unionName = `${componentName}${cap}`;
  if (parsed.unions[unionName]) {
    return { propName, options: parsed.unions[unionName]! };
  }
  // Try the matching record map name (e.g. cardVariants, buttonSizes).
  const lower =
    componentName.charAt(0).toLowerCase() + componentName.slice(1);
  const mapName = `${lower}${cap}s`;
  const mapType = parsed.recordMaps[mapName];
  if (mapType && parsed.unions[mapType]) {
    return { propName, options: parsed.unions[mapType]! };
  }
  return undefined;
}

// ---------- code generation ----------

interface GenContext {
  componentName: string;
  axes: Axis[]; // ordered; "variant" first if present
}

const arrLit = (xs: string[]): string =>
  `[${xs.map((x) => JSON.stringify(x)).join(", ")}]`;

function buildArgTypes(axes: Axis[]): string {
  if (!axes.length) return "  argTypes: {},\n";
  const lines = axes.map(
    (ax) =>
      `    ${ax.propName}: { control: { type: "select" }, options: ${arrLit(ax.options)} },`,
  );
  return `  argTypes: {\n${lines.join("\n")}\n  },\n`;
}

function buildVariantsStory(componentName: string, axis: Axis): string {
  // Iterate via Object.keys-style array so we never hardcode option strings
  // beyond the typed array literal at the top of the story file.
  return `export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      {(${arrLit(axis.options)} as const).map((${axis.propName}) => (
        <${componentName} key={${axis.propName}} ${axis.propName}={${axis.propName}}>
          {${axis.propName}}
        </${componentName}>
      ))}
    </div>
  ),
};
`;
}

function buildSizesStory(componentName: string, axis: Axis): string {
  return `export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      {(${arrLit(axis.options)} as const).map((${axis.propName}) => (
        <${componentName} key={${axis.propName}} ${axis.propName}={${axis.propName}}>
          {${axis.propName}}
        </${componentName}>
      ))}
    </div>
  ),
};
`;
}

function buildEraComparison(componentName: string): string {
  return `/**
 * Heritage / Neon side-by-side. The wrapping div uses [data-era] which the
 * Storybook decorator + CSS layer will pick up; no React re-render needed.
 */
export const EraComparison: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-6">
      <div data-era="heritage" className="p-6 rounded-md bg-era-base">
        <div className="text-xs uppercase tracking-widest mb-3 text-era-muted">
          Heritage
        </div>
        <${componentName} {...args}>Heritage</${componentName}>
      </div>
      <div data-era="neon" className="p-6 rounded-md bg-era-base">
        <div className="text-xs uppercase tracking-widest mb-3 text-era-muted">
          Neon
        </div>
        <${componentName} {...args}>Neon</${componentName}>
      </div>
    </div>
  ),
};
`;
}

function generateStory(ctx: GenContext): string {
  const { componentName, axes } = ctx;
  const variantAxis = axes.find((a) => a.propName === "variant");
  const sizeAxis = axes.find((a) => a.propName === "size");

  const argsBlock = `  args: {\n    children: ${JSON.stringify(componentName)},\n  },\n`;

  const parts: string[] = [];
  parts.push(`import type { Meta, StoryObj } from "@storybook/react";\n`);
  parts.push(`import { ${componentName} } from "@/components/${componentName}";\n`);
  parts.push(`\n`);
  parts.push(`const meta: Meta<typeof ${componentName}> = {\n`);
  parts.push(`  title: "Components/${componentName}",\n`);
  parts.push(`  component: ${componentName},\n`);
  parts.push(`  tags: ["autodocs"],\n`);
  parts.push(buildArgTypes(axes));
  parts.push(argsBlock);
  parts.push(`};\n\n`);
  parts.push(`export default meta;\n`);
  parts.push(`type Story = StoryObj<typeof ${componentName}>;\n\n`);
  parts.push(`export const Default: Story = {};\n\n`);

  if (variantAxis) parts.push(buildVariantsStory(componentName, variantAxis) + "\n");
  if (sizeAxis) parts.push(buildSizesStory(componentName, sizeAxis) + "\n");

  parts.push(buildEraComparison(componentName));

  return parts.join("");
}

// ---------- main ----------

function main(): void {
  const cli = parseArgs(process.argv);
  const { componentName, force } = cli;

  const stylesPath = resolve(
    projectRoot,
    "src",
    "components",
    componentName,
    `${componentName}.styles.ts`,
  );
  const outPath = resolve(
    projectRoot,
    "stories",
    `${componentName}.stories.tsx`,
  );

  if (!existsSync(stylesPath)) {
    console.error(`[gen-story] not found: ${stylesPath}`);
    console.error(
      `[gen-story] tip: pass --variants / --sizes / --paddings / --shapes flags to bypass parsing entirely.`,
    );
    process.exit(1);
  }

  if (existsSync(outPath) && !force) {
    console.warn(
      `[gen-story] refusing to overwrite ${outPath} (pass --force to clobber).`,
    );
    process.exit(2);
  }

  const source = readFileSync(stylesPath, "utf8");
  const parsed = parseStylesFile(source);

  const variant = resolveAxis(parsed, componentName, "variant", cli.variants);
  const size = resolveAxis(parsed, componentName, "size", cli.sizes);
  const padding = resolveAxis(parsed, componentName, "padding", cli.paddings);
  const shape = resolveAxis(parsed, componentName, "shape", cli.shapes);

  const axes: Axis[] = [variant, size, shape, padding].filter(
    (a): a is Axis => Boolean(a),
  );

  if (!axes.length) {
    console.warn(
      `[gen-story] no variant/size/padding/shape axes detected for ${componentName}.\n` +
        `             Generating a minimal story with Default + EraComparison only.`,
    );
  } else {
    console.log(
      `[gen-story] axes for ${componentName}: ${axes
        .map((a) => `${a.propName}=[${a.options.join(",")}]`)
        .join("  ")}`,
    );
  }

  const out = generateStory({ componentName, axes });

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, out, "utf8");
  console.log(`[gen-story] wrote ${outPath} (${out.split("\n").length} lines)`);
}

main();
