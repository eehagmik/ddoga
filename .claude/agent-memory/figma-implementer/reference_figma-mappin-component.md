---
name: figma-mappin-component
description: Figma MapPin(지도 핀) 컴포넌트 — 문서 캔버스 51405:115932/메인 프레임 51405:115940, variant/color 2x2, marker SVG 인라인 재구성, maxWidth 확장 prop
metadata:
  type: reference
---

Figma "또가3.0 Design System / MapPin" — 문서 캔버스 `51405:115932`("❖ MapPin")는 별도 컴포넌트가 아니라 이 컴포넌트의 Figma 페이지 자체([[figma-node-canvas-vs-frame]] 패턴 재확인)이고, 실제 메인 컴포넌트 프레임은 `51405:115940`이다. 사용자가 "참고 노드"/"구현 대상 노드"로 준 두 node-id가 사실상 같은 컴포넌트를 가리켰다.

**variant 구조**: `variant`(circle/marker) × `color`(Figma prop명 `type`: normal/brand) = 4 심볼. hover/focus/disabled 축 없음(정적 컴포넌트). `label`(boolean)+`labelValue`(text) → presence 기반 단일 `label?: string` 문자열로 통합(CountLabel `unit` 선례).

**marker SVG**: Figma가 내려주는 marker 심볼 2종(normal/brand) SVG asset을 다운로드해 실측한 결과 path 좌표가 완전히 동일하고 fill 색(#F84B55 / #00AF78)만 다름 → 별도 이미지 2장 대신 공용 path를 인라인 SVG로 재구성해 `fill="currentColor"` + `text-icon-danger-normal`/`text-icon-brand-normal` 래퍼로 색 전환(Checkbox `CheckMark` 선례). 흰색 테두리/중앙 원은 색상 축과 무관하게 항상 `border/inverse/dark` 고정이라 SVG `stroke`/`fill` 속성에 `var(--color-border-inverse-dark)`를 직접 문자열로 지정(SVG presentation attribute가 CSS var()를 지원하는 것을 활용, 하드코딩 회피).

**그림자**: Figma가 그래픽+라벨을 감싼 루트 전체에 단일 `filter: drop-shadow(...)`(`shadow/black/xs`와 동일 레시피)를 적용하고 있어서, circle(불투명)도 box-shadow 유틸 대신 marker와 동일하게 filter로 루트에 통일 적용했다(Tooltip/GalleryCard의 "투명 배경엔 filter" 선례를 정적 컴포넌트에도 그대로 확장 적용한 케이스).

**Figma 컴포넌트 설명(중요, 범위 판단 근거)**: "개발 시 네이버 지도 기본 제공 pin을 사용해 유사하게 제작했으며 개발 여건이 바뀌지 않는 한 커스텀하지 않는다" — 즉 marker 그래픽은 네이버 지도 기본 마커를 흉내낸 정적 벡터일 뿐, 실제 지도 SDK 마커 통합은 범위 밖. 코드베이스에 naver/kakao 지도 SDK 연동 자체가 없음을 확인(grep 결과 전부 `.map()` 오탐).

**확장 prop(Figma 밖, 사용자 확정 2026-09-20)**: 라벨 텍스트 노드에 `w-[110px]` + `word-break: break-word`가 바인딩돼 있으나 대응 `sz` 토큰 없음 → 하드코딩 대신 `maxWidth?: string | number` prop 노출(기본값 없음, 숫자는 px 해석). `break-words` 클래스는 maxWidth 유무와 무관하게 항상 적용.

**재사용 검토 후 기각**: `Dot`(알림점)을 circle variant 재사용 후보로 검토했으나 크기(6/8/10px) 및 테두리 두께(1px)가 MapPin circle(26px, 2px 테두리)과 실측 불일치 → 독자 구현.

구현 완료(2026-09-20). 4파일(MapPin.tsx/stories/test/index.ts) 생성, typecheck/lint/vitest(11개)/build 전부 통과.

**추가 수정(2026-09-20, 사용자 스크린샷 피드백)**: 초기 구현에서 라벨 텍스트의 흰색 아웃라인(스트로크)을 놓쳤다. `get_design_context`의 코드 생성 결과(Tailwind 변환)에는 텍스트 stroke가 전혀 반영되지 않았지만, 라벨 텍스트 노드(`51405:115943`)를 `get_variable_defs`로 **직접** 재조회하니 `borderWidth/sm`(2)+`border/inverse/dark`(#ffffff)가 바인딩돼 있음을 확인 — Circle 그래픽 테두리(`51405:115942`)와 완전히 동일한 토큰. **교훈: Figma 텍스트 노드의 stroke 속성은 `get_design_context`가 Tailwind 코드로 변환하지 못하는 경우가 있다 — 텍스트에 시각적으로 이상한 게 있으면(아웃라인, 특수 효과 등) 해당 텍스트 노드 id로 `get_variable_defs`를 별도 호출해 바인딩된 변수를 직접 대조해야 한다.** 구현은 `-webkit-text-stroke`(획이 안쪽으로 깎이는 렌더링 이슈) 대신 8방향 `text-shadow`(오프셋 `var(--border-width-xs)`=1px = borderWidth/sm의 절반, 색 `var(--color-border-inverse-dark)`)를 인라인 style로 조립하는 방식 채택 — Tailwind 화살괄호 표기 대신 인라인 style을 쓴 이유는 콤마 8개가 들어간 복잡한 값이 Tailwind arbitrary property 파서에서 깨질 위험을 피하기 위함(maxWidth와 동일 이유).
