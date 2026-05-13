#!/usr/bin/env node
/**
 * @file Wraps the `test-storybook` invocation so that:
 *   1. The JSONL log is truncated before workers spawn (parent-process
 *      reset, see `reset-a11y-baseline.mjs`).
 *   2. The markdown baseline is ALWAYS rendered after the run, even when
 *      the test-runner exits non-zero (we want the baseline doc to reflect
 *      whatever was captured).
 *   3. The original exit code from `test-storybook` is propagated, so the
 *      gate still fails the CI run on serious/critical violations.
 *
 * Designed to run inside a `concurrently` block alongside the http-server
 * that serves `storybook-static/`. Assumes the server is already up
 * (caller uses `wait-on tcp:127.0.0.1:6006`).
 */
import { spawnSync } from "node:child_process";
import process from "node:process";

const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    env: { ...process.env, ...(opts.env ?? {}) },
  });

// 1. Truncate JSONL.
{
  const r = run(process.execPath, ["scripts/reset-a11y-baseline.mjs"]);
  if (r.status !== 0) {
    console.error(`[run-a11y-suite] reset failed (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
}

// 2. Run test-storybook. Force IPv4-first DNS so jest-playwright's shared
//    browser server (binds 0.0.0.0, advertises `localhost:PORT`) is
//    reachable on macOS/Linux where `localhost` resolves IPv6 first.
const testRun = run(
  "npx",
  ["test-storybook", "--url", "http://127.0.0.1:6006"],
  {
    env: {
      NODE_OPTIONS: [
        process.env.NODE_OPTIONS ?? "",
        "--dns-result-order=ipv4first",
      ]
        .filter(Boolean)
        .join(" "),
    },
  },
);
const testExit = testRun.status ?? 1;

// 3. Render the markdown baseline regardless of pass/fail.
const reportRun = run(process.execPath, ["scripts/build-a11y-baseline.mjs"]);
if (reportRun.status !== 0) {
  console.warn(
    `[run-a11y-suite] baseline render failed (exit ${reportRun.status})`,
  );
}

// 4. Propagate the test-runner's exit code.
process.exit(testExit);
