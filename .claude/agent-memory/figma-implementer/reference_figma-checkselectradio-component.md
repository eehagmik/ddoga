---
name: figma-checkselectradio-component
description: Figma "CheckSelectRadio" 몰리큘 세트(51405:48796) - 목록 선택 행, 라벨+우측 체크(선택 시만 표시), variant 축 없음, Checkbox mark 아톰 재사용, 코드 구현 위치
metadata:
  type: reference
---

> 갱신 2026-09-10: `type` 기본값 `radio`(checkbox 도 선택 가능), `disabled` 확장은 사용자 지시로 제거.

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System).

**CheckSelectRadio** 컴포넌트 세트: node-id `51405:48796`. 목록에서 항목을 선택하는 전체 폭 행(row) MOLECULE. 심볼 **단 3개** = `state=enable, checked=false` / `state=hover, checked=false` / `state=focuse, checked=true`. size·variant(circle/square/mark) 축 **없음**. disabled·indeterminate 없음.

비직관적 사실(Figma 검증):

- 레이아웃: `[리딩 슬롯 34px(선택)] [라벨 flex-1] [체크 표시 24px 우측]`. 컨테이너 `w-full`(Figma 프레임은 320), `py=scale/10`, `px=0`, inner `gap=scale/8`, `items-center`.
- **체크 표시는 선택 시에만 보인다.** 미선택 심볼은 체크박스를 `opacity-0` 로 감싸 자리만 유지(Figma `CheckboxCheckbox` type=mark check=false + opacity-0). 선택 심볼은 `_checkboxImage`(size 24, `icon/brand/normal` #00af78) 직접 렌더.
- 라벨 타이포·색: unchecked enable = `typo/neutral/normal` #272727 Medium(body/3) / unchecked hover = `typo/brand/dark` #007a54 Medium / checked("focuse") = `typo/brand/deep` #029261 **Bold**(body/3_bold).
- `state=focuse` 심볼은 checked 조합만 존재 — 포커스 단독 시각이 Figma 에 불명확. 코드는 접근성 어포던스로 `group-focus-within:` 시 라벨을 hover 와 동일하게 `typo/brand/dark` 로 전이.
- Figma 컴포넌트 설명: check 그래픽은 파운데이션 아이콘셋에 없는 커스텀 벡터 `parts/etc_check_thick` 의 `Union` 레이어 — `Checkbox` 아톰과 동일 path.

**코드 구현 (2026-09-10):** `src/components/ui/CheckSelectRadio/` 4파일. `CheckboxWithLabel` 패턴 그대로 — 루트 `<label class="group">` + visually-hidden `<input class="peer sr-only">`, 행 전체 히트영역, controlled/uncontrolled 둘 다, `checked` 외 input 속성 `...rest` spread, `Omit<InputHTMLAttributes,"children"|"type">` 확장. 체크 표시는 `<Checkbox variant="mark" size="md" checked />` 합성(로직 재구현 안 함) + 래퍼 `opacity-0`/`opacity-100` 토글. props: `type`('radio' 기본 / 'checkbox' — 이름에 Radio 있어 사용자가 radio 기본 요청, Figma 범위 밖 확장) / `children`(라벨, 필수 ReactNode) / `startSlot?`(리딩 슬롯, presence 기반). **disabled 는 초안에 넣었다가 사용자 지시로 제거 — Figma 시각 3종 엄격 준수.** 라벨 hover/focus 는 `group-hover:`/`group-focus-within:text-typo-brand-dark`(루트가 아니라 자손 span 이라 group- 접두사 OK — [[group-hover-self-styles]] 와 반대 케이스). `data-type`/`data-checked`/`data-state`(항상 "enable"). Code Connect `51405:48796` 매핑 추가됨. 사용자가 "Check 이미지는 Checkbox 에 적용한 거 그대로" 라고 명시 → mark 아톰 재사용이 정답.

관련: [[figma-checkbox-component]], [[figma-checkboxcard-component]], [[group-hover-self-styles]]
