/**
 * 카운트 라벨(CountLabel) — "1 / 3 Unit" 형태의 값/총량 숫자 표시.
 *
 * Figma "또가3.0 Design System / CountLabel" (node 51405:67676, 6개 variant 조합)
 * 와 1:1. Swiper 의 DirectionIndicator/ChipIndicator 를 비롯해 값/총량을 숫자로
 * 보여줘야 하는 위치(스와이퍼 카운트, 인풋카운트 등)에서 재사용한다.
 *
 * 축(Figma variant → props):
 * - `color` : black(`text-typo-neutral-subtle`) / gray(`text-typo-neutral-light`) /
 *   white(`text-typo-inverse-normal`)
 * - `size`  : sm(전체 `--text-xs`) / md(전체 `--text-sm`, 단 `color="white"` 조합만
 *   unit 텍스트가 `--text-xs` 로 한 단계 작아지는 예외 — Figma 실측)
 *
 * 구조: `{currentCount} / {totalCount}` 숫자 그룹(size="md" 일 때만 내부 gap
 * `--sz-2`, size="sm" 은 밀착) + 조건부 `unit` 텍스트. 숫자 그룹과 unit 사이 gap 은
 * size 와 무관하게 항상 `--sz-2`.
 *
 * `min-width` 등 배치 관련 스타일은 이 컴포넌트의 책임이 아니라 호출부(예: Swiper 의
 * DirectionIndicator wrapper)가 담당한다 — Figma 원본 CountLabel 노드 자체에는
 * min-width 바인딩이 없다(`get_design_context` 재확인 완료).
 */

export type CountLabelColor = "black" | "gray" | "white";
export type CountLabelSize = "sm" | "md";

export interface CountLabelProps {
  /** 색상 축. 기본 'black' */
  color?: CountLabelColor;
  /** 크기 축. 기본 'md' */
  size?: CountLabelSize;
  /** 현재 값(Figma `currentCount`). */
  currentCount: number;
  /** 총량(Figma `totalCount`). */
  totalCount: number;
  /** 단위 텍스트(Figma `unitValue`). 빈 문자열/undefined 면 미렌더. 기본 'Unit' */
  unit?: string;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** color → 텍스트 색(Figma node 51405:67676 검증). */
const COLOR_CLASS: Record<CountLabelColor, string> = {
  black: "text-typo-neutral-subtle",
  gray: "text-typo-neutral-light",
  white: "text-typo-inverse-normal",
};

/** size → 값 그룹/단위 공통 텍스트 토큰(white·md 예외는 별도 처리). */
const SIZE_TEXT_CLASS: Record<CountLabelSize, string> = {
  sm: "text-[length:var(--text-xs)] tracking-[-0.14px]",
  md: "text-[length:var(--text-sm)] tracking-[-0.16px]",
};

/** `color="white" & size="md"` 예외에서 unit 이 한 단계 작아질 때 쓰는 텍스트 토큰. */
const XS_TEXT_CLASS = "text-[length:var(--text-xs)] tracking-[-0.14px]";

/** size → 값 그룹(값+구분자+값) 내부 gap. md 만 2px, sm 은 밀착(Figma 실측). */
const VALUE_GAP: Record<CountLabelSize, string> = {
  sm: "",
  md: "gap-[var(--sz-2)]",
};

/** 값/구분자/단위 공통 — 줄바꿈 방지 + 숫자 케이스 폰트 피처. */
const TEXT_BASE =
  "whitespace-nowrap [font-feature-settings:var(--font-feature-case)]";

export function CountLabel({
  color = "black",
  size = "md",
  currentCount,
  totalCount,
  unit = "Unit",
  className,
}: CountLabelProps) {
  const unitTextClass =
    color === "white" && size === "md" ? XS_TEXT_CLASS : SIZE_TEXT_CLASS[size];

  return (
    <span
      data-color={color}
      data-size={size}
      aria-live="polite"
      className={[
        "inline-flex items-center gap-[var(--sz-2)] font-medium leading-none",
        COLOR_CLASS[color],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[
          "inline-flex items-center",
          VALUE_GAP[size],
          SIZE_TEXT_CLASS[size],
          TEXT_BASE,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span>{currentCount}</span>
        <span>/</span>
        <span>{totalCount}</span>
      </span>
      {unit ? (
        <span className={[unitTextClass, TEXT_BASE].filter(Boolean).join(" ")}>
          {unit}
        </span>
      ) : null}
    </span>
  );
}
