---
name: group-hover-self-styles
description: molecule 루트 <label class="group"> 자기 자신의 hover 스타일은 group-hover: 가 아니라 hover: 로 걸어야 한다
metadata:
  type: feedback
---

`<label class="group">` 를 루트로 쓰는 몰리큘(CheckboxCard 등)에서 **루트 요소 자신**의 hover 스타일(카드 배경·외곽선 등)은 `hover:` 로 건다. `group-hover:` 는 안 된다.

**Why:** Tailwind `group-hover:` 는 `:is(:where(.group):hover *)` 로 컴파일된다 — 끝의 ` *` 때문에 `.group` 의 **자손**에만 적용되고 `.group` 요소 자신은 제외된다. CheckboxCard 초기 구현에서 `cardSurface()` 가 카드 배경을 `group-hover:bg-*` 로 걸어 hover 가 전혀 동작 안 했고, 사용자가 "hover 배경색이 잘못됐다"고 리포트 → 2026-09-10 `hover:` 로 수정.

**How to apply:** `.group` 루트 컴포넌트 만들 때 — 자손(내부 아이콘·아톰)의 hover 전이는 `group-hover:`, 루트 자신의 표면 전이는 `hover:`. 둘을 섞어 쓰는 게 정상이다. disabled 분기에는 hover 클래스를 아예 넣지 않는다. 관련: [[figma-checkboxcard-component]]
