/**
 * YearMonthSelect — 연도/월 2열 휠(스크롤) 선택 바디.
 *
 * Figma "또가3.0 Design System / _parts/YearMonthSelect" (node 51405:73920, 하위 셀
 * `_parts/YearMonthSelect/Cell` node 51405:73888, 하위 리스트
 * `_parts/DatePickerSelect/List` × 2) 와 대응.
 *
 * `Calendar`(`src/components/ui/Calendar`) 헤더의 "YearMonthButton"(트리거 전용, 년/월
 * 선택 UI를 그리지 않고 `onYearMonthClick` 만 부모에 위임)을 클릭했을 때 `BottomSheet`
 * 안에서 노출되는 년/월 선택 바디다. `Calendar`/`BottomSheet` 와의 결합(오버레이
 * 오픈/클로즈, 헤더, 확인 버튼)은 이 컴포넌트의 범위 밖 — 순수 휠 선택 바디만 제공한다
 * (`TimeSelect` 와 동일한 위치의 컴포넌트, `src/components/ui/TimeSelect/TimeSelect.tsx`).
 *
 * 휠 스크롤 로직은 `TimeSelect` 의 `WheelColumn` 패턴을 그대로 이식했다:
 * `overflow-y-auto` + `scroll-snap-type:y mandatory` 실제 스크롤, `ResizeObserver` 로
 * 컨테이너 높이를 측정해 `spacerHeight = (containerHeight - CELL_HEIGHT) / 2 - CELL_GAP`
 * 로 상하 패딩 셀을 동적 계산, 스크롤 정지 시 디바운스(`scrollend` 미지원 대응) 후 중앙값을
 * 커밋, 셀 클릭 시 `scrollTo({ behavior: "smooth" })` 로 중앙 이동한다.
 *
 * - **월 열**은 1~12 고정 리스트(순환 없음) — Figma 목업의 "04→...→03" 표시는 특정 스크롤
 *   위치의 스냅샷일 뿐이므로 무시하고 1~12 고정으로 구현한다(사용자 확정).
 * - **연도 열**은 `minYear`/`maxYear` prop 으로 범위를 오버라이드할 수 있다. 기본값은
 *   `오늘 연도 - 100` ~ `오늘 연도 + 50`(사용자 확정).
 *
 * 셀 variant → prop 매핑(Figma `state` 는 `TimeSelect` 때와 동일하게 실제로는 checked
 * 의미, `_parts/YearMonthSelect/Cell` 실측):
 * | Figma state | 배경                | 텍스트                                          |
 * | ----------- | ------------------- | ------------------------------------------------ |
 * | enable      | 없음                 | `text-typo-neutral-bright`                       |
 * | hover       | `bg-bg-info-bright`  | `text-typo-info-deep`                            |
 * | focus(선택됨)| `bg-bg-info-normal`  | `text-typo-inverse-normal` + Bold                |
 * | disabled    | 없음                 | `text-typo-disabled-subtle`                      |
 * (Figma "focus" state 는 키보드 포커스가 아니라 선택됨/checked 를 의미한다 — 실제 키보드
 * 포커스는 다른 컴포넌트와 일관되게 `focus-visible` 링만 최소로 준다.)
 *
 * 타이포: 체크됨 `text-body-3-bold`, 아니면 `text-body-3` (`TimeSelect` 와 동일 커스텀
 * 타이포 유틸).
 *
 * 그라데이션 오버레이(리스트 상하단 페이드): 상단 `h-[var(--sz-58)]`
 * `linear-gradient(to bottom, --color-bg-neutral-normal, --color-bg-neutral-none)`, 하단
 * 동일 높이 방향 반대. `TimeSelect`/`FixButton` 의 `GRADIENT_CLASS` 선례와 동일 패턴.
 *
 * 치수(`get_design_context` 실측, node 51405:73920/73888): 셀 높이 `--sz-46`, 셀 내부
 * `px-[var(--sz-4)] py-[var(--sz-10)]`, 반경 `rounded-xl`(`--radius-xl`), 셀 사이 세로
 * 간격 `--sz-4`, 2열 사이 가로 gap `--sz-8`, 컨테이너 padding `--sz-10`.
 *
 * `jsdom`(Vitest) 방어: `ResizeObserver`/`Element.scrollTo` 가 없을 수 있어 존재 여부를
 * 확인 후 전부 optional 하게 호출한다(`TimeSelect` 와 동일).
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface YearMonthSelectValue {
  year: number;
  /** 1~12 */
  month: number;
}

export interface YearMonthSelectProps {
  /** controlled value */
  value: YearMonthSelectValue;
  /** 스크롤/클릭으로 값이 바뀔 때 호출 */
  onChange: (value: YearMonthSelectValue) => void;
  /** 연도 열 최소값. 기본 `오늘 연도 - 100` */
  minYear?: number;
  /** 연도 열 최대값. 기본 `오늘 연도 + 50` */
  maxYear?: number;
  /**
   * 전체 비활성화(Figma `_parts/YearMonthSelect/Cell` state=disable — checked=false
   * 조합만 정의돼 있다). 선택된 셀은 checked=true/enable 룩을 유지한 채 상호작용만 막힌다.
   */
  disabled?: boolean;
  /** 루트에 병합할 클래스 */
  className?: string;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/** `_parts/YearMonthSelect/Cell` 실측 높이(46px, `--sz-46`). */
const CELL_HEIGHT = 46;
/** 셀 사이 세로 간격(4px, `--sz-4`, Figma List `gap`). */
const CELL_GAP = 4;
/** 스크롤 좌표 계산 단위(셀 높이 + 간격). */
const ROW_PITCH = CELL_HEIGHT + CELL_GAP;
/** `scrollend` 미사용 대신 쓰는 디바운스 지연(ms). */
const SCROLL_SETTLE_DEBOUNCE_MS = 120;

const formatYear = (year: number) => `${year}년`;
const formatMonth = (month: number) => `${String(month).padStart(2, "0")}월`;

function buildYears(minYear: number, maxYear: number): number[] {
  const length = Math.max(0, maxYear - minYear + 1);
  return Array.from({ length }, (_, i) => minYear + i);
}

/** 상단 페이드 — 불투명 흰색(위) → 투명(아래), `TimeSelect`/`FixButton` 선례와 동일 패턴. */
const TOP_GRADIENT_CLASS =
  "absolute inset-x-0 top-0 z-[4] h-[var(--sz-58)] " +
  "bg-[linear-gradient(to_bottom,var(--color-bg-neutral-normal),var(--color-bg-neutral-none))]";
/** 하단 페이드 — 투명(위) → 불투명 흰색(아래), 2열 전체를 덮어 z-index 가 가장 위(5). */
const BOTTOM_GRADIENT_CLASS =
  "absolute inset-x-0 bottom-0 z-[5] h-[var(--sz-58)] " +
  "bg-[linear-gradient(to_bottom,var(--color-bg-neutral-none),var(--color-bg-neutral-normal))]";

/** jsdom 등 `Element.scrollTo` 미구현 환경 방어. */
function scrollElementTo(
  el: HTMLElement | null,
  top: number,
  behavior: ScrollBehavior,
) {
  if (!el) return;
  if (typeof el.scrollTo === "function") {
    el.scrollTo({ top, behavior });
    return;
  }
  el.scrollTop = top;
}

export function YearMonthSelect({
  value,
  onChange,
  minYear,
  maxYear,
  disabled = false,
  className,
}: YearMonthSelectProps) {
  const today = new Date();
  const resolvedMinYear = minYear ?? today.getFullYear() - 100;
  const resolvedMaxYear = maxYear ?? today.getFullYear() + 50;
  const years = buildYears(resolvedMinYear, resolvedMaxYear);

  const handleYearChange = (year: number) => {
    if (year === value.year) return;
    onChange({ ...value, year });
  };
  const handleMonthChange = (month: number) => {
    if (month === value.month) return;
    onChange({ ...value, month });
  };

  return (
    <div
      data-disabled={disabled}
      className={[
        "relative isolate flex h-full w-full min-h-[var(--sz-320)] max-h-[520px]",
        "items-center justify-center gap-[var(--sz-8)] overflow-clip",
        "px-[var(--sz-10)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div aria-hidden className={TOP_GRADIENT_CLASS} />
      <div aria-hidden className={BOTTOM_GRADIENT_CLASS} />

      <WheelColumn
        ariaLabel="연도"
        items={years}
        value={value.year}
        onChange={handleYearChange}
        disabled={disabled}
        formatLabel={formatYear}
        zIndexClassName="z-[2]"
      />
      <WheelColumn
        ariaLabel="월"
        items={MONTHS}
        value={value.month}
        onChange={handleMonthChange}
        disabled={disabled}
        formatLabel={formatMonth}
        zIndexClassName="z-[1]"
      />
    </div>
  );
}

interface WheelColumnProps {
  ariaLabel: string;
  items: number[];
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
  formatLabel: (value: number) => string;
  zIndexClassName: string;
}

/**
 * 연/월 열 — 실제 스크롤 휠피커. `containerHeight` 를 측정해 상하 `spacerHeight` 를
 * 동적 계산하고, 스크롤이 멈추면 중앙에 가장 가까운 셀을 `onChange` 로 커밋한다
 * (`TimeSelect` 의 `WheelColumn` 과 동일 구현).
 */
function WheelColumn({
  ariaLabel,
  items,
  value,
  onChange,
  disabled,
  formatLabel,
  zIndexClassName,
}: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const lastIndexRef = useRef(Math.max(0, items.indexOf(value)));
  const [containerHeight, setContainerHeight] = useState(0);

  const spacerHeight = Math.max(
    0,
    (containerHeight - CELL_HEIGHT) / 2 - CELL_GAP,
  );

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      scrollElementTo(containerRef.current, index * ROW_PITCH, behavior);
    },
    [],
  );

  // 컨테이너 높이 측정(ResizeObserver 없는 환경 방어).
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerHeight(el.clientHeight);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 높이(=spacerHeight) 재계산 시 현재 인덱스를 즉시(애니메이션 없이) 재정렬.
  useLayoutEffect(() => {
    if (!containerHeight) return;
    scrollToIndex(lastIndexRef.current, "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerHeight]);

  // controlled value 가 외부에서 바뀌면(내부 커밋이 아니면) 프로그래매틱 스크롤 동기화.
  useEffect(() => {
    const index = items.indexOf(value);
    if (index === -1 || index === lastIndexRef.current) return;
    lastIndexRef.current = index;
    scrollToIndex(index, containerHeight ? "smooth" : "auto");
  }, [value, items, containerHeight, scrollToIndex]);

  const commitIndex = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), items.length - 1);
      if (clamped === lastIndexRef.current) return;
      lastIndexRef.current = clamped;
      onChange(items[clamped]);
    },
    [items, onChange],
  );

  const settleToNearest = useCallback(() => {
    const el = containerRef.current;
    if (!el || disabled) return;
    commitIndex(Math.round(el.scrollTop / ROW_PITCH));
  }, [commitIndex, disabled]);

  const handleScroll = useCallback(() => {
    if (disabled) return;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(
      settleToNearest,
      SCROLL_SETTLE_DEBOUNCE_MS,
    );
  }, [disabled, settleToNearest]);

  useEffect(
    () => () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    },
    [],
  );

  const handleCellClick = (index: number) => {
    if (disabled) return;
    commitIndex(index);
    scrollToIndex(index, "smooth");
  };

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label={ariaLabel}
      onScroll={handleScroll}
      className={[
        "flex h-full min-w-0 flex-1 flex-col items-center gap-[var(--sz-4)]",
        "overflow-y-auto overflow-x-clip",
        "[scroll-snap-type:y_mandatory] [-webkit-overflow-scrolling:touch]",
        "[scrollbar-width:none]! [-ms-overflow-style:none]! [&::-webkit-scrollbar]:hidden!",
        disabled ? "pointer-events-none touch-none" : "",
        zIndexClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        aria-hidden
        style={{ height: spacerHeight }}
        className="w-full shrink-0"
      />
      {items.map((item, index) => (
        <YearMonthSelectCell
          key={item}
          label={formatLabel(item)}
          checked={item === value}
          disabled={disabled}
          onSelect={() => handleCellClick(index)}
        />
      ))}
      <div
        aria-hidden
        style={{ height: spacerHeight }}
        className="w-full shrink-0"
      />
    </div>
  );
}

interface YearMonthSelectCellProps {
  label: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
}

/** 셀 공통 베이스(치수/타이포/트랜지션, 색만 상태별로 분기). */
const CELL_BASE_CLASS =
  "flex h-[var(--sz-46)] w-full shrink-0 items-center justify-center rounded-xl " +
  "px-[var(--sz-4)] py-[var(--sz-10)] [scroll-snap-align:center] " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-border-brand-normal";

function YearMonthSelectCell({
  label,
  checked,
  disabled,
  onSelect,
}: YearMonthSelectCellProps) {
  const isMuted = disabled && !checked;

  const colorClass = isMuted
    ? "text-body-3 text-typo-disabled-subtle"
    : checked
      ? "bg-bg-info-normal text-body-3-bold text-typo-inverse-normal"
      : "text-body-3 text-typo-neutral-bright hover:bg-bg-info-bright hover:text-typo-info-deep";

  return (
    <button
      type="button"
      role="option"
      aria-selected={checked}
      disabled={disabled}
      onClick={onSelect}
      className={[
        CELL_BASE_CLASS,
        colorClass,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
