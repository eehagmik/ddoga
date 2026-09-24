---
name: figma-button-archetype
description: Figma "Button" 원형 컴포넌트 세트(51405:17049) - 자유 children 슬롯 버튼 셸, ButtonWithLabel/ButtonWithIcon과 관계
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (-꼬가3.0- Design System).

**Button** 컴포넌트 세트: node-id `51405:17049`. 이름은 정확히 "Button". 360 variant = color(5: brand/neutral/danger/warning/info) × variant(3: fill/bright/outline — **text 없음**) × size(6: 2xl/xl/lg/md/sm/xs) × state(4: enable/hover/focus/disabled). 컴포넌트 설명: "🎨 🧑‍💻 좌우 패딩값은 디자인에 사용할 때마다 적용".

- **구조**: 루트 div(auto-layout row, items-center justify-center, gap `scale/0`=0, padding `scale/0`=0, `overflow-clip`) → 자식 1개 `🟥 ContentsSlot`(w 70 고정 placeholder, 점선 red/500 테두리, size별 h). **자유 children 슬롯** — 라벨/아이콘 고정 아님. inner 래퍼 레이어 없음.
- ButtonWithLabel(`51405:18495`)이나 ButtonWithIcon(`51405:17772`)은 이 Button을 **nested instance로 감싸지 않음**. 3개 다 독립 저작된 형제 컴포넌트(같은 토큰 언어 공유). get_design_context로 ButtonWithLabel md 확인 시 루트가 자체 div이고 Button 인스턴스(`I51405:...;51405:17xxx`) 없음. 즉 Figma상 진짜 부모-자식 아님, 개념상 "원형"일 뿐.

**size별 (container h / radius / ContentsSlot h) — 컨테이너·radius는 ButtonWithLabel/Icon과 동일값:**

| size | h | radius | slot h |
| 2xl | `scale/54` 54 | `radius/xl` 12 → rounded-xl | 34 |
| xl | `scale/50` 50 | `radius/lg` 10 → rounded-lg | 30 |
| lg | `scale/46` 46 | `radius/md` 8 → rounded-md | (미확인, ~28) |
| md | `scale/40` 40 | `radius/md` 8 → rounded-md | 24 |
| sm | `scale/32` 32 | `radius/sm` 6 → rounded-sm | 20 |
| xs | `scale/26` 26 | `radius/sm` 6 → rounded-sm | 20 |

- 높이 토큰이 `scale/*` (ButtonWithLabel 메모엔 `sz/*`로 기록됨 — 값 동일, 이름만 다름). border width는 `borderwidth/xs`=1px.
- **좌우 padding·gap 없음** (둘 다 `scale/0`). ButtonWithLabel은 md fill에서 `px scale/10` + inner `gap scale/4`. 즉 padding/gap은 소비자 몫.

**state 규칙 (container 레벨 색은 ButtonWithLabel/Icon과 동일, 단 focus 처리 다름):**

- fill: bg `background/<c>/normal` → hover `background/<c>/deep`. **focus = hover와 동일** (bg deep). disabled = enable bg + 루트 `opacity 60%`.
- bright: bg `background/<c>/bright` → hover `background/<c>/light`. **focus = hover와 동일** (bg light). disabled = enable bg + 루트 `opacity 40%`.
  - 예외: **brand·bright·disabled**(`51405:17468`)만 비일관 — bg 채움 없이 `border/brand/light` 1px + opacity 40%. danger·bright·disabled(17474)는 정상(bg bright 유지). ButtonWithIcon과 똑같은 저작 quirk.
- outline: bg `background/neutral/normal`(white) + border `border/<c>/subtle`(neutral은 `border/neutral/bright`, warning은 `border/warning/normal`). hover: bg `background/<c>/bright` 로 채움(brand hover/focus bg = `background/brand/bright` — **ButtonWithIcon과 동일, ButtonWithLabel의 brandGrayish/normal과 다름**). **focus = hover 동일**. disabled = bg white + border 유지 + 루트 opacity 60%.
- neutral·bright·enable bg = `background/neutral/dark`(#f3f3f3). (ButtonWithLabel 값과 대조 필요 — 미검증)

**핵심 차이 (ButtonWithLabel 대비):** ① text/아이콘 콘텐츠 없음, 자유 슬롯. ② inner 레이어 없음 → **모든 variant에서 state=focus가 state=hover와 시각적으로 동일** (inner opacity 트릭 불가). ③ 좌우 padding·gap 0. ④ variant 3종(text 제외). ⑤ 높이 토큰 `scale/*`.

get_variable_defs (brand·fill·md·enable): `{scale/24:24, red/500:#F84B55, scale/0:0, scale/40:40, radius/md:8, background/brand/normal:#00af78}`. disabled 노드엔 `60%`:0.6 / `40%`:0.4 alpha 토큰.

Code Connect: `figma-code-connect.json` mappings `{}` — 매핑 없음.

**코드 구현 (2026-09-09):** `src/components/ui/Button/` 로 구현됨. `BUTTON_BASE` named export(자식이 `text` 브랜치에서 재사용). `ButtonWithLabel`(fill/bright/outline) · `ButtonWithIcon` 은 이제 `Button` 을 합성 — Button 이 컨테이너 bg/border/hover/focus/disabled-opacity/min-h/radius emit, 자식은 padding/타이포/라벨·아이콘 색/inner 레이어만. `ButtonWithLabel` 의 `text` variant 만 자체 렌더. outline+brand hover 는 Button 값 `bg-bg-brand-bright` 로 통일(ButtonWithLabel 의 옛 `bg-bg-brandGrayish-normal` 제거).

관련: [[figma-figma-button-component]], [[figma-buttonwithicon-component]], [[design-token-architecture]]
