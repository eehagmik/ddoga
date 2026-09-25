/**
 * 칩 인디케이터(ChipIndicator) — 콘텐츠 우하단에 얹는 반투명 배지형 카운트 표시.
 *
 * Figma "또가3.0 Design System / ChipIndicator" (문서 페이지 51405:99701, 메인 컴포넌트
 * 51405:102231) 와 1:1. 원래 `Swiper.tsx` 내부에 인라인돼 있던 마크업을 그대로 분리한
 * 것이며(주석상 예고된 리팩토링), `Swiper` 는 이 컴포넌트를 합성해서 쓴다.
 *
 * 축(Figma variant → props):
 * - `type` : default(라벨 + "·" + 카운트) / onlyLabel(라벨만) / onlyCount(카운트만) —
 *   실제 컴포넌트 세트에 존재하는 variant 로, 최초 조사 요약에는 없었다(재조회로 발견,
 *   `label`/`currentCount`+`totalCount`+`unit` 만 있는 걸로 요약됐던 부분 정정). 기본은
 *   Swiper 가 쓰는 `default`.
 *
 * 카운트 영역은 `CountLabel color="white" size="md"` 와 정확히 일치(Figma 상 라벨 색
 * `typo/inverse/normal`, 값 `font/size/sm` + unit `font/size/xs` 예외가 이미 `CountLabel`
 * 자체에 구현돼 있다). "·" 구분자는 `type="default"` 일 때만 렌더한다.
 *
 * 배경 `bg-bg-overlay-blackDeep`(`background/overlay/blackDeep`, alpha 60%), radius
 * `rounded-2xl`, 패딩 `px-(--sz-10) py-(--sz-8)` — Swiper.tsx 단계에서 실측
 * 검증된 값과 재조회 결과 동일. Label 과 CountLabel 사이 gap 은 `--sz-2`.
 */

import { CountLabel } from "../CountLabel";

export type ChipIndicatorType = "default" | "onlyLabel" | "onlyCount";

export interface ChipIndicatorProps {
  /** 표시 조합 축(Figma `type`). 기본 'default' */
  type?: ChipIndicatorType;
  /** 라벨 텍스트(Figma `labelValue`). `type`이 'default'/'onlyLabel' 일 때만 렌더. 기본 'Label' */
  label?: string;
  /** 현재 값(Figma `CountLabel.currentCount`). */
  currentCount: number;
  /** 총량(Figma `CountLabel.totalCount`). */
  totalCount: number;
  /** 단위 텍스트(Figma `CountLabel.unitValue`). `type`이 'default'/'onlyCount' 일 때만 렌더. 기본 'Unit' */
  unit?: string;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** label/"·" 공통 텍스트 클래스 — `CountLabel` 값 그룹과 동일한 `--text-sm`. */
const SEPARATOR_TEXT_CLASS =
  "whitespace-nowrap text-[length:var(--text-sm)] tracking-[-0.16px] " +
  "[font-feature-settings:var(--font-feature-case)]";

export function ChipIndicator({
  type = "default",
  label = "Label",
  currentCount,
  totalCount,
  unit = "Unit",
  className,
}: ChipIndicatorProps) {
  const showLabel = type === "default" || type === "onlyLabel";
  const showCount = type === "default" || type === "onlyCount";

  return (
    <div
      data-type={type}
      className={[
        "flex items-center justify-center gap-(--sz-2) whitespace-nowrap",
        "rounded-2xl bg-bg-overlay-blackDeep px-(--sz-10) py-(--sz-8)",
        "font-medium leading-none text-typo-inverse-normal",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showLabel ? <p className={SEPARATOR_TEXT_CLASS}>{label}</p> : null}
      {type === "default" ? <p className={SEPARATOR_TEXT_CLASS}>·</p> : null}
      {showCount ? (
        <CountLabel
          color="white"
          size="md"
          currentCount={currentCount}
          totalCount={totalCount}
          unit={unit}
        />
      ) : null}
    </div>
  );
}
