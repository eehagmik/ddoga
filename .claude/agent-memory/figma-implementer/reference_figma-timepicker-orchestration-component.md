---
name: figma-timepicker-orchestration-component
description: 최상위 TimePicker 오케스트레이션 컴포넌트(TimeField+BottomSheet+TimeSelect 조합) — DatePicker와 동일 원칙, 사용자 사전확정 사양으로 바로 구현한 사례
metadata:
  type: reference
---

`TimeField`(트리거)+`BottomSheet`(오버레이)+`TimeSelect`(휠 콘텐츠, 옛 이름 TimePicker —
[[figma-timepicker-component]] 참고)를 조합한 최상위 `TimePicker`
(`src/components/ui/TimePicker/`). [[figma-datepicker-component]] 류가 없어 대신
`DatePicker`(`src/components/ui/DatePicker/DatePicker.tsx`)와 동일한 오케스트레이션
원칙(discriminated union props, 라이브 커밋, `useEffect` 로 시트 재오픈 시 상태 처리)을
그대로 이식했다. 2026-09-23 사용자가 사전조사+승인을 이미 끝낸 상태로 위임해, 확인 질문
없이 바로 구현 → 검증까지 원샷으로 완료(전형적 "사양 확정 후 위임" 패턴).

**Figma 실측 vs 확정 사양 차이**: single 모드 시트 타이틀은 "시간 선택"(공백 있음,
`DatePicker`의 "날짜선택"과 다름 — Figma 그대로 채택). range 모드는 title prop 대신
`startSheetTitle`/`endSheetTitle`(기본 `${label} 선택`)을 쓴다 — 편집 중인 필드에 따라
시트 타이틀이 전환되기 때문.

**DatePicker와의 핵심 차이 — "기본값이 이미 커밋된 것으로 취급"**: Figma Setting
설명("첫 진입 시 기본값은 현재 시간")을 "시트를 열면 이미 유효한 값이 존재"로 해석해,
`DatePicker`처럼 `primaryDisabled`를 계산하지 않고 **항상 `false`** 로 고정했다. 대신
시트가 열릴 때(`openField` state 변경 감지 `useEffect`) 값이 없으면 그 자리에서 계산한
기본값을 즉시 `onChange` 로 커밋해버린다 — 사용자가 스크롤/클릭 없이 바로 "확인"만
눌러도 기본값이 반영되도록 하기 위함. `DatePicker`는 이런 자동 커밋이 없다(값 없으면
확인 비활성화가 기본).

**range 모드 — 시트 하나 재사용**: `TimeField`는 시작/종료 2개의 독립 필드를 렌더하지만,
`TimePicker`는 `openField: "single" | "start" | "end" | null` 하나로 시트를 공유한다.
종료 기본값 = "현재 유효한 시작값(방금 커밋된 것 포함)+6시간"(분 유지, 자정 랩어라운드
후 12시간제 재계산) — 순서 검증(시작>종료) 로직은 넣지 않음(Figma가 자정 넘나드는 예시를
제시해 제약 없다고 판단, 사용자 확정).

**테스트 함정 — 시/분 열 숫자 포맷 충돌**: `TimeSelect`의 시 열은 "1"~~"12"(패딩 없음),
분 열은 "00"~~"59"(2자리 패딩)라 "10" 같은 값은 시·분 양쪽에 다 존재해
`getByRole("option", { name: "10" })` 이 다중 매치 에러를 낸다 — 반드시
`within(dialog.getByRole("listbox", { name: "시" }))` 처럼 열 단위로 스코프를 좁혀야
한다. range 모드에서 시작/종료 두 필드가 모두 비어있을 때는 `TimeField` 자체가 둘 다
동일한 placeholder 접근성 이름("시간 선택")을 갖는 것도 함정 —
[[figma-timefield-component]] 의 알려진 특성이며, `TimeField.test.tsx` 관례대로
`getAllByRole(...)` + 배열 인덱스로 구분해야 한다(라벨 텍스트는 버튼과 별개 형제 요소라
접근 가능한 이름에 포함되지 않음).

구현 완료(2026-09-23). 파일: `src/components/ui/TimePicker/`(.tsx/.stories.tsx/.test.tsx/
index.ts). 검증: typecheck/lint/vitest(전체 1042개)/build 전부 통과, 하드코딩 없음.
