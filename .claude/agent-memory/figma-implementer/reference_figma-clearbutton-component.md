---
name: figma-clearbutton-component
description: Figma ClearButton 컴포넌트(51405:67447) 축·치수·토큰·아이콘, Chip 삭제 버튼과의 차이
metadata:
  type: reference
---

Figma "또가3.0 Design System / ClearButton" — 문서 프레임 node `51405:67427`, 컴포넌트 세트 node `51405:67447`.
입력 필드/이미지 업로드 아이템 우측에 고정되는 "내용 지우기" 버튼.

- 축: `size` 단일 (xs / sm / md). variant·color·state 축 없음. Figma 에 hover/focus/pressed/disabled 정의 없음(TopButton·Chip 비삭제 조합과 동일 패턴).
- 치수: xs=14×14 `--sz-14`, sm=16×16 `--sz-16`, md=18×18 `--sz-18`. wrapper 에 padding·border·radius·배경 없음 — 바운딩 박스 == 아이콘 크기. Figma 기본 variant = xs.
- 콘텐츠: 아이콘 `x_circle_solid` 하나(채운 원 + x 뚫림, ref node 51405:5556). Chip 삭제버튼의 `x_close_solid`(맨 x)와 **다름**.
- 색: 아이콘 = `icon/neutral/bright` = gray.300 = #ababab → `text-icon-neutral-bright`. 항상 이 단색 고정(Chip 삭제버튼은 chip color/variant 따라 가변). 내부 x 흰색은 글리프 knockout 이라 적용할 스타일 아님.
- 원칙(가이드): "IconButton 의 X버튼과 따로 구분". Placement: clearable UI 우측 영역 고정(우상단 또는 우중앙), 좌측/하단 배치 금지 — 호스트 레이아웃 책임.
- Code Connect: `figma-code-connect.json` 에 매핑 없음(Checkbox·CheckboxWithLabel·CheckboxCard·Chip 만 존재).
- 구현 방향(미승인): 독립 `<button type="button">` + `<Icon name="x_circle_solid">`, Chip 삭제버튼의 `SLOT_BASE` 센터링 + `focus-visible:opacity-[var(--alpha-60)] focus-visible:outline-none` 재사용. hover/disabled 스타일은 Figma 근거 없음 → 디자이너 확인 필요.
- 연결 Figma URL: node-id=51405-67447.

관련: [[figma-checkbox-component]], Chip 컴포넌트(51405:52642).
