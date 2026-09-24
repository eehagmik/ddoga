---
name: figma-boardaccordion-component
description: BoardAccordion(node 51405:3210) — Accordion 후속 컴포넌트, titleDirection/startSlot/date 축, hover-driven 볼드 타이포, line-clamp-2 규칙, Figma 산출물 왜곡(w-284px 고정폭, div/button 불일치) 무시 판단 근거
metadata:
  type: reference
---

파일 "또가3.0 Design System"(fileKey `kUirarWT1Xugaq0aajY4G6`), BoardAccordion 문서/메인 노드 `51405:3210`. [[reference-figma-tooltip-component]] 계열과 마찬가지로 presentational 확장이지만, 이번엔 이미 구현된 [[reference-figma-toggle-component]]류가 아니라 **같은 파일에 먼저 구현된 `Accordion`(51405:3189) 의 상태관리/트랜지션 로직을 그대로 복제**해서 만든 후속 컴포넌트라는 점이 특이하다 — 합성(import)이 아니라 로직 복제.

## 실제 variant (get_design_context 재검증 완료)

`expanded`(false/true) × `state`(enable/hover, expanded+hover 없음, `Accordion` 과 동일 패턴) × `titleDirection`(horizontal/vertical) = 6개 인스턴스. Figma 문서 주석의 "Type=text/file" 축은 **실제 `BoardAccordionProps` 타입에 존재하지 않음**(get_design_context 로 직접 확인) — 주석만 있고 실제 컴포넌트 프로퍼티가 아니면 무시해야 한다는 스킬 지침의 실제 적용 사례.

## Figma 코드젠 산출물의 왜곡(실제 설계 아님, 무시하고 판단한 것들)

- collapsed+enable(기본 variant) 만 원본 export 가 `<div>` 로 나오고 나머지 5개는 `<button>` — Figma 코드젠이 "기본" variant 를 다르게 직렬화하는 특성일 뿐. 6개 전부 `<button>` 으로 통일 구현(Accordion 선례와 일치).
- collapsed 상태의 아이콘+제목 줄에 고정폭 `w-[284px]`(=360-좌우패딩40-chevron영역36) 와 불필요한 중첩 wrapper div 가 있음 — variant 별로 프레임이 개별 고정폭으로 얼려진 auto-layout 산출물. 실제 구현은 `Left` flex-1 + 제목 줄 `w-full` 로 단순화(하드코딩 폭 없음).

## 상태별 배경/타이포 (실존, `Accordion` 과 동일한 "조건부 hover 유틸 포함/제외" 패턴)

| expanded | state  | 배경                 | Title 타이포                             |
| -------- | ------ | -------------------- | ---------------------------------------- |
| false    | enable | bg-bg-neutral-normal | text-body-3 (Medium)                     |
| false    | hover  | bg-bg-neutral-deep   | text-body-3-bold (Bold)                  |
| true     | enable | bg-bg-neutral-normal | text-body-3-bold (Bold, hover 무관 고정) |

배경 hover 는 버튼 "자신"의 상태이므로 `hover:bg-bg-neutral-deep` (플레인 hover, [[feedback-group-hover-self-styles]] 규칙과 동일 — 루트 자신은 group-hover 아니라 hover). 반면 제목 텍스트의 hover 볼드 전환은 "자식" 스타일 변경이므로 버튼에 `group` 클래스를 얹고 자식 텍스트에 `group-hover:text-body-3-bold` 를 적용 — **같은 헤더 버튼 안에 두 가지 hover 처리 방식(hover: 와 group-hover:)이 공존**하는 첫 사례. 타이포 유틸(`text-body-3`/`text-body-3-bold`, `text-label-2`)은 4속성(font-size/line-height/letter-spacing/font-weight) 합성 토큰이라 `group-hover:` 접두사를 그대로 붙여도 정상 동작(Tailwind 컴파운드 유틸 특성).

## Title 2줄 클램프

Figma 디자이너 주석: collapsed 시 최대 2줄, expanded=true 면 Type 무관 전체노출. `line-clamp-2` 를 collapsed 일 때만 적용(hover 여부 무관, expanded 되면 클래스 자체가 사라짐). 프로젝트에 line-clamp 선례가 없었지만 색상/스페이싱 하드코딩이 아닌 구조적 유틸이라 그대로 채택.

## Props 설계 — Figma 원본과 다르게 통합한 것

- `startSlot`(boolean)+`startSlotContents`(slot) → `startSlot?: ReactNode` 하나로 (HorizontalMenuButton 선례).
- `date`(boolean)+`dateValue`(text) → `date?: ReactNode` 하나로.
- `contentsSlot` → `children`(Accordion 과 동일 네이밍).
- Figma prop 원래 이름 `divider` → 프로젝트 컨벤션 통일을 위해 `isDivider`(기본 true, Accordion 과 동일 네이밍)로 강제 변경 — Figma 원본 이름을 그대로 베끼지 않은 명시적 사례.

## Storybook 슬롯 placeholder 컨벤션

"Title 안의 슬롯 자리는 항상 '슬롯' 글자 회색 박스로" 라는 사용자 요청은 프로젝트 전역 컨벤션으로, `HorizontalMenuButton.stories.tsx` 의 `SLOT_PLACEHOLDER_LABEL`/`resolveSlot`/`renderStartSlotPlaceholder` 패턴을 그대로 복제해서 재사용해야 한다(재발명 금지) — 이번엔 크기가 24px 고정이라 size map 없이 단순화된 버전으로 적용.

구현 파일: `src/components/ui/BoardAccordion/{BoardAccordion.tsx,BoardAccordion.stories.tsx,BoardAccordion.test.tsx,index.ts}`. 완료(2026-09-13). code-connect 매핑 미추가(Accordion 도 없음, 선례 일치).
