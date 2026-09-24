---
name: text-node-stroke-missing-from-codegen
description: get_design_context 의 Tailwind 코드 생성 결과가 텍스트 노드의 stroke(획) 속성을 누락할 수 있음 — 발견 시 get_variable_defs 로 직접 대조
metadata:
  type: feedback
---

`get_design_context`가 반환하는 React+Tailwind 코드는 텍스트 노드에 적용된 `stroke`(strokeWeight + strokes 배열, 즉 텍스트 아웃라인/획)를 Tailwind 클래스로 변환하지 못하는 경우가 있다([[reference_figma-mappin-component]]에서 실제로 발견 — 라벨 텍스트에 흰색 2px 아웃라인이 있었는데 코드 생성 결과에는 전혀 나타나지 않았고, 사용자가 스크린샷으로 지적한 뒤에야 알게 됨).

**Why**: `get_design_context`는 시각 속성을 Tailwind 유틸리티로 매핑하는 코드 생성 단계를 거치는데, 텍스트 stroke 같은 상대적으로 드문 속성은 이 매핑 규칙에서 빠져 있는 것으로 보인다. 반면 같은 노드에 `get_variable_defs`를 호출하면 그 노드(및 자식)에 바인딩된 Figma 변수 목록을 raw 하게 돌려주므로, `get_design_context`가 놓친 속성도 거기엔 남아 있을 수 있다.

**How to apply**: 텍스트가 포함된 컴포넌트를 구현할 때(특히 지도 라벨, 오버레이 텍스트처럼 가독성 보정 효과가 있을 법한 경우) 스크린샷과 코드 생성 결과를 대조해서 시각적으로 안 맞는 부분이 있으면, 해당 텍스트 노드의 node id로 `get_variable_defs`를 별도 호출해 바인딩된 변수(특히 `borderWidth/*`, `border/*` 같은 stroke 계열 이름)가 있는지 확인한다. 이미 같은 컴포넌트의 다른 그래픽 요소(예: 아이콘/도형)에 쓰인 토큰과 겹치면 텍스트에도 같은 스타일(보통 stroke)이 적용됐을 가능성이 높다는 신호다. 코드 구현 시 `-webkit-text-stroke`는 글자 획을 안쪽으로 깎아먹는 크로스브라우저 렌더링 이슈가 있어, 8방향 `text-shadow`(오프셋 + 색상 모두 토큰 `var(--*)` 참조)로 쌓는 방식이 더 안전하다.
