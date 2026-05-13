# Era 적용 — 전수 점검 (마지막 업데이트: 2026-05-07 · Wave 3 완료)

프로토타입(45-component showcase) · `ERA_THEME_DESIGN.md` · 실제 `src/`를 대조해 적용 여부를 추적합니다.

범례: ☐ 미적용 · ◐ 부분 적용 · ✓ 적용 완료

## 진척 요약

- ✓ Phase 1 — preset era 유틸 버그 4종 + reduced-motion 정상화
- ✓ Phase 2 — Button (seal/danger 추가, secondary/ghost era-aware), Badge era 완성
- ✓ Phase 3 — EraSwitch 본체 + PatternBackground 5 variant
- ✓ Phase 4 — Foundation 3종 (Typography·Stack·Separator)
- ✓ Phase 5 — `oriental-prototype.html` 최신 45-component 쇼케이스
- ✓ Phase 6 — Card·Alert·Spinner·LoadingDots·Tooltip·Input
- ✓ Forms 6종 — TextField·Checkbox·Radio·Switch·Select·Filter
- ✓ Display 4종 — Avatar·Tag·CoverImage·IconPicker
- ✓ Feedback 5종 — Toast·Skeleton·Progress·EmptyState·SyncStatus
- ✓ Navigation 6종 — Breadcrumb·Tabs·Pagination·Sidebar·PageTree·Stepper
- ✓ Overlay 4종 — Modal·Popover·DropdownMenu·CommandPalette
- ✓ Data 5종 — DataTable·KanbanBoard·DragDrop·Calendar·Accordion
- ✓ **Phase 7** — MarkdownEditor·AudioRecorder·PromptInput·ChatBubble + ChatThread + AvatarGroup + core.ts 전체 export 보강
- ✓ **Wave 1 (2026-05-07)** — SidebarShell 컴파운드 API (Header·Content·Footer·Group·GroupLabel·Menu·MenuItem·MenuButton·MenuSub·MenuSubItem·MenuSubButton·UserProfile + Trigger + Context, additive coexistence with flat `<Sidebar sections>`) · Storybook era-toolbar `applyEra` 통합 + autodocs · 폰트 자체 번들링 (@fontsource × 7) · scripts/gen-story.ts 스토리 스캐폴드 · CI 게이트 검증 (4-job 병렬) · Avatar/PatternBackground/Separator 사전 테스트 결함 수정 (happy-dom 그라디언트 제약 우회). Wave 1 메모리: 51개 신규 테스트, 370/370 통과.
- ✓ **Wave 2 (2026-05-07)** — SidebarShell 베럴/공개 API 완성 (Sidebar/index.ts +71줄, src/core.ts 미러 15 함수 + 9 타입) · CSS Custom Properties 쇼케이스 스토리 (39 era 변수 라이브 시각화, 5 명명 스토리: Default/SurfacesOnly/Typography/Shadows/Motion) · Korean 폰트 서브셋 조사 + 결정 (unicode-range 통합 ≪ 스크립트 분리 서브셋, 통합 유지 + docs/reference/FONTS.md 작성) · 보드게임 토큰 설계 완료 (oxblood/cyan-seal 팔레트, 12 era 변수 — material.paper/seal/dice/scroll/card/frame, 6 SVG 패턴, AAA 명도 검증). 370/370 회귀 통과.
- ✓ **Wave 3 (2026-05-07)** — Storybook 스토리 일괄 작성 (3,712줄 / 27 신규 + 1 리프레시): **B3 Foundations 5** (Animations·Colors·Shadows·SpacingRadius·Typography — 토큰 자동 introspection, 오방색 매핑, 18-step spacing scale, 19 fontSize × 9 fontWeight × 8 fontFamily 시각화), **B4 Forms 7** (Input·TextField·Checkbox·Radio·Switch·Select·Filter — 모든 argTypes가 .styles.ts 변형 맵에서 파생), **B5 Display+Feedback 13** (Card·Avatar·Tag·CoverImage·IconPicker·Alert·Spinner·LoadingDots·Toast·Skeleton·Progress·EmptyState·SyncStatus — Toast 포털 데코레이터, indeterminate Checkbox useEffect+ref 패턴), **B8 Oriental 2** (PatternBackground 6 스토리 = AllVariants·IntensityMatrix(6×3) 등, EraSwitch 리프레시 — 수동 applyEra 제거, 글로벌 툴바 위임). 모든 스토리 era 데코레이터 [data-era="heritage|neon"] 사용, 클래스 문자열 하드코드 0건. 370/370 회귀 그린.

---

## A. 컴포넌트 — **45/45 ✓ 전부 구현 완료**

### Foundation (3) ✓
- ✓ Typography · Stack · Separator

### Actions (1) ✓
- ✓ Button

### Forms (7) ✓
- ✓ Input · TextField · Checkbox · Radio · Switch · Select · Filter

### Display (6) ✓
- ✓ Card · Badge · Avatar · Tag · CoverImage · IconPicker

### Feedback (8) ✓
- ✓ Alert · Spinner · LoadingDots · Toast · Skeleton · Progress · EmptyState · SyncStatus

### Navigation (6) ✓
- ✓ Breadcrumb · Tabs · Pagination · Sidebar · PageTree · Stepper

### Overlay (5) ✓
- ✓ Tooltip · Modal · Popover · DropdownMenu · CommandPalette

### Data (5) ✓
- ✓ DataTable · KanbanBoard · DragDrop · Calendar · Accordion

### Editor · Media (2) ✓
- ✓ MarkdownEditor · AudioRecorder

### Chat (2) ✓
- ✓ PromptInput · ChatBubble (+ ChatThread)

### System / 신규 (2) ✓
- ✓ EraSwitch · PatternBackground

**총 45 + 시스템 2 + 보너스 (AvatarGroup, ChatThread).**

---

## B. 잔존 인프라 작업 (선택)

### B-1. ◐ Storybook 스토리 작성
**30 / 53 진행 (~57%)**. 누적: Button·Badge·EraSwitch(refreshed)·CssVariables (Wave 1-2) + Animations·Colors·Shadows·SpacingRadius·Typography (B3 Foundations) + Input·TextField·Checkbox·Radio·Switch·Select·Filter (B4 Forms) + Card·Avatar·Tag·CoverImage·IconPicker·Alert·Spinner·LoadingDots·Toast·Skeleton·Progress·EmptyState·SyncStatus (B5 Display+Feedback) + PatternBackground (B8). 잔존 23: B6 Navigation+Overlay 11 (Breadcrumb·Tabs·Pagination·Sidebar+SidebarShell·PageTree·Stepper·Modal·Tooltip·Popover·DropdownMenu·CommandPalette) + B7 Data+Editor+Chat 9 (Accordion·DataTable·KanbanBoard·DragDrop·Calendar·MarkdownEditor·AudioRecorder·PromptInput·ChatBubble+Thread) + B10 story-coverage CI gate. Wave 4 예정.

### B-2. ✓ 폰트 자체 번들링 (Wave 1)
@fontsource × 7 (`pretendard`, `gowun-batang`, `noto-serif-kr`, `jetbrains-mono`, `ibm-plex-sans-kr`, `cormorant-garamond`, `orbitron`) 설치 완료. globals.css가 21개 `@import`로 전환. font-family 토큰 0건 불일치. CDN 의존 제거.

### B-3. ✓ Vitest 회귀 검증 (Wave 1 / CW1+CW1.5)
darwin-arm64 첫 풀 회귀: 50 파일 / 370 테스트 통과. 사전 결함 7건(Avatar role 충돌, PatternBackground/Separator의 happy-dom 그라디언트 CSSOM 누락) 검출 → 어설션을 스타일 헬퍼 직접 호출 또는 attribute 검사로 교체.

### B-4. ◐ 보드게임 코어 컴포넌트 (별도 트랙)
`ERA_THEME_DESIGN.md` §11에 제안된 DiceRoll · CardDraw · TokenPile · ScrollReveal · Frame · SealStamp는 보드게임 도메인 특화. Wave 5 TDD 트랙(`/sc:tdd-uiux`). **토큰 인프라는 Wave 2에서 완료** (E0): oxblood·cyan-seal 팔레트, era-seal/dice/scroll/card/frame 변수, 6 SVG 패턴 (paper·card-back·frame-ornament × 2 era), Tailwind 유틸리티 노출. Frame 오너먼트 SVG는 E5 단계에서 placeholder→최종 교체 예정.

### B-5. ✓ 사이드바 컴파운드 API 공개 (Wave 2)
Wave 1에서 `SidebarShell.*` 12개 신규 컴포넌트 + Trigger/Context 구현 완료. Wave 2에서 `Sidebar/index.ts` 베럴 (+71줄, 12 컴포넌트 + 15 스타일 함수 + 9 타입), `src/components/index.ts`는 `export *` 패턴이라 자동 노출, `src/core.ts` 스타일 함수 미러 (15 함수 + 9 타입). 공개 API 완료.

### B-6. ☐ 개발 의존성 주요 버전 업그레이드 (백로그)
`npm audit` 검출 7건 (1 critical · 6 moderate, 모두 dev-only):
- happy-dom 15.11.7 → 20.x (RCE / fetch creds / unsafe export 컴파일러; major 점프 — 370 회귀 검증 필요)
- esbuild → vite → vitest 체인 (vitest 2.x → 4.x major)

라이브러리 소비자 런타임 영향 없음. 별도 집중 업그레이드 세션 권장.

---

## 진척 통계

| 영역 | 상태 |
|---|---|
| 컴포넌트 본체 | **47 + SidebarShell 12** (45 + 시스템 2 + Wave 1 컴파운드 12) |
| Era preset 유틸 | 완료 |
| Era CSS 변수 동기화 | 완료 (.ts ↔ .css), 39 변수 + Wave 2 보드게임 12 추가 |
| reduced-motion | 완료 |
| `core.ts` framework-agnostic export | ✓ 완료 (47 + SidebarShell 15 함수 / 9 타입 미러) |
| 참고 문서 | ✓ FONTS.md 추가 (Wave 2), latest 45-component prototype |
| Storybook 스토리 | 30 / 53 (~57%; B3 Foundations + B4 Forms + B5 Display+Feedback + B8 Oriental 완료, B6+B7 Wave 4 예정) |
| 폰트 번들링 | ✓ 자체 번들링 (@fontsource × 7) + Korean 서브셋 조사 결과 unicode-range 통합 유지 |
| 보드게임 토큰 인프라 | ✓ Wave 2 완료 (팔레트 2 + era 변수 12 + SVG 패턴 6 + Tailwind 유틸리티) |
| Vitest 회귀 | ✓ 370 / 370 통과 (darwin-arm64) — Wave 1+2 일관 그린 |
| Storybook era-toolbar | ✓ `applyEra` 인라인 적용 + autodocs 전역 |
| GitHub Actions CI | ✓ 4-게이트 병렬 잡 (lint/format · typecheck · test · build) |
| `npm audit` (dev-only) | 7건 백로그 — 라이브러리 소비자 영향 없음 |

**디자인 시스템 본체 + SidebarShell + 보드게임 토큰 + Storybook 인프라 + 30 스토리 완료.** 잔존 작업: 23 스토리 (Wave 4 = B6+B7+B10), 보드게임 6 컴포넌트 TDD (Wave 5), 문서·릴리스 (Wave 6).
