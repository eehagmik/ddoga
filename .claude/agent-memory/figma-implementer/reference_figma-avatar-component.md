---
name: figma-avatar-component
description: Figma "Avatar"(51405:6120), size 6종(xs~2xl) 오타 정정(add만 76/96→72/84 통일), type person/ltch/add(person·add만 button, ltch는 div), edit 배지·checkable 링 실측 → sz/borderWidth 토큰 정확 매핑
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System). 문서 노드 51405:6022(가이드, 구현 대상 아님) / 메인 컴포넌트 51405:6120.

**축**: `size`(xs24/sm32/md48/lg60/xl72/2xl84, 전 type/variant 공통) × `type`(person/ltch/add) × `variant`(readOnly/edit/checkable, **person 전용** — ltch/add 는 무시).

**size 오타 정정(2026-09-16 사용자 확정)**: Figma 원본은 `type=add` 만 xl=76/2xl=96 으로 다른 값이 찍혀 있었으나 Figma 쪽 오타로 확인됨 — 코드에서는 전 type/variant 에 72/84 로 통일. 이후 Figma 확인 논의에서 이 수치가 다시 나오면 오타로 간주할 것.

**루트 태그가 type 별로 다르다(Figma 구조 그대로 반영)**:

- `person`(readOnly/edit/checkable 전부) → `<button>`. readOnly 조차 버튼인 이유: 프로필 보기로 이어지는 클릭 가능한 아바타 전제.
- `ltch`(요양시설/장기요양기관을 가리키는 내부 개발 약어) → `<div>`, 항상 readOnly, variant 완전 무시. person 과 "이미지만 다를 뿐 구조는 동일"이라는 표현은 _기능_(readOnly 구성)이 같다는 뜻이지 루트 태그가 같다는 뜻이 아니다 — Figma 실측상 명백히 div.
- `add`("새 아바타 추가" 슬롯, 점선 원 + plus_line) → Figma 원본은 `<div>` 지만 클릭 액션이므로 코드에서 `<button>` 으로 승격(Figma 출력은 디자인 의도이지 최종 마크업이 아니라는 원칙 적용).

**컬러 아바타 이미지 8종은 Figma 구조 밖**: `src/assets/images/avatar/Person=*.svg` 는 Avatar 컴포넌트에 import 하지 않는다 — 호출부가 `src` prop 으로 주입. `src` 없을 때 기본 placeholder 는 Figma 의 raster 합성 일러스트(`avatar/personPlaceholder`, `placeholder_ltch`, 둘 다 프로젝트 로컬에 깨끗한 원형 자산 없음 확인됨)를 그대로 못 쓰고 `Icon(user_01_solid / building_01_solid)` + `bg-bg-brandGrayish-normal` 원형 배경으로 대체(스크린샷 실측 근사 — 옅은 민트 그레이 배경 + 중간 톤 green-gray 실루엣).

**edit 배지(get_design_context 실측, 51405:6120)**: 지름 14/16/22/24/26/28(size 순) → 기존 `--sz-*` 토큰과 정확히 일치. 우측 오프셋 -4/-4/-2/-2/-2/0 → `--sz-4`/`--sz-2`. 항상 `bottom-0`. 배경 `bg-bg-brandGrayish-deep`, 테두리 1px `border-border-brandGrayish-light`, 그림자 `shadow-black-xs`(Figma effect `shadow/black/xs` 와 1:1 일치, 기존 유틸 그대로 재사용). 내부 아이콘은 배지 지름의 약 4/7(inset 21.43% 실측) → 8/9/13/14/15/16px 룩업(Icon 숫자 prop, 토큰 대상 아님, `ClearButton`/`LikeToggle` 선례).

**checkable 링(핵심 발견)**: Figma inset 퍼센트를 실제 px 로 환산하면 2/2/3/4/4/6px(size 순)이고, 이 값이 프로젝트의 `--border-width-{sm,sm,md,lg,lg,xl}` 토큰과 **정확히 일치**한다. 덕분에 `outline` 음수 offset 계산 없이 `border`(box-sizing: border-box) 로 간단히 구현 가능 — `inset`을 `-var(--border-width-*)` 로 벌리고 같은 토큰을 `border-width` 로 주면 아바타 가장자리 바로 바깥을 정확히 두르는 밴드가 된다. 색은 `--color-icon-brand-dark`(#007a54). Figma 원본은 `checked=false` 시 링이 DOM 에서 완전히 빠지는 구조(radial sweep 애니메이션, `_animate/FocusRing` 서브파츠)지만 duration/easing 을 MCP 로 확인할 수 없어 — 사용자 사전 승인에 따라 링을 항상 마운트해두고 `opacity-100`/`opacity-0` 150ms 페이드로 대체. DOM 순서(링 → 이미지 → 배지)만으로 페인트 순서가 정해져 z-index 유틸이 전혀 필요 없다(Figma 원본은 z-[1]/z-[2] 사용하지만 이식 불필요).

**Hooks 함정**: person/ltch/add 세 분기가 조건부 early return 구조라, `checked` 관련 `useState` 는 반드시 얼리 리턴들보다 **앞**에서 호출해야 한다(Rules of Hooks) — ltch/add 에서는 그냥 안 쓰일 뿐.

**코드 구현(2026-09-16)**: `src/components/ui/Avatar/` 4파일. 평평한 props(discriminated union 미사용, `Chip` 의 startType/startSlot 절충 선례) — `variant` 는 항상 존재하지만 person 외에는 무시. `AvatarVisual`(비공개 헬퍼)이 person/ltch 공용으로 src 유무 분기. `figma-code-connect.json` 에 `51405:6120` 매핑 추가 완료.

**edit 배지 클릭 구조 정정(2026-09-16, 같은 날 재수정)**: 사용자가 참고 노드 51405:6118(`_parts/AvatarEditButton`, 하위 아이콘 노드 51405:6119)을 지목해 재검증을 요청 — Figma 출력 자체는 `<div>`지만 파츠 이름이 "…Button"인 걸로 보아 클릭 의도가 배지 쪽에 있다고 판단. 최초 구현은 person 루트 전체를 `<button>`으로 내고 배지는 장식용 `aria-hidden span`이었는데, 이를 뒤집어 **`variant='edit'`일 때 person 루트를 비인터랙티브 `<div>`로, 배지를 실제 `<button type="button">`(신규 `onEditClick` prop, `aria-label` 기본값 `DEFAULT_LABEL.edit`="아바타 편집", `focus-visible` dip, `cursor-pointer`)으로 뒤집었다** — `ltch`가 이미 쓰던 "person 루트를 div로 내리는" 선례를 그대로 재사용(버튼-in-버튼 회피 목적과도 정확히 맞아떨어짐). 기존 `onClick`(ButtonHTMLAttributes 상속)은 `readOnly`/`checkable` 루트 버튼 전용으로 남기고 edit 배지에는 전달하지 않는다. 동시에 배지 아이콘 색을 `text-icon-neutral-normal` → `text-icon-brandGrayish-normal`로 정정(토큰 자체는 이미 `_generated.css`에 존재, 프로젝트 내 다른 컴포넌트에서 아직 실사용 사례는 없었음). `readOnly`/`checkable`은 기존 그대로 person 루트가 `<button>`. 테스트/스토리/code-connect notes 모두 갱신, 4개 검증(typecheck/eslint/vitest 18개/build) 전부 통과.

관련: [[figma-liketoggle-component]], [[figma-switch-component]], [[figma-checkboxcard-component]]
