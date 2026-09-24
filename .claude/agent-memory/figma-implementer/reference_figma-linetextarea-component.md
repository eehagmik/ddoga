---
name: figma-linetextarea-component
description: LineTextarea 컴포넌트(51405:135837) — Textarea(135814) 아톰을 조합한 몰리큘, Input/TextField 관계와 동일 구조, Label/HelperLabel 재사용 + group-focus-within 밑줄 정정
metadata:
  type: reference
---

[[figma-textarea-component]]의 형제 몰리큘. get_design_context(51405:135837) 실측 결과
props: `hasValue`/`isHelper`/`isInputCount`/`isLabel`/`isOption`/`state`(enable/hover/
focus/danger/disabled). `Input`→`TextField` 리팩토링과 정확히 같은 패턴으로 구현—
내부적으로 `Textarea` 아톰을 그대로 인스턴스처럼 사용(Figma 실측 코드도 실제
`<Textarea state=... hasValue=... />`).

핵심 발견 및 결정:

- **기존 `Label`/`HelperLabel` 컴포넌트를 그대로 재사용**(`TextField.tsx` 는 이 둘을
  재사용하지 않고 인라인으로 재구현했던 선례가 있었지만, 그건 기술부채로 판단하고 이번엔
  프로젝트 재사용 원칙을 우선했다). 단, `Label` 자체는 `<div>` 라 폼 연결이 없어
  `<label htmlFor={id}><Label .../></label>` 로 감싸 접근성을 확보(`TextField` 의
  `<label>` 관례 계승). `HelperLabel` 은 `label?: string` 만 받고 `children` 을
  렌더하지 않는 사각지대가 있어 `LineTextarea` 의 `helperText` 도 `ReactNode` 대신
  `string` 으로 제한했다(TextField 의 helperText 는 ReactNode 라 시그니처가 다름).
- `isInputCount` 는 Figma 실측 코드상 "enable && !hasValue" 심볼 하나에서만 실제로
  조건에 배선돼 있고 나머지 상태(hover/focus/danger/disabled/enable+hasValue)에서는
  조건 없이 카운터가 항상 렌더된다 — Figma 프로퍼티 배선 누락으로 판단, 코드에서는
  `isLabel`/`isHelper`/`isInputCount`/`isOption` 4개 boolean 을 전부 없애고
  `label`/`helperText`/`maxLength` presence 기반으로 통일(TextField 선례와 동일 철학).
  `maxLength` 는 새 prop 을 만들지 않고 네이티브 `TextareaHTMLAttributes.maxLength` 를
  그대로 재사용(글자수 제한 강제 + 카운터 표시 겸용), 카운트는 `value.length`.
- **밑줄(PartsInputLine) 색은 `hasValue` 와 완전히 무관하고 `state` 값에만 반응**한다
  (Figma 실측 — `enable`+값있음도 `enable`+값없음과 밑줄 렌더가 동일). enable/hover=
  `bg-bg-neutral-deepDark`(포커스 시 `bg-bg-brand-normal`), danger=`bg-bg-danger-normal`
  (포커스 무관 상시), disabled=`bg-bg-disabled-normal`.
- **`Input.tsx` 의 line 밑줄 focus-within 버그를 발견하고 정정**: `Input` 은
  `focus-within:bg-bg-brand-normal` 을 밑줄 자기 자신(내용 없는 빈 `<div>`, sibling)에
  걸어두는데, 그 엘리먼트 자체가 포커스를 받을 수 없어(자손도 없음) 이 클래스가
  실제로는 절대 발동하지 않는 잠재 버그로 보인다(Input.test.tsx 에도 이 케이스 테스트가
  없어 미발견 상태였다). `LineTextarea` 는 필드+밑줄의 공통 부모에 `group` 을 걸고
  밑줄에 `group-focus-within:` 을 사용해 실제로 동작하도록 의도적으로 다르게
  구현했다([[.group 루트 자기 hover 스타일]] 메모의 self-vs-descendant 구분 원칙 적용).
  **`Input.tsx` 자체는 이번 작업 범위 밖이라 손대지 않았다** — 사용자가 만약 이 버그를
  인지하면 별도로 고쳐야 함.
- hover 는 필드(Textarea 를 감싼) 컨테이너 자기 자신에 `hover:bg-bg-overlay-
greenGraySubtle` 틴트만 추가, danger/disabled 조합에는 hover 클래스 자체를
  제외한다(`Input` 의 danger/disabled 분기와 동일 규칙).
- Figma 컴포넌트 설명("최소 2줄~~최대 5줄까지 노출 가능")은 강제 clamp 로 구현하지
  않고 `rows` 를 2~~5 사이로 고르라는 사용 가이드로 해석 — `Textarea` 아톰 자체가
  고정 `rows`(자동 grow 없음) 기반이라 이 컴포넌트도 그대로 passthrough 만 한다.

구현 완료(2026-09-17): `src/components/ui/LineTextarea/` 4파일 세트(20 vitest),
`figma-code-connect.json` 에 51405:135837 매핑 추가(Textarea 51405:135814 항목 바로
뒤). typecheck/build/전체 vitest(59 files/683 tests)/eslint 전부 통과.
