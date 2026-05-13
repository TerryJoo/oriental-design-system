/**
 * @file Storybook test-runner configuration for the Oriental Design System.
 *
 * Wires axe-playwright into every story visit so the storybook serves as an
 * automated a11y regression gate. Configuration intent:
 *
 *  - preVisit  → inject axe-core into the rendered page.
 *  - postVisit → pull the story context (so per-story `parameters.a11y` is
 *                respected), apply story-level rule overrides, run axe, then
 *                append the result (all severities) to a JSONL sidecar.
 *
 *  - We collect ALL violations (advisory) into a JSONL log so Wave 6a can
 *    publish a baseline catalog of the project's current a11y posture.
 *  - We FAIL the test only on `serious` and `critical` impact violations.
 *    Lower-severity findings (`minor`, `moderate`) are tracked in the log
 *    but do not break the gate. Wave 5b2 will tighten this.
 *  - Stories may opt out via `parameters: { a11y: { disable: true } }`.
 *
 * Output (per-story append, since the test-runner forks parallel jest
 * workers — a single in-memory buffer would lose other workers' data):
 *
 *    `claudedocs/wave6a-a11y-violations.jsonl`
 *
 * The companion summary doc (`wave6a-a11y-baseline.md`) is rendered from
 * this JSONL by `scripts/build-a11y-baseline.mjs` after the run completes.
 *
 * Visual regression (Wave 5b2 / D3 — opt-in)
 * ------------------------------------------
 * When env `VISUAL_SNAPSHOT=1` is set, `postVisit` ALSO captures a screenshot
 * of `#storybook-root` and either (a) writes it to `__visual_snapshots__/<id>.png`
 * if `VISUAL_SNAPSHOT_UPDATE=1`, or (b) diffs against the existing baseline
 * using Playwright's bundled PNG comparator (pixelmatch under the hood).
 *
 * The default `test-storybook:ci` script does NOT enable this mode — visual
 * regression is opt-in via the new `test-storybook:visual` /
 * `test-storybook:visual:ci` scripts. See `scripts/README.md` for details.
 *
 * Stories may opt out of visual snapshots via:
 *   `parameters: { visualSnapshot: { disable: true } }`
 *
 * Recommended for: animation-heavy stories where pixel diff is brittle
 * (auto-playing carousels, loading dots, transitions caught mid-frame),
 * MDX docs pages, and stories that depend on viewport-sensitive layout
 * outside the canvas frame.
 */

import { promises as fs, mkdirSync } from "node:fs";
import path from "node:path";

import { type TestRunnerConfig, getStoryContext } from "@storybook/test-runner";
import { configureAxe, getViolations, injectAxe } from "axe-playwright";
import type { ImpactValue, Result as AxeResult } from "axe-core";

const FAILING_IMPACTS: ReadonlyArray<ImpactValue> = ["serious", "critical"];

const REPORT_DIR = path.resolve(process.cwd(), "claudedocs");
const JSONL_PATH = path.join(REPORT_DIR, "wave6a-a11y-violations.jsonl");

// Visual regression configuration. Opt-in via VISUAL_SNAPSHOT=1.
//
// Implementation note: we lean on Playwright's bundled image comparator
// (pixelmatch + pngjs, both ship inside playwright-core) so we avoid
// adding new project dependencies for D3. The comparator path is private
// API but stable across the 1.x range; if a future bump rearranges it,
// we degrade to a byte-equal compare and log a warning rather than crash.
const VISUAL_SNAPSHOT_ENABLED = process.env.VISUAL_SNAPSHOT === "1";
const VISUAL_SNAPSHOT_UPDATE = process.env.VISUAL_SNAPSHOT_UPDATE === "1";
const VISUAL_SNAPSHOT_ONLY = process.env.VISUAL_SNAPSHOT_ONLY === "1";
const VISUAL_SNAPSHOT_DIR = path.resolve(process.cwd(), "__visual_snapshots__");
const VISUAL_SNAPSHOT_THRESHOLD = (() => {
  const raw = process.env.VISUAL_SNAPSHOT_THRESHOLD;
  if (!raw) return 0.1; // pixelmatch ratio — same default Playwright uses.
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0.1;
})();
const VISUAL_SNAPSHOT_MAX_DIFF_PIXELS = (() => {
  const raw = process.env.VISUAL_SNAPSHOT_MAX_DIFF_PIXELS;
  if (!raw) return 100; // small absolute cushion for AA / sub-pixel jitter.
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 100;
})();

// JSONL truncation is done by the parent CI script before launching the
// test-runner — never inside `setup()`, because jest forks one worker per
// test suite and racing truncation would obliterate other workers' rows.
// We only ensure the directory exists here.
const ensureReportDir = () => {
  mkdirSync(REPORT_DIR, { recursive: true });
};

const ensureSnapshotDir = () => {
  if (VISUAL_SNAPSHOT_ENABLED) {
    mkdirSync(VISUAL_SNAPSHOT_DIR, { recursive: true });
  }
};

const summarize = (violations: AxeResult[]) =>
  violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? null,
    description: v.description,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
    targets: v.nodes
      .flatMap((n) =>
        n.target.map((t) => (Array.isArray(t) ? t.join(" ") : String(t))),
      )
      .slice(0, 5),
  }));

/**
 * Lazily resolve Playwright's bundled PNG comparator. It's a private path
 * (`playwright-core/lib/server/utils/comparators`) but ships in every install
 * of `playwright`, which we already depend on transitively via the
 * test-runner. If the import fails (e.g., upstream rearranges layout), we
 * degrade to a byte-equal compare and log once.
 */
type ImageComparator = (
  actualBuffer: Buffer,
  expectedBuffer: Buffer,
  options: {
    maxDiffPixels?: number;
    maxDiffPixelRatio?: number;
    threshold?: number;
  },
) => { errorMessage: string; diff?: Buffer } | null;

let cachedComparator: ImageComparator | null | undefined;
let comparatorWarned = false;

const getImageComparator = (): ImageComparator | null => {
  if (cachedComparator !== undefined) return cachedComparator;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod: { getComparator?: (mime: string) => ImageComparator } =
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("playwright-core/lib/server/utils/comparators");
    cachedComparator = mod.getComparator?.("image/png") ?? null;
  } catch (err) {
    if (!comparatorWarned) {
      console.warn(
        `[test-runner.visual] Could not load Playwright PNG comparator (${
          (err as Error).message
        }); falling back to byte-equal compare.`,
      );
      comparatorWarned = true;
    }
    cachedComparator = null;
  }
  return cachedComparator;
};

const compareSnapshots = (
  actual: Buffer,
  expected: Buffer,
): { match: boolean; reason?: string } => {
  if (Buffer.compare(actual, expected) === 0) {
    return { match: true };
  }
  const comparator = getImageComparator();
  if (!comparator) {
    return {
      match: false,
      reason: "byte mismatch (comparator unavailable; install playwright)",
    };
  }
  const result = comparator(actual, expected, {
    threshold: VISUAL_SNAPSHOT_THRESHOLD,
    maxDiffPixels: VISUAL_SNAPSHOT_MAX_DIFF_PIXELS,
  });
  if (!result) return { match: true };
  return { match: false, reason: result.errorMessage };
};

const config: TestRunnerConfig = {
  setup() {
    // Per-worker hook (jest forks one worker per test suite). We only
    // guarantee the report dir exists; the parent CI script handles the
    // pre-run truncation so concurrent workers all append safely.
    ensureReportDir();
    ensureSnapshotDir();
  },

  async preVisit(page) {
    if (!VISUAL_SNAPSHOT_ONLY) {
      await injectAxe(page);
    }
  },

  async postVisit(page, context) {
    // Test-runner injects `globalThis.__getContext` via its preview-head
    // script on iframe load, and the function itself walks
    // `globalThis.__STORYBOOK_PREVIEW__.storyStore`. Under parallel jest
    // workers either step can race the first postVisit call, surfacing as
    // either `TypeError: globalThis.__getContext is not a function` or
    // `Cannot read properties of undefined (reading 'storyStore')` for a
    // shifting subset of stories every run. Retry up to 5 times with a
    // short delay if the error matches a known race signature.
    const RACE_SIGNATURES = [
      "__getContext",
      "storyStore",
      "__STORYBOOK_PREVIEW__",
    ];
    let storyContext: Awaited<ReturnType<typeof getStoryContext>> | undefined;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        storyContext = await getStoryContext(page, context);
        break;
      } catch (err) {
        const msg = (err as Error).message ?? "";
        const isRace = RACE_SIGNATURES.some((sig) => msg.includes(sig));
        if (attempt === 4 || !isRace) throw err;
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    if (!storyContext) {
      throw new Error("getStoryContext returned no value");
    }
    const a11yParams = storyContext.parameters?.a11y as
      | {
          disable?: boolean;
          config?: { rules?: unknown[] };
          options?: unknown;
        }
      | undefined;
    const visualParams = storyContext.parameters?.visualSnapshot as
      | { disable?: boolean }
      | undefined;

    const baseRecord = {
      id: storyContext.id,
      title: storyContext.title,
      name: storyContext.name,
      tags: storyContext.tags ?? [],
    };

    // ---- Visual snapshot pass (opt-in) -----------------------------------
    // Run BEFORE axe so the screenshot reflects the same DOM that axe
    // analyzes (axe doesn't mutate the DOM, but keep ordering deterministic).
    if (VISUAL_SNAPSHOT_ENABLED && !visualParams?.disable) {
      try {
        const root = await page.$("#storybook-root");
        const screenshot = await (root
          ? root.screenshot({ animations: "disabled", caret: "hide" })
          : page.screenshot({
              fullPage: false,
              animations: "disabled",
              caret: "hide",
            }));

        const snapshotPath = path.join(
          VISUAL_SNAPSHOT_DIR,
          `${storyContext.id}.png`,
        );

        if (VISUAL_SNAPSHOT_UPDATE) {
          await fs.writeFile(snapshotPath, screenshot);
        } else {
          let expected: Buffer | null = null;
          try {
            expected = await fs.readFile(snapshotPath);
          } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
          }
          if (!expected) {
            // Missing baseline in compare mode: write it so the next run
            // has something to diff against, then fail loudly so the
            // operator knows a baseline was just minted.
            await fs.writeFile(snapshotPath, screenshot);
            throw new Error(
              `Visual snapshot baseline missing for ${storyContext.id}; wrote ${snapshotPath}. ` +
                `Re-run after committing the new baseline (or run \`npm run test-storybook:visual\` to refresh).`,
            );
          }
          const { match, reason } = compareSnapshots(screenshot, expected);
          if (!match) {
            // Drop the actual + diff next to the baseline to aid debugging.
            const actualPath = path.join(
              VISUAL_SNAPSHOT_DIR,
              `${storyContext.id}.actual.png`,
            );
            await fs.writeFile(actualPath, screenshot);
            throw new Error(
              [
                `Visual regression for ${storyContext.id}`,
                `  title: ${storyContext.title}`,
                `  name:  ${storyContext.name}`,
                `  baseline: ${snapshotPath}`,
                `  actual:   ${actualPath}`,
                `  reason:   ${reason ?? "pixel mismatch"}`,
                `  threshold: ratio=${VISUAL_SNAPSHOT_THRESHOLD} maxDiffPixels=${VISUAL_SNAPSHOT_MAX_DIFF_PIXELS}`,
                `  to refresh: VISUAL_SNAPSHOT=1 VISUAL_SNAPSHOT_UPDATE=1 npm run test-storybook:visual`,
              ].join("\n"),
            );
          }
        }
      } catch (err) {
        if (!VISUAL_SNAPSHOT_ONLY) {
          // Still record an a11y row so the JSONL stays consistent.
          await fs.appendFile(
            JSONL_PATH,
            JSON.stringify({
              ...baseRecord,
              skipped: true,
              skippedReason: "visual-snapshot-failure",
              violations: [],
              blocking: 0,
            }) + "\n",
            "utf8",
          );
        }
        throw err;
      }
    }

    // ---- A11y pass --------------------------------------------------------
    if (VISUAL_SNAPSHOT_ONLY) {
      return;
    }

    // Honor story-level opt-out (e.g. composite-only canvases that
    // intentionally render incomplete a11y trees for visual demos).
    if (a11yParams?.disable) {
      await fs.appendFile(
        JSONL_PATH,
        JSON.stringify({
          ...baseRecord,
          skipped: true,
          violations: [],
          blocking: 0,
        }) + "\n",
        "utf8",
      );
      return;
    }

    if (a11yParams?.config?.rules) {
      // Story-level rule overrides flow through the same `rules` array shape
      // already documented in `.storybook/preview.ts`.
      await configureAxe(page, { rules: a11yParams.config.rules as never });
    }

    const allViolations = await getViolations(
      page,
      "#storybook-root",
      // Pass through any axe RunOptions defined on the story (matches the
      // `runOnly: { type: 'tag', values: [...wcag tags] }` shape in preview.ts).
      a11yParams?.options as never,
    );

    const blocking = allViolations.filter(
      (v) =>
        v.impact && (FAILING_IMPACTS as readonly string[]).includes(v.impact),
    );

    await fs.appendFile(
      JSONL_PATH,
      JSON.stringify({
        ...baseRecord,
        skipped: false,
        violations: summarize(allViolations),
        blocking: blocking.length,
      }) + "\n",
      "utf8",
    );

    if (blocking.length > 0) {
      const formatted = blocking
        .map((v) => {
          const targets = v.nodes
            .slice(0, 3)
            .map((n) =>
              Array.isArray(n.target) ? n.target.join(" ") : String(n.target),
            )
            .join("\n        ");
          return [
            `  - [${v.impact}] ${v.id}: ${v.help}`,
            `    ${v.helpUrl}`,
            `    nodes: ${v.nodes.length}`,
            `    sample targets:\n        ${targets}`,
          ].join("\n");
        })
        .join("\n");
      throw new Error(
        [
          `A11y violations (impact: ${FAILING_IMPACTS.join("|")}) in story ${storyContext.id}`,
          `  title: ${storyContext.title}`,
          `  name:  ${storyContext.name}`,
          formatted,
        ].join("\n"),
      );
    }
  },
};

export default config;
