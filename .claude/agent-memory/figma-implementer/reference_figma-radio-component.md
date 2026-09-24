---
name: figma-radio-component
description: Figma "Radio" 문서 페이지(51405:128206) - Radio(atom)/RadioWithLabel/RadioCard 3세트, Checkbox 계열과 구조 동일하나 실측 차이점 다수, 코드 구현 위치
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System).

**Radio 문서 페이지**: node-id `51405:128206`. 내부 "Main Component" 프레임에 `Checkbox` 계열과 동일하게 3세트가 있다.

- **Radio**(ATOM): `51405:128241`. 18심볼 = size(sm22/md24/lg28) × checked(2) × state(enable/hover/disabled). **variant(circle/square/mark) 축 없음** — 항상 원형.
- **RadioWithLabel**(MOLECULE): `51405:128280`. 36심볼 = size(3) × checked(2) × state(enabled/hovered/disabled) × isBold(2).
- **RadioCard**(MOLECULE): `51405:128427`. 18심볼 = size(3) × state(enable/hover/disabled) × checked(2).

**내부 점(circle_solid) 구현**: 단순 채워진 원이라 `Checkbox`의 커스텀 Union path 인라인 SVG 방식이 불필요 — `<span className="rounded-full">` + 배경색 유틸만으로 표현(SVG 완전히 없음). SVG 원본을 직접 다운로드해 fill hex 를 토큰과 대조 검증: unchecked enable `icon-brandGrayish-light`(#c2ccc7)@40%, unchecked hover `icon-brandGrayish-subtle`(#a6b3ad)@40%, unchecked disabled `icon-disabled-light`(#d9d9d9) **불투명**(opacity 없음), checked(전 상태) `icon-inverse-normal`(흰색) 불투명. 점 크기 sm10/md12/lg14 = `--sz-10/12/14`.

**Checkbox 대비 실측 차이(추측 아님)**:

- checked+disabled 배경이 `bg-disabled-deep`(#c5c5c5) — Checkbox 는 `bg-disabled-normal`(#d9d9d9).
- disabled 상태 점은 opacity-40% 미적용 — Checkbox 체크마크는 disabled 에도 40% 유지.
- RadioCard 의 라디오 래퍼 pt 가 sm=`--sz-2`/md=`--sz-1`/lg=`--sz-5` — CheckboxCard 는 sm=`--sz-1`(md/lg 는 동일). sm 만 다름.
- RadioWithLabel 은 gap/pt/타이포가 CheckboxWithLabel 과 수치까지 완전히 동일(sm gap8/pt2/body-4, md gap8/pt1/body-3, lg gap10/pt1/body-2).
- RadioCard 는 나머지 전부(카드 gap/radius/padding/라벨-서브텍스트 타이포/hover는 checked 무관 배경/checked 시 brand-bright+bold+brand-dark 라벨/shadow-border{Neutral,Brand}-{xs,sm} 규칙/lg 카드가 md 아톰 사용)가 [[figma-checkboxcard-component]] 와 완전히 동일.

**RadioGroup 스코프**: Figma 에 그룹 상호배타 표현 없음 → 별도 `RadioGroup` 컴포넌트 미생성(사용자 승인). `name` 속성 패스스루만 지원. uncontrolled 인스턴스를 여러 개 name 만 공유해 렌더하면 브라우저가 형제를 native 하게 선택 해제해도 React state(독립 인스턴스별 useState)가 갱신되지 않아 시각 상태가 어긋날 수 있음 — JSDoc/스토리에 controlled(checked+onChange) 그룹 패턴을 권장으로 명시.

**코드 구현(2026-09-11)**: `src/components/ui/{Radio,RadioWithLabel,RadioCard}/` 각 4파일(총 12개). `Checkbox`/`CheckboxWithLabel`/`CheckboxCard` 패턴 그대로 계승(순수 시각 프리미티브 아톰 + `<label class="group">` 합성 몰리큘, controlled/uncontrolled, `...rest` spread, `hover:`+`group-hover:` 이중 처리, 카드 표면은 루트 자기 자신이라 `hover:`만). 테스트 작성 시 주의: RadioCard 루트 `<label>` 에도 `data-size` 를 부여하므로 `container.querySelector("[data-size]")` 는 라벨을 먼저 매칭한다 — 아톰만 특정하려면 `span[data-size]` 사용(라벨은 `<label>`, 아톰 루트는 `<span>`). figma-code-connect.json 에 `51405:128241`/`51405:128280`/`51405:128427` 매핑 추가됨. 전체 빌드/typecheck/lint/test(343개) 통과.

관련: [[figma-checkbox-component]], [[figma-checkboxcard-component]], [[group-hover-self-styles]], [[design-token-architecture]]
