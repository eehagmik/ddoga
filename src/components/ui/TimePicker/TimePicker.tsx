/**
 * TimePicker — `TimeField`(트리거) + `BottomSheet`(오버레이) + `TimeSelect`(휠 콘텐츠)를
 * 조합한 최상위 시간 선택 컴포넌트. `DatePicker`(`src/components/ui/DatePicker`)가
 * `DateField`+`BottomSheet`+`Calendar`를 조합하는 것과 동일한 오케스트레이션 원칙을
 * 그대로 따른다 — 이 컴포넌트 자체는 순수 조합/오케스트레이션 로직만 가지며 색·크기·
 * 간격은 전부 하위 컴포넌트(`TimeField`/`BottomSheet`/`TimeSelect`)에 위임한다.
 *
 * Figma "또가3.0 Design System" 문서 캔버스 51405:150988(`TimePicker` Guide) 와 대응 —
 * `TimeField` 를 클릭하면 `BottomSheet` 안에서 `TimeSelect` 3열 휠이 노출된다. Setting
 * 설명 "첫 진입 시 기본값은 현재 시간으로 선택되어 있다"(single) / "시작=현재 시각,
 * 종료=현재 시각+6시간"(range) 실측을 그대로 반영한다.
 *
 * 값 커밋 정책(DatePicker 와 동일 관행 — 라이브 커밋):
 * - `TimeSelect` 를 스크롤/클릭하는 즉시 부모 `onChange` 가 호출된다. 하단 `FixButton`
 *   ("확인")은 별도 커밋 로직 없이 시트를 닫기만 한다.
 * - **시트를 처음 열 때 값이 없으면 `now`(테스트 용이성을 위해 오버라이드 가능, 기본
 *   `new Date()`)를 12시간제로 변환한 기본값이 `TimeSelect` 에 표시됨과 동시에 즉시
 *   `onChange` 로 커밋된다** — Figma "첫 진입 시 기본값은 현재 시간으로 선택되어 있다"
 *   스펙을 "이미 유효한 값이 존재하는 상태"로 해석한 것(사용자 확정). 따라서 사용자가
 *   스크롤/클릭 없이 바로 "확인"을 눌러도 그 기본값이 그대로 반영된다.
 * - `primaryDisabled` 는 항상 `false` — 시트를 열면 이미 유효한 기본값이 존재하므로
 *   `DatePicker` 처럼 "값 없으면 비활성화" 할 필요가 없다(사용자 확정).
 *
 * `mode="range"`: `TimeField` 는 시작/종료 2개의 독립 필드를 렌더하지만(`TimeField`
 * 자체 스펙), 이 컴포넌트는 **시트 하나를 재사용**한다 — 내부 state `openField`
 * (`"single" | "start" | "end" | null`)로 어느 필드를 편집 중인지 추적해 시트 타이틀
 * (`startSheetTitle`/`endSheetTitle`)과 `TimeSelect` 에 넘길 값을 전환한다. 편집 중인
 * 필드만 갱신되고 다른 쪽은 현재 값을 그대로 유지한 채 `onChange(start, end)` 가
 * 호출된다.
 * - range 기본값 계산: 시작 필드에 값이 없으면 `now` 기준, 종료 필드에 값이 없으면
 *   "현재 유효한 시작값(방금 커밋된 것 포함)+6시간"(분은 그대로 유지, 시가 24시간제로
 *   넘어가면 자정을 랩어라운드해 12시간제/오전·오후를 재계산한다, 사용자 확정: "현재
 *   분 그대로 유지").
 * - 순서 검증(시작 > 종료) 로직은 넣지 않는다(사용자 확정 — Figma 가 자정을 넘나드는
 *   예시를 제시해 이런 제약이 없다고 판단됨).
 *
 * `disabled`/`readOnly` 는 `TimeField` 로 그대로 pass-through 한다 — 이미 `TimeField`
 * 에 구현된 로직이 트리거 클릭 자체를 막으므로(시트가 열리지 않으므로) 이 컴포넌트에서
 * 별도 처리가 필요 없다.
 *
 * `formatTime` 기본값은 `${meridiem} ${hour}:${분 2자리}`(예: "오전 9:05").
 */

import { useEffect, useState } from "react";

import { BottomSheet } from "../BottomSheet";
import { TimeField } from "../TimeField";
import type { TimeFieldVariant } from "../TimeField";
import { TimeSelect } from "../TimeSelect";
import type { TimeSelectMeridiem, TimeSelectValue } from "../TimeSelect";

export type TimePickerVariant = TimeFieldVariant;

interface TimePickerCommonProps {
  /** 시각 형태(`TimeField` 로 pass-through). 기본 'line' */
  variant?: TimePickerVariant;
  /** 비활성화 — 트리거 필드 자체가 비활성화되어 시트를 열 수 없다(`TimeField` pass-through) */
  disabled?: boolean;
  /** 읽기 전용 — 값 표시만 하고 클릭해도 시트가 열리지 않는다(`TimeField` pass-through) */
  readOnly?: boolean;
  /** 에러/경고 상태(`TimeField` pass-through) */
  danger?: boolean;
  /** 헬퍼 텍스트(`TimeField` pass-through) */
  helperText?: string;
  /** 하단 `FixButton` 라벨. 기본 "확인" */
  confirmLabel?: string;
  /** 값 → 표시 텍스트 포맷터. 기본 `${meridiem} ${hour}:${분 2자리}`(예: "오전 9:05") */
  formatTime?: (value: TimeSelectValue) => string;
  /** 기준 현재 시각(테스트 용이성). 기본 `new Date()` */
  now?: Date;
  /** 트리거 필드 루트에 병합할 클래스 */
  className?: string;
}

export interface TimePickerSingleProps extends TimePickerCommonProps {
  /** 단일 시간 선택(기본값) */
  mode?: "single";
  /** 상단 라벨 텍스트. 있을 때만 `Label` 렌더(`TimeField` pass-through) */
  label?: string;
  /** 선택된 시간(controlled) */
  value?: TimeSelectValue;
  /** 값이 바뀔 때(스크롤/클릭 라이브 커밋 + 시트를 처음 열 때 기본값 자동 커밋) 호출 */
  onChange?: (value: TimeSelectValue | undefined) => void;
  /** `BottomSheet` 타이틀. 기본 "시간 선택"(Figma 실측) */
  title?: string;
}

export interface TimePickerRangeProps extends TimePickerCommonProps {
  /** 기간 선택 */
  mode: "range";
  /** 시작 필드 라벨. 기본 "시작시간"(`TimeField` 기본값과 동일) */
  startLabel?: string;
  /** 종료 필드 라벨. 기본 "종료시간" */
  endLabel?: string;
  /** 선택된 시작 시간(controlled) */
  startValue?: TimeSelectValue;
  /** 선택된 종료 시간(controlled) */
  endValue?: TimeSelectValue;
  /** 편집 중인 필드만 갱신되어 호출(다른 쪽은 현재 값 유지) */
  onChange?: (
    start: TimeSelectValue | undefined,
    end: TimeSelectValue | undefined,
  ) => void;
  /**
   * 시작 필드 편집 시트 타이틀. 기본 `${startLabel} 선택`(예: "시작시간 선택"). range
   * 모드는 편집 중인 필드에 따라 시트 타이틀이 전환되므로 단일 `title` 대신 이 prop 을
   * 쓴다.
   */
  startSheetTitle?: string;
  /** 종료 필드 편집 시트 타이틀. 기본 `${endLabel} 선택`(예: "종료시간 선택") */
  endSheetTitle?: string;
}

export type TimePickerProps = TimePickerSingleProps | TimePickerRangeProps;

/** 현재 편집 중인 필드. `null` 이면 시트가 닫혀 있다. */
type OpenField = "single" | "start" | "end";

/** `formatTime` 기본 구현 — 예) "오전 9:05". */
function defaultFormatTime(value: TimeSelectValue): string {
  return `${value.meridiem} ${value.hour}:${String(value.minute).padStart(2, "0")}`;
}

/** `TimeSelectValue`(12시간제) → 24시간제 시(0~23). */
function to24Hour(value: TimeSelectValue): number {
  const hour = value.hour % 12; // 12 -> 0
  return value.meridiem === "오전" ? hour : hour + 12;
}

/** 24시간제 시(음수/24 이상 랩어라운드 허용) → 12시간제 `{meridiem, hour}`. */
function to12Hour(hour24: number): {
  meridiem: TimeSelectMeridiem;
  hour: number;
} {
  const normalized = ((hour24 % 24) + 24) % 24;
  const meridiem: TimeSelectMeridiem = normalized < 12 ? "오전" : "오후";
  const hour = normalized % 12 === 0 ? 12 : normalized % 12;
  return { meridiem, hour };
}

/** `Date`(24시간제) → `TimeSelectValue`(12시간제). 0시→오전 12시, 13시→오후 1시 등. */
function dateToTimeSelectValue(date: Date): TimeSelectValue {
  const { meridiem, hour } = to12Hour(date.getHours());
  return { meridiem, hour, minute: date.getMinutes() };
}

/**
 * `value` 에 시간을 더한다(분은 그대로 유지). 자정을 넘나들면 랩어라운드하여
 * 12시간제/오전·오후를 재계산한다(range 기본 종료값 = 시작값+6시간 계산용).
 */
function addHoursToTimeSelectValue(
  value: TimeSelectValue,
  hoursToAdd: number,
): TimeSelectValue {
  const { meridiem, hour } = to12Hour(to24Hour(value) + hoursToAdd);
  return { meridiem, hour, minute: value.minute };
}

export function TimePicker(props: TimePickerProps) {
  const {
    variant = "line",
    disabled = false,
    readOnly = false,
    danger = false,
    helperText,
    confirmLabel = "확인",
    formatTime = defaultFormatTime,
    now = new Date(),
    className,
  } = props;

  let label: string | undefined;
  let currentValue: TimeSelectValue | undefined;
  let currentStart: TimeSelectValue | undefined;
  let currentEnd: TimeSelectValue | undefined;
  let startLabel = "시작시간";
  let endLabel = "종료시간";
  let singleTitle = "시간 선택";
  let startSheetTitle = `${startLabel} 선택`;
  let endSheetTitle = `${endLabel} 선택`;

  if (props.mode === "range") {
    startLabel = props.startLabel ?? startLabel;
    endLabel = props.endLabel ?? endLabel;
    startSheetTitle = props.startSheetTitle ?? `${startLabel} 선택`;
    endSheetTitle = props.endSheetTitle ?? `${endLabel} 선택`;
    currentStart = props.startValue;
    currentEnd = props.endValue;
  } else {
    label = props.label;
    singleTitle = props.title ?? singleTitle;
    currentValue = props.value;
  }

  const [openField, setOpenField] = useState<OpenField | null>(null);
  const open = openField !== null;

  const defaultSingleValue = dateToTimeSelectValue(now);
  const defaultEndValue = addHoursToTimeSelectValue(
    currentStart ?? defaultSingleValue,
    6,
  );

  function commitSingle(next: TimeSelectValue) {
    if (props.mode === "range") return;
    props.onChange?.(next);
  }

  function commitRange(
    start: TimeSelectValue | undefined,
    end: TimeSelectValue | undefined,
  ) {
    if (props.mode !== "range") return;
    props.onChange?.(start, end);
  }

  // 시트를 처음 열 때 해당 필드에 값이 없으면 그 자리에서 계산한 기본값을 즉시
  // 커밋한다(Figma "첫 진입 시 기본값은 현재 시간" 스펙 — 이미 유효한 값으로 취급).
  useEffect(() => {
    if (openField === "single") {
      if (!currentValue) commitSingle(defaultSingleValue);
    } else if (openField === "start") {
      if (!currentStart) commitRange(defaultSingleValue, currentEnd);
    } else if (openField === "end") {
      if (!currentEnd) commitRange(currentStart, defaultEndValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openField]);

  function handleClose() {
    setOpenField(null);
  }

  function handleTimeSelectChange(next: TimeSelectValue) {
    if (openField === "single") {
      commitSingle(next);
    } else if (openField === "start") {
      commitRange(next, currentEnd);
    } else if (openField === "end") {
      commitRange(currentStart, next);
    }
  }

  const displayValue: TimeSelectValue =
    openField === "start"
      ? (currentStart ?? defaultSingleValue)
      : openField === "end"
        ? (currentEnd ?? defaultEndValue)
        : (currentValue ?? defaultSingleValue);

  const sheetTitle =
    openField === "start"
      ? startSheetTitle
      : openField === "end"
        ? endSheetTitle
        : singleTitle;

  const fieldProps =
    props.mode === "range"
      ? {
          mode: "range" as const,
          startLabel,
          endLabel,
          startValue: currentStart ? formatTime(currentStart) : undefined,
          endValue: currentEnd ? formatTime(currentEnd) : undefined,
          onStartClick: () => setOpenField("start"),
          onEndClick: () => setOpenField("end"),
        }
      : {
          mode: "single" as const,
          label,
          value: currentValue ? formatTime(currentValue) : undefined,
          onClick: () => setOpenField("single"),
        };

  return (
    <>
      <TimeField
        variant={variant}
        helperText={helperText}
        danger={danger}
        disabled={disabled}
        readOnly={readOnly}
        className={className}
        {...fieldProps}
      />

      <BottomSheet
        open={open}
        onClose={handleClose}
        title={sheetTitle}
        fixButton={{
          variant: "single",
          primaryLabel: confirmLabel,
          primaryDisabled: false,
          onPrimaryClick: handleClose,
        }}
      >
        <div className="h-[var(--sz-320)]">
          <TimeSelect value={displayValue} onChange={handleTimeSelectChange} />
        </div>
      </BottomSheet>
    </>
  );
}
