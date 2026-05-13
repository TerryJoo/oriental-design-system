# @jyi/design-system

[![CI](https://github.com/TerryJoo/oriental-design-system/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/TerryJoo/oriental-design-system/actions/workflows/ci.yml)

Oriental design system with **Heritage (과거) ↔ Neon (현대) dual-era theming** for React + Tailwind CSS.

## Status

Production-ready alpha. **47 components shipped**, **571 unit tests** (vitest, 80% coverage threshold), and a **Storybook a11y regression gate** with 382 stories passing the WCAG 2.1 AA `serious|critical` axe threshold. The package remains `private: true` — it is not yet published to npm. Consume it locally (workspace, file:, or git installs) until a release tag is cut.

## Features

- **Dual-era theming** — `data-era="heritage"` or `data-era="neon"` on the document element swaps CSS custom properties for surface, ink, edge, shadow, motion, and font stacks. Era switching never re-renders React components.
- **47 components** across foundation, forms, feedback, navigation, overlay, data, editor, chat, and system layers.
- **Three module entry points** — `@jyi/design-system` (full), `/core` (framework-agnostic tokens + style functions, no React), `/react` (React components only).
- **Tailwind preset** at `@jyi/design-system/tailwind-preset` exposing the oriental palette and era-aware utilities (`bg-era-base`, `text-era-primary`, `shadow-era-card`, `duration-era`, `ease-era-brush`).
- **WAI-ARIA conformance** — implemented patterns include dialog, tablist with roving tabindex, menu, tooltip with `aria-describedby`, non-modal dialog (popover), tree, grid (calendar), combobox + listbox, and disclosure.
- **Keyboard reorder for drag-and-drop** — `DragDrop` and `KanbanBoard` support Space/Enter to grab, Arrow keys to move, and Escape to cancel, with `aria-live` announcements.
- **Reduced-motion friendly** — entry animations are gated behind Tailwind's `motion-safe:` prefix; the system honors `prefers-reduced-motion: reduce` automatically.
- **Type-safe** — every component ships with strict prop types extending native HTML attributes; style functions expose discriminated `variant`/`size`/`shape` types.
- **Storybook documentation** — 232 stories with autodocs, era toolbar toggle, and per-story a11y panel.
- **Automated regression gate** — `@storybook/test-runner` + `axe-playwright` enforce no `serious`/`critical` violations per story (run locally with `npm run test-storybook:ci`).

## Quick Start

```bash
npm install              # Install dependencies
npm run dev              # Storybook on http://localhost:6006
npm test                 # Vitest suite
```

The first command brings up the Storybook canvas where every component is documented with live controls and an era toolbar (top right) for switching between Heritage and Neon at runtime.

## Installation (GitHub Packages)

`@jyi/design-system` is a **private** package. The repository visibility is private and the package is published with `publishConfig.access: "restricted"` — it is not discoverable on the public npm registry and is not browsable via GitHub Packages without authentication.

To install, a consumer must satisfy **both** requirements:

1. A GitHub personal access token (PAT) with the `read:packages` scope — classic or fine-grained.
2. The PAT owner must have **read access to this repository** — either as an invited collaborator on `TerryJoo/oriental-design-system`, or as a member of an organization that owns the repo. `read:packages` alone is not sufficient for a private repo; GitHub Packages enforces repository-level ACLs on top of the token scope.

Once both are in place, add a one-line `.npmrc` routing the `@jyi` scope to GitHub Packages:

```bash
# .npmrc (project root or ~/.npmrc)
@jyi:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
# Then install normally
npm install @jyi/design-system
```

For consumer CI workflows, the cleanest setup is a fine-grained PAT scoped to `read:packages` for the `@TerryJoo` account (or whichever account/org owns this repo), stored as a workflow secret and exported as `GITHUB_TOKEN` for the install step. Note: GitHub's auto-provisioned `secrets.GITHUB_TOKEN` is **not** usable here — it can only read packages from the same repository the workflow is running in, so cross-repo consumers always need a real PAT.

## Usage

### React

```tsx
import { Button, Modal, applyEra } from "@jyi/design-system";

// Set the era once at app boot. Switching later is also free of re-renders;
// it just rewrites CSS custom properties on <html>.
applyEra(document.documentElement, "heritage");

export function App() {
  return (
    <div className="bg-era-base text-era-primary p-6">
      <Button variant="primary">확인</Button>
    </div>
  );
}
```

### Framework-agnostic (`core`)

The `core` entry has no React dependency. Use it from Astro, Vue, Svelte, vanilla HTML, or any non-React environment to generate Tailwind class strings from style functions plus the era runtime switcher.

```ts
import {
  buttonStyles,
  badgeStyles,
  applyEra,
  colors,
  era,
} from "@jyi/design-system/core";

const className = buttonStyles({ variant: "primary", size: "md" });
applyEra(document.documentElement, "neon");
```

### Tailwind preset

```js
// tailwind.config.js
module.exports = {
  presets: [require("@jyi/design-system/tailwind-preset")],
  content: ["./src/**/*.{ts,tsx,html}"],
};
```

The preset registers the oriental palette (warm terracotta primary, plus celadon, indigo, gold, jade, coral) and era-aware utilities. Components in this library assume the preset is loaded.

### Stylesheet imports

Three CSS bundles ship alongside the JS output:

```ts
import "@jyi/design-system/styles"; // Base + tokens + utilities
import "@jyi/design-system/styles/eras/heritage"; // Heritage SVG patterns (woodgrain, porcelain, inkwash)
import "@jyi/design-system/styles/eras/neon"; // Neon SVG patterns (circuit, scanline)
```

Heritage and Neon era stylesheets are scoped under `[data-era="heritage"]` / `[data-era="neon"]` and only paint when their era is active, so loading both is safe and recommended.

## Era theming overview

Era is orthogonal to the accent theme. Every era-aware component reads the same semantic CSS custom properties (`--era-surface-base`, `--era-ink-primary`, `--era-shadow-card`, `--era-ease-brush`, `--font-display`, …) — only the physical values change between Heritage and Neon. Because the swap happens at the CSS variable layer, switching eras at runtime never causes a React re-render.

For the full token table and worked examples, see the **Foundations / CSS Variables** and **Foundations / Era Switch** stories in Storybook (`npm run dev`). The architecture specification lives at [`docs/reference/ERA_THEME_DESIGN.md`](./docs/reference/ERA_THEME_DESIGN.md).

## Component catalog

The library ships 47 components, grouped in Storybook by category:

- **Foundation** — Typography, Stack, Separator, Card, PatternBackground, CoverImage
- **Forms** — Button, Input, TextField, Checkbox, Radio, Switch, Select, Filter, IconPicker
- **Feedback** — Alert, Toast, Spinner, LoadingDots, Skeleton, Progress, EmptyState, SyncStatus
- **Navigation** — Breadcrumb, Tabs, Pagination, Sidebar (flat + Shell compound), PageTree, Stepper
- **Overlay** — Modal, Popover, Tooltip, DropdownMenu, CommandPalette
- **Data** — Accordion, DataTable, KanbanBoard, DragDrop, Calendar
- **Editor & Media** — MarkdownEditor, AudioRecorder
- **Chat** — PromptInput, ChatBubble
- **Display** — Avatar, Tag, Badge
- **System** — EraSwitch

Run `npm run dev` and open Storybook for live demos, prop tables, and accessibility notes per component.

## Accessibility

Each component is exercised against axe via the Storybook a11y panel and the test-runner regression gate. The `serious|critical` threshold is enforced in CI; 382 stories currently pass. Implemented WAI-ARIA patterns include:

- **Dialog** (Modal) — focus trap, focus restoration, body scroll lock, optional `alertdialog` role
- **Tablist** (Tabs) — roving tabindex, Arrow / Home / End keyboard navigation
- **Menu** (DropdownMenu) — Arrow navigation, Tab closes menu, optional `closeOnSelect`
- **Tooltip** — `aria-describedby` wiring, dismiss on Escape and blur
- **Non-modal dialog** (Popover) — initial focus, focus restoration, Escape closes
- **Tree** (PageTree), **Grid** (Calendar), **Combobox + listbox** (CommandPalette), **Disclosure** (Accordion)

For a deeper walkthrough see the **Foundations / Accessibility** entry in Storybook.

## Browser support

Modern evergreen browsers — last 2 versions of Chrome, Edge, Firefox, and Safari. The library uses CSS custom properties, container queries (where available), and the `motion-safe:` prefix; it does not ship IE 11 or legacy Edge polyfills.

## Local development

| Script                          | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `npm run dev`                   | Storybook on http://localhost:6006 with era toolbar              |
| `npm run build`                 | tsup library build (ESM + types + tailwind preset CJS/ESM + CSS) |
| `npm run build:storybook`       | Static Storybook site (`storybook-static/`)                      |
| `npm test`                      | Vitest run-once                                                  |
| `npm run test:watch`            | Vitest watch mode                                                |
| `npm run test:coverage`         | Vitest with 80% coverage threshold                               |
| `npm run typecheck`             | `tsc --noEmit`                                                   |
| `npm run lint` / `lint:fix`     | ESLint                                                           |
| `npm run format` / `:check`     | Prettier                                                         |
| `npm run test-storybook:ci`     | Build Storybook, serve, run axe gate (CI-equivalent)             |
| `npm run test-storybook:report` | Regenerate the a11y baseline report                              |

Pre-push convention (also documented in [`CLAUDE.md`](./CLAUDE.md)): run `npm run format && npm run lint:fix && npm run typecheck && npm test` before opening a PR.

## Testing

- **Unit tests** — Vitest + happy-dom + `@testing-library/react` + `@testing-library/jest-dom`. 571 tests across 50 component test files. 80% coverage threshold enforced via `vitest --coverage`.
- **Story regression** — `@storybook/test-runner` runs each story headless, executes any `play()` function, and runs `axe-playwright` against the rendered DOM. Stories fail the gate on any `serious` or `critical` violation. Local invocation: `npm run test-storybook:ci`.
- **CI** — workflow at `.github/workflows/ci.yml`. Runs format/lint/typecheck, vitest, the tsup build, and the Storybook a11y gate against `storybook-static/`.

## Contributing

Project conventions, the four-file component pattern, token-first rules, and pre-push checklist are documented in [`CLAUDE.md`](./CLAUDE.md). Era theme architecture and the visual prototype reference are under [`docs/reference/`](./docs/reference/).

## Releasing

Contributors cutting a new version should read [`RELEASE.md`](./RELEASE.md) before pushing tags or merging release PRs. It covers the Conventional Commits convention this repo follows, the Release Please automation flow, the GitHub Packages publish step, and the rollback procedure if a bad version lands. Each shipped tag is also linked from the [GitHub Releases page](https://github.com/TerryJoo/oriental-design-system/releases).

## License

MIT (see `package.json#license`). The Korean font assets bundled via `@fontsource/*` are governed by their respective upstream licenses (typically SIL Open Font License) — review each font's notice before redistribution.
