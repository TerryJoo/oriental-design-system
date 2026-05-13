# TODO — 사용자 액션 항목

이 세션에서 자동화로 처리할 수 없어 사용자 판단이 필요한 항목 모음.
세션 산출물은 모두 마무리됨 (코드/테스트/문서/CI 모두 게이트 green).

---

## ✅ ~~즉시 채워야 할 placeholder (3건)~~ (완료)

GitHub 저장소: `https://github.com/TerryJoo/oriental-design-system`. 패키지 scope: `@jyi`.

- ✅ `package.json` `repository.url` = `git+https://github.com/TerryJoo/oriental-design-system.git`
- ✅ `package.json` `homepage` = `https://terryjoo.github.io/oriental-design-system/` (Pages 활성화 시 유효)
- ✅ `CHANGELOG.md` compare footer = `https://github.com/TerryJoo/oriental-design-system/compare/HEAD`
- ✅ `package.json` `name` = `@jyi/design-system` (이전: `@oriental/design-system`)
- ✅ `package.json` `publishConfig.registry` = `https://npm.pkg.github.com` (GitHub Packages 배포)
- ✅ README "Installation (GitHub Packages)" 섹션 추가 — 소비자가 `.npmrc`에 `@jyi:registry=https://npm.pkg.github.com` 등록 필요

---

## 🟡 결정이 필요한 항목 (보류 중)

### A. GitHub Packages 배포 여부

배포 채널은 **GitHub Packages**로 확정 (`publishConfig.registry=https://npm.pkg.github.com`, scope `@jyi`). npm 공개 배포는 하지 않음.

현재 `package.json`의 `private: true`로 발행 차단되어 있음.

- **GitHub Packages 배포 활성화 시**:
  1. `private: true` 제거
  2. `npm run build` (tsup으로 dist/ 생성)
  3. `.npmrc`에 `//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}` 설정 (PAT with `write:packages`)
  4. `npm publish` — `publishConfig.registry`로 자동 라우팅
  5. (권장) `.github/workflows/publish.yml`에 자동 배포 잡 추가 (태그 푸시 트리거 + `secrets.GITHUB_TOKEN`)
- **내부 미러로 유지할 경우**: 그대로 두기

### B. GitHub Pages 배포

Wave 6b에서 의도적으로 보류. 활성화하려면:
1. GitHub 저장소의 Settings → Pages → Source: GitHub Actions 선택
2. `.github/workflows/ci.yml`에 deploy 잡 추가 (storybook 잡의 `storybook-static/` 산출물을 `actions/deploy-pages@v4`로 배포)

### C. Visual regression 도구

**결정**: `@storybook/test-runner` snapshot 모드 채택 (Wave 5b2 / D3 완료).

- 베이스라인 저장 위치: `__visual_snapshots__/<story-id>.png` (repo committed)
- 갱신 명령: `npm run test-storybook:visual` (의도적 갱신용)
- 비교 명령: `npm run test-storybook:visual:ci` (CI/PR 검증용 — 신규 베이스라인이 안정화되기 전까지 non-blocking)
- 옵트아웃: `parameters: { visualSnapshot: { disable: true } }` (애니메이션 위주 스토리 등)
- 비교 엔진: Playwright 번들 pixelmatch (신규 의존성 0건)
- `test-storybook:ci` (a11y 게이트)는 변경 없음 — visual은 별도 잡

대안 (참고):
- **Chromatic** — 유료 (월 $149+), 가장 표준 (필요해지면 도입)
- **Loki** — 무료, OSS, 한계 있음

### D. 잔여 P1 작업 (axe 위반 아님, 코드 품질 enhancement)

다음 컴포넌트의 P1 항목은 axe는 통과하지만 사용성 측면에서 개선 여지가 있음:
- **Pagination**: `disabled` prop 부재 → 컴포넌트 외부 `<fieldset disabled>`로 우회
- **Stepper**: 에러 상태 시맨틱 (`aria-invalid` + 텍스트) 부재
- **PromptInput**: `loading`/`error`/`maxLength` prop 부재 (현재는 `textareaProps`로 우회)
- **AudioRecorder**: 일시정지/재시작 분리 없음 (단일 toggle)
- **SidebarShell**: 하드코딩된 `aria-label` ("Sidebar navigation") prop화 부재
- **MarkdownEditor**: `aria-pressed` 토글 상태 표시 없음, top-level `disabled` prop 없음

이들은 차후 enhancement 트랙으로 별도 진행 권장 (axe 게이트 100% 유지).

### F. Combobox component (future replacement for native Select where pixel-perfect option styling matters)

현재 `Select`는 네이티브 `<select>`/`<option>`을 유지하면서 era 토큰을 가능한 만큼 적용한 형태:

- 닫힌 트리거: 디자인 시스템과 시각적으로 통합 (rounded-input, border-era, era focus ring, 인라인 SVG 셰브론)
- 열린 옵션 패널: `color-scheme` (Chromium/Firefox 라이트·다크 chrome 전환), `option { background-color, color }` (Chromium/Firefox 만 적용), Safari는 거의 무시
- hover state는 브라우저가 제어하여 cross-browser 테마 적용 불가능

다음 항목이 필요해지는 시점에 ARIA combobox 패턴 (`role="combobox"` + `aria-controls` + listbox popover)으로 별도 Combobox 컴포넌트를 신설:

1. **Pixel-perfect option panel** — Heritage hanji / Neon glass surface가 옵션 패널까지 일관되어야 할 때
2. **Typeahead / autocomplete** — 사용자 타이핑으로 옵션 필터링
3. **Virtualization** — 100+ 옵션을 가상 스크롤로 렌더링
4. **Multi-select with chips** — 다중 선택 + 제거 가능한 칩 UI
5. **Custom option content** — 옵션에 아이콘/서브텍스트/배지 포함
6. **Hover/focus theming** — DropdownMenu와 동일한 era 토큰 hover 상태

WAI-ARIA 1.2 combobox 패턴 참조: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

이 작업이 들어오면 `Select`는 그대로 두고 `Combobox`를 신규 컴포넌트로 추가 권장 (form 라이브러리/SSR 호환성 측면에서 native `<select>`가 여전히 필요한 케이스가 많음).

### E. Gap G1-G25 (원래 planning에서 식별)

세션에서 cross-cutting 형태로 일부 흡수됨:
- ✅ G14 (테스트 커버리지에서 stories 제외): vitest 설정상 자동
- ✅ G18 (forwardRef demo): 일부 스토리에서 시연됨
- ✅ G21 (CSF3 satisfies Meta): 모든 신규 스토리에 적용
- ✅ G22 (play function 표준): `_shared/argTypes.ts`로 정착
- ❌ G1 (reduced-motion): preview.ts 수준 검증 미실시
- ❌ G2 (RTL 레이아웃): 미실시
- ❌ G3 (overflow/ellipsis 일관성): 산발적
- ❌ G6 (empty/error 상태 가이드라인): 산발적
- ❌ G9 (공통 fixtures 모듈): 미실시
- ❌ G10 (accent toolbar global): 부분
- ❌ G11 (component status badge): 미실시
- ❌ G24 (Anatomy / Do·Don't / Spec MDX): 부분 (Tokens.mdx에 일부 흡수)
- ❌ G25 (Storybook Composition 대비): 미실시

차후 정비 트랙으로.

---

## 🟢 마지막 단계 — 시각 검증 (모든 코딩 완료 후)

세션 동안 자동 a11y 게이트 100%, 단위 테스트 571 통과로 확인했으나 **시각적 회귀**는 자동 도구 없이 검증 안 됨.

### Storybook 띄우기

```bash
npm run dev    # localhost:6006
```

### 우선 확인 권장 (이번 세션에서 stylesheet에 손댄 컴포넌트)

| 컴포넌트 | 무엇을 확인 |
|---|---|
| **Switch** | 클릭 시 thumb이 좌→우 이동 (양 era) |
| **Checkbox** | 체크 시 ✓ 표시 보임 |
| **Tag** | Heritage·Neon 양쪽에서 글자/테두리 명확히 보임 |
| **ChatBubble** | `me` 보낸 메시지가 Neon에서 흰 글자로 잘 읽힘 |
| **EraSwitch** | 활성 버튼 흰 글자, 비활성 버튼 hierarchy 유지 |
| **Modal / Tabs / DropdownMenu** | 키보드 동작 (Tab/Arrow/Escape/Enter) |
| **Tooltip / Popover** | 호버·클릭 동작, Escape로 닫힘 |
| **Calendar** | Arrow 키 grid 네비게이션 (1셀씩 이동) |
| **PageTree** | Arrow 키로 트리 네비게이션 (확장/축소) |
| **DragDrop / KanbanBoard** | Space로 grab → Arrow로 이동 → Space로 drop (키보드 reorder) |
| **Toast / Popover / Badge** | 진입 애니메이션이 자연스러운지 (opacity ramp 제거 후) |
| **Foundations MDX 3종** | Era / Tokens / Accessibility 페이지가 사이드바에 표시되고 렌더링됨 |

### Era 토글로 양쪽 모드 모두 확인

Storybook 상단 toolbar의 "Era" globalType에서 Heritage / Neon 전환.
색상·대비·시각 hierarchy가 두 era에서 모두 의도대로 보이는지 확인.

### 발견한 시각 이슈가 있으면

다음 세션에서 컴포넌트별로 수정 가능. axe 게이트는 이미 통과하므로 시각적 디테일 조정만 필요할 가능성이 큼.

---

## 📋 참고 — 세션 중 영구화된 컨벤션

`CLAUDE.md` "Conventions Discovered (Wave 5b2)" 섹션 참조 (8개 규칙).
`CLAUDE.md` "Story checklist" 섹션 참조 (14항 체크리스트).
신규 스토리 작성 시 `stories/_shared/STORY_TEMPLATE.tsx`를 복사해서 시작.

세션의 누적 결과:
- 47 컴포넌트 + 232 스토리
- 단위 테스트 311 → 571 (+260)
- a11y 게이트 0% → 100% (382/382)
- WAI-ARIA 패턴 구현 컴포넌트: 0 → 11
- color-contrast violation: 219 nodes → 0
