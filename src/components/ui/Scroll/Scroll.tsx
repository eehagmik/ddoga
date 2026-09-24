/**
 * 스크롤(Scroll) — 스크롤 가능한 영역에 공통 적용하는 네이티브 스크롤 래퍼.
 *
 * Figma "또가3.0 Design System / Scroll" (문서 페이지 51405:130393 / 메인 컴포넌트 51405:130405,
 * vertical 51405:130406 / horizontal 51405:130408) 참고. Figma 노드 자체에 개발자 주석이 있다:
 *
 *   "Scroll은 Text Area 등의 스크롤 존재 여부를 위해 제작된 것으로, 개발 시 디자인 커스텀하지
 *    않고 OS의 기본 스크롤로 적용합니다."
 *
 * 즉 Figma 의 pill 모양 트랙/썸(두께 2px, radius 999px)은 "div 기반 커스텀 스크롤바"를 만들라는
 * 스펙이 아니라 "네이티브 브라우저 스크롤바를 그 색상 톤으로 스타일링하라"는 의도다(사용자 확인된
 * 결정). 그래서 이 컴포넌트는 `overflow-y-auto`/`overflow-x-auto` 네이티브 스크롤 동작은 그대로
 * 두고, `scrollbar-width`/`scrollbar-color`(표준, Firefox·최신 Chromium/Safari) +
 * `::-webkit-scrollbar*`(구형 WebKit/Chromium 대응) 로 트랙/썸 색상만 토큰으로 오버라이드한다.
 * 커스텀 드래그/썸 포지셔닝 로직은 없다 — 스크롤 동작 자체는 100% OS/브라우저 네이티브다.
 *
 * Figma 의 vertical/horizontal 은 "커스텀 스크롤바가 어느 방향으로 놓이는지"를 보여주는 예시일
 * 뿐 별도 컴포넌트 구조가 아니므로, 코드에서는 `axis`('y'|'x') prop 으로 대체해 컨테이너의
 * overflow 축을 고른다.
 *
 * 토큰 매핑(Figma 실측):
 * | Figma                              | 토큰 유틸/값                                  |
 * | 트랙 `background/overlay/greenGraySubtle` | `bg-bg-overlay-greenGraySubtle`         |
 * | 썸 `background/overlay/greenGrayDeep`     | `bg-bg-overlay-greenGrayDeep`           |
 * | `radius/circle` (999px)            | `rounded-circle`                              |
 * | `scale/2` (2px, 두께)               | `var(--sz-2)` — `scrollbar-width: thin` 은
 *   브라우저별 최소 두께 제약이 있어 2px 는 목표치일 뿐 강제되지 않는다. 표준
 *   `::-webkit-scrollbar` 치수는 `var(--sz-2)` 로 근접시킨다.
 *
 * 주의: `scrollbar-color` 단축 속성의 값 순서는 `<thumb-color> <track-color>` 다(스펙 순서,
 * 반대로 쓰면 트랙/썸 색이 뒤바뀐다).
 *
 * `Dim`(자식 슬롯 없는 단일 `<div>` 아톰) 과 동일한 형태 — `HTMLAttributes<HTMLDivElement>` 를
 * 그대로 확장해 `children`/`onScroll`/`id` 등은 `...rest` 로 전달한다. ref forwarding 은 v1 에서
 * 제공하지 않는다(프로젝트 내 전례 없음 — 필요해지면 비파괴적으로 추가 가능).
 */

import type { HTMLAttributes } from "react";

export type ScrollAxis = "y" | "x";

export interface ScrollProps extends HTMLAttributes<HTMLDivElement> {
  /** 스크롤 축. 기본 'y' */
  axis?: ScrollAxis;
}

/** axis 별 네이티브 overflow 축. */
const AXIS_CLASS: Record<ScrollAxis, string> = {
  y: "overflow-y-auto",
  x: "overflow-x-auto",
};

/**
 * 네이티브 스크롤바 색상 트리트먼트. `scrollbar-color` 는 `<thumb> <track>` 순서.
 * `::-webkit-scrollbar*` 는 표준 속성을 지원하지 않는 구형 WebKit/Chromium 대응.
 */
const SCROLLBAR_CLASS =
  "[scrollbar-width:thin] " +
  "[scrollbar-color:var(--color-bg-overlay-greenGrayDeep)_var(--color-bg-overlay-greenGraySubtle)] " +
  "[&::-webkit-scrollbar]:size-[var(--sz-2)] " +
  "[&::-webkit-scrollbar-track]:bg-bg-overlay-greenGraySubtle " +
  "[&::-webkit-scrollbar-track]:rounded-circle " +
  "[&::-webkit-scrollbar-thumb]:bg-bg-overlay-greenGrayDeep " +
  "[&::-webkit-scrollbar-thumb]:rounded-circle";

export function Scroll({ axis = "y", className, ...rest }: ScrollProps) {
  return (
    <div
      data-axis={axis}
      className={[AXIS_CLASS[axis], SCROLLBAR_CLASS, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
