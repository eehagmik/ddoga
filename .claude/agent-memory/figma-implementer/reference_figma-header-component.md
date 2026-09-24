---
name: figma-header-component
description: Figma Header 컴포넌트(51405:85638) type=home/search 실제 인스턴스 구조와 정정 이력
metadata:
  type: reference
---

Header 컴포넌트 세트, node 51405:85638 (24개 인스턴스: type × variant × contentsColor × bold 조합).

## type="home" (node 51405:85639 외 3개 variant/contentsColor 조합, 전부 동일 패턴 확인)

- 좌측에 뒤로가기 노드가 구조적으로 아예 없음(모든 variant/contentsColor 조합 동일) — `back` prop과 무관하게 항상 숨겨야 함.
- 좌측은 `LogoPlatform type="horizon"` 인스턴스, 폭 127.543px × 높이 23.936px로 축소 배치됨 → 프로젝트 `Logo` 컴포넌트 `lockup="horizontal"`, `width="var(--sz-128)"`(가장 가까운 sz 토큰, 반올림)로 매핑. `style="color"`/`"white"` → `Logo` `tone="color"`/`"white"`, `contentsColor`(neutral/inverse)에 연동.
- 우측 `PartsIconOptional` 인스턴스가 `showHome/showSlot/showSearch/showLike/showShare/showClose`를 전부 `false`로 명시적 오버라이드하고 `showUser`/`showCart`는 기본값(true)을 그대로 둔 채 사용됨 — 즉 "user+cart만 고정"은 우연이 아니라 인스턴스 차원에서 의도적으로 조합된 것. 소비자가 넘기는 showX props를 전부 무시하고 이 조합을 강제해야 함(userBadge/cartCount는 그대로 소비자 제어 유지).

## type="search" (node 51405:85672 외 variant 조합)

- 좌측: back(IconButton, `back` prop대로 정상 노출) + `Searchbar` 인스턴스. `Searchbar`는 `variant="header"`, `state="enable"`(기본값, Header 쪽에서 오버라이드 없음)로 삽입됨.
- 참고: 프로젝트 Searchbar 자체 문서(→ [[reference_figma-searchbar-component]])에 따르면 `state="button"`(asButton=true)과 `"enable"`은 완전히 동일한 시각(role만 다름). Header가 `state=enable`을 오버라이드 없이 그대로 쓴 것은 마스터 컴포넌트 기본값일 뿐 의도적 선택이라는 증거가 약함 — 반면 home의 showX 오버라이드는 명시적이었음(대조). 최종적으로 Header 프레젠테이션 트리거 원칙(onTitleClick 선례) + `onSearchbarClick` prop 요구에 맞춰 `asButton=true`로 구현하기로 결정(시각적으로 동일하므로 Figma 불일치 아님).
- 우측 `PartsIconOptional` 인스턴스는 8개 showX 전부 오버라이드 없이 기본값(true) 그대로 사용됨 — home과 달리 명시적 조합 지정이 없어 "고정 스펙"이 아니라 "마스터 컴포넌트 기본값을 노출한 전체 아이콘 예시 문서"로 판단. search 타입도 다른 타입처럼 showX 자유 조합 유지가 맞음.

## 정정 이력

2026-09-13: 최초 구현이 type=home(뒤로가기 있음, 로고 없음)과 type=search(Searchbar 없음, 좌측 완전히 빔)를 잘못 반영했던 것을 사용자 스크린샷 피드백으로 발견 → 위 실제 인스턴스 재조사 후 Header.tsx/.stories.tsx/.test.tsx 전면 수정.

## 교훈

Figma get_design_context로 뽑은 JSX에서, 컴포넌트 호출부에 prop이 "명시적으로 오버라이드"되어 있는지(예: `showHome={false}`) vs "그냥 기본값이라 안 적혀 있는지"를 구분하는 것이 강제 스펙인지 단순 예시인지 판단하는 핵심 단서였음. 같은 세트 내 다른 인스턴스(home vs search)를 비교하면 이 차이가 뚜렷하게 드러남.
