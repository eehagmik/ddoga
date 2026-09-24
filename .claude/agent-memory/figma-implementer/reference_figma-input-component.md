---
name: figma-input-component
description: Figma Input 컴포넌트(51405:104612, TextField 의 원자 프리미티브) 구조와 TextField 대비 실측 차이, TextField→Input 조합 리팩토링 완료 기록
metadata:
  type: reference
---

Input(`src/components/ui/Input/Input.tsx`) — Figma 문서 node 51405:104597(Guide, 별도 컴포넌트 아님, TextField 의 104597 선례와 동일 패턴) / 컴포넌트 세트 node 51405:104612.

핵심 사실:

- `type`(코드 variant) 은 `"line" | "box"` 두 값뿐 — **Input 세트 자체에는 transparent 계열 variant 가 없다**. TextField 의 transparentBody/transparentTitle 은 TextField 레벨에서 추가된 축이라 Input 범위 밖.
- state 축: enable/hover/focus/danger/disabled/readOnly(6) × hasValue(2) × type(2) = 24 조합, 전부 `get_design_context` 로 실측함.

TextField 대비 실측 차이(→ 2026-09-17 리팩토링으로 정정 완료, 아래 참고):

1. disabled + 값 있음 텍스트색은 `typo-disabled-normal`(placeholder 의 `typo-disabled-subtle` 보다 진함).
2. box 변형 테두리색은 `hasValue` 만으로 브랜드색 전환(enable+hasValue, readOnly+hasValue 도 포함, hover·focus 무관).

기타 재사용 결정(TextField 선례 그대로 유지):

- clearButton 상시 노출(hasValue && !disabled && !readOnly) — Figma 는 hover/focus 시에만 노출하지만 모바일 터치 환경 고려해 재조정.
- line 밑줄 애니메이션(JS percent 0→100) 대신 `transition-colors` 로 대체.
- endIcon(iconButton) 은 Figma 상 모든 state 에서 항상 렌더(hover/focus 전용 아님) — `iconButton` boolean 이 아니라 presence(`endIcon` 존재 여부) 기반으로 구현.

구현 완료(2026-09-17). 생성 파일: `src/components/ui/Input/{Input.tsx,Input.stories.tsx,Input.test.tsx,index.ts}`. figma-code-connect.json 에는 아직 매핑 미추가.

## TextField → Input 조합 리팩토링 (2026-09-17 완료)

TextField(`src/components/ui/TextField/TextField.tsx`)가 line/box 필드 셸을 자체
통짜 구현하던 것을, `Input` 을 실제로 렌더링하는 얇은 합성 컴포넌트로 리팩토링했다.

- line/box: `<Input variant id startIcon endIcon value onChange onClear clearLabel
placeholder danger disabled readOnly inputClassName {...rest} />` 를 그대로
  렌더링. TextField 는 그 위/아래에 라벨 행(label/required/onInfoClick)과
  helperText 만 얹는다. `id` 는 TextField 가 생성해 `<label htmlFor>` 와 `Input`
  양쪽에 동일하게 전달(접근성 연결 유지).
- transparentBody/transparentTitle: Input 세트에 없는 축이라 TextField 자체
  렌더링을 그대로 유지(중앙정렬/타이틀 텍스트, 테두리·아이콘 슬롯 없음). 색상 헬퍼
  함수(`getTransparentPlaceholderColorClass`/`getTransparentValueColorClass`)는
  이 두 variant 전용으로 슬림화(line/box 분기 완전 제거, `getFieldChromeClass`
  자체를 삭제).
- known 오차 2건은 Input 조합만으로 자동 해결됨을 신규 테스트 3개로 직접 확인
  (`TextField.test.tsx` "Input 조합 리팩토링 이후 known 오차 수정 확인" describe
  블록): disabled+hasValue 텍스트색 `typo-disabled-normal`, box
  enable/readOnly+hasValue 테두리 `border-border-brand-normal`(focus 무관).
- 기존 19개 테스트 전부 코드 변경 없이 통과(line readOnly placeholder subtle vs
  box readOnly placeholder hint-subtle 비대칭 케이스 포함 — Input 의 로직이 기존
  TextField 실측과 이미 일치했던 부분이라 회귀 없음).
- ClearButton 직접 import·`getFieldChromeClass`·`ICON_SLOT_CLASS`·
  `handleClear` 를 TextField 에서 제거(Input 내부로 위임). stories 파일은 props
  인터페이스 불변이라 수정 없이 그대로 통과.
- 검증: `npm run typecheck` / `npx eslint ... --max-warnings=0` /
  `npx vitest run TextField Input`(39 passed) / `npm run build` 전부 통과.
