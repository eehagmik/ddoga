---
name: figma-buttonwithicon-component
description: Figma ButtonWithIcon(아이콘 전용 버튼) 세트 위치/구조/스펙과 ButtonWithLabel 대비 차이점
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (-꼬가3.0- Design System).

**ButtonWithIcon** 컴포넌트 세트: node-id `51405:17772`. 360 variant = color(5) × variant(3) × size(6) × state(4).

- 구조: 정사각(1:1) 컨테이너, 라벨 없음, 중앙 아이콘 1개(BlankIcon 플레이스홀더 `2547:236`), inner gap 없음, start/end 아이콘 슬롯 없음.
- property 축: color(brand/neutral/danger/warning/info), size(2xl/xl/lg/md/sm/xs), state(enable/hover/focus/disabled) — 값은 ButtonWithLabel과 동일.
- **variant 축은 fill/bright/outline 3종만. `text` 없음** (ButtonWithLabel은 4종).

**size별 (컨테이너 정사각 = w = h, ButtonWithLabel min-h와 동일값):**

| size | 컨테이너 | icon | radius |
| 2xl | 54 | 22 | radius/xl(12) → rounded-xl |
| xl | 50 | 20 | radius/lg(10) → rounded-lg |
| lg | 46 | 18 | radius/md(8) → rounded-md |
| md | 40 | 16 | radius/md(8) → rounded-md |
| sm | 32 | 14 | radius/sm(6) → rounded-sm |
| xs | 26 | 14 | radius/sm(6) → rounded-sm |

컨테이너 크기·아이콘 크기·radius 전부 ButtonWithLabel과 동일. Figma의 좌우 px는 (컨테이너−아이콘)/2 = 16/15/14/12/9/6 이지만 정사각+flex 중앙정렬이라 장식적. xl(15)/sm(9)는 토큰 없는 raw px → 구현은 정사각 컨테이너 + place-items-center 로 처리 권장.

**state 색상 규칙: ButtonWithLabel과 거의 동일** (fill bg normal→hover/focus deep, 아이콘 icon/inverse/normal; bright bg *bright→hover light, 아이콘 icon/<color>/normal, warning만 icon/warning/deep; outline bg neutral/normal + border border/<color>/subtle, neutral은 border/neutral/bright, warning은 border/warning/normal). focus inner opacity fill 0.8·bright/outline 0.6, disabled 루트 opacity fill/outline 0.6·bright 0.4 — 전부 동일.

**차이점 / 주의:**

1. `outline` + `brand` 의 hover/focus 배경 = `background/brand/bright` (ButtonWithLabel은 `background/brandGrayish/normal`). 다른 색 outline hover/focus는 라벨과 동일(neutral→neutral/deep, danger→danger/bright, info→info/bright).
2. 노드 `51405:18191` (brand·bright·md·disabled) 이 비일관 저작: 배경 채움 없이 `border/brand/light` 1px + opacity `40%`. 다른 bright disabled(danger 18197, neutral 18287)는 정상적으로 enable 배경 유지 + opacity 40%. Figma 저작 버그로 판단 → 구현은 규칙(enable 디자인 + --alpha-40) 따를 것.
3. 노드 `51405:18261` (neutral·fill·md·hover): `background/inverse/deep` 위에 `background/overlay/blackNormal`(#00000066) 레이어가 추가로 있음.
4. 모든 노드 var defs에 `scale/24` 가 붙어있으나 emit 클래스엔 미사용(BlankIcon 내부 기본 size 변수, 실제 아이콘 크기로 override됨).

Code Connect: `figma-code-connect.json` mappings 비어있음 — ButtonWithIcon 매핑 없음.

구현 완료: `src/components/ui/ButtonWithIcon/` (4파일, 2026-09-09). props `color`/`variant`(fill/bright/outline)/`size`, `aria-label` required, `children` = 중앙 아이콘. `outline`+`brand` hover/focus bg 만 `bg-bg-brand-bright` 로 ButtonWithLabel 과 다름.

관련: [[figma-figma-button-component]], [[design-token-architecture]]
