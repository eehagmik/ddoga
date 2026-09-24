#!/usr/bin/env bash
#
# 디자인 시스템 하네스 설치 스크립트
#
# 생성물:
#   CLAUDE.md                          루트 프로젝트 규칙 (토큰/컴포넌트/Storybook/위임/빌드)
#   .claude/CLAUDE.md                  7단계 작업 프로세스 + 금지사항
#   .claude/agents/figma-implementer.md  Figma URL → 5단계 구현 에이전트
#   .claude/agents/token-checker.md      토큰 일관성 감사 에이전트
#   .claude/hooks/check-tokens.cjs         하드코딩 감지 (PostToolUse, exit 2 차단)
#   .claude/hooks/check-storybook.cjs      4파일 구조 + CSF3 검증 (PostToolUse, exit 2 차단)
#   .claude/hooks/notify.cjs               OS별 데스크탑 알림 (Stop/Notification)
#   .claude/settings.json                hooks 연결 + .env 읽기 차단
#   docs/DESIGN.md                       브랜드/색상/스페이싱/조합/Figma 네이밍
#   src/styles/tokens.css                토큰 SSOT 시드 (@theme)
#
# 사용법:
#   bash install.sh          기존 파일은 건너뜀
#   bash install.sh --force  기존 파일 덮어쓰기
#
set -euo pipefail

FORCE=0
[[ "${1:-}" == "--force" || "${1:-}" == "-f" ]] && FORCE=1

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "▶ 디자인 시스템 하네스 설치 — $ROOT"

# node 확인 (hook 실행에 필요)
if command -v node >/dev/null 2>&1; then
  echo "  node: $(node --version)"
else
  echo "  ⚠ node 를 찾을 수 없습니다. hook(check-tokens/check-storybook/notify)이 동작하려면 Node.js 가 필요합니다."
fi

mkdir -p .claude/agents .claude/hooks docs src/styles src/components

write_file() {
  local path="$1"
  if [[ -e "$path" && "$FORCE" != "1" ]]; then
    echo "  skip (이미 존재): $path"
    cat > /dev/null
    return
  fi
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "  write: $path"
}

# ─────────────────────────────────────────────────────────────
write_file "CLAUDE.md" <<'HARNESS_EOF'
# 프로젝트 규칙 — 디자인 시스템

Figma 디자인 시스템을 코드로 변환하는 프로젝트다. 아래 규칙은 **모든 작업에 강제**된다.
작업 방식(7단계 프로세스, 승인 규칙)은 `.claude/CLAUDE.md`, 디자인 의도는 `docs/DESIGN.md` 참조.

기술 스택: **React + TypeScript + Tailwind v4 + Storybook 8**

---

## 1. 토큰 사용 규칙 (하드코딩 금지)

**토큰 값을 코드에 직접 쓰지 않는다.** 모든 색상·간격·타이포·radius·shadow는 토큰을 경유한다.

| 항목 | 금지 | 허용 |
| --- | --- | --- |
| 색상 | `#3b82f6`, `rgb(59 130 246)`, `hsl(...)` | `var(--color-primary)`, Tailwind 유틸 `bg-primary` `text-danger` |
| 간격 | `padding: 16px`, `gap-[12px]` | `var(--spacing-md)`, Tailwind 스케일 `p-4` `gap-3` |
| Radius | `border-radius: 8px` | `var(--radius-md)`, `rounded-md` |
| Shadow | `box-shadow: 0 1px 2px ...` | `var(--shadow-sm)`, `shadow-sm` |
| 폰트 | `font-size: 14px`, `font-weight: 600` | `var(--text-sm)`, `text-sm font-semibold` |

- 토큰의 **단일 진실 공급원(SSOT)** 은 `src/styles/tokens.css` 의 `@theme` 블록이다.
- 디자인에 필요한 값이 토큰에 없으면 → **코드에 값을 쓰지 말고** 먼저 `@theme`에 새 토큰을 추가한다 (이름은 시맨틱하게: `--color-surface-raised`, `--spacing-2xs`).
- 예외: `0`, `1px` 보더, `100%` / `auto` 같은 레이아웃 상수는 허용. `50%`(원형) 등도 허용.
- PostToolUse hook(`.claude/hooks/check-tokens.cjs`)이 하드코딩을 감지하면 **편집이 차단**된다.

---

## 2. 컴포넌트 구조 (1 컴포넌트 = 4 파일)

컴포넌트는 `src/components/<Name>/` 디렉토리 아래 **정확히 4개 파일**로 구성한다.

```
src/components/Button/
├── Button.tsx          # 구현 (named export)
├── Button.stories.tsx  # Storybook (CSF3)
├── Button.test.tsx     # 테스트 (Vitest + Testing Library)
└── index.ts            # 배럴: export * from './Button'
```

규칙:
- 컴포넌트는 **named export** (`export function Button`), default export 금지.
- Props 인터페이스는 `<Name>Props`로 명명하고 같은 파일에서 export.
- 스타일은 Tailwind 유틸 우선, 복잡하면 `cn()` 조합.
- `index.ts`는 배럴 재export만. 로직 금지.
- 4파일 중 하나라도 없으면 hook(`.claude/hooks/check-storybook.cjs`)이 편집을 차단한다.

---

## 3. Storybook 규칙

- **CSF3 형식**: `Meta` / `StoryObj` 타입, `satisfies Meta<typeof Component>`.
- `meta.tags`에 **`'autodocs'` 필수**.
- 각 스토리에 **`play` function 최소 1개** — 렌더 검증 또는 상호작용 테스트.
- Props는 `argTypes`로 문서화 (control 타입, description).
- 최소 스토리: `Default` + 주요 variant/state 각각.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'], description: '시각적 강조 수준' },
  },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: 'primary', children: 'Click me' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeInTheDocument();
  },
};
```

---

## 4. 에이전트 위임 규칙

메인 스레드에서 Figma 구현이나 대규모 토큰 점검을 **직접 하지 않는다.** 전담 에이전트에 위임한다.

| 트리거 | 위임 대상 | 비고 |
| --- | --- | --- |
| Figma URL 수신 / "이 디자인 구현해줘" | `figma-implementer` | 5단계 프로세스로 4파일 생성까지 |
| "토큰 일관성 점검" / 구현 후 검증 | `token-checker` | 하드코딩·불일치 리포트 (수정은 안 함) |
| 코드베이스 광범위 탐색 | `Explore` | 결론만 회수 |

- `figma-implementer`가 실패를 2회 재시도 후에도 못 풀면 보고를 받고 사용자와 상의한다.
- 위임 결과(생성 파일 목록, 검증 통과 여부)를 사용자에게 요약 보고한다.

---

## 5. 빌드 / 검증 명령어

> 패키지 매니저는 `npm` (잠금파일 `package-lock.json`).

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`tsc -b && vite build`) |
| `npm run typecheck` | 타입 체크 (`tsc -b`) |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook 개발 서버 (포트 6006) |
| `npm run build-storybook` | Storybook 정적 빌드 (스토리 무결성 검증) |
| `npm run test:run` | 단위 테스트 단발 실행 (Vitest + jsdom + Testing Library) |
| `npm test` | 테스트 watch 모드 — CI/검증엔 `test:run` 사용 |

**컴포넌트 완료 기준**: `npm run typecheck && npm run test:run && npm run build-storybook` 전부 통과 + `token-checker` 클린.
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file ".claude/CLAUDE.md" <<'HARNESS_EOF'
# 작업 방식 규칙

이 파일은 **어떻게 일할지**를 규정한다. **무엇을 만들지**의 규칙은 루트 `CLAUDE.md` 참조.

---

## 7단계 작업 프로세스

모든 비자명한 작업은 아래 순서를 따른다. 각 단계를 건너뛰지 않는다.

| # | 단계 | 하는 일 | 산출물 |
| --- | --- | --- | --- |
| 1 | **이해 (Understand)** | 요청의 목표·범위·완료 조건을 한 문장으로 재진술. 모호하면 질문. | 재진술 문장 |
| 2 | **분석 (Analyze)** | 제약(토큰 규칙, 4파일 구조, 기존 패턴), 영향 범위, 리스크 식별. | 제약·리스크 목록 |
| 3 | **탐색 (Explore)** | 재사용 가능한 기존 컴포넌트·유틸·토큰 검색. 없을 때만 신규. 넓으면 `Explore` 에이전트. | 재사용 후보 / 신규 필요 항목 |
| 4 | **계획 (Plan)** | 파일 단위 변경 계획. 생성/수정 파일, 새 토큰, 검증 방법 명시. | 계획서 |
| 5 | **실행 (Execute)** | 계획 승인 후에만 코드 작성. 계획에서 벗어나면 멈추고 재승인. | 코드 |
| 6 | **검증 (Validate)** | `typecheck` + `test` + `build-storybook` + `token-checker`. hook 통과. | 통과 로그 |
| 7 | **완료 (Complete)** | 변경 요약, 생성 파일 목록, 남은 TODO, 후속 제안. | 완료 보고 |

---

## 코드 작성 전 승인 필수

- **4단계(계획) → 5단계(실행) 전환에는 사용자 승인이 반드시 필요하다.**
- 승인 없이 컴포넌트 파일·설정·토큰을 생성/수정하지 않는다.
- 계획 제시는 다음을 포함한다: 생성/수정 파일 경로, 추가할 토큰, 재사용하는 기존 코드, 검증 절차.
- 승인 후에도 계획과 다른 결정이 필요하면 **작업을 멈추고** 차이를 설명한 뒤 재승인받는다.
- 예외 (승인 불필요): 읽기 전용 탐색, 오타 수정, 사용자가 "바로 진행"이라 명시한 경우.

---

## 금지사항

| 금지 | 이유 | 대안 |
| --- | --- | --- |
| 색상·간격·radius·shadow·폰트 값 하드코딩 | 디자인 시스템 일관성 붕괴, Figma와 drift | `var(--*)` / Tailwind 토큰 유틸 사용, 없으면 `@theme`에 토큰 추가 |
| 토큰 정의를 `@theme` 블록 밖에 작성 | SSOT 분산, hook·툴링이 인식 못 함 | `src/styles/tokens.css`의 `@theme` 안에만 정의 |
| 4파일 구조 위반 (일부 파일 누락) | 스토리·테스트 없는 컴포넌트 양산 | 4파일 세트를 항상 함께 생성 |
| `play` function 없는 스토리 | 렌더 회귀를 못 잡음 | 모든 스토리에 최소 1개 `play` 추가 |
| `autodocs` 태그 누락 | 문서 자동생성 안 됨 | `meta.tags: ['autodocs']` |
| 계획 승인 없이 코드 작성 | 방향 오류를 늦게 발견 | 4단계에서 계획 제시 후 승인 대기 |
| Figma 디자인을 메인 스레드에서 직접 구현 | 프로세스 표준화 우회, 검증 누락 | `figma-implementer` 에이전트에 위임 |
| `.env` / `.env.*` 읽기 | 비밀 노출 | 필요한 값은 사용자에게 직접 요청 |
| `default export` 컴포넌트 | 배럴·리팩터링 일관성 저해 | `export function <Name>` (named) |
| 검증(6단계) 없이 완료 보고 | 깨진 코드를 완료로 처리 | 4종 검증 통과 로그 첨부 |
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file ".claude/agents/figma-implementer.md" <<'HARNESS_EOF'
---
name: figma-implementer
description: Figma URL 또는 "이 디자인 구현해줘" 요청을 받으면 5단계 프로세스(Clarify → Context Gather → Plan → Generate → Evaluate)로 React + TypeScript + Tailwind v4 컴포넌트를 4파일 구조로 구현한다. 토큰 하드코딩을 절대 하지 않으며, 실패 시 2회 재시도 후 보고한다.
tools: Read, Write, Edit, Grep, Glob, Bash, mcp__plugin_figma_figma__get_design_context, mcp__plugin_figma_figma__get_screenshot, mcp__plugin_figma_figma__get_metadata, mcp__plugin_figma_figma__get_variable_defs, mcp__plugin_figma_figma__get_code_connect_map
---

# figma-implementer

Figma 디자인을 이 프로젝트의 규칙(루트 `CLAUDE.md`, `docs/DESIGN.md`)에 맞는 코드로 변환한다.

## 절대 규칙

- 색상/간격/radius/shadow/폰트 값을 **하드코딩하지 않는다**. `var(--*)` 또는 Tailwind 토큰 유틸만.
- 필요한 토큰이 `src/styles/tokens.css`의 `@theme`에 없으면 → 거기 먼저 추가하고 사용.
- 컴포넌트는 `src/components/<Name>/` 아래 **4파일**: `<Name>.tsx`, `<Name>.stories.tsx`, `<Name>.test.tsx`, `index.ts`.
- Storybook은 CSF3 + `tags: ['autodocs']` + 스토리별 `play` 최소 1개.
- Plan 단계 승인 전에는 파일을 만들지 않는다.

---

## 5단계 프로세스

### 1. Clarify
불명확하면 **먼저 질문한다** (질문 없이 추측 금지):
- 대상 노드/프레임이 특정되었는가? (URL에 `node-id` 있는지 확인)
- 반응형 범위 (모바일/데스크탑 both? 브레이크포인트?)
- 인터랙션 상태 (hover, focus, active, disabled, loading)
- 이 컴포넌트가 기존 컴포넌트의 variant인가, 신규인가?
질문이 없으면 이 단계를 건너뛰고 진행해도 된다.

### 2. Context Gather
- `get_metadata` → 노드 트리 개요 파악.
- `get_design_context` → 레이아웃·스타일·계층 추출.
- `get_screenshot` → 시각적 대조 기준 확보.
- `get_variable_defs` → Figma 변수(토큰) 이름·값 목록 확보.
- `get_code_connect_map` → 이미 매핑된 코드 컴포넌트가 있는지 확인 (있으면 재사용).
- `src/styles/tokens.css` 를 읽어 코드 토큰과 Figma 변수를 **이름·값으로 대조**.
  - 매칭되는 토큰: 해당 `var(--*)` 사용.
  - Figma엔 있는데 코드에 없는 토큰: `@theme`에 추가할 목록에 기록.
  - 이름이 다른데 값이 같은 경우: 코드 토큰 이름을 정본으로 삼음.
- `src/components/` 를 훑어 재사용 가능한 기존 컴포넌트 확인.

### 3. Plan
사용자에게 다음을 제시하고 **승인 대기**:
- 컴포넌트 이름, 경로, Props 인터페이스 초안.
- 생성할 4파일 목록.
- `@theme`에 추가할 새 토큰 (이름 + 값 + 근거).
- 재사용하는 기존 컴포넌트/유틸.
- variant / state 매트릭스 (스토리로 만들 목록).
- 검증 방법.

### 4. Generate
승인 후 4파일 생성:
- `<Name>.tsx` — named export, `<Name>Props` export, Tailwind 유틸 우선. `cn()` 유틸로 조건부 클래스.
- `<Name>.stories.tsx` — CSF3, `autodocs`, `argTypes` 문서화, 각 스토리 `play` (렌더 assert 또는 `userEvent` 상호작용).
- `<Name>.test.tsx` — Vitest + Testing Library. 렌더, props 반영, 접근성 role, 주요 상호작용.
- `index.ts` — `export * from './<Name>';` 만.
- 필요 시 `src/styles/tokens.css` `@theme`에 토큰 추가.

### 5. Evaluate
```
npm run typecheck && npm run test:run && npm run build-storybook
```
그리고 `token-checker` 에이전트를 호출해 하드코딩·불일치 리포트를 받는다.
- `get_screenshot` 결과와 구현을 눈으로 대조 (간격/정렬/색).
- 실패 항목이 있으면 4단계로 돌아가 수정.

---

## 재시도 & 실패 보고

- Generate 또는 Evaluate가 실패하면 **최대 2회** 자체 수정 재시도한다.
  - 재시도 1: 에러 메시지 기반 직접 수정.
  - 재시도 2: 접근 방식 변경 (다른 컴포넌트 구조, 다른 토큰 매핑).
- 2회 재시도 후에도 통과하지 못하면 **중단하고 보고**한다:
  - 무엇을 시도했는가 (재시도별로).
  - 정확한 에러 / 검증 실패 내용.
  - 막힌 지점의 원인 추정.
  - 사람의 결정이 필요한 선택지.
- 실패 상태로 "완료"를 보고하지 않는다. 부분 결과는 명시적으로 "미완료"로 표시.

## 완료 보고 형식

```
## 구현 완료: <Name>
- 생성 파일: src/components/<Name>/{Name}.tsx, .stories.tsx, .test.tsx, index.ts
- 추가 토큰: --color-x (#..), --spacing-y (..)  ← @theme
- 재사용: <기존 컴포넌트>
- 검증: typecheck / test / build-storybook / token-checker
- 스크린샷 대조: 일치 / 차이(<설명>)
```
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file ".claude/agents/token-checker.md" <<'HARNESS_EOF'
---
name: token-checker
description: 코드의 토큰 사용을 검증한다. 하드코딩된 색상/간격/radius/shadow/폰트 값을 찾고, src/styles/tokens.css의 @theme 정의 및 Figma 변수와 대조해 불일치·미정의 참조를 표로 리포트한다. 기본적으로 수정하지 않고 리포트만 한다.
tools: Read, Grep, Glob, Bash, mcp__plugin_figma_figma__get_variable_defs
---

# token-checker

토큰 일관성 감사 전용 에이전트. **기본은 리포트만** — 사용자가 명시적으로 요청할 때만 수정한다.

## 입력

- 검사 대상: 사용자가 지정한 파일/디렉토리 목록. 없으면 `src/components/**/*.{tsx,ts,css}` 전체.
- (선택) Figma 파일 URL — 있으면 `get_variable_defs`로 Figma 변수를 가져와 대조.

## 절차

### 1. 토큰 정의 파싱
`src/styles/tokens.css` 의 `@theme { ... }` 블록에서 커스텀 프로퍼티를 수집한다.
→ `{ 토큰명: 값 }` 맵 구성. (예: `--color-primary: oklch(0.62 0.19 255)`)

### 2. 하드코딩 스캔
대상 파일에서 다음 패턴을 찾는다 (라인 번호 포함):
- Hex 색상: `#[0-9a-fA-F]{3,8}` (단, `tokens.css` 자체는 제외)
- 함수형 색상: `rgb(`, `rgba(`, `hsl(`, `hsla(`, `oklch(` — `tokens.css` 밖에서
- 리터럴 px: `\b\d+px\b` (예외: `0`, `1px` 보더)
- Tailwind 임의값: `\[[0-9]+px\]`, `\[#[0-9a-fA-F]+\]`, `\[rgb`
- 인라인 `style={{ ... }}` 안의 색상/치수 리터럴

### 3. 대조
- 발견한 하드코딩 값이 `@theme` 토큰 중 하나와 **값이 일치**하면 → "해당 토큰으로 교체" 권장.
- 일치하는 토큰이 없으면 → "토큰 미정의: `@theme`에 추가 필요" 표시.
- Figma URL이 주어졌으면 `get_variable_defs` 결과와 `@theme`를 대조:
  - Figma엔 있는데 `@theme`에 없는 변수 → "코드에 누락된 토큰".
  - 값은 같은데 이름이 다른 토큰 → "이름 불일치" (코드 이름을 정본으로).
  - 양쪽 다 있는데 값이 다른 토큰 → "값 drift" (우선 확인).

### 4. 리포트

```
## 토큰 감사 리포트

### 하드코딩 위반
| 파일:라인 | 위반 유형 | 발견 값 | 권장 조치 |
| --- | --- | --- | --- |
| src/components/Card/Card.tsx:12 | hex 색상 | #1e293b | var(--color-surface) 로 교체 |
| src/components/Card/Card.tsx:20 | 리터럴 px | padding: 24px | var(--spacing-lg) 로 교체 |

### Figma ↔ 코드 토큰 불일치 (Figma URL 제공 시)
| 토큰 | Figma 값 | 코드 값(@theme) | 상태 |
| --- | --- | --- | --- |
| color/primary | oklch(0.62 0.19 255) | oklch(0.60 0.19 255) | 값 drift |

### 요약
- 하드코딩 위반: N건 (파일 M개)
- 토큰 drift: K건
- 판정: PASS / FAIL
```

- 위반이 0건이면 `판정: PASS (클린)` 만 출력.
- 수정 요청을 받은 경우에만: 권장 조치를 실제 Edit으로 적용하고, `@theme` 추가가 필요한 토큰은 값 근거와 함께 사용자에게 확인.

## 주의

- `tokens.css` 안의 색상 함수·hex는 **정의**이므로 위반이 아니다.
- 레이아웃 상수(`100%`, `auto`, `0`, `1px` 보더, `50%`)는 위반이 아니다.
- 이 에이전트는 `.claude/hooks/check-tokens.cjs`(즉시 차단)보다 넓은 범위를 본다 — hook은 단일 파일 즉시 검사, 이 에이전트는 전체 일관성 + Figma 대조.
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file ".claude/hooks/check-tokens.cjs" <<'HARNESS_EOF'
#!/usr/bin/env node
/**
 * PostToolUse hook — 토큰 하드코딩 감지.
 *
 * Edit/Write/MultiEdit 후 대상 파일을 스캔해서 하드코딩된 색상/치수를 찾는다.
 * 위반 발견 시 stderr로 상세를 출력하고 exit 2 → 편집이 차단되고 Claude에 피드백된다.
 *
 * 규칙 근거: 루트 CLAUDE.md "1. 토큰 사용 규칙".
 */

'use strict';

const fs = require('fs');
const path = require('path');

const TARGET_EXT = new Set(['.tsx', '.ts', '.jsx', '.js', '.css', '.scss']);

// 검사 제외: 토큰 정의 파일 자체 (여기서는 색상/치수 리터럴이 "정의"이다)
const EXCLUDE_BASENAMES = new Set(['tokens.css', 'theme.css']);

/** stdin(JSON)을 동기적으로 읽는다. */
function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function getFilePath(payload) {
  const ti = payload.tool_input || {};
  return ti.file_path || ti.path || (ti.edits && ti.file_path) || null;
}

/** 라인이 통째로 주석인지(대충) 판별 — 오탐 완화용. */
function isCommentLine(line) {
  const t = line.trim();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('<!--');
}

/**
 * 한 줄에서 위반을 찾는다. { type, value } 배열 반환.
 * 허용: 0, 1px 보더, var(--*) 내부, 50%/100%/auto.
 */
function scanLine(rawLine) {
  const violations = [];
  // var(--token) 참조는 통째로 제거 후 검사 (var 내부의 fallback 값 오탐 방지)
  const line = rawLine.replace(/var\(\s*--[a-z0-9-]+\s*(,[^)]*)?\)/gi, 'var(TOKEN)');

  // 1) Hex 색상
  const hex = line.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hex) hex.forEach((h) => violations.push({ type: 'hex 색상', value: h }));

  // 2) 함수형 색상 (rgb/rgba/hsl/hsla/oklch/oklab/lab/lch)
  const fn = line.match(/\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\s*\(/gi);
  if (fn) fn.forEach((f) => violations.push({ type: '함수형 색상', value: f.trim() }));

  // 3) 리터럴 px (0px, 1px 보더는 허용)
  const px = line.match(/\b(\d+(?:\.\d+)?)px\b/g);
  if (px) {
    px.forEach((p) => {
      const n = parseFloat(p);
      if (n !== 0 && n !== 1) violations.push({ type: '리터럴 px', value: p });
    });
  }

  // 4) rem/em 리터럴 (0 제외) — 간격/타이포는 토큰 경유해야 함
  const rem = line.match(/\b(\d+(?:\.\d+)?)(rem|em)\b/g);
  if (rem) {
    rem.forEach((r) => {
      const n = parseFloat(r);
      if (n !== 0) violations.push({ type: `리터럴 ${r.replace(/[\d.]/g, '')}`, value: r });
    });
  }

  // 5) Tailwind 임의값 — 색상/치수 리터럴을 담은 [...]
  const arb = line.match(/\[[^\]\s]*(?:#[0-9a-fA-F]{3,8}|\d+px|\d+rem|rgba?\(|hsla?\(|oklch\()[^\]\s]*\]/gi);
  if (arb) arb.forEach((a) => violations.push({ type: 'Tailwind 임의값', value: a }));

  return violations;
}

function main() {
  const raw = readStdin();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    process.exit(0); // 페이로드 파싱 실패 시 차단하지 않음
  }

  const filePath = getFilePath(payload);
  if (!filePath) process.exit(0);

  const ext = path.extname(filePath);
  if (!TARGET_EXT.has(ext)) process.exit(0);
  if (EXCLUDE_BASENAMES.has(path.basename(filePath))) process.exit(0);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0); // 파일을 못 읽으면 차단하지 않음
  }

  const lines = content.split(/\r?\n/);
  const found = [];
  lines.forEach((line, i) => {
    if (isCommentLine(line)) return;
    const v = scanLine(line);
    v.forEach((item) => found.push({ line: i + 1, ...item, text: line.trim().slice(0, 120) }));
  });

  if (found.length === 0) process.exit(0);

  const rel = path.relative(process.cwd(), filePath) || filePath;
  const msg = [
    `x 토큰 하드코딩 감지 — ${rel}`,
    '',
    ...found.map((f) => `  ${rel}:${f.line}  [${f.type}] ${f.value}\n      | ${f.text}`),
    '',
    '수정 방법:',
    '  - 색상 -> var(--color-*) 또는 Tailwind 토큰 유틸(bg-primary 등)',
    '  - 간격/치수 -> var(--spacing-*) 또는 Tailwind 스케일(p-4, gap-3)',
    '  - 필요한 토큰이 없으면 src/styles/tokens.css 의 @theme 에 먼저 추가할 것',
    '  - 허용: 0, 1px 보더, 100%/auto/50% 같은 레이아웃 상수',
  ].join('\n');

  process.stderr.write(msg + '\n');
  process.exit(2);
}

main();
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file ".claude/hooks/check-storybook.cjs" <<'HARNESS_EOF'
#!/usr/bin/env node
/**
 * PostToolUse hook — 컴포넌트 4파일 구조 & Storybook CSF3 규칙 검증.
 *
 * 편집된 파일이 src/components/<Name>/ 아래일 때만 동작.
 * - 4파일(<Name>.tsx, <Name>.stories.tsx, <Name>.test.tsx, index.ts) 존재 확인
 * - *.stories.tsx 면 CSF3 시그니처 / autodocs / play function 확인
 * 위반 시 stderr 출력 후 exit 2.
 *
 * 규칙 근거: 루트 CLAUDE.md "2. 컴포넌트 구조", "3. Storybook 규칙".
 */

'use strict';

const fs = require('fs');
const path = require('path');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function main() {
  const raw = readStdin();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    process.exit(0);
  }

  const ti = payload.tool_input || {};
  const filePath = ti.file_path || ti.path;
  if (!filePath) process.exit(0);

  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/(^|\/)src\/components\/([^/]+)\/([^/]+)$/);
  if (!m) process.exit(0); // 컴포넌트 디렉토리 밖이면 관심 없음

  const componentName = m[2];
  const dir = path.dirname(filePath);

  // PascalCase 디렉토리만 컴포넌트로 간주
  if (!/^[A-Z][A-Za-z0-9]*$/.test(componentName)) process.exit(0);

  const required = [
    `${componentName}.tsx`,
    `${componentName}.stories.tsx`,
    `${componentName}.test.tsx`,
    'index.ts',
  ];

  const problems = [];

  const missing = required.filter((f) => !fs.existsSync(path.join(dir, f)));
  if (missing.length) {
    problems.push(`누락된 파일: ${missing.join(', ')}`);
  }

  // 스토리 파일 내용 검증
  const storiesPath = path.join(dir, `${componentName}.stories.tsx`);
  if (fs.existsSync(storiesPath)) {
    let src = '';
    try {
      src = fs.readFileSync(storiesPath, 'utf8');
    } catch {
      src = '';
    }
    if (src) {
      const hasCsf3 =
        /satisfies\s+Meta\b/.test(src) || /:\s*Meta<typeof\s+/.test(src) || /Meta<typeof\s+/.test(src);
      const hasStoryObj = /StoryObj\b/.test(src);
      const hasAutodocs = /tags\s*:\s*\[[^\]]*['"]autodocs['"]/.test(src);
      const hasPlay = /\bplay\s*:/.test(src);

      // .storybook/preview.{ts,tsx,js} 에 전역 autodocs 태그가 있으면 파일별 요구를 면제
      const globalAutodocs = ['ts', 'tsx', 'js', 'mjs'].some((e) => {
        const p = path.join(process.cwd(), '.storybook', `preview.${e}`);
        try {
          return /tags\s*:\s*\[[^\]]*['"]autodocs['"]/.test(fs.readFileSync(p, 'utf8'));
        } catch {
          return false;
        }
      });

      if (!hasCsf3) problems.push('CSF3 시그니처 없음 (satisfies Meta<typeof X> / Meta<typeof X>)');
      if (!hasStoryObj) problems.push('StoryObj 타입 사용 없음 (CSF3 스토리 형식 아님)');
      if (!hasAutodocs && !globalAutodocs) problems.push("meta.tags 에 'autodocs' 없음 (전역 preview 태그도 없음)");
      if (!hasPlay) problems.push('play function 이 하나도 없음 (스토리마다 최소 1개 필요)');
    }
  }

  // 구현 파일 default export 금지
  const implPath = path.join(dir, `${componentName}.tsx`);
  if (fs.existsSync(implPath)) {
    let src = '';
    try {
      src = fs.readFileSync(implPath, 'utf8');
    } catch {
      src = '';
    }
    if (/export\s+default\b/.test(src)) {
      problems.push(`${componentName}.tsx 에 default export 사용 (named export 로 변경)`);
    }
  }

  if (problems.length === 0) process.exit(0);

  const rel = path.relative(process.cwd(), dir) || dir;
  const msg = [
    `x 컴포넌트 구조/Storybook 규칙 위반 — ${rel}/`,
    '',
    ...problems.map((p) => `  - ${p}`),
    '',
    '요구사항:',
    `  ${componentName}/`,
    `  |- ${componentName}.tsx          (named export, <Name>Props export)`,
    `  |- ${componentName}.stories.tsx  (CSF3, tags:['autodocs'], 스토리별 play)`,
    `  |- ${componentName}.test.tsx     (Vitest + Testing Library)`,
    `  \`- index.ts                      (export * from './${componentName}')`,
  ].join('\n');

  process.stderr.write(msg + '\n');
  process.exit(2);
}

main();
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file ".claude/hooks/notify.cjs" <<'HARNESS_EOF'
#!/usr/bin/env node
/**
 * Stop / Notification hook — OS별 데스크탑 알림.
 *
 * - Stop: 작업이 끝났을 때 "작업 완료" 알림
 * - Notification: Claude가 입력/승인을 기다릴 때 해당 메시지로 알림
 *
 * 알림 수단이 없는 환경에서는 조용히 종료한다 (절대 차단하지 않음, 항상 exit 0).
 */

'use strict';

const fs = require('fs');
const { spawn } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function run(cmd, args) {
  try {
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.on('error', () => {});
    child.unref();
  } catch {
    /* 무시 */
  }
}

function escAppleScript(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escPowerShell(s) {
  return String(s).replace(/`/g, '``').replace(/"/g, '`"');
}

function notify(title, message) {
  const platform = process.platform;

  if (platform === 'darwin') {
    const script = `display notification "${escAppleScript(message)}" with title "${escAppleScript(
      title,
    )}" sound name "Ping"`;
    run('osascript', ['-e', script]);
    return;
  }

  if (platform === 'linux') {
    run('notify-send', ['--app-name=Claude Code', title, message]);
    return;
  }

  if (platform === 'win32') {
    const ps = [
      "[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null",
      "$t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)",
      "$x = $t.GetElementsByTagName('text')",
      "$x.Item(0).AppendChild($t.CreateTextNode(\"" + escPowerShell(title) + "\")) | Out-Null",
      "$x.Item(1).AppendChild($t.CreateTextNode(\"" + escPowerShell(message) + "\")) | Out-Null",
      "$toast = [Windows.UI.Notifications.ToastNotification]::new($t)",
      "[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show($toast)",
    ].join('; ');
    run('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps]);
    return;
  }
}

function main() {
  const raw = readStdin();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  const event = payload.hook_event_name || '';
  let title = 'Claude Code';
  let message = '작업이 완료되었습니다.';

  if (event === 'Notification') {
    title = 'Claude Code — 입력 대기';
    message = payload.message || 'Claude가 응답을 기다리고 있습니다.';
  } else if (event === 'Stop' || event === 'SubagentStop') {
    title = 'Claude Code — 작업 완료';
    message = '요청한 작업이 끝났습니다.';
  }

  notify(title, message);
  process.exit(0);
}

main();
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file ".claude/settings.json" <<'HARNESS_EOF'
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(**/.env)",
      "Read(**/.env.*)",
      "Read(**/*.pem)",
      "Read(**/secrets/**)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/check-tokens.cjs" },
          { "type": "command", "command": "node .claude/hooks/check-storybook.cjs" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": "node .claude/hooks/notify.cjs" }]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [{ "type": "command", "command": "node .claude/hooks/notify.cjs" }]
      }
    ],
    "Notification": [
      {
        "hooks": [{ "type": "command", "command": "node .claude/hooks/notify.cjs" }]
      }
    ]
  }
}
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file "docs/DESIGN.md" <<'HARNESS_EOF'
# 디자인 가이드

이 문서는 **디자인 의도**를 다룬다. 코드 규칙(토큰 하드코딩 금지, 4파일 구조)은 루트 `CLAUDE.md`,
작업 프로세스는 `.claude/CLAUDE.md` 참조.

> TODO 로 표시된 곳은 실제 브랜드/디자인 시스템 값으로 채워야 한다.

---

## 1. 브랜드 성격

- **키워드**: `TODO:` (예: 신뢰감 있는 / 명료한 / 절제된 / 친근한 — 3~5개)
- **톤앤매너**: `TODO:` (예: 정보 밀도가 높지만 시각적으로 조용함. 장식 최소화, 여백으로 위계 표현.)
- **하지 말 것**: `TODO:` (예: 과한 그라디언트, 네온 색, 3D 그림자, 불필요한 애니메이션)

이 성격은 색상 채도, 모서리 둥글기, 모션 강도, 그림자 깊이의 기본값을 결정한다.

---

## 2. 색상 사용 맥락

토큰은 `src/styles/tokens.css` 의 `@theme` 에 정의된다. **역할(role) 기준으로만 사용**하고,
"파란색이니까" 같은 외형 기준으로 고르지 않는다.

| 토큰 | 역할 | 사용하는 곳 | 사용하지 않는 곳 |
| --- | --- | --- | --- |
| `--color-primary` | 주요 액션·강조 | 기본 버튼, 활성 탭, 링크, 포커스 링 | 큰 배경 면적, 본문 텍스트 |
| `--color-secondary` | 보조 액션 | 세컨더리 버튼, 덜 중요한 강조 | 주요 CTA |
| `--color-surface` | 카드·패널 배경 | 카드, 모달, 드롭다운 배경 | 페이지 전체 배경 |
| `--color-background` | 페이지 바탕 | `body`, 앱 셸 | 컴포넌트 배경 |
| `--color-border` | 구분선·외곽선 | 입력창 테두리, divider, 카드 보더 | 텍스트, 아이콘 |
| `--color-text` | 본문 텍스트 | 문단, 라벨 | 비활성 텍스트 |
| `--color-text-muted` | 보조 텍스트 | 캡션, 헬퍼 텍스트, placeholder | 주요 정보 |
| `--color-success` | 긍정 피드백 | 성공 토스트, 완료 배지 | 장식 |
| `--color-warning` | 주의 | 경고 배너, 미저장 표시 | 일반 강조 |
| `--color-danger` | 파괴적·오류 | 삭제 버튼, 에러 메시지, 유효성 실패 | 일반 강조, 링크 |

원칙:
- 상태색(success/warning/danger)은 **아이콘 + 텍스트**와 함께 쓴다. 색만으로 의미 전달 금지(접근성).
- 텍스트/배경 대비는 **WCAG AA 이상** (본문 4.5:1, 큰 텍스트 3:1).
- 다크 모드는 `@theme` 의 `--color-*` 를 미디어쿼리/`[data-theme]` 로 재정의해서 처리. 컴포넌트는 손대지 않음.

---

## 3. 스페이싱 사용 맥락

스케일: `--spacing-2xs`(2) · `xs`(4) · `sm`(8) · `md`(12) · `lg`(16) · `xl`(24) · `2xl`(32) · `3xl`(48)
(값은 `tokens.css` 기준. `TODO:` 실제 스케일로 확정.)

| 맥락 | 권장 토큰 | 예 |
| --- | --- | --- |
| 아이콘 ↔ 텍스트, 인라인 요소 간 | `2xs` ~ `xs` | 버튼 안 아이콘 간격 |
| 컴포넌트 내부 패딩 (조밀) | `sm` ~ `md` | 배지, 인풋, 작은 버튼 |
| 컴포넌트 내부 패딩 (일반) | `md` ~ `lg` | 카드 본문, 모달 |
| 폼 필드 간 세로 간격 | `md` ~ `lg` | 로그인 폼 |
| 컴포넌트 그룹 간 | `xl` | 카드 리스트, 툴바 섹션 |
| 페이지 섹션 간 | `2xl` ~ `3xl` | 랜딩 섹션 |

원칙:
- 인접한 두 요소의 간격은 **더 강하게 묶인 쪽을 더 좁게** (근접성). 라벨-인풋은 좁게, 필드-필드는 넓게.
- 한 화면에서 스케일을 4단계 이상 섞지 않는다.
- 임의값(`gap-[13px]`) 절대 금지 — hook이 차단.

---

## 4. 컴포넌트 조합 규칙

### 권장 조합
- `Button(primary)` 는 한 화면/한 영역에 **1개**. 나머지는 `secondary` 또는 `ghost`.
- `Card` 안에는 `CardHeader` / `CardBody` / `CardFooter` 순서 유지.
- `FormField` = `Label` + `Input` + `HelperText`(또는 `ErrorText`) 세트로만 사용.
- 아이콘은 텍스트와 같은 `currentColor` 를 상속. 별도 색 지정 지양.

### 안티패턴 (쓰지 말 것)
| 하지 말 것 | 이유 | 대신 |
| --- | --- | --- |
| `primary` 버튼 2개 이상 나란히 | 액션 위계 붕괴 | 1개만 primary, 나머지 secondary/ghost |
| `Card` 안에 또 `Card` (중첩) | 시각적 소음, 그림자 중첩 | 내부는 `--color-border` divider 로 구분 |
| `danger` 색을 "강조"용으로 사용 | 오류 신호와 혼동 | `primary` 또는 굵기/크기로 강조 |
| 모달 안에 모달 | 컨텍스트 상실 | 단계형 마법사(스텝) 또는 인라인 확장 |
| 상태색만으로 의미 전달 (아이콘·텍스트 없이) | 색맹 사용자 접근 불가 | 아이콘 + 텍스트 라벨 병기 |
| 임의 그림자/보더 추가 | 토큰 밖 스타일 | `--shadow-*`, `--color-border` 만 |

---

## 5. Figma 레이어 네이밍 컨벤션

코드 변환 시 파싱 가능하도록 Figma 쪽에서 지켜야 하는 규칙.

### 컴포넌트
- 컴포넌트명: `PascalCase` — 코드 컴포넌트명과 **1:1 일치** (`Button`, `FormField`).
- Variant 프로퍼티: `속성=값` — 코드 prop 과 이름 일치 (`variant=primary`, `size=sm`, `state=hover`).
- 컴포넌트 세트 이름: `PascalCase` 단수형.
- 서브 파트(슬롯): `PascalCase.Part` (`Card.Header`, `Button.Icon`).

### 토큰 / 변수 (Figma Variables)
- 색상: `color/<role>/<variant>` → `color/primary`, `color/text/muted`
- 간격: `spacing/<step>` → `spacing/md`
- Radius: `radius/<step>` · Shadow: `shadow/<step>` · 타이포: `text/<step>`
- 코드 토큰명 매핑: `color/text/muted` ↔ `--color-text-muted` (슬래시 → 하이픈, 접두사 `--`).

### 페이지 / 프레임
- 페이지: `01 Foundations`, `02 Components`, `03 Patterns`, `04 Screens` (번호 접두).
- 프레임(스크린): `<Flow> / <Step>` → `Onboarding / Enter Email`.
- 상태 프레임: `<Screen> — <state>` → `Checkout — empty`, `Checkout — error`.

### 금지
- 레이어명 `Frame 123`, `Group 45`, `Rectangle 7` 방치 → 코드 변환 시 의미 추출 불가.
- variant 값에 공백/특수문자 (`state=on hover` X → `state=hover` O).
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
write_file "src/styles/tokens.css" <<'HARNESS_EOF'
/**
 * 디자인 토큰 — 단일 진실 공급원 (SSOT)
 *
 * 모든 색상/간격/radius/shadow/타이포는 여기 @theme 에만 정의한다.
 * 컴포넌트 코드에서는 var(--*) 또는 Tailwind 유틸(bg-primary 등)로만 참조한다.
 * 이 파일은 check-tokens.cjs 검사에서 제외된다 (여기 값은 "정의"이므로).
 *
 * Tailwind v4: @theme 에 정의하면 대응 유틸리티가 자동 생성된다.
 *
 * TODO: 실제 브랜드 값으로 교체. 아래는 시드(placeholder)다.
 */

@import 'tailwindcss';

@theme {
  /* 색상: 역할 기준 */
  --color-background: oklch(0.99 0 0);
  --color-surface: oklch(1 0 0);
  --color-border: oklch(0.92 0.004 265);

  --color-text: oklch(0.25 0.02 265);
  --color-text-muted: oklch(0.55 0.02 265);

  --color-primary: oklch(0.62 0.19 255);
  --color-primary-foreground: oklch(0.99 0 0);
  --color-secondary: oklch(0.68 0.02 265);
  --color-secondary-foreground: oklch(0.25 0.02 265);

  --color-success: oklch(0.68 0.16 155);
  --color-warning: oklch(0.78 0.15 80);
  --color-danger: oklch(0.62 0.21 25);

  /* 간격 스케일 */
  --spacing-2xs: 0.125rem;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.5rem;
  --spacing-2xl: 2rem;
  --spacing-3xl: 3rem;

  /* Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 oklch(0.2 0.02 265 / 0.06);
  --shadow-md: 0 4px 12px -2px oklch(0.2 0.02 265 / 0.1);

  /* 타이포 */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
}

/* 다크 모드: 토큰만 재정의. 컴포넌트는 손대지 않는다. */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: oklch(0.17 0.01 265);
    --color-surface: oklch(0.21 0.01 265);
    --color-border: oklch(0.32 0.01 265);
    --color-text: oklch(0.93 0.01 265);
    --color-text-muted: oklch(0.65 0.01 265);
  }
}
HARNESS_EOF

# ─────────────────────────────────────────────────────────────
chmod +x .claude/hooks/*.cjs 2>/dev/null || true

# settings.json 유효성 검사
if command -v node >/dev/null 2>&1; then
  if node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))" 2>/dev/null; then
    echo "  ok: .claude/settings.json JSON 유효"
  else
    echo "  ⚠ .claude/settings.json JSON 파싱 실패 — 확인 필요"
  fi
fi

cat <<'DONE'

✔ 설치 완료

다음 단계:
  1. Claude Code 를 재시작하면 .claude/settings.json 의 hook 이 적용됩니다.
  2. docs/DESIGN.md 의 TODO 를 실제 브랜드 값으로 채우세요.
  3. src/styles/tokens.css 의 시드 토큰을 Figma 변수와 맞추세요.
  4. Figma URL 을 주면 figma-implementer 에이전트가 5단계로 구현합니다.

hook 수동 테스트:
  echo '{"tool_input":{"file_path":"src/components/X/X.tsx"},"hook_event_name":"PostToolUse"}' | node .claude/hooks/check-tokens.cjs
  node .claude/hooks/notify.cjs < /dev/null
DONE
