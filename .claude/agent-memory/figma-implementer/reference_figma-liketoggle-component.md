---
name: figma-liketoggle-component
description: Figma "LikeToggle"(51405:112826, ATOM, readOnly 없음) + "LikeToggleWithLabel"(51405:112853, MOLECULE, readOnly 있음) — 버튼 안에 버튼 문제 해결, pink→red 그라데이션용 `like` 세만틱 컬러 스케일 신설
metadata:
  type: reference
---

Figma 파일 `kUirarWT1Xugaq0aajY4G6` (또가3.0 Design System). 부모 문서 노드 51405:109220.

**LikeToggle**(51405:112826, ATOM): 아이콘 단독 클릭 토글. `variant`(heart/bookmark) × `color`(neutralNormal/neutralLight/inverse — **unchecked 라인 아이콘 색만**, checked 아이콘은 고정색) × `checked`(2) = 12 심볼. **state(readOnly) 축이 Figma에 없다.**

**LikeToggleWithLabel**(51405:112853, MOLECULE): 아이콘+라벨+(옵션)카운트 알약 버튼. `variant`(heart/bookmark) × `style`(outline/transparent) × `state`(enable/readOnly) × `checked`(2), 조합 불완전(10/16 심볼만 존재 — readOnly는 heart+checked=false 조합에만 있고 bookmark·checked=true readOnly는 Figma에 없음, "클릭 불가"라는 의미상 전체 조합에 일반화해 구현). 라벨 텍스트는 variant 종속("좋아요"/"관심있어요")이지만 재사용을 위해 `label: ReactNode`(필수) prop으로 노출, count는 heart만 존재(0/1 데모)했으나 `count?: number`(옵션, presence 기반 표시)로 일반화.

비직관적 사실(Figma 검증):

- **버튼 안에 버튼 문제**: Figma 생성 코드에서 LikeToggleWithLabel 내부의 bookmark 아이콘에 `role="button" tabIndex="0"`이 중첩되어 있고, 전체를 감싸는 outline pill도 `<button>`이다(무효 HTML). 실제로는 두 컴포넌트가 Figma상 인스턴스 중첩도 아니다(WithLabel은 `LikeToggle/Heart`·`LikeToggle/Bookmark`라는 별개 하위 컴포넌트를 씀). **해결책**: `LikeToggle.tsx`에서 아이콘 렌더 로직만 담당하는 `LikeToggleGlyph`(non-button, named export)를 분리해 두 컴포넌트가 공유하고, 각자 자신의 `<button>`을 직접 소유한다.
- **checked 아이콘 색 고정**: heart는 Pink/500→Red/500 그라데이션(Figma 설명: "Semantic 토큰이 없어 임의로 Hex 적용"), bookmark는 단색 blue(`icon-info-normal`, 기존 토큰 재사용, 신규 토큰 불필요). `color`/`variant`(WithLabel의 `appearance`) prop과 무관하게 고정.
- **라벨은 checked와 무관하게 항상 Medium** — 굵어지는 건 count뿐(Toggle/CheckboxCard의 "checked면 라벨 Bold" 패턴과 다름). 색만 checked로 전환.
- unchecked 라벨/아이콘 색이 **appearance(outline/transparent)에 따라 다름**: outline=neutral-normal, transparent=neutral-subtle. count 색은 appearance 무관 항상 neutral-normal(unchecked 시).
- Figma `style`(outline/transparent) 축은 코드에서 `appearance`로 개명(네이티브 HTML `style` prop과 충돌 회피, `Chip`의 Figma `Style`→`variant` 개명 선례를 따름).
- LikeToggleWithLabel의 readOnly는 Figma상 enable과 **시각적으로 완전 동일**(dim 없음) — 코드에서 `readOnly` prop을 네이티브 `disabled` 속성에 매핑해 클릭·포커스만 차단. **LikeToggle(atom)에는 readOnly 가 없다.**
- ⚠️ **번복 이력**: 2026-09-12에 "일관성 목적"으로 LikeToggle(atom)에도 `readOnly`를 코드 확장 추가했었으나, LikeToggleWithLabel의 남은 Figma 조합(readOnly 관련 6개) 완성이 Figma 쓰기 권한 문제로 계속 실패해 2026-09-13에 **LikeToggle의 readOnly 확장 자체를 포기하고 원복**했다(Figma `LikeToggle`도 동시에 별도 에이전트가 readOnly 축 제거). 즉 현재 LikeToggle 은 `variant`/`color`/`checked` 3축만 가진 순수 Figma 1:1 상태다 — **향후에도 LikeToggle에 readOnly를 다시 넣지 말 것**(같은 논의가 반복되면 이 메모를 먼저 확인). LikeToggleWithLabel 은 원래부터 readOnly 가 있던 컴포넌트라 이번 번복과 무관하게 그대로 유지된다.

**신규 토큰(2026-09-12, 확장형 옵션 B)**: `tokens/color/semantic.json`에 danger/info 패턴을 확장해 `like` 세만틱 컬러 스케일 신설 — `bg-like-{bright,light,subtle,normal,deep,dark}`(pink.60/100/200/500/600/700), `typo-like-{subtle,normal,deep,dark}`(pink.400/500/600/700), `border-like-{light,subtle,normal,deep,dark}`(pink.100/300/400/600/700), `icon-like-{subtle,normal,deep,dark}`(pink.300/500/600/700) + 그라데이션 전용 `icon-like-gradientStart`(pink.500)/`icon-like-gradientEnd`(red.500, 유일하게 pink가 아닌 red 사용 — Figma의 "Pink/500, Red/500" 문구를 그대로 반영). 그라데이션은 CSS `linear-gradient()` 합성 토큰이 아니라 SVG `<linearGradient><stop stopColor="var(--*)">` 2-스톱 방식으로 소비(합성 그라데이션 값은 SVG fill에 못 씀 — 기존 `typo-gradient-highlight`/`border-gradient-highlight`와 다른 소비 패턴).

**코드 구현 (2026-09-12, readOnly 번복 2026-09-13):** `src/components/ui/LikeToggle/` + `src/components/ui/LikeToggleWithLabel/` 각 4파일. `HeartSolidGradient`(비공개, `useId`로 그라데이션 id 충돌 방지, path는 `src/icons/components/heart-solid.tsx`에서 복사) + `LikeToggleGlyph`(공개, non-button, `lineColorClassName`을 호출부가 직접 결정해 전달 — LikeToggle은 3색 enum에서, WithLabel은 appearance 2종에서 각자 매핑해 넘김, 내부에 고정 매핑 안 둠. readOnly 번복과 무관하게 그대로 유지). 둘 다 controlled(`checked`+`onCheckedChange`)/uncontrolled(`defaultChecked`) 지원, `aria-pressed`. LikeToggle은 아이콘 전용이라 `aria-label` 기본값 variant별 제공("좋아요"/"북마크", `ClearButton` 선례). `Icon` 파운데이션(`heart_line`/`heart_solid`/`bookmark_line`/`bookmark_solid`)을 그대로 재사용(신규 아이콘 컴포넌트 불필요, 이미 `src/icons`에 존재). **LikeToggle 최종 API**: `variant?`/`color?`/`checked?`/`defaultChecked?`/`onCheckedChange?`/`className?` + 네이티브 button attrs — `readOnly` 없음.

관련: [[figma-checkbox-component]], [[figma-toggle-component]], [[design-token-architecture]]
