/**
 * ClearButton — 입력 필드·이미지 업로드 아이템 등 "삭제 가능한 UI 요소" 우측에 붙어
 * 내용을 지우는 아이콘 버튼.
 *
 * Figma "또가3.0 Design System / ClearButton" (문서 node 51405:67427, 컴포넌트 세트
 * node 51405:67447) 와 1:1. 가이드 원칙: "IconButton 의 X버튼과 따로 구분한다" —
 * 그래서 별도 컴포넌트이며 글리프도 `x_circle_solid`(채운 원 + x)를 쓴다.
 * Chip 의 삭제 버튼(`x_close_solid`, 맨 x)과는 다른 아이콘이다.
 *
 * 축(Figma variant → props):
 * - `size` : xs(14) / sm(16) / md(18). 유일한 축이다.
 * - Figma 에 variant·color·state 축이 없다 → hover/pressed 스타일을 두지 않는다
 *   (TopButton 선례). focus 만 `focus-visible` 로 처리하고, disabled 는 네이티브
 *   `<button disabled>` 기본 동작(클릭 차단)에 맡긴다 — 별도 `disabled:` 유틸 없음.
 *
 * 배치는 호스트 책임이다. Figma 가이드상 대상 요소의 우측(우상단 또는 우중앙)에
 * 고정하며 좌측·하단에는 두지 않는다. 이 컴포넌트는 버튼 자체만 책임진다.
 *
 * 토큰 매핑 (Figma 검증):
 * | size | 박스(=아이콘) | 크기 토큰               | Icon size |
 * | xs   | 14×14        | size-(--sz-14)    | 14        |
 * | sm   | 16×16        | size-(--sz-16)    | 16        |
 * | md   | 18×18        | size-(--sz-18)    | 18        |
 * - 아이콘 색 `icon/neutral/bright` (= gray.300) → `text-icon-neutral-bright`
 * - focus 시 opacity `--alpha-60` → `focus-visible:opacity-(--alpha-60)`
 * - 배경·패딩·보더·radius 없음(원형은 글리프 자체 모양).
 *
 * 색을 바꿔야 하면(예: 어두운 썸네일 위) 호출부에서 `className` 으로 `text-icon-*`
 * 를 덮어쓴다 — 전용 tone prop 은 두지 않는다.
 */

import type { ButtonHTMLAttributes } from "react";

import { Icon } from "../../../icons";

export type ClearButtonSize = "xs" | "sm" | "md";

export interface ClearButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** 크기 축(Figma `size`). 기본 'xs' (Figma 기본 variant) */
  size?: ClearButtonSize;
  /** 접근성 라벨(`aria-label`). Figma 미정의라 코드에서 부여. 기본 '지우기' */
  label?: string;
  /** 루트 button 에 병합할 클래스 (배치·색 오버라이드용) */
  className?: string;
}

/**
 * 루트 공통 — 아이콘 중앙정렬 + 레이아웃에서 눌리지 않도록 shrink-0 + focus 처리.
 * `cursor-pointer` 로 클릭 가능함을 알린다(색/hover 스타일은 Figma 미정의라 두지 않음).
 */
const BASE_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center " +
  "text-icon-neutral-bright " +
  "focus-visible:opacity-(--alpha-60) focus-visible:outline-none";

/** size 별 정사각 크기 (Figma 검증: 14 / 16 / 18). */
const SIZE_CLASS: Record<ClearButtonSize, string> = {
  xs: "size-(--sz-14)",
  sm: "size-(--sz-16)",
  md: "size-(--sz-18)",
};

/** size 별 아이콘 px. */
const ICON_PX: Record<ClearButtonSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
};

export function ClearButton({
  size = "xs",
  label = "지우기",
  className,
  type = "button",
  ...rest
}: ClearButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      data-size={size}
      className={[BASE_CLASS, SIZE_CLASS[size], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Icon name="x_circle_solid" size={ICON_PX[size]} className="size-full" />
    </button>
  );
}
