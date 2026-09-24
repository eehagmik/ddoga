---
name: figma-calendar-component
description: Figma "Calendar"(51405:11899) → Calendar 컴포넌트(Figma 원본명 그대로 사용, DatePicker 아님). 캘린더 팝업 콘텐츠, DateField가 열 실제 컨텐츠, mode single/range, 범위 배경은 날짜 비교만으로 자연히 재현됨, isPreview 해석 차이
metadata:
  type: reference
---

Figma 컴포넌트명 "Calendar"(문서 캔버스 51405:11635, 메인 프레임 51405:11899, variant `default`/`single`/`range`×`check`)를 **`Calendar`로 그대로 명명**한다 — `DateField`(`src/components/ui/DateField`)가 열게 될 실제 캘린더 팝업 콘텐츠다.

**명명 정정 이력(중요, 재발 방지용)**: 최초 구현 시 조정자 지시에 "컴포넌트명은 DatePicker" 라고 명시되어 있어 `DatePicker`로 만들었으나, 작업 도중 사용자가 "이름이 DatePicker가 아니라 Calendar야. DatePicker는 이후에 만들겠다는 연결된 컴포넌트임" 이라고 정정했다. 즉:

- `Calendar` = 이번에 구현한 캘린더 그리드 자체(Figma 원본명과 동일).
- `DatePicker` = `Calendar`를 내부에 사용해 `DateField`(트리거 필드)와 조합할 **상위 컴포넌트**, 아직 미구현·향후 별도 작업.
- 향후 유사 지시("컴포넌트명은 X로 하되 Figma 원본명과 다름" 같은 사전 요약)를 받아도, 작업 중간에 사용자가 실시간으로 이름을 정정할 수 있으므로 최종 확정은 대화의 가장 최신 지시를 따를 것. 폴더/파일명/export/interface명을 한꺼번에 리네이밍해야 할 때는 `git mv` 대신 `mkdir` + `cp` + `sed -i ''`로 새 폴더를 만들고 기존 폴더를 삭제하는 방식이 빠르고 안전했다(하나씩 Edit 하는 것보다 효율적).

하위 아톰(같은 문서 캔버스, 별도 파일로 분리하지 않고 로직만 이식):

- `_parts/YearMonthButton`(51405:11748) — 트리거 전용, 실제 년/월 선택 UI는 범위 밖. 클릭 시 `onYearMonthClick`만 호출.
- `_parts/CalendarHeader`(51405:11780), `_parts/DayCell`(51405:11792, 요일헤더), `_parts/DateNumberCell`(51405:11799, 날짜셀).

핵심 설계 인사이트 — **range 구간 배경은 행별 분기 로직이 전혀 필요 없다**: "시작 요일~~토요일" / "일~~토 전체" / "일요일~종료일" 세 시각 패턴이 복잡해 보이지만, 각 날짜 셀이 단순히 `startDate~endDate`(정규화 날짜, inclusive) 사이인지만 판정하면 자동으로 재현된다. 이유: 한 주(row) 안의 인접 셀 wrapper들이 가로로 맞닿아 있어(행 사이에만 세로 gap, 행 안에는 가로 gap 없음) 개별 셀 배경이 자연스럽게 이어져 보인다. 이 인사이트 덕분에 "표준 range-picker 로직을 직접 설계"하라는 지시에도 불구하고 구현이 매우 단순해짐.

**Figma `isPreview` variant 해석 차이(사용자 확정 스펙으로 재정의)**: `_parts/DateNumberCell`의 실제 Figma `isPreview` variant는 단순히 텍스트에 `opacity-[20%]`를 추가하는 것뿐(타입별 색은 유지한 채 흐리게)이다. 하지만 이번 사양서는 "hover 프리뷰"라는 별개 개념으로 재정의했다: range 모드에서 `startDate`만 있고 `endDate`가 없을 때 hover한 날짜를 임시 종료일 후보로 간주해 **확정 range와 동일한 `--color-blue-60` 배경**으로 미리보기(Figma의 실제 isPreview 룩과는 무관, 텍스트 투명도 처리 안 함). Figma 아톰을 문자 그대로 이식하지 않고 사용자가 새로 정의한 동작을 그대로 따름 — 이런 "Figma variant명은 같지만 실제 요구 동작은 다르게 재정의"하는 패턴이 있을 수 있으니 사양서의 확정 스펙 문구를 Figma 실측보다 우선시할 것.

**"다른 달 패딩 셀 = disabled 룩"** 도 별개 사양(사양서 문구: "isPreview=true가 disabled룩이야"라는 표현이 있었지만 실제로는 패딩 셀에 `_parts/DateNumberCell`의 `status="disabled"` 룩을 재사용하라는 뜻이었고, Figma의 진짜 `isPreview` variant와는 무관함을 최종 확인). 헷갈리는 이름이지만 사양서 전체 맥락(별도 두 항목으로 명확히 구분되어 서술됨)을 따르면 혼동 없음.

기타 확정 사항:

- 이전/다음달 이동 버튼은 Figma 실측 20px 대신 프로젝트 표준 `IconButton`(24px 고정) 그대로 재사용(정확한 픽셀 매칭보다 컴포넌트 일관성 우선) — [[figma-node-canvas-vs-frame]]과 같은 결의 "의도적 재조정" 패턴.
- 요일 헤더 행은 `justify-between` + 고정 `size-[var(--sz-36)]` 원형 셀, 날짜 그리드 행은 반대로 `flex-1` 균등폭 — Figma 원본은 둘 다 `flex-1`이지만 사양서가 명시적으로 이 둘을 다르게 지정했으므로 그대로 따름.
- 요일 헤더 토요일 색 `--color-purple-500`, 날짜 그리드 토요일 색 `--color-purple-700`, range 배경 `--color-blue-60` — 셋 다 시맨틱이 아닌 Primitive 토큰 직접 사용(사용자 지시: "시맨틱 말고 Primitive에 있는 걸로 써"). Tailwind v4 `@theme static`에 `--color-purple-500` 등이 등록돼 있으면 `text-purple-500`/`bg-blue-60` 같은 유틸리티가 자동 생성되므로 `var()` 감싸는 arbitrary value 불필요, 코드베이스 관례(`text-typo-neutral-normal`처럼 plain 유틸 클래스)를 그대로 따르면 됨.
- `border-sm`(width, `--border-width-sm`)/`border-border-info-deep`(color) 같은 플레인 유틸리티 조합이 코드베이스 관례(Radio.tsx 등에서 확인) — `border-[var(--border-width-sm)]` 같은 arbitrary bracket은 불필요.

테스트 함정: React의 `onMouseLeave`는 네이티브 `mouseout`/`mouseover` 버블링으로 시뮬레이션되므로, 테스트에서 raw `element.dispatchEvent(new MouseEvent("mouseleave"))`를 직접 호출해도 React 핸들러가 감지하지 못한다. `@testing-library/user-event`의 `user.unhover(element)`를 사용해야 실제 사용자 동작과 동일하게 트리거된다.

구현 완료(2026-09-21, 명명 정정 반영). 파일: `src/components/ui/Calendar/{Calendar.tsx,Calendar.stories.tsx,Calendar.test.tsx,index.ts}`. export `Calendar`, props `CalendarProps`, mode 타입 `CalendarMode`.
