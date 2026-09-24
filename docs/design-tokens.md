# 디자인 토큰 매핑 테이블

> Figma 변수명 ↔ 토큰 원본 JSON ↔ CSS custom property 매핑.
> Claude Code가 Figma 디자인 구현 시 이 문서를 참조합니다.
> **토큰 값의 상세 의미·용도는 `docs/DESIGN.md`** 를, 빌드 파이프라인은 `docs/style-dictionary-guide.md` 를 참조.

## 파이프라인

```
tokens/*.json   →  npm run build:tokens  →  src/tokens/_generated.css  →  src/index.css
(이것만 수정)       (Style Dictionary)        (자동 생성, 직접 수정 금지)     (@import)
```

- 토큰을 추가·변경하려면 `tokens/*.json` 만 고치고 `npm run build:tokens` 실행.
- `src/tokens/_generated.css` 는 산출물. 직접 편집 금지 (`dev`/`storybook`/`build` 가 자동 재생성).

## 네이밍 규칙

Figma `/` → 토큰 JSON 경로 → CSS `--<path를 '-'로 join>`.
세그먼트 내부 camelCase 는 그대로 유지 (`brandGrayish`, `greenGray`, `overlay/whiteSubtle`).

| Figma 레이어              | 토큰 JSON 경로                          | CSS property                                                    |
| ------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| `red/500`                 | `color.red.500` (primitive.json)        | `--color-red-500`                                               |
| `greenGray/a05`           | `color.green-gray.a05`                  | `--color-green-gray-a05`                                        |
| `background/brand/normal` | `color.bg.brand-normal` (semantic.json) | `--color-bg-brand-normal`                                       |
| `sz/16`                   | `sz.16` (size.json)                     | `--sz-16`                                                       |
| `radius/circle`           | `radius.circle`                         | `--radius-circle`                                               |
| `borderWidth/2xs`         | `border-width.2xs`                      | `--border-width-2xs`                                            |
| `alpha/40`                | `alpha.40`                              | `--alpha-40`                                                    |
| `font/size/2xs`           | `text.2xs` (typography.json)            | `--text-2xs`                                                    |
| `typo_title_1`            | `text.title-1`                          | `--text-title-1` (+ `--text-title-1--line-height` 등 companion) |

## 토큰 네임스페이스 (파일별)

| 파일                          | 네임스페이스                                                                                             | 비고                                                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens/color/primitive.json` | `--color-<hue>-<step>`                                                                                   | raw hex. red/orange/yellow/green/blue/purple/pink (12단계), gray/green-gray (13단계), black/white (pure + a00~~a80 알파 램프), green-gray a00~~a80 |
| `tokens/color/semantic.json`  | `--color-{bg,typo,border,icon,shadow,logo}-*`                                                            | 값은 primitive 를 `var()` 참조. `--color-logo-ink` 만 raw hex. gradient 2종 포함                                                                   |
| `tokens/size.json`            | `--sz-<N>`                                                                                               | N=px, 값=rem. `--sz-0`=0, `--sz-9999`=9999px(pill 센티넬). Tailwind 유틸 자동 생성 안 됨 → `var(--sz-16)`                                          |
| `tokens/radius.json`          | `--radius-{xs,sm,md,lg,xl,2xl,3xl,circle}`                                                               | `var(--sz-*)` 별칭. Tailwind `rounded-*` 자동 생성                                                                                                 |
| `tokens/border-width.json`    | `--border-width-{2xs,xs,sm,md,lg,xl}`                                                                    | `--border-width-2xs`=0.5px, 나머지 `var(--sz-*)`. Tailwind `border-*` 자동 생성                                                                    |
| `tokens/layout.json`          | `--layout-{viewport-min,viewport-max,margin,gutter,columns}`                                             | 모바일 셸. Tailwind 유틸 자동 생성 안 됨                                                                                                           |
| `tokens/alpha.json`           | `--alpha-{00,05,10,20,40,60,80}`                                                                         | opacity 배수용 무단위 소수. `--color-*-a<NN>` 알파 램프와는 별개                                                                                   |
| `tokens/shadow.json`          | `--shadow-{black,greenGray}-{xs..xl}`, `--shadow-bottomNav`, `--shadow-border{Neutral,Brand}-{xs,sm,md}` | 다층 그림자. Tailwind `shadow-<group>-<step>` 자동 생성                                                                                            |
| `tokens/blur.json`            | `--blur-{dim,header}`                                                                                    | backdrop blur. `--blur-*: initial;` 로 기본 스케일 제거 후 2단계만                                                                                 |
| `tokens/typography.json`      | `--font-sans`, `--font-weight-{normal,bold}`, `--text-<step>`, `--text-<합성명>` (+companion)            | 합성 스타일 25종은 `--text-x` + `--text-x--line-height` / `--letter-spacing` / `--font-weight` 4속성 묶음                                          |

## Claude용 규칙

1. Figma MCP 가 hex/숫자 반환 → 위 표에서 대응 토큰 찾아 `var(--*)` 또는 Tailwind 토큰 유틸 사용.
2. 컴포넌트는 **Semantic 토큰만** 참조 (`--color-bg-*` 등). Primitive(`--color-red-500`) 직접 참조 금지.
3. 표에 없는 값 → 새 CSS 변수를 손으로 만들지 말고 `tokens/*.json` 에 추가 후 `npm run build:tokens`.
4. `src/tokens/_generated.css` 는 절대 직접 수정하지 않는다.
