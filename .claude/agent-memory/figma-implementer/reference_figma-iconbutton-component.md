---
name: figma-iconbutton-component
description: Figma IconButton(맨아이콘 + 선택적 알림배지) 문서페이지 51405:85581 / 메인 94614, 축·토큰, ButtonWithIcon 과의 차이, 구현 완료
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System) / **IconButton** — 문서 페이지 node `51405:85581`, 메인 컴포넌트 node `51405:94614` (24×24). 태그 ORGANISMS/MOBILE.

`get_design_context` 가 문서 페이지 노드에서 "nothing selected" 오류 → `get_metadata` + 메인 컴포넌트 프레임(`51405:94614`) 로 조사해야 함.

**정체성:** Icon 중심의 맨아이콘 버튼. 배경·테두리·radius·hover 같은 버튼 크롬이 전혀 없음(ButtonWithIcon 과 완전히 별개). 우측 상단에 알림 배지(Dot 또는 BadgeNumber)를 선택적으로 얹음. 헤더 벨 버튼 같은 용도.

**Figma variant 축 (심볼 4개 = state 2 × badgeType 2, + Props Table 의 isBadge bool):**

- `state`: enabled / disabled → `disabled` boolean. disabled = 아이콘 컨테이너에만 `opacity var(--alpha-40)` (0.4), **배지는 흐려지지 않음**(생성 코드상 배지는 형제 노드, opacity 미적용)
- `badgeType`: dot / number
- `badge` (isBadge): true / false — 배지 표시 여부
- **없는 축**: color(설명 "색상을 자유롭게 변경" → currentColor 상속), size(가이드 24/40/50 은 인스턴스 정비율 스케일 예시일 뿐 컴포넌트 축 아님), hover/focus/pressed

**토큰 매핑 (Figma 검증):**

- 아이콘 박스 24×24 = `size-[var(--sz-24)]`, 내부 svg `[&>svg]:size-full`
- disabled 아이콘 opacity → `opacity-[var(--alpha-40)]`
- dot 배지: `--sz-6`, `bg-bg-danger-normal`(#f84b55), `rounded-circle`, 위치 top/right -2px → 기존 `Dot` size="xs" color="red" 와 1:1
- number 배지: min `--sz-14`, px `--sz-3`, `rounded-circle`, `bg-bg-danger-normal`, 텍스트 `--text-2xs`/`text-label-3`(Pretendard Medium, white, -1%) → 기존 `BadgeNumber` size="xs" 와 1:1. 위치 top -3 / right -6
- 배지 위치 오프셋: dot `-top-[var(--sz-2)] -right-[var(--sz-2)]`, number `-top-[var(--sz-3)] -right-[var(--sz-6)]`

**ButtonWithIcon 과의 차이 → 별도 컴포넌트 필수:** ButtonWithIcon 은 진짜 버튼 크롬(color5×variant3×size6×state4, 배경/보더/radius/hover, `Button` 합성). IconButton 은 크롬 없음 + 자유 색 + 배지 오버레이 + enabled/disabled 만. 가장 가까운 선례는 `ClearButton`(맨아이콘 `<button type=button>`, focus-visible 만, 네이티브 disabled).

**Code Connect:** `figma-code-connect.json` 에 `51405:85581` 키로 추가함.

**구현 완료 (2026-09-11):** `src/components/ui/IconButton/` 4파일.

- props: `"aria-label"`(필수), `children`(아이콘 슬롯), `badge?: "dot" | "number"`(생략 시 배지 노드 미렌더), `count?`(기본 0)/`max?`(기본 99, number 배지 전용), `disabled?`, `className?`, 나머지 `ButtonHTMLAttributes` 스프레드
- Figma 의 badgeType + badge(bool) 2축을 `badge?: "dot" | "number"` 하나로 통합
- 렌더: `<button type="button">` + `relative inline-flex shrink-0 cursor-pointer items-center justify-center` + `focus-visible:opacity-[var(--alpha-60)] focus-visible:outline-none`. `data-badge` 속성 노출
- `Dot`, `BadgeNumber`, `src/icons` 의 `<Icon>` 재사용. Storybook 글리프 = `bell_01_line`
- `src/components/ui/` 에 barrel(index.ts) 없음 → 추가 export 불필요

관련: [[figma-buttonwithicon-component]], [[figma-clearbutton-component]]
