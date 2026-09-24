/**
 * 스테퍼(Stepper) — 다단계 플로우(온보딩·설문 등)의 진행률을 보여주는 얇은 선형 바.
 *
 * Figma "또가3.0 Design System / Stepper" (node 51405:132387, 내부 원자
 * `_parts/StepBar` node 51405:132361) 와 1:1. 완료/진행중/대기 상태를 스텝별로
 * 표시하는 원형 스텝 UI가 아니라, 트랙 위를 브랜드색 인디케이터가 좌→우로
 * 채워나가는 단일 progress bar 다. Figma 는 `percent`(0/25/50/75/100) 축만
 * variant 로 노출하지만, 실사용성을 위해 코드에서는 `currentStep`/`totalSteps`
 * 를 받아 내부에서 percent 를 계산한다(값 전환은 `transition-[width]` 로 부드럽게
 * 슬라이드 — Figma "Animation" 설명 반영).
 *
 * `currentStep` 은 "완료한 단계 수"를 뜻한다(0 = 아직 시작 전, `totalSteps` = 전부
 * 완료). 예를 들어 총 4단계 중 2단계까지 마쳤다면 `currentStep=2` → 50%.
 *
 * 색상(Figma node 51405:132361 검증):
 * - 트랙: `bg-bg-brandGrayish-deep`, 전체 폭, 높이 `--sz-2`(2px).
 * - 인디케이터: `bg-bg-brand-subtle`, 우측만 `rounded-circle`(100% 채워지면 4모서리 전부).
 *
 * Figma 는 size/방향(세로) variant 를 제공하지 않는다 — 가로 단일 형태만 존재.
 */

export interface StepperProps {
  /** 완료한 단계 수(0 ~ totalSteps). */
  currentStep: number;
  /** 총 단계 수. */
  totalSteps: number;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** 트랙 — 전체 폭 · 고정 높이 · 넘치는 인디케이터 클립. */
const TRACK_CLASS =
  "relative w-full h-[var(--sz-2)] overflow-hidden bg-bg-brandGrayish-deep";

/** 인디케이터 — 좌측 고정, 폭만 percent 로 전이. */
const INDICATOR_CLASS =
  "absolute inset-y-0 left-0 bg-bg-brand-subtle " +
  "transition-[width] duration-300 ease-in-out motion-reduce:transition-none";

export function Stepper({ currentStep, totalSteps, className }: StepperProps) {
  const percent =
    totalSteps > 0
      ? Math.min(100, Math.max(0, (currentStep / totalSteps) * 100))
      : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      data-percent={percent}
      className={[TRACK_CLASS, className].filter(Boolean).join(" ")}
    >
      <div
        className={[
          INDICATOR_CLASS,
          percent >= 100 ? "rounded-circle" : "rounded-r-circle",
        ].join(" ")}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
