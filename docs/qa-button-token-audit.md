# QA 리포트 — Button 계열 디자인 토큰 바인딩 감사

- **날짜**: 2026-09-10
- **대상**: `src/components/ui/Button`, `ButtonWithLabel`, `ButtonWithIcon`
- **검증 방식**: 코드 ↔ `docs/design-tokens.md` ↔ `src/tokens/_generated.css` 3중 대조 + Figma MCP `get_variable_defs`
- **Figma 파일**: `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System)
- **조회 노드**: `51405:17049` (Button set), `51405:18495` (ButtonWithLabel set), `51405:17772` (ButtonWithIcon set)
- **범위**: color(5) × variant(3~4) × size(6) × state(enable/hover/focus/pressed/disabled) 전 조합의 배경·테두리·라벨/아이콘 색·크기·radius·opacity 토큰 바인딩
- **주의**: 코드는 수정하지 않음. 검증·비교·리포트 전용.

---

## 1. 요약

| 컴포넌트          | 결과     | High | Medium | Low | 비고                                                                                       |
| ----------------- | -------- | ---- | ------ | --- | ------------------------------------------------------------------------------------------ |
| `Button`          | **PASS** | 0    | 0      | 1   | 컨테이너 bg/border/radius/sz/alpha 토큰 100% 일치                                          |
| `ButtonWithLabel` | **PASS** | 0    | 0      | 0   | 라벨/아이콘 색·타이포·padding·gap 토큰 100% 일치. outline+brand hover는 승인된 의도적 차이 |
| `ButtonWithIcon`  | **PASS** | 0    | 0      | 1   | 아이콘 색·컨테이너·아이콘 크기 토큰 100% 일치                                              |

- **하드코딩 리터럴**: 0건 (hex / rgb / hsl / raw px / Tailwind 기본 팔레트 클래스 / `text-sm` 류 기본 타이포 유틸 모두 미검출)
- **의도적 차이 6건**: 전부 코드에 정확히 반영됨 (§5 참조)
- **차단성 이슈 없음.** 발견된 Low 2건은 모두 "시각적 영향 없음" 구조/문서 불일치.

---

## 2. Button (`51405:17049`)

### 검증한 조합 범위

- color: brand / neutral / danger / warning / info
- variant: fill / bright / outline
- size: 2xl / xl / lg / md / sm / xs
- state: enable / hover / focus(=hover bg) / pressed / disabled
- 컨테이너 배경, outline 테두리 색·굵기, min-height, radius, 상태 opacity

### 배경(bg) 토큰 대조 — 전부 일치

| 조합                                  | 코드 값                            | 해석 (CSS)                    | Figma 변수                           | Figma hex             | 판정                            |
| ------------------------------------- | ---------------------------------- | ----------------------------- | ------------------------------------ | --------------------- | ------------------------------- |
| fill / brand / enable                 | `bg-bg-brand-normal`               | `--color-green-500` `#00af78` | `background/brand/normal`            | `#00af78`             | ✅                              |
| fill / brand / hover·focus·pressed    | `bg-bg-brand-deep`                 | `#029261`                     | `background/brand/deep`              | `#029261`             | ✅                              |
| fill / neutral / enable               | `bg-bg-inverse-normal`             | `--color-gray-950` `#272727`  | `background/inverse/normal`          | `#272727`             | ✅                              |
| fill / neutral / hover                | `bg-bg-inverse-deep`               | `#000000`                     | `background/inverse/deep`            | `#000000`             | ✅ (오버레이 레이어는 §2 Low-1) |
| fill / danger / enable→hover          | `bg-bg-danger-normal` → `-deep`    | `#f84b55` → `#e12a3c`         | `background/danger/normal`→`deep`    | `#f84b55` → `#e12a3c` | ✅                              |
| fill / warning / enable→hover         | `bg-bg-warning-normal` → `-deep`   | `#f4b02a` → `#db9024`         | `background/warning/normal`→`deep`   | `#f4b02a` → `#db9024` | ✅                              |
| fill / info / enable→hover            | `bg-bg-info-normal` → `-deep`      | `#5383ff` → `#3c6cff`         | `background/info/normal`→`deep`      | `#5383ff` → `#3c6cff` | ✅                              |
| bright / brand / enable→hover         | `bg-bg-brand-bright` → `-light`    | `#e4fbf3` → `#b8efde`         | `background/brand/bright`→`light`    | `#e4fbf3` → `#b8efde` | ✅                              |
| bright / neutral / enable→hover       | `bg-bg-neutral-dark` → `-deepDark` | `#f3f3f3` → `#eeeeee`         | `background/neutral/dark`→`deepDark` | `#f3f3f3` → `#eeeeee` | ✅                              |
| bright / danger / enable→hover        | `bg-bg-danger-bright` → `-light`   | `#fff0f0` → `#ffd3d4`         | `background/danger/bright`→`light`   | `#fff0f0` → `#ffd3d4` | ✅                              |
| bright / warning / enable→hover       | `bg-bg-warning-bright` → `-light`  | `#fff9c7` → `#fff28f`         | `background/warning/bright`→`light`  | `#fff9c7` → `#fff28f` | ✅                              |
| bright / info / enable→hover          | `bg-bg-info-bright` → `-light`     | `#f0f4ff` → `#d0ddff`         | `background/info/bright`→`light`     | `#f0f4ff` → `#d0ddff` | ✅                              |
| outline / * / enable                  | `bg-bg-neutral-normal`             | `#ffffff`                     | `background/neutral/normal`          | `#ffffff`             | ✅                              |
| outline / brand / hover·focus·pressed | `bg-bg-brand-bright`               | `#e4fbf3`                     | `background/brand/bright`            | `#e4fbf3`             | ✅ (Button/BWI 스펙 기준)       |
| outline / neutral / hover             | `bg-bg-neutral-deep`               | `#f6f6f6`                     | `background/neutral/deep`            | `#f6f6f6`             | ✅                              |
| outline / danger / hover              | `bg-bg-danger-bright`              | `#fff0f0`                     | `background/danger/bright`           | `#fff0f0`             | ✅                              |
| outline / warning / hover             | `bg-bg-warning-bright`             | `#fff9c7`                     | `background/warning/bright`          | `#fff9c7`             | ✅                              |
| outline / info / hover                | `bg-bg-info-bright`                | `#f0f4ff`                     | `background/info/bright`             | `#f0f4ff`             | ✅                              |

### 테두리(outline) — 색·굵기 일치

| 조합              | 코드                           | CSS 해석                             | Figma 변수                        | 판정 |
| ----------------- | ------------------------------ | ------------------------------------ | --------------------------------- | ---- |
| 굵기 (전 색)      | `border-xs`                    | `--border-width-xs` = `--sz-1` = 1px | `borderWidth/xs` = 1              | ✅   |
| outline / brand   | `border-border-brand-subtle`   | `--color-green-300` `#48cda4`        | `border/brand/subtle` `#48cda4`   | ✅   |
| outline / neutral | `border-border-neutral-bright` | `--color-gray-100` `#d9d9d9`         | `border/neutral/bright` `#d9d9d9` | ✅   |
| outline / danger  | `border-border-danger-subtle`  | `--color-red-300` `#ff8b8b`          | `border/danger/subtle` `#ff8b8b`  | ✅   |
| outline / warning | `border-border-warning-normal` | `--color-yellow-500` `#f4b02a`       | `border/warning/normal` `#f4b02a` | ✅   |
| outline / info    | `border-border-info-subtle`    | `--color-blue-300` `#97b4ff`         | `border/info/subtle` `#97b4ff`    | ✅   |

### size별 — min-height / radius 일치

| size | 코드 min-h     | Figma `scale/*` | 코드 radius  | CSS                            | Figma `radius/*` | 판정 |
| ---- | -------------- | --------------- | ------------ | ------------------------------ | ---------------- | ---- |
| 2xl  | `var(--sz-54)` | 54              | `rounded-xl` | `--radius-xl` = `--sz-12` = 12 | `radius/xl` = 12 | ✅   |
| xl   | `var(--sz-50)` | 50              | `rounded-lg` | `--radius-lg` = 10             | `radius/lg` = 10 | ✅   |
| lg   | `var(--sz-46)` | 46              | `rounded-md` | `--radius-md` = 8              | `radius/md` = 8  | ✅   |
| md   | `var(--sz-40)` | 40              | `rounded-md` | 8                              | `radius/md` = 8  | ✅   |
| sm   | `var(--sz-32)` | 32              | `rounded-sm` | `--radius-sm` = 6              | `radius/sm` = 6  | ✅   |
| xs   | `var(--sz-26)` | 26              | `rounded-sm` | 6                              | `radius/sm` = 6  | ✅   |

### 상태 opacity 토큰

| 상태                    | 코드                                                    | Figma                                         | 판정      |
| ----------------------- | ------------------------------------------------------- | --------------------------------------------- | --------- |
| hover                   | opacity 미적용 (bg만 교체)                              | bg만 교체                                     | ✅        |
| focus                   | `focus-visible:opacity-[var(--alpha-80)]` (BUTTON_BASE) | Button 원형은 opacity 없음 → §5-3 승인된 통일 | ✅ (의도) |
| pressed (`:active`)     | `active:opacity-[var(--alpha-80)]` (BUTTON_BASE)        | Figma에 없음 → §5-2 승인                      | ✅ (의도) |
| disabled / fill·outline | `disabled:opacity-[var(--alpha-60)]` → `0.6`            | `60%` = 0.6                                   | ✅        |
| disabled / bright       | `disabled:opacity-[var(--alpha-40)]` → `0.4`            | `40%` = 0.4                                   | ✅        |

### 발견된 불일치

| #     | 조합                   | 코드 값                                      | Figma 값                                                                                           | 심각도  | 근거 노드                                                                                                                                                                                                   |
| ----- | ---------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Low-1 | fill / neutral / hover | `bg-bg-inverse-deep` (`#000000`) 단일 레이어 | `background/inverse/deep` `#000000` + `background/overlay/blackNormal` `#00000066` 오버레이 레이어 | **Low** | `51405:17049` var defs에 `background/overlay/blackNormal` 존재 (BWI 노드 `51405:18261` 동일 저작). 베이스가 이미 순수 흑색이라 40% 흑색 오버레이의 시각적 효과 없음 → 렌더 결과 동일. 구조/문서 불일치일 뿐 |

---

## 3. ButtonWithLabel (`51405:18495`)

### 검증한 조합 범위

- color 5 × variant **4 (fill/bright/outline/text)** × size 6 × state 5
- 라벨 텍스트 색, 아이콘 슬롯 색, size별 좌우 padding·inner gap·아이콘 크기·타이포, `text` variant min-h/radius, 상태 opacity
- 컨테이너 bg/border/radius/min-h/disabled-opacity는 `Button` 합성으로 위임 → §2에서 검증 완료 (동일 토큰)

### 라벨 텍스트 색 (`LABEL_COLOR`) — 전부 일치

| variant / color          | 코드                       | CSS 해석                       | Figma 변수            | Figma hex | 판정                       |
| ------------------------ | -------------------------- | ------------------------------ | --------------------- | --------- | -------------------------- |
| fill / 5색 전부          | `text-typo-inverse-normal` | `--color-white-pure` `#ffffff` | `typo/inverse/normal` | `#ffffff` | ✅                         |
| bright·outline / brand   | `text-typo-brand-deep`     | `--color-green-600` `#029261`  | `typo/brand/deep`     | `#029261` | ✅                         |
| bright·outline / neutral | `text-typo-neutral-normal` | `--color-gray-950` `#272727`   | `typo/neutral/normal` | `#272727` | ✅                         |
| bright·outline / danger  | `text-typo-danger-deep`    | `--color-red-600` `#e12a3c`    | `typo/danger/deep`    | `#e12a3c` | ✅                         |
| bright·outline / warning | `text-typo-warning-deep`   | `--color-yellow-700` `#a86112` | `typo/warning/deep`   | `#a86112` | ✅                         |
| bright·outline / info    | `text-typo-info-deep`      | `--color-blue-600` `#3c6cff`   | `typo/info/deep`      | `#3c6cff` | ✅                         |
| text / 5색 전부          | `text-typo-neutral-normal` | `#272727`                      | `typo/neutral/normal` | `#272727` | ✅ (color 무관 quirk 유지) |

### 아이콘 슬롯 색 (`ICON_COLOR`) — 전부 일치

| variant / color               | 코드                       | CSS 해석                       | Figma 변수            | Figma hex | 판정                                           |
| ----------------------------- | -------------------------- | ------------------------------ | --------------------- | --------- | ---------------------------------------------- |
| fill / 5색 전부               | `text-icon-inverse-normal` | `--color-white-pure` `#ffffff` | `icon/inverse/normal` | `#ffffff` | ✅                                             |
| bright·outline·text / brand   | `text-icon-brand-normal`   | `--color-green-500` `#00af78`  | `icon/brand/normal`   | `#00af78` | ✅                                             |
| bright·outline·text / neutral | `text-icon-neutral-light`  | `--color-gray-500` `#878787`   | `icon/neutral/light`  | `#878787` | ✅                                             |
| bright·outline·text / danger  | `text-icon-danger-normal`  | `--color-red-500` `#f84b55`    | `icon/danger/normal`  | `#f84b55` | ✅                                             |
| bright·outline·text / warning | `text-icon-warning-deep`   | `--color-yellow-600` `#db9024` | `icon/warning/deep`   | `#db9024` | ✅ (전 variant `deep` quirk — Figma 검증 완료) |
| bright·outline·text / info    | `text-icon-info-normal`    | `--color-blue-500` `#5383ff`   | `icon/info/normal`    | `#5383ff` | ✅                                             |

### size별 컨테이너/타이포 토큰 — 전부 일치

| size | px(좌우) 코드       | Figma `scale/*` | inner gap 코드      | Figma | 아이콘 코드           | Figma | 타이포 코드   | Figma `body/*` (font/size, line-height) | radius       | 판정 |
| ---- | ------------------- | --------------- | ------------------- | ----- | --------------------- | ----- | ------------- | --------------------------------------- | ------------ | ---- |
| 2xl  | `px-[var(--sz-14)]` | 14              | `gap-[var(--sz-8)]` | 8     | `size-[var(--sz-22)]` | 22    | `text-body-1` | `body/1` = font/size/xl 22, lh 1.56     | `rounded-xl` | ✅   |
| xl   | `px-[var(--sz-12)]` | 12              | `gap-[var(--sz-6)]` | 6     | `size-[var(--sz-20)]` | 20    | `text-body-2` | `body/2` = 20, lh 1.48                  | `rounded-lg` | ✅   |
| lg   | `px-[var(--sz-10)]` | 10              | `gap-[var(--sz-6)]` | 6     | `size-[var(--sz-18)]` | 18    | `text-body-3` | `body/3` = 18, lh 1.47                  | `rounded-md` | ✅   |
| md   | `px-[var(--sz-10)]` | 10              | `gap-[var(--sz-4)]` | 4     | `size-[var(--sz-16)]` | 16    | `text-body-4` | `body/4` = 16, lh 1.47                  | `rounded-md` | ✅   |
| sm   | `px-[var(--sz-8)]`  | 8               | `gap-[var(--sz-3)]` | 3     | `size-[var(--sz-14)]` | 14    | `text-body-5` | `body/5` = 14, lh 1.46                  | `rounded-sm` | ✅   |
| xs   | `px-[var(--sz-8)]`  | 8               | `gap-[var(--sz-3)]` | 3     | `size-[var(--sz-14)]` | 14    | `text-body-5` | `body/5` = 14, lh 1.46                  | `rounded-sm` | ✅   |

- `text-body-*` companion 값 (`--text-body-N--line-height` 등)이 Figma `body/N` line-height 와 일치. Figma `letterSpacing: -1` 은 미해결 변수 표기(퍼센트 아님)로 무시.
- Figma `scale/24` 는 BlankIcon 플레이스홀더 내부 기본값 — emit 클래스에서 실제 아이콘 크기로 override, 코드 미사용 (정상).

### `text` variant 전용

| 항목            | 코드                                                                | Figma                                         | 판정      |
| --------------- | ------------------------------------------------------------------- | --------------------------------------------- | --------- |
| 좌우 padding    | `SIZE_PADDING` 미적용 (0, 가로 hug)                                 | `variant=text` 만 padding 0                   | ✅        |
| min-h / radius  | `SIZE_MIN_RADIUS` (Button `SIZE_CLASS`와 동일 매핑)                 | 동일                                          | ✅        |
| hover           | `hover:opacity-[var(--alpha-80)]`                                   | 루트 opacity 0.8                              | ✅        |
| focus / pressed | `focus-visible:opacity`·`active:opacity` `--alpha-80` (BUTTON_BASE) | 원래 inner opacity 0.6 → §5-3 승인된 0.8 통일 | ✅ (의도) |
| disabled        | `disabled:opacity-[var(--alpha-60)]` (TEXT_STATE)                   | fill/outline/text disabled 0.6                | ✅        |

### 발견된 불일치

없음. (outline+brand hover/focus 배경 = §5-1 승인된 의도적 차이)

---

## 4. ButtonWithIcon (`51405:17772`)

### 검증한 조합 범위

- color 5 × variant 3 (fill/bright/outline) × size 6 × state 5
- 아이콘 색, 정사각 컨테이너 크기, 아이콘 크기, radius
- 컨테이너 bg/border/hover/focus/disabled-opacity/radius 는 `Button` 합성 위임 → §2에서 검증 완료

### 아이콘 색 (`ICON_COLOR`) — 전부 일치

ButtonWithLabel `ICON_COLOR` 와 동일 매핑. Figma `get_variable_defs` (`51405:17772`) 대조 결과 전 항목 일치:

| variant / color          | 코드                       | Figma 변수 / hex                | 판정            |
| ------------------------ | -------------------------- | ------------------------------- | --------------- |
| fill / 5색               | `text-icon-inverse-normal` | `icon/inverse/normal` `#ffffff` | ✅              |
| bright·outline / brand   | `text-icon-brand-normal`   | `icon/brand/normal` `#00af78`   | ✅              |
| bright·outline / neutral | `text-icon-neutral-light`  | `icon/neutral/light` `#878787`  | ✅              |
| bright·outline / danger  | `text-icon-danger-normal`  | `icon/danger/normal` `#f84b55`  | ✅              |
| bright·outline / warning | `text-icon-warning-deep`   | `icon/warning/deep` `#db9024`   | ✅ (quirk 유지) |
| bright·outline / info    | `text-icon-info-normal`    | `icon/info/normal` `#5383ff`    | ✅              |

### size별 — 정사각 컨테이너 / 아이콘 / radius 일치

| size | 컨테이너 코드         | Figma `scale/*` | 아이콘 코드           | Figma | radius                | Figma          | 판정 |
| ---- | --------------------- | --------------- | --------------------- | ----- | --------------------- | -------------- | ---- |
| 2xl  | `size-[var(--sz-54)]` | 54              | `size-[var(--sz-22)]` | 22    | `rounded-xl` (Button) | `radius/xl` 12 | ✅   |
| xl   | `size-[var(--sz-50)]` | 50              | `size-[var(--sz-20)]` | 20    | `rounded-lg`          | 10             | ✅   |
| lg   | `size-[var(--sz-46)]` | 46              | `size-[var(--sz-18)]` | 18    | `rounded-md`          | 8              | ✅   |
| md   | `size-[var(--sz-40)]` | 40              | `size-[var(--sz-16)]` | 16    | `rounded-md`          | 8              | ✅   |
| sm   | `size-[var(--sz-32)]` | 32              | `size-[var(--sz-14)]` | 14    | `rounded-sm`          | 6              | ✅   |
| xs   | `size-[var(--sz-26)]` | 26              | `size-[var(--sz-14)]` | 14    | `rounded-sm`          | 6              | ✅   |

### 발견된 불일치

| #            | 조합                   | 코드 값                                        | Figma 값                                                                                                                    | 심각도  | 근거 노드                                                                                                                                                        |
| ------------ | ---------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Low-2        | 좌우 장식 padding      | 정사각 컨테이너 + flex 중앙정렬 (padding 없음) | Figma 노드에 `scale/12`·`scale/14`·`scale/6` 등 (컨테이너−아이콘)/2 좌우 px 존재. `xl`(15px)·`sm`(9px)은 토큰에 없는 raw px | **Low** | `51405:17772` var defs. 정사각+중앙정렬이라 장식적이며, `xl`/`sm`은 토큰이 없어 재현 불가. 코드 주석·figma-implementer 메모리에 처리 방침 명시됨. 시각 영향 없음 |
| (Low-1 재현) | fill / neutral / hover | `bg-bg-inverse-deep`                           | `background/inverse/deep` + `background/overlay/blackNormal` 오버레이 (노드 `51405:18261`)                                  | **Low** | §2 Low-1 과 동일 원인. 시각 영향 없음                                                                                                                            |

---

## 5. 의도적 차이 (승인됨) — 코드 반영 확인 결과

| #   | 승인된 차이                                                                                                                                       | 코드 반영 위치                                                                                                                                                                                                                                                                                                                                         | 확인      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 1   | `ButtonWithLabel` outline+brand hover/focus 배경 = `bg-bg-brand-bright` (Figma 스펙은 `background/brandGrayish/normal` `#f5f8f7`, 형제 통일 목적) | `Button.tsx` `VARIANT_COLOR.outline.brand` → `hover:bg-bg-brand-bright focus-visible:bg-bg-brand-bright active:bg-bg-brand-bright`. `ButtonWithLabel` 은 outline 을 `Button` 합성으로 위임하므로 자동 상속. Figma `51405:18495` var defs 에 `background/brandGrayish/normal` `#f5f8f7` 존재 → Figma는 실제로 brandGrayish 저작, 코드가 의도적으로 이탈 | ✅ 반영됨 |
| 2   | pressed (`:active`) 상태 — Figma에 없음, 배경 = hover 동일 + 루트 opacity `--alpha-80`                                                            | `BUTTON_BASE`: `active:opacity-[var(--alpha-80)]`. `VARIANT_COLOR` 각 항목에 `active:bg-*` = `hover:bg-*` 동일 토큰                                                                                                                                                                                                                                    | ✅ 반영됨 |
| 3   | focus opacity = `--alpha-80` 전 variant 통일 (Figma는 원래 inner fill 0.8 / bright·outline 0.6). inner `group-*:opacity` 트릭 제거                | `BUTTON_BASE`: `focus-visible:opacity-[var(--alpha-80)]`. `INNER_BASE`·`ICON_INNER`·`LabelInner` 에 `group-*:opacity` 클래스 없음 (주석에 "opacity는 루트 담당" 명시)                                                                                                                                                                                  | ✅ 반영됨 |
| 4   | `brand·bright·disabled` Figma quirk(배경 없이 border만) 무시 → enable 디자인 + `--alpha-40`                                                       | `VARIANT_COLOR.bright.brand` 은 상태 무관 `bg-bg-brand-bright`, `DISABLED_OPACITY.bright` = `disabled:opacity-[var(--alpha-40)]`. Figma var defs 에 `border/brand/light` `#b8efde` 존재(quirk 흔적) — 코드는 미사용                                                                                                                                    | ✅ 반영됨 |
| 5   | `BlankIcon` `fill="currentColor"` (색 상속). `Button` 자체는 텍스트/아이콘 색 미지정                                                              | `BlankIcon.tsx`: 각 `<path fill="currentColor" />` (루트 svg 는 `fill="none"`). `Button.tsx` className 에 `text-*`/`icon-*` 색 클래스 없음 — 슬롯이 부여                                                                                                                                                                                               | ✅ 반영됨 |
| 6   | `Button` 은 좌우 padding·gap 0 (사용처 부여). `ButtonWithLabel` 이 `SIZE_PADDING` 을 얹음                                                         | `Button.tsx` `SIZE_CLASS` = `min-h` + `rounded` 만 (padding/gap 없음). `ButtonWithLabel.tsx` `SIZE_PADDING` (`px-[var(--sz-*)]`) 을 `Button` className 으로 전달                                                                                                                                                                                       | ✅ 반영됨 |

추가 확인:

- `warning` 아이콘색 전 variant `text-icon-warning-deep` (`ButtonWithLabel`·`ButtonWithIcon`) — Figma `icon/warning/deep` `#db9024` 와 일치. 검증 완료된 quirk, 정상.

---

## 6. 하드코딩 리터럴 스캔 결과

대상: `src/components/ui/{Button,ButtonWithLabel,ButtonWithIcon}/**` (`.tsx` / `.stories.tsx` / `.test.tsx`)

| 패턴                                                                                       | 검출                                                                                |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| hex 색상 (`#rgb`/`#rrggbb`/`#rrggbbaa`)                                                    | **0** (컴포넌트). `BlankIcon.tsx` 의 `#...` 는 SVG **path 좌표 데이터**로 색상 아님 |
| `rgb()` / `rgba()` / `hsl()`                                                               | **0**                                                                               |
| raw `NNpx` (스타일값)                                                                      | **0** — 모든 크기 `var(--sz-*)` / `rounded-*` / `border-xs`                         |
| Tailwind 기본 팔레트 클래스 (`bg-red-500`, `text-gray-600` 등)                             | **0**                                                                               |
| Tailwind 기본 타이포 유틸 (`text-sm`·`text-lg` 등 bare)                                    | **0** — 전부 `text-body-*` 토큰 유틸                                                |
| 색: semantic 토큰 유틸만 사용 (`bg-bg-*`, `text-typo-*`, `text-icon-*`, `border-border-*`) | ✅ primitive 직접 참조 없음                                                         |

**결과: 위반 0건.**

---

## 7. 권고 조치

우선순위순:

1. **(Low, 선택)** `fill/neutral/hover` 의 Figma `background/overlay/blackNormal` 오버레이 레이어를 코드가 재현하지 않음. 현재 베이스(`--color-bg-inverse-deep` = `#000000`)가 순수 흑색이라 시각적 차이가 없으므로 **조치 불필요**. 다만 Figma 측에서 베이스 색을 바꾸면 hover 가 눈에 띄게 밝아질 수 있으니, 디자인팀에 "오버레이 레이어는 불필요(중복)"임을 피드백해 Figma 저작을 정리하는 편을 권장.
2. **(Low, 문서)** `ButtonWithIcon` 의 size별 좌우 장식 padding 은 정사각+중앙정렬로 대체됨(`xl`=15px·`sm`=9px 는 토큰 없음). 이미 코드 주석·`figma-implementer` 메모리에 기록돼 있음. 추가 조치 불필요.
3. **경고성 이슈 없음.** 세 컴포넌트 모두 배경·테두리·라벨/아이콘 색·크기·radius·opacity 토큰 바인딩이 Figma 변수와 role·brightness 단계까지 100% 일치. **릴리즈 차단 요소 없음.**

---

## 부록: 검증 방법 상세

- Figma 값은 `get_variable_defs` 로 컴포넌트 세트 3개 노드에서 일괄 조회 (변수명 → 해석된 hex/숫자).
- 코드 값은 각 `*.tsx` 의 `VARIANT_COLOR` / `LABEL_COLOR` / `ICON_COLOR` / `SIZE_*` 매핑 테이블에서 추출.
- CSS 해석은 `src/tokens/_generated.css` 에서 semantic → primitive → raw 값을 따라가며 확인.
- 네이밍 대조는 `docs/design-tokens.md` 의 매핑 규칙(`background/brand/normal` → `--color-bg-brand-normal`) 기준.
- Figma 조회 응답의 `개발완료`(`#d0ddff99`)·`red/500`(`#F84B55`, ContentsSlot 점선 테두리) 은 컴포넌트 토큰이 아닌 문서/주석 레이어로 판단해 대조에서 제외.
