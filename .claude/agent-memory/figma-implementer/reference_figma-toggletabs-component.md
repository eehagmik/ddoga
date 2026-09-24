---
name: figma-toggletabs-component
description: Figma ToggleTabs 컴포넌트 세트(51405:153913) 구조·토큰 실측과 구현 결정 사항
metadata:
  type: reference
---

Figma "또가3.0 Design System / ToggleTabs" (node 51405:153913, 6개 심볼: size sm/md ×
subMenu false/true × expanded false/true[subMenu=true 일 때만]).

- 내부 `_parts/ToggleList`(private part, `_` 접두사)는 별도 컴포넌트로 분리하지 않고
  `ToggleTabs` 구조에 흡수. [[reference_figma-checkselectradio-component]] 등 기존 `_parts`
  private part 처리 선례와 동일.
- 탭 아이템은 `ToggleTabs` 가 만들지 않는다 — 호출부가 `<Toggle variant="round">` 를
  `children` 으로 직접 나열. 가로 스크롤은 `Scroll`(`axis="x"`) 재사용(자체 구현 금지).
- `subMenu=true` 면 우측에 chevron 인디케이터 **실제 버튼**(장식 아님, 클릭 시 expanded 토글)
  이 ToggleList 행 우측에 절대위치로 얹힌다 — Figma export 코드는 md/expanded 조합에서만
  구조가 다르게 나오는데(flex 자식 vs absolute) 이는 Figma auto-layout 직렬화 편차일 뿐이라
  전체 4개 subMenu 조합에 동일한 절대위치 구조를 적용했다(`BoardAccordion` 의 "collapsed 만
  `<div>` 로 나오는 산출물 편차" 선례와 동일 패턴).
- 펼침/접힘은 `Accordion`/`BoardAccordion` 과 완전히 동일한 height 0↔px→auto 트랜지션
  로직을 그대로 이식(`getAutoHeightDuration`, `cubic-bezier(0.4,0,0.2,1)`). 인디케이터는
  회전이 아니라 `chevron_down_line`↔`chevron_up_line` 아이콘 교체.
- `get_variable_defs` 로 재검증한 결과, Figma 의 chevron 뒤 화이트 페이드 폭(sm 60px/md
  70px)은 variable 이 바인딩되지 않은 값 — 디자인 토큰이 아니라 Figma 레이아웃 편차. 우측
  오프셋(`--sz-8`) + 버튼 지름(`--sz-32`/`--sz-40`) + 페이드 여유(`--sz-20`) 조합의 `calc()`
  로 근사 구현(정확히 60/70px 을 강제하지 않음).
- chevron 인디케이터 버튼: `bg-bg-neutral-normal` + `border-xs border-border-neutral-bright`
  - `rounded-circle` + `shadow-black-xs`(Figma "0px 2px 4px black/normal, 0px 1px 2px
    black/light" 와 정확히 일치), 아이콘 색 `text-icon-neutral-normal`(Accordion 의
    `text-icon-neutral-light` 와 다름 — Figma variable 재검증으로 확인).
- 인디케이터 아이콘 픽셀 크기는 Figma inset 비율(`calc(25%-...)` 등) 로 역산: sm=16,
  md=20(24px 기본 아이콘 크기가 아님, size prop 으로 명시 지정 필요).
- `SubMenuList`: 하단만 `rounded-2xl`, 좌우 `--sz-8` 공통 + 상하 sm=`--sz-10`/md=`--sz-12`,
  내부 완전 자유 슬롯(`subMenuContent`, Figma `🟥ContentsSlot`) — Figma 상 h-32 는 placeholder
  더미 박스 크기일 뿐 실제 높이 제약이 아니므로 코드에서 높이를 강제하지 않음.
- 루트 폭은 Figma 360px 고정 프레임을 무시하고 `w-full` 로 구현(다수 컴포넌트 선례,
  [[reference_figma-horizontalmenubutton-component]] 의 "240px→w-full 확정사항"과 동일 결정).

구현 완료(2026-09-16). 파일: `src/components/ui/ToggleTabs/{ToggleTabs.tsx,ToggleTabs.stories.tsx,ToggleTabs.test.tsx,index.ts}`.
빌드/타입체크/테스트(9개)/린트 전부 통과, 하드코딩 없음. code-connect 매핑은 미추가.
