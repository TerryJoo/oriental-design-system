#!/usr/bin/env node
/**
 * @file Render `claudedocs/wave6a-a11y-baseline.md` from the per-story JSONL
 * log produced by the Storybook test-runner (`.storybook/test-runner.ts`).
 *
 * Invoked at the end of `npm run test-storybook:ci`. Idempotent. Safe to run
 * even if the JSONL is empty (emits an empty-state baseline).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "claudedocs");
const JSONL_PATH = path.join(REPORT_DIR, "wave6a-a11y-violations.jsonl");
const MD_PATH = path.join(REPORT_DIR, "wave6a-a11y-baseline.md");

const FAILING_IMPACTS = new Set(["serious", "critical"]);

const readJsonl = async () => {
  try {
    const raw = await fs.readFile(JSONL_PATH, "utf8");
    return raw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line, idx) => {
        try {
          return JSON.parse(line);
        } catch (err) {
          console.warn(
            `[build-a11y-baseline] skipping malformed line ${idx + 1}: ${err.message}`,
          );
          return null;
        }
      })
      .filter(Boolean);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
};

/** Map of `componentTitle` → counter buckets. */
const groupByComponent = (records) => {
  const map = new Map();
  for (const r of records) {
    const key = r.title || "(no title)";
    const bucket = map.get(key) ?? {
      title: key,
      stories: 0,
      skipped: 0,
      withViolations: 0,
      withBlocking: 0,
      blockingTotal: 0,
      advisoryTotal: 0,
      ruleCounts: new Map(),
    };
    bucket.stories += 1;
    if (r.skipped) bucket.skipped += 1;
    if ((r.violations ?? []).length > 0) bucket.withViolations += 1;
    if ((r.blocking ?? 0) > 0) bucket.withBlocking += 1;
    for (const v of r.violations ?? []) {
      if (FAILING_IMPACTS.has(v.impact)) bucket.blockingTotal += 1;
      else bucket.advisoryTotal += 1;
      const k = `${v.id}|${v.impact ?? "n/a"}`;
      bucket.ruleCounts.set(k, (bucket.ruleCounts.get(k) ?? 0) + 1);
    }
    map.set(key, bucket);
  }
  return [...map.values()].sort((a, b) => {
    if (b.blockingTotal !== a.blockingTotal)
      return b.blockingTotal - a.blockingTotal;
    if (b.withViolations !== a.withViolations)
      return b.withViolations - a.withViolations;
    return a.title.localeCompare(b.title);
  });
};

const ruleAggregate = (records) => {
  const map = new Map();
  for (const r of records) {
    for (const v of r.violations ?? []) {
      const key = `${v.id}|${v.impact ?? "n/a"}`;
      const bucket = map.get(key) ?? {
        rule: v.id,
        impact: v.impact ?? "n/a",
        helpUrl: v.helpUrl,
        description: v.description,
        nodeOccurrences: 0,
        storyOccurrences: new Set(),
      };
      bucket.nodeOccurrences += v.nodes ?? 0;
      bucket.storyOccurrences.add(r.id);
      map.set(key, bucket);
    }
  }
  return [...map.values()]
    .map((b) => ({
      ...b,
      storyOccurrences: b.storyOccurrences.size,
    }))
    .sort((a, b) => {
      // Critical/serious first, then by story occurrence count desc.
      const impactRank = {
        critical: 0,
        serious: 1,
        moderate: 2,
        minor: 3,
        "n/a": 4,
      };
      const aRank = impactRank[a.impact] ?? 5;
      const bRank = impactRank[b.impact] ?? 5;
      if (aRank !== bRank) return aRank - bRank;
      return b.storyOccurrences - a.storyOccurrences;
    });
};

const renderMarkdown = (records) => {
  const totalStories = records.length;
  const skipped = records.filter((r) => r.skipped).length;
  const tested = totalStories - skipped;
  const failing = records.filter((r) => (r.blocking ?? 0) > 0).length;
  const passing = tested - failing;
  const advisoryOnly = records.filter(
    (r) => (r.blocking ?? 0) === 0 && (r.violations ?? []).length > 0,
  ).length;

  const components = groupByComponent(records);
  const rules = ruleAggregate(records);

  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const generated = `${fmt.format(new Date())} UTC`;

  const lines = [];
  lines.push("# Wave 6a — Storybook A11y Baseline");
  lines.push("");
  lines.push(`Generated: ${generated}`);
  lines.push("");
  lines.push("## Run Summary");
  lines.push("");
  lines.push(`- Total stories visited: **${totalStories}**`);
  lines.push(
    `- Tested: **${tested}** (${skipped} skipped via \`parameters.a11y.disable\`)`,
  );
  lines.push(`- Passing (no serious/critical): **${passing}**`);
  lines.push(`- Failing gate (serious/critical impact): **${failing}**`);
  lines.push(`- Advisory-only (moderate/minor only): **${advisoryOnly}**`);
  lines.push("");
  lines.push(
    "Gate threshold: a story fails the run if it triggers any axe violation",
  );
  lines.push(
    "with `impact ∈ {serious, critical}`. Wave 5b2 will tighten this to",
  );
  lines.push("include `moderate` once the P1 backlog is cleared.");
  lines.push("");

  if (totalStories === 0) {
    lines.push(
      "> **Note**: No stories were recorded. Either the run aborted before",
    );
    lines.push("> any story executed, or the JSONL log was not produced.");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("## Components by violation count");
  lines.push("");
  lines.push(
    "| Component (title) | Stories | Failing gate | Stories w/ any violation | Blocking findings | Advisory findings |",
  );
  lines.push("|---|---:|---:|---:|---:|---:|");
  for (const c of components) {
    lines.push(
      `| ${c.title} | ${c.stories} | ${c.withBlocking} | ${c.withViolations} | ${c.blockingTotal} | ${c.advisoryTotal} |`,
    );
  }
  lines.push("");

  lines.push("## Violations grouped by axe rule");
  lines.push("");
  lines.push(
    "| Rule | Impact | Stories affected | Total node occurrences | Help |",
  );
  lines.push("|---|---|---:|---:|---|");
  for (const r of rules) {
    lines.push(
      `| \`${r.rule}\` | ${r.impact} | ${r.storyOccurrences} | ${r.nodeOccurrences} | [docs](${r.helpUrl}) |`,
    );
  }
  if (rules.length === 0) {
    lines.push("| _(none)_ | _(n/a)_ | 0 | 0 | _(none)_ |");
  }
  lines.push("");

  // Per-component detail: only emit components with any violation.
  const interesting = components.filter(
    (c) => c.withViolations > 0 || c.withBlocking > 0,
  );
  if (interesting.length > 0) {
    lines.push("## Per-component details");
    lines.push("");
    for (const c of interesting) {
      lines.push(`### ${c.title}`);
      lines.push("");
      lines.push(
        `- ${c.stories} stories · ${c.withBlocking} failing gate · ${c.withViolations} with any violation`,
      );
      lines.push(
        `- ${c.blockingTotal} blocking findings · ${c.advisoryTotal} advisory findings`,
      );
      const ruleEntries = [...c.ruleCounts.entries()]
        .map(([k, count]) => {
          const [rule, impact] = k.split("|");
          return { rule, impact, count };
        })
        .sort((a, b) => {
          const impactRank = {
            critical: 0,
            serious: 1,
            moderate: 2,
            minor: 3,
            "n/a": 4,
          };
          const aRank = impactRank[a.impact] ?? 5;
          const bRank = impactRank[b.impact] ?? 5;
          if (aRank !== bRank) return aRank - bRank;
          return b.count - a.count;
        });
      lines.push("");
      lines.push("| Rule | Impact | Node occurrences |");
      lines.push("|---|---|---:|");
      for (const e of ruleEntries) {
        lines.push(`| \`${e.rule}\` | ${e.impact} | ${e.count} |`);
      }
      lines.push("");
    }
  }

  lines.push("## Per-story violations (failing only)");
  lines.push("");
  const failingRecords = records.filter((r) => (r.blocking ?? 0) > 0);
  if (failingRecords.length === 0) {
    lines.push(
      "_None — no story currently triggers serious or critical violations._",
    );
    lines.push("");
  } else {
    for (const r of failingRecords) {
      lines.push(`### \`${r.id}\` — ${r.title} / ${r.name}`);
      lines.push("");
      const blocking = (r.violations ?? []).filter((v) =>
        FAILING_IMPACTS.has(v.impact),
      );
      for (const v of blocking) {
        lines.push(`- **[${v.impact}] \`${v.id}\`** — ${v.description}`);
        lines.push(`  - nodes: ${v.nodes}`);
        if (Array.isArray(v.targets) && v.targets.length > 0) {
          lines.push(`  - sample targets:`);
          for (const t of v.targets) {
            lines.push(`    - \`${t}\``);
          }
        }
        lines.push(`  - [help](${v.helpUrl})`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
};

const main = async () => {
  const records = await readJsonl();
  const md = renderMarkdown(records);
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.writeFile(MD_PATH, md, "utf8");
  console.log(
    `[build-a11y-baseline] wrote ${MD_PATH} (${records.length} stories)`,
  );
};

main().catch((err) => {
  console.error("[build-a11y-baseline] failed:", err);
  process.exit(1);
});
