# plan-acc: Add Template 6 "infra-automation" to plan-acc skill

**Date:** 2026-05-13T01:32+09:00
**Archetype (of this meta-work):** claude-tooling (산출물이 Claude skill 본문 수정)
**Confidence:** HIGH (boundary rule per user decision: skill 수정 = claude-tooling)
**User-driven decisions:**
- Archetype 이름: `infra-automation`
- 범위: DevOps 전반 + IaC 포함
- 산출물: Spec + Patch 둘 다
- Template ID/Revision: Template 6 · Revision 1
- 경계 규칙: 산출물 기준 (Claude skill → claude-tooling, CI/IaC config → infra-automation)
- 필수 AC 4건 (Local validation, Secrets 문서화, Rollback, Supply-chain SHA)
- Sub-domain 질문 4개 (CI/CD 설계, Local validation, Secrets/Variables, IaC)
- Priority list: 말미에 추가

---

## 📌 Receiving Claude에게: 이 문서 사용법

이 파일은 **다른 프로젝트 Claude 세션**에 전달됩니다. 그 세션의 작업 디렉터리는 plan-acc skill 본체 (`/Users/yungikjoo/.claude/skills/plan-acc/`)일 것입니다.

수행해야 할 것:
1. 본 문서의 **Section A (Spec)**으로 의도와 설계 근거 이해
2. **Section B (Patch)**의 markdown blocks를 `SKILL.md`에 정확히 삽입
3. **Section C (Task list)**의 T1~T8을 INVEST+AC 따라 수행
4. 작업 후 Section D의 회귀 검증 시뮬레이션 실행

산출물은 plan-acc SKILL.md 한 파일에 대한 surgical edit입니다. 별도 코드 변경 없음.

---

## Section A — Spec (Why & Design Rationale)

### A.1 Problem statement

기존 5개 archetype (design-system / claude-tooling / game-engine / ml-research / web-application) 어느 것도 다음 부류의 작업에 명확히 들어맞지 않습니다:

- GitHub Actions / GitLab CI / 기타 CI 워크플로우 설계 및 검증
- 로컬 CI runner 셋업 (`act`, `actionlint`, Makefile, pre-commit hooks)
- IaC 모듈 (Terraform, Pulumi, CloudFormation, K8s manifests)
- Secrets / Variables 관리 정책
- Supply-chain 보안 (Actions SHA pinning, dependabot, provenance attestation)
- 배포 자동화 (npm publish, container registry push, GitOps)

이러한 작업은 분류 시 가장 가까운 `claude-tooling`을 강제로 선택하면 템플릿 Q&A가 어색해집니다 — claude-tooling의 질문은 "Vault 통합", "MCP server", "자율 실행" 등 Claude-specific하며 인프라 도메인과 불일치.

`web-application`의 배포·모니터링 질문은 일부 겹치지만 부수적 관심사라 인프라 본질을 다루지 못함.

### A.2 Boundary with claude-tooling

**Rule (산출물 기준)**:

| 작업의 최종 산출물 | Archetype |
|---|---|
| Claude skill / hook / MCP / Obsidian 통합 (도구 자체) | `claude-tooling` |
| CI workflow file / Makefile / IaC manifest / 시크릿 정책 (인프라 설정) | `infra-automation` |

**경계 예시**:
- "GH Actions 로컬 검증하는 Claude skill 만들기" → `claude-tooling` (skill을 만듦)
- "그 skill을 우리 프로젝트에 적용해서 Makefile / .actrc 생성" → `infra-automation` (인프라 config 생성)
- "Terraform 모듈 작성" → `infra-automation`
- "Notion 자동 sync MCP server" → `claude-tooling`

### A.3 Why not "DevOps" as a single broad bucket

User 결정 = scope "DevOps 전반 (IaC 포함)". 그러나 archetype 이름은 `infra-automation`을 선택 — `devops`는 너무 광범위(문화·조직론 포함)하여 plan-acc의 "tightly-scoped template" 성격과 충돌. `infra-automation`은 자동화 가능한 인프라 작업으로 좁혀 AC 자동 검증과 잘 어울림.

### A.4 Example projects (참고)

User portfolio에서 가까운 케이스:
- `oriental-design-system` (Wave 5b2+, 2026-05-12): release-please + release.yml + dependabot + GitHub Actions SHA pinning → 전형적 infra-automation 작업
- (maintainer Claude는 `ls ~/00_projects ~/jyi/00_jyiprojects ~/02_researchs` 후 인프라 작업이 있는 프로젝트 추가 발굴 권장)

### A.5 Mandatory AC gates (user-confirmed)

모든 infra-automation 작업에 다음 4개 AC가 강제:

1. **Local validation 가능** — push 전 로컬에서 한 가지 이상 방식으로 검증 (act / actionlint / dry-run / 시뮬레이션)
2. **Secrets/env 문서화** — 모든 시크릿이 README/.env.example/RUNBOOK에 (이름·출처·권한·rotation) 명시
3. **Rollback 절차 명시** — 자동/수동 rollback 명령 또는 차선책 문서화
4. **Supply-chain 검증** — 외부 의존성(Actions, modules) commit SHA 또는 lockfile 핀 + dependabot/renovate 자동화

### A.6 Sub-domain Q&A coverage (user-confirmed)

Template Q&A는 4개 sub-domain을 독립된 그룹(A/B/C/D)으로 분리해 질문:
- **A. CI/CD 파이프라인 설계**
- **B. Local CI Validation**
- **C. Secrets / Variables 관리**
- **D. IaC (해당 시만)**

추가로 supply-chain / rollback / operations 관련 질문은 그룹 E·F로 묶음 (작업이 단순한 CI 추가일 때는 skip 가능).

---

## Section B — Patch (SKILL.md에 삽입할 정확한 markdown)

> **Receiving Claude 지시**: 아래 5개 패치(B.1~B.5)를 SKILL.md의 명시된 위치에 정확히 삽입/교체합니다. 각 패치 앞 코드펜스는 `<!-- patch boundary -->` 마커로 시작·종료됩니다 — 마커는 삽입 본문에 포함하지 마세요.

### B.1 — Phase 1 keyword 표에 행 추가

**위치**: `## Phase 1: Archetype Selection` 섹션의 `**Keyword scoring** (sum matches per template):` 표.

**기존 표 마지막 행 (web-application) 뒤에 다음 행 추가**:

<!-- patch boundary -->
```markdown
| **infra-automation** | CI, CD, github actions, gitlab ci, circleci, jenkins, workflow, pipeline, 파이프라인, 빌드, act, actionlint, dry-run, pre-commit, husky, lefthook, Makefile, 로컬 검증, secrets, env, OIDC, vault, GITHUB_TOKEN, PAT, 시크릿, 환경변수, terraform, pulumi, cloudformation, ansible, k8s, kubernetes, helm, ArgoCD, FluxCD, manifests, IaC, deploy, 배포, release, publish, 발행, registry, packages, SHA pin, provenance, sigstore, OpenSSF, dependabot, renovate |
```
<!-- patch boundary -->

### B.2 — tie-break frequency_priority 갱신

**위치**: `selection.step_3_tie_break.frequency_priority` 줄과 그 다음 `rationale` 줄.

**기존**:
```yaml
    frequency_priority: ["web-application", "game-engine", "design-system", "claude-tooling", "ml-research"]
    rationale: "Derived from user's 22 active projects (00_projects + jyi/00_jyiprojects + 02_researchs): Web=6, Game=4, Design=3, Claude=3, ML-Research=3"
```

**교체**:

<!-- patch boundary -->
```yaml
    frequency_priority: ["web-application", "game-engine", "design-system", "claude-tooling", "ml-research", "infra-automation"]
    rationale: "Derived from user's portfolio (00_projects + jyi/00_jyiprojects + 02_researchs): Web=6, Game=4, Design=3, Claude=3, ML-Research=3, Infra-Automation=seed(누적 데이터 부족, 최저 우선순위 시드로 시작). infra-automation은 Template 6 추가(2026-05-13) 시점에 명시적 portfolio 통계 없이 시드 priority 부여 — 누적 사용 후 maintainer 재량으로 재정렬 권장."
```
<!-- patch boundary -->

### B.3 — sc_research_fallback prompt 갱신

**위치**: `# /sc:research Integration` 섹션의 `invoke:` 라인.

**기존**:
```yaml
  invoke: "/sc:research 'Classify this software goal into exactly one of: design-system, claude-tooling, game-engine, ml-research, web-application. Goal: {user_goal}. Return: chosen template + 1-sentence justification.'"
```

**교체**:

<!-- patch boundary -->
```yaml
  invoke: "/sc:research 'Classify this software goal into exactly one of: design-system, claude-tooling, game-engine, ml-research, web-application, infra-automation. Goal: {user_goal}. Return: chosen template + 1-sentence justification.'"
```
<!-- patch boundary -->

### B.4 — Output Schema enum에 추가

**위치**: `# Output Schema` 섹션의 `archetype: enum [...]` 줄.

**기존**:
```yaml
    archetype: enum [design-system, claude-tooling, game-engine, ml-research, web-application]
```

**교체**:

<!-- patch boundary -->
```yaml
    archetype: enum [design-system, claude-tooling, game-engine, ml-research, web-application, infra-automation]
```
<!-- patch boundary -->

### B.5 — Template 6 본문 삽입 (가장 큰 패치)

**위치**: `### Template 5: Web Application` 섹션 전체가 끝난 후 (다음 `---` 구분선 뒤), `## Phase 3: AC Validation Loop` 섹션 시작 전.

**삽입 본문 전체**:

<!-- patch boundary -->
```markdown
---

### Template 6: Infra Automation

**Template ID:** `infra-automation` · **Revision:** 1 (created 2026-05-13)

**예시 프로젝트** (참고용): oriental-design-system (Wave 5b2+ release-please + publish workflow + dependabot + Actions SHA pinning, 2026-05-12). 추가 인프라 작업 누적 시 maintainer가 본 목록을 보강.

**기획 관심사:** CI/CD 파이프라인 설계, 로컬 CI 검증, Secrets/Variables 관리, IaC, supply-chain 보안, rollback/롤포워드 절차

**경계 규칙 (`claude-tooling`과 구분)**: 최종 산출물 기준 — Claude skill/hook/MCP 자체를 만들면 `claude-tooling`, CI workflow file / Makefile / IaC manifest 등 **인프라 config**를 만들면 `infra-automation`. 예: "GH Actions 검증 skill 작성" = claude-tooling. "그 skill로 우리 프로젝트에 Makefile 적용" = infra-automation.

**Template Q&A:**

```
[Universal INVEST 6개] +

[Infra-Automation 전용 질문]

A. CI/CD 파이프라인 설계
1. 대상 CI 플랫폼은? (GitHub Actions / GitLab CI / CircleCI / Jenkins / 멀티)
2. 신규 워크플로우 작성인가요, 기존 워크플로우 보강인가요?
   - 보강이면 → 영향받는 기존 잡/스텝 목록과 행위 변화는?
3. 트리거 모델: push / PR / tag / release / schedule / workflow_dispatch / workflow_call 중 무엇 사용? 조합인가요?
4. 매트릭스 빌드 필요한가요? (OS × Node 버전 × 등) 셀당 비용/시간 견적은?
5. 캐시 전략: 어떤 캐시(npm/build/Playwright 등)를 어떤 키로?
6. 작업 의존성 / fan-out / fan-in 구조는?
7. 병렬성 한도와 concurrency group 정책은? (특히 release/publish는 cancel-in-progress: false)

B. Local CI Validation
8. 어떤 도구로 로컬 검증? (act / actionlint / 자체 스크립트 / pre-commit hooks / 복합)
9. fidelity 수준: static lint만 / shell command 미러 / Docker 풀 에뮬레이션?
10. 트리거 시점: pre-commit / pre-push / 명시 명령(make ci) / 모두?
11. 위치/배포: Makefile / scripts/ / .githooks / npm scripts?
12. 환경 불일치 흡수: 로컬과 CI(OS, Node 버전, secrets 부재)의 차이를 어떻게 처리?
13. dry-run 모드: secrets 없이도 lint+typecheck+test 단계까지 작동해야 하나요?

C. Secrets / Variables 관리
14. 사용하는 secret 목록과 출처는? (GitHub Secrets / Vault / 1Password / OIDC federation)
15. 각 secret의 권한 범위(scope)와 만료(rotation) 정책?
16. .env.example 또는 README/RUNBOOK에 모든 secret이 (이름·출처·권한·rotation) 명시되어 있나요?
17. 로컬 검증 시 dummy secret 처리 방식: skip / mask / fixture?
18. OIDC federation 사용? (AWS/GCP/Azure 와 short-lived token) — 사용하면 trust policy 어디?

D. IaC (해당하는 경우만 — 사용 안 하면 "N/A" 후 skip)
19. 어떤 IaC 도구? (Terraform / Pulumi / CloudFormation / Ansible / K8s manifests / Helm)
20. 상태 저장: 어디 (S3/GCS/Terraform Cloud/etcd)? 잠금 메커니즘은?
21. Drift detection 자동화? plan vs apply 절차와 승인자는?
22. 모듈화 수준: monolith / multi-module / multi-repo?
23. 환경 분리: dev/staging/prod 어떻게? 변수·상태·권한 격리 방식은?

E. Supply-chain & Security
24. Actions/모듈 핀 정책: tag / floating SHA / commit SHA (권장)?
25. dependabot/renovate 설정? 업데이트 빈도와 그룹화 전략은?
26. Secret scanning, SAST (CodeQL 등) 통합 여부?
27. Provenance attestation (npm publish --provenance, SLSA) 사용?
28. 빌드 산출물 무결성 검증 (checksum, signing)?

F. Rollback & Operations
29. 자동 rollback 트리거? (헬스체크 실패 / 메트릭 임계치 / 수동 only)
30. 롤백 명령/절차 명시 위치 (RUNBOOK / RELEASE.md / CI 자체)?
31. 모니터링: 어떤 메트릭 (실패율, latency, 큐 길이)? 어느 대시보드?
32. on-call / 알람 라우팅?

[Infra-Automation AC 강제]
- ☑ **Local validation 가능** — 변경된 워크플로우/스크립트가 push 전에 로컬에서 한 가지 이상의 방식으로 검증됨 (act/actionlint/dry-run/시뮬레이션). 적용 도구와 명령을 task의 AC에 명시.
- ☑ **Secrets 문서화** — 모든 secret이 README/.env.example/RUNBOOK에 (이름·출처·권한·rotation) 명시. 누락된 secret으로 인한 CI 실패를 0으로 만드는 정량 목표.
- ☑ **Rollback 절차 명시** — 자동 rollback 트리거 조건 또는 수동 rollback 명령이 문서화. "롤백 안 함" 결정도 명시(이유 포함) 시 허용.
- ☑ **Supply-chain 검증** — 외부 의존성(Actions, modules)이 commit SHA 또는 lockfile로 핀 + dependabot/renovate 자동화 활성. 핀하지 않는 예외(예: 내부 reusable workflow `uses: ./`)는 명시.
- ☑ **재현 가능한 빌드** — lockfile (package-lock/uv.lock/poetry.lock/terraform.lock.hcl) 커밋 + 사용. 환경 변수/툴 버전 명시.
```
```
<!-- patch boundary -->

### B.6 — Examples에 사용 예시 추가

**위치**: `# Examples` 섹션 끝, 기존 `## Example 2` 다음.

**삽입 본문**:

<!-- patch boundary -->
````markdown
## Example 3: Infra-automation, scope clarified up-front

```
User: /plan-acc "github actions 로컬에서 검증하고 싶어"

[plan-acc] Phase 1
Scores:
  infra-automation : 5 (github actions, 로컬 검증, ...)
  claude-tooling   : 1 (automation 약 매칭)
  others           : 0
Template: infra-automation (high confidence)

[plan-acc] Phase 2 (INVEST + Sub-domains A,B,C,D,E,F)
A1. 대상 CI 플랫폼은? → GitHub Actions
A2. 신규/보강? → 보강 (기존 ci.yml + release.yml + release-please.yml 존재)
B8. 로컬 검증 도구? → actionlint + act + custom Makefile
B9. fidelity? → static lint + shell command 미러 (Docker는 옵션)
C14. secrets? → GITHUB_TOKEN (자동), 없음 (PAT 없음)
... (전체 사전 결정사항 일괄 응답)

[plan-acc] Phase 3 AC Validation
✅ 모든 task에 4개 mandatory AC(Local validation, Secrets 문서화, Rollback, Supply-chain) 포함됨
✅ Out-of-scope 명시: IaC(D 그룹), Provenance signing (이번 작업 범위 외)

[plan-acc] Phase 4
✅ Saved: .claude/plan-acc/2026-XX-XX_local-ci-validation.md
✅ TodoWrite: 6 tasks with AC
```
````
<!-- patch boundary -->

---

## Section C — Task list (for Receiving Claude)

각 task는 INVEST + AC 검증을 통과한 상태입니다.

### T1: SKILL.md에 Phase 1 keyword 표 행 추가 (B.1 적용)

- **Effort**: XS
- **AC**:
  - Given: SKILL.md를 read하면
  - When: `## Phase 1: Archetype Selection` 섹션의 keyword 표를 본다
  - Then: `infra-automation` 행이 마지막에 존재, ~32개 키워드 포함
  - Verification: `grep -E "^\| \*\*infra-automation\*\*" SKILL.md` exit 0 + 행 1건
  - Negative: 기존 5개 행 텍스트가 단일 토큰 단위로 변경되지 않음 (diff 검사)
  - Termination: SKILL.md가 정상 markdown으로 파싱 (예: `pandoc -t plain SKILL.md > /dev/null` exit 0, 또는 동등 검증)

### T2: tie-break frequency_priority + rationale 갱신 (B.2 적용)

- **Effort**: XS
- **AC**:
  - Given: SKILL.md의 `step_3_tie_break.frequency_priority` 라인
  - When: 값이 6개 원소를 가진 list 형태로 표시됨
  - Then: `infra-automation`이 6번째 원소 (말미)
  - Verification: `grep -A1 "frequency_priority:" SKILL.md | grep "infra-automation"` exit 0
  - Negative: 기존 5개 원소의 ordering이 변경되지 않음
  - Termination: rationale 줄에 "Infra-Automation=seed" 또는 동등 표현 포함

### T3: sc_research_fallback prompt 갱신 (B.3 적용)

- **Effort**: XS
- **AC**:
  - Given: SKILL.md의 `/sc:research Integration` 섹션
  - When: invoke 문자열의 archetype enumeration을 본다
  - Then: 6개 archetype 이름이 정확한 순서로 포함됨
  - Verification: `grep "design-system, claude-tooling, game-engine, ml-research, web-application, infra-automation" SKILL.md` exit 0 (정확히 1건)
  - Negative: 기존 prompt 문장 구조(앞·뒤 문구)는 변경되지 않음
  - Termination: 문자열이 유효한 single-line yaml 값

### T4: Output Schema enum 갱신 (B.4 적용)

- **Effort**: XS
- **AC**:
  - Given: SKILL.md의 `# Output Schema` 섹션
  - When: `archetype: enum [...]` 줄을 본다
  - Then: enum에 6개 archetype 포함, 마지막이 `infra-automation`
  - Verification: `grep "archetype: enum \[design-system, claude-tooling, game-engine, ml-research, web-application, infra-automation\]" SKILL.md` exit 0
  - Negative: schema 들여쓰기 일관성 유지 (4-space)
  - Termination: 인접한 다른 schema 필드 변경 없음

### T5: Template 6 본문 삽입 (B.5 적용) — 가장 큰 작업

- **Effort**: M
- **AC**:
  - Given: SKILL.md를 read하면
  - When: `### Template 5: Web Application` 다음 `---` 뒤를 본다
  - Then: `### Template 6: Infra Automation` 섹션이 통째로 존재
  - 포함 sub-sections (모두 grep으로 확인 가능):
    - `Template ID:` (`infra-automation` · Revision 1)
    - `예시 프로젝트:` (oriental-design-system 참조)
    - `기획 관심사:` (CI/CD, 로컬 검증, Secrets, IaC, supply-chain, rollback)
    - `경계 규칙` (claude-tooling과의 산출물 기준 구분)
    - `Template Q&A:` (A/B/C/D/E/F 6 그룹, 총 32개 sub-domain 질문)
    - `[Infra-Automation AC 강제]:` (5개 ☑ 항목)
  - Verification: `grep -c "^### Template " SKILL.md` 출력이 기존+1 (5→6)
  - Verification: `grep "Template 6: Infra Automation" SKILL.md` exit 0
  - Verification: `grep -c "^[A-F]\. " SKILL.md` 출력이 +6 (6 그룹 헤더)
  - Negative: Template 5(Web Application) 섹션 내용 변경 없음 (해당 섹션 hash 또는 line-by-line diff 일치)
  - Termination: 6번째 Template 뒤 `---` 구분선이 `## Phase 3:` 섹션 시작 전에 존재

### T6: Examples에 Example 3 추가 (B.6 적용)

- **Effort**: S
- **AC**:
  - Given: SKILL.md의 `# Examples` 섹션
  - When: section 끝부분을 본다
  - Then: `## Example 3: Infra-automation, scope clarified up-front` 섹션 존재
  - Verification: `grep "## Example 3:" SKILL.md` exit 0
  - Verification: example 본문이 가상 user input(`github actions 로컬에서 검증`)을 포함
  - Negative: Example 1, Example 2 내용 변경 없음
  - Termination: code fence (triple backtick + single backtick) 정합

### T7: 정합성 final check — SKILL.md 전역 archetype 리스트 일관성

- **Effort**: M (전체 파일 read-through + 누락 수정)
- **AC**:
  - Given: SKILL.md 전체
  - When: archetype 이름이 enumerate되는 모든 위치를 검색
    - 검색 패턴: `design-system|claude-tooling|game-engine|ml-research|web-application` 단어 동시 등장 구간
  - Then: T1~T6 패치 이후, 모든 enumeration 위치에 `infra-automation`이 포함되거나, 의도적으로 5개만 언급하는 컨텍스트(예: 기존 사례 회고)임이 명시
  - Verification 1: `grep -nE "design-system.*claude-tooling.*game-engine.*ml-research.*web-application" SKILL.md`로 발생 위치 모두 나열, 각각 infra-automation 포함 여부 검사
  - Verification 2: `grep -c "Template 6: Infra Automation\|infra-automation" SKILL.md` ≥ 10 (Phase 1 표, tie-break, sc:research, Output Schema, Template 6 본문, Example 3, AC gates 본문 등)
  - Negative: skill의 YAML frontmatter / front matter description 등 본문 밖 메타데이터는 변경되지 않음 (변경이 필요하면 별도 task로 분리 권장)
  - Termination: 누락 위치 없음 → 보고

### T8: 회귀 시뮬레이션 — 기존 5개 archetype 자동 선택 무변동 확인

- **Effort**: S
- **AC**:
  - Given: SKILL.md의 기존 `# Examples` 섹션에 명시된 user goal 2개
    - Example 1: "디자인 시스템에 Button 컴포넌트 variant 3개 추가" → design-system: 4
    - Example 2: "AI로 사용자 게시물 모더레이션 자동화" → tie(ml-research, web-application)
  - When: T1 적용 후 keyword 매트릭스를 재실행 (수작업 또는 스크립트)
  - Then:
    - Example 1: design-system 점수 4 변동 없음, infra-automation 점수 0
    - Example 2: ml-research 2, web-application 2, infra-automation 0~1 (tied-with-others 시 tie-break 동작 동일)
  - Verification: 매뉴얼 keyword grep 시뮬레이션
    - `Goal: "디자인 시스템에 Button 컴포넌트 variant 3개 추가"`에서 `CI|CD|github actions|...` 매칭 0건
    - `Goal: "AI로 사용자 게시물 모더레이션 자동화"`에서 infra-automation 키워드 매칭 0건
  - Negative: 어떤 기존 Example이라도 archetype 선택이 변경되면 → 키워드 충돌. infra-automation의 키워드 목록에서 충돌 토큰 제거 후 재시도. max 3 iterations.
  - Termination: 모든 Example의 archetype selection이 unchanged임을 명시적으로 보고

---

## Section D — Out-of-Scope (이번 작업에서 명시적 제외)

원칙 #4 (NO Over-Engineering)에 따라 다음은 포함하지 않습니다:

- **새 archetype의 unit-test 인프라 구축**: plan-acc skill 자체에는 자동 테스트가 없음. T8의 매뉴얼 회귀가 대안.
- **Past sessions의 retro-classification**: 기존 `.claude/plan-acc/*` 출력 파일들을 새 archetype으로 재분류하지 않음.
- **DevOps / Cloud Engineer 자격 영역**: 본 archetype은 작업 단위 plan 산출에 한정. 조직 정책/SRE 문화 가이드는 별도.
- **자동 keyword 학습 / 빈도 갱신**: SKILL.md의 `post_review` 루프와 유사한 자동 학습은 추가하지 않음. tie-break frequency는 maintainer가 수동 갱신.
- **`/local-ci` skill과의 통합**: 본 archetype은 plan 단계 전담. /local-ci는 실행 단계 — 서로 호출하지 않음.

---

## Section E — Open Questions (deferred to maintainer 재량)

1. **Tie-break ordering 정밀화**: 본 패치는 infra-automation을 말미에 추가. 누적 사용 후 실제 빈도에 맞춰 재정렬 권장 (예: claude-tooling보다 자주 사용되면 4번째 위치로 승격).
2. **claude-tooling 템플릿 자체 정리**: 현재 claude-tooling에 "automation" 키워드가 있어 infra와 약한 충돌. 회귀 시 충돌이 잦으면 claude-tooling에서 일반 "automation"을 빼고 "claude automation" 또는 "skill automation"으로 좁히는 것 고려.
3. **IaC sub-domain 분리 가능성**: 향후 Terraform 작업 빈도가 높아지면 `infra-automation`에서 `iac`만 따로 Template 7로 분리 검토.
4. **Examples 섹션 확장**: 본 패치는 Example 3 하나만 추가. infra-automation의 debate/edge case 시나리오(예: tie-break 발동) Example 4 추가 검토.

---

## Section F — Meta (planning artifact 자체에 대한 정보)

```yaml
plan_acc_session:
  meta:
    skill_version: "1.0.0"
    timestamp: "2026-05-13T01:32+09:00"
    user_goal: "github actions 에서 빌드 에러를 보고 싶지 않아. ... github actions 를 로컬에서 검증할 방법을 연구해서 마련해줘."
    pivoted_to: "Add Template 6 'infra-automation' to plan-acc skill (meta-work)"
    archetype: "claude-tooling"  # of the meta-work itself
    template_revision: 1
    archetype_confidence: "HIGH"
    archetype_selection_method: "user_picked"
    unknown_archetype_flag: true  # 원본 goal은 unknown → 새 archetype 생성 결정
  qa_log:
    invest_implied:
      I: "독립 — plan-acc skill 단일 파일 수정"
      N: "양보 가능: B.6 (Example 3)는 maintainer가 빼도 무방. 양보 불가: Template 6 본문(B.5)과 6개 archetype enumeration 정합성(T7)"
      V: "사용자: 향후 infra 작업이 정확한 plan-acc 흐름을 탈 수 있음. 다음 plan-acc 호출 시 가정 없이 진행"
      E: "1-2일 (maintainer Claude 단일 세션)"
      S: "8 tasks, 4개 sub-skill (markdown 편집, grep 검증, 정합성 확인, 회귀 시뮬레이션)"
      T: "각 task에 grep-based verification + manual confirmation"
    template_specific: "산출물 기준 boundary / 4개 AC gates / 4개 sub-domain (사용자 확정)"
  tasks: 8
  out_of_scope: 5
  open_questions: 4
  ac_validation:
    passed: 8
    failed: 0
    iterations: 1
```

---

## 전달자(사용자)에게 한 줄 요약

> 위 Section B의 6개 markdown patch + Section C의 8개 task를 plan-acc skill의 maintainer Claude 세션에 그대로 전달하면, 1-2일 안에 Template 6 (`infra-automation`) revision 1이 SKILL.md에 통합됩니다. 머지 후 본인 환경에서 `/plan-acc "github actions 로컬 검증"` 호출 → infra-automation auto-selected → 본래 의도한 정확한 plan 진행 가능.
