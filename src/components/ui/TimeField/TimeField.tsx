/**
 * TimeField — 시간(또는 시간 범위) 선택 트리거 필드. `DateField`
 * (`src/components/ui/DateField/DateField.tsx`) 의 자매 컴포넌트로, Figma 설명에도
 * "TimeField 와 동일한 디자인을 사용한다. 둘 중 하나가 수정되면 함께 고려해서
 * 반영한다" 고 명시돼 있다. 실제 편집 가능한 `<input>` 은 갖지 않고, 값을 텍스트로
 * "표시"만 한 뒤 클릭 시 부모가 상위 조합 컴포넌트 TimePicker(`src/components/ui/TimePicker`,
 * `TimeField`+`BottomSheet`+`TimeSelect` 조합)를 열도록 위임하는 버튼 필드다.
 *
 * Figma "또가3.0 Design System / TimeField" (컴포넌트 세트 node 51405:146949) 와 1:1.
 *
 * 축(Figma property → props):
 * - `type`   : line(밑줄형, 기본) / box(테두리 박스형) → `variant`(DateField 와 동일 관례).
 * - `variant`: single(단일 시간) / range(시작~종료) → `mode`(DateField 와 동일 관례).
 * - `hasValue`: 별도 prop 없이 value 류 prop 존재 여부로 판단 — single 은 `value`,
 *   range 는 시작/종료 각 필드가 자신의 `startValue`/`endValue` 존재 여부로 "독립"
 *   판단한다(DateField 의 range 와 다른 점 — 아래 "range 구조" 참고).
 * - `state`  : Figma 세트엔 enable(기본)/hover(→`:hover`)/focus(→`:focus-visible`)/
 *   danger(→`danger` prop)/disabled(→ 네이티브 `<button disabled>`) 5종만 있고
 *   readOnly 심볼이 없다. 다만 동일 디자인 원칙을 공유하는 DateField 에 readOnly 가
 *   있고, 사용자 승인에 따라 이 컴포넌트에도 DateField 와 동일한 readOnly 로직(포커스는
 *   가능하되 `onClick` 콜백만 스킵)을 그대로 이식했다 — Figma 세트엔 없는 확장이다.
 * - `label`/`helper` boolean → `label?: string`(single) / `startLabel`·`endLabel`
 *   (range) / `helperText?: string` presence 기반(DateField 와 동일 패턴). `Label` 은
 *   `principal`/`info` 를 모두 `false` 로 고정한다(DateField 와 동일 사유 — Figma 세트의
 *   Label 인스턴스에 남아있는 기본값일 뿐, TimeField 자체 스펙엔 필수 표시/정보 버튼
 *   축이 없다).
 *
 * range 구조(DateField 와 다른 점 — `get_design_context` 로 node 51405:147000 재조회해
 * 확정):
 * - DateField 의 range 는 필드 "하나" 안에 "{startValue} ~ {endValue}" 를 이어붙여
 *   표시하지만, TimeField 의 range 는 **"시작시간"/"종료시간" 라벨을 각자 가진 독립
 *   필드 2개**가 나란히 배치된 구조다(Figma `fields` 컨테이너:
 *   `flex flex-wrap gap-(--sz-16) w-full`, 필드 각각 `flex-1`).
 * - 따라서 물결(`~`) 구분자, `startLabel`/`endLabel` 개별 지정, `onStartClick`/
 *   `onEndClick` 개별 콜백이 필요하다 — DateField 에는 없는 축이다.
 * - "필드 블록 하나"(라벨 + 버튼 + 언더라인)는 single 모드에서 1번, range 모드에서
 *   2번(시작/종료) 렌더될 수 있어 내부 비공개 컴포넌트 `TimeFieldBlock` 으로
 *   추출해 재사용한다.
 *
 * 레이아웃(2026-09-21 재확정 — Label↔필드 gap 을 DateField 와 10px 로 통일):
 * - `get_design_context` 재조회 결과 Figma 상 TimeField 의 Label↔필드 간격은 16px 로
 *   DateField(8px) 와 달랐으나(TextField 도 16px), 최종적으로 **10px 로 통일하기로
 *   결정**했다(Figma 원본은 사용자가 직접 동기화할 예정 — 코드가 Figma 실측치와
 *   의도적으로 다른 구간).
 * - 필드 블록(`TimeFieldBlock`, `flex-col`): `Label` ↔ 버튼+언더라인 그룹 사이
 *   `gap-(--sz-10)`.
 * - 버튼+언더라인 그룹: 버튼 ↔ 언더라인 사이 `gap-(--sz-8)`(변경 없음).
 * - 루트(`flex-col`): 필드 블록 ↔ `HelperLabel` 사이 `gap-(--sz-8)`(변경 없음).
 * - range 필드 간 가로 gap(`flex flex-wrap gap-(--sz-16)`, "시작시간"/"종료시간"
 *   필드 2개 사이)은 이번 Label↔필드 gap 조정과 무관한 별개 축이라 16px 그대로 유지.
 * - 필드: 좌측 24px `clock_line` 아이콘 고정(자유 슬롯 아님, 상태 불문 색
 *   `icon/neutral/light`(`#878787`) 고정 — DateField 의 `calendar_line` 과 동일 패턴).
 * - `<input>` 대신 `<button type="button">` 으로 필드 전체(아이콘+텍스트)를 감싼다.
 *   `onClick` 은 disabled 가 아니고 readOnly 가 아닐 때만 호출한다(DateField 와 동일).
 *
 * 값 표시(`<input>` 금지 — 순수 텍스트만):
 * - `mode="single"`: `value` 있으면 값 색(`typo-neutral-normal`, disabled 시
 *   `typo-disabled-normal`), 없으면 placeholder "시간 선택"(`typo-hint-subtle`, 단
 *   disabled/readOnly(line 전용) 는 `typo-disabled-subtle`).
 * - `mode="range"`: 시작/종료 필드가 각자 독립적으로 위 규칙을 적용한다(시작만
 *   채워져도 시작 필드만 값 색, 종료 필드는 여전히 placeholder).
 *
 * 색 로직은 DateField(→ Input)의 line/box 로직을 그대로 이식했다(사용자 확인 사실:
 * 값·타이포·토큰 100% 동일, 새 토큰 없음) — 헬퍼 함수명까지 동일하게 유지한다:
 * `getPlaceholderColorClass`/`getValueColorClass`/`getFieldChromeClass`.
 * - line 밑줄(버튼과 형제 `<div>`) 은 버튼에 `peer` 를 주고 밑줄에
 *   `peer-focus-visible:` 를 사용한다.
 * - box 테두리(버튼 자기 자신)는 버튼 자신의 `focus-visible:` 을 쓴다.
 *
 * state 별 색 매핑은 Input.tsx/DateField.tsx JSDoc 표를 그대로 따른다(중복 기술하지
 * 않음) — 우선순위 danger > disabled > readOnly > hasValue 순.
 *
 * 타이포: 값·placeholder `text-body-1`(22px, line) / `text-body-3`(18px, box) — Input·
 * DateField 와 동일.
 */

import { Icon } from "../../../icons";
import { HelperLabel } from "../HelperLabel";
import { Label } from "../Label";

export type TimeFieldVariant = "line" | "box";
export type TimeFieldMode = "single" | "range";

export interface TimeFieldProps {
  /** 시각 형태(Figma `type`). 기본 'line' */
  variant?: TimeFieldVariant;
  /** 단일 시간 / 범위(Figma `variant`). 기본 'single' */
  mode?: TimeFieldMode;
  /** mode='single' 일 때 상단 라벨 텍스트. 있을 때만 `Label` 렌더 */
  label?: string;
  /** mode='range' 일 때 시작 필드 라벨. 기본 '시작시간' */
  startLabel?: string;
  /** mode='range' 일 때 종료 필드 라벨. 기본 '종료시간' */
  endLabel?: string;
  /** 헬퍼 텍스트. 있을 때만 `HelperLabel` 렌더(danger 면 경고색). 필드 그룹 전체 아래 1개 */
  helperText?: string;
  /** mode='single' 일 때 표시할 값(controlled, 표시 전용 — 직접 편집 불가) */
  value?: string;
  /** mode='range' 일 때 표시할 시작 값 */
  startValue?: string;
  /** mode='range' 일 때 표시할 종료 값 */
  endValue?: string;
  /** 에러/경고 상태(Figma `state=danger`) */
  danger?: boolean;
  /** 비활성화(Figma `state=disabled`) — 네이티브 `<button disabled>` */
  disabled?: boolean;
  /**
   * 읽기 전용. Figma 세트엔 없는 확장(사용자 승인) — DateField 의 readOnly 로직을
   * 그대로 이식했다. 포커스는 가능하지만 `onClick` 계열 콜백 호출은 스킵된다.
   */
  readOnly?: boolean;
  /** mode='single' 필드 클릭 시 호출. disabled/readOnly 면 호출되지 않는다 */
  onClick?: () => void;
  /** mode='range' 시작 필드 클릭 시 호출. disabled/readOnly 면 호출되지 않는다 */
  onStartClick?: () => void;
  /** mode='range' 종료 필드 클릭 시 호출. disabled/readOnly 면 호출되지 않는다 */
  onEndClick?: () => void;
  /** 루트에 병합할 클래스 */
  className?: string;
}

const PLACEHOLDER_TEXT = "시간 선택";
const DEFAULT_START_LABEL = "시작시간";
const DEFAULT_END_LABEL = "종료시간";

/** variant 별 값·placeholder 타이포(Input/DateField 와 동일 실측). */
const VALUE_TYPO: Record<TimeFieldVariant, string> = {
  line: "text-body-1",
  box: "text-body-3",
};

/** 좌측 clock 아이콘 슬롯 — 24px 고정, 상태 불문 `icon/neutral/light` 고정색(Figma 실측). */
const ICON_SLOT_CLASS =
  "flex size-(--sz-24) shrink-0 items-center justify-center text-icon-neutral-light";

export function TimeField({
  variant = "line",
  mode = "single",
  label,
  startLabel = DEFAULT_START_LABEL,
  endLabel = DEFAULT_END_LABEL,
  helperText,
  value,
  startValue,
  endValue,
  danger = false,
  disabled = false,
  readOnly = false,
  onClick,
  onStartClick,
  onEndClick,
  className,
}: TimeFieldProps) {
  return (
    <div
      data-variant={variant}
      data-mode={mode}
      data-danger={danger}
      data-disabled={disabled}
      data-readonly={readOnly}
      className={["flex w-full flex-col items-start gap-(--sz-8)", className]
        .filter(Boolean)
        .join(" ")}
    >
      {mode === "single" ? (
        <TimeFieldBlock
          variant={variant}
          label={label}
          value={value}
          danger={danger}
          disabled={disabled}
          readOnly={readOnly}
          onClick={onClick}
          className="w-full"
        />
      ) : (
        <div className="flex w-full flex-wrap items-start gap-(--sz-16)">
          <TimeFieldBlock
            variant={variant}
            label={startLabel}
            value={startValue}
            danger={danger}
            disabled={disabled}
            readOnly={readOnly}
            onClick={onStartClick}
            className="min-w-0 flex-1"
          />
          <TimeFieldBlock
            variant={variant}
            label={endLabel}
            value={endValue}
            danger={danger}
            disabled={disabled}
            readOnly={readOnly}
            onClick={onEndClick}
            className="min-w-0 flex-1"
          />
        </div>
      )}

      {helperText ? (
        <HelperLabel
          label={helperText}
          variant={danger ? "danger" : "default"}
          className="w-full"
        />
      ) : null}
    </div>
  );
}

interface TimeFieldBlockProps {
  variant: TimeFieldVariant;
  label?: string;
  value?: string;
  danger: boolean;
  disabled: boolean;
  readOnly: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * "라벨 + 버튼(아이콘+텍스트) + (line 이면) 언더라인" 필드 블록 하나. single 모드에서
 * 1번, range 모드에서 시작/종료 각각 1번씩 총 2번 렌더될 수 있어 추출했다 — 라벨↔필드
 * 그룹 사이 `gap-(--sz-10)`(2026-09-21 재확정, TextField/DateField 와 통일).
 */
function TimeFieldBlock({
  variant,
  label,
  value,
  danger,
  disabled,
  readOnly,
  onClick,
  className,
}: TimeFieldBlockProps) {
  const hasValue = Boolean(value);

  const placeholderColor = getPlaceholderColorClass(
    variant,
    disabled,
    readOnly,
  );
  const valueColor = getValueColorClass(disabled);
  const fieldChrome = getFieldChromeClass(variant, {
    danger,
    disabled,
    readOnly,
    hasValue,
  });

  const handleClick = () => {
    if (readOnly) return;
    onClick?.();
  };

  return (
    <div
      className={["flex flex-col items-start gap-(--sz-10)", className]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? (
        <Label
          label={label}
          size="sm"
          isBold={false}
          principal={false}
          info={false}
          className="w-full"
        />
      ) : null}

      <div className="flex w-full flex-col items-start gap-(--sz-8)">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          aria-invalid={danger || undefined}
          aria-readonly={readOnly || undefined}
          className={[
            "peer flex w-full items-center justify-center gap-(--sz-8) rounded-md",
            "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
            variant === "line" && "px-(--sz-2) py-(--sz-1)",
            variant === "box" &&
              "px-(--sz-8) py-(--sz-10) border-xs border-solid overflow-hidden",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            fieldChrome.container,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={ICON_SLOT_CLASS}>
            <Icon name="clock_line" size={24} className="size-full" />
          </span>
          <span className="flex min-w-0 flex-1 items-center">
            <p
              className={[
                VALUE_TYPO[variant],
                hasValue ? valueColor : placeholderColor,
                "min-w-0 flex-1 truncate text-left",
              ].join(" ")}
            >
              {hasValue ? value : PLACEHOLDER_TEXT}
            </p>
          </span>
        </button>

        {variant === "line" ? (
          <div
            className={[
              "h-(--sz-2) w-full shrink-0 rounded-circle",
              "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
              fieldChrome.underline,
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * placeholder 색(Input.tsx/DateField.tsx `getPlaceholderColorClass` 이식, 동일 실측).
 * line 만 readOnly 에서 disabled 톤(subtle)으로 흐려진다(box 는 hint-subtle 유지).
 */
function getPlaceholderColorClass(
  variant: TimeFieldVariant,
  disabled: boolean,
  readOnly: boolean,
): string {
  if (disabled) return "text-typo-disabled-subtle";
  if (readOnly && variant === "line") return "text-typo-disabled-subtle";
  return "text-typo-hint-subtle";
}

/**
 * 값(hasValue) 텍스트 색(Input.tsx/DateField.tsx `getValueColorClass` 이식, 동일
 * 실측). disabled 는 placeholder(subtle)보다 진한 disabled-normal. readOnly 는
 * "정보값 표시"가 목적이라 값 자체는 흐리지 않는다.
 */
function getValueColorClass(disabled: boolean): string {
  if (disabled) return "text-typo-disabled-normal";
  return "text-typo-neutral-normal";
}

/**
 * line 밑줄 / box 테두리·배경 클래스(Input.tsx/DateField.tsx `getFieldChromeClass`
 * 이식, 동일 실측). 우선순위: danger > disabled > readOnly > hasValue 기반 기본색 >
 * hover/focus 추가. 필드 전체가 `<button>` 하나라 `focus-within`/
 * `group-focus-within` 대신 `focus-visible`(box, 자기 자신) / `peer-focus-visible`
 * (line 밑줄, 버튼과 형제) 을 쓴다.
 */
function getFieldChromeClass(
  variant: TimeFieldVariant,
  {
    danger,
    disabled,
    readOnly,
    hasValue,
  }: {
    danger: boolean;
    disabled: boolean;
    readOnly: boolean;
    hasValue: boolean;
  },
): { container: string; underline: string } {
  if (variant === "box") {
    if (disabled) {
      return {
        container: "border-border-disabled-normal bg-bg-disabled-subtle",
        underline: "",
      };
    }
    if (danger) {
      return {
        container: "border-border-danger-normal bg-bg-danger-bright",
        underline: "",
      };
    }
    const baseBorder = hasValue
      ? "border-border-brand-normal"
      : "border-border-neutral-light";
    if (readOnly) {
      return { container: baseBorder, underline: "" };
    }
    return {
      container: [
        baseBorder,
        "hover:bg-bg-overlay-greenGraySubtle",
        "focus-visible:border-border-brand-normal",
      ].join(" "),
      underline: "",
    };
  }

  // line
  if (disabled) {
    return { container: "", underline: "bg-bg-neutral-deepDark" };
  }
  if (danger) {
    return { container: "", underline: "bg-bg-danger-normal" };
  }
  if (readOnly) {
    return {
      container: "",
      underline: hasValue ? "bg-bg-brand-normal" : "bg-bg-neutral-deepDark",
    };
  }
  return {
    container: "hover:bg-bg-overlay-greenGraySubtle",
    underline: hasValue
      ? "bg-bg-brand-normal"
      : "bg-bg-neutral-deepDark peer-focus-visible:bg-bg-brand-normal",
  };
}
