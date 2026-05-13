# Wave 5b2 잔여 작업 계획

**범위**: Wave 5a/5b1 완료 + Wave 5b2-Top5/Round2/3/4 완료 + bothEras 패치 + Wave 6a/6b 완료 이후의 잔여 enhancement 작업.

**상태**: axe a11y 게이트 100% 통과 (382/382), 단위 테스트 571 통과. 본 계획은 **axe 게이트 외**의 P1·관행·횡단 갭을 정비하는 단계.

**전제 조건**:

- 모든 Wave 1-4 / 5a / 5b1 / 5b2-Top5~Round4 / 6a / 6b 완료
- `CLAUDE.md`의 8개 정착된 컨벤션(Wave 5b2 발견) 준수
- 기존 게이트(typecheck/lint/format/test/test-storybook:ci) 회귀 금지

---

## 📑 목차

- [Track A: P1 컴포넌트 Enhancement](#track-a-p1-컴포넌트-enhancement)
- [Track B: 기존 25개 스토리 일관성 (B-mass)](#track-b-기존-25개-스토리-일관성-b-mass)
- [Track C: Gap G1-G25 적용](#track-c-gap-g1-g25-적용)
- [Track D: 인프라 보강](#track-d-인프라-보강)
- [Track NEW: 본 계획 검토에서 추가 발견](#track-new-본-계획-검토에서-추가-발견)
- [우선순위 매트릭스](#우선순위-매트릭스)
- [권장 실행 시퀀스 (Waves)](#권장-실행-시퀀스-waves)
- [의존성 그래프](#의존성-그래프)
- [공통 Definition of Done](#공통-definition-of-done)
- [참조 자료](#참조-자료)

---

## Track A: P1 컴포넌트 Enhancement

axe 게이트는 통과하지만 사용성·API 완성도 측면에서 보강이 필요한 8개 컴포넌트.

### A1. Pagination — `disabled` prop 추가

| | |
|---|---|
| **Effort** | S (~3h) |
| **Risk** | 0.2 |
| **Priority** | 🟠 P1 |
| **현재 상태** | `disabled` prop 없음. 외부에서 `<fieldset disabled>`로 우회. |

**작업**:

- `PaginationProps`에 `disabled?: boolean` 추가
- `disabled=true` 시 모든 page button + prev/next 버튼에 `disabled` 속성 전파
- 시각적으로 비활성 상태 토큰 적용 (era-aware opacity + cursor-not-allowed)
- 기존 `<fieldset disabled>` 우회 패턴은 호환 유지 (둘 다 동작)

**수용 기준**:

- `<Pagination disabled />` 렌더링 시 모든 버튼이 native `disabled`
- a11y: 비활성 페이지에 클릭 시 `onChange` 호출 안 됨
- Disabled 스토리에서 `<fieldset>` 우회 제거하고 새 prop 사용
- 단위 테스트 +2 (disabled 동작, onChange 차단)

---

### A2. Stepper — 에러 상태 시맨틱

| | |
|---|---|
| **Effort** | M (~6h) |
| **Risk** | 0.4 |
| **Priority** | 🟠 P1 |
| **현재 상태** | `step.label`만 받음. error 상태 표현 불가 (스토리에서 inline `<span role="img">` 우회) |

**작업**:

- `StepperItem`에 `state?: 'default' | 'error' | 'completed'` 추가 (이미 `current` 기반 자동, 명시적 override 가능하게)
- 에러 step의 circle: 빨간 배경 + `aria-invalid="true"` + 시각 hidden 텍스트("validation error")
- 에러 step description 슬롯 추가 (`step.description?: ReactNode`)
- WCAG 1.4.1: 색만이 아닌 아이콘(❌) + 텍스트 동반

**수용 기준**:

- 에러 step이 색맹 사용자에게도 식별 가능 (아이콘 + 텍스트)
- screen reader에서 에러 step 진입 시 "step N, validation error, {description}" 안내
- 단위 테스트 +3 (default/error/completed state)

---

### A3. PromptInput — 라벨/에러/maxLength 1차 prop화

| | |
|---|---|
| **Effort** | M (~5h) |
| **Risk** | 0.5 |
| **Priority** | 🟠 P1 |
| **현재 상태** | 모든 부가 기능을 `textareaProps` 스프레드로 우회. `aria-label` 자동 연결도 부재. |

**작업**:

- `label?: ReactNode` prop 추가 (TextField 패턴 차용 — `useId` + `<label htmlFor>`)
- `error?: ReactNode` + `aria-invalid` + 빨간 ring 시각 표시
- `helperText?: ReactNode` (error와 상호배타 또는 동시 표시 결정 — TextField 정책 확인)
- `maxLength?: number` + 글자수 표시 + `aria-describedby` 연결
- `loading?: boolean` (현재 disabled로 우회)
- 기존 `textareaProps`는 호환 유지 (consumer가 명시적으로 spread 가능)

**수용 기준**:

- 라벨 미지정 시 axe `label` rule 회귀 없음 (`aria-label` 폴백 또는 명시 요구)
- error 상태에서 `aria-invalid="true"` + `aria-describedby={errorId}` 자동 연결
- 단위 테스트 +5

---

### A4. AudioRecorder — pause/resume + focus ring era-aware

| | |
|---|---|
| **Effort** | M (~5h) |
| **Risk** | 0.5 |
| **Priority** | 🟠 P1 |
| **현재 상태** | 단일 recording toggle만. focus ring `rgb(255,82,104)` 하드코딩 (era-static). |

**작업**:

- `paused?: boolean` state 분리 (현재 controlled `recording`과 별도)
- `onPause?: () => void`, `onResume?: () => void` callback
- 시각: 녹음(빨강) / 일시정지(노랑) / 정지(grey) 3-state 아이콘 토글
- focus ring `rgb(255,82,104)` → `[rgb(var(--era-accent-strong))]`로 era-aware
- 일시정지 announcement live region (Wave 5b2 정착된 패턴)

**수용 기준**:

- 녹음 → 일시정지 → 재개 → 정지 4단계 state 전이 가능
- focus ring이 Heritage·Neon 양쪽에서 era 전환 시 즉시 변경
- 단위 테스트 +4

---

### A5. SidebarShell — `aria-label` prop화

| | |
|---|---|
| **Effort** | XS (~1h) |
| **Risk** | 0.1 |
| **Priority** | 🟠 P1 |
| **현재 상태** | 하드코딩 `"Sidebar navigation"`. 한국어/다국어 환경에서 변경 불가. |

**작업**:

- `SidebarShellProps['aria-label']` 명시적 prop 노출 (HTMLAttributes spread로 동작하지만 문서화 안 됨)
- 디폴트는 `"사이드 메뉴"` 또는 `"Sidebar navigation"` (현재와 호환 유지)
- 자식 hook (`useSidebarShellContext`)에서도 활용 가능 여부 검토

**수용 기준**:

- `<SidebarShell aria-label="관리자 메뉴" />` 정상 동작 + 디폴트 fallback
- 단위 테스트 +1

---

### A6. MarkdownEditor — `aria-pressed` 토글 + top-level disabled

| | |
|---|---|
| **Effort** | L (~10h) ⚠️ |
| **Risk** | 0.6 |
| **Priority** | 🟡 P2 (분리 권장 — selection-state 추적은 큰 작업) |
| **현재 상태** | toolbar 버튼 `aria-pressed` 없음 (현재 어떤 서식이 활성인지 불가시). top-level `disabled` prop 부재. |

**작업** (분할 권장):

**A6a** (S, ~2h): top-level `disabled` prop만 — 현재 `textareaProps={{disabled:true}}` 우회 → 직접 prop. toolbar 버튼도 함께 비활성.

**A6b** (L, ~8h): selection-aware `aria-pressed`:

- `useSelectionContext` hook 도입 — textarea selection을 markdown syntax 매칭
- 예: 선택 영역이 `**...**` 안이면 Bold 버튼 `aria-pressed=true`
- 모든 toolbar action에 detection 로직 (Bold/Italic/H1/H2/List/Quote/Code)
- selection 변경 시 debounce(50ms)로 re-eval

**수용 기준**:

- A6a: `<MarkdownEditor disabled />` 시 textarea + toolbar 모두 비활성. 단위 테스트 +2
- A6b: 단위 테스트 +8 (action별 selection 매칭). 보류 권장.

---

### A7. Calendar — disabledDate / minDate / maxDate / locale

| | |
|---|---|
| **Effort** | L (~12h) ⚠️ |
| **Risk** | 0.7 |
| **Priority** | 🟡 P2 (의존성 결정 필요) |
| **현재 상태** | `disabled` 속성 정의만 존재, 활용 안 됨. `min`/`max` 강제 없음. locale 부재. user-land 우회 가능. |

**선결정**: date library 도입 여부

- **Option 1 (권장)**: 의존성 추가 없이 내장 Date API로 구현 (현재 패턴 유지)
- **Option 2**: `date-fns` 도입 (3kb tree-shakable) — locale + range 지원 강력
- **Option 3**: `Intl.DateTimeFormat` (폴리필 없음, 모던 브라우저 OK) + 자체 range 로직

**작업**:

- `disabledDate?: (iso: string) => boolean` predicate
- `minDate?: string`, `maxDate?: string` (ISO yyyy-mm-dd)
- 키보드 navigation에서 disabled cell skip
- `aria-disabled="true"` on disabled cells
- `weekStartsOn?: 0 | 1` (일요일/월요일)
- `locale?: string` + 월 헤더 i18n (`Intl.DateTimeFormat` 활용 시 무료)

**수용 기준**:

- 단위 테스트 +10 (각 prop)
- 키보드 nav에서 disabled date skip 검증

---

### A8. 공통 i18n 인프라 (Track 분리 권장)

| | |
|---|---|
| **Effort** | XL (~20h+) ⚠️ |
| **Risk** | 0.7 |
| **Priority** | 🟡 P2 (별도 워크스트림) |
| **현재 상태** | 한글 하드코딩 다수 — Pagination "이전"/"다음", Modal "Modal" 디폴트, EraSwitch "메뉴 여닫기", Sidebar "사이드 메뉴", AudioRecorder "녹음 시작/정지", DragDrop announcement, KanbanBoard announcement 등. |

**작업**: 이건 자체 Wave가 되어야 할 규모. 별도 계획 권장.

- `useI18n()` hook + locale provider
- 메시지 카탈로그 (ko/en 최소)
- 컴포넌트별 i18n key 추출
- React 19 Server Components 호환 고려

**Wave 5b2에서는 보류 — 추후 Wave 7로 분리**.

---

## Track B: 기존 25개 스토리 일관성 (B-mass)

대상: Wave 1 직전 시점에 이미 존재했던 25개 컴포넌트 스토리.

**Alert · Avatar · Badge · Button · Card · Checkbox · CoverImage · EmptyState · EraSwitch · Filter · IconPicker · Input · LoadingDots · PatternBackground · Progress · Radio · Select · Skeleton · Spinner · Switch · SyncStatus · Tag · TextField · Toast · Typography**

### 점검 매트릭스 (각 스토리당 7항목)

| # | 점검 | Definition of Done |
|---|---|---|
| **B-1** | argTypes 빌더 | `selectArg`/`radioArg`/`boolArg`/`sizeArg`/`commonStateArgs` 사용. 인라인 `{control:'select', options:[...]}` 0건 |
| **B-2** | CSF3 satisfies | `const meta = {...} satisfies Meta<typeof X>`. `as Meta` 캐스트 0건 |
| **B-3** | docs description | `parameters.docs.description.component` 1-3문장 |
| **B-4** | EraCompare 스토리 | `bothEras`로 H/N 사이드바이사이드. 부재 시 추가 |
| **B-5** | Interactive + play | play function 부재 시 추가. action arg `fn()` 명시 |
| **B-6** | variant 전수 | `.styles.ts`의 enum 모두 별도 또는 콤보 스토리에서 노출 |
| **B-7** | forwardRef demo | 필요 시 1개 ref 스토리 (Avatar/Card/Input/TextField 등 ref 자주 쓰는 컴포넌트) |

**총 점검**: 25 컴포넌트 × 7항목 = **175 cell**.

### 실행 전략 (B-mass)

5-6 frontend-architect 에이전트 병렬 dispatch, 각 4-5 컴포넌트 책임:

- Agent B1: Alert, Avatar, Badge, Button, Card
- Agent B2: Checkbox, CoverImage, EmptyState, EraSwitch, Filter
- Agent B3: IconPicker, Input, LoadingDots, PatternBackground, Progress
- Agent B4: Radio, Select, Skeleton, Spinner, Switch
- Agent B5: SyncStatus, Tag, TextField, Toast, Typography

각 에이전트는:

1. 5개 스토리를 본문 점검표 7항목으로 audit
2. 부족한 항목 보강
3. 단위 테스트가 기존에 비해 회귀 없도록 유지
4. 게이트 통과 (typecheck/lint/format/test/test-storybook:ci)

**예상 작업량**: ~1.5 영업일 (병렬 실행 기준)

**수용 기준**:

- 25 스토리 모두 7항목 PASS
- `_shared/argTypes.ts` 빌더 사용 100%
- 인라인 control 객체 grep 0건
- test-storybook a11y 게이트 100% 유지 (axe 회귀 없음)

---

## Track C: Gap G1-G25 적용

이전 Wave 1 직전 planning에서 식별된 횡단 갭 중 미적용 항목.

### C1. G1 — `prefers-reduced-motion` 전수 검증

| | |
|---|---|
| **Effort** | M (~5h) |
| **Risk** | 0.5 |
| **Priority** | 🟠 P1 |

**작업**:

- Storybook globals에 `motion` 토글 추가 (`reduce`/`auto`)
- 토글 시 iframe `<html>`에 `prefers-reduced-motion: reduce` CSS query를 강제
- 모든 컴포넌트의 entry animation 검증:
  - `motion-safe:` prefix 적용 100% 확인
  - reduce 모드에서 즉시 표시 (no animation)
- 누락된 컴포넌트 (Modal/Toast/Popover/Tooltip 외 추가 검증)

**수용 기준**:

- Storybook 툴바에서 motion 토글 가능
- reduce 모드에서 모든 entry animation 즉시 종료
- 단위 테스트 +N (각 컴포넌트 motion-safe class 검증)

---

### C2. G2 — RTL 레이아웃 지원

| | |
|---|---|
| **Effort** | L (~10h) ⚠️ |
| **Risk** | 0.6 |
| **Priority** | 🟡 P2 |

**작업**:

- Storybook globals `dir` 토글 (`ltr`/`rtl`)
- 영향받는 컴포넌트 시각·동작 검증·수정:
  - Sidebar/SidebarShell (drawer 방향)
  - Pagination (prev/next 화살표)
  - Stepper (linear flow)
  - Breadcrumb (separator chevron)
  - PageTree (들여쓰기 방향)
  - DropdownMenu (submenu open 방향)
  - DragDrop / KanbanBoard (cross-column 이동 방향)

Tailwind logical properties (`ms-*`/`me-*`/`ps-*`/`pe-*`) 사용으로 마이그레이션 가능한 곳 변환.

**수용 기준**:

- Storybook RTL 토글 시 8+ 컴포넌트 좌우 반전 정상
- 키보드 navigation: ArrowLeft/Right이 RTL에서도 의미적으로 일관 (논리적 prev/next 보존)

---

### C3. G3 — overflow / ellipsis 일관성

| | |
|---|---|
| **Effort** | M (~5h) |
| **Risk** | 0.4 |
| **Priority** | 🟠 P1 |

**작업**: 긴 텍스트 처리 패턴 표준화

- Tag: text-overflow: ellipsis + max-w
- Badge: 동일
- Breadcrumb: 중간 segment ellipsis
- Tabs: tab label ellipsis (현재 ManyTabs는 horizontal scroll)
- Tooltip: max-width + 줄바꿈 (현재 whitespace-nowrap 잔류 P1)
- ChatBubble: 이미 OK
- Pagination: page button width fixed

**수용 기준**:

- 6+ 컴포넌트에서 `LongText` 스토리 추가 또는 보강
- truncate 동작 시각 검증 (스토리 추가)

---

### C4. G6 — empty / error / loading 상태 가이드라인

| | |
|---|---|
| **Effort** | M (~6h) |
| **Risk** | 0.4 |
| **Priority** | 🟠 P1 |

**작업**:

- `<EmptyState>` 컴포넌트가 이미 있음 — 이걸 표준 활용 패턴으로 재사용
- DataTable/KanbanBoard/PageTree/CommandPalette/Calendar의 빈 상태 일관 적용
- 각 컴포넌트의 empty 스토리 추가 또는 보강
- Loading 상태도 동일 패턴 (Skeleton 컴포넌트 활용)

**수용 기준**:

- 5+ 컴포넌트에 EmptyState 통합 권장 패턴 시연
- MDX docs(Foundations/Patterns 신규)에 "빈 상태 패턴" 문서

---

### C5. G9 — 공통 fixtures 모듈

| | |
|---|---|
| **Effort** | S (~3h) |
| **Risk** | 0.2 |
| **Priority** | 🟢 P3 |

**작업**:

- `stories/_shared/fixtures.ts` 생성
- 더미 데이터 export:
  - `users` (Avatar/SidebarShellUserProfile/ChatBubble용)
  - `messages` (ChatBubble/CommandPalette용)
  - `calendarEvents` (Calendar용 향후 disabledDate 도입 시)
  - `kanbanCards` (KanbanBoard용)
  - `tableRows` (DataTable용)
- 기존 스토리에서 인라인 더미 → fixtures import로 마이그레이션

**수용 기준**:

- 7+ 스토리가 fixtures 사용
- DRY: 같은 더미 user 객체 중복 0건

---

### C6. ~~G10 — Accent toolbar global~~ (cancelled)

**Status**: 폐기. 다중 accent 테마 토글 (런타임 swappable accent 팔레트) API와 Storybook accent 툴바는 모두 제거됨. `--accent-*` ramp는 `globals.css`의 `:root`에 오리엔탈 terracotta로 박혀 있고 런타임 스왑 대상이 아님. 추후 다중 accent가 필요해지면 era 시스템과 별도 레이어로 신규 설계.

---

### C7. G11 — Component status badge

| | |
|---|---|
| **Effort** | S (~2h) |
| **Risk** | 0.2 |
| **Priority** | 🟢 P3 |

**작업**:

- `parameters.componentStatus: 'stable' | 'beta' | 'experimental' | 'deprecated'`
- autodocs description에 status badge 렌더링 (Storybook 8 docs blocks 활용)
- 모든 47 컴포넌트 분류 (현재 거의 stable, MarkdownEditor/AudioRecorder는 beta?)

**수용 기준**:

- 모든 컴포넌트의 autodocs에 status 표시
- CHANGELOG에 status 변경 기록

---

### C8. G24 — Anatomy / Do·Don't / Spec MDX

| | |
|---|---|
| **Effort** | L (~12h) ⚠️ |
| **Risk** | 0.6 |
| **Priority** | 🟡 P2 |

**작업**: 핵심 컴포넌트 5-10개에 anatomy 섹션 추가

- 대상: Button, Modal, Tabs, DropdownMenu, Tooltip, Popover, Calendar, DataTable, KanbanBoard, ChatBubble (사용 빈도 높음)
- 각 anatomy MDX:
  - 시각 분해도 (라벨 + 화살표)
  - prop 표 (link to autodocs)
  - Do (3-5 권장 사용)
  - Don't (3-5 안티 패턴)
  - Spec (a11y, kbd, focus, motion)

**수용 기준**:

- 10개 신규 MDX 파일
- 사이드바에 `Components/Button/Anatomy` 같은 sub-page

---

### C9. G25 — Storybook Composition 준비

| | |
|---|---|
| **Effort** | XS (~1h) |
| **Risk** | 0.2 |
| **Priority** | 🟢 P3 |

**작업**:

- `.storybook/main.ts`의 `refs` 옵션 자리 holder 추가 (주석)
- 향후 `@jyi/design-system-icons`, `@jyi/design-system-charts` 같은 분리 시 composition할 위치 명시
- Storybook 8 composition 베스트 프랙티스 docs 링크

**수용 기준**:

- main.ts에 commented `refs: {}` placeholder
- 1개 MDX 페이지 또는 README 섹션으로 composition 가이드

---

## Track D: 인프라 보강

### D1. Pre-push hook (husky) 통합

| | |
|---|---|
| **Effort** | S (~2h) |
| **Risk** | 0.3 |
| **Priority** | 🟢 P3 |

**작업**:

- husky 설치
- pre-push에 `npm run typecheck && npm run lint && npm run format:check && npm test` 4 게이트 강제
- `test-storybook:ci`는 시간 길어 manual 권장 유지 또는 별도 hook (pre-commit이 아닌 push)

**수용 기준**:

- 게이트 실패 시 push 차단
- 우회: `--no-verify` (긴급 시)

---

### D2. ESLint stories/ 폴더 포함

| | |
|---|---|
| **Effort** | S (~2h) |
| **Risk** | 0.3 |
| **Priority** | 🟢 P3 |

**작업**:

- `package.json`의 `lint` 스크립트 `eslint src` → `eslint src stories`
- stories 전용 ESLint 규칙 (no `<button>` 직접 사용 권장 등) 검토
- 기존 50+ 스토리에서 발견되는 lint 위반 정정

**수용 기준**:

- `npm run lint` 통과
- stories 폴더의 best practice 강제

---

### D3. Visual regression baseline

| | |
|---|---|
| **Effort** | M (~5h) |
| **Risk** | 0.5 |
| **Priority** | 🟡 P2 |

**작업**: TODO.md C 결정 후 진행

- 도구 결정 (Chromatic / Loki / test-runner snapshot)
- baseline 캡처
- CI 통합 (test-runner snapshot이라면 추가 도구 없이)

**수용 기준**:

- 모든 스토리의 baseline 스냅샷 저장
- PR 시 차이 자동 감지

---

### D4. 부족한 단위 테스트 보강

| | |
|---|---|
| **Effort** | M (~5h) |
| **Risk** | 0.3 |
| **Priority** | 🟢 P3 |

**작업**: 단위 테스트 부족한 컴포넌트 보강

- DataTable: 2건 → 8건 목표
- 기타 검사하여 5건 미만 컴포넌트 식별

**수용 기준**:

- 80% coverage 임계 통과
- 모든 컴포넌트 최소 5 단위 테스트

---

## Track NEW: 본 계획 검토에서 추가 발견

### N1. TypeScript Generics 사용 가이드

| | |
|---|---|
| **Effort** | S (~2h) |
| **Priority** | 🟡 P2 |

**작업**: `DataTable<T>` 같은 generic 컴포넌트 사용법 컨슈머 가이드 (Tokens.mdx 또는 별도)

---

### N2. `core` entry framework-agnostic 사용 패턴 문서

| | |
|---|---|
| **Effort** | S (~2h) |
| **Priority** | 🟡 P2 |

**작업**: `@jyi/design-system/core` entry로 React 없이 Vanilla/Vue/Svelte에서 style function 사용하는 예시 docs

---

### N3. ref API 일관성 audit

| | |
|---|---|
| **Effort** | M (~5h) |
| **Priority** | 🟡 P2 |

**작업**: `useImperativeHandle`로 메서드 노출하는 컴포넌트 식별 → 일관 패턴 (Modal `open()`/`close()` 등) 적용 또는 명시적 미지원 문서

---

### N4. dark mode와 era 관계 결정

| | |
|---|---|
| **Effort** | L (~10h) ⚠️ |
| **Priority** | 🟡 P2 |

**작업**: 현재 era는 시각 대비를 동시 제공. OS dark mode (`prefers-color-scheme: dark`)와 era 시스템의 관계 명확화. 둘이 교차 가능한지(Heritage + dark / Neon + light) 결정.

---

## 우선순위 매트릭스

| Track | 🟠 P1 (즉시) | 🟡 P2 (다음) | 🟢 P3 (이후) |
|---|---|---|---|
| **A** | A1, A2, A3, A4, A5 | A6a, A7, A8 | A6b |
| **B** | B-mass 25 | — | — |
| **C** | C1, C3, C4 | C2, C6, C8 | C5, C7, C9 |
| **D** | — | D3 | D1, D2, D4 |
| **NEW** | — | N1, N2, N3, N4 | — |

**P1 합계**: A1-A5(5) + B-mass(25 컴포넌트 일괄) + C1, C3, C4(3) = **9 작업 + 25 컴포넌트 = ~14-18 영업일**

**P2 합계**: A6a, A7, A8 + C2, C6, C8 + D3 + N1-N4 = **11 작업 = ~10-15 영업일**

**P3 합계**: A6b + C5, C7, C9 + D1, D2, D4 = **7 작업 = ~5-7 영업일**

**전체**: **~30-40 영업일** (1인 기준, 병렬 dispatch 시 더 압축 가능)

---

## 권장 실행 시퀀스 (Waves)

```
Wave 5b2-A (P1 컴포넌트, 병렬 5 에이전트, ~3-4일):
  └─ A1 Pagination disabled
  └─ A2 Stepper error state
  └─ A3 PromptInput label/error/maxLength
  └─ A4 AudioRecorder pause/resume + focus
  └─ A5 SidebarShell aria-label

Wave 5b2-B (B-mass 일관성, 병렬 5 에이전트, ~1.5일):
  └─ 25 스토리 7항목 audit + 보강

Wave 5b2-C1 (P1 갭, 병렬 3 에이전트, ~1.5일):
  └─ C1 reduced-motion
  └─ C3 overflow/ellipsis
  └─ C4 empty state 패턴

[--- P1 완료 게이트: test-storybook:ci 100%, 단위 테스트 +30 ---]

Wave 5b2-D (P2 ① 컴포넌트 보강, ~1주):
  └─ A6a MarkdownEditor disabled
  └─ A7 Calendar disabledDate/min/max/locale
  └─ A8 i18n (별도 워크스트림 추천)

Wave 5b2-E (P2 ② 갭 + 인프라, ~1주):
  └─ C2 RTL
  └─ C6 accent toolbar
  └─ C8 Anatomy MDX 10건
  └─ D3 Visual regression baseline
  └─ N1-N4 추가 docs/audit

[--- P2 완료 ---]

Wave 5b2-F (P3 폴리시, ~3-5일):
  └─ A6b MarkdownEditor aria-pressed
  └─ C5/C7/C9 fixtures/status badge/composition
  └─ D1/D2/D4 husky/eslint/test 보강
```

---

## 의존성 그래프

```
선행 의존성:
- A3 PromptInput label → C3 overflow에 영향
- A6a → A6b (disabled prop 먼저, aria-pressed 나중)
- A7 Calendar disabledDate 결정 → C5 calendarEvents fixture 모양 결정
- A8 i18n 결정 → 모든 하드코딩 한글 마이그레이션 트리거
- D3 visual regression 도구 결정 (TODO.md C) → 본 계획 D3
- C2 RTL → 거의 모든 컴포넌트 영향
- C8 Anatomy MDX → 컴포넌트 별 자연어 작업

병렬 가능:
- Track A의 A1/A2/A4/A5 모두 독립 (5 병렬)
- Track B-mass 5 그룹 모두 독립 (5 병렬)
- Track C P1 (C1/C3/C4) 모두 독립 (3 병렬)
```

---

## 공통 Definition of Done

각 작업 단위가 "완료"로 인정되려면:

- [ ] 코드/스토리 작성 완료
- [ ] `npm run typecheck` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run format:check` ✅
- [ ] `npm test` ✅ (회귀 0건)
- [ ] `npm run test-storybook:ci` ✅ (axe 게이트 100% 유지)
- [ ] CLAUDE.md "Story checklist" 14항 점검 (스토리 작업 시)
- [ ] CHANGELOG.md `[Unreleased]` 섹션에 항목 추가 (사용자 영향 있는 변경 시)
- [ ] API prop 추가 시 단위 테스트 +N (정상/에러 경로)
- [ ] WAI-ARIA 영향 시 `Foundations/Accessibility` 표 업데이트

---

## 참조 자료

- `CLAUDE.md` — 프로젝트 컨벤션 (Story checklist, Conventions Discovered)
- `claudedocs/wave6a-a11y-baseline.md` — axe 베이스라인 (Wave 6a)
- `stories/Era.mdx` / `Tokens.mdx` / `Accessibility.mdx` — Foundations 가이드
- `stories/_shared/argTypes.ts` — 공통 builders
- `stories/_shared/STORY_TEMPLATE.tsx` — 스토리 표준 템플릿
- `TODO.md` — 사용자 액션 항목 (placeholder, 결정 보류, 시각 검증)
- `CHANGELOG.md` — Keep-a-Changelog 형식

---

## 메모

- **스코프 큼** (~30-40 영업일). 한 번에 진행 어려우면 P1만 먼저 종결 후 P2로 이전 권장.
- A6b (MarkdownEditor aria-pressed)는 **별도 컴포넌트 작업 규모**. Wave 5b2 본류에서 분리 권장.
- A8 (i18n) 역시 **별도 워크스트림** (Wave 7?)으로 분리 권장.
- C2 RTL, C8 Anatomy MDX는 효과적이지만 큰 시각 작업 — 시각 검증 필요 시점에 같이 처리 가능.
- 모든 작업 후 axe 게이트 100% 유지가 절대 조건.
