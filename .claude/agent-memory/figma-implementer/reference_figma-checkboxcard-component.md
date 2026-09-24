---
name: figma-checkboxcard-component
description: Figma "CheckboxCard" 몰리큘 세트(51405:45930) - size 3축만(variant 없음), 카드 표면 강조, hover는 checked 무관, lg는 md 아톰, 코드 구현 위치
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System).

**CheckboxCard** 컴포넌트 세트: node-id `51405:45930`, 카테고리 MOLECULES. 18 심볼 = `size`(3: sm/md/lg) × `state`(3: enable/hover/disabled) × `checked`(2). **`variant`(circle/square/mark) 축 없음** — 내부 `Checkbox` 아톰은 항상 circle. focus·indeterminate 없음.

비직관적 사실(Figma 검증):

- **hover 는 checked 와 무관하게** 카드 배경을 `bg/brandGrayish/deep`(#eff6f3) 로 바꾼다. checked 라도 hover 시 `bg/brand/bright` 가 아님.
- **lg 카드는 md(24px) `Checkbox` 아톰을 쓴다** (sm→sm, md→md, lg→md). lg 만 체크박스 래퍼 pt=`sz/5`, sm·md 는 pt=`sz/1`.
- 라벨 굵기·색은 checked 종속: unchecked=Medium+`typo/neutral/normal`, checked=Bold+`typo/brand/dark`. disabled 는 색만 `typo/disabled/normal` 로 덮고 굵기는 checked 유지.
- 카드 외곽선 = Figma INNER_SHADOW 이펙트 → `shadow-border{Neutral,Brand}-{xs,sm}` 유틸. unchecked enable=borderNeutral-xs, unchecked hover=borderBrand-xs, checked(enable+hover)=borderBrand-sm, disabled unchecked=borderNeutral-xs, disabled checked=borderNeutral-sm.
- size별 카드: gap sm=`sz/8` md=`sz/10` lg=`sz/12`; radius sm=md(8) md=lg(10) lg=xl(12); padding 공통 `sz/14`; 콘텐츠 세로 gap `sz/4`; 체크박스·라벨 가로 gap `sz/8`.
- 라벨 타이포 sm=body-4 md=body-3 lg=body-1 (+`-bold`). 서브텍스트 타이포 sm=body-5 md=body-4 lg=body-3, 색 `typo/neutral/light`(disabled 시 `typo/disabled/subtle`), 좌측 패딩 sm=`sz/30` md·lg=`sz/32`.
  - Figma 비일관: `size=md, state=disabled, checked=false` 심볼만 서브텍스트가 font/size/md(18) — 나머지 md 심볼은 sm(16). 코드는 body-4(16)로 정규화.
- 카드 하단 자유 콘텐츠 슬롯 레이어명은 `slotContents`(빨간 점선 h=24 w-full, 예전엔 `↳ 🟥 ContentsSlot`) — 디자인 표식이라 코드는 렌더 안 하고 `children` 만 전폭 배치.
- **Figma 프로퍼티명(2026-09-10 개명)**: 텍스트 = `label` / `subTextValue`(예전 `subText` 텍스트값). 가시성 토글 boolean = `subText` / `slot`(코드엔 미반영 — presence 기반). 축 = `size` / `checked` / `state`.

**코드 구현 (2026-09-10):** `src/components/ui/CheckboxCard/` 4파일. `CheckboxWithLabel` 패턴 그대로 — 루트 `<label class="group">` + visually-hidden `<input type="checkbox" class="peer sr-only">`, 카드 전체 히트영역, controlled/uncontrolled 둘 다, `checked` 외 input 속성 `...rest` spread, `Omit<InputHTMLAttributes,"size"|"children">` 확장. `Checkbox` 아톰 합성(상자 로직 재구현 안 함). props: `size`(기본 md) / `label`(필수 ReactNode) / `subTextValue?`(ReactNode) / `children?`(슬롯) / `disabled`. 가시성은 presence 기반(`subTextValue`/`children` 있으면 렌더 — Figma 의 `subText`·`slot` boolean 토글 대체). **hover 표면은 루트 자신 스타일이라 `hover:` 로 건다** (`group-hover:` 는 `.group` 자손 전용이라 루트 자신엔 안 먹음 — 초기 구현 버그, 2026-09-10 수정). 아톰은 `.group` 자손이라 `group-hover:` 유지. focus=`peer-focus-visible:opacity-[var(--alpha-80)]`(체크박스 래퍼, Button 선례). `data-variant="circle"`/`data-size`/`data-checked`/`data-state`. Code Connect `51405:45930` 매핑 갱신됨.

관련: [[figma-checkbox-component]], [[design-token-architecture]]
