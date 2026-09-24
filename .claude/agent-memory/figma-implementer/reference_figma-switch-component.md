---
name: figma-switch-component
description: Switch 온오프 토글 컴포넌트 — 노드, 축, off=outline 이유, 색상표, Toggle 과의 차이
metadata:
  type: reference
---

또가3.0 Design System / Switch — 문서 노드 51405:133456, 메인 컴포넌트 51405:133464.
구현 완료(2026-09-11): `src/components/ui/Switch/` 4파일 + `figma-code-connect.json` 매핑 `51405:133464`.

- 진짜 on/off 스위치. [[figma-toggle-component]](Toggle)는 이름만 비슷한 선택형 버튼이라 별개.
- 단일 인터랙티브 컴포넌트만. `SwitchWithLabel` 없음(호출부에서 `<label>` 로 감쌈).
- 축: `size` sm/md(기본 md) × `checked` × `state`(enable/hover→group-hover:/disabled→prop). focus·pressed 심볼 Figma 에 없음.
- 렌더트리: `<label class="group"> > input[type=checkbox][role=switch].peer.sr-only + span(TRACK) > span(THUMB)`.
  controlled(checked)+uncontrolled(defaultChecked)+네이티브 onChange, `...rest` 는 input 에 spread. [[figma-checkbox-component]] CheckboxWithLabel 패턴과 동일.
- 치수(Figma 실측): track sm 46×26 / md 56×34, thumb sm 20 / md 28, padding `p-[var(--sz-3)]` 공통, 썸 이동 sm `translate-x-[var(--sz-20)]` / md `translate-x-[var(--sz-22)]`, off `translate-x-0`. radius `rounded-circle`.
- **off 테두리는 border 가 아니라 `outline outline-1 [outline-offset:-1px]`**. 이유: Figma 는 stroke 를 레이아웃에서 제외 → border 로 그리면 box geometry 가 줄어 썸 이동 거리가 어긋나고 on↔off 레이아웃 시프트로 트랜지션 떨림. on 은 `outline-transparent` 로 두께만 유지.
- 색상: track/thumb 는 semantic `bg-bg-*` 유틸. outline 색만 arbitrary `outline-[var(--color-border-neutral-light|subtle)]` — Tailwind v4 가 `var(--color-*)` 를 outline-color 로 정확히 추론함(빌드 CSS 확인). `switchColors(checked,disabled)` 헬퍼가 `{track,outline,thumb}` 반환, hover 유틸은 !disabled 일 때만 포함([[figma-checkbox-component]] boxColors 선례).
  - OFF enable: track `bg-bg-neutral-deepDark` / outline `border/neutral/light` (+group-hover `border/neutral/subtle`) / thumb `bg-bg-neutral-normal`
  - OFF disable: track `bg-bg-neutral-dark` / outline `border/neutral/light` / thumb `bg-bg-disabled-normal`
  - ON enable: track `bg-bg-brand-normal` (+group-hover `bg-bg-brand-deep`) / thumb `bg-bg-neutral-deep`
  - ON disable: track `bg-bg-disabled-deep` / thumb `bg-bg-disabled-subtle`
  - disabled 는 전체 opacity dip 안 함(Figma 명시색 제공).
- 썸 이동은 `transition-transform` (150ms, motion-reduce:transition-none). 트랙은 `transition-[background-color,outline-color]`. focus 는 링 대신 `peer-focus-visible:opacity-[var(--alpha-80)]`.
- 썸 그림자 `shadow-black-sm` (Figma shadow/black/sm 와 1:1).
- data-* 훅: `data-size` / `data-checked` / `data-state`(disabled?"disabled":"enable").
