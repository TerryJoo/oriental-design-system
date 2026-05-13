# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview

`oriental-design-system` — React + Tailwind design system with **Heritage/Neon dual-era theming**. Built on an oriental palette rooted in 오방색 (obangsaek). Published style functions, tokens, and an `applyEra()` runtime switcher.

## Commands

```bash
npm run dev              # Storybook on localhost:6006
npm run build            # tsup library build
npm run build:storybook
npm test                 # Vitest
npm run test:watch
npm run test:coverage    # 80% threshold
npm run typecheck        # tsc --noEmit
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

Run a single test: `npx vitest run src/components/Button/Button.test.tsx`

## Architecture

### Three Entry Points (tsup)

| Entry          | Path                      | Contents                                  | React Required |
| -------------- | ------------------------- | ----------------------------------------- | -------------- |
| `src/index.ts` | `@jyi/design-system` | Everything                                | Yes            |
| `src/core.ts`  | `.../core`                | Tokens, style functions, `cn`, era system | No             |
| `src/react.ts` | `.../react`               | React components only                     | Yes            |

Also: `tailwind.preset.ts` → `.../tailwind-preset` (CJS + ESM), `src/styles/globals.css` → `.../styles`, `src/styles/eras/*.css` → `.../styles/eras/{heritage,neon}`.

### Component File Structure (mandatory)

```
src/components/ComponentName/
├── ComponentName.tsx          # forwardRef + displayName
├── ComponentName.styles.ts    # variant/size types, style map, style function (uses cn)
├── ComponentName.test.tsx     # Vitest + @testing-library/react
└── index.ts                   # Named exports only
```

**Style separation**: all Tailwind class logic lives in `.styles.ts`. Component TSX composes via the exported style function. Core entry re-exports these style functions so non-React consumers can generate classes without React.

### Adding a New Component

1. Create `src/components/ComponentName/` with the four files above
2. Export from `src/components/index.ts`
3. If style functions are framework-agnostic, also export from `src/core.ts`
4. Add a story in `stories/ComponentName.stories.tsx`

#### Story checklist

A self-review checklist for any new (or edited) story file. Copy `stories/_shared/STORY_TEMPLATE.tsx` as your starting point — it bakes in everything below.

- [ ] File exists at `stories/<Component>.stories.tsx` (one file per component)
- [ ] CSF3 typing: `const meta = { ... } satisfies Meta<typeof Component>` + `export default meta;` + `type Story = StoryObj<typeof meta>;`
- [ ] `tags: ['autodocs']` is present (the global `autodocs` default in `preview.ts` already includes every story; the explicit tag keeps intent local and survives any future preview-level opt-out)
- [ ] `parameters: { docs: { description: { component: '...' } } }` includes a 1–3 sentence component description
- [ ] argTypes use shared builders from `stories/_shared/argTypes.ts` (`selectArg`, `radioArg`, `boolArg`, `sizeArg`, `commonStateArgs`) — no hand-rolled `{ control: 'select', options: [...] }` literals
- [ ] Stories cover: `Default`, all visual variants, all sizes/shapes (if applicable), state stories (`Disabled`/`Loading`/error if applicable), `EraCompare` (using `bothEras`), `Interactive` with a play function
- [ ] Action args (callbacks like `onChange`, `onClick`) used inside play functions are declared via `args: { onX: fn() }` (using `fn` from `@storybook/test`) — NEVER rely on `argTypesRegex` implicit action arg (Storybook 8 test-runner rejects this)
- [ ] Title: `'Components/<ComponentName>'`
- [ ] Story export names: PascalCase
- [ ] Tokens-first: NO hex (`#xxxxxx`), NO `rem` literals — use Tailwind preset utilities + era-aware classes
- [ ] No `forceEra` outside dedicated comparison stories — rely on the global Era toolbar
- [ ] Use `bothEras` only for the explicit `EraCompare` story (not within other stories)
- [ ] Visual swatches/decorative elements that take `aria-label` use `role="img"` (avoid axe `aria-prohibited-attr`)
- [ ] Interactive play functions exercise behavior the component actually supports — don't assert against unimplemented features

### Design Tokens

`src/tokens/` — colors, typography, spacing, animations, shadows, gradients, zIndex, textStyles, **era**. When adding tokens, also update `tailwind.preset.ts` to keep the preset in sync.

- Primary palette: warm terracotta (`#8A5030`, accent-600 default)
- Oriental palette: celadon, indigo, gold, jade, coral
- Fonts: Pretendard (sans default), Noto Serif KR (serif), JetBrains Mono (mono), plus era-specific stacks (Gowun Batang, Orbitron, IBM Plex Sans KR, Cormorant Garamond)

### Era Theme System

Era (`heritage` | `neon`) is the single runtime theme switcher. Set via `applyEra(document.documentElement, "heritage")` or the `[data-era]` attribute. All era-aware values flow through CSS custom properties — components read semantic slots like `--era-surface-base`, `--era-shadow-card`, `--font-display`, so switching eras never causes React re-renders. The `--accent-*` ramp lives directly on `:root` (oriental terracotta) and is not user-swappable.

Era file layout:

```
src/themes/era/
├── types.ts           # EraName, EraTheme
├── heritage.ts        # Heritage physical values
├── neon.ts            # Neon physical values
└── applyEra.ts        # Registry + applyEra()

src/styles/eras/
├── heritage.css       # SVG patterns (woodgrain, porcelain, inkwash)
└── neon.css           # SVG patterns (circuit, scanline)
```

### Path Alias

`@/` → `src/` (tsconfig, vitest, storybook main).

## Key Conventions

- **Tokens first** — reach for `src/tokens/` and tailwind preset tokens before hardcoding any color, shadow, radius, duration, or font size. If no matching token exists, ask the user whether to (1) add a token or (2) hardcode — never silently hardcode.
- **Era-aware where appropriate** — use `bg-era-base`, `text-era-primary`, `shadow-era-card`, `duration-era`, `ease-era-brush` for components that should adapt to the era layer. Keep components readable under both eras.
- **All components** — `forwardRef` + `displayName`
- **`cn()` only** — never concat class strings manually
- **Props extend native HTML attributes** (e.g., `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`)
- **Named exports only** — no default exports
- **ESM-only** library output; tailwind preset also ships CJS
- **`react`/`react-dom` are optional peer deps** — the `core` entry point works without them

## Conventions Discovered (Wave 5b2)

Project-wide rules surfaced reactively by axe failures during the Wave 5b2 a11y pass and codified here to prevent recurrence. All examples reference real call sites in this repo.

1. **No opacity ramps in entry animations** — axe captures mid-frame and reports false-positive color-contrast when a node animates from `opacity: 0`. Use transform-only keyframes (`scale`, `translate`) wrapped in `motion-safe:` so reduced-motion users skip them entirely. Canonical example: `popoverEnterKeyframes` in `Popover.tsx`.
2. **`text-white` over `text-era-inverse` on `accent-600` backgrounds** — `text-era-inverse` resolves to dark `#0b0e18` in Neon era and fails WCAG AA against `accent-600`. Use plain `text-white` for active states, or scope per era via `[[data-era=neon]_&]:text-white`.
3. **`role="img"` on visual swatches that carry `aria-label`** — a bare `<span>` / `<div>` has the implicit generic role and cannot host `aria-label` per axe `aria-prohibited-attr`. Add `role="img"` whenever a decorative preview block is being labelled for assistive tech.
4. **Era-aware overrides via `[[data-era=neon]_&]:`** — when an era's tonal direction inverts (e.g., text needs to be light on Neon's dark surface but dark on Heritage's light surface), apply the override at the leaf class level using the arbitrary variant. Canonical patterns: `Tag.styles.ts`, `ChatBubble.styles.ts`, `Sidebar.styles.ts`.
5. **`--era-accent-strong` for active text on neutral backgrounds** — Heritage maps to `accent-700` (warm dark); Neon maps to `accent-300` (light blue, ~8.96:1 contrast on `#0b0e18`). Defined in `src/themes/era/heritage.ts` and `src/themes/era/neon.ts` and registered in the era CSS files. Read it via `text-[rgb(var(--era-accent-strong))]`. Canonical consumers: `Tabs`, `SidebarShell`.
6. **`waitFor` for transition-settled state in play functions** — components with `transition-colors duration-era` (~380ms) can leak mid-flight pixels into axe sampling, producing phantom contrast failures. Wrap focus/contrast assertions in `waitFor(() => expect(elem).to...)` after a click or keyboard interaction. Canonical patterns: `stories/Sidebar.stories.tsx` (Interactive) and `stories/Calendar.stories.tsx` (Interactive).
7. **Live region announcements for keyboard reorder** — when adding keyboard alternatives to drag-and-drop, include a `role="status" aria-live="polite"` (or `assertive` when failure is meaningful) region that announces grab/move/drop/cancel events. Canonical examples: `DragDrop.tsx`, `KanbanBoard.tsx`.
8. **Action args in play functions** — Storybook 8's test-runner rejects implicit action args inferred from `parameters.actions.argTypesRegex`. Always declare `args: { onChange: fn() }` (using `fn` from `@storybook/test`) for any callback consumed inside a play function.

## Pre-Push Checks

Before committing or pushing, run **all four**:

```bash
npm run format           # Prettier write
npm run lint:fix         # ESLint --fix
npm run typecheck
npm test
```

Recommended whenever a change touches styles, components, or stories — the a11y regression gate:

```bash
npm run test-storybook:ci    # axe regression gate (382 stories must pass)
```

This script builds Storybook, serves the static bundle on `127.0.0.1:6006`, runs `@storybook/test-runner` with `axe-playwright`, and fails on any WCAG 2.1 AA `serious` or `critical` violation. The four traditional checks above remain mandatory; the storybook gate is the final stop before any visual or behavioral change lands.

## Testing Patterns

- **Framework**: Vitest + happy-dom
- **Libraries**: `@testing-library/react`, `@testing-library/jest-dom`
- **Globals enabled** — no need to import `describe`, `it`, `expect`
- **Test groups**: Rendering / Variants / Sizes / Shapes / States / Events / Accessibility / HTML attributes
- **Query priority**: by role → by text → by testid
- **Style assertions**: import variant/size maps from `.styles.ts` and iterate — do NOT hardcode class strings that duplicate the style map
- **80% coverage threshold** enforced via `vitest --coverage`

## Reference Material

The originating design system lives at `/Users/yungikjoo/jyi/00_jyiprojects/web-design-system/` (45 components, identical file pattern). Era theme architecture specification: `docs/reference/ERA_THEME_DESIGN.md`. Visual prototype: `docs/reference/oriental-prototype.html`.
