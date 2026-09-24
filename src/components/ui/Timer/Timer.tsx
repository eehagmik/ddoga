/**
 * 카운트다운/카운트업 시간을 표시하는 순수 표시(presentational) 컴포넌트.
 *
 * Figma "또가3.0 Design System / Timer" (컴포넌트 세트 node 51405:152055) 와 1:1.
 * variant 축: `minutes`(boolean) × `type`(countdown/countup). `type` 은 시맨틱
 * 구분용 prop 일 뿐 — Figma 상 두 variant 의 시각적 차이가 없어 스타일 분기는 없다.
 *
 * - `seconds` 를 `minutes` 여부에 따라 `MM:SS` 또는 `SS` 로 포맷팅만 한다.
 * - 실제 카운트다운/카운트업 로직(`setInterval` 등)은 범위 밖 — 호출부(host) 책임이다.
 * - 음수 등 예외값에 대한 가드는 두지 않는다(호출부 책임).
 *
 * 토큰 매핑 (Figma 검증):
 * - 텍스트 색상 `typo/info/normal` → `text-typo-info-normal`
 * - 타이포그래피 `label-2` → `text-label-2` (합성 유틸: size + line-height + letter-spacing + weight)
 */

export type TimerType = "countdown" | "countup";

export interface TimerProps {
  /** 표시할 시간(초 단위) */
  seconds: number;
  /** true 면 `MM:SS`, false 면 `SS` 만 표시. 기본 true(Figma 기본 variant) */
  minutes?: boolean;
  /** 카운트다운/카운트업 시맨틱 구분용. 현재 시각적 차이 없음. 기본 'countdown' */
  type?: TimerType;
  /** 루트 요소에 병합할 클래스 */
  className?: string;
}

/** 공통 레이아웃·색·타이포 — Figma: typo/info/normal, label-2 */
const BASE_CLASS = "text-typo-info-normal text-label-2";

/** 2자리 zero-padding. */
function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** `minutes` 여부에 따라 `seconds` 를 `MM:SS` 또는 `SS` 문자열로 포맷팅한다. */
function formatTime(seconds: number, minutes: boolean): string {
  if (!minutes) {
    return pad2(seconds);
  }

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

export function Timer({
  seconds,
  minutes = true,
  type = "countdown",
  className,
}: TimerProps) {
  return (
    <span
      data-type={type}
      data-minutes={minutes}
      className={[BASE_CLASS, className].filter(Boolean).join(" ")}
    >
      {formatTime(seconds, minutes)}
    </span>
  );
}
