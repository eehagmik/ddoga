---
name: figma-directionindicator-chipindicator-components
description: Swiper에서 분리된 DirectionIndicator(51405:102224)/ChipIndicator(51405:102231) 컴포넌트 스펙 — CountLabel 합성, 발견된 숨은 variant 축
metadata:
  type: reference
---

Swiper(node 51405:132693) 내부에 인라인돼 있던 두 인디케이터를 독립 컴포넌트로 분리(2026-09-18). 부모 문서 페이지는 51405:99701("❖ Indicator").

- **DirectionIndicator**(51405:102224): 이전/다음 원형 버튼(`_parts/DirectionButton`, direction×state[enable/hover/focus] 3-state, `shadow-black-xs`) + 가운데 `CountLabel color="black" size="md"`. 사전 요약에는 없었지만 실제 인스턴스 데이터에 **`countable?: boolean`(기본 true)** prop이 존재 — false면 버튼 2개만 남고 CountLabel이 사라진다. 컴포넌트 설명에 "캐러셀 외에 콘텐츠를 넘겨야 하는 모든 영역에서 재사용 가능"이라 명시. Figma는 가운데 영역에 `scale/70` 고정폭이 바인딩돼 있지만(두 자리 숫자 흔들림 방지 의도), `CountLabel` 자체엔 폭 스타일을 두지 않기로 이미 확정된 선례(Swiper.tsx 시절 결정)를 그대로 유지 — 고정폭 없이 `whitespace-nowrap`만 사용.
- **ChipIndicator**(51405:102231): 반투명 배지(`bg-bg-overlay-blackDeep`, `rounded-2xl`, `px-[var(--sz-10)] py-[var(--sz-8)]`) 안에 라벨+"·"+`CountLabel color="white" size="md"`. 사전 요약에는 label/currentCount/totalCount/unit만 언급됐지만, 실제 컴포넌트 세트에 **`type: "default" | "onlyLabel" | "onlyCount"`** variant가 존재(재조회로 발견) — default는 라벨+·+카운트, onlyLabel은 라벨만, onlyCount는 카운트만. Swiper가 쓰는 조합은 항상 default.
- 두 컴포넌트 모두 [[figma-countlabel-component]](미작성 시 CountLabel.tsx 자체 문서 참고, node 51405:67676)의 `currentCount`/`totalCount`/`unit` props를 그대로 넘겨 합성한다 — 색/크기 조합(black·md, white·md)이 정확히 CountLabel의 기존 축과 일치해서 새 CountLabel 변형이 필요 없었다.
- `[[figma-swiper-component]]`(미작성 시 Swiper.tsx 자체 문서 참고, node 51405:132693)는 이 두 컴포넌트를 합성하도록 리팩토링 완료 — `indicator="direction"`이면 `swiperRef.current?.slidePrev()/slideNext()`를 `onPrev`/`onNext`로, `indicator="chip"`이면 `ChipIndicator`에 absolute 포지셔닝 클래스(`bottom-[var(--sz-10)] right-[var(--sz-10)] z-[2]`)를 className으로 얹어 배치. Swiper 자체의 `countable`/`type` 확장은 하지 않음(범위 밖, 항상 countable=true/type=default로 사용).
