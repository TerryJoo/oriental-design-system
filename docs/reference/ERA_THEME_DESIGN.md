# 과거/현대 듀얼 테마 토큰 체계 설계안

> **대상 프로젝트**: `@jyiapp/design-system` → 동양적 보드게임 UI/UX 확장
> **핵심 원칙**: 기존 컴포넌트 수정 없이, **CSS 커스텀 프로퍼티 오버라이드만으로** 과거(Heritage) ↔ 현대(Neon) 시대감 전환
> **기존 자산 재활용**: `src/themes/` 내 토큰 슬롯 패턴, Tailwind preset, `tokens/*.ts` 구조

---

## 1. 설계 목표

| 번호 | 목표 | 이유 |
|---|---|---|
| G1 | **의미론적(semantic) 토큰 슬롯은 과거/현대가 동일** | Button, Card 등 45개 기존 컴포넌트를 고치지 않아도 동작 |
| G2 | **물리값(physical value)은 시대별로 다름** | 과거 = 지류·도자기·먹 / 현대 = 네온·글래스·홀로그램 |
| G3 | **시대 전환은 한 DOM 속성으로 제어** | `data-era="heritage" \| "neon"` |
| G4 | **부드러운 전환 (두 시대 모두)** | `transition` 지속시간·이징은 시대별로 다르게 |
| G5 | **질감(material)은 토큰화된 CSS 변수로 주입** | 나무결/한지/네온 그라데이션을 `background-image` 토큰으로 제공 |
| G6 | **애니메이션 세트 이중화** | 과거: 붓·종이·주름 / 현대: 글리치·펄스·스캔라인 |

---

## 2. 아키텍처 개요

```
┌──────────────────────────────────────────────────────────────┐
│  <html data-era="heritage">  또는  <html data-era="neon">     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  CSS Layer 1 · Era Material (질감/배경/패턴)           │  │
│  │  --material-surface, --material-pattern-*, --grain-*   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  CSS Layer 2 · Era Accent (색상 팔레트)                │  │
│  │  --accent-50 ... --accent-950  (기존 시스템 재사용)     │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  CSS Layer 3 · Era Motion (애니메이션 프리셋)          │  │
│  │  --ease-era, --dur-era-fast/slow                       │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │  CSS Layer 4 · Era Elevation (그림자·광택)             │  │
│  │  --shadow-elevated, --glow, --seal                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                              ↓                                │
│      기존 컴포넌트 (Button, Card …)는 변수만 읽음              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. 파일 구조 제안

```
src/
├── tokens/
│   ├── colors.ts           (기존)
│   ├── animations.ts       (기존)
│   ├── shadows.ts          (기존)
│   ├── gradients.ts        (기존)
│   └── era.ts              ★ NEW — 시대별 semantic 토큰 선언
├── themes/
│   ├── index.ts            (기존 토큰 슬롯)
│   └── era/                ★ NEW
│       ├── heritage.ts     — 과거(도자기·나무결·한지) 물리값
│       ├── neon.ts         — 현대(네온·글래스·홀로그램) 물리값
│       ├── applyEra.ts     — data-era 속성 전환 + 변수 주입
│       └── types.ts        — EraTheme, EraName
└── styles/
    └── eras/               ★ NEW
        ├── heritage.css    — 패턴·그레인 SVG data URL
        └── neon.css        — 네온 글로우·스캔라인 keyframes
```

---

## 4. `tokens/era.ts` — Semantic 슬롯 정의

시대가 달라져도 **슬롯 이름은 동일**. 컴포넌트는 이 슬롯만 바라보면 됨.

```ts
// src/tokens/era.ts
/**
 * Era-aware semantic tokens.
 * Heritage (과거) / Neon (현대) — both modes fill these slots with different values.
 * All values are CSS custom properties so runtime switching works without re-render.
 */
export const era = {
  // ── 표면 (Surface) ─────────────────────────────────────────
  surface: {
    base:    "var(--era-surface-base)",        // heritage: 한지 / neon: 글래스
    raised:  "var(--era-surface-raised)",      // heritage: 나무 명지 / neon: 밝은 글래스
    sunken:  "var(--era-surface-sunken)",      // heritage: 먹 얹힌 종이 / neon: 어두운 유리
    overlay: "var(--era-surface-overlay)",     // heritage: 흐린 묵 / neon: 블러 글래스
  },

  // ── 질감/패턴 (Material) ───────────────────────────────────
  material: {
    grain:     "var(--era-material-grain)",      // background-image, wood/noise
    pattern:   "var(--era-material-pattern)",    // background-image, 도자기 or 회로
    scanline:  "var(--era-material-scanline)",   // neon 전용, heritage에선 none
    inkwash:   "var(--era-material-inkwash)",    // heritage 전용 먹번짐 mask
  },

  // ── 글자/경계 (Text/Border) ────────────────────────────────
  ink: {
    primary:   "var(--era-ink-primary)",
    muted:     "var(--era-ink-muted)",
    inverse:   "var(--era-ink-inverse)",
  },
  edge: {
    soft:   "var(--era-edge-soft)",    // heritage: 짙은 갈색 획 / neon: 네온 1px
    hard:   "var(--era-edge-hard)",    // heritage: 묵선 / neon: 네온 2px glow
    seal:   "var(--era-edge-seal)",    // 낙관·도장 테두리 전용
  },

  // ── 엘리베이션/발광 (Elevation/Glow) ──────────────────────
  shadow: {
    card:      "var(--era-shadow-card)",     // heritage: 종이 두께 / neon: 네온 글로우
    modal:     "var(--era-shadow-modal)",
    tooltip:   "var(--era-shadow-tooltip)",
    pressed:   "var(--era-shadow-pressed)",
  },

  // ── 모션 (Motion) ──────────────────────────────────────────
  motion: {
    easeBrush:   "var(--era-ease-brush)",   // heritage: 붓 획 / neon: cubic-bezier(0.2, 0, 0, 1)
    easeCharge:  "var(--era-ease-charge)",  // 신호 충전감
    durFast:     "var(--era-dur-fast)",
    durNormal:   "var(--era-dur-normal)",
    durSlow:     "var(--era-dur-slow)",
  },

  // ── 상태 색 (Intent — 시대별 채도/명도만 다름) ─────────────
  intent: {
    accent:   "rgb(var(--accent-600))",    // 기존 --accent-* 그대로 재사용
    success:  "var(--era-intent-success)",
    warning:  "var(--era-intent-warning)",
    error:    "var(--era-intent-error)",
  },
} as const;

export type EraTokens = typeof era;
```

---

## 5. `themes/era/heritage.ts` — 과거 테마 물리값

```ts
import type { EraTheme } from "./types";

export const heritageEra: EraTheme = {
  name: "heritage",
  variables: {
    // Accent (기존 accent 토큰 슬롯 재사용) - 먹청·적토(terracotta)
    "--accent-50":  "252 245 236",
    "--accent-100": "243 224 199",
    "--accent-200": "230 196 158",
    "--accent-300": "211 164 122",
    "--accent-400": "192 133  92",
    "--accent-500": "167 106  68",
    "--accent-600": "138  80  48",   // 주 색 — 적토/구운 도자기
    "--accent-700": "108  61  36",
    "--accent-800":  "78  43  25",
    "--accent-900":  "54  30  17",
    "--accent-950":  "31  17  10",

    // Surface — 한지 느낌
    "--era-surface-base":    "#f6efe1",
    "--era-surface-raised":  "#fbf5e8",
    "--era-surface-sunken":  "#e7dcc4",
    "--era-surface-overlay": "rgba(44, 30, 17, 0.55)",

    // Material — SVG data-URL 로 주입 (styles/eras/heritage.css에서 정의)
    "--era-material-grain":    "var(--pattern-woodgrain)",
    "--era-material-pattern":  "var(--pattern-porcelain)",
    "--era-material-scanline": "none",
    "--era-material-inkwash":  "var(--mask-inkwash)",

    // Ink
    "--era-ink-primary": "#2b1d10",
    "--era-ink-muted":   "#6e5a3f",
    "--era-ink-inverse": "#fbf5e8",

    // Edge — 먹선
    "--era-edge-soft":  "1px solid rgba(43, 29, 16, 0.18)",
    "--era-edge-hard":  "1.5px solid rgba(43, 29, 16, 0.6)",
    "--era-edge-seal":  "2px solid #7a2d1a",

    // Shadow — 종이 그림자 (낮고 퍼짐)
    "--era-shadow-card":    "0 1px 0 rgba(78,56,30,0.12), 0 6px 18px -10px rgba(60,40,20,0.35)",
    "--era-shadow-modal":   "0 12px 40px -12px rgba(60,40,20,0.45)",
    "--era-shadow-tooltip": "0 2px 10px -2px rgba(60,40,20,0.3)",
    "--era-shadow-pressed": "inset 0 2px 6px rgba(60,40,20,0.25)",

    // Motion — 붓·종이 (느리고 부드럽게)
    "--era-ease-brush":  "cubic-bezier(0.22, 0.61, 0.36, 1)",
    "--era-ease-charge": "cubic-bezier(0.4, 0, 0.2, 1)",
    "--era-dur-fast":    "220ms",
    "--era-dur-normal":  "380ms",
    "--era-dur-slow":    "640ms",

    // Intent
    "--era-intent-success": "#4f7a3c",
    "--era-intent-warning": "#c88d2b",
    "--era-intent-error":   "#a3341f",
  },
};
```

---

## 6. `themes/era/neon.ts` — 현대 테마 물리값

```ts
import type { EraTheme } from "./types";

export const neonEra: EraTheme = {
  name: "neon",
  variables: {
    // Accent — 청화 네온 (cyan-violet)
    "--accent-50":  "240 246 255",
    "--accent-100": "214 230 255",
    "--accent-200": "175 208 255",
    "--accent-300": "125 178 255",
    "--accent-400":  "88 143 255",
    "--accent-500":  "70 114 255",
    "--accent-600":  "90  80 255",   // 주 색 — 전자 청람
    "--accent-700":  "68  60 220",
    "--accent-800":  "48  40 170",
    "--accent-900":  "28  22 110",
    "--accent-950":  "14  12  56",

    // Surface — 글래스/흑요석
    "--era-surface-base":    "#0b0e18",
    "--era-surface-raised":  "rgba(255,255,255,0.06)",  // glassmorphism
    "--era-surface-sunken":  "#06070d",
    "--era-surface-overlay": "rgba(4, 8, 22, 0.6)",

    // Material
    "--era-material-grain":    "none",
    "--era-material-pattern":  "var(--pattern-circuit)",
    "--era-material-scanline": "var(--pattern-scanline)",
    "--era-material-inkwash":  "none",

    // Ink
    "--era-ink-primary": "#e8ecff",
    "--era-ink-muted":   "rgba(232,236,255,0.55)",
    "--era-ink-inverse": "#0b0e18",

    // Edge — 네온 라인
    "--era-edge-soft":  "1px solid rgba(120,150,255,0.25)",
    "--era-edge-hard":  "1.5px solid rgba(120,150,255,0.7)",
    "--era-edge-seal":  "2px solid #58f7ff",

    // Shadow — 네온 글로우 + 외곽 반사
    "--era-shadow-card":    "0 0 0 1px rgba(120,150,255,0.25), 0 10px 30px -12px rgba(90,80,255,0.5)",
    "--era-shadow-modal":   "0 0 0 1px rgba(120,150,255,0.3), 0 30px 80px -20px rgba(90,80,255,0.6)",
    "--era-shadow-tooltip": "0 0 14px rgba(120,150,255,0.45)",
    "--era-shadow-pressed": "inset 0 0 14px rgba(90,80,255,0.4)",

    // Motion — 전자적(짧고 스냅)
    "--era-ease-brush":  "cubic-bezier(0.2, 0, 0, 1)",
    "--era-ease-charge": "cubic-bezier(0.5, 0, 0.1, 1)",
    "--era-dur-fast":    "120ms",
    "--era-dur-normal":  "220ms",
    "--era-dur-slow":    "360ms",

    // Intent
    "--era-intent-success": "#32e0a1",
    "--era-intent-warning": "#ffc044",
    "--era-intent-error":   "#ff5268",
  },
};
```

---

## 7. `themes/era/types.ts` + `applyEra.ts`

```ts
// types.ts
export type EraName = "heritage" | "neon";

export interface EraTheme {
  name: EraName;
  variables: Record<string, string>;
}
```

```ts
// applyEra.ts
import type { EraName, EraTheme } from "./types";
import { heritageEra } from "./heritage";
import { neonEra } from "./neon";

const registry: Record<EraName, EraTheme> = {
  heritage: heritageEra,
  neon: neonEra,
};

/**
 * Switch era on an element (usually documentElement).
 * Sets data-era attribute and applies CSS variables.
 * Existing accent token helpers remain compatible.
 */
export function applyEra(element: HTMLElement, name: EraName): void {
  const theme = registry[name];
  element.dataset.era = name;
  for (const [prop, value] of Object.entries(theme.variables)) {
    element.style.setProperty(prop, value);
  }
}
```

---

## 8. `styles/eras/heritage.css` — 질감 변수

SVG data-URL로 패턴을 주입 (외부 이미지 불필요 · 번들 단일 유지).

```css
:root[data-era="heritage"] {
  /* 나무결 — 수직 갈색 줄, 옅은 노이즈 */
  --pattern-woodgrain:
    repeating-linear-gradient(
      90deg,
      rgba(110, 72, 38, 0.10) 0px,
      rgba(110, 72, 38, 0.10) 1px,
      rgba(110, 72, 38, 0.00) 1px,
      rgba(110, 72, 38, 0.00) 5px
    ),
    radial-gradient(ellipse at 20% 30%, rgba(120,80,40,0.22), transparent 60%),
    radial-gradient(ellipse at 80% 70%, rgba(140,95,50,0.18), transparent 60%);

  /* 도자기 청화문 — 원형 당초문 SVG data URL */
  --pattern-porcelain: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='rgba(43,29,16,0.18)' stroke-width='1'><circle cx='60' cy='60' r='40'/><path d='M60 20 Q90 40 60 60 Q30 80 60 100'/><path d='M20 60 Q40 30 60 60 Q80 90 100 60'/></g></svg>");

  /* 먹번짐 mask */
  --mask-inkwash:
    radial-gradient(circle at 30% 20%, rgba(0,0,0,0.2), transparent 60%),
    radial-gradient(circle at 70% 80%, rgba(0,0,0,0.15), transparent 55%);
}
```

## 9. `styles/eras/neon.css`

```css
:root[data-era="neon"] {
  /* 회로 패턴 */
  --pattern-circuit: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><g fill='none' stroke='rgba(120,150,255,0.18)' stroke-width='0.6'><path d='M0 20 H30 V0 M50 0 V30 H80 M0 60 H30 V80 M50 80 V60 H80'/><circle cx='30' cy='20' r='2'/><circle cx='50' cy='60' r='2'/></g></svg>");

  /* 스캔라인 */
  --pattern-scanline:
    repeating-linear-gradient(
      0deg,
      rgba(120,150,255,0.04) 0px,
      rgba(120,150,255,0.04) 1px,
      transparent 1px,
      transparent 3px
    );
}

@keyframes neon-breath {
  0%, 100% { box-shadow: var(--era-shadow-card); }
  50%      { box-shadow: var(--era-shadow-card), 0 0 20px rgba(90,80,255,0.55); }
}
@keyframes heritage-ink-spread {
  0%   { opacity: 0; filter: blur(6px); }
  100% { opacity: 1; filter: blur(0); }
}
```

---

## 9.5. 타이포그래피 (Era-aware Fonts)

두 시대의 분위기는 **서체 선택**이 절반을 차지한다. 모든 선정 폰트는 **SIL OFL 1.1** 라이선스로 상업 이용 자유(폰트 자체의 재판매만 금지).

### Heritage (과거)

| 역할 | 폰트 | 근거 |
|---|---|---|
| Display (Korean 제목) | **Gowun Batang** (고운 바탕) | 가늘고 우아한 명조체. 도자기 라벨·비단 직물의 여백미와 호응 |
| Body (Korean 본문) | **Noto Serif KR** | 오랜 시간 읽어도 피로가 적은 본문용 명조. Adobe × Google 공동 |
| Latin 강조 | **Cormorant Garamond** | 르네상스 Garamond 재해석. 이탤릭이 수묵화 낙관의 서명처럼 작동 |

시스템 폴백: `"AppleMyungjo"` (macOS 기본 명조), `"Hoefler Text"`, `"Didot"`, `"Apple SD Gothic Neo"`.

### Neon (현대)

| 역할 | 폰트 | 근거 |
|---|---|---|
| Display / Latin | **Orbitron** | 기하학적 우주항공 스타일. 네온·회로 비주얼과 완벽 결속 |
| Body (Korean) | **IBM Plex Sans KR** | 명료한 IBM 시스템체. 전자 인터페이스와 자연스럽게 결합 |

시스템 폴백: `"Futura"`, `"Avenir Next Condensed"`, `"Helvetica Neue"`, `"Pretendard"`.

### 토큰 바인딩

```ts
// src/tokens/typography.ts 에 아래 기명(named) 스택 추가
export const fontFamilies = {
  heritageDisplay: [
    '"Gowun Batang"', '"Cormorant Garamond"',
    '"AppleMyungjo"', '"Hoefler Text"', '"Didot"',
    '"Apple SD Gothic Neo"', '"Malgun Gothic"', 'serif',
  ],
  heritageBody: [
    '"Noto Serif KR"', '"Gowun Batang"',
    '"AppleMyungjo"', '"Hoefler Text"', '"Georgia"',
    '"Apple SD Gothic Neo"', 'serif',
  ],
  heritageLatin: [
    '"Cormorant Garamond"', '"Hoefler Text"', '"Didot"',
    '"Times New Roman"', 'serif',
  ],
  neonDisplay: [
    '"Orbitron"',
    '"Avenir Next Condensed"', '"Futura"', '"Helvetica Neue"', '"Arial Narrow"',
    '"Apple SD Gothic Neo"', '"Pretendard"', 'sans-serif',
  ],
  neonBody: [
    '"IBM Plex Sans KR"', '"Pretendard"',
    '"Apple SD Gothic Neo"', '"Helvetica Neue"', '"Inter"', '"SF Pro Text"',
    'sans-serif',
  ],
} as const;
```

### CSS 변수로 시대별 스와프

```css
:root[data-era="heritage"] {
  --font-display: /* heritageDisplay stack */;
  --font-body:    /* heritageBody stack */;
  --font-accent:  /* heritageLatin stack */;
  --display-letter-spacing: -0.01em;
  --body-line-height: 1.7;
  --ui-text-transform: none;
}
:root[data-era="neon"] {
  --font-display: /* neonDisplay stack */;
  --font-body:    /* neonBody stack */;
  --font-accent:  /* neonDisplay stack */;
  --display-letter-spacing: 0.08em;
  --body-line-height: 1.55;
  --ui-text-transform: uppercase;
}
```

### 폰트 파일 전달 방식 권장

1. **프로덕션**: `@fontsource/gowun-batang`, `@fontsource/noto-serif-kr`, `@fontsource/cormorant-garamond`, `@fontsource/orbitron`, `@fontsource/ibm-plex-sans-kr` npm 패키지로 자체 번들(서비스 워커 캐시 가능, 개인정보 이슈 없음)
2. **개발/스토리북**: Google Fonts `<link>` 직접 사용
3. **한글 서브셋**: Noto Serif KR, IBM Plex Sans KR, Gowun Batang은 한글 fi가 커서(2~5MB) unicode-range subsetting 필수 — fontsource가 자동 처리

---

## 10. Tailwind Preset 확장

`tailwind.preset.js`에 era 토큰 브릿지 추가 — 유틸 클래스 `bg-era-base`, `shadow-era-card`, `border-era-hard`, `animate-ink-spread` 등 사용 가능.

```js
theme: {
  extend: {
    backgroundColor: {
      "era-base":    "var(--era-surface-base)",
      "era-raised":  "var(--era-surface-raised)",
      "era-sunken":  "var(--era-surface-sunken)",
    },
    backgroundImage: {
      "era-grain":    "var(--era-material-grain)",
      "era-pattern":  "var(--era-material-pattern)",
      "era-scanline": "var(--era-material-scanline)",
    },
    textColor: {
      "era-primary": "var(--era-ink-primary)",
      "era-muted":   "var(--era-ink-muted)",
    },
    boxShadow: {
      "era-card":    "var(--era-shadow-card)",
      "era-modal":   "var(--era-shadow-modal)",
      "era-tooltip": "var(--era-shadow-tooltip)",
    },
    transitionDuration: {
      "era-fast":   "var(--era-dur-fast)",
      "era":        "var(--era-dur-normal)",
      "era-slow":   "var(--era-dur-slow)",
    },
    transitionTimingFunction: {
      "era-brush":  "var(--era-ease-brush)",
      "era-charge": "var(--era-ease-charge)",
    },
    animation: {
      "ink-spread":  "heritage-ink-spread 640ms cubic-bezier(0.22, 0.61, 0.36, 1)",
      "neon-breath": "neon-breath 2.4s ease-in-out infinite",
    },
  }
}
```

---

## 11. 기존 45개 컴포넌트의 영향도

| 영향 | 컴포넌트 예시 | 대응 |
|---|---|---|
| **0 — 변경 없이 동작** | Button, Card, Badge, Modal, Popover, Tooltip, Alert, Toast, Tabs, Accordion, Avatar, Tag, Checkbox, Switch, Radio, Input, Select, TextField, Stack, Separator, Progress, Skeleton | 이미 `--accent-*` / `bg-background` / `text-text-primary` 계열 사용. Preset에서 `background/text/border`를 `var(--era-*)`로 치환하거나, 테마 CSS에서 기본 semantic 토큰을 era 변수로 매핑하면 자동 반영 |
| **1 — 스타일 파일에 era 유틸 1~2개 추가** | Calendar(턴판), Stepper(페이즈), KanbanBoard(패 이동) | `.styles.ts`에 `shadow-era-card`, `bg-era-pattern` 추가 |
| **2 — 새 variant 추가 권장** | Card에 `variant="scroll" \| "glass"` | 과거 = 두루마리, 현대 = 글래스. 기본 동작은 유지 |
| **N — 신규 컴포넌트** | PatternBackground, Frame, SealStamp, EraSwitch, DiceRoll, ScrollReveal | 시대별로 다른 렌더링 분기 가능 |

---

## 12. 접근성/사용성 가드레일

- `prefers-reduced-motion: reduce` 시 `--era-dur-*` 전체를 0ms로 덮어쓰는 미디어 쿼리 제공
- 과거/현대 모두 대비(contrast) 4.5:1 이상 유지 (네온 다크모드 특성상 `--era-ink-primary` 재검토 권장)
- 배경 패턴은 `background-size`를 두 시대 모두 `contain/80px` 이하로 제한해 텍스트 가독성 보호
- era 전환 시 `view-transition-name` 활용한 부드러운 crossfade 옵션 제공 (보드게임 시점 전환 연출)

---

## 13. 도입 단계 (Phased Rollout)

1. **Step A** — `tokens/era.ts`, `themes/era/*` 파일 추가 (기존 코드 영향 0)
2. **Step B** — `tailwind.preset.js`에 era 유틸 추가
3. **Step C** — `EraSwitch` + `PatternBackground` 신규 컴포넌트 2개 구현 → 데모 스토리
4. **Step D** — Card/Button 등 주요 컴포넌트에 `variant="scroll"`, `variant="glass"` 선택적 추가
5. **Step E** — `DiceRoll`, `CardDraw`, `TokenPile`, `SealStamp` 등 보드게임 코어 컴포넌트 추가

---

## 14. 공개 API 미리보기

```ts
import { applyEra } from "@jyiapp/design-system";

// 초기 부팅
applyEra(document.documentElement, "heritage");

// 설정 메뉴에서 시대 토글
applyEra(document.documentElement, "neon");
```

```tsx
// 선언적 사용
<EraSwitch defaultEra="heritage">
  <PatternBackground variant="porcelain" /> {/* heritage일 때만 렌더링 */}
  <PatternBackground variant="circuit" />   {/* neon일 때만 렌더링 */}
  <Card>…</Card>
</EraSwitch>
```

---

**요약**: 기존 accent 토큰 슬롯 패턴을 그대로 수평 확장하여 **시대(Era)** 레이어를 추가. 45개 기존 컴포넌트는 손대지 않고도 두 시대의 시각/모션 언어를 획득하며, 신규 보드게임 전용 컴포넌트는 같은 토큰 체계 위에 선택적으로 얹힘.
