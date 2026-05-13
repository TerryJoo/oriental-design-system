#!/usr/bin/env node
/**
 * @file Truncate the per-run JSONL log before the test-runner spawns its
 * jest workers. Doing this in the parent process — rather than inside the
 * `setup()` hook of each worker — avoids the race where multiple workers
 * truncate the file after others have already appended rows.
 *
 * Companion files:
 *   - `.storybook/test-runner.ts`   (workers append per-story rows)
 *   - `scripts/build-a11y-baseline.mjs` (renders the markdown summary)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "claudedocs");
const JSONL_PATH = path.join(REPORT_DIR, "wave6a-a11y-violations.jsonl");

await fs.mkdir(REPORT_DIR, { recursive: true });
await fs.writeFile(JSONL_PATH, "", "utf8");
console.log(`[reset-a11y-baseline] cleared ${JSONL_PATH}`);
