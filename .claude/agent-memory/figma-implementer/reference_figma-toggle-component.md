---
name: figma-toggle-component
description: Figma "Toggle" 컴포넌트 세트(51405:152870) - 토글 선택 버튼(스위치 아님), variant square/round/text × type multi/single(디자인동일) × size xs/sm/md/lg × checked, outline은 inset shadow
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System).

**Toggle** 컴포넌트 세트: 문서 페이지 `51405:152861`, 메인/세트 `51405:152870`. ATOMS 아님/토글버튼. **on/off 스위치가 아니라 라벨을 담는 "선택형 토글 버튼"** (세그먼트 선택 UI). Chip과 형태·구현 패턴이 매우 유사하나 checked 상태 중심.

120 심볼 = `variant`(3: square/round/text) × `type`(2: multiSelect/singleSelect) × `size`(4: xs/sm/md/lg) × (state/checked 5조합: enable-false, hover-false, enable-true, disabled-false, disabled-true). **hover는 checked=false 에만 존재**. focus·pressed·indeterminate 없음.

Figma 설명(중요):

1. outline은 border가 아닌 **inset shadow** 로 구현(트랜지션 자연스럽게).
2. 버튼 사이즈는 ❖Button 과 동일.
3. `variant=text` 일 때만 좌우 padding 0, 가로 Hug.
4. `type`(multi/single)은 개발자에게 선택 동작 전달용 축 — **디자인은 완전 동일**(singleSelect 심볼이 multiSelect와 바이트 단위로 동일함 확인).

**축 → props 제안**: `variant?: 'square'|'round'|'text'`(기본 square), `type?: 'multi'|'single'`(기본 multi, 시각영향 0 — ARIA용: single→radio, multi→aria-pressed 검토), `size?: 'xs'|'sm'|'md'|'lg'`(기본 md), `checked?: boolean`, `disabled?: boolean`, `label`/`children`. hover→CSS :hover. 슬롯/아이콘 없음, 라벨 텍스트 1개뿐.

**사이즈별 스펙**:
| size | 타이포(companion) | 라벨 line-height | square px/py | round px/py | text px/py | 트랙높이(계산) |
| xs | body/5 (`text-body-5`/`-bold`) font 14 | 1.46 | 8/3 | 8/3 | 0/3 | ~26 |
| sm | body/5 14 | 1.46 | 10/6 | 10/6 | 0/6 | ~32 |
| md | body/4 (`text-body-4`) 16 | 1.47 | 10/8 | 12/8 | 0/8 | ~40 |
| lg | body/3 (`text-body-3`) 18 | 1.47 | 10/10 (p 전체) | 12/10 | 0/10 | ~46 |
scale/N px = `--sz-N`. round는 square 대비 md·lg 에서만 좌우 +2px. radius: square/text=`radius/md`(8), round=`radius/circle`(9999). square/round: `min-width: 42px`(`--sz-42`), overflow clip, 라벨 `flex:1 0 0` + text-center. text: 가로 hug(min-w 없음, whitespace-nowrap, shrink-0). gap 0.
checked=true 는 bold companion(letter-spacing -1→-1.5 자동) — `text-body-N-bold` 유틸로 해결.

**상태별 시각 스펙 (square/round — 배경+inset shadow 아웃라인 있음)**:
| checked | state | 배경 | inset shadow(아웃라인) | 텍스트색 | weight |
| false | enable | `bg-neutral-normal`(#fff) | 1px `border-neutral-light` = `shadow-borderNeutral-xs` | `typo-neutral-normal`(#272727) | Medium |
| false | hover | `bg-brand-bright`(#e4fbf3) | 1px `border-brand-normal`(#00af78) = `shadow-borderBrand-xs` | `typo-neutral-normal` | Medium |
| false | disabled | `bg-neutral-normal`(#fff) | 1px `border-neutral-light` = `shadow-borderNeutral-xs` | `typo-disabled-normal`(#969696) | Medium |
| true | enable | `bg-brand-bright`(#e4fbf3) | 2px `border-brand-normal` = `shadow-borderBrand-sm` | `typo-brand-dark`(#007a54) | Bold |
| true | hover | **심볼 없음** — 확장 결정 필요 | | | |
| true | disabled | `bg-disabled-subtle`(#eee) | 2px `border-neutral-light`(#c5c5c5) = `shadow-borderNeutral-sm` | `typo-disabled-normal` | Bold |

**variant text (배경·아웃라인 없음, 텍스트만)**:
| checked | state | 텍스트색 | weight |
| false | enable | `typo-neutral-normal` | Medium |
| false | hover | `typo-brand-dark`(#007a54) | Medium (bold 아님) |
| false | disabled | `typo-disabled-normal` | Medium |
| true | enable | `typo-brand-dark` | Bold |
| true | disabled | `typo-disabled-normal` | Bold |
(text checked=true·disabled 심볼에 `border-0 border-[border/brand|disabled...]` 잔재 클래스 있으나 width 0 → 무의미.)

**Figma 변수 → 코드 토큰**:
background/neutral/normal→`--color-bg-neutral-normal`; background/brand/bright→`--color-bg-brand-bright`; background/disabled/subtle→`--color-bg-disabled-subtle`; border/neutral/light→`--color-border-neutral-light`; border/brand/normal→`--color-border-brand-normal`; typo/neutral/normal→`--color-typo-neutral-normal`; typo/brand/dark→`--color-typo-brand-dark`; typo/disabled/normal→`--color-typo-disabled-normal`; shadow/borderNeutral/xs·sm & shadow/borderBrand/xs·sm→`--shadow-borderNeutral-{xs,sm}`/`--shadow-borderBrand-{xs,sm}` (Tailwind `shadow-borderNeutral-xs` 등 존재 확인); radius/md→`rounded-md`, radius/circle→`--radius-circle`; font/size/xs·sm·md→ body/5·4·3 → `text-body-5`/`text-body-4`/`text-body-3` (+`-bold`); scale/*→`--sz-*`.

**재사용 검토**: 기존 `Toggle` 없음, Code Connect 매핑 없음 → 신규. `Button` 원형 셸은 축·상태로직 상이 → 합성 부적합(size 스케일·transition·data-* 패턴만 참고). `Chip`(pill+라벨+state→CSS+토큰유틸)이 구조 레퍼런스로 가장 근접하나 직접 재사용 아님. `CheckSelectRadio`/`CheckboxWithLabel`은 형태 달라 불가.

**코드 구현 완료 (2026-09-11):** `src/components/ui/Toggle/` 4파일. 인터랙티브 `<button type="button">`, controlled(`pressed`)+uncontrolled(`defaultPressed`)+`onPressedChange(next)`. props: `variant`(square/round/text) `type`('multi'|'single') `size`(xs/sm/md/lg) `pressed`/`defaultPressed`/`onPressedChange` `disabled` + button HTML 속성 spread(`type` 은 Omit). ARIA: multi→`aria-pressed`, single→`role=radio`+`aria-checked`. checked+hover 는 checked enable 유지. focus-visible/active = 루트 `opacity var(--alpha-80)`(Button 선례, 링 없음). 아웃라인 = `shadow-border*` 유틸. `data-variant/type/size/pressed/disabled`. Code Connect `51405:152870` 매핑 추가. typecheck·test(14) 통과. `text` variant padding `px-[var(--sz-0)]`.

**구현 시 결정된 사항**: (1) `type='multi'|'single'` 로 확정, ARIA 분기 (2) checked hover 별도 스타일 없음 (3) `children` 사용 (4) focus-visible/active opacity dip 추가(포커스 링은 시스템 관례상 없음) (5) 인터랙티브 `<button>`.

관련: [[reference_figma-clearbutton-component]], [[reference_figma-checkbox-component]]
