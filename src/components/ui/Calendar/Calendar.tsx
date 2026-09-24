/**
 * Calendar — 실제 캘린더 팝업 콘텐츠(월간 뷰 + 날짜 그리드). Figma 원본 컴포넌트명
 * "Calendar" 를 그대로 따른다(사용자 정정 확정 — 이전에 `DatePicker` 로 명명했던 것을
 * `Calendar` 로 되돌림). `DatePicker` 는 이 `Calendar` 를 내부에 사용해 트리거 필드
 * (`DateField`, `src/components/ui/DateField`)와 조합하는 상위 컴포넌트로, 이번
 * 구현 범위가 아니라 추후 별도로 만들 예정이다.
 *
 * Figma "또가3.0 Design System / Calendar" (문서 캔버스 51405:11635, 메인 프레임
 * 51405:11899, variant `default`/`single`/`range` × `check`) 와 대응.
 *
 * 하위 아톰(같은 문서 캔버스, 이번 구현에 로직만 이식하고 별도 컴포넌트로 분리하지 않음):
 * - `_parts/YearMonthButton`(51405:11748) — 트리거 전용. 실제 년/월 선택 UI는 이
 *   컴포넌트 범위 밖이며, 클릭 시 `onYearMonthClick` 만 호출해 부모에게 위임한다. 이
 *   버튼 자체는 년/월 선택 UI를 절대 그리지 않는다.
 * - `_parts/CalendarHeader`(51405:11780) — 이전/다음달 이동 + YearMonthButton.
 * - `_parts/DayCell`(51405:11792) — 요일 헤더 셀.
 * - `_parts/DateNumberCell`(51405:11799) — 날짜 셀.
 *
 * 프로젝트 관례상 의도적으로 Figma 와 다르게 확정한 부분(사용자 승인 완료):
 * - 이전/다음달 이동 버튼은 Figma 실측 20px 대신 프로젝트 표준 `IconButton`(24px 고정)을
 *   그대로 재사용한다(정확한 픽셀 매칭보다 기존 컴포넌트 재사용/일관성 우선).
 * - 요일 헤더 행은 `justify-between` + 고정 36×36 원형 셀로 렌더한다(Figma 는 `flex-1`
 *   균등폭이지만 확정 스펙을 따름). 날짜 그리드 행은 반대로 `flex-1` 균등폭을 쓴다.
 * - 루트는 Figma 360px 고정폭 대신 `w-full` 반응형으로 오버라이드한다.
 * - 요일 헤더의 "토요일" 텍스트 색은 `--color-purple-500`, 날짜 그리드의 "토요일" 텍스트
 *   색은 `--color-purple-700`, range 구간 배경은 `--color-blue-60` — 셋 다 시맨틱이 아닌
 *   Primitive 토큰을 직접 사용한다(사용자 지시: "시맨틱 말고 Primitive 에 있는 걸로 써").
 * - Figma `_parts/DateNumberCell` 의 `isPreview` variant(텍스트 20% 투명도)는 그대로
 *   이식하지 않는다. 대신 range 모드에서 `startDate` 만 있고 `endDate` 가 없을 때
 *   `onMouseEnter` 로 감지한 hover 날짜를 임시 종료일 후보로 간주해, 실제 확정 구간과
 *   동일한 `--color-blue-60` 배경으로 미리보기를 렌더한다(사용자 확정 스펙). 마우스가
 *   그리드를 벗어나면(`onMouseLeave`) 미리보기를 초기화한다.
 * - "다른 달" 패딩 셀(그리드 정렬용)은 `_parts/DateNumberCell` 의 `status="disabled"`
 *   룩(흐린 `typo-disabled-normal`)을 그대로 재사용하고 클릭을 막는다.
 *
 * range 구간 배경 로직: 여러 주(week row)에 걸친 구간을 행별로 분기하지 않고, 각 날짜
 * 셀이 `startDate`~`endDate`(정규화된 날짜, inclusive) 사이인지만 판정한다 — 같은 행 안의
 * 인접 셀 wrapper 들이 서로 맞닿아 있어(행 사이에만 세로 gap 이 있고 행 안에는 가로 gap 이
 * 없음) 이 단순 날짜 비교만으로 "시작 요일부터 토요일까지" / "일~토 전체" / "일요일부터
 * 종료일까지" 세 가지 시각 패턴이 모두 자연히 재현된다. 시작/종료 날짜 자체는 그 위에
 * `bg-bg-info-deep` 채움 원(`checked`)이 덮어 그린다.
 *
 * 값 표시: `mode="single"` 은 `selectedDate`, `mode="range"` 는 `startDate`/`endDate`.
 * `today` 는 테스트 용이성을 위해 prop 으로 오버라이드 가능(기본 `new Date()`).
 * `maxDate`/`disabledDates` 는 이번 범위에서 제외(확정 스펙, 추후 별도 요청 시 추가).
 *
 * 2026-09-23 확장(`DatePicker`, `src/components/ui/DatePicker` 조합용, 순수 추가):
 * - `yearMonthSlot`(`ReactNode`) — 값이 있고 `isYearMonthOpen` 이 true 면, 헤더의
 *   이전/다음 달 이동 버튼(`IconButton`) 두 개를 렌더링하지 않고(YearMonthButton 만
 *   `justify-center` 로 중앙에 남음) 요일 헤더 행 + 날짜 그리드 전체를 이 슬롯으로
 *   교체한다(Figma phone 목업 `_DatePicker` 실측). `YearMonthSelect` 를 그대로 꽂아
 *   쓰는 용도. 값이 없거나 `isYearMonthOpen` 이 false 면 기존 동작 그대로다.
 * - `minDate`(`Date`) — 이 값보다 이전(연/월/일 단위, 시간 무시) 날짜 셀은 "다른 달"
 *   패딩 셀과 동일한 disabled 룩(`typo-disabled-normal`, 클릭 불가)을 재사용해 적용한다.
 *   새 시각 스타일은 추가하지 않는다.
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Icon } from "../../../icons";
import { IconButton } from "../IconButton";

export type CalendarMode = "single" | "range";

export interface CalendarProps {
  /** 단일 날짜 / 기간. 기본 'single' */
  mode?: CalendarMode;
  /** 현재 표시 중인 연도(controlled) */
  year: number;
  /** 현재 표시 중인 월(1~12, controlled) */
  month: number;
  /** 이전 달 이동 버튼 클릭 */
  onPrevMonth?: () => void;
  /** 다음 달 이동 버튼 클릭 */
  onNextMonth?: () => void;
  /**
   * YearMonthButton 클릭 — 부모가 별도 년/월 선택 컴포넌트를 열도록 위임한다. 이 버튼
   * 자체는 년/월 선택 UI를 절대 그리지 않는다.
   */
  onYearMonthClick?: () => void;
  /** YearMonthButton "열림" 표시(배경 + chevron 방향 전환). 기본 false */
  isYearMonthOpen?: boolean;
  /**
   * `isYearMonthOpen` 이 true 일 때 요일 헤더+날짜 그리드 대신 렌더할 콘텐츠(예:
   * `YearMonthSelect`). 값이 없으면 기존처럼 항상 요일 헤더+날짜 그리드를 렌더한다.
   */
  yearMonthSlot?: ReactNode;
  /** mode='single' 일 때 선택된 날짜 */
  selectedDate?: Date;
  /** mode='range' 일 때 시작일 */
  startDate?: Date;
  /** mode='range' 일 때 종료일 */
  endDate?: Date;
  /** mode='single' 날짜 클릭 시 호출 */
  onSelectDate?: (date: Date) => void;
  /** mode='range' 날짜 클릭 시 호출. 시작일만 찍혔으면 end 는 undefined */
  onSelectRange?: (start: Date, end: Date | undefined) => void;
  /** 오늘 날짜(테스트 용이성). 기본 `new Date()` */
  today?: Date;
  /**
   * 이 날짜보다 이전(연/월/일 단위, 시간 무시)인 날짜 셀을 "다른 달" 패딩 셀과 동일한
   * disabled 룩으로 비활성화한다. 기본 없음(비활성화 없음).
   */
  minDate?: Date;
  /** 루트에 병합할 클래스 */
  className?: string;
}

type DayType = "weekday" | "saturday" | "sunday";

interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** 요일 헤더 텍스트 색. 토요일만 Primitive(`--color-purple-500`) 직접 사용. */
const WEEKDAY_HEADER_COLOR: Record<DayType, string> = {
  sunday: "text-typo-danger-normal",
  weekday: "text-typo-neutral-light",
  saturday: "text-purple-500",
};

function getDayType(date: Date): DayType {
  const day = date.getDay();
  if (day === 0) return "sunday";
  if (day === 6) return "saturday";
  return "weekday";
}

function normalizeTime(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function isSameDay(a?: Date, b?: Date): boolean {
  if (!a || !b) return false;
  return normalizeTime(a) === normalizeTime(b);
}

function isBeforeDay(a: Date, b: Date): boolean {
  return normalizeTime(a) < normalizeTime(b);
}

function isWithinRangeInclusive(date: Date, start?: Date, end?: Date): boolean {
  if (!start || !end) return false;
  const d = normalizeTime(date);
  const s = normalizeTime(start);
  const e = normalizeTime(end);
  return d >= Math.min(s, e) && d <= Math.max(s, e);
}

/**
 * `year`/`month`(1~12) 의 월간 캘린더를 주 단위(4~6행)로 생성한다. 앞뒤 패딩 칸도 인접
 * 달의 실제 `Date` 를 채워 range 판정·클릭 방지 등에 그대로 쓸 수 있게 한다.
 */
function buildCalendarWeeks(year: number, month: number): CalendarCell[][] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 2, daysInPrevMonth - i),
      inCurrentMonth: false,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month - 1, day), inCurrentMonth: true });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month, nextDay), inCurrentMonth: false });
    nextDay++;
  }

  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** 날짜 셀 텍스트 색. 우선순위: check(선택) > disabled(다른 달 패딩 셀) > type(평일/토/일). */
function getDateTextColorClass(opts: {
  checked: boolean;
  disabled: boolean;
  type: DayType;
}): string {
  if (opts.checked) return "text-typo-inverse-normal";
  if (opts.disabled) return "text-typo-disabled-normal";
  if (opts.type === "sunday") return "text-typo-danger-deep";
  if (opts.type === "saturday") return "text-purple-700";
  return "text-typo-neutral-normal";
}

export function Calendar({
  mode = "single",
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onYearMonthClick,
  isYearMonthOpen = false,
  yearMonthSlot,
  selectedDate,
  startDate,
  endDate,
  onSelectDate,
  onSelectRange,
  today = new Date(),
  minDate,
  className,
}: CalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>(undefined);

  // startDate/endDate/mode/표시 월이 바뀌면 이전 hover 미리보기는 더 이상 유효하지 않다.
  useEffect(() => {
    setHoveredDate(undefined);
  }, [startDate, endDate, mode, year, month]);

  const weeks = buildCalendarWeeks(year, month);
  const showYearMonthSlot = Boolean(yearMonthSlot) && isYearMonthOpen;

  const previewEnd =
    mode === "range" && startDate && !endDate ? hoveredDate : undefined;
  const rangeEnd = endDate ?? previewEnd;

  function handleSelectDate(date: Date) {
    if (mode === "single") {
      onSelectDate?.(date);
      return;
    }
    if (!startDate || endDate) {
      onSelectRange?.(date, undefined);
      return;
    }
    if (isBeforeDay(date, startDate)) {
      onSelectRange?.(date, undefined);
    } else {
      onSelectRange?.(startDate, date);
    }
  }

  return (
    <div
      data-mode={mode}
      className={[
        "flex w-full flex-col items-center px-[var(--sz-16)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex w-full items-center pt-[var(--sz-8)] pb-[var(--sz-16)]",
          showYearMonthSlot ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        {!showYearMonthSlot && (
          <IconButton aria-label="이전 달" onClick={onPrevMonth}>
            <Icon name="arrow_left_solid" size={24} />
          </IconButton>
        )}

        <button
          type="button"
          onClick={onYearMonthClick}
          aria-expanded={isYearMonthOpen}
          className={[
            "flex h-[var(--sz-34)] cursor-pointer items-center gap-[var(--sz-6)] whitespace-nowrap rounded-2xl pl-[var(--sz-12)] pr-[var(--sz-6)]",
            "text-title-2 text-typo-neutral-normal",
            "transition-opacity duration-150 ease-in-out motion-reduce:transition-none",
            "hover:opacity-[var(--alpha-60)]",
            isYearMonthOpen ? "bg-bg-overlay-greenGraySubtle" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span>
            {year}년 {month}월
          </span>
          <Icon
            name={isYearMonthOpen ? "chevron_up_line" : "chevron_down_line"}
            size={18}
          />
        </button>

        {!showYearMonthSlot && (
          <IconButton aria-label="다음 달" onClick={onNextMonth}>
            <Icon name="arrow_right_solid" size={24} />
          </IconButton>
        )}
      </div>

      {showYearMonthSlot ? (
        yearMonthSlot
      ) : (
        <div className="flex w-full flex-col items-center gap-[var(--sz-4)] pb-[var(--sz-16)]">
          <div className="flex w-full">
            {WEEKDAY_LABELS.map((label, index) => {
              const type: DayType =
                index === 0 ? "sunday" : index === 6 ? "saturday" : "weekday";
              return (
                <div
                  key={label}
                  className="flex flex-1 items-center justify-center"
                >
                  <span
                    className={[
                      "flex size-[var(--sz-36)] items-center justify-center rounded-circle text-label-2",
                      WEEKDAY_HEADER_COLOR[type],
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            className="flex w-full flex-col items-start gap-[var(--sz-4)]"
            onMouseLeave={() => setHoveredDate(undefined)}
          >
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex w-full">
                {week.map((cell, cellIndex) => {
                  const type = getDayType(cell.date);
                  const disabled =
                    !cell.inCurrentMonth ||
                    (minDate ? isBeforeDay(cell.date, minDate) : false);
                  const checked =
                    mode === "single"
                      ? isSameDay(cell.date, selectedDate)
                      : isSameDay(cell.date, startDate) ||
                        isSameDay(cell.date, endDate);
                  const isToday = !checked && isSameDay(cell.date, today);
                  const inRangeBackground =
                    mode === "range" &&
                    Boolean(startDate) &&
                    Boolean(rangeEnd) &&
                    isWithinRangeInclusive(cell.date, startDate, rangeEnd);
                  // range 의 실제 양 끝(시작일, 또는 확정 종료일이 없으면 hover 미리보기
                  // 종료일)만 캡을 씌운다. 같은 행에서 그 방향에 이어지는 range 셀이 없을
                  // 때만 둥글리고, 이어질 때는 계속 사각형으로 둬 인접 셀과 이음매 없이
                  // 붙게 한다.
                  const isRangeEndpoint =
                    inRangeBackground &&
                    (isSameDay(cell.date, startDate) ||
                      isSameDay(cell.date, rangeEnd));
                  const leftNeighbor =
                    cellIndex > 0 ? week[cellIndex - 1] : undefined;
                  const rightNeighbor =
                    cellIndex < week.length - 1
                      ? week[cellIndex + 1]
                      : undefined;
                  const leftInRange =
                    inRangeBackground &&
                    Boolean(leftNeighbor) &&
                    isWithinRangeInclusive(
                      leftNeighbor!.date,
                      startDate,
                      rangeEnd,
                    );
                  const rightInRange =
                    inRangeBackground &&
                    Boolean(rightNeighbor) &&
                    isWithinRangeInclusive(
                      rightNeighbor!.date,
                      startDate,
                      rangeEnd,
                    );
                  const roundLeft = isRangeEndpoint && !leftInRange;
                  const roundRight = isRangeEndpoint && !rightInRange;

                  return (
                    <div
                      key={cell.date.toISOString()}
                      className="relative flex flex-1 items-center justify-center"
                    >
                      {inRangeBackground && (
                        // 배경을 셀(flex-1) 전체 폭이 아니라 버튼(36px) 기준으로만 캡을
                        // 씌운다 — 넓은 화면에서 셀 폭이 버튼보다 훨씬 커지면, 셀 전체에
                        // rounded 를 걸 경우 둥근 모서리와 버튼 사이에 낀 직선 구간이 길게
                        // 남아 물방울처럼 튀어나와 보인다(2026-09-23 이슈). 이어지는 방향은
                        // 계속 셀 끝까지 채워 인접 셀과 이음매 없이 붙는다.
                        <div
                          aria-hidden="true"
                          className={[
                            "absolute inset-y-0 bg-blue-60",
                            roundLeft
                              ? "left-[calc(50%_-_var(--sz-18))] rounded-l-circle"
                              : "left-0",
                            roundRight
                              ? "right-[calc(50%_-_var(--sz-18))] rounded-r-circle"
                              : "right-0",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        />
                      )}
                      <button
                        type="button"
                        disabled={disabled}
                        aria-label={`${cell.date.getFullYear()}년 ${
                          cell.date.getMonth() + 1
                        }월 ${cell.date.getDate()}일`}
                        aria-pressed={checked}
                        onClick={() => handleSelectDate(cell.date)}
                        onMouseEnter={() => {
                          if (disabled) return;
                          if (mode !== "range") return;
                          if (!startDate || endDate) return;
                          setHoveredDate(cell.date);
                        }}
                        className={[
                          "relative flex size-[var(--sz-36)] items-center justify-center rounded-circle text-label-1",
                          "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
                          checked ? "bg-bg-info-deep" : "",
                          isToday
                            ? "border-sm border-solid border-border-info-deep"
                            : "",
                          disabled ? "cursor-not-allowed" : "cursor-pointer",
                          getDateTextColorClass({ checked, disabled, type }),
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {cell.date.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
