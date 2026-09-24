/**
 * 딤(Dim) — 화면 배경 어둡게/밝게 오버레이.
 *
 * Figma "또가3.0 Design System / Dim" (문서 노드 51405:75457 / 스펙 스와치 51405:75506) 와 1:1.
 * 다이얼로그·모달·바텀시트 등 위에 아래 콘텐츠를 가리는 단순 배경 오버레이 아톰이다.
 * 텍스트·아이콘 슬롯이 없는 단일 `<div>` 이며 인터랙션 상태(hover/disabled/focus)도 없다.
 *
 * 구현:
 * - 루트는 `absolute inset-0` 을 기본으로 포함한다. 호출부가 `relative`(또는 `fixed`)
 *   컨테이너 역할을 하도록 설계했다 — Dim 자신은 위치를 스스로 고정(`fixed`)하지 않고,
 *   부모가 덮어야 할 영역(모달 래퍼 등)에 맞춰 크기를 채우기만 한다(사용자 확인된 결정).
 * - 색·투명도는 전부 semantic 토큰 유틸(`bg-bg-overlay-*`)만 사용한다 — 하드코딩 없음.
 *
 * variant → 토큰 매핑(Figma 스펙 스와치 4종):
 * | variant    | 토큰                                                    | 값(참고)          |
 * | normal(기본) | `bg-bg-overlay-blackNormal`                           | rgba(0,0,0,.4)   |
 * | dark       | `bg-bg-overlay-blackDark`                               | rgba(0,0,0,.8)   |
 * | gradient   | 위(`--color-bg-overlay-blackNone`)→아래(`--color-bg-overlay-blackDeep`) | rgba(0,0,0,0) → rgba(0,0,0,.6) |
 * | white      | `bg-bg-overlay-whiteDeep`                               | rgba(255,255,255,.6) |
 */

import type { HTMLAttributes } from "react";

export type DimVariant = "normal" | "dark" | "gradient" | "white";

export interface DimProps extends HTMLAttributes<HTMLDivElement> {
  /** 오버레이 톤/농도 축. 기본 'normal' */
  variant?: DimVariant;
}

/** variant 별 배경(단색 2종은 유틸 클래스, gradient 는 FixButton 선례와 동일한 arbitrary value 문법). */
const VARIANT_CLASS: Record<DimVariant, string> = {
  normal: "bg-bg-overlay-blackNormal",
  dark: "bg-bg-overlay-blackDark",
  gradient:
    "bg-[linear-gradient(to_bottom,var(--color-bg-overlay-blackNone),var(--color-bg-overlay-blackDeep))]",
  white: "bg-bg-overlay-whiteDeep",
};

/** 루트 공통 — 부모(relative/fixed 컨테이너) 전체를 채운다. */
const BASE_CLASS = "absolute inset-0";

export function Dim({ variant = "normal", className, ...rest }: DimProps) {
  return (
    <div
      data-variant={variant}
      className={[BASE_CLASS, VARIANT_CLASS[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
