/**
 * 카운트 배지(BadgeNumber).
 *
 * Figma "또가3.0 Design System / BadgeNumber" (node 51405:6924) 와 1:1.
 * 알림 수·장바구니 개수 등 카운트 정보를 아이콘 버튼 같은 host UI 요소 위에 겹쳐 표시하는
 * 작은 빨간 원형(pill) 배지다.
 *
 * - 배지 자체만 렌더한다. "우측 상단" 배치는 호출부(host) 책임 — `className` 으로 제어한다.
 * - `count` 가 `max` 를 초과하면 `` `${max}+` `` 형태로 축약한다 (Figma 원칙: 상한 초과 시 "99+").
 * - 색·크기·타이포는 전부 디자인 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

export interface BadgeNumberProps {
  /** 표시할 개수. 기본 0 */
  count?: number;
  /** 이 값을 초과하면 `${max}+` 로 축약 표시. 기본 99 */
  max?: number;
  /** 배지 크기. 연결되는 UI 요소 크기에 맞춰 선택. 기본 'xs' */
  size?: "xs" | "sm" | "md";
  /** 루트 요소에 전달할 클래스 (배치 등 host 제어용) */
  className?: string;
}

/** 공통 레이아웃·색·형태 — Figma: bg background/danger/normal, radius/circle, 좌우 padding scale/3 */
/**
 * 공통 레이아웃·색·형태 (Figma: bg background/danger/normal, radius/circle, 좌우 padding scale/3).
 * `font-feature-settings: "case" 1` — 기호(+)를 숫자 높이 중앙에 정렬. Figma 는 sm·md 에만 켰으나
 * 부작용 없는 옵션이라 사이즈 일관성을 위해 xs 포함 전 사이즈에 적용한다.
 */
const BASE_CLASS =
  "inline-flex items-center justify-center text-center rounded-circle " +
  "px-(--sz-3) bg-bg-danger-normal text-typo-inverse-normal " +
  "[font-feature-settings:var(--font-feature-case)]";

/**
 * 사이즈별 최소 정사각(1자리는 원, 2자리 이상은 좌우로 늘어난 pill) + 합성 타이포.
 * `text-label-*` 유틸은 size + line-height:1 + letter-spacing(-1%) + weight:500(Medium) 을 한 번에 적용.
 * md 의 Figma min-height 는 19px 이나 정사각 일관성을 위해 --sz-20 사용(1px 차, 육안 무영향).
 */
const SIZE_CLASS: Record<NonNullable<BadgeNumberProps["size"]>, string> = {
  xs: "min-w-(--sz-14) min-h-(--sz-14) text-label-3",
  sm: "min-w-(--sz-16) min-h-(--sz-16) text-label-2",
  md: "min-w-(--sz-20) min-h-(--sz-20) text-label-1",
};

export function BadgeNumber({
  count = 0,
  max = 99,
  size = "xs",
  className,
}: BadgeNumberProps) {
  const display = count > max ? `${max}+` : String(count);

  return (
    <span
      data-size={size}
      className={[BASE_CLASS, SIZE_CLASS[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      {display}
    </span>
  );
}
