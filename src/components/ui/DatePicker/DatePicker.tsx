/**
 * DatePicker — `DateField`(트리거) + `BottomSheet`(오버레이) + `Calendar`(본문) +
 * `YearMonthSelect`(년/월 전환 슬롯)를 조합한 최상위 날짜 선택 컴포넌트.
 *
 * Figma "또가3.0 Design System" 캔버스 51405:73725 의 Guide 프레임(51405:73921) phone
 * 목업(`_DatePicker/false/-/true` 인스턴스) 과 대응 — `DateField` 를 클릭하면
 * `BottomSheet` 안에서 `Calendar` 가 노출되고, `Calendar` 헤더의 YearMonthButton 을
 * 누르면 이전/다음 달 이동 버튼이 사라지고 그 자리에 `YearMonthSelect` 가 나타난다
 * (`Calendar` 의 `yearMonthSlot`/`isYearMonthOpen` 확장, `src/components/ui/Calendar`).
 *
 * 이 컴포넌트 자체는 순수 조합/오케스트레이션 로직만 갖고 별도 시각 스타일을 새로
 * 정의하지 않는다 — 색·크기·간격은 전부 하위 컴포넌트(`DateField`/`BottomSheet`/
 * `Calendar`/`YearMonthSelect`)에 위임한다.
 *
 * 값 커밋 정책(Guide "오늘보다 과거 날짜를 비활성화 할 수 있습니다" 등 명시 스펙 기반,
 * 표준 모바일 날짜선택 관행으로 확정):
 * - 날짜를 클릭하는 즉시 부모 `onChange` 가 호출된다(라이브 커밋). 하단 `FixButton`
 *   ("확인")은 별도 값 커밋 로직을 갖지 않고 화면 전환/닫기만 담당한다.
 * - `mode="range"` 에서 시작일만 찍힌 채로 시트를 닫아도 그 상태가 그대로 유지된다
 *   (별도 초기화 없음) — 다시 열면 이어서 종료일을 선택할 수 있다.
 * - `primaryDisabled`: `mode="single"` 이면 현재 선택값이 없을 때, `mode="range"` 이면
 *   시작·종료가 둘 다 없을 때만 true(표준 관행 — 시작일만 있어도 확인 가능). 단
 *   `isYearMonthOpen` 이면 날짜 선택 여부와 무관하게 항상 활성화된다(아래).
 * - **`isYearMonthOpen`(년/월 휠이 열린 상태)일 때 "확인"을 누르면 시트가 닫히지
 *   않고 `YearMonthSelect` 에서 고른 연/월이 반영된 `Calendar` 그리드로만 복귀한다**
 *   (`handlePrimaryClick`). 시트를 완전히 닫는 동작은 `isYearMonthOpen=false`
 *   (평소 `Calendar` 그리드 화면)일 때만 일어난다.
 *
 * `disablePastDates`(기본 true): `Calendar` 의 `minDate` 로 `today` 자정을 전달해 과거
 * 날짜를 비활성화한다. `today` 는 테스트 용이성을 위해 오버라이드 가능(기본
 * `new Date()`).
 *
 * 표시 중인 연/월(내부 state): 최초 마운트 시 `value`/`startValue` 가 있으면 그 연/월,
 * 없으면 `today` 의 연/월로 초기화한다. 이후 시트를 다시 열 때마다(`open` 이
 * true 로 전환될 때) 현재 선택값의 연/월로 다시 점프한다(연/월을 탐색하다 닫아도
 * 다음에 열면 항상 선택값 기준으로 돌아오는 표준 관행) — 값이 없으면 마지막으로
 * 탐색하던 연/월을 그대로 유지한다.
 *
 * `formatDate` 기본값은 `YY.MM.DD`(`DateField` 기존 placeholder 포맷과 통일).
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { BottomSheet } from "../BottomSheet";
import { Calendar } from "../Calendar";
import type { CalendarMode } from "../Calendar";
import { DateField } from "../DateField";
import type { DateFieldVariant } from "../DateField";
import { YearMonthSelect } from "../YearMonthSelect";
import type { YearMonthSelectValue } from "../YearMonthSelect";

export type DatePickerVariant = DateFieldVariant;

interface DatePickerCommonProps {
  /** 시각 형태(`DateField` 로 pass-through). 기본 'line' */
  variant?: DatePickerVariant;
  /** 라벨 텍스트. 있을 때만 `Label` 렌더(`DateField` pass-through) */
  label?: string;
  /** 헬퍼 텍스트(`DateField` pass-through) */
  helperText?: string;
  /** 에러/경고 상태(`DateField` pass-through) */
  danger?: boolean;
  /** 비활성화 — 트리거 필드 자체가 비활성화되어 시트를 열 수 없다(`DateField` pass-through) */
  disabled?: boolean;
  /** 읽기 전용 — 값 표시만 하고 클릭해도 시트가 열리지 않는다(`DateField` pass-through) */
  readOnly?: boolean;
  /** `BottomSheet` 타이틀. 기본 "날짜선택" */
  title?: string;
  /** 하단 `FixButton` 라벨. 기본 "확인" */
  confirmLabel?: string;
  /** 값 → 표시 텍스트 포맷터. 기본 `YY.MM.DD`(점 구분, 2자리 연도) */
  formatDate?: (date: Date) => string;
  /** 오늘보다 이전 날짜를 비활성화할지 여부. 기본 true */
  disablePastDates?: boolean;
  /** `YearMonthSelect` 연도 열 최소값(위임) */
  minYear?: number;
  /** `YearMonthSelect` 연도 열 최대값(위임) */
  maxYear?: number;
  /** 오늘 날짜(테스트 용이성). 기본 `new Date()` */
  today?: Date;
  /** 트리거 필드 루트에 병합할 클래스 */
  className?: string;
}

export interface DatePickerSingleProps extends DatePickerCommonProps {
  /** 단일 날짜 선택(기본값) */
  mode?: "single";
  /** 선택된 날짜(controlled) */
  value?: Date;
  /** 날짜 클릭 시 즉시 호출(라이브 커밋) */
  onChange?: (date: Date | undefined) => void;
}

export interface DatePickerRangeProps extends DatePickerCommonProps {
  /** 기간 선택 */
  mode: "range";
  /** 선택된 시작일(controlled) */
  startValue?: Date;
  /** 선택된 종료일(controlled) */
  endValue?: Date;
  /** 날짜 클릭 시 즉시 호출(라이브 커밋). 시작일만 찍혔으면 end 는 undefined */
  onChange?: (start: Date | undefined, end: Date | undefined) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

/** `formatDate` 기본 구현 — `YY.MM.DD`(`DateField` placeholder 관례와 동일 톤). */
function defaultFormatDate(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

/** 자정으로 정규화한 날짜(시간 성분 제거). */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DatePicker(props: DatePickerProps) {
  const {
    variant = "line",
    label,
    helperText,
    danger = false,
    disabled = false,
    readOnly = false,
    title = "날짜선택",
    confirmLabel = "확인",
    formatDate = defaultFormatDate,
    disablePastDates = true,
    minYear,
    maxYear,
    today = new Date(),
    className,
  } = props;

  const mode: CalendarMode = props.mode ?? "single";

  let currentValue: Date | undefined;
  let currentStart: Date | undefined;
  let currentEnd: Date | undefined;
  if (props.mode === "range") {
    currentStart = props.startValue;
    currentEnd = props.endValue;
  } else {
    currentValue = props.value;
  }

  const [open, setOpen] = useState(false);
  const [isYearMonthOpen, setIsYearMonthOpen] = useState(false);

  const initialReference = mode === "range" ? currentStart : currentValue;
  const [year, setYear] = useState(() =>
    (initialReference ?? today).getFullYear(),
  );
  const [month, setMonth] = useState(
    () => (initialReference ?? today).getMonth() + 1,
  );

  // 시트가 열릴 때마다 현재 선택값의 연/월로 점프한다(값이 없으면 마지막 탐색 위치 유지).
  useEffect(() => {
    if (!open) return;
    const reference = mode === "range" ? currentStart : currentValue;
    if (!reference) return;
    setYear(reference.getFullYear());
    setMonth(reference.getMonth() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setIsYearMonthOpen(false);
  }

  function goPrevMonth() {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  function goNextMonth() {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  }

  function handleSelectDate(date: Date) {
    if (props.mode === "range") return;
    props.onChange?.(date);
  }

  function handleSelectRange(start: Date, end: Date | undefined) {
    if (props.mode !== "range") return;
    props.onChange?.(start, end);
  }

  function handleYearMonthChange(next: YearMonthSelectValue) {
    setYear(next.year);
    setMonth(next.month);
  }

  const minDate = disablePastDates ? startOfDay(today) : undefined;

  // 년/월 휠이 열려 있을 때는 "확인"이 날짜 선택 여부와 무관하게 항상 활성화되고,
  // 시트를 닫는 대신 Calendar 그리드로만 복귀한다(날짜 선택 커밋과는 별개 동작).
  const primaryDisabled = isYearMonthOpen
    ? false
    : mode === "range"
      ? !currentStart && !currentEnd
      : !currentValue;

  function handlePrimaryClick() {
    if (isYearMonthOpen) {
      setIsYearMonthOpen(false);
      return;
    }
    handleClose();
  }

  const fieldValueProps =
    mode === "range"
      ? {
          mode: "range" as const,
          startValue: currentStart ? formatDate(currentStart) : undefined,
          endValue: currentEnd ? formatDate(currentEnd) : undefined,
        }
      : {
          mode: "single" as const,
          value: currentValue ? formatDate(currentValue) : undefined,
        };

  const yearMonthSlot: ReactNode = (
    <div className="h-(--sz-320) w-full">
      <YearMonthSelect
        value={{ year, month }}
        onChange={handleYearMonthChange}
        minYear={minYear}
        maxYear={maxYear}
      />
    </div>
  );

  return (
    <>
      <DateField
        variant={variant}
        label={label}
        helperText={helperText}
        danger={danger}
        disabled={disabled}
        readOnly={readOnly}
        onClick={handleOpen}
        className={className}
        {...fieldValueProps}
      />

      <BottomSheet
        open={open}
        onClose={handleClose}
        title={title}
        fixButton={{
          variant: "single",
          primaryLabel: confirmLabel,
          primaryDisabled,
          onPrimaryClick: handlePrimaryClick,
        }}
      >
        <Calendar
          mode={mode}
          year={year}
          month={month}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onYearMonthClick={() => setIsYearMonthOpen((prev) => !prev)}
          isYearMonthOpen={isYearMonthOpen}
          yearMonthSlot={yearMonthSlot}
          selectedDate={mode === "single" ? currentValue : undefined}
          startDate={mode === "range" ? currentStart : undefined}
          endDate={mode === "range" ? currentEnd : undefined}
          onSelectDate={handleSelectDate}
          onSelectRange={handleSelectRange}
          today={today}
          minDate={minDate}
        />
      </BottomSheet>
    </>
  );
}
