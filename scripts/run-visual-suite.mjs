#!/usr/bin/env node
/**
 * @file Wraps the `test-storybook` invocation in visual-snapshot mode.
 *
 * Mirrors `run-a11y-suite.mjs` but with `VISUAL_SNAPSHOT=1` set so the
 * `.storybook/test-runner.ts` postVisit hook captures a screenshot of
 * `#storybook-root` for every story (other than ones that opt out via
 * `parameters.visualSnapshot.disable`).
 *
 * Two modes:
 *   - default (compare): diff against `__visual_snapshots__/<id>.png`,
 *     fail if any story exceeds the configured pixel diff threshold.
 *   - update: pass `--update` (or set `VISUAL_SNAPSHOT_UPDATE=1`) to
 *     overwrite baselines from this run instead of comparing. Use this
 *     intentionally to refresh baselines after a confirmed visual change.
 *
 * The a11y gate is disabled in this script (`VISUAL_SNAPSHOT_ONLY=1`)
 * so the visual run is independent of the a11y JSONL — no chance of
 * cross-contaminating `wave6a-a11y-violations.jsonl`. Run the existing
 * `test-storybook:ci` for the a11y gate.
 *
 * Designed to run inside a `concurrently` block alongside the http-server
 * that serves `storybook-static/`, identical to the a11y suite. Assumes
 * the server is already up (caller uses `wait-on tcp:127.0.0.1:6006`).
 */
import { spawnSync } from "node:child_process";
import process from "node:process";

const args = process.argv.slice(2);
const updateMode =
  args.includes("--update") || process.env.VISUAL_SNAPSHOT_UPDATE === "1";

const env = {
  ...process.env,
  VISUAL_SNAPSHOT: "1",
  VISUAL_SNAPSHOT_ONLY: "1",
  ...(updateMode ? { VISUAL_SNAPSHOT_UPDATE: "1" } : {}),
  // Force IPv4-first DNS so jest-playwright reaches `localhost:6006` on
  // macOS/Linux setups where IPv6 resolves first.
  NODE_OPTIONS: [process.env.NODE_OPTIONS ?? "", "--dns-result-order=ipv4first"]
    .filter(Boolean)
    .join(" "),
};

const run = (cmd, runArgs, opts = {}) =>
  spawnSync(cmd, runArgs, {
    stdio: "inherit",
    shell: false,
    env: { ...env, ...(opts.env ?? {}) },
  });

console.log(
  updateMode
    ? "[run-visual-suite] mode: UPDATE — overwriting baselines under __visual_snapshots__/"
    : "[run-visual-suite] mode: COMPARE — diffing against __visual_snapshots__/",
);

const testRun = run("npx", [
  "test-storybook",
  "--url",
  "http://127.0.0.1:6006",
]);

process.exit(testRun.status ?? 1);
