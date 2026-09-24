---
name: figma-searchbar-component
description: Searchbar 컴포넌트 세트(51405:130536) 축·상태·토큰 매핑, _parts 내부 아톰(130517), button vs enable 차이, ClearButton 재사용
metadata:
  type: reference
---

Figma "또가3.0 Design System / Searchbar" — 문서 캔버스 51405:130482.

## 두 개의 컴포넌트 세트

- **Searchbar** (메인, node 51405:130536): `variant`(header|body) × `state`(button|enable|focus|hover) = 8 심볼. **disabled·filled 없음.** 기본 variant = `state=button, variant=header`.
- **\_parts/Searchbar** (내부 아톰, node 51405:130517): `state`(enable|focus) × `hasValue`(false|true) = 4 심볼. 값 영역(placeholder/입력값 + ClearButton + 커서)만 담당. 메인이 이걸 감싸고 컨테이너 크롬 + 좌측 search 아이콘 추가. → 구현 시 인라인 권장(별도 컴포넌트 아님).

## button vs enable

시각적으로 **완전히 동일**(모든 branch에서 button은 enable과 같은 스타일 그룹). 차이는 의미/시맨틱뿐:

- `enable` = 실제 텍스트 입력 필드 resting (→ `<input>`), focus·값 보유 가능
- `button` = 입력 아님, 전용 검색 화면/패널 여는 트리거 (→ `<button>`), 캐럿·타이핑·클리어 없음
  구현이 role(input vs button)을 인코딩해야 함.

## 레이아웃/토큰 (get_variable_defs 검증)

공통: `flex items-center`, px `--sz-14`, radius `--radius-lg`(10, → `rounded-lg`), width fill(320 기준). 좌측 아이콘↔값 gap = inner `--sz-8`.

- **header**: 높이 38(콘텐츠 파생), py 0, 테두리 없음.
  - enable/button/focus: bg `--color-bg-neutral-deep`(#f6f6f6). focus는 캐럿만 추가(테두리 변화 없음).
  - hover: bg `--color-bg-neutral-dark`(#f3f3f3).
- **body**: 높이 46(=parts 38 + py `--sz-4` ×2), border `border-xs`(1px).
  - enable/button: bg `--color-bg-neutral-normal`(white) + `border-border-neutral-light`(#c5c5c5).
  - hover/focus: bg white + `border-border-brand-normal`(#00af78). focus는 캐럿 추가.

## 아이콘

- 좌측: `search_md_line`(src/icons 존재), 18px(`--sz-18`). 정적 표시용, 버튼 아님.
  - 색: header 전체 + body enable/button = `--color-icon-neutral-bright`(#ababab). body hover/focus = `--color-icon-brand-deep`(#029261).
- 클리어: `x_circle_solid` 글리프, 16px(`size/4xs`), 색 `--color-icon-neutral-bright`. → **기존 `ClearButton` 컴포넌트 `size="sm"` 그대로 재사용**. hasValue=true일 때만.
- 커서: 2px 퍼플(primitive `purple/500` #9D75F8, 세만틱 토큰 없음) 애니 캐럿 — **Figma 전용 아티팩트**. 실제 구현은 네이티브 `<input>` caret 사용, 이 div 무시.

## 타이포그래피

placeholder·입력값 둘 다 Figma `body/3` = 프로젝트 `--text-body-3`(text.md 18 / lh 1.47 / ls -0.01em / normal) → 유틸 `text-body-3`.

- placeholder 색: `--color-typo-hint-normal`(#969696) → `text-typo-hint-normal`
- 입력값 색: `--color-typo-neutral-normal`(#272727) → `text-typo-neutral-normal`
- button 라벨도 placeholder와 동일(hint 톤, 별도 라벨 색 없음)

## size 축

없음. header/body는 `variant`(용도)이지 size가 아님. 각자 높이 고정(38 / 46).

## Code Connect / 재사용

- figma-code-connect.json 에 Searchbar 매핑 없음(구현 후 추가 대상).
- 재사용: `ClearButton`(size=sm) 확실. `src/icons`의 `<Icon name="search_md_line">`. IconButton·BlankIcon은 부적합(좌측 아이콘은 non-interactive).
- 프로젝트에 기존 input/textfield 계열 컴포넌트 없음 → Searchbar 신규 단독.

## 권장 API 초안

`variant: "header" | "body"` (기본 header), `asButton?: boolean` 또는 별도 컴포넌트(SearchbarButton) / `value`,`onChange`,`placeholder`,`onClear`,`onSubmit`, `disabled`(Figma엔 없지만 실사용 필요 가능 — 확인 필요). hover/focus는 CSS 의사클래스(props 아님).
