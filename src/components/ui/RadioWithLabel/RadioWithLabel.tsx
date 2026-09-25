/**
 * 라벨 라디오(RadioWithLabel).
 *
 * Figma "또가3.0 Design System / RadioWithLabel" (node 51405:128280) 와 1:1.
 * `Radio` 아톰(node 51405:128241)에 라벨 텍스트와 넓은 히트영역을 더한 MOLECULE 다.
 * `CheckboxWithLabel` 이 `Checkbox` 를 합성하는 패턴을 그대로 따른다.
 *
 * 구현:
 * - 루트는 `<label class="group">`. 그 안에 시각적으로 숨긴 native `<input type="radio" class="peer sr-only">`
 *   + `Radio` 아톰 + 라벨 `<span>` 을 둔다. label/원/텍스트 어디를 눌러도 native 하게 선택된다
 *   (암시적 라벨 연결 — `htmlFor`/`id` 불필요, `id` 는 passthrough).
 * - controlled(`checked` + `onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원.
 *   `onChange` 는 네이티브 `ChangeEventHandler<HTMLInputElement>` 를 그대로 전달한다.
 *   `checked` 외 나머지 input 속성(`name`·`value`·`required` 등)은 `...rest` 로 `<input>` 에 spread —
 *   같은 그룹 내 단일 선택(라디오 그룹)은 Figma 범위 밖이라 별도 `RadioGroup` 을 만들지 않고
 *   호출부가 `name` 을 공유해 네이티브 라디오 그룹 동작을 그대로 쓴다(`Checkbox` 계열과 동일 스코프 원칙).
 *   단, 여러 인스턴스를 전부 uncontrolled(`defaultChecked`)로 렌더하면 각 인스턴스가 독립된 내부
 *   state 를 가지므로, 브라우저가 형제를 native 하게 선택 해제해도 그 형제의 시각 상태가 즉시
 *   갱신되지 않을 수 있다 — 라디오 그룹은 부모가 `checked`+`onChange` 로 관리하는 controlled 패턴을
 *   권장한다.
 * - hover: `<label class="group">` → 아톰이 `group-hover:` 로 배경/점을 전이한다.
 * - focus: Figma 에 없음. repo `Button`/`CheckboxWithLabel` 의 focus 어포던스(링 대신 opacity dip)를 따라
 *   `peer-focus-visible:opacity-(--alpha-80)` 를 라디오 래퍼에 적용한다.
 * - disabled: `<input disabled>` + `<Radio disabled>` + 라벨 `typo/disabled/normal` + `cursor-not-allowed`.
 * - 정렬: 루트 `items-start` — 라벨이 여러 줄이면 라디오는 첫 줄에 맞춰 정렬된다.
 *   라디오 래퍼에 size 별 `pt` 를 줘 첫 줄 텍스트와 광학적으로 정렬한다.
 * - 라벨 색은 `checked` 여부와 무관하다(`disabled` 만 색을 바꾼다) — `CheckboxCard` 와 달리
 *   `CheckboxWithLabel` 과 동일한 규칙(Figma node 51405:128280 검증, 체크해도 브랜드색으로 안 바뀜).
 *
 * 축(Figma property → props):
 * - `size`   : sm / md / lg   (아톰에 passthrough)
 * - `checked`: true / false
 * - `bold`   : 라벨 굵기(Figma `isBold` 축)
 * - `state`  : enabled(기본) / hovered(→ `:hover`) / disabled(→ `disabled` prop)
 *
 * size 별 토큰(Figma node 51405:128280 검증 — `CheckboxWithLabel` 과 수치 동일):
 * | size | 루트 gap   | 라디오 래퍼 pt | 라벨 타이포(normal / bold)          | 아톰 size |
 * | sm   | --sz-8    | --sz-2         | text-body-4 / text-body-4-bold     | sm        |
 * | md   | --sz-8    | --sz-1         | text-body-3 / text-body-3-bold     | md        |
 * | lg   | --sz-10   | --sz-1         | text-body-2 / text-body-2-bold     | lg        |
 *
 * 색·크기·간격·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

import {
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { Radio, type RadioSize } from "../Radio";

export interface RadioWithLabelProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "children" | "type"
> {
  /** 크기 축. 기본 'md' */
  size?: RadioSize;
  /** 라벨을 Bold 로 표시할지 여부. 기본 false */
  bold?: boolean;
  /** 라벨 콘텐츠(필수). */
  children: ReactNode;
  /** 루트 `<label>` 에 전달할 클래스. */
  className?: string;
}

/** 루트 공통 — group(아톰 hover 전파) · 상단 정렬 · font-feature. */
const ROOT_CLASS =
  "group inline-flex items-start [font-feature-settings:var(--font-feature-case)]";

/** 라디오 래퍼 공통 — 세로 중앙 · 축소 방지 · 키보드 포커스 어포던스 · 전이. */
const LEFT_CLASS =
  "inline-flex shrink-0 items-center " +
  "peer-focus-visible:opacity-(--alpha-80) " +
  "transition-opacity duration-150 ease-in-out motion-reduce:transition-none";

/** size 별 루트 좌우 간격(라디오 ↔ 라벨). */
const SIZE_GAP: Record<RadioSize, string> = {
  sm: "gap-(--sz-8)",
  md: "gap-(--sz-8)",
  lg: "gap-(--sz-10)",
};

/** size 별 라디오 래퍼 상단 패딩(첫 줄 텍스트와 광학 정렬). */
const SIZE_PT: Record<RadioSize, string> = {
  sm: "pt-(--sz-2)",
  md: "pt-(--sz-1)",
  lg: "pt-(--sz-1)",
};

/** size 별 라벨 합성 타이포 유틸(normal / bold). */
const SIZE_TYPO: Record<RadioSize, { normal: string; bold: string }> = {
  sm: { normal: "text-body-4", bold: "text-body-4-bold" },
  md: { normal: "text-body-3", bold: "text-body-3-bold" },
  lg: { normal: "text-body-2", bold: "text-body-2-bold" },
};

export function RadioWithLabel({
  size = "md",
  bold = false,
  children,
  className,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  ...rest
}: RadioWithLabelProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isChecked = checked ?? internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  return (
    <label
      data-size={size}
      data-checked={isChecked}
      data-state={disabled ? "disabled" : "enable"}
      data-bold={bold}
      className={[
        ROOT_CLASS,
        SIZE_GAP[size],
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="radio"
        className="peer sr-only"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        {...rest}
      />
      <span className={[LEFT_CLASS, SIZE_PT[size]].join(" ")}>
        <Radio size={size} checked={isChecked} disabled={disabled} />
      </span>
      <span
        className={[
          "[word-break:break-word]",
          bold ? SIZE_TYPO[size].bold : SIZE_TYPO[size].normal,
          disabled ? "text-typo-disabled-normal" : "text-typo-neutral-normal",
        ].join(" ")}
      >
        {children}
      </span>
    </label>
  );
}
