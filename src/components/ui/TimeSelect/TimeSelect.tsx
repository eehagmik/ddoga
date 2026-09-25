/**
 * TimeSelect — 오전/오후·시·분 3열 휠(스크롤) 선택 오버레이 콘텐츠.
 *
 * Figma "또가3.0 Design System / TimePicker" (문서 캔버스 51405:150988, 메인 컴포넌트
 * node 51405:151034, 심볼 51405:151035) 와 1:1. `DateField`/`TimeField`
 * (`src/components/ui/DateField`, `src/components/ui/TimeField`) 가 JSDoc 에 "클릭 시
 * 부모가 TimePicker 를 열도록 위임한다"고 적어둔 바로 그 오버레이 콘텐츠다 — 헤더/확인
 * 버튼 없이 **순수 휠 선택 바디만** 제공하며, `BottomSheet`(`src/components/ui/BottomSheet`)
 * 의 `contentsSlot` 에 children 으로 꽂혀 쓰인다(Figma Guide 페이지 51405:151068 근방의
 * 합성 예시, 이 컴포넌트의 stories 에서 `Header`+`BottomSheet`+`FixButton` 조합으로 재현).
 * 상위 조합 컴포넌트 `TimePicker`(`src/components/ui/TimePicker`, `TimeField`+
 * `BottomSheet`+이 컴포넌트를 조합)가 `YearMonthSelect`↔`Calendar`/`DatePicker` 관계와
 * 동일한 원칙으로 이 콘텐츠를 감싼다.
 *
 * 구조(3열, `get_design_context` 로 node 51405:151034 실측):
 * - 오전/오후 열 — Figma 상으론 `_parts/TimePickerSelect/List variant=Radio`(node
 *   51405:151014, 스크롤 없이 고정 2항목 + 반대편 빈 셀 1개로 "선택 항목이 항상 정중앙"
 *   을 흉내낸 정적 배치)이지만, 그대로 이식하면 오전↔오후 전환 시 빈 셀 위치가 즉시
 *   뒤바뀌면서 애니메이션 없이 순간이동(깜빡임)하는 문제가 있었다(2026-09-21 수정). 시/분
 *   열과 동일한 시각적 "위아래로 자연스럽게 스크롤" 동작을 위해, 값 2개([오전, 오후])를
 *   인덱스(0/1) 기반 `WheelColumn` 으로 재구현했다 — 실제 스크롤 컨테이너 + `scrollTo({
 *   behavior: "smooth" })` 를 그대로 공유하므로 시/분과 동일한 easing 으로 슬라이드된다.
 * - 시/분 열 — `_parts/TimePickerSelect/List variant=Select`(node 51405:151018).
 *   `overflow-y-auto` + `scroll-snap-type:y mandatory`(iOS 스타일 휠피커) 실제 스크롤.
 *   Figma 목업은 특정 스크롤 위치(6시/05분)를 보여주기 위해 정적으로 "빈 셀 2개 + 값
 *   12개 + 빈 셀 1개"를 배치했을 뿐(홀수 total 로 특정 값을 중앙에 맞춘 스냅샷) — 실제
 *   구현은 사용자 승인에 따라 컨테이너 높이를 `ResizeObserver` 로 측정해
 *   `spacerHeight = (containerHeight - CELL_HEIGHT) / 2 - CELL_GAP` 로 상하 패딩 셀을
 *   동적 계산하는 범용 공식을 쓴다(어떤 값이든, 첫/마지막 값도 정중앙까지 스크롤 가능).
 * - **사용자 승인 결정 (1) 분(Minute) 열은 0~59 전체(60개)로 확장한다** — Figma 목업엔
 *   12개(00~11)만 노출돼 있지만 이는 문서화용 축소 샘플이다.
 * - **사용자 승인 결정 (2) 타이핑 캐럿(직접 입력) 상태는 구현하지 않는다** — Figma 의
 *   `focus+checked=true`(노란 텍스트 `yellow/100`+보라 커서 `purple/500` primitive 토큰,
 *   `_parts/TimePickerSelect/Cell` state=focus 심볼)는 스코프 밖. 키보드 포커스는
 *   프로젝트 다른 컴포넌트와 일관되게 `focus-visible` 링 정도만 최소로 준다(새 토큰
 *   추가 없음, 기존 브랜드 보더 토큰 재사용).
 *
 * 선택 표시(포커스 링이 아니라 **셀 배경색 자체**, `_parts/TimePickerSelect/Cell` 전
 * state 실측 — `get_design_context`/`get_variable_defs` 로 재확인):
 * | checked | state   | 배경                    | 텍스트                              |
 * | ------- | ------- | ----------------------- | ------------------------------------ |
 * | true    | enable  | `bg-bg-info-normal`      | `text-typo-inverse-normal` + bold    |
 * | true    | hover   | `bg-bg-info-deep`        | `text-typo-inverse-normal` + bold    |
 * | false   | enable  | 없음                     | `text-typo-neutral-bright`           |
 * | false   | hover   | `bg-bg-info-bright`      | `text-typo-info-deep`                |
 * | false   | disable | 없음                     | `text-typo-disabled-subtle`          |
 * (checked=true + disable 조합은 Figma 에 정의 없음 — 구현하지 않는다. `disabled` 이면
 * 선택된 셀은 checked=true/enable 룩을 그대로 유지한 채 상호작용만 막는다.)
 *
 * 타이포: 체크됨 `text-body-3-bold`(Bold, `font/size/md` 18px, ls -1.5%), 아니면
 * `text-body-3`(Medium, 18px, ls -1%) — Figma `body/3_bold`/`body/3` 텍스트 스타일 1:1.
 *
 * 그라데이션 오버레이(리스트 상하단 페이드, node 51405:151036/151037 실측):
 * - 상단 `h-(--sz-58)`(58px), `linear-gradient(to bottom, --color-bg-neutral-normal,
 *   --color-bg-neutral-none)`(불투명 흰색 → 투명), z-index 4.
 * - 하단 동일 높이, 방향 반대(`--color-bg-neutral-none` → `--color-bg-neutral-normal`),
 *   z-index 5(최상단, 3열 전체를 가로질러 덮는다 — `overlay-blackSubtle` 류 어둡게 하는
 *   토큰이 아니라 배경과 같은 흰색 계열 페이드다). `FixButton`(`src/components/ui/FixButton`)
 *   의 `GRADIENT_CLASS` 와 동일 패턴(`bg-[linear-gradient(...)]` 인라인, Tailwind
 *   `from-*`/`to-*` 유틸 대신 이 프로젝트 선례를 따른다)을 그대로 재사용했다.
 *
 * 치수(`get_design_context` 실측, node 51405:151034/150996):
 * - 셀 높이 `CELL_HEIGHT`=46px(`--sz-46`), 셀 내부 `px-(--sz-4) py-(--sz-10)`,
 *   반경 `rounded-xl`(`--radius-xl`=12px).
 * - 열 사이 셀 간격(세로) `CELL_GAP`=4px(`--sz-4`), 3열 사이 가로 gap `--sz-8`.
 * - 루트 폭 320px(`--sz-320`), 높이는 Figma Guide "min 320 / max 520" 스케일 주석대로
 *   가변(부모가 준 높이를 그대로 채우고 `min-h-(--sz-320)`/`max-h-[520px]`로만
 *   clamp — `--sz-520` 토큰이 없어 `max-h` 만 arbitrary px, `BottomSheet`의 `90dvh`
 *   선례와 동일한 "토큰 없는 값은 하드코딩 예외" 처리).
 *
 * 스크롤 좌표 계산: `ROW_PITCH = CELL_HEIGHT + CELL_GAP`. 상하 패딩 셀
 * `spacerHeight = (containerHeight - CELL_HEIGHT) / 2 - CELL_GAP` 로 두면
 * index `i` 를 정중앙에 놓는 `scrollTop` 이 정확히 `i * ROW_PITCH` 로 단순화된다(유도는
 * 이 파일의 git history/PR 설명 참고). 스크롤이 멈추면(디바운스된 `scroll` 이벤트,
 * `scrollend` 는 Safari 구버전 미지원이라 쓰지 않음) `Math.round(scrollTop / ROW_PITCH)`
 * 로 가장 가까운 셀을 찾아 `onChange` 를 호출한다. 셀 클릭 시엔 즉시 `onChange` +
 * `scrollTo({ behavior: "smooth" })` 로 부드럽게 중앙 이동한다. `value` prop 이 외부에서
 * (내부 스크롤이 아닌 다른 경로로) 바뀌면 동일하게 프로그래매틱 스크롤로 동기화한다.
 *
 * `jsdom`(Vitest) 방어: `ResizeObserver`/`Element.scrollTo` 가 없을 수 있어 존재 여부를
 * 확인 후 전부 optional 하게 호출한다.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type TimeSelectMeridiem = "오전" | "오후";

export interface TimeSelectValue {
  /** 오전/오후 */
  meridiem: TimeSelectMeridiem;
  /** 1~12 */
  hour: number;
  /** 0~59 (Figma 목업은 0~11 만 노출하지만 사용자 승인에 따라 전체 60개로 확장) */
  minute: number;
}

export interface TimeSelectProps {
  /** controlled value */
  value: TimeSelectValue;
  /** 스크롤/클릭으로 값이 바뀔 때 호출 */
  onChange: (value: TimeSelectValue) => void;
  /**
   * 전체 비활성화(Figma `_parts/TimePickerSelect/Cell` state=disable — checked=false
   * 조합만 정의돼 있다). 선택된 셀은 checked=true/enable 룩을 유지한 채 상호작용만 막힌다.
   */
  disabled?: boolean;
  /** 루트에 병합할 클래스 */
  className?: string;
}

const MERIDIEMS: TimeSelectMeridiem[] = ["오전", "오후"];
/** `WheelColumn` 은 number 값만 다뤄서, 오전(0)/오후(1) 인덱스로 변환해 재사용한다. */
const MERIDIEM_INDICES = [0, 1];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/** `_parts/TimePickerSelect/Cell` 실측 높이(46px, `--sz-46`). */
const CELL_HEIGHT = 46;
/** 셀 사이 세로 간격(4px, `--sz-4`, Figma List `gap`). */
const CELL_GAP = 4;
/** 스크롤 좌표 계산 단위(셀 높이 + 간격). */
const ROW_PITCH = CELL_HEIGHT + CELL_GAP;
/** `scrollend` 미사용 대신 쓰는 디바운스 지연(ms). */
const SCROLL_SETTLE_DEBOUNCE_MS = 120;

const formatMinute = (minute: number) => String(minute).padStart(2, "0");
const formatHour = (hour: number) => String(hour);
const formatMeridiem = (index: number) => MERIDIEMS[index];

/** 상단 페이드 — 불투명 흰색(위) → 투명(아래), `FixButton` `GRADIENT_CLASS` 선례와 동일 패턴. */
const TOP_GRADIENT_CLASS =
  "absolute inset-x-0 top-0 z-4 h-(--sz-58) " +
  "bg-[linear-gradient(to_bottom,var(--color-bg-neutral-normal),var(--color-bg-neutral-none))]";
/** 하단 페이드 — 투명(위) → 불투명 흰색(아래), 3열 전체를 덮어 z-index 가 가장 위(5). */
const BOTTOM_GRADIENT_CLASS =
  "absolute inset-x-0 bottom-0 z-5 h-(--sz-58) " +
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

export function TimeSelect({
  value,
  onChange,
  disabled = false,
  className,
}: TimeSelectProps) {
  const handleMeridiemChange = (index: number) => {
    const meridiem = MERIDIEMS[index];
    if (meridiem === value.meridiem) return;
    onChange({ ...value, meridiem });
  };
  const handleHourChange = (hour: number) => {
    if (hour === value.hour) return;
    onChange({ ...value, hour });
  };
  const handleMinuteChange = (minute: number) => {
    if (minute === value.minute) return;
    onChange({ ...value, minute });
  };

  return (
    <div
      data-disabled={disabled}
      className={[
        "relative isolate flex h-full w-full min-h-(--sz-320) max-h-[520px]",
        "items-center justify-center gap-(--sz-8) overflow-clip",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div aria-hidden className={TOP_GRADIENT_CLASS} />
      <div aria-hidden className={BOTTOM_GRADIENT_CLASS} />

      <WheelColumn
        ariaLabel="오전 오후"
        items={MERIDIEM_INDICES}
        value={value.meridiem === "오전" ? 0 : 1}
        onChange={handleMeridiemChange}
        disabled={disabled}
        formatLabel={formatMeridiem}
        zIndexClassName="z-3"
      />
      <WheelColumn
        ariaLabel="시"
        items={HOURS}
        value={value.hour}
        onChange={handleHourChange}
        disabled={disabled}
        formatLabel={formatHour}
        zIndexClassName="z-2"
      />
      <WheelColumn
        ariaLabel="분"
        items={MINUTES}
        value={value.minute}
        onChange={handleMinuteChange}
        disabled={disabled}
        formatLabel={formatMinute}
        zIndexClassName="z-1"
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
 * 시/분 열 — 실제 스크롤 휠피커. `containerHeight` 를 측정해 상하 `spacerHeight` 를
 * 동적 계산하고(`ROW_PITCH` JSDoc 참고), 스크롤이 멈추면 중앙에 가장 가까운 셀을
 * `onChange` 로 커밋한다.
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
        "flex h-full min-w-0 flex-1 flex-col items-center gap-(--sz-4)",
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
        <TimeSelectCell
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

interface TimeSelectCellProps {
  label: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
}

/** 셀 공통 베이스(치수/타이포/트랜지션, 색만 상태별로 분기). */
const CELL_BASE_CLASS =
  "flex h-(--sz-46) w-full shrink-0 items-center justify-center rounded-xl " +
  "px-(--sz-4) py-(--sz-10) [scroll-snap-align:center] " +
  "transition-colors duration-150 ease-in-out motion-reduce:transition-none " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-border-brand-normal";

function TimeSelectCell({
  label,
  checked,
  disabled,
  onSelect,
}: TimeSelectCellProps) {
  const isMuted = disabled && !checked;

  const colorClass = isMuted
    ? "text-body-3 text-typo-disabled-subtle"
    : checked
      ? "bg-bg-info-normal text-body-3-bold text-typo-inverse-normal hover:bg-bg-info-deep"
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
