# 디자인 가이드

이 문서는 **디자인 의도**를 다룬다. 코드 규칙(토큰 하드코딩 금지, 4파일 구조)은 루트 `CLAUDE.md`,
작업 프로세스는 `.claude/CLAUDE.md` 참조.

> ⚠️ `TODO:` 로 표시된 곳은 실제 브랜드/디자인 시스템 값으로 채워야 한다.

---

## 1. 브랜드 성격

- **키워드**: `TODO:` 편안한, 명료한, 잘보이는, 친절한
- **톤앤매너**: `TODO:` 정보 밀도가 높지만 시각적으로 조용함. 장식 최소화, 여백으로 위계 표현.
- **서비스 컨셉** `TODO:` 노인이 되어 건강보험공단제도 아래에 돌봄이 필요한 부모님을 모셔야하는 4050세대가 사용하는 실버케어 플랫폼. 서비스 명칭은 **또하나의가족**(줄여서 **또가**).
- **하지 말 것**: `TODO:` 과한 그라디언트, 네온 색, 3D 그림자, 불필요한 애니메이션

이 성격은 색상 채도, 모서리 둥글기, 모션 강도, 그림자 깊이의 기본값을 결정한다.

---

## 2. 색상 사용 맥락

토큰 원본은 `tokens/*.json`, 산출물은 `src/tokens/_generated.css` 의 `@theme` 이며 **2계층**으로 나뉜다.

### 2-1. Primitive (원시 팔레트)

- Figma "또하나3.0 Design System / Primitive Color" 변수와 1:1 일치. 값은 hex 원본 유지.
- 팔레트: `red` `orange` `yellow` `green` `blue` `purple` `pink` (10~~900), `gray` `green-gray` (10~~950).
- 고정 뉴트럴: `black-pure` `white-pure`. 알파 램프: `black-a{00..80}` `white-a{00..80}` `green-gray-a{00..80}` (Monotone).
- 네이밍 매핑: Figma `red/500` ↔ `--color-red-500` ↔ Tailwind `bg-red-500`. Figma `greenGray/500` ↔ `--color-green-gray-500`.
- **컴포넌트에서 Primitive 를 직접 쓰지 않는다.** 색상 값의 "원재료"일 뿐이며, 항상 Semantic 을 경유한다.
- 다크 모드에서도 Primitive 값은 바뀌지 않는다 (모드 전환은 Semantic 재정의로 처리).

### 2-2. Semantic (역할 토큰)

> 출처: Figma "또하나의가족 브랜드 파운데이션 / Sementic Rule" (Version 1.0.0).

UI 요소의 **기능 또는 정보 유형**을 기준으로 구축한 의미론적 컬러 시스템이다.
Primitive(Palette)를 **치환**하여 역할에 따라 이름을 부여한다.
**컴포넌트가 참조하는 유일한 색상 토큰**이며, "파란색이니까" 같은 외형 기준으로 고르지 않는다.

#### 토큰 명명 규칙

```
{UI Element} _ {Role} _ {Brightness}
```

| 위치         | 뜻                  | 예                                   |
| ------------ | ------------------- | ------------------------------------ |
| ① UI Element | 색을 적용할 UI 요소 | `bg` `border` `typo` `icon` `shadow` |
| ② Role       | 색의 의미·역할      | `neutral` `brand` `danger` …         |
| ③ Brightness | 밝기 단계           | `bright` `light` `normal` `dark` …   |

- **Figma 변수 표기**: 언더바(`_`)가 슬래시(`/`)로 표기된다 → `bg/brand/normal`.
- **코드 토큰 매핑**: 슬래시 → 하이픈, 접두사 `--color-`.
  세그먼트 **내부**의 camelCase(`brandGrayish`, `deepDark`, `blackNone`)는 그대로 유지한다.
  - `bg/brand/normal` ↔ `--color-bg-brand-normal` ↔ Tailwind `bg-bg-brand-normal`
- element 접두사는 Figma 변수명과 동일하게 짧게 쓴다: **`background`→`bg`**, **`text`→`typo`** (Figma 변수 폴더명도 `bg`/`typo`). `border`·`icon`·`shadow` 는 그대로.
- 각 Semantic 토큰의 값은 Primitive 참조로 정의한다 — `--color-bg-brand-normal: var(--color-green-500)`.
- `tokens.css` 는 `@theme static` 이므로 미사용 토큰도 CSS 로 출력된다 → `var(--color-*)` 직접 참조가 항상 동작.

#### ① UI Element — 색을 적용하는 UI 요소

| Element (코드) | 의미                                      | Figma color scoping |
| -------------- | ----------------------------------------- | ------------------- |
| `bg`           | 배경 색상                                 | Frame · Fill        |
| `border`       | 선 색상 (그림자성 외곽선은 `shadow` 참고) | Stroke · Effects    |
| `typo`         | 문자 색상                                 | Text · Fill         |
| `icon`         | 아이콘 색상                               | Shape · Text · Fill |
| `shadow`       | 그림자 효과 색상                          | Effects             |

#### ② Color Role — 색의 의미

| Role           | 의미                                 | 기준 Primitive              |
| -------------- | ------------------------------------ | --------------------------- |
| `neutral`      | 제품의 UI를 이루는 기본 컬러         | `gray`                      |
| `brand`        | 포인트로 사용되는 브랜드 주요 컬러   | `green`                     |
| `brandGrayish` | 브랜드 주요 컬러의 회색 범위 색상    | `green-gray`                |
| `danger`       | 정보와 상호작용의 에러               | `red`                       |
| `warning`      | 정보와 액션의 경고                   | `yellow`                    |
| `info`         | 정보 안내                            | `blue`                      |
| `disabled`     | 액션을 할 수 없는 상태               | `gray`                      |
| `inverse`      | UI 요소의 `neutral` 과 반전되는 컬러 | `white-pure` · `gray`       |
| `hint`         | UI 요소의 플레이스홀더 텍스트 컬러   | `gray`                      |
| `shadow`       | 그림자                               | `black`(monotone)           |
| `overlay`      | UI 위를 씌우는 어둡거나 밝은 표면    | `white` · `black`(monotone) |
| `gradient`     | 주요 그라디언트 컬러                 | all                         |

#### ③ Brightness — 밝기 단계

밝은 쪽 → 어두운 쪽 순서. 필요 시 디자이너·개발자가 협의하여 단계를 추가하거나 명칭을 바꾼다.

| 단계       | 뜻                                       |
| ---------- | ---------------------------------------- |
| `none`     | 없음 (0%, 투명)                          |
| `bright`   | 가장 밝은                                |
| `light`    | 밝은                                     |
| `subtle`   | 옅은                                     |
| `normal`   | **Role 의 기준 밝기 — 보통 `color/500`** |
| `deep`     | 진한                                     |
| `dark`     | 어두운                                   |
| `deepDark` | 가장 어두운                              |

- 위 8단계 밖의 값이 필요하면 양 끝에 `Etc`(기타 정의)로 확장한다.
- `overlay` Role 은 `{color}{Brightness}` 단일 세그먼트를 쓴다 — `blackNormal`, `whiteSubtle`, `greenGrayDark`.
- 실제 정의된 `Element × Role × Brightness` 조합(154개)은 `tokens/color/semantic.json` = Figma node `282:7595` 와 1:1. Storybook `Tokens/SemanticColors` 에서 확인.

#### 원칙

- 상태 Role(`danger` `warning` `info`)은 **아이콘 + 텍스트**와 함께 쓴다. 색만으로 의미 전달 금지(접근성).
- 텍스트/배경 대비는 **WCAG AA 이상** (본문 4.5:1, 큰 텍스트 3:1).
- 다크 모드는 Semantic 토큰을 미디어쿼리/`[data-theme]` 로 **재정의**해서 처리한다 (Primitive·컴포넌트는 손대지 않음). _(Figma 에 Dark 값 없음 — 등록 시 `tokens.css` 하단 블록에 채운다.)_
- 라벨(Primitive 이름)과 Figma swatch fill 이 불일치하는 행이 일부 있다 → **문서 라벨을 SSOT 로 채택**했다 (예: `bg/warning/subtle` = `yellow-200`).

---

## 3. 사이즈(Size) 사용 맥락

> 출처: Figma "또가3.0 Design System / Size" (Version 1.0.0).

**티셔츠 사이즈 규칙을 적용하지 않는다.** width·height·padding·margin·gap·top/left 등 크기 관련 속성에는
정해진 숫자 값(px)을 **원하는 요소에 자유롭게** 적용한다. "한 화면에서 N단계까지" 같은 제한도 없다.

### 3-1. sz — Primitive 숫자 스케일

- 토큰: `--sz-<N>` (`N` = px 값). Figma 변수 `sz/<N>` 과 1:1.
- 값은 **rem**(= `N / 16`), `tokens.css` 주석에 px 병기. 서브픽셀(`0.5px`)·센티넬(`9999`)만 px.
- Figma에서 디자이너가 크기를 지정할 때 쓰는 스케일이다. 코드에서는 시맨틱(radius·borderWidth)이 없는
  일반 크기 값에 직접 사용한다.
- 등록된 N (Figma Size 문서 전체): `0~10` · `12~60`(2 간격) · `64~100`(4 간격) · `128 160 192 224 256 320` · `9999`(원형/pill).

**코드에서 참조하는 법** — `--sz-*` 는 Tailwind 유틸리티를 자동 생성하지 않는다:

| 위치            | 사용법                                                             |
| --------------- | ------------------------------------------------------------------ |
| 인라인 `style`  | `style={{ padding: 'var(--sz-16)', gap: 'var(--sz-8)' }}`          |
| Tailwind 클래스 | `className="p-[var(--sz-16)] gap-[var(--sz-8)] w-[var(--sz-320)]"` |
| CSS             | `padding: var(--sz-16);`                                           |

> Tailwind 기본 `--spacing` 배수 유틸(`p-4` = 16px)은 그대로 살아 있지만, 디자인 값은 **항상 `--sz-*` 를 경유**한다.

### 3-2. radius — Semantic (sz 별칭)

Figma `radius/<t>` 와 1:1. `--radius-<t>` 로 등록되어 **Tailwind `rounded-<t>` 유틸이 자동 생성**된다.

| 토큰              | 값               | px        | 유틸             |
| ----------------- | ---------------- | --------- | ---------------- |
| `--radius-xs`     | `var(--sz-4)`    | 4         | `rounded-xs`     |
| `--radius-sm`     | `var(--sz-6)`    | 6         | `rounded-sm`     |
| `--radius-md`     | `var(--sz-8)`    | 8         | `rounded-md`     |
| `--radius-lg`     | `var(--sz-10)`   | 10        | `rounded-lg`     |
| `--radius-xl`     | `var(--sz-12)`   | 12        | `rounded-xl`     |
| `--radius-2xl`    | `var(--sz-16)`   | 16        | `rounded-2xl`    |
| `--radius-3xl`    | `var(--sz-20)`   | 20        | `rounded-3xl`    |
| `--radius-circle` | `var(--sz-9999)` | 원형·pill | `rounded-circle` |

### 3-3. borderWidth — Semantic (sz 별칭)

Figma `borderWidth/<t>` 와 1:1. `--border-width-<t>` 로 등록되어 **Tailwind `border-<t>` 유틸이 자동 생성**된다.

| 토큰                 | 값            | px  | 유틸         |
| -------------------- | ------------- | --- | ------------ |
| `--border-width-2xs` | `0.5px`       | 0.5 | `border-2xs` |
| `--border-width-xs`  | `var(--sz-1)` | 1   | `border-xs`  |
| `--border-width-sm`  | `var(--sz-2)` | 2   | `border-sm`  |
| `--border-width-md`  | `var(--sz-3)` | 3   | `border-md`  |
| `--border-width-lg`  | `var(--sz-4)` | 4   | `border-lg`  |
| `--border-width-xl`  | `var(--sz-6)` | 6   | `border-xl`  |

### 원칙

- 크기 값은 **모두 토큰 경유**. 임의 리터럴(`gap-[13px]`, `p-[1rem]`, `style={{ margin: '5px' }}`) 절대 금지 — hook이 차단.
- 필요한 `N` 이 `--sz-*` 에 없으면 → 코드에 값을 쓰지 말고 **먼저 `tokens.css` 의 `@theme` 에 `--sz-<N>` 추가**.
- 모서리는 `rounded-*`, 보더 굵기는 `border-*` 시맨틱 유틸을 우선 사용한다.
- 허용 예외: `0`, `1px` 보더, `100%` / `auto` 레이아웃 상수, `50%`(원형).

---

## 4. 타이포그래피

> 출처: 원시 — Figma "또가3.0 Design System / Font" (node 2111:2108, Version 1.0.0).
> 합성 — Figma "Typography" (node 21:1978, Version 1.0.0).

타이포는 **원시 토큰**(서체 · 두께 · 크기)과 그 위에 얹는 **합성 텍스트 스타일**(`typo_*`)로 나뉜다.
서체는 **Pretendard 단일**, 두께는 **2단계(Medium · Bold)**, 크기는 **9단계**를 쓴다.
line-height · letter-spacing 은 단독 토큰으로 두지 않고 **합성 스타일(§4-4)에 컴패니언으로 묶어** 토큰화한다.

### 4-1. 서체 (family)

| 토큰          | 값                                                                                                    | 유틸                                               |
| ------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `--font-sans` | `Pretendard` → `ui-sans-serif` · `system-ui` · `Apple SD Gothic Neo` · `Malgun Gothic` · `sans-serif` | `font-sans` (Preflight 가 페이지 기본 서체로 적용) |

- `@theme` 에 `--font-sans` 를 정의하면 Tailwind v4 가 페이지 전역 기본 서체로 적용한다(별도 `body` 규칙 불필요).
- **Pretendard 웹폰트 파일 로딩은 아직 미구현**(CDN / npm self-host / 직접 호스팅 중 미정). 그때까지 fallback 서체로 렌더된다.

### 4-2. 두께 (weight)

디자인 시스템은 **2단계만** 쓴다. `400` · `600` 등 중간 두께는 쓰지 않는다.
Tailwind 기본 두께 유틸(`font-medium` `font-semibold` `font-thin` …)은 `--font-weight-*: initial` 로 제거했다.

| 토큰                   | 값             | 유틸          | 용도        |
| ---------------------- | -------------- | ------------- | ----------- |
| `--font-weight-normal` | `500` (Medium) | `font-normal` | 본문 · 기본 |
| `--font-weight-bold`   | `700` (Bold)   | `font-bold`   | 강조 · 제목 |

### 4-3. 크기 (size)

Figma `font/size/<step>` 와 1:1 (`4xl` 없음, **9단계**). `--text-<step>` 로 등록되어 **Tailwind `text-<step>` 유틸이 자동 생성**된다.
값은 **rem**(= px / 16), `tokens.css` 주석에 px 병기. Tailwind 기본 스케일은 `--text-*: initial` 로 제거했다.

| 토큰         | 값         | px  | 유틸       |
| ------------ | ---------- | --- | ---------- |
| `--text-2xs` | `0.75rem`  | 12  | `text-2xs` |
| `--text-xs`  | `0.875rem` | 14  | `text-xs`  |
| `--text-sm`  | `1rem`     | 16  | `text-sm`  |
| `--text-md`  | `1.125rem` | 18  | `text-md`  |
| `--text-lg`  | `1.25rem`  | 20  | `text-lg`  |
| `--text-xl`  | `1.375rem` | 22  | `text-xl`  |
| `--text-2xl` | `1.5rem`   | 24  | `text-2xl` |
| `--text-3xl` | `1.625rem` | 26  | `text-3xl` |
| `--text-5xl` | `1.875rem` | 30  | `text-5xl` |

### 4-4. 합성 텍스트 스타일 (`typo_*`)

Figma "Typography" 문서(node 21:1978)의 텍스트 스타일. **weight + size + line-height + letter-spacing 을 한 스타일로 묶는다.**
Figma 표기 `typo_<종류>_<번호>[_bold]` ↔ 코드 `--text-<종류>-<번호>[-bold]` ↔ 유틸 `text-<종류>-<번호>[-bold]`
(camelCase 는 kebab: `storeCard` → `other-store-card`).

`--text-<name>` 에 `--line-height` · `--letter-spacing` · `--font-weight` 컴패니언을 함께 정의하면
Tailwind v4 가 `text-<name>` 유틸 **하나에 네 속성을 모두** 적용한다.
size 는 `--text-<step>`, weight 는 `--font-weight-*` 를 참조한다(원시 토큰 경유 = SSOT).
line-height 는 **무단위 비율**, letter-spacing 은 Figma `%`(normal `-1%` · bold `-1.5%`)를 **em 환산**해 저장한다.

| 종류    | 토큰 / 유틸                | size       | weight        | line-height | letter-spacing |
| ------- | -------------------------- | ---------- | ------------- | ----------- | -------------- |
| display | `display-1`                | `5xl` (30) | bold          | 1.4 (140%)  | -1%            |
| title   | `title-1`                  | `3xl` (26) | bold          | 1.46 (146%) | -1%            |
| title   | `title-2`                  | `2xl` (24) | bold          | 1.43 (143%) | -1%            |
| title   | `title-3`                  | `xl` (22)  | bold          | 1.38 (138%) | -1%            |
| body    | `body-1` / `body-1-bold`   | `xl` (22)  | normal / bold | 1.56 (156%) | -1% / -1.5%    |
| body    | `body-2` / `body-2-bold`   | `lg` (20)  | normal / bold | 1.48 (148%) | -1% / -1.5%    |
| body    | `body-3` / `body-3-bold`   | `md` (18)  | normal / bold | 1.47 (147%) | -1% / -1.5%    |
| body    | `body-4` / `body-4-bold`   | `sm` (16)  | normal / bold | 1.47 (147%) | -1% / -1.5%    |
| body    | `body-5` / `body-5-bold`   | `xs` (14)  | normal / bold | 1.46 (146%) | -1% / -1.5%    |
| body    | `body-6` / `body-6-bold`   | `2xs` (12) | normal / bold | 1.4 (140%)  | -1% / -1.5%    |
| label   | `label-1` / `label-1-bold` | `sm` (16)  | normal / bold | 1 (100%)    | -1% / -1.5%    |
| label   | `label-2` / `label-2-bold` | `xs` (14)  | normal / bold | 1 (100%)    | -1% / -1.5%    |
| label   | `label-3` / `label-3-bold` | `2xs` (12) | normal / bold | 1 (100%)    | -1% / -1.5%    |
| other   | `other-store-card`         | `sm` (16)  | normal        | 1.24 (124%) | -1%            |
| other   | `other-price-1`            | `xs` (14)  | normal        | 1 (100%)    | -1%            |
| other   | `other-price-2`            | `2xs` (12) | normal        | 1 (100%)    | -1%            |

`other/*` 는 Figma 에서 색상까지 지정돼 있어, 사용 시 아래 색상 유틸을 함께 붙인다(스타일 토큰엔 미포함):
`other-store-card` → `text-typo-neutral-subtle`, `other-price-1` · `other-price-2` → `text-typo-neutral-light`.

### 원칙

- 폰트 크기 · 두께 리터럴(`text-[14px]`, `font-[600]`, `style={{ fontWeight: 600 }}`) 금지 — hook 이 차단.
- 크기는 `text-<step>`, 두께는 `font-normal` / `font-bold`, 통짜 스타일은 `text-<종류>-<번호>` 만.
- 필요한 단계가 `--text-*` 에 없으면 코드에 값을 쓰지 말고 **먼저 `tokens.css` 의 `@theme` 에 `--text-<step>` 추가**.
- 새 합성 스타일이 필요하면 `--text-<name>` + 컴패니언 4줄을 `@theme` 에 추가한다.
- 색상은 §2 의 `text-typo-*` 시맨틱 토큰으로, 크기와 별개로 지정한다(`other/*` 권장 색상은 위 표 참조).

Storybook `Tokens/Typography` 에서 family / weight / size / display / title / body / label / other 갤러리를 확인할 수 있다.

---

## 5. 화면 · 뷰포트 · 그리드

> 출처: Figma "또하나의가족 브랜드 파운데이션 / Grid" (node 1:7, Version 1.0.0).

**또가는 모바일 전용 서비스다.** 데스크톱 전용 레이아웃은 만들지 않는다.
화면은 뷰포트 폭 360~520px 범위에서 유동적으로 동작한다.

### 4-1. 뷰포트 범위

| 항목    | 값            | 뜻                                                                       |
| ------- | ------------- | ------------------------------------------------------------------------ |
| 최소 폭 | `360px`       | 지원하는 가장 좁은 화면. 미만은 가로 스크롤 허용(레이아웃 재설계 안 함). |
| 최대 폭 | `520px`       | 앱 콘텐츠 영역의 최대 폭.                                                |
| 동작    | Stretch(유동) | 360~520 사이에서 콘텐츠가 폭에 맞춰 늘어난다. 고정 폭이 아니다.          |

- 520px를 초과하는 화면(데스크톱 등): 앱 셸을 **520px로 제한하고 좌우 중앙 정렬**,
  바깥 영역은 배경색으로 채운다.
- 브라우저를 좁히면 앱 셸도 함께 줄어들어 360px까지 내려간다. 360 미만에서만 가로 스크롤.
- **글로벌 브레이크포인트를 두지 않는다.** 범위 내에서는 유동 레이아웃으로 흡수한다.
  특정 화면이 특정 폭에서 구조 자체가 바뀌어야 할 때만, 그 화면에서 로컬 미디어쿼리를 정의한다.

### 4-2. 그리드

| 항목                    | 값      |
| ----------------------- | ------- |
| Columns                 | 4       |
| Gutter (컬럼 사이 간격) | 16      |
| Margin (좌우 바깥 여백) | 20      |
| Body Type               | Stretch |

- 컬럼 폭 = `(콘텐츠 폭 − 2×20 − 3×16) / 4`. 콘텐츠 폭은 360~520에서 유동.
- 그리드는 **다단 정렬의 기준**이다. 대부분의 간격은 §3 의 `--sz-*` 로 처리하고,
  요소를 컬럼에 맞춰 정렬해야 할 때만 4컬럼 그리드를 참조한다.

### 4-3. 토큰

`tokens/layout.json` 에 `--layout-*` 로 정의한다 (산출물 `src/tokens/_generated.css`).

| 토큰                    | 값                  | 용도                                  |
| ----------------------- | ------------------- | ------------------------------------- |
| `--layout-viewport-min` | `360px`             | 루트 `min-width`                      |
| `--layout-viewport-max` | `520px`             | 앱 셸 `max-width` (초과 시 중앙 정렬) |
| `--layout-margin`       | `var(--sz-20)` = 20 | 앱 셸 좌우 padding                    |
| `--layout-gutter`       | `var(--sz-16)` = 16 | 그리드·리스트 `gap`                   |
| `--layout-columns`      | `4`                 | 그리드 컬럼 수                        |

- `--layout-*` 는 Tailwind 유틸을 자동 생성하지 않는다 → `var(--layout-*)` 또는
  `max-w-[var(--layout-viewport-max)]` 로 참조한다(§3-1 의 `--sz-*` 와 동일 방식).
- 모든 페이지를 감싸는 **앱 셸 컨테이너**는 후속 작업에서 컴포넌트로 구현하며,
  이 토큰들을 소비한다. (`TODO:` 앱 셸 컴포넌트)

### 원칙

- 화면 구현 시 폭 관련 리터럴(`max-w-[520px]`, `min-w-[360px]`, `px-[20px]`) 금지 —
  hook이 차단한다. 위 토큰을 경유한다.
- 반응형의 기본값은 "범위 내 유동"이다. 브레이크포인트는 예외이며 해당 화면에만 국소 적용한다.

---

## 6. 컴포넌트 조합 규칙

### 권장 조합

- `Button(primary)` 는 한 화면/한 영역에 **1개**. 나머지는 `secondary` 또는 `ghost`.
- `Card` 안에는 `CardHeader` / `CardBody` / `CardFooter` 순서 유지.
- `FormField` = `Label` + `Input` + `HelperText`(또는 `ErrorText`) 세트로만 사용.
- 아이콘은 텍스트와 같은 `currentColor` 를 상속. 별도 색 지정 지양.

### 안티패턴 (쓰지 말 것)

| 하지 말 것                                  | 이유                     | 대신                                                  |
| ------------------------------------------- | ------------------------ | ----------------------------------------------------- |
| `primary` 버튼 2개 이상 나란히              | 액션 위계 붕괴           | 1개만 primary, 나머지 secondary/ghost                 |
| `Card` 안에 또 `Card` (중첩)                | 시각적 소음, 그림자 중첩 | 내부는 `--color-border` divider 로 구분               |
| `danger` 색을 "강조"용으로 사용             | 오류 신호와 혼동         | `primary` 또는 굵기/크기로 강조                       |
| 모달 안에 모달                              | 컨텍스트 상실            | 단계형 마법사(스텝) 또는 인라인 확장                  |
| 상태색만으로 의미 전달 (아이콘·텍스트 없이) | 색맹 사용자 접근 불가    | 아이콘 + 텍스트 라벨 병기                             |
| 임의 그림자/보더 추가                       | 토큰 밖 스타일           | `--shadow-*`, `--color-border-*`, `border-*`(굵기) 만 |

---

## 7. 배경 흐림 (BackdropBlur)

> 출처: Figma "또가3.0 Design System / BackdropBlur" (node 106:564, Version 1.0.0).

**넓은 면적의 UI 배경에 씌우는 흐림 효과.** Figma `BACKGROUND_BLUR` 이펙트 ↔ CSS `backdrop-filter: blur()`.
반경은 `sz` 변수로 조립하고(Shadow 와 동일), **2단계만** 쓴다.
`--blur-<name>` 로 등록되어 Tailwind `backdrop-blur-<name>` 유틸이 자동 생성된다.
Tailwind 기본 스케일(`blur-xs`~`blur-3xl`)은 `--blur-*: initial` 로 제거했다(§4-2 와 동일 원칙).

| 토큰            | 값             | radius | 유틸                   | 용도                                                                    |
| --------------- | -------------- | ------ | ---------------------- | ----------------------------------------------------------------------- |
| `--blur-dim`    | `var(--sz-8)`  | 8      | `backdrop-blur-dim`    | 약한 흐림. dim 오버레이 — 뒤 배경 형태는 남기고 시선만 누를 때.         |
| `--blur-header` | `var(--sz-16)` | 16     | `backdrop-blur-header` | 강한 흐림. 스크롤에 겹쳐 고정되는 헤더·상단 바를 뒤 콘텐츠와 분리할 때. |

- 반투명 배경색과 **함께** 쓴다 — `className="bg-bg-overlay-whiteNormal backdrop-blur-header"`.
- 단계가 없으면 코드에 값을 쓰지 말고 **`tokens.css` 의 `@theme` 에 `--blur-<name>` 먼저 추가**.

Storybook `Tokens/BackdropBlur` 에서 확인.

---

## 8. Figma 레이어 네이밍 컨벤션

코드 변환 시 파싱 가능하도록 Figma 쪽에서 지켜야 하는 규칙.

### 컴포넌트

- 컴포넌트명: `PascalCase` — 코드 컴포넌트명과 **1:1 일치** (`Button`, `FormField`).
- Variant 프로퍼티: `속성=값` — 코드 prop 과 이름 일치 (`variant=primary`, `size=sm`, `state=hover`).
- 컴포넌트 세트 이름: `PascalCase` 단수형.
- 서브 파트(슬롯): `PascalCase.Part` (`Card.Header`, `Button.Icon`).

### 토큰 / 변수 (Figma Variables)

- 색상(Primitive): `<hue>/<step>` → `red/500`, `green-gray/500` (camelCase `greenGray` 는 코드에서 `green-gray`)
- 색상(Semantic): `<UI Element>/<Role>/<Brightness>` → `bg/brand/normal`, `typo/neutral/dark` (§2-2 참고. Figma 의 `/` = 토큰명의 `_`)
- 사이즈(sz): `sz/<N>`(N = px) ↔ `--sz-<N>` (§3-1 참고. 티셔츠 단계 없음, 숫자 값 직접 적용)
- Radius: `radius/<t>` ↔ `--radius-<t>` (`xs sm md lg xl 2xl 3xl circle`)
- BorderWidth: `borderWidth/<t>` ↔ `--border-width-<t>` (`2xs xs sm md lg xl`)
- Shadow: `shadow/<group>/<step>` ↔ `--shadow-<group>-<step>` → Tailwind `shadow-*` 유틸 자동 생성
  - `black` · `greenGray` = `xs sm md lg xl` (drop shadow), `bottomNav` = 단일(상단 방향), `borderNeutral` · `borderBrand` = `xs sm md` (inset 외곽선)
  - offset·blur 는 `sz/<N>` 변수로 조립, 색상은 `shadow/*` · `border/*` 참조 (Storybook `Tokens/Shadow` 에서 확인)
- BackdropBlur: `backdropBlur/<name>` ↔ `--blur-<name>` → Tailwind `backdrop-blur-<name>` · `blur-<name>` 자동 생성
  - `dim` = `sz/8`, `header` = `sz/16` (BACKGROUND_BLUR 이펙트, radius 를 `sz` 변수로 조립. §7 참고)
- Alpha(투명도): `alpha/<NN>` ↔ `--alpha-<NN>` (`00 05 10 20 40 60 80`, 요소 `opacity` 배수 = 퍼센트/100)
  - Tailwind 유틸 없음 → `var(--alpha-*)` 또는 `opacity-[var(--alpha-40)]` 로 참조. §9 참고
- 타이포(size): `font/size/<step>` ↔ `--text-<step>` (`2xs xs sm md lg xl 2xl 3xl 5xl`, 4xl 없음) → Tailwind `text-*` 자동 생성
- 타이포(weight): `font/weight/<normal|bold>` ↔ `--font-weight-<normal|bold>` (Medium 500 / Bold 700 2단계)
- 타이포(family): `font/family/normal` ↔ `--font-sans` (Pretendard)
- 타이포(합성): `typo_<종류>_<번호>[_bold]` ↔ `--text-<종류>-<번호>[-bold]` + `--line-height`/`--letter-spacing`/`--font-weight` 컴패니언 → Tailwind `text-<종류>-<번호>` 자동 생성 (§4-4. `storeCard` → `other-store-card`)
- 코드 토큰명 매핑: `color/text/muted` ↔ `--color-text-muted` (슬래시 → 하이픈, 접두사 `--`).

### 페이지 / 프레임

- 페이지: `01 Foundations`, `02 Components`, `03 Patterns`, `04 Screens` (번호 접두).
- 프레임(스크린): `<Flow> / <Step>` → `Onboarding / Enter Email`.
- 상태 프레임: `<Screen> — <state>` → `Checkout — empty`, `Checkout — error`.

### 금지

- 레이어명 `Frame 123`, `Group 45`, `Rectangle 7` 방치 → 코드 변환 시 의미 추출 불가.
- 한글 레이어명(자동화 파서가 다루기 어려움). 표시용 텍스트는 무관.
- variant 값에 공백/특수문자 (`state=on hover` ✗ → `state=hover` ✓).

---

## 9. 투명도 (Alpha)

> 출처: Figma "또가3.0 Design System / Alpha" (node 2327:4758, Version 1.0.0).

**요소의 `opacity` 에 곱하는 불투명도 배수 스케일.** 오버레이·비활성·구분선 등에 일관된 투명도를 줄 때 쓴다.
Figma `alpha/<NN>`(퍼센트 숫자)와 1:1. `--alpha-<NN>` 로 등록, 값은 **소수**(= % / 100).

| 토큰         | 값     | %   | 용도                             |
| ------------ | ------ | --- | -------------------------------- |
| `--alpha-00` | `0`    | 0%  | 완전 투명 ("없음" 상태 명시)     |
| `--alpha-05` | `0.05` | 5%  | 구분선, hover 힌트               |
| `--alpha-10` | `0.1`  | 10% | pressed 배경, 얇은 오버레이      |
| `--alpha-20` | `0.2`  | 20% | 비활성(disabled) 요소            |
| `--alpha-40` | `0.4`  | 40% | dim 오버레이                     |
| `--alpha-60` | `0.6`  | 60% | 강한 dim (모달·바텀시트 뒤 배경) |
| `--alpha-80` | `0.8`  | 80% | 거의 불투명한 표면               |

- 알파 **컬러** 램프(`--color-black-a<NN>` 등 = 색상의 알파 채널)와 별개다 — 이쪽은 요소 전체 `opacity`.
- Tailwind 유틸 없음(`--sz-*` · `--layout-*` 와 동일) → `style={{ opacity: 'var(--alpha-40)' }}` 또는 `opacity-[var(--alpha-40)]` 로 참조.
- 단계가 없으면 코드에 값을 쓰지 말고 **`tokens.css` 의 `@theme` 에 `--alpha-<NN>` 먼저 추가**.

Storybook `Tokens/Alpha` 에서 확인.
