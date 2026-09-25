/**
 * DateField — 날짜(또는 날짜 범위) 선택 트리거 필드. 실제 편집 가능한 `<input>` 은
 * 갖지 않고, 값을 텍스트로 "표시"만 한 뒤 클릭 시 부모가 별도 DatePicker(이번 범위 밖,
 * 아직 미구현)를 열도록 위임하는 버튼 필드다.
 *
 * Figma "또가3.0 Design System / DateField" (컴포넌트 세트 node 51405:68159) 와 1:1 —
 * Figma 설명에 "TimeField 와 동일한 디자인을 사용한다. 둘 중 하나가 수정되면 함께
 * 고려해서 반영한다" 고 명시돼 있다(TimeField 는 이번 범위 밖).
 *
 * 축(Figma property → props):
 * - `type`   : line(밑줄형, 기본) / box(테두리 박스형) → `variant`(기존 Input/TextField
 *   관례를 따라 이름을 `type` 이 아니라 `variant` 로 정규화).
 * - `variant`: single(단일 날짜) / range(기간) → `mode`(Figma 의 `variant` 를 `type` 과
 *   구분하기 위해 `mode` 로 정규화).
 * - `hasValue`: 별도 prop 없이 `mode` 별 value 류 prop 존재 여부로 판단(Input 과 동일
 *   패턴) — single 은 `value`, range 는 `startValue`/`endValue` 중 하나라도 있으면
 *   값이 있는 것으로 본다.
 * - `state`  : enable(기본) / hover(→`:hover`) / focus(→`:focus-visible`, 필드 전체가
 *   `<button>` 이라 Input 처럼 `focus-within` 을 쓸 필요가 없다) / danger(→`danger`
 *   prop) / disabled(→ 네이티브 `<button disabled>`) / readOnly(→ `readOnly` prop,
 *   네이티브 `readOnly` 속성이 없는 `<button>` 이라 `onClick` 호출 자체를 스킵하는
 *   방식으로 구현).
 * - `label`/`helper` boolean → `label?: string` / `helperText?: string` presence 기반
 *   (TextField 와 동일 패턴). `Label`/`HelperLabel` 조합. `Label` 은 `principal`/`info`
 *   를 모두 `false` 로 고정한다 — Figma 세트의 Label 인스턴스는 그 두 값이 컴포넌트
 *   기본값(true)으로 남아있어 `*`/정보아이콘이 찍혀 있을 뿐, DateField 자체 스펙엔
 *   필수 표시나 정보 버튼 축이 없다(TextField 처럼 `required`/`onInfoClick` 을 받지
 *   않기로 확정).
 *
 * 구조(2026-09-21 재확정 — Label↔필드 gap 을 TextField/TimeField 와 10px 로 통일):
 * - `get_design_context` 대조 결과 Figma 상 TextField/TimeField 는 Label↔필드 16px,
 *   DateField 는 8px 로 세 컴포넌트 디자인이 어긋나 있었다(Figma 컴포넌트 설명엔
 *   "TimeField 와 동일한 디자인" 이라고 명시돼 있어 드리프트로 판단). 최종적으로
 *   **10px 로 통일하기로 결정**했다(Figma 원본은 사용자가 직접 동기화할 예정 — 코드가
 *   Figma 실측치와 의도적으로 다른 구간).
 * - 루트: `flex-col gap-(--sz-8)` — "Label & Field" 래퍼 / `HelperLabel` 세로 배치
 *   (이 gap 은 변경 없음, 원래부터 8px).
 * - "Label & Field" 래퍼: `flex-col gap-(--sz-10)` — `Label` / 필드(버튼+언더라인)
 *   그룹.
 * - 필드 그룹(버튼+언더라인): `flex-col gap-(--sz-8)` — 변경 없음.
 * - 필드: 좌측 24px `calendar_line` 아이콘 고정(자유 슬롯 아님, 상태 불문 색
 *   `icon/neutral/light`(`#878787`) 고정 — `get_variable_defs` 로 danger/disabled 등
 *   모든 state 를 대조해 확인, 변하지 않는다) + 우측 텍스트 표시 영역.
 * - `<input>` 대신 `<button type="button">` 으로 필드 전체(아이콘+텍스트)를 감싼다.
 *   `onClick` 은 disabled 가 아니고 readOnly 가 아닐 때만 호출한다:
 *   - `disabled` → 네이티브 `disabled` 로 포커스 자체를 막는다.
 *   - `readOnly` → 포커스는 가능하지만 클릭 콜백만 스킵한다(Input 의 "정보값 표시
 *     전용" 설명과 동일 취지 — 다만 `<input readOnly>` 와 달리 `<button>` 엔 네이티브
 *     `readOnly` 가 없어 직접 분기한다).
 *
 * 값 표시(`<input>` 금지 — 순수 텍스트만):
 * - `mode="single"`: `value` 있으면 값 색(`typo-neutral-normal`, disabled 시
 *   `typo-disabled-normal`), 없으면 placeholder "날짜 선택"(`typo-hint-subtle`, 단
 *   disabled/readOnly(line 전용) 는 `typo-disabled-subtle` — 아래 색 로직 참고).
 * - `mode="range"`: `startValue`/`endValue` 중 하나라도 있으면
 *   "{startValue} ~ {endValue}" 형태로 렌더하되, 물결(`~`)만
 *   `text-typo-neutral-light`(Figma 실측 hex `#717171` = `--color-gray-600` 과 정확히
 *   일치)로 별도 색 처리하고 날짜 부분은 단일 모드와 동일한 값 색을 쓴다. 둘 다 없으면
 *   단일 모드와 동일한 placeholder 를 그대로 재사용한다(Figma 는 두 날짜 placeholder
 *   문구를 별도로 정의하지 않았다).
 *
 * 색 로직은 `Input`(`src/components/ui/Input/Input.tsx`) 의 line/box 로직을 그대로
 * 이식했다(값 자체는 Input 문서의 표와 100% 동일함을 `get_design_context`/
 * `get_variable_defs` 로 48 variant 중 대표 조합을 직접 대조해 재검증했다) — 다만
 * `<input>` 이 아니라 `<button>` 하나가 필드 전체이므로, Input 이 쓰던
 * `group`/`focus-within`(부모 래퍼가 자식 `<input>` 의 포커스를 감지하는 패턴) 대신:
 * - line 밑줄(버튼과 형제 `<div>`) 은 버튼에 `peer` 를 주고 밑줄에
 *   `peer-focus-visible:` 를 사용한다.
 * - box 테두리(버튼 자기 자신)는 그냥 버튼 자신의 `focus-visible:` 을 쓴다(별도 peer
 *   불필요).
 *
 * state 별 색 매핑은 Input.tsx JSDoc 표를 그대로 따른다(중복 기술하지 않음) — 우선순위
 * danger > disabled > readOnly > hasValue 순.
 *
 * 타이포: 값·placeholder `text-body-1`(22px, line) / `text-body-3`(18px, box) — Input
 * 과 동일.
 */

import { Icon } from "../../../icons";
import { HelperLabel } from "../HelperLabel";
import { Label } from "../Label";

export type DateFieldVariant = "line" | "box";
export type DateFieldMode = "single" | "range";

export interface DateFieldProps {
  /** 시각 형태(Figma `type`). 기본 'line' */
  variant?: DateFieldVariant;
  /** 단일 날짜 / 기간(Figma `variant`). 기본 'single' */
  mode?: DateFieldMode;
  /** 라벨 텍스트. 있을 때만 `Label` 렌더 */
  label?: string;
  /** 헬퍼 텍스트. 있을 때만 `HelperLabel` 렌더(danger 면 경고 아이콘 + 빨간색) */
  helperText?: string;
  /** mode='single' 일 때 표시할 값(controlled, 표시 전용 — 직접 편집 불가) */
  value?: string;
  /** mode='range' 일 때 표시할 시작 값 */
  startValue?: string;
  /** mode='range' 일 때 표시할 끝 값 */
  endValue?: string;
  /** 에러/경고 상태(Figma `state=danger`) */
  danger?: boolean;
  /** 비활성화(Figma `state=disabled`) — 네이티브 `<button disabled>` */
  disabled?: boolean;
  /**
   * 읽기 전용(Figma `state=readOnly`, "직접 편집할 수 없고 입력된 정보값 표시만 함").
   * 포커스는 가능하지만 `onClick` 콜백 호출은 스킵된다.
   */
  readOnly?: boolean;
  /** 필드 클릭 시 호출(호출부가 DatePicker 등 오버레이를 열도록 위임). disabled/readOnly 면 호출되지 않는다 */
  onClick?: () => void;
  /** 루트에 병합할 클래스 */
  className?: string;
}

const PLACEHOLDER_TEXT = "날짜 선택";

/** variant 별 값·placeholder 타이포(Input 과 동일 실측). */
const VALUE_TYPO: Record<DateFieldVariant, string> = {
  line: "text-body-1",
  box: "text-body-3",
};

/** 좌측 calendar 아이콘 슬롯 — 24px 고정, 상태 불문 `icon/neutral/light` 고정색(Figma 실측). */
const ICON_SLOT_CLASS =
  "flex size-(--sz-24) shrink-0 items-center justify-center text-icon-neutral-light";

export function DateField({
  variant = "line",
  mode = "single",
  label,
  helperText,
  value,
  startValue,
  endValue,
  danger = false,
  disabled = false,
  readOnly = false,
  onClick,
  className,
}: DateFieldProps) {
  const hasValue =
    mode === "range"
      ? Boolean(startValue) || Boolean(endValue)
      : Boolean(value);

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
      data-variant={variant}
      data-mode={mode}
      data-danger={danger}
      data-disabled={disabled}
      data-readonly={readOnly}
      className={["flex w-full flex-col items-start gap-(--sz-8)", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col items-start gap-(--sz-10)">
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
              <Icon name="calendar_line" size={24} className="size-full" />
            </span>
            <span className="flex min-w-0 flex-1 items-center">
              {hasValue ? (
                mode === "range" ? (
                  <p
                    className={[
                      VALUE_TYPO[variant],
                      "min-w-0 flex-1 truncate text-left",
                    ].join(" ")}
                  >
                    <span className={valueColor}>{startValue}</span>{" "}
                    <span className="text-typo-neutral-light">~</span>{" "}
                    <span className={valueColor}>{endValue}</span>
                  </p>
                ) : (
                  <p
                    className={[
                      VALUE_TYPO[variant],
                      valueColor,
                      "min-w-0 flex-1 truncate text-left",
                    ].join(" ")}
                  >
                    {value}
                  </p>
                )
              ) : (
                <p
                  className={[
                    VALUE_TYPO[variant],
                    placeholderColor,
                    "min-w-0 flex-1 truncate text-left",
                  ].join(" ")}
                >
                  {PLACEHOLDER_TEXT}
                </p>
              )}
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

/**
 * placeholder 색(Input.tsx `getPlaceholderColorClass` 이식, 동일 실측).
 * line 만 readOnly 에서 disabled 톤(subtle)으로 흐려진다(box 는 hint-subtle 유지).
 */
function getPlaceholderColorClass(
  variant: DateFieldVariant,
  disabled: boolean,
  readOnly: boolean,
): string {
  if (disabled) return "text-typo-disabled-subtle";
  if (readOnly && variant === "line") return "text-typo-disabled-subtle";
  return "text-typo-hint-subtle";
}

/**
 * 값(hasValue) 텍스트 색(Input.tsx `getValueColorClass` 이식, 동일 실측). disabled 는
 * placeholder(subtle)보다 진한 disabled-normal. readOnly 는 "정보값 표시"가 목적이라
 * 값 자체는 흐리지 않는다.
 */
function getValueColorClass(disabled: boolean): string {
  if (disabled) return "text-typo-disabled-normal";
  return "text-typo-neutral-normal";
}

/**
 * line 밑줄 / box 테두리·배경 클래스(Input.tsx `getFieldChromeClass` 이식, 동일 실측).
 * 우선순위: danger > disabled > readOnly > hasValue 기반 기본색 > hover/focus 추가.
 * Input 과 달리 필드 전체가 `<button>` 하나라 `focus-within`/`group-focus-within`
 * 대신 `focus-visible`(box, 자기 자신) / `peer-focus-visible`(line 밑줄, 버튼과 형제) 을 쓴다.
 */
function getFieldChromeClass(
  variant: DateFieldVariant,
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
