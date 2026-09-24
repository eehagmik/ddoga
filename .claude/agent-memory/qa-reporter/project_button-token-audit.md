---
name: button-token-audit
description: Button 계열 3종(Button/ButtonWithLabel/ButtonWithIcon) 디자인 토큰 바인딩 감사 결과와 "버그 아님"으로 승인된 의도적 Figma 이탈 6건
metadata:
  type: project
---

2026-09-10 `Button` / `ButtonWithLabel` / `ButtonWithIcon` 토큰 바인딩 전수 감사 → **clean pass** (High/Medium 0, Low 2 = 시각 영향 없음). 보고서: `docs/qa-button-token-audit.md`.

**Why:** 이 3종은 Figma 스펙과 의도적으로 다른 부분이 있어서, 감사할 때마다 같은 항목이 "버그"로 재적발되는 걸 막아야 함.

**How to apply:** Button 계열을 다시 QA할 때 아래 6건은 불일치로 보고하지 말 것 (보고서엔 "승인됨" 섹션으로만 명시):

1. `ButtonWithLabel` outline+brand hover/focus 배경 = `bg-bg-brand-bright` (Figma는 `background/brandGrayish/normal` `#f5f8f7`). 형제 통일 목적. `Button.tsx` `VARIANT_COLOR.outline.brand` 에서 상속.
2. pressed(`:active`) 상태 자체가 Figma에 없음. 배경=hover 동일 + 루트 `--alpha-80` (`BUTTON_BASE`).
3. focus opacity 전 variant `--alpha-80` 통일 (Figma 원본은 inner fill 0.8 / bright·outline 0.6). inner `group-*:opacity` 트릭 제거됨. 2026-09-10 사용자 결정.
4. `brand·bright·disabled` Figma 저작 quirk(배경 없이 border만) 무시 → enable 디자인 + `--alpha-40`.
5. `BlankIcon` `fill="currentColor"`, `Button` 자체는 텍스트/아이콘 색 미지정(슬롯의 몫).
6. `Button` 은 좌우 padding·gap 0, `ButtonWithLabel` 이 `SIZE_PADDING` 을 얹음.

기타 정상 quirk: `warning` 아이콘색은 전 variant `text-icon-warning-deep`(`icon/warning/deep` `#db9024`) — Figma 검증 완료.

Low 2건(조치 불필요): (a) `fill/neutral/hover` 에 Figma `background/overlay/blackNormal` 오버레이 레이어 미재현 — 베이스가 순수 흑색이라 무효과. (b) `ButtonWithIcon` size별 장식 좌우 padding 미재현(`xl`=15px·`sm`=9px 는 토큰 없음) — 정사각+중앙정렬로 대체.

관련: [[figma-button-archetype]], [[figma-buttonwithicon-component]]
