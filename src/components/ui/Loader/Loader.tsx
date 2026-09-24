/**
 * 로딩 인디케이터(Loader).
 *
 * Figma "또가3.0 Design System / Loader" (node 51405:114633) 를 근사 재현.
 * 서버 응답 대기 · 당겨서 새로고침 · 무한 스크롤 등 로딩 상태를 알리는 순수 시각 인디케이터다.
 * 기존 CSS border 스피너 관용구(animate-spin + border ring + border-t-* 강조)를 컴포넌트로 승격한 것으로,
 * Figma 의 SVG path 를 정밀 재현하지 않고 두께·색상·회전만 반영한다.
 *
 * - 트랙 링(4변 전체, 연한 색 + alpha-20) 위에 인디케이터 호(top 1변만 진한 색 + 회전)를 겹친 2레이어 구조다.
 * - 회전은 Tailwind `animate-spin` 기본값(1s linear infinite)이 Figma 스펙과 일치한다.
 * - `motion-reduce:animate-none` 으로 감속 모션 선호 설정을 존중한다.
 * - `role="status"` + `aria-label` 로 스크린리더에 로딩 상태를 알린다.
 * - 색·크기·두께·투명도는 전부 디자인 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 *
 * 토큰 매핑:
 * - 크기  sm → `size-[var(--sz-28)]` (28), md → `size-[var(--sz-50)]` (50)
 *         Figma 의 수동 리사이즈 값을 프리셋으로 고정한 것.
 * - 두께  Figma 의 "지름 10%" 를 기존 border-width 토큰으로 근사
 *         sm → `border-md` (--border-width-md = 3px), md → `border-lg` (--border-width-lg = 4px)
 * - 트랙 색  brand → `border-border-brand-subtle`, white → `border-border-inverse-dark`
 *           Figma 트랙색 #58D7B0 의 정확한 토큰이 없어 border/brand/subtle + alpha-20 으로 근사.
 * - 강조 색  brand → `border-t-border-brand-normal`, white → `border-t-border-inverse-dark`
 * - 투명도  트랙 `opacity-[var(--alpha-20)]`
 * - radius `rounded-circle` (radius/circle)
 *
 * `color="white"` 는 어두운 배경 위에서만 사용한다.
 */

export type LoaderColor = "brand" | "white";
export type LoaderSize = "sm" | "md";

export interface LoaderProps {
  /** 색상 축. 어두운 배경 위에서만 'white'. 기본 'brand' */
  color?: LoaderColor;
  /** 크기 축. sm=28px, md=50px. 기본 'md' */
  size?: LoaderSize;
  /** 스크린리더용 라벨. 기본 '로딩 중' */
  label?: string;
  /** 루트에 전달할 클래스 */
  className?: string;
}

/** 루트 공통 형태 — 2레이어를 겹치기 위한 relative, 레이아웃에서 축소 방지 */
const BASE_CLASS = "relative inline-block shrink-0";

/** 사이즈별 고정 정사각 (Figma 수동 리사이즈 프리셋) */
const SIZE_CLASS: Record<LoaderSize, string> = {
  sm: "size-[var(--sz-28)]",
  md: "size-[var(--sz-50)]",
};

/** 두께 (Figma "지름 10%" 를 border-width 토큰으로 근사) */
const THICKNESS_CLASS: Record<LoaderSize, string> = {
  sm: "border-md", // --border-width-md = 3px
  md: "border-lg", // --border-width-lg = 4px
};

/** 트랙 링 색 (4변 전체, alpha-20 과 함께 사용) */
const TRACK_COLOR: Record<LoaderColor, string> = {
  brand: "border-border-brand-subtle",
  white: "border-border-inverse-dark",
};

/** 인디케이터 호 색 (top 1변만) */
const INDICATOR_COLOR: Record<LoaderColor, string> = {
  brand: "border-t-border-brand-normal",
  white: "border-t-border-inverse-dark",
};

export function Loader({
  color = "brand",
  size = "md",
  label = "로딩 중",
  className,
}: LoaderProps) {
  return (
    <span
      role="status"
      aria-label={label}
      data-color={color}
      data-size={size}
      className={[BASE_CLASS, SIZE_CLASS[size], className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 트랙: 4변 전체, 연한 색 + opacity 20% */}
      <span
        className={[
          "absolute inset-0 rounded-circle border-solid",
          THICKNESS_CLASS[size],
          TRACK_COLOR[color],
          "opacity-[var(--alpha-20)]",
        ].join(" ")}
      />
      {/* 인디케이터: 투명 링에 top 1변만 진한 색 + 회전 */}
      <span
        className={[
          "absolute inset-0 rounded-circle border-solid border-transparent animate-spin motion-reduce:animate-none",
          THICKNESS_CLASS[size],
          INDICATOR_COLOR[color],
        ].join(" ")}
      />
    </span>
  );
}
