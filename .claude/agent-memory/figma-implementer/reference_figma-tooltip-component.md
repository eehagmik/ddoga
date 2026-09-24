---
name: figma-tooltip-component
description: Figma Tooltip 말풍선 컴포넌트(node 51405:154754) — tone 2 × placement 12, 인라인 SVG 꼬리, drop-shadow 수동 조립, presentational 범위
metadata:
  type: reference
---

# Figma Tooltip 컴포넌트

- Figma 세트 node: `51405:154754` (문서 페이지 `51405:154745`). Code Connect 매핑 없음(제안만 함).
- 구현: `src/components/ui/Tooltip/` (Tooltip.tsx / .stories.tsx / .test.tsx / index.ts). 2026-09-11 완료.

## 축 → API 정규화

- Figma `color` (black/white) → `tone: 'dark' | 'light'` (기본 dark).
- Figma `direction` 12값(**혼재 네이밍**: `topLeft`/`rightTop`/`bottomLeft` camelCase + `left-top` kebab)
  → `placement: '<side>-<start|center|end>'` 12값. bare `'top'` = center. side=top/bottom→`flex-col`, left/right→`flex-row`.
- Figma `isIcon`(기본 true) → `icon?: ReactNode` presence 기반(Chip `startSlot` 선례). 슬롯 미주입 시 미렌더(`_blank용 아이콘`은 디자인 표식).
- Figma `isCloseButton` → `closable?: boolean` + `onClose` + `closeLabel`(기본 '닫기'). `x_close_line` 아이콘 16, `focus-visible:opacity-[var(--alpha-60)]`.
- Figma `text` → `children: ReactNode`, `whitespace-pre-line`.
- Figma 에 hover/pressed/focus/disabled state 축 **없음** → 말풍선 자체 상태 스타일 없음(ClearButton/TopButton 선례).

## 의도적으로 Figma 와 다른 부분 (승인됨)

1. **범위 축소**: presentational 말풍선만. hover 트리거·anchor 포지셔닝(6px)·portal·GROW 애니메이션 제외(후속 과제).
2. **max-width**: Figma 데모값 300(토큰 아님) 대신 `max-w-[calc(100vw-var(--sz-32))]` + 선택적 `maxWidth?: number|string`(있으면 인라인 style, number→px). sz 토큰 추가 안 함.
3. **그림자**: Figma 는 drop-shadow 필터, 프로젝트 shadow 토큰은 box-shadow 포맷. 꼬리까지 그림자 이으려 `[filter:drop-shadow(0_var(--sz-1)_var(--sz-4)_var(--color-shadow-black-light))_drop-shadow(0_var(--sz-4)_var(--sz-8)_var(--color-shadow-black-normal))]` 를 루트에 직접 조립. light=greenGray 계열. 값은 Figma `shadow/*/sm` 과 동일.
4. **꼬리(beak)**: 16×8 삼각형 인라인 SVG(`BlankIcon` 선례), `fill-bg-inverse-normal`/`fill-bg-neutral-normal` 로 본체색 상속. 기본 아래 방향, `bottom→-scale-y-100` / `left→-rotate-90` / `right→rotate-90`. 세로 방향은 래퍼 8×16.

## 토큰

- 배경: `bg-bg-inverse-normal` / `bg-bg-neutral-normal`. 본문: `text-typo-inverse-normal` / `text-typo-neutral-normal`.
- 아이콘 슬롯: `text-icon-inverse-subtle` / `text-icon-neutral-subtle`. 닫기: `text-icon-inverse-normal` / `text-icon-neutral-normal`.
- radius `rounded-xl`, padding `py-[var(--sz-10)] px-[var(--sz-12)]`, gap `var(--sz-6)`, 슬롯 상단보정 `pt-[var(--sz-2)]`, 슬롯/닫기 박스 `size-[var(--sz-16)]`, 꼬리 인셋 `px/py-[var(--sz-12)]`.
- 본문 타이포 `text-body-5` (Pretendard Medium 14 / 1.46 / -1%). `[font-feature-settings:var(--font-feature-case)]`.

## 함정

- JSDoc 에 `icon/*/subtle`, `shadow/*/sm` 처럼 `*/` 가 들어가면 **블록 주석이 조기 종료**된다 → `<tone>` 등으로 치환. [[group-hover-self-styles]] 처럼 사소하지만 빌드 깨짐.
- SVG `class` 는 `SVGAnimatedString` → 테스트에서 `toHaveClass` 말고 `getAttribute("class")` 로 읽는다. 닫기 아이콘 svg 와 구분하려면 `[aria-hidden="true"] svg` 로 스코프.
- `npm run build` 시 나오는 `padding-inline: var(--sz-*)` CSS 경고는 **기존부터 있던 것**(Chip/Button/Size 주석의 `var(--sz-*)`), Tooltip 무관.
- `src/components/ui/` 에 배럴 `index.ts` 없음 → 컴포넌트 추가 시 배럴 갱신 불필요.
