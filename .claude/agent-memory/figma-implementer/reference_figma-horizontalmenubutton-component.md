---
name: figma-horizontalmenubutton-component
description: Figma HorizontalMenuButton 세트(51405:116292) 구조·축·토큰 매핑 — 가로형 메뉴/리스트 행 버튼, w-full 고정폭 오버라이드
metadata:
  type: reference
---

Figma "또가3.0 Design System / HorizontalMenuButton" (node 51405:116292, 컴포넌트 세트 60개 = variant 2 × size 5 × state 3 × bold 2)를 `src/components/ui/HorizontalMenuButton/`에 구현 완료(2026-09-11).

**구조**: root(button) > inner(flex-1) > left(flex-1: startSlot + label) + option(shrink-0: endSlot + chevron). option 은 `chevron` 켜져있거나 `endSlot` 있을 때만 렌더(Figma `trailingContents` 토글 대응).

**축**: `variant`(text/outline) × `size`(sm/md/lg/xl/2xl) × `bold`(boolean). state(enable/hover/focus)는 CSS 로 처리 — disabled 없음(안 만듦).

**폭 오버라이드**: Figma 프레임은 240px 고정이지만 사용자 확정 사항으로 `w-full` 구현(메뉴/리스트 행 용도). 타 컴포넌트에 이 폭 오버라이드 패턴을 참고할 수 있음.

**size 5단계인데 타이포/간격은 3단계로 묶임** (ButtonWithLabel 의 sm/xs 타이포 tie 패턴과 유사) — 반드시 실측 확인 후 구현할 것, 5단계라고 직선적으로 스케일링하면 틀림:

- sm: min-h(text)36/(outline)40, radius sm, text-body-4, left-gap8, inner-gap6, option-gap4, chevron16px, startSlot 정사각 22
- md·lg: min-h(text)40/(outline)46 **(md·lg 완전 동일)**, radius md, text-body-3, left-gap10, inner-gap8, option-gap6, chevron18px, startSlot 28(md)/32(lg) — startSlot 크기만 다름, 나머지 전부 동일
- xl·2xl: min-h(text)42·46/(outline)52·56, radius md, text-body-2, left-gap10, inner-gap8, option-gap6, chevron20px, startSlot 38(xl)/42(2xl)

**padding**: text variant 는 전 size 공통 `px-0 py-[--sz-2]`(가로 hug). outline 은 sm 만 `px-[--sz-8] py-[--sz-4]`, md~2xl 는 `px-[--sz-10] py-[--sz-7]` 공통.

**색**: outline 배경/테두리 = `bg-bg-neutral-normal border-xs border-solid border-border-neutral-bright` (Button neutral-outline 과 동일 조합, Button.tsx 에서 그대로 확인 가능). 라벨 색 `text-typo-neutral-normal`, chevron·startSlot 톤 `text-icon-neutral-light` — variant·bold 무관 고정.

**상태**: hover = 루트 `hover:opacity-[var(--alpha-80)]`, focus = `focus-visible:opacity-[var(--alpha-60)]` — 배경색 자체는 절대 안 바뀜(ButtonWithLabel/Button 의 hover=배경 교체 패턴과 다름, 주의).

**빈 슬롯 placeholder**: Figma 의 `red/500` 점선 박스(`startSlotContents`/`endSlotContents`)는 컴포넌트 설명에 "Properties 의 is Icon 은 파운데이션의 Icon 이나 Graphic 이 적용됩니다"라고 명시 — `[[figma-blankicon-blankgraphic]]` 프리미티브(이미 `src/components/ui/BlankIcon`, `BlankGraphic` 존재)가 대응하는 "빈 슬롯 표시" 개념과 동일 맥락. 색/점선 스타일은 무시하되, **크기(22/28/32/38/42)는 실제 정보라 startSlot 래퍼 정사각 크기로 채택**함. endSlotContents 는 전 size 60×22 고정으로 나왔지만 이건 "임의 콘텐츠" 데모용 placeholder 크기라 판단해 크기 강제하지 않고 endSlot 을 그대로 렌더(자유 폭).

**chevron**: 기존 `src/icons/components/chevron-right-line.tsx`(`chevron_right_line`) 재사용, 직접 SVG 작성 안 함 — Figma 의 `<img src=svg>` 결과를 그대로 베끼지 않고 기존 아이콘 레지스트리로 치환하는 것이 이 프로젝트의 기본 규칙(ClearButton·IconButton 선례와 동일).

code-connect 매핑은 아직 `figma-code-connect.json` 에 추가 안 함(요청 범위 밖).
