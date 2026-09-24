/**
 * 라벨 체크박스(CheckboxWithLabel).
 *
 * Figma "또가3.0 Design System / CheckboxWithLabel" (node 51405:45495) 와 1:1.
 * `Checkbox` 아톰(node 51405:45384)에 라벨 텍스트와 넓은 히트영역을 더한 MOLECULE 다.
 * `ButtonWithLabel` 이 `Button` 을 합성하듯, 이 컴포넌트가 `Checkbox` 아톰을 합성한다.
 *
 * 구현:
 * - 루트는 `<label class="group">`. 그 안에 시각적으로 숨긴 native `<input type="checkbox" class="peer sr-only">`
 *   + `Checkbox` 아톰 + 라벨 `<span>` 을 둔다. label/checkbox/텍스트 어디를 눌러도 native 하게 토글된다
 *   (암시적 라벨 연결 — `htmlFor`/`id` 불필요, `id` 는 passthrough).
 * - controlled(`checked` + `onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원.
 *   `onChange` 는 네이티브 `ChangeEventHandler<HTMLInputElement>` 를 그대로 전달한다.
 *   `checked` 외 나머지 input 속성(`name`·`value`·`required` 등)은 `...rest` 로 `<input>` 에 spread.
 * - hover: `<label class="group">` → 아톰이 `group-hover:` 로 배경/체크마크를 전이한다.
 * - focus: Figma 에 없음. repo `Button` 의 focus 어포던스(링 대신 opacity dip)를 따라
 *   `peer-focus-visible:opacity-[var(--alpha-80)]` 를 체크박스 래퍼에 적용한다.
 * - disabled: `<input disabled>` + `<Checkbox disabled>` + 라벨 `typo/disabled/normal` + `cursor-not-allowed`.
 * - 정렬: 루트 `items-start` — 라벨이 여러 줄이면 체크박스는 첫 줄에 맞춰 정렬된다.
 *   체크박스 래퍼에 size 별 `pt` 를 줘 첫 줄 텍스트와 광학적으로 정렬한다.
 *
 * 축(Figma variant → props):
 * - `variant`: circle / square / mark   (아톰에 passthrough)
 * - `size`   : sm / md / lg
 * - `checked`: true / false
 * - `bold`   : 라벨 굵기(Figma `bold` 축)
 * - `state`  : enable(기본) / hover(→ `:hover`) / disabled(→ `disabled` prop)
 *
 * size 별 토큰(Figma node 51405:45495 검증):
 * | size | 루트 gap   | 체크박스 래퍼 pt | 라벨 타이포(normal / bold)          | 아톰 size |
 * | sm   | --sz-8    | --sz-2          | text-body-4 / text-body-4-bold     | sm        |
 * | md   | --sz-8    | --sz-1          | text-body-3 / text-body-3-bold     | md        |
 * | lg   | --sz-10   | --sz-1          | text-body-2 / text-body-2-bold     | lg        |
 *
 * 색·크기·간격·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

import {
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { Checkbox, type CheckboxSize, type CheckboxVariant } from "../Checkbox";

export interface CheckboxWithLabelProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "children"
> {
  /** 모양 축 — `Checkbox` 아톰에 그대로 전달. 기본 'circle' */
  variant?: CheckboxVariant;
  /** 크기 축. 기본 'md' */
  size?: CheckboxSize;
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

/** 체크박스 래퍼 공통 — 세로 중앙 · 축소 방지 · 키보드 포커스 어포던스 · 전이. */
const LEFT_CLASS =
  "inline-flex shrink-0 items-center " +
  "peer-focus-visible:opacity-[var(--alpha-80)] " +
  "transition-opacity duration-150 ease-in-out motion-reduce:transition-none";

/** size 별 루트 좌우 간격(체크박스 ↔ 라벨). */
const SIZE_GAP: Record<CheckboxSize, string> = {
  sm: "gap-[var(--sz-8)]",
  md: "gap-[var(--sz-8)]",
  lg: "gap-[var(--sz-10)]",
};

/** size 별 체크박스 래퍼 상단 패딩(첫 줄 텍스트와 광학 정렬). */
const SIZE_PT: Record<CheckboxSize, string> = {
  sm: "pt-[var(--sz-2)]",
  md: "pt-[var(--sz-1)]",
  lg: "pt-[var(--sz-1)]",
};

/** size 별 라벨 합성 타이포 유틸(normal / bold). */
const SIZE_TYPO: Record<CheckboxSize, { normal: string; bold: string }> = {
  sm: { normal: "text-body-4", bold: "text-body-4-bold" },
  md: { normal: "text-body-3", bold: "text-body-3-bold" },
  lg: { normal: "text-body-2", bold: "text-body-2-bold" },
};

export function CheckboxWithLabel({
  variant = "circle",
  size = "md",
  bold = false,
  children,
  className,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  ...rest
}: CheckboxWithLabelProps) {
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
      data-variant={variant}
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
        type="checkbox"
        className="peer sr-only"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        {...rest}
      />
      <span className={[LEFT_CLASS, SIZE_PT[size]].join(" ")}>
        <Checkbox
          variant={variant}
          size={size}
          checked={isChecked}
          disabled={disabled}
        />
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
