/**
 * 목록 선택 행(CheckSelectRadio).
 *
 * Figma "또가3.0 Design System / CheckSelectRadio" (node 51405:48796) 와 1:1.
 * 목록에서 항목을 선택하는 전체 폭 행(row) MOLECULE 다. 왼쪽에 라벨, 오른쪽에 체크 표시가 있고
 * 체크 표시는 선택됐을 때만 보인다(미선택 시 `opacity-0` 로 자리만 유지 — Figma 검증).
 * `CheckboxWithLabel` 이 `Checkbox` 아톰을 합성하는 패턴을 그대로 따른다 — 체크마크 로직은 재구현하지 않는다.
 *
 * 구현:
 * - 루트는 `<label class="group">`. 그 안에 시각적으로 숨긴 native `<input class="peer sr-only">`
 *   + 리딩 슬롯 + 라벨 + 체크 표시를 둔다. 행 전체가 클릭 히트영역이다(암시적 라벨 연결).
 * - `type` 은 `radio`(기본) / `checkbox`. radio 는 `name` 으로 그룹핑해 단일 선택 목록에 쓴다.
 * - controlled(`checked` + `onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원.
 *   `checked` 외 나머지 input 속성(`name`·`value`·`required` 등)은 `...rest` 로 `<input>` 에 spread.
 * - 체크 표시는 `<Checkbox variant="mark" size="md" checked />` 합성 — Figma `_checkboxImage`
 *   와 동일한 커스텀 `Union` 벡터(`Checkbox` 아톰과 공유). 미선택 시 래퍼를 `opacity-0` 로 완전히 숨긴다.
 * - hover: `<label class="group">` → 라벨이 `group-hover:` 로 `typo/brand/dark` 로 전이한다.
 * - focus: Figma `state=focuse` 샘플은 checked 조합만 있어 포커스 단독 시각이 불명확 →
 *   접근성 어포던스로 `group-focus-within:` 시 라벨을 hover 와 동일하게 `typo/brand/dark` 로 전이한다.
 *
 * 축(Figma property → props):
 * - `checked` : true / false   → `checked` / `defaultChecked`
 * - `label`   : 라벨 텍스트     → `children` (필수)
 * - `slot`    : 리딩 슬롯(34px) → `startSlot` (없으면 미렌더 — presence 기반)
 * - `state`   : enable(기본) / hover(→ `group-hover:`) / focuse(→ `group-focus-within:`)
 * (Figma 는 시각 3종만 정의 — disabled·indeterminate 없음.)
 *
 * 상태별 라벨(Figma node 51405:48796 검증):
 * | checked | state    | 색                  | 굵기   |
 * | false   | enable   | typo/neutral/normal | Medium |
 * | false   | hover    | typo/brand/dark     | Medium |
 * | true    | (focuse) | typo/brand/deep     | Bold   |
 *
 * 색·크기·간격·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

import {
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { Checkbox } from "../Checkbox";

export type CheckSelectRadioType = "radio" | "checkbox";

export interface CheckSelectRadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "type"
> {
  /** native input 타입. radio 는 `name` 으로 그룹핑. 기본 'radio' */
  type?: CheckSelectRadioType;
  /** 라벨 콘텐츠(필수). Figma `label`. */
  children: ReactNode;
  /** 라벨 앞 리딩 슬롯(Figma `slotContents`, 34px). 없으면 미렌더. */
  startSlot?: ReactNode;
  /** 루트 `<label>` 에 전달할 클래스. */
  className?: string;
}

/** 루트 공통 — group(라벨 hover/focus 전파) · 세로 중앙 · 세로 패딩 · 커서 · font-feature. */
const ROOT_CLASS =
  "group flex w-full cursor-pointer items-center gap-[var(--sz-8)] py-[var(--sz-10)] " +
  "[font-feature-settings:var(--font-feature-case)]";

/** 리딩 슬롯 래퍼 — 34px 정사각 · 중앙정렬 · 축소 방지. */
const SLOT_CLASS =
  "flex size-[var(--sz-34)] shrink-0 items-center justify-center";

/** 체크 표시 래퍼 — 축소 방지 · 미선택 시 완전히 숨김 · 투명도 전이. */
const MARK_CLASS =
  "inline-flex shrink-0 items-center " +
  "transition-opacity duration-150 ease-in-out motion-reduce:transition-none";

export function CheckSelectRadio({
  type = "radio",
  children,
  startSlot,
  className,
  checked,
  defaultChecked,
  onChange,
  ...rest
}: CheckSelectRadioProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isChecked = checked ?? internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  const labelClass = [
    "min-w-0 flex-1 [word-break:break-word]",
    "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
    isChecked ? "text-body-3-bold" : "text-body-3",
    isChecked
      ? "text-typo-brand-deep"
      : "text-typo-neutral-normal group-hover:text-typo-brand-dark group-focus-within:text-typo-brand-dark",
  ].join(" ");

  return (
    <label
      data-type={type}
      data-checked={isChecked}
      data-state="enable"
      className={[ROOT_CLASS, className].filter(Boolean).join(" ")}
    >
      <input
        type={type}
        className="peer sr-only"
        checked={isChecked}
        onChange={handleChange}
        {...rest}
      />

      {startSlot != null && startSlot !== false ? (
        <span className={SLOT_CLASS}>{startSlot}</span>
      ) : null}

      <span className={labelClass}>{children}</span>

      <span
        aria-hidden
        className={[MARK_CLASS, isChecked ? "opacity-100" : "opacity-0"].join(
          " ",
        )}
      >
        <Checkbox variant="mark" size="md" checked={isChecked} />
      </span>
    </label>
  );
}
