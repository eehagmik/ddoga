---
name: figma-textarea-component
description: Textarea 컴포넌트(51405:135814) — 135245는 페이지 canvas 자체(get_design_context 불가, get_metadata만 가능), LineTextarea와 Input/TextField식 아톰-몰리큘 관계
metadata:
  type: reference
---

Figma "❖ Textarea" 페이지(canvas id 51405:135245) — 이 canvas 자체를 `get_design_context`로
조회하면 "nothing selected" 에러가 난다(canvas 타입 루트는 지원 안 됨, `get_metadata`로만
구조 확인 가능). 이 페이지의 Guide 프레임 안에 두 형제 컴포넌트가 나란히 문서화되어 있다:

- **Textarea**(node 51405:135814) — 아톰. state(enable/focus/disabled) × hasValue(2) =
  6 variant. 테두리·배경 크롬 전혀 없는 순수 여러 줄 입력(placeholder/value 텍스트 색만
  분기). enable과 focus는 이 아톰 자체에서 시각적으로 완전히 동일(Figma 실측 — 클래스
  동일). `scrollable` prop은 Figma에서 우측에 별도 2px pill 모양 `Scroll` 데코 바를
  그리는 토글인데, [[figma-scroll-component]](Scroll 컴포넌트 자체 코멘트: "Text Area 등의
  스크롤 존재 여부를 위해 제작 — OS 기본 스크롤 사용, 트랙/썸 색만 토큰으로 오버라이드")를
  따라 별도 데코 요소 대신 `<textarea>` 자체 네이티브 스크롤에 Scroll과 동일한
  scrollbar-color/::-webkit-scrollbar* 토큰을 인라인 복제해 적용(Scroll의 해당 클래스는
  모듈 private 상수라 export 안 됨).
- **LineTextarea**(node 51405:135837) — 몰리큘. state 5종(enable/hover/focus/danger/
  disabled) × hasValue × isLabel/isHelper/isInputCount/isOption 토글. 실제로 Figma 코드
  안에서 `<Textarea state=... hasValue=... />`를 그대로 인스턴스로 사용하며 그 아래
  `PartsInputLine`(밑줄, Input의 line variant와 동일한 애니메이션 밑줄 패턴) + Label +
  HelperLabel + CountLabel(글자수 "1/500자")을 얹는다. [[figma-input-component]]의
  Input→TextField 리팩토링과 정확히 같은 아톰↔몰리큘 구조.

사용자가 "135245=참고/원형, 135814=구현 대상"으로 요청했을 때, 실제로는 135245가 특정
원형 컴포넌트가 아니라 135814+135837을 함께 문서화한 페이지였다 — 요청 문구의 "참고용
원형 컴포넌트"를 페이지 전체로 오인하지 말고 반드시 `get_metadata`로 실제 자식 구조를
먼저 확인할 것. 이번 작업은 135814(Textarea)만 구현하고 LineTextarea는 범위 밖으로 남김
(추후 필요시 Input→TextField 선례처럼 이 Textarea를 조합해서 만들 것).

Figma 프레임 320×110px는 문서 미리보기 크기일 뿐 — 실제 구현은 `w-full` + 네이티브
`rows`(기본 4, 사이즈 토큰에 110px 정확 대응값 없음)로 유연하게 처리.

figma-code-connect.json에 Input/TextField 항목이 아직 없다는 것도 확인됨(과거 세션
누락으로 추정, 이번 작업 범위 아니라 손대지 않음).

구현 완료(2026-09-17): `src/components/ui/Textarea/` 4파일 세트, typecheck/build/vitest(13
tests)/eslint 전부 통과.
