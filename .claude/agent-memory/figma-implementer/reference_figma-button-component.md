---
name: figma-figma-button-component
description: Figma 위치와 구조 - 꼬가3.0 디자인시스템의 ButtonWithLabel 컴포넌트 세트 (variant 축, alpha 토큰 규칙)
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (-꼬가3.0- Design System).

- **ButtonWithLabel** 컴포넌트 세트: node-id `51405:18495`. 480개 variant = color(5) × variant(4) × size(6) × state(4).
  - color: brand / neutral / danger / warning / info
  - variant(Style): fill / bright / outline / text
  - size: 2xl / xl / lg / md / sm / xs
  - state: enable / hover / focus / disabled (Figma에는 pressed/active 없음. loading은 fill에만 있으나 이 세트엔 미포함)
  - 추가 인스턴스 props: `startIcon`/`endIcon` (boolean), `label` (text)
- 아이콘 슬롯은 "BlankIcon" 플레이스홀더 (내부 `_blank용 아이콘`, node `2547:236`). 실제 아이콘은 프로젝트 `src/components/ui/BlankIcon` 사용.
- 참고(Button 문서) 페이지: node-id `51405:17039`.

**디자이너 규칙 (컴포넌트 설명):**

1. Type=Icon variant는 1:1 비율 유지 (별도 컴포넌트 영역).
2. **State=focus** = inner 레이어에 alpha 토큰만 적용 (포커스 링/그림자 없음). fill focus는 inner opacity 0.8, bright/outline focus는 inner opacity 0.6.
3. **모든 disabled** = enable 디자인 + 컴포넌트 전체 opacity alpha 토큰. fill/outline/text disabled = 0.6, bright disabled = 0.4.
4. **variant=text**일 때만 좌우 padding 0, 가로 Hug.
5. hover = 배경을 한 단계 진한 토큰으로 교체 (fill→deep, bright→light, outline→brandGrayish/normal 또는 해당 색 bright).

**구현 시 확인된 토큰 quirk (ButtonWithLabel, md 노드 전수 검증):**

- `warning` color 의 아이콘은 모든 variant 에서 `icon/warning/deep` 사용 (다른 색은 `icon/*/normal`). 라벨은 `typo/warning/deep`.
- `outline` + `warning` 의 border 는 `border/warning/normal` (다른 색 outline 은 `border/*/subtle`).
- `outline` + `neutral` 의 hover/focus 배경은 `background/neutral/deep` (brand 만 `brandGrayish/normal`).
- `bright` + `neutral` hover 배경은 `background/neutral/deepDark`.
- `text` variant: 라벨색은 color 무관하게 항상 `typo/neutral/normal`, 아이콘만 color 별. hover=루트 opacity 0.8, focus=inner opacity 0.6.
- fill 은 5색 모두 라벨 `typo/inverse/normal` · 아이콘 `icon/inverse/normal`, bg 만 `*/normal`→hover `*/deep`.

ButtonWithLabel 코드: `src/components/ui/ButtonWithLabel/` (4파일, 2026-09-09 구현 완료).

관련: [[design-token-architecture]]
