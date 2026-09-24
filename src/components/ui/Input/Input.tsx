/**
 * Input — 순수 입력 필드 프리미티브(테두리/배경 스타일 + 실제 `<input>` 엘리먼트만,
 * 라벨·헬퍼텍스트·필수 표시·정보 버튼 없음).
 *
 * Figma "또가3.0 Design System / Input" 컴포넌트 세트(node 51405:104612) 와 1:1 —
 * 단, `variant`(구 `type`) 는 line/box 두 값뿐이었던 원본 세트를 `transparentBody`/
 * `transparentTitle` 까지 포함하도록 이 컴포넌트 레벨에서 확장했다(아래 참고).
 * 참고로 준 node 51405:104597 은 TextField 작업 때와 동일한 패턴으로 별도 컴포넌트가
 * 아니라 Input 스펙/가이드 페이지(Main Component 미리보기 + Guide 의 Spec·Anatomy·
 * Props 테이블)이므로, line/box 실제 구현은 104612 세트(`get_design_context` 로 직접
 * 확인한 24개 variant 조합 — type 2 × state 6 × hasValue 2)를 그대로 따른다.
 *
 * `TextField`(`src/components/ui/TextField`)가 원래는 이 Input 을 조합해 label/
 * helperText/required/info버튼을 얹었어야 하는 구조였지만, 먼저 TextField 를 통짜로
 * 구현한 이력이 있다.
 * **(2026-09-17 line/box 리팩토링)** TextField 는 line/box variant 에 한해 이 Input 을
 * 그대로 조합하도록 리팩토링됐다.
 * **(2026-09-17 transparent 흡수)** `transparentBody`/`transparentTitle` 은 Figma
 * "TextField" 컴포넌트 세트(node 51405:141075)에만 있던 축이라(Input 세트 104612 자체엔
 * 없음) 처음엔 TextField 가 자체 렌더링으로 유지했으나, 이번에 TextField 요청에 따라 이
 * Input 원자 컴포넌트로 흡수했다(값 자체는 TextField 의 기존 Figma 검증 로직을 그대로
 * 이식 — 새로 재판단하지 않음). TextField 는 이제 4개 variant 전부 `Label`+`Input`+
 * `HelperLabel` 조합만으로 구성되는 순수 합성 컴포넌트다. 상세는 `TextField.tsx` 상단
 * JSDoc 참고.
 *
 * 축(Figma variant/state → props):
 * - `variant` : line(밑줄형, 기본) / box(테두리 박스형) — Figma Input 세트(104612)
 *   `type` 프로퍼티 그대로. / transparentBody(크롬 없는 중앙정렬 텍스트) /
 *   transparentTitle(크롬 없는 26px 볼드 타이틀형) — **출처는 Input 세트가 아니라
 *   TextField 세트(141075)**, 이 컴포넌트로 흡수된 축(위 이력 참고).
 * - `state`   : enable(기본) / hover(→ `:hover`) / focus(→ `:focus-within`) /
 *   danger(→ `danger` prop) / disabled(→ 네이티브 `disabled`) / readOnly(→ 네이티브
 *   `readOnly`, Figma 설명: "직접 편집할 수 없고 입력된 정보값 표시만 함"). 아래는 모두
 *   line/box 기준 — transparentBody/transparentTitle 은 테두리·배경 자체가 없어
 *   hover/focus/readOnly 로 인한 시각 변화가 Figma 실측상 없다(disabled 만 존재).
 * - `hasValue`: 별도 prop 없이 `value` 존재 여부로 판단(placeholder ↔ 입력값 렌더 분기 +
 *   line 밑줄/box 테두리 색 결정에 사용).
 * - 좌측 `startIcon`/우측 `iconButton`(Figma 설명: "색상을 자유롭게 변경하여 사용" —
 *   범용 24px 슬롯) → `startIcon?`/`endIcon?: ReactNode`. Figma 상 endIcon(iconButton)
 *   은 `iconButton=true` 이면 **모든 state 에서 항상 렌더**된다(hover/focus 전용이 아님).
 *   **line/box 전용** — transparentBody/transparentTitle 은 Figma 구조상 이 슬롯 자체가
 *   없어 두 prop 을 넘겨도 렌더하지 않는다.
 * - `clearButton`(18px, `x_circle_solid`) → 기존 `ClearButton`(size="md") 재사용.
 *   **TextField 선례 재사용(의도적 조정)**: Figma 는 hover/focus 상태에서만 clearButton
 *   을 노출하지만, 이 프로젝트는 모바일 중심이라 호버가 없는 터치 환경에서 지우기 버튼이
 *   영영 노출되지 않는 문제가 생긴다. TextField/Searchbar 선례를 따라 `value` 가 있고
 *   `disabled`/`readOnly` 가 아니면 항상 노출한다. **line/box 전용** — transparentBody/
 *   transparentTitle 은 원본 TextField 자체 렌더에도 clearButton 이 없었으므로 노출하지
 *   않는다.
 *   **(2026-09-17 클릭 동작 수정)** 클릭 시 `onClear` 콜백 유무와 무관하게 항상
 *   `onChange('')` 로 실제 값을 비운다. `onClear` 는 그 위에 얹는 부가 알림용 콜백일 뿐,
 *   상태 초기화 책임을 호출부에 떠넘기지 않는다(과거엔 `onClear` 를 넘기면 `onChange` 가
 *   호출되지 않아, 호출부가 `onClear` 안에서 직접 상태를 안 비우면 clear 버튼이 시각적으로
 *   동작하지 않는 문제가 있었다).
 * - line 밑줄 `_animate/InputLine`(percent 0→100 JS 성장 애니메이션, Figma 노트의
 *   codepen 예시) → **의도적 조정**: TextField 선례와 동일하게 실제 폭 성장 애니메이션
 *   대신 배경색 `transition-colors` 로 대체한다.
 *
 * state 별 색 매핑(Figma 실측, 우선순위 danger > disabled > readOnly > 나머지):
 *
 * | variant | enable(밑줄/테두리)                                          | hover 추가                                    | focus 추가                                        | danger                                            | disabled                                             | readOnly                                                                 |
 * | ------- | -------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
 * | line    | `bg-bg-neutral-deepDark`(빈값) / `bg-bg-brand-normal`(값 있음) | `hover:bg-bg-overlay-greenGraySubtle`(inner)    | `focus-within:bg-bg-brand-normal`(빈값일 때만)         | `bg-bg-danger-normal`                                | `bg-bg-neutral-deepDark`(불변)                            | 빈값=`bg-bg-neutral-deepDark` / 값있음=`bg-bg-brand-normal`(hover 없음)        |
 * | box     | `border-border-neutral-light`(빈값) / `border-border-brand-normal`(값 있음) | `hover:bg-bg-overlay-greenGraySubtle`(테두리색 유지) | `focus-within:border-border-brand-normal`(빈값일 때만 시각 변화) | `border-border-danger-normal bg-bg-danger-bright` | `border-border-disabled-normal bg-bg-disabled-subtle` | 빈값=`border-border-neutral-light` / 값있음=`border-border-brand-normal`(hover 없음) |
 *
 * transparentBody/transparentTitle 텍스트 색(Figma 실측, TextField 세트 141075 출처 —
 * disabled 분기만 존재, hover/focus/readOnly/danger 는 텍스트 색 불변):
 *
 * | variant          | placeholder                                          | value(hasValue)      | disabled                                              |
 * | ---------------- | ----------------------------------------------------- | --------------------- | ------------------------------------------------------- |
 * | transparentBody   | `typo-hint-subtle`                                    | `typo-neutral-normal` | `typo-disabled-subtle`                                   |
 * | transparentTitle  | `typo-hint-light`                                     | `typo-info-normal`(브랜드green 아닌 파랑) | `typo-disabled-subtle` + `opacity-[var(--alpha-60)]` |
 *
 * **TextField 대비 line/box 실측 차이(2026-09-17 리팩토링으로 정정 완료)**:
 * 1. disabled + 값 있음일 때 텍스트 색은 `typo-disabled-normal`(placeholder 보다 진함) —
 *    TextField 는 이 케이스도 `typo-disabled-subtle` 로 통일해뒀지만, Input 세트(104612)
 *    를 직접 재확인한 결과 placeholder(subtle)와 값(normal)이 서로 다른 토큰이었다.
 * 2. box 변형의 테두리색은 `readOnly`/`enable` 모두 hover·focus 여부와 무관하게
 *    `hasValue` 만으로 브랜드색 전환이 일어난다(line 밑줄과 동일 규칙) — TextField 는 box
 *    를 `focus-within:border-border-brand-normal` 로만 전환해서 `enable + 값 있음` /
 *    `readOnly + 값 있음` 조합에서 여전히 회색 테두리를 쓰고 있었다.
 *
 * 타이포: 값·placeholder `text-body-1`(22px, line/transparentBody) / `text-body-3`
 * (18px, box) / `text-title-1`(26px bold, transparentTitle). transparentBody 는
 * 추가로 텍스트 중앙정렬(`text-center`).
 */

import {
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { ClearButton } from "../ClearButton";

export type InputVariant =
  "line" | "box" | "transparentBody" | "transparentTitle";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "onChange" | "children" | "className"
> {
  /** 시각 형태(Figma `type`). 기본 'line' */
  variant?: InputVariant;
  /** 좌측 24px 아이콘 슬롯 */
  startIcon?: ReactNode;
  /** 우측 24px 커스텀 아이콘 슬롯(Figma: "색상을 자유롭게 변경하여 사용"). 모든 state 에서 항상 렌더 */
  endIcon?: ReactNode;
  /** controlled value */
  value?: string;
  /** 입력값 변경 */
  onChange?: (value: string) => void;
  /**
   * 지우기 버튼 클릭 시 부가 알림 콜백(`value` 가 있고 disabled/readOnly 가 아닐 때만 노출).
   * 실제 값 clear(`onChange('')`)는 이 콜백 유무와 무관하게 항상 일어난다 — `onClear` 는
   * "지워졌다"는 side-effect(분석 로그 등) 용도로만 쓰고, 상태 초기화를 직접 책임질 필요는 없다.
   */
  onClear?: () => void;
  /** 지우기 버튼 접근성 라벨. 기본 '지우기' */
  clearLabel?: string;
  /** 에러/경고 상태(Figma `state=danger`) */
  danger?: boolean;
  /** 루트에 병합할 클래스 */
  className?: string;
  /** 네이티브 `<input>` 에 병합할 클래스 */
  inputClassName?: string;
}

/** variant 별 값·placeholder 타이포. */
const VALUE_TYPO: Record<InputVariant, string> = {
  line: "text-body-1",
  box: "text-body-3",
  transparentBody: "text-body-1",
  transparentTitle: "text-title-1",
};

const ICON_SLOT_CLASS =
  "flex size-[var(--sz-24)] shrink-0 items-center justify-center";

export function Input({
  variant = "line",
  startIcon,
  endIcon,
  value,
  onChange,
  onClear,
  clearLabel = "지우기",
  placeholder,
  danger = false,
  disabled = false,
  readOnly = false,
  className,
  inputClassName,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hasValue = Boolean(value);
  const isTransparent =
    variant === "transparentBody" || variant === "transparentTitle";
  const showClear = hasValue && !disabled && !readOnly && !isTransparent;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  const handleClear = () => {
    onChange?.("");
    onClear?.();
  };

  const placeholderColor = isTransparent
    ? getTransparentPlaceholderColorClass(variant, disabled)
    : getPlaceholderColorClass(variant, disabled, readOnly);
  const valueColor = isTransparent
    ? getTransparentValueColorClass(variant, disabled)
    : getValueColorClass(disabled);
  const fieldChrome = isTransparent
    ? { container: "", underline: "" }
    : getFieldChromeClass(variant, {
        danger,
        disabled,
        readOnly,
        hasValue,
      });

  const inputEl = (
    <input
      id={inputId}
      type="text"
      value={value ?? ""}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={danger || undefined}
      className={[
        "min-w-0 flex-1 truncate bg-transparent outline-none",
        VALUE_TYPO[variant],
        hasValue ? valueColor : placeholderColor,
        `placeholder:${placeholderColor}`,
        variant === "transparentBody" ? "text-center" : "",
        disabled ? "cursor-not-allowed" : "",
        inputClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );

  return (
    <div
      data-variant={variant}
      data-danger={danger}
      data-disabled={disabled}
      data-readonly={readOnly}
      className={[
        "group flex w-full flex-col items-start gap-[var(--sz-8)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex w-full items-center gap-[var(--sz-8)] rounded-md",
          !isTransparent &&
            "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
          isTransparent && "justify-center",
          variant === "line" && "px-[var(--sz-2)] py-[var(--sz-1)]",
          variant === "box" &&
            "px-[var(--sz-8)] py-[var(--sz-10)] border-xs border-solid overflow-hidden",
          variant === "transparentBody" && "p-[var(--sz-2)]",
          variant === "transparentTitle" && "h-[var(--sz-46)]",
          fieldChrome.container,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {startIcon && !isTransparent ? (
          <span className={ICON_SLOT_CLASS}>{startIcon}</span>
        ) : null}
        <div className="flex min-w-0 flex-1 items-center">{inputEl}</div>
        {showClear ? (
          <ClearButton size="md" label={clearLabel} onClick={handleClear} />
        ) : null}
        {endIcon && !isTransparent ? (
          <span className={ICON_SLOT_CLASS}>{endIcon}</span>
        ) : null}
      </div>

      {variant === "line" ? (
        <div
          className={[
            "h-[var(--sz-2)] w-full shrink-0 rounded-circle",
            "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
            fieldChrome.underline,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}
    </div>
  );
}

/**
 * placeholder 색(Figma 실측).
 * - line 만 readOnly 에서 disabled 톤(subtle)으로 흐려진다(box 는 hint-subtle 유지, 불변).
 */
function getPlaceholderColorClass(
  variant: InputVariant,
  disabled: boolean,
  readOnly: boolean,
): string {
  if (disabled) return "text-typo-disabled-subtle";
  if (readOnly && variant === "line") return "text-typo-disabled-subtle";
  return "text-typo-hint-subtle";
}

/**
 * 값(hasValue) 텍스트 색. disabled 는 placeholder(subtle)보다 진한 disabled-normal
 * 을 쓴다(Figma 실측 — 값이 있다는 걸 알아볼 수 있게 대비를 남긴다).
 * readOnly 는 "정보값 표시"가 목적이라 값 자체는 흐리지 않는다(placeholder 와 다름).
 */
function getValueColorClass(disabled: boolean): string {
  if (disabled) return "text-typo-disabled-normal";
  return "text-typo-neutral-normal";
}

/**
 * transparentBody/transparentTitle 전용 placeholder 색(Figma 실측, TextField 세트
 * 141075 출처 — 이 Input 원자 컴포넌트로 그대로 이식). line/box 는
 * `getPlaceholderColorClass` 가 다루므로 여기서 다루지 않는다(hover/focus/readOnly 는
 * Figma 실측상 두 variant 모두 텍스트 색조차 바뀌지 않아 disabled 분기만 존재).
 * - transparentTitle 은 기본이 더 밝은 hint-light, disabled 는 dim 색 + 추가 opacity-60.
 */
function getTransparentPlaceholderColorClass(
  variant: InputVariant,
  disabled: boolean,
): string {
  if (disabled && variant === "transparentTitle") {
    return "text-typo-disabled-subtle opacity-[var(--alpha-60)]";
  }
  if (disabled) return "text-typo-disabled-subtle";
  if (variant === "transparentTitle") return "text-typo-hint-light";
  return "text-typo-hint-subtle";
}

/**
 * transparentBody/transparentTitle 전용 값(hasValue) 텍스트 색(Figma 실측, TextField
 * 세트 141075 출처 — 이 Input 원자 컴포넌트로 그대로 이식). transparentTitle 만 브랜드
 * 대신 info(파랑). line/box 는 `getValueColorClass` 가 다루므로 여기서 다루지 않는다.
 */
function getTransparentValueColorClass(
  variant: InputVariant,
  disabled: boolean,
): string {
  if (disabled && variant === "transparentTitle") {
    return "text-typo-disabled-subtle opacity-[var(--alpha-60)]";
  }
  if (disabled) return "text-typo-disabled-subtle";
  if (variant === "transparentTitle") return "text-typo-info-normal";
  return "text-typo-neutral-normal";
}

/**
 * line 밑줄 / box 테두리·배경 클래스.
 * 우선순위: danger > disabled > readOnly > hasValue 기반 기본색 > hover/focus 추가.
 */
function getFieldChromeClass(
  variant: InputVariant,
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
        "focus-within:border-border-brand-normal",
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
      : "bg-bg-neutral-deepDark group-focus-within:bg-bg-brand-normal",
  };
}
