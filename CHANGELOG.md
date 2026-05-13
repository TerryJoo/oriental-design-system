# Changelog

All notable changes to **@jyi/design-system** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1](https://github.com/TerryJoo/oriental-design-system/compare/v0.1.0...v0.1.1) (2026-05-13)


### Bug Fixes

* **visual-regression:** replace playwright-core private comparator with pixelmatch+pngjs ([aa31913](https://github.com/TerryJoo/oriental-design-system/commit/aa31913171c7a66da3c40404736d022d6830dfeb))

## [Unreleased]

The package is at `0.1.0` and remains `private: true`. This entry consolidates everything that has landed since the initial scaffold and reflects the current `main` working tree ahead of the first published release.

### Added

- 47 components across foundation, forms, feedback, navigation, overlay, data, editor, chat, and system layers: Avatar, Alert, Accordion, AudioRecorder, Badge, Breadcrumb, Button, Calendar, Card, ChatBubble, Checkbox, CommandPalette, CoverImage, DataTable, DragDrop, DropdownMenu, EmptyState, EraSwitch, Filter, IconPicker, Input, KanbanBoard, LoadingDots, MarkdownEditor, Modal, PageTree, Pagination, PatternBackground, Popover, Progress, PromptInput, Radio, Select, Separator, Sidebar (flat + Shell compound), Skeleton, Spinner, Stack, Stepper, Switch, SyncStatus, Tabs, Tag, TextField, Toast, Tooltip, Typography.
- Dual-era theming (Heritage / Neon) via CSS custom properties and the `data-era` attribute on the document element. `applyEra()` runtime switcher rewrites variables in place; React components do not re-render on era change.
- Three module entry points: `.` (full bundle), `/core` (framework-agnostic — tokens, style functions, `cn`, era system, no React dependency), `/react` (React components only). Plus `/tailwind-preset` (CJS + ESM), `/styles` (base CSS), and `/styles/eras/{heritage,neon}` (era-only SVG patterns and masks).
- 232 Storybook stories with autodocs and an automated a11y regression gate powered by `@storybook/test-runner` + `axe-playwright`. The gate runs locally (`npm run test-storybook:ci`) and in CI (`.github/workflows/ci.yml`) and currently reports 382/382 stories passing the WCAG 2.1 AA `serious|critical` axe threshold.
- WAI-ARIA pattern implementations: dialog (Modal), tablist with roving tabindex (Tabs), menu with roving tabindex (DropdownMenu), tooltip with `aria-describedby` (Tooltip), non-modal dialog (Popover), tree (PageTree), grid (Calendar), combobox + listbox (CommandPalette), and disclosure (Accordion).
- Keyboard reorder pattern for `DragDrop` and `KanbanBoard`: Space/Enter to grab, Arrow keys to move, Escape to cancel, with `aria-live` polite announcements.
- New CSS variable `--era-accent-strong` (Heritage = `accent-700`, Neon = `accent-300`) intended for active/selected text on neutral backgrounds where AA contrast is required under both eras.
- Era-aware override pattern via Tailwind arbitrary variants (e.g., `[[data-era=neon]_&]:text-era-primary`) for the rare cases where a component needs a Neon-only adjustment.
- New optional component props: `Modal#role` (`'dialog' | 'alertdialog'`), `Modal#initialFocusRef`, `DropdownMenu#onClose`, `DropdownMenu#closeOnSelect`, `DragDrop#liveRegion` plus per-item `ariaLabel`, `KanbanBoard#liveRegion`, `Calendar#aria-label`, `CommandPalette#onClose`, `Select#label` and `Select#wrapperClassName`, `Popover#initialFocusRef`.
- Shared story-builder helpers in `stories/_shared/argTypes.ts`: `selectArg`, `radioArg`, `boolArg`, `sizeArg`, `commonStateArgs`, `bothEras`, `forceEra`. These reduce per-story boilerplate and standardize argType wiring.
- Storybook test-runner orchestration scripts: `test-storybook` (against a running Storybook), `test-storybook:ci` (build + serve + axe gate), and `test-storybook:report` (regenerate a11y baseline).

### Changed

The following are soft-breaking — they alter long-standing component behavior. Consumers depending on the previous semantics may need to adjust queries or expectations.

- **Tabs**: only the active tab now has `tabIndex=0` (roving tabindex). `Tab` no longer cycles between all tabs — use Arrow keys / Home / End to navigate within the tablist.
- **DropdownMenu**: `Tab` no longer cycles between menu items. Arrow keys navigate; `Tab` closes the menu (calls `onClose`).
- **Modal**: focus auto-moves into the dialog on open, returns to the trigger on close, and body scroll is locked while open. The scroll lock is stack-counter-aware so nested modals release the lock correctly.
- **Popover**: Escape now closes (was previously a no-op). Focus moves into the panel on open and is restored to the trigger on close.
- **Tooltip**: the trigger receives `aria-describedby` while the tooltip is open. Consumer-set `aria-describedby` values are preserved alongside the generated id. Tooltip now requires a single React element child (uses `Children.only`).
- **Accordion**: closed panels carry the native `hidden` attribute and are removed from the accessibility tree (previously visually clipped via `max-h-0` but still focusable / readable to AT).
- **Calendar**: only one cell is tabbable at a time (was ~42 stops). Arrow keys, PageUp/PageDown, Home/End, and Shift+PageUp/PageDown navigate.
- **DragDrop / KanbanBoard**: items are now `tabIndex=0` (Tab order changed). Semantic list roles are now applied (`role="list"` on the container, `role="listitem"` on items).
- **CommandPalette**: input role changed from `textbox` to `combobox`. Consumers querying by role need to update (`getByRole("combobox")`).
- **Sidebar (flat)**: items no longer carry `role="menuitem"`; they expose native anchor semantics as `role="link"`. Tests using `getByRole("menuitem")` should switch to `getByRole("link")`.
- **Toast**: `role` now defaults to `alert` for `intent="warning"` and `intent="error"` (was always `status`). The explicit `aria-live` attribute is dropped — the role-derived live region semantics take over. Active-button accent text uses `text-white` for AA contrast.
- **ChatBubble** (`me` author): Neon-era text now `text-era-primary` (was the dark `text-era-inverse`, which failed AA contrast under the Neon palette).
- **EraSwitch**: active button text now `text-white` for AA contrast under both eras. The secondary label dropped its explicit color override.
- **Badge**: variants now use solid tonal fills with Neon-era overrides (was translucent fills that failed contrast). The `animate-fade-in` class was removed from the variant base — see the Maintenance note below.

### Fixed

- **Switch**: thumb now correctly translates on toggle. Tailwind's `peer-checked:` was being applied to a non-sibling, so the thumb never moved.
- **Checkbox**: the checkmark now appears when checked. Same root cause as Switch.
- **Toast / Popover / Badge** entry animations: replaced opacity ramps with transform-only keyframes. axe was reporting false-positive `color-contrast` violations on mid-frame screenshots while the element was at partial opacity.
- **Calendar**: dropped `opacity-40` on muted padding cells (failed WCAG AA contrast). Muted cells now rely on color alone.
- ~110 axe a11y violations across the 232-story suite eliminated. The test-runner gate now reports 382/382 passing under the `serious|critical` threshold.
- 10 play-test failures repaired: implicit action args replaced with explicit `fn()` from `@storybook/test`; brittle keyboard assertions wrapped in `waitFor` for focus checks.

### Maintenance

- Convention: never use `opacity` ramps in entry animations. axe's mid-frame capture causes false-positive `color-contrast` flake; prefer transform-only keyframes (translate / scale).
- Convention: prefer `text-white` over `text-era-inverse` on `accent-600` backgrounds — `text-era-inverse` flips per era and fails Neon contrast.
- Convention: visual swatch elements that take an `aria-label` must also carry `role="img"` so axe treats them as labelable graphics.

### Wave 5b2 P1

P1 enhancement pass on top of the Wave 6b baseline. Adds first-class API where consumers were previously reaching through prop spreads, standardizes overflow/empty-state behavior across data-display surfaces, and wires `prefers-reduced-motion` into Storybook so reduce-mode behavior is verifiable from the toolbar. Unit tests grow from 571 → 609; the axe gate grows from 382 → 447 stories, all passing.

#### Added

- **Pagination#disabled** — top-level prop propagating native `disabled` to every page button and prev/next. Replaces the `<fieldset disabled>` workaround.
- **Stepper** — per-step `state?: 'default' | 'error' | 'completed'` (explicit override over the `current`-derived default) and `description?: ReactNode` slot. Error steps render a red circle, an inline `✕` glyph, visually-hidden "validation error" text, and `aria-invalid="true"`; completed steps render a check glyph. WCAG 1.4.1: never color-only.
- **PromptInput** — `label`, `error`, `helperText`, `maxLength`, `loading` (and `loadingLabel`/`id`/`wrapperClassName`) as first-class props. `useId` ties the rendered `<label>` to the textarea; `aria-invalid` and `aria-describedby` (joined with the maxLength counter id and any consumer-supplied describedby) are wired automatically. `error` short-circuits `helperText` (mirrors TextField). Loading renders a Spinner overlay and the textarea goes inert. `textareaProps` spread still works for escape-hatch cases — internal props win on key collisions.
- **AudioRecorder** — controlled `paused?: boolean` separate from `recording`, plus `onPause` / `onResume` callbacks and a 3-state surface (recording / paused / stopped). All four transitions (start / pause / resume / stop) announce through a `role="status" aria-live="polite"` region; default messages are Korean (`녹음 시작` / `녹음 일시정지` / `녹음 재개` / `녹음 정지`) and overridable via `startedAnnouncement` / `pausedAnnouncement` / `resumedAnnouncement` / `stoppedAnnouncement` props.
- **SidebarShell#aria-label** — explicit prop in the public type. Default fallback `"Sidebar navigation"` preserved; consumers can now pass localized labels (e.g. `aria-label="관리자 메뉴"`) without spreading through HTMLAttributes.
- **DataTable / KanbanBoard / PageTree** — `emptyState?: ReactNode` slot prop on each. Defaults render the existing `EmptyState` component. DataTable renders the empty state in a single full-width `<td colSpan={columns.length}>`; KanbanBoard adds a board-level empty (per-column empty unchanged); PageTree's empty branch deliberately omits `role="tree"` to avoid `aria-required-children`.
- **Breadcrumb#maxItems** — collapses middle segments to `…` when crumb count exceeds the limit.
- **Storybook `motion` global** — `auto | reduce` toolbar toggle keyed off `<html data-motion="reduce">`. The decorator injects a stylesheet clamping `animation-duration` / `transition-duration` / delays to near-zero values matching the WCAG-recommended `prefers-reduced-motion: reduce` pattern.
- **Foundations / Patterns** — `stories/Patterns/EmptyStates.mdx` documenting the Empty / Loading / Error pattern with cross-component examples.
- **Long-text stories** — `LongText` stories added to Tag, Badge, Breadcrumb, Tabs, Tooltip, Pagination demonstrating the truncate / wrap behavior.
- **Story consistency (B-mass)** — 25 pre-Wave-1 component stories audited against the Story Checklist: argType builders from `_shared/argTypes.ts`, `satisfies Meta<typeof X>`, 1–3 sentence component docs, dedicated `EraCompare` story via `bothEras`, Interactive story with explicit `args: { onX: fn() }`, full variant transitivity coverage, and a `forwardRef` demo for ref-accepting components.
- **Reduced-motion regression test** — `src/__tests__/reduced-motion.test.tsx` asserts that representative animated components carry the `motion-safe:` prefix on their animation/transition classes.

#### Changed

- **Button#primary** — text color is now `text-white` (was `text-era-inverse`, which flipped to `#0b0e18` under Neon and failed AA contrast on `accent-600`). Codifies CLAUDE.md convention #2.
- **Alert** — intent title colors are now era-aware. Info uses `text-[rgb(var(--era-accent-strong))]`; success / warning / error get `[[data-era=neon]_&]:text-{intent}-300` overrides. Heritage rendering is unchanged.
- **Avatar** — initials use `text-[rgb(var(--era-accent-strong))]` (was `text-accent-700`, which failed AA contrast on the Neon-era `bg-era-sunken`).
- **Tag / Badge** — chips now `max-w-[16rem] truncate`. Tag exposes a `tagLabel` style export for the inner label; Badge applies `truncate` to the chip outer and `shrink-0` to the dot so the dot stays visible.
- **Breadcrumb / Tabs / Tooltip / Pagination** — overflow handling standardized: per-segment `inline-block max-w-[12rem] truncate` (Breadcrumb), `max-w-[10rem] truncate` (Tabs), `whitespace-normal max-w-[16rem]` (Tooltip — replaces `whitespace-nowrap`), `min-w-[2.25rem] tabular-nums` (Pagination digit cells).
- **AudioRecorder focus ring** — migrated from hardcoded `rgb(255,82,104)` to `[rgb(var(--era-accent-strong))]` so it adapts across Heritage / Neon (Wave 5b2 convention #5).
- **`motion-safe:` audit** — added the prefix to animation / transition / hover-transform classes that were missing it across Accordion, AudioRecorder, Badge, Button (loading spinner), DragDrop, IconPicker, KanbanBoard, LoadingDots, Modal, PageTree, PatternBackground, Progress, Sidebar, Skeleton, Spinner, Switch, SyncStatus, Tag.

### Wave 5b2 C2

RTL (right-to-left) verification pass. Audited the eight components called out as direction-sensitive — Sidebar / SidebarShell, Pagination, Stepper, Breadcrumb, PageTree, DropdownMenu, DragDrop, KanbanBoard — and confirmed they all flip correctly under `dir="rtl"` via existing logical-property utilities, scaled chevrons, natural flex flips, and the `useDir` hook on PageTree / KanbanBoard. Polished the remaining physical utilities on adjacent primitives so a Storybook RTL toggle no longer leaks visual asymmetry.

#### Added

- **`useDir` hook** — promoted from internal utility to public API. Exported from `@jyi/design-system` and `@jyi/design-system/react` for consumers who bind horizontal arrow keys and need to preserve logical inline-start / inline-end semantics under both directions.
- **`Patterns/RTL` MDX page** — canonical reference covering the three-rule verification policy (logical layout, mirrored directional glyphs, logical keyboard nav), `useDir` usage, per-component RTL status, and the authoring checklist for new components.

#### Changed

- **Alert / Toast intent bars** — `border-l-4` → `border-s-4` so the colored intent bar sits on the inline-start edge in both directions.
- **Separator (vertical, dashed variant)** — `border-l` → `border-s` for symmetric reasons.
- **ChatBubble** — `me`-authored meta text uses `text-end` (was `text-right`) so the timestamp tracks the bubble's inline-end corner in both directions; the bubble itself already used `self-end` so no further change was needed.
- **DataTable** — column `align` map now emits `text-start` / `text-end` (was `text-left` / `text-right`); the default `<th>` style uses `text-start`.
- **Accordion** — header uses `text-start`.
- **MarkdownEditor (split layout)** — preview-pane divider uses `md:border-s` (was `md:border-l`).
- **Select** — chevron positioned at `end-3` (was `right-3`); textarea reserves `pe-9` of padding for the chevron (was `pr-9`).

[Unreleased]: https://github.com/TerryJoo/oriental-design-system/compare/HEAD
