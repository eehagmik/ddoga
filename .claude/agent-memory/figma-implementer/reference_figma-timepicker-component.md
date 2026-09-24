---
name: figma-timepicker-component
description: Figma TimePicker 컴포넌트(node 51405:151034) 구현 시 참고 — 3열 휠피커, 통합 value 객체 props, 스크롤 중앙정렬 공식, 사용자 확정 확장사항. 2026-09-23 코드상 `TimeSelect` 로 리네임됨(아래 본문은 여전히 이 컴포넌트를 설명), 최상위 오케스트레이션 컴포넌트는 별도로 새로 만든 [[figma-timepicker-orchestration-component]] 참고
metadata:
  type: reference
---

**2026-09-23 업데이트**: 이 메모가 설명하는 3열 휠 콘텐츠는 코드에서 `TimePicker`→
`TimeSelect`(`src/components/ui/TimeSelect/`)로 리네임되었다. 이후 `TimeField`+
`BottomSheet`+이 `TimeSelect`를 조합하는 새 최상위 `TimePicker`
(`src/components/ui/TimePicker/`)가 별도로 만들어졌다 — 자세한 내용은
[[figma-timepicker-orchestration-component]] 참고. 아래 본문의 "TimePicker"는 전부
`TimeSelect`를 가리킨다(리네임 당시 본문 자체는 수정하지 않음).

Figma "또가3.0 Design System / TimePicker" — 문서 캔버스 51405:150988, 메인 컴포넌트 node
51405:151034(심볼 51405:151035), 하위 아톰 `_parts/TimePickerSelect/Cell`(51405:150996,
7 state 심볼) / `_parts/TimePickerSelect/List`(51405:151013, variant=Radio·Select 2종).

구조: 오전/오후(스크롤 없는 Radio, 고정 2항목) × 시(1~~12, Select 스크롤) × 분(Select 스크롤,
**사용자 승인으로 Figma 목업의 0~~11 12개 축소 샘플을 0~59 60개 전체로 확장**). 헤더/확인 버튼
없이 순수 휠 바디만 — `BottomSheet`(contentsSlot) 에 children 으로 꽂아 쓴다. `DateField`/
`TimeField` 가 "클릭 시 부모가 연다"고 위임해둔 실제 오버레이가 이 컴포넌트.

선택 표시는 포커스 링이 아니라 셀 배경색 자체(`bg-bg-info-normal`/`-deep`, unchecked 는
배경 없음/`bg-bg-info-bright` hover). disabled+checked 조합은 Figma 미정의 → enable 룩
유지한 채 비활성화만. **타이핑 캐럿(state=focus, `yellow/100`+`purple/500` primitive) 은
사용자 승인으로 스코프 밖** — focus-visible 은 기존 브랜드 보더 토큰으로 최소 처리.

정확한 실측치: 셀 46px(`--sz-46`), 셀 간 gap 4px(`--sz-4`), 그라데이션 오버레이 58px
(`--sz-58`, 흰→투명, `FixButton` GRADIENT_CLASS 선례와 동일 인라인 `linear-gradient` 패턴),
루트 320px 폭 고정(`--sz-320`)·높이 가변(min 320/max 520, `--sz-520` 토큰 없어 max-h만
arbitrary px — `BottomSheet` 90dvh 선례와 동일한 예외).

핵심 구현 트릭: Figma 는 특정 스크롤 위치의 정적 스냅샷(빈 셀 2+1 비대칭 배치)이라 그대로
베끼면 안 됨 — 대신 `ResizeObserver` 로 컨테이너 높이를 측정해
`spacerHeight = (containerHeight - CELL_HEIGHT) / 2 - CELL_GAP` 공식으로 상하 패딩을
동적 계산하면 `scrollTop = index * (CELL_HEIGHT + CELL_GAP)` 로 단순화된다(유도 과정은
TimePicker.tsx JSDoc 참고). `scrollend` 대신 debounce(120ms) 된 `scroll` 이벤트로 커밋.
오전/오후(비스크롤) 열은 선택된 항목이 항상 3행 중앙에 오도록 빈 칸 1개를 반대편에 두는
트릭(오전 선택 시 [빈칸,오전,오후], 오후 선택 시 [오전,오후,빈칸])으로 시/분 열과 정렬 맞춤.

Props 는 사용자 지정으로 통합 `value: {meridiem,hour,minute}` 객체 + 단일 `onChange` (개별
필드 prop 아님, [[figma-timefield-component]] 류의 분리형 value prop 패턴과 다름).

jsdom 방어: `ResizeObserver`/`Element.scrollTo` 존재 여부 체크 후 optional 호출.

Story 합성 데모("BottomSheet+Header+FixButton 조합" 요청)는 실제로는 `Header`(`type="select"`,
`onTitleClick` 오버레이 트리거 선례) + `BottomSheet`(내장 header/fixButton prop, 별도
Header 컴포넌트를 BottomSheet 안에 넣는 게 아님) + `contentsSlot` 에 TimePicker로 구현.

구현 완료(2026-09-21). 파일: `src/components/ui/TimePicker/`.

JSDoc 작성 시 `from-*`/`to-*` 처럼 `*/` 시퀀스가 우연히 만들어지면 블록 코멘트가 조기
종료된다 — [[feedback_text-node-stroke-missing-from-codegen]] 와 별개의 동일 계열 함정,
`*` 와 `/` 사이에 백틱을 끊어 넣어 피함.
