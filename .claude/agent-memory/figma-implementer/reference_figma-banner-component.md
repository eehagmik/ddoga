---
name: figma-banner-component
description: Figma Banner 컴포넌트(51405:7725) — 참고 노드 51405:7223은 별도 컴포넌트가 아니라 같은 페이지(canvas) 자체, get_design_context 호출 불가 패턴
metadata:
  type: project
---

Figma Banner 컴포넌트 구현(2026-09-20). 문서 캔버스 51405:7223("❖ Banner")과 실제
메인 컴포넌트 프레임 51405:7725는 부모/자식이나 유사 패턴이 아니라 **동일 컴포넌트의
문서 페이지 vs 메인 컴포넌트 프레임** 관계 — [[figma-textarea-component]]의
"51405:135245는 페이지 canvas 자체" 패턴과 동일하게, canvas id로 `get_design_context`를
호출하면 항상 "nothing selected" 에러가 난다(Figma desktop 앱이 canvas 자체는 선택
불가). 이런 에러가 나면 `get_metadata`로 먼저 구조를 확인해 canvas인지 판별할 것 —
재시도해도 해결 안 됨, 대신 canvas 안의 실제 프레임 id를 찾아야 함.

Banner 자체: variant(round/sharp) × ratio(16:9/4:1) 4심볼, state 없음(정적 컨테이너).
ratio 값 문자열이 그대로 CSS aspect-ratio로 대응(320:180=16/9, 320:80=4/1) — 폭
고정 없이 w-full + aspect-[16/9]/aspect-[4/1]로 구현(HorizontalMenuButton/GalleryCard
의 "캔버스 고정폭은 문서화 아티팩트" 선례 재확인). Figma의 prop169Blank/prop41Blank
(ratio별 슬롯 두 개, 상호배타)는 children 하나로 통합. 두 슬롯 모두 기본값이
Figma "BlankGraphic" 인스턴스라서 — ImageCard/GalleryCard의 "슬롯 완전히 비어있음"과
달리 이번엔 children 생략 시 기존 BlankGraphic 컴포넌트를 그대로 기본 콘텐츠로 렌더.
구현 완료: src/components/ui/Banner/.
