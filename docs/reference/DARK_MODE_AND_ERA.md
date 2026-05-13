# Dark Mode와 Era — 관계 결정 (N4)

> **상태**: ✅ Decided — **Option A (era IS the color-scheme axis)**
> **결정일**: 2026-05-08 (Wave 5b2 / N4)
> **결정 주체**: System Architect (autonomous)
> **선례 문서**: [`ERA_THEME_DESIGN.md`](./ERA_THEME_DESIGN.md)

---

## 1. 배경

이 디자인 시스템에는 **두 개의 시각 모드**가 있다.

- **Era** (`heritage` | `neon`) — 브랜드/시대감 축. 단일 `data-era` 속성과 CSS 변수 cascade로 전환되며, 컴포넌트는 `--era-surface-base`, `--era-ink-primary` 같은 semantic slot만 읽는다. ([`ERA_THEME_DESIGN.md`](./ERA_THEME_DESIGN.md) §2 참조.)
- **OS dark mode** (`prefers-color-scheme: dark`) — 운영체제 수준의 사용자 선호. 브라우저가 미디어 쿼리로 노출하며, 사이트가 이를 존중할지 무시할지는 자유다.

현재 era의 물리값은 사실상 **명도 축**과 일치한다.

| Slot                 | Heritage         | Neon                |
| -------------------- | ---------------- | ------------------- |
| `--era-surface-base` | `#f6efe1` (한지) | `#0b0e18` (흑요석)  |
| `--era-ink-primary`  | `#2b1d10` (먹)   | `#e8ecff` (네온 백) |

즉 Heritage = light surface + dark ink, Neon = dark surface + light ink. 두 era는 brand DNA(질감, 폰트, 모션, 패턴)와 함께 명도까지 묶어서 전환한다.

코드베이스 grep 결과: `prefers-color-scheme`는 **아무 곳에도 사용되지 않는다.** `WAVE_5B2_PLAN.md`만 N4 항목으로 언급한다.

---

## 2. 옵션 분석

### Option A — era IS the color-scheme axis (단일 축)

Heritage = light, Neon = dark. OS `prefers-color-scheme`은 부팅 시 초기 era를 결정하는 힌트로만 사용한다. Heritage+dark, Neon+light 조합은 **존재하지 않는다.**

| Pros                                                                      | Cons                                                              |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 단순. 토큰/컴포넌트/테스트 모두 그대로                                    | 다크 모드 OS 사용자가 Heritage 분위기를 원하면 강제로 light가 됨  |
| 현재 구조와 일치 — 재작업 0                                               | "라이트 다크모드 선택"과 "브랜드 무드 선택"이 분리 안 됨          |
| axe a11y 라인이 4종(2 era × hover/active)이 아니라 2종으로 유지 가능       | OS-level a11y 선호와 결을 달리할 가능성 (high-contrast 등)        |
| `--era-accent-strong`처럼 era별로 한 번씩만 검증한 contrast가 그대로 유효 |                                                                   |

### Option B — era와 color-scheme 직교 (4 조합)

Heritage-light, Heritage-dark, Neon-light, Neon-dark 모두 정의. 각 era가 light/dark CSS 변수 세트를 갖는다.

| Pros                                                              | Cons                                                                                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 최대 유연성. 사용자가 OS dark + Heritage 무드를 동시 선호 가능    | **2× 토큰 유지보수.** 현재 era 변수 ~50개 → ~100개                                              |
| OS 다크 선호 자동 존중                                            | 4종 a11y 검증 라인. 현재 axe 447 stories → 추정 ~900 stories                                    |
| 큰 SaaS 표준에 부합                                               | Heritage-dark은 정체성 모순 — 한지+먹은 본질이 light. 디자인 의도와 충돌                        |
|                                                                   | `--era-accent-strong` 같은 era별 fine-tuning이 4× 됨                                            |
|                                                                   | Neon-light는 거의 무의미 — 네온은 어두운 배경에서만 글로우가 작동                               |

### Option C — 하이브리드 (era는 brand only, light/dark는 별도)

Era에서 명도 의미를 빼고 brand DNA(폰트, 패턴, 모션)만 남긴 뒤, light/dark은 직교축으로 분리.

| Pros                                                              | Cons                                                                                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 의미적으로 가장 깨끗 — "brand"와 "scheme"을 명확히 분리            | **현재 모든 era 토큰 재정의 필요.** Heritage는 light가 정체성, Neon은 dark가 정체성을 잃음     |
| 미래 확장성 (제3, 제4 era 추가 시 자동으로 light/dark 모두 지원)   | Heritage의 한지 텍스처와 Neon의 글로우는 명도와 분리 불가능 — 분리 시 시각 정체성 붕괴          |
|                                                                   | Option B의 모든 비용을 그대로 짊어짐                                                            |

---

## 3. 결정 — **Option A**

**이유 (project-rooted)**

1. **Era의 시각 정체성은 명도와 분리 불가능하다.** Heritage는 한지(light)에 먹(dark)이 올라간 것이 본질이다. Neon은 흑요석(dark)에 청람 글로우(light)가 떠오르는 것이 본질이다. light/dark을 era에서 분리하면 두 era 모두 시각 언어 절반을 잃는다. ERA_THEME_DESIGN.md §1-G2가 이를 명시: "물리값은 시대별로 다름 — 과거 = 지류·도자기·먹 / 현대 = 네온·글래스·홀로그램".
2. **현재 구현 상태가 이미 Option A에 정렬되어 있다.** 47개 컴포넌트, 447 axe stories, `--era-accent-strong` 같은 era-specific contrast tuning이 모두 단일 축 모델을 전제로 검증되어 있다. Option B/C는 이 표면을 2-4× 늘리는 비용을 부담시킨다.
3. **OS preference는 정중히 무시하거나 첫 부팅 힌트로만 사용한다.** N4 미션이 "OS 다크 선호를 어떻게 다루느냐"이고, 그 답이 "era로 매핑한다"라는 결정을 내리는 것이다. Heritage가 밝다고 OS dark 선호자가 곤란하지 않다 — 사용자가 Era 토글로 Neon을 선택하면 그게 그들의 "dark mode"다.

---

## 4. 결과 (Consequences)

### 변하지 않는 것

- `EraName = "heritage" | "neon"` 타입
- `applyEra(element, name)` API
- `data-era` 속성 단일 축
- 모든 `--era-*` CSS 변수 슬롯과 그 물리값
- 47개 컴포넌트의 `bg-era-base`, `text-era-primary`, `shadow-era-card` 사용 패턴
- 447 axe stories의 검증 라인 (Heritage + Neon 두 era)

### 새로 명문화되는 것 (구현은 후속 Wave)

다음 패턴은 **권장 사항**이지 v1 차단 요건이 아니다.

1. **부팅 힌트로서의 OS preference**:
    ```ts
    // 권장 패턴 — 사용자가 Era를 명시적으로 선택한 적 없을 때만
    const saved = localStorage.getItem("oriental:era");
    const initial: EraName =
      (saved as EraName) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "neon"
        : "heritage");
    applyEra(document.documentElement, initial);
    ```
    Era.mdx의 "Persist era preference" 레시피를 이 패턴으로 확장 가능.

2. **`<html color-scheme>` 메타 정렬** (선택):
    ```css
    :root[data-era="heritage"] {
      color-scheme: light;
    }
    :root[data-era="neon"] {
      color-scheme: dark;
    }
    ```
    이 한 쌍은 브라우저 기본 UI(스크롤바, form control, autofill)가 era에 맞춰 그려지게 한다. 패턴/폰트/contrast 검증과는 독립이라 추가하기 안전하다. **이 변경은 후속 작업이며 본 결정 문서의 범위가 아니다.**

3. **금지 사항**: `prefers-color-scheme` 미디어 쿼리로 era 토큰 자체를 오버라이드하는 CSS는 **추가하지 않는다.** 이미 era가 그 역할을 한다.

### 변경 없는 영역

- `globals.css`, `tailwind.preset.ts`, 모든 `*.styles.ts`
- 토큰 파일 (`src/tokens/*`)
- 테스트 (`*.test.tsx`), 스토리 (`*.stories.tsx`)
- 빌드/문서/CI

---

## 5. 마이그레이션 경로

**불필요.** Option A는 현재 상태의 명문화이지 변경이 아니다.

§4의 권장 패턴(부팅 힌트, `color-scheme` 메타)을 도입하기로 결정한다면 별도 작업으로 다음을 다룬다.

1. `applyEra` 또는 신규 헬퍼 (`bootEra({ respectOSPreference: true })`)
2. `:root[data-era="*"]`에 `color-scheme: light|dark` 추가 (heritage.css, neon.css)
3. Era.mdx의 "Persist era preference" 레시피 업데이트
4. axe 회귀 검증 (form control, autofill 영역)

---

## 6. 미해결 질문 (User Input 필요)

- [ ] **OS dark 선호자가 첫 방문에서 Heritage(light) UI를 보는 것이 마케팅적으로 수용 가능한가?** §4-1 부팅 힌트를 도입할지 여부의 결정 기준. 사용자/브랜드의 분위기 기조를 어떻게 설정하는가에 따라 달라짐.
- [ ] **`color-scheme` 메타(§4-2) 추가는 본 결정의 후속 sub-task로 처리할지, 아니면 별도 Wave로 분리할지.** 추가 시 axe 검증이 form control 영역까지 확장됨.
- [ ] **고대비 모드 (`forced-colors: active`) 대응은 별개 결정으로 다룰 것인가.** 본 문서는 OS dark mode만 다룬다 — high-contrast 대응은 별도 a11y task가 필요하다.

---

## 7. 참조

- [`ERA_THEME_DESIGN.md`](./ERA_THEME_DESIGN.md) — Era 아키텍처 원본 스펙 (한국어)
- [`stories/Era.mdx`](../../stories/Era.mdx) — Era 사용자 가이드 (이 결정의 cross-link 추가됨)
- [`WAVE_5B2_PLAN.md`](../../WAVE_5B2_PLAN.md) §N4 — 이 작업의 원 요구사항
- `src/themes/era/{heritage,neon}.ts` — 토큰 물리값
- `src/styles/eras/{heritage,neon}.css` — 정적 cascade
