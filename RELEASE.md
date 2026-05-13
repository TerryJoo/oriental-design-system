# Release Runbook

Canonical release process for `@jyi/design-system`.

## 1. Overview

이 저장소는 GitHub Packages 레지스트리로 배포되며, 모든 릴리스는 자동화되어 있습니다. Release Please가 `main`에 누적된 Conventional Commits를 읽어 버전 번호와 `CHANGELOG.md`를 관리하고, 릴리스 태그가 생성되면 `release.yml` 워크플로우가 sigstore provenance와 함께 패키지를 publish합니다. 개발자는 Conventional Commit 메시지로 PR을 머지하기만 하면 되고, 직접 태그를 자르거나 `npm publish`를 실행하지 않습니다.

## 2. Conventional Commits guide

현재 0.x 메이저 버전이므로 `release-please` 설정이 `bump-minor-pre-major`로 동작합니다. 1.0.0 도달 전까지는 breaking change도 메이저가 아닌 마이너로 올라갑니다.

| Commit type                | Pre-1.0 effect | Post-1.0 effect |
| -------------------------- | -------------- | --------------- |
| `feat:`                    | minor          | minor           |
| `fix:`                     | patch          | patch           |
| `feat!:` / `BREAKING CHANGE` footer | minor | major           |
| `perf:`                    | patch          | patch           |
| `refactor:` / `docs:` / `chore:` / `test:` / `style:` / `build:` / `ci:` | no version bump | no version bump |

오직 `main` 브랜치에 들어간 커밋만 Release Please가 인식합니다. 본 저장소는 squash-merge 정책을 사용하므로, **squash commit 메시지**가 Conventional Commit 형식이어야 합니다 (PR 본문의 개별 커밋 메시지는 무시됩니다).

Example commit messages (good):

```
feat(Sidebar): add collapsible footer slot with aria-controls wiring

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

```
fix(Popover): drop opacity ramp from enterKeyframes to satisfy axe color-contrast
```

```
feat(tokens)!: rename --era-shadow-card to --era-shadow-surface

BREAKING CHANGE: consumers reading --era-shadow-card must update to --era-shadow-surface.
```

```
perf(KanbanBoard): memoize column drop targets to cut re-renders on drag-over
```

```
docs(README): document GitHub Packages installation flow
```

```
chore(deps): bump @storybook/test-runner to 0.19.1
```

기존 커밋 히스토리 (`4d8c480`, `bd4b829` 등)와 일관성을 유지하기 위해, Claude Code가 작성한 변경분에는 다음 trailer를 포함합니다:

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

## 3. Release flow (end-to-end)

1. 개발자가 feature 브랜치에서 Conventional Commit 메시지로 커밋하고 PR을 엽니다.
2. PR 리뷰 후 squash-merge로 `main`에 통합합니다. **squash commit 메시지는 반드시 Conventional Commit 형식**이어야 합니다.
3. `.github/workflows/release-please.yml`이 매 `main` push마다 실행되어, 단일 "Release PR"을 열고 유지합니다. PR 제목은 `chore(main): release X.Y.Z` 형식이며, `package.json`, `.release-please-manifest.json`, `CHANGELOG.md`를 누적 업데이트합니다.
4. 릴리스를 자를 준비가 되면 Release PR을 머지합니다.
5. Release Please가 git tag (`vX.Y.Z`)와 GitHub Release를 생성합니다.
6. Release event가 `.github/workflows/release.yml`을 트리거합니다:
   - **`gates` job** — `.github/workflows/ci.yml`을 `workflow_call`로 재사용합니다. lint, typecheck, test, build, a11y-gate 등 CI 전 단계를 통과해야 다음 job으로 넘어갑니다.
   - **`publish` job** — 태그가 `main`에 있는지 확인 → 태그 버전과 `package.json` 버전 일치 검증 → 멱등성 가드 (`npm view`로 이미 published된 경우 skip) → `npm run build` + `npm run pack:check` → `npm publish --provenance --access restricted`로 GitHub Packages에 sigstore attestation과 함께 publish.
   - **`smoke-test` job** — 깨끗한 tmpdir에서 방금 publish된 버전을 install하고, 엔트리 포인트 import와 CSS 자산 존재를 검증합니다.

## 4. First release checklist (one-time setup)

첫 Release PR을 머지하기 전에 확인할 항목들:

- [ ] GitHub 저장소 visibility가 **Private**으로 설정되어 있다 (Settings → General → Danger Zone → Change visibility).
- [ ] 추가 secret이 필요 없다 — 워크플로우는 자동 발급되는 `secrets.GITHUB_TOKEN`을 사용합니다.
- [ ] GitHub Packages에서 `@jyi` 스코프가 다른 계정에 선점되어 있지 않다.
- [ ] `main`에서 CI가 통과한다 (그렇지 않으면 `workflow_call` 재사용도 실패합니다).
- [ ] (Optional) 로컬에서 publint + attw를 검증한다:

  ```
  npm run pack:check
  ```

## 5. Rollback / deprecation

GitHub Packages는 publish 후 **30분 unpublish 윈도우**가 지나면 해당 버전을 삭제할 수 없습니다. 잘못된 버전을 회수하려면 deprecate를 사용합니다:

```
npm deprecate '@jyi/design-system@x.y.z' "Reason: <short explanation>. Use @jyi/design-system@x.y.{z+1} instead."
```

이후 수정 패치를 평소 Conventional Commits 흐름으로 준비합니다 (`fix:` 커밋을 `main`에 머지 → Release Please가 `x.y.{z+1}`로 bump).

문제된 버전이 latest인 경우, `npm view`가 해당 버전을 노출하지 않도록 GitHub Release를 pre-release로 재태깅하거나 수동 삭제하는 것을 함께 고려합니다.

## 6. Troubleshooting

**`npm ERR! 403 Forbidden` during publish**
publish job의 `secrets.GITHUB_TOKEN`에 `packages: write` 권한이 있는지 확인합니다 (본 워크플로우 기본값에서는 포함되어 있습니다). 또한 저장소 owner/org가 GitHub Packages의 `@jyi` 스코프를 소유하고 있어야 합니다.

**`npm ERR! 409 Conflict` during publish**
이미 레지스트리에 올라간 버전입니다. `release.yml`의 멱등성 가드가 정상이라면 publish 자체를 skip해야 하므로, 이 에러가 보인다면 `npm view` 호출이 조용히 실패했을 가능성이 있습니다. 워크플로우 로그를 확인합니다.

**Release PR이 안 열린다**
Release Please는 마지막 릴리스 이후 `main`에 릴리스 대상 커밋이 최소 1개 이상 있어야 PR을 엽니다. 커밋 메시지가 Conventional Commits 형식인지, 단순 `chore:` / `docs:`만 누적된 것은 아닌지 확인합니다.

**`smoke-test`가 `Cannot find module`로 실패한다**
패키지의 `exports` 맵이나 `files: ["dist"]` 설정이 기대하는 엔트리 포인트를 포함하지 않을 수 있습니다. 로컬에서 다음을 실행해 tarball 파일 목록을 확인합니다:

```
npm pack --dry-run
```

**Consumer가 install하지 못한다**
다음 두 조건이 모두 필요합니다:

1. `.npmrc`에 다음 두 줄이 있어야 합니다:
   ```
   @jyi:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=<PAT>
   ```
2. PAT에 `read:packages` 권한이 있고, **저장소가 private이므로** consumer 계정이 해당 저장소의 collaborator/membership 권한도 갖고 있어야 합니다.

## 7. Local pre-release validation

Release PR을 push하기 전에 로컬에서 검증하고 싶다면:

```
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
npm run pack:check       # publint + attw
npm pack --dry-run       # inspect the tarball file list
```

개발자 머신에서 `npm publish`를 직접 실행하는 것은 지원하지 않습니다. `prepublishOnly` 훅이 전체 게이트를 돌리긴 하지만, **실제 publish는 반드시 `release.yml` 워크플로우를 통해서만** 수행하여 provenance attestation을 보장합니다.
