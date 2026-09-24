# Style Dictionary 토큰 파이프라인 가이드

## 이게 뭔가요?

**Style Dictionary v5** 로 토큰 원본 JSON 을 CSS custom property 로 자동 변환합니다.

```
tokens/*.json ──→ npm run build:tokens ──→ src/tokens/_generated.css ──→ src/index.css (@import)
(DTCG 문법)        (style-dictionary.config.mjs)   (자동 생성, 직접 수정 금지)
```

**핵심 원칙: `tokens/*.json` 만 수정. `_generated.css` 는 빌드 산출물.**

## 구조

```
tokens/
├── color/
│   ├── primitive.json     # raw hex 팔레트
│   └── semantic.json       # bg/typo/border/icon/shadow/logo — primitive alias
├── size.json               # --sz-<N>
├── radius.json              # --radius-*  → {sz.*}
├── border-width.json        # --border-width-*
├── layout.json              # --layout-*
├── alpha.json               # --alpha-*
├── shadow.json              # --shadow-*  (다층)
├── blur.json                # --blur-*
└── typography.json          # --font-*, --text-* (+ 합성 25종)

style-dictionary.config.mjs   # 커스텀 name 트랜스폼 + 커스텀 CSS 포맷 + 빌드
src/tokens/_generated.css     # 🔴 자동 생성
```

`source` 배열의 파일 순서 = 출력 선언 순서.

## 명령어

```bash
npm run build:tokens     # tokens/*.json → src/tokens/_generated.css
```

`predev` / `prestorybook` / `prebuild-storybook` / `pretest` / `build` 가 자동으로 먼저 실행하므로,
평소에는 토큰 JSON 만 고치면 됩니다. 슬래시 커맨드는 `/build-tokens`.

## 토큰 JSON 작성법 (DTCG 문법)

`$value` / `$type` / `$description` 을 씁니다. **JSON 키 = 최종 kebab 세그먼트.**

### 색상 (raw)

```json
{ "color": { "red": { "500": { "$value": "#f84b55", "$type": "color" } } } }
```

→ `--color-red-500: #f84b55;`

### 참조 (Semantic → Primitive, alias)

```json
{
  "color": {
    "bg": {
      "brand-normal": { "$value": "{color.green.500}", "$type": "color" }
    }
  }
}
```

→ `--color-bg-brand-normal: var(--color-green-500);` ← `var()` 유지 (`outputReferences: true`)

- 참조 경로의 세그먼트 내부 하이픈은 그대로: `{color.green-gray.a00}` → `var(--color-green-gray-a00)`.
- 보간 문자열도 다중 참조 치환: `"0 {sz.1} {sz.2} {color.shadow.black-light}"`.

### 치수 (값을 최종 CSS 문자열 그대로)

```json
{
  "sz": {
    "16": { "$value": "1rem", "$type": "dimension", "$description": "16px" }
  }
}
```

→ `--sz-16: 1rem; /* 16px */`

값 변환 트랜스폼을 쓰지 않으므로 **JSON 에 적은 문자열이 그대로 출력**됩니다 (`0.0625rem`, `9999px`, `0.5px`, `4`, `0.05`, `-0.01em`). px 는 `$description` 에 병기.

### 와일드카드 리셋 (`"*"` 키)

```json
{ "text": { "*": { "$value": "initial", "$type": "other" } } }
```

→ `--text-*: initial;` (Tailwind 기본 스케일 제거)

### 합성 타이포 (companion 더블대시)

```json
{
  "text": {
    "title-1": {
      "$type": "typography",
      "$value": {
        "fontSize": "{text.3xl}",
        "lineHeight": "1.46",
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    }
  }
}
```

→

```css
--text-title-1: var(--text-3xl);
--text-title-1--line-height: 1.46;
--text-title-1--letter-spacing: -0.01em;
--text-title-1--font-weight: var(--font-weight-bold);
```

커스텀 포맷이 `$type: "typography"` 객체를 감지해 4줄로 전개합니다. DTCG 표준 키
(`fontSize`/`lineHeight`/`letterSpacing`/`fontWeight`) 를 꼭 지킬 것.

### 그룹 섹션 주석

그룹 노드의 `$description` → 출력에 `/* ... */` 섹션 주석으로 나옵니다
(SD 는 format 에 넘기는 dictionary 에서 그룹 메타를 제거하므로, config 가 원본 JSON 을 직접 읽어 복원).

## `style-dictionary.config.mjs` 요약

- **커스텀 name 트랜스폼** `name/ddoga-path`: `token.path.join('-')`.
  표준 `name/kebab` 은 `--color-black-a-05`, `--text-2-xs` 처럼 깨지므로 사용 안 함.
- **커스텀 포맷** `css/ddoga-theme`: `@import 'tailwindcss';` + `@theme static { }` 래퍼,
  `dictionary.tokens` DFS, companion 전개, `style-dictionary/utils` 의
  `usesReferences` / `getReferences` 로 `var()` 치환.
- 플랫폼 `transforms: ['name/ddoga-path']` — **값 변환 트랜스폼 0개** (참조 안정성 + 값 원문 보존).
- `files[].options.outputReferences: true`.

## Figma 변수가 변경되면

```
Figma Variables 변경
  → token-checker 에이전트가 Figma MCP(get_variable_defs)로 변수 가져옴
  → tokens/*.json 수정 (제안 또는 자동)
  → npm run build:tokens
  → src/tokens/_generated.css 자동 갱신
```

## 새 플랫폼 추가 (iOS 등)

`style-dictionary.config.mjs` 의 `platforms` 에 추가:

```js
platforms: {
  css: { /* 기존 */ },
  ios: {
    transformGroup: 'ios-swift',
    buildPath: 'ios_output/',
    files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift', options: { className: 'AppTokens' } }],
  },
}
```

> iOS/Android 는 표준 `transformGroup` 을 그대로 써도 되지만, CSS 는 Tailwind v4 문법 재현이
> 필요해 커스텀 포맷을 씁니다.

## 검증

- `src/tokens/__tests__/generated.test.ts` — companion 25×3, 리셋 3종, Semantic `var()` 참조, 구조 라인, 대표 토큰 스냅샷. `npm test` 에 포함.
