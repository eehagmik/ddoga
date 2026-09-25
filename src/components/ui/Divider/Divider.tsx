/**
 * 디바이더(Divider).
 *
 * Figma "또가3.0 Design System / Divider" (node 51405:75932) 와 1:1.
 * 콘텐츠 블록·섹션을 구분하는 프리미티브 선이다. 라벨·아이콘 없이 선만 그린다.
 *
 * - `orientation`(방향) × `thickness`(두께) 조합만 존재한다. hover·pressed·disabled 상태 없음.
 * - 색은 `--color-bg-overlay-blackSubtle`(Figma `background/overlay/blackSubtle`) 토큰만 사용한다 — 하드코딩 없음.
 * - 두께는 `--sz-1`(thin, 1px) · `--sz-8`(thick, 8px) 토큰으로 지정한다.
 * - Figma 는 가로 360px · 세로 32px 고정 프레임이나, 코드 루트는 부모에 맞춰
 *   `w-full`(horizontal) · `h-full`(vertical) 로 유동 처리한다.
 */

type Orientation = "horizontal" | "vertical";
type Thickness = "thin" | "thick";

export interface DividerProps {
  /** 선 방향. 기본 'horizontal' */
  orientation?: Orientation;
  /** 선 두께. thin=1px, thick=8px. 기본 'thin' */
  thickness?: Thickness;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** 공통 스타일 — flex 컨테이너에서 눌리지 않도록 `shrink-0`, 색은 overlay 토큰. */
const BASE_CLASS = "shrink-0 bg-bg-overlay-blackSubtle";

/** `orientation` 별 주축(길이) 클래스 — 부모에 맞춰 늘어난다. */
const MAIN_CLASS: Record<Orientation, string> = {
  horizontal: "w-full",
  vertical: "h-full",
};

/** `orientation` × `thickness` 별 교차축(두께) 클래스. */
const CROSS_CLASS: Record<Orientation, Record<Thickness, string>> = {
  horizontal: {
    thin: "h-(--sz-1)",
    thick: "h-(--sz-8)",
  },
  vertical: {
    thin: "w-(--sz-1)",
    thick: "w-(--sz-8)",
  },
};

export function Divider({
  orientation = "horizontal",
  thickness = "thin",
  className,
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      data-orientation={orientation}
      data-thickness={thickness}
      className={[
        BASE_CLASS,
        MAIN_CLASS[orientation],
        CROSS_CLASS[orientation][thickness],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
