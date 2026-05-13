# scripts

Local dev tooling for `oriental-design-system`.

## `gen-story.ts`

Scaffolds a Storybook CSF3 story file for an existing component by parsing
its `.styles.ts` and emitting `stories/<Component>.stories.tsx`.

```bash
# Preferred (downloads tsx on demand if not installed):
npx tsx scripts/gen-story.ts Card

# Refuse-to-overwrite is the default; pass --force to clobber:
npx tsx scripts/gen-story.ts Card --force

# CLI flags override what was parsed (useful for unusual styles files):
npx tsx scripts/gen-story.ts MyThing --variants solid,outline --sizes sm,md,lg

# Native (Node 22.6+):
node --experimental-strip-types scripts/gen-story.ts Card
```

The script parses exported string-literal type unions and `Record<TypeName, string>`
constants. The generated story iterates over option arrays rather than
hardcoding class strings, mirroring the test-style convention in `CLAUDE.md`.

### Recommended npm script

Add to `package.json` `scripts`:

```json
"gen:story": "tsx scripts/gen-story.ts"
```

Then: `npm run gen:story -- Card`.

## `run-a11y-suite.mjs`

Wraps `test-storybook` for the axe a11y gate. Truncates the per-story
JSONL log, runs the test-runner against `http://127.0.0.1:6006`, then
renders `claudedocs/wave6a-a11y-baseline.md` from the JSONL via
`build-a11y-baseline.mjs`. The script propagates the test-runner's
exit code so the gate still fails the CI run on `serious` / `critical`
violations. Driven by `npm run test-storybook:ci`.

## `run-visual-suite.mjs`

Wraps `test-storybook` for visual-regression mode (Wave 5b2 / D3).
Sets `VISUAL_SNAPSHOT=1` + `VISUAL_SNAPSHOT_ONLY=1` so the test-runner's
`postVisit` hook captures a screenshot of `#storybook-root` per story
and either (a) writes `__visual_snapshots__/<id>.png` when invoked with
`--update` (or `VISUAL_SNAPSHOT_UPDATE=1`), or (b) diffs the live
screenshot against the existing baseline with Playwright's bundled PNG
comparator (pixelmatch under the hood — no extra deps).

```bash
# Refresh baselines (intentional — after a confirmed visual change):
npm run test-storybook:visual

# Compare-only run (no baseline writes; fails on diff):
npm run test-storybook:visual:ci
```

Tunable env vars (all optional):

| Var | Default | Effect |
| --- | --- | --- |
| `VISUAL_SNAPSHOT_THRESHOLD` | `0.1` | pixelmatch ratio (per-pixel YIQ delta) |
| `VISUAL_SNAPSHOT_MAX_DIFF_PIXELS` | `100` | absolute pixel-count cushion |

The default `test-storybook:ci` (a11y gate) is unaffected — visual
regression is fully opt-in. Stories that should NOT have a visual
baseline (animation-heavy demos, MDX docs pages where the canvas frame
isn't authoritative) can opt out via:

```ts
parameters: { visualSnapshot: { disable: true } }
```

Per-story baseline files live at `__visual_snapshots__/<story-id>.png`
and ARE committed to the repo (the directory is intentionally NOT
gitignored). Per-run debug artifacts (`*.actual.png` written on a diff
failure) are gitignored.
