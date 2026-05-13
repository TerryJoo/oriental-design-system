# Fonts

How `@jyi/design-system` ships fonts, why we self-bundle, and how to preload.

## Why self-bundle via `@fontsource/*`

- **Privacy** — no third-party CDN beacons (Google Fonts logs the consumer IP).
- **Offline dev** — Storybook + tests work without internet.
- **Deterministic builds** — locked to the version in `package.json`, not a moving CDN.
- **No CDN flap** — eliminates first-paint regressions when the CDN is slow.

`src/styles/globals.css` `@import`s 21 unified weight CSS files (3 weights × 7 families, minus Gowun Batang's 700-only second weight).

## Era-default fonts

`applyEra()` rewrites `--font-display`, `--font-body`, `--font-accent` per era. The first family in each stack is the one that actually paints when the font is loaded:

| Slot             | Heritage default                             | Neon default                               |
| ---------------- | -------------------------------------------- | ------------------------------------------ |
| `--font-display` | **Gowun Batang** (`400`, `700`)              | **Orbitron** (`400`, `500`, `700`)         |
| `--font-body`    | **Noto Serif KR** (`400`, `500`, `700`)      | **IBM Plex Sans KR** (`400`, `500`, `700`) |
| `--font-accent`  | **Cormorant Garamond** (`400`, `500`, `700`) | Orbitron (shared with display)             |

Pretendard sits behind `body` as the era-agnostic UI sans baseline; it loads regardless of era.

## Recommended `<link rel="preload">` for consumer apps

Because Heritage and Neon use disjoint font sets, **preload only the active era's defaults** to avoid wasting bytes on the era the user is not seeing. Below is an example for a Heritage-default consumer; flip the file names for Neon.

```html
<!-- Heritage era preload (paste in <head> before any CSS that consumes the fonts) -->
<link
  rel="preload"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
  href="/_fonts/gowun-batang-korean-400-normal.woff2"
/>
<link
  rel="preload"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
  href="/_fonts/noto-serif-kr-korean-400-normal.woff2"
/>
<link
  rel="preload"
  as="font"
  type="font/woff2"
  crossorigin="anonymous"
  href="/_fonts/cormorant-garamond-latin-400-normal.woff2"
/>

<!-- Neon era — replace the three above with: -->
<!--
<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous"
      href="/_fonts/orbitron-latin-400-normal.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin="anonymous"
      href="/_fonts/ibm-plex-sans-kr-korean-400-normal.woff2">
-->
```

Resolve the URLs per your bundler — Vite copies `node_modules/@fontsource/<name>/files/*.woff2` into the build output; adjust the prefix accordingly.

## Subset switching

`@fontsource` ships unified weight CSS files **plus** per-script subset CSS files (`korean-400.css`, `latin-400.css`, ...). We deliberately import the **unified** files because their `unicode-range` declarations let browsers fetch only the codepoint chunks they actually need — the per-script subset shards ship monolithic Korean blobs (~500KB-1MB) without `unicode-range`, which would regress real-world payload.

Per-font subset coverage:

| Font                                         | Subsets on npm                       | Strategy                               |
| -------------------------------------------- | ------------------------------------ | -------------------------------------- |
| Noto Serif KR                                | korean, latin, latin-ext, cyrillic   | Unified (90+ unicode-range chunks)     |
| IBM Plex Sans KR                             | korean, latin, latin-ext             | Unified (94+ chunks)                   |
| Gowun Batang                                 | korean, latin, latin-ext, vietnamese | Unified (95+ chunks)                   |
| Pretendard                                   | **latin only** (no Korean on npm)    | Latin payload + system Korean fallback |
| Cormorant Garamond, Orbitron, JetBrains Mono | latin only                           | Unified (1-6 chunks, all small)        |

Pretendard's npm package contains no Korean glyph data; Korean text under `body { font-family: Pretendard, ... }` resolves to the next stack entry (`Apple SD Gothic Neo`, `Noto Sans KR`, `Malgun Gothic`). Consumers needing self-hosted Korean Pretendard should either ship the dynamic subset from the Pretendard project directly or use `@fontsource-variable/pretendard` for finer control.

## CDN fallback / opting out

Consumers who want a CDN or different fonts can override by importing `@jyi/design-system/styles` and then layering their own `@import url("https://fonts.googleapis.com/...")` after it. Cascade order matters — late imports win.
