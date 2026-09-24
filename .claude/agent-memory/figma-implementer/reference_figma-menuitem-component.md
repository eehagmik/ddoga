---
name: figma-menuitem-component
description: Figma MenuItem(세로 리스트 행, node 51405:126122) 구조 — variant 4종 중 옛 "button"이 "chip"으로 개명(ButtonWithLabel→Chip 교체), 루트는 4종 모두 <button>으로 통일(단순화)
metadata:
  type: reference
---

Figma "또가3.0 Design System / MenuItem" (node 51405:126122, 파일 kUirarWT1Xugaq0aajY4G6) 구현 완료(2026-09-13, 최초 구현 후 같은 날 chip 리네이밍 반영). 세로로 쌓이는 메뉴/리스트 행 프리미티브. `HorizontalMenuButton`(가로·chevron 포함)과는 별개로 유지(사용자 확정).

**구조**: variant(`text`/`icon`/`graphic`/`chip`, 기본 text) × size(`xs`/`sm`/`md`/`lg`, 기본 md) × disabled. Figma state axis는 enable/hover/focus/disabled 4개, 전 variant 공통. 원래 variant 이름은 `button`(중첩 `ButtonWithLabel`)이었으나 사용자가 Figma 원본을 직접 `chip`으로 개명하고 중첩 컴포넌트를 `Chip`(`src/components/ui/Chip`)으로 전면 교체했다 — `buttonLabel` prop도 `chipLabel`로 리네이밍.

**루트 엘리먼트 — 단순화 이력(중요)**: 최초 구현 땐 `variant="button"`이 실제 `<button>`(`ButtonWithLabel`)을 중첩해서 루트도 `<button>`이면 무효 HTML이 되는 문제가 있어, `variant!="button"`→루트 `<button>`, `variant=="button"`→루트 `<div>`(focus-within: 사용)로 분기했었다. `chip` 리네이밍 후 중첩 컴포넌트가 `Chip`으로 바뀌었고, `Chip`은 `deletable=true`일 때만 내부에 실제 `<button>`(삭제버튼)을 렌더하는데 MenuItem은 `deletable`을 노출하지 않아 항상 `false` → 중첩 `Chip`은 이 컨텍스트에서 절대 `<button>`을 포함하지 않는다. 따라서 버튼-in-버튼 충돌이 사라져 **루트를 4개 variant 전부 `<button>`으로 통일**(div/PASSIVE_ROOT 분기 완전 제거, hover/focus-visible/disabled 전부 네이티브 의사클래스 하나로 처리) — 코드가 크게 단순해졌다. 향후 Chip에 `deletable`을 노출하게 되면 이 가정이 깨지므로 재검토 필요.

**label vs children 분리**: icon/graphic 우측 슬롯은 `children`, 라벨 텍스트는 별도 `label` prop(기본 "Label") — `VerticalMenuButton` 선례(슬롯=children, 텍스트=label)를 따름.

**size 토큰**: 높이(고정 h, min-h 아님) xs=44/sm=48/md=46/lg=50, 좌우 padding xs=12/sm=14/md,lg=16, 타이포 xs·sm=body-4/md·lg=body-3, 슬롯 xs·sm=20/md·lg=24, gap 전체 공통 8.

**중첩 Chip 실측(Figma `get_metadata`로 실제 인스턴스 width/height 확인)**: `color="brand"` `variant="fill"` 고정, `chipLabel`만 커스터마이즈. size는 **모든 MenuItem size에 대해 `xs` 고정** — 실측 높이가 xs/sm 그룹에서 26px(Chip `xs`와 정확히 일치), md/lg 그룹에서 24px(Chip 공식 사이즈엔 없는 값)였는데, `sm`(32)과는 8px 차이로 명백히 다르고 `xs`(26)와는 2px 차이뿐이라 인스턴스 리사이즈 오차로 판단하고 `xs`로 정규화함(Figma 노드 설명에 남아있는 "Button의 사이즈는 변경할 수 없습니다" 문구와도 정합 — 개명 전 문구가 그대로 남아있는 문서화 잔재로 보임). leading 아이콘(`startSlot`)은 다른 Blank 플레이스홀더 선례처럼 컴포넌트에 하드코딩하지 않음(노출 안 함, 스코프 최소화).

**disabled 처리 — 1차 조사와 2차 변경으로 인한 변동**: 최초(1차) 조사에서 "`ButtonWithLabel` 노드에 `opacity: 60%`가 걸림(색은 그대로)"까지 확인했으나 세션이 끊겨 반영되지 못했다. 이후(2차) 사용자가 중첩 컴포넌트를 `Chip`으로 통째로 교체하면서 이 논의가 무효화됨 — `get_design_context`로 재조사한 결과 `variant=chip`의 `state=enable`과 `state=disabled` 노드는 마크업이 완전히 동일(배경·불투명도·아이콘 전부 무변화), 라벨 텍스트 색만 바뀐다. `Chip` 컴포넌트 자체에 `disabled` prop이 없다는 사실과도 정합적이라 별도 opacity 래퍼를 씌우지 않음(래퍼 처리 불필요로 확정). **주의**: 이전엔 disabled를 중첩 컨트롤에 전파하지 않는 것이 "사용자 확정 사항"이었는데, Chip 교체 후엔 애초에 전파할 `disabled` prop 자체가 Chip에 없으므로 그 논쟁이 자연 소멸됨.

**Storybook 주의**: 같은 화면에 라벨("Label")과 중첩 컨트롤 라벨("Label")이 둘 다 기본값이면 `getByText("Label")`이 복수 매치로 깨짐 — chip 관련 story는 chipLabel을 다른 값("확인")으로 바꿔서 테스트.
