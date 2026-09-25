/**
 * 방향 인디케이터(DirectionIndicator) — 이전/다음 원형 버튼 + (선택) 가운데 카운트.
 *
 * Figma "또가3.0 Design System / DirectionIndicator" (문서 페이지 51405:99701, 메인
 * 컴포넌트 51405:102224) 와 1:1. `Swiper`(node 51405:132693)에 쓰이지만, 컴포넌트
 * 설명(`get_design_context` 재확인)에 "캐러셀 인디케이터는 캐러셀 컴포넌트 외에도
 * 콘텐츠를 넘겨야 하는 모든 영역에서 사용할 수 있다"고 명시돼 있어 독립 컴포넌트로 둔다.
 *
 * 원래 `Swiper.tsx` 내부에 인라인돼 있던 마크업을 그대로 분리한 것이며(주석상 예고된
 * 리팩토링), `Swiper` 는 이 컴포넌트를 합성해서 쓴다.
 *
 * 축(Figma prop → props):
 * - `countable`(boolean, 기본 true) — 가운데 `CountLabel` 영역 표시 여부. Figma 인스턴스
 *   데이터에서 확인된 실제 prop 으로, 최초 조사 요약에는 없었다(재조회로 발견). false 면
 *   버튼 2개만 남는다.
 * - 이전/다음 버튼(`_parts/DirectionButton`)은 `direction`(prev/next) × `state`
 *   (enable/hover/focus) 3-state 세트 — hover 는 `opacity-(--alpha-80)`, focus 는
 *   `opacity-(--alpha-60)` 로 이미 Swiper.tsx 단계에서 실측 검증됨(재검증 결과 동일).
 *
 * 가운데 카운트는 `CountLabel color="black" size="md"` 와 정확히 일치(Figma 상 라벨 색
 * `typo/neutral/subtle`, 크기 `font/size/sm`). Figma 원본은 이 영역에 `scale/70`(70px)
 * 고정폭이 바인딩돼 있지만(두 자리 숫자까지 버튼이 흔들리지 않게 하려는 의도 — 컴포넌트
 * 설명에도 명시), `CountLabel` 자체에는 폭 관련 스타일을 두지 않기로 이미 확정돼 있어
 * (Swiper.tsx 선례) 이 컴포넌트에서도 고정폭을 주지 않는다 — 자릿수가 늘어나면 폭도 함께
 * 자연스럽게 늘어난다.
 *
 * 버튼 `aria-label` 은 Figma 에 텍스트 노드가 없어 관례대로 "이전 슬라이드"/"다음
 * 슬라이드"를 기본값으로 정했다(Swiper 컨텍스트 기준 — 다른 컨텍스트에서 재사용 시
 * `prevLabel`/`nextLabel` 로 오버라이드).
 */

import { Icon } from "../../../icons";
import { CountLabel } from "../CountLabel";

export interface DirectionIndicatorProps {
  /** 현재 값(Figma `CountLabel.currentCount`). */
  currentCount: number;
  /** 총량(Figma `CountLabel.totalCount`). */
  totalCount: number;
  /** 단위 텍스트(Figma `CountLabel.unitValue`). 기본 'Unit' */
  unit?: string;
  /** 가운데 카운트 표시 여부(Figma `countable`). 기본 true */
  countable?: boolean;
  /** 이전 버튼 클릭 핸들러. */
  onPrev: () => void;
  /** 다음 버튼 클릭 핸들러. */
  onNext: () => void;
  /** 이전 버튼 aria-label. 기본 '이전 슬라이드' */
  prevLabel?: string;
  /** 다음 버튼 aria-label. 기본 '다음 슬라이드' */
  nextLabel?: string;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** 이전/다음 버튼 공통 클래스(원형 32×32, 이중 그림자 — `shadow-black-xs`). */
const DIRECTION_BUTTON_CLASS =
  "flex size-(--sz-32) shrink-0 items-center justify-center " +
  "rounded-circle border-xs border-solid border-border-neutral-bright " +
  "bg-bg-neutral-normal shadow-black-xs transition-opacity " +
  "hover:opacity-(--alpha-80) " +
  "focus-visible:opacity-(--alpha-60) focus-visible:outline-none";

export function DirectionIndicator({
  currentCount,
  totalCount,
  unit = "Unit",
  countable = true,
  onPrev,
  onNext,
  prevLabel = "이전 슬라이드",
  nextLabel = "다음 슬라이드",
  className,
}: DirectionIndicatorProps) {
  return (
    <div
      data-countable={countable}
      className={["flex shrink-0 items-center gap-(--sz-8)", className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        aria-label={prevLabel}
        onClick={onPrev}
        className={DIRECTION_BUTTON_CLASS}
      >
        <Icon
          name="chevron_left_line"
          size={16}
          className="text-icon-neutral-normal"
          aria-hidden
        />
      </button>

      {countable ? (
        <CountLabel
          color="black"
          size="md"
          currentCount={currentCount}
          totalCount={totalCount}
          unit={unit}
        />
      ) : null}

      <button
        type="button"
        aria-label={nextLabel}
        onClick={onNext}
        className={DIRECTION_BUTTON_CLASS}
      >
        <Icon
          name="chevron_right_line"
          size={16}
          className="text-icon-neutral-normal"
          aria-hidden
        />
      </button>
    </div>
  );
}
