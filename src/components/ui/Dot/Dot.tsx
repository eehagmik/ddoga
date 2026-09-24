/**
 * 상태 점(Dot).
 *
 * Figma "또도가 3.0 Design System / Dot" (node 51405:83355) 와 1:1.
 * 새로운 알림·업데이트·미확인 상태를 나타내는 순수 시각 인디케이터(작은 원형 점)다.
 * 벨 아이콘 등 host UI 요소의 우측 상단에 오버레이로 얹어 쓴다.
 *
 * - 점만 렌더한다. "우측 상단" 등 배치는 호출부(host) 책임 — `className` 으로 제어한다.
 * - 텍스트·아이콘·자식·인터랙션 상태가 없다. `<span>` 하나만 렌더한다.
 * - 완전 원형·고정 정사각. `isBorder=true` 일 때만 1px 흰색 외곽선을 크기 변화 없이 위에 덧그린다.
 * - 색·크기·형태는 전부 디자인 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 *
 * 토큰 매핑:
 * - 크기  xs → `size-[var(--sz-6)]`, sm → `size-[var(--sz-8)]`, md → `size-[var(--sz-10)]`
 * - 색상  red → `bg-bg-danger-normal` (background/danger/normal)
 *         brand → `bg-bg-brand-normal` (background/brand/normal)
 * - 테두리 `border-xs border-solid border-border-inverse-dark` (border-width/xs, border/inverse/dark)
 * - radius `rounded-circle` (radius/circle)
 */

export interface DotProps {
  /** 점 크기. 연결되는 UI 요소 크기에 맞춰 선택. 기본 'xs' */
  size?: "xs" | "sm" | "md";
  /** 점 색상. 기본 'red' */
  color?: "red" | "brand";
  /** 1px 흰색 외곽선 표시 여부(크기 불변, 위에 덧그림). 기본 false */
  isBorder?: boolean;
  /** 루트 요소에 전달할 클래스 (배치 등 host 제어용) */
  className?: string;
}

/** 공통 형태 — 완전 원형·고정 정사각, 레이아웃에서 축소 방지 */
const BASE_CLASS = "inline-block shrink-0 rounded-circle";

/** 사이즈별 고정 정사각 (Figma: size/6·8·10) */
const SIZE_CLASS: Record<NonNullable<DotProps["size"]>, string> = {
  xs: "size-[var(--sz-6)]",
  sm: "size-[var(--sz-8)]",
  md: "size-[var(--sz-10)]",
};

/** 색상별 배경 (Figma: background/danger·brand normal) */
const COLOR_CLASS: Record<NonNullable<DotProps["color"]>, string> = {
  red: "bg-bg-danger-normal",
  brand: "bg-bg-brand-normal",
};

/** isBorder 시 1px 흰색 외곽선 (border-width/xs, border/inverse/dark) */
const BORDER_CLASS = "border-xs border-solid border-border-inverse-dark";

export function Dot({
  size = "xs",
  color = "red",
  isBorder = false,
  className,
}: DotProps) {
  return (
    <span
      data-size={size}
      data-color={color}
      data-border={isBorder}
      className={[
        BASE_CLASS,
        SIZE_CLASS[size],
        COLOR_CLASS[color],
        isBorder && BORDER_CLASS,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
