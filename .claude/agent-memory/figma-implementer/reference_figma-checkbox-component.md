---
name: figma-checkbox-component
description: Figma "Checkbox" 아톰 컴포넌트 세트(51405:45384) - 3 variant(circle/square/mark), 커스텀 Union 체크마크, 상태별 토큰, 코드 구현 위치
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System).

**Checkbox** 컴포넌트 세트: node-id `51405:45384`. 이름 정확히 "Checkbox", 카테고리 ATOMS. 54 심볼 = `variant`(3: circle/square/mark) × `size`(3: sm/md/lg) × `checked`(2) × `state`(3: enable/hover/disabled). **focus·pressed·indeterminate 상태 없음.** 라벨·히트영역 없는 순수 시각 요소 — 상위 몰리큘 `CheckboxWithLabel`(MOLECULES), `CheckboxCard`(MOLECULES)가 이 아톰을 조합 — 둘 다 코드 구현 완료(2026-09-10), 상세는 [[figma-checkboxcard-component]].

- **체크마크**: `_checkboxImage` 노드(`51405:45377`)의 단일 레이어 `Union` = 채워진 두꺼운 체크마크(둥근 조인트). 파운데이션 아이콘셋(`src/icons`)에 형태 일치 글리프 없음(`check-solid`는 얇은 아웃라인형 — 부적합). Figma 설명: 커스텀 벡터 `parts/etc_check_thick`. 54 심볼이 참조하는 애셋 30여 개지만 실제로는 같은 path를 크기·색만 바꾼 것. viewBox 0 0 24 24 path: `M20.4777 6.02235C19.7812 5.32588 18.6284 5.32588 17.932 6.02235L9.5984 14.3559L6.06805 10.8256...Z`.
- **박스 크기**: sm=`sz/22`, md=`sz/24`, lg=`sz/28`. 테두리 `borderWidth/sm`=2px(unchecked만). radius: circle=`radius/circle`, square=`radius/sm`(6), mark=없음.
- **circle·square 색상 동일**(모양만 다름):
  - unchecked enable: bg `background/neutral/normal` + border `border/neutral/light` + 체크마크 `icon/brandGrayish/light` @ opacity `alpha/40`
  - unchecked hover: bg `background/brandGrayish/deep`(#eff6f3) + border 동일 + 체크마크 `icon/brandGrayish/subtle` @ 40%
  - unchecked disabled: bg `background/disabled/subtle` + border `border/disabled/normal` + 체크마크 `icon/disabled/normal` @ 40%
  - checked enable: bg `background/brand/normal` **테두리 없음** + 체크마크 `icon/inverse/normal`(흰색, 불투명)
  - checked hover: bg `background/brand/deep`
  - checked disabled: bg `background/disabled/normal`(#d9d9d9)
- **mark**(상자·테두리·40% 불투명도 전부 없음, 체크마크만 박스 크기로 채움): unchecked enable `icon/brandGrayish/light` / hover `icon/brandGrayish/subtle` / disabled `icon/disabled/light` ; checked enable `icon/brand/normal` / hover `icon/brand/deep` / disabled `icon/disabled/subtle`.
- circle/square 내부 글리프 크기는 Figma가 비일관(square-md에 18·20 혼재) → 코드에서 sm 16 / md 18 / lg 20 로 정규화.

Code Connect: `figma-code-connect.json` mappings에 `51405:45384` 항목 추가됨(variant/size/checked/disabled 매핑, hover는 group-hover 유틸).

**코드 구현 (2026-09-10):** `src/components/ui/Checkbox/` 4파일. 순수 시각 프리미티브 — `<span>` 하나만 렌더, native input/onChange 없음(`Dot` 선례). `checked`/`disabled` props, hover는 `group-hover:` 유틸(부모 hover 전파, 상태 prop 아님). 비공개 `CheckMark` 헬퍼가 Union path 인라인(`fill="currentColor"` → `text-icon-*` 상속, `BlankIcon` 선례). `data-variant`/`data-size`/`data-checked`/`data-state` 속성. size 기본 `md`.

관련: [[figma-button-archetype]], [[design-token-architecture]]
