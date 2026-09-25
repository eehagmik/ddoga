/**
 * 카드형 라디오(RadioCard).
 *
 * Figma "또가3.0 Design System / RadioCard" (node 51405:128427) 와 1:1.
 * `Radio` 아톰(node 51405:128241)에 카드 표면·라벨·서브텍스트·자유 콘텐츠 슬롯을 더한 MOLECULE 다.
 * `CheckboxCard` 가 `Checkbox` 를 합성하는 패턴을 그대로 따른다 — 시각 상자 로직은 재구현하지 않는다.
 *
 * 구현:
 * - 루트는 `<label class="group">`. 그 안에 시각적으로 숨긴 native `<input type="radio" class="peer sr-only">`
 *   + 카드 콘텐츠를 둔다. 카드 전체가 클릭 히트영역이다(암시적 라벨 연결 — `htmlFor`/`id` 불필요, passthrough).
 *   같은 그룹 내 단일 선택은 `RadioWithLabel` 과 동일하게 `name` 공유 + controlled 패턴을 권장한다
 *   (Figma 범위 밖이라 별도 `RadioGroup` 없음).
 * - controlled(`checked` + `onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원.
 *   `onChange` 는 네이티브 `ChangeEventHandler<HTMLInputElement>` 를 그대로 전달한다.
 *   `checked` 외 나머지 input 속성(`name`·`value`·`required` 등)은 `...rest` 로 `<input>` 에 spread.
 * - 시각 상자는 `<Radio size checked disabled />` 합성. 아톰은 `.group` 의 자손이라
 *   `group-hover:` 로 배경/점을 전이하므로 카드 hover 가 그대로 아톰에 전파된다.
 * - hover: Figma hover 는 checked 여부와 무관하게 카드 배경을 `bg/brandGrayish/deep`(node
 *   51405:128437·128455 검증) 로, unchecked 외곽선을 brand 로 바꾼다. 카드 표면은 루트 `<label>`
 *   **자기 자신**의 스타일이라 `hover:` 로 건다(`group-hover:` 는 `.group` 자손 전용이라 루트 자신에는
 *   안 먹는다). 루트의 `group` 클래스는 자손 `<Radio>` 아톰용으로 유지한다(`CheckboxCard` 선례).
 * - focus: Figma 에 없음. `RadioWithLabel` 과 동일하게 라디오 래퍼에
 *   `peer-focus-visible:opacity-(--alpha-80)` dip 을 준다(`Button` 선례).
 * - disabled: `<input disabled>` + `<Radio disabled>` + 카드 표면/라벨/서브텍스트 색 + `cursor-not-allowed`.
 * - selected(checked): 카드 배경 `bg/brand/bright`, 외곽선 brand 2px(`shadow/borderBrand/sm`),
 *   라벨 `typo/brand/dark` + Bold. (전부 node 51405:128427 값 그대로 매핑.)
 * - 카드 외곽선은 Figma 의 INNER_SHADOW 이펙트를 그대로 → `shadow-border{Neutral,Brand}-{xs,sm}` 유틸.
 * - 서브텍스트/콘텐츠 슬롯은 선택. Figma 의 빨간 점선 `contentsSlot` 은 디자인 가이드용 표식이라
 *   코드에서는 렌더하지 않고 `children` 만 전폭으로 배치한다. Figma 의 가시성 토글 프로퍼티
 *   (`subText`·`contents` boolean)는 코드에선 presence 기반 — `subTextValue`/`children` 가 있으면 렌더.
 *
 * 축(Figma property → props):
 * - `size`         : sm / md / lg
 * - `checked`      : true / false
 * - `state`        : enable(기본) / hover(→ 카드 표면은 `hover:`, 아톰은 `group-hover:`) / disabled(→ `disabled` prop)
 * - `label`        : 카드 제목 텍스트 → `label`
 * - `subTextValue` : 보조 설명 텍스트 → `subTextValue` (없으면 미렌더)
 * - `children`     : 하단 자유 콘텐츠 슬롯(Figma 레이어 `contentsSlot`) → `children`
 * (Figma 에 variant 축 자체가 없다 — Radio 는 항상 원형. focus 없음.)
 *
 * size 별 토큰(Figma node 51405:128427 검증 — `CheckboxCard` 와 대부분 동일하되 래퍼 pt 만 다름):
 * | size | 카드 gap  | 카드 radius | 아톰 size | 라디오 래퍼 pt | 라벨 타이포(uncheck / check) | 서브텍스트 타이포 | 서브텍스트 pl |
 * | sm   | --sz-8   | rounded-md | sm        | --sz-2          | body-4 / body-4-bold        | body-5           | --sz-30      |
 * | md   | --sz-10  | rounded-lg | md        | --sz-1          | body-3 / body-3-bold        | body-4           | --sz-32      |
 * | lg   | --sz-12  | rounded-xl | md        | --sz-5          | body-1 / body-1-bold        | body-3           | --sz-32      |
 * 공통: 카드 padding `--sz-14`, 콘텐츠 세로 gap `--sz-4`, 라디오·라벨 가로 gap `--sz-8`.
 * (`CheckboxCard` 대비 차이: sm 래퍼 pt 가 `--sz-2`다 — Checkbox 는 `--sz-1`. lg 는 md(24px) 아톰을
 * 쓰는 쿼크가 동일하게 있다.)
 *
 * 상태별 카드 표면(Figma node 51405:128427 검증 — `CheckboxCard` 와 규칙 동일):
 * | checked | state    | 배경                    | 외곽선(inner shadow)     |
 * | false   | enable   | bg/neutral/normal      | shadow/borderNeutral/xs  |
 * | false   | hover    | bg/brandGrayish/deep   | shadow/borderBrand/xs    |
 * | true    | enable   | bg/brand/bright        | shadow/borderBrand/sm    |
 * | true    | hover    | bg/brandGrayish/deep   | shadow/borderBrand/sm    |
 * | false   | disabled | bg/disabled/subtle     | shadow/borderNeutral/xs  |
 * | true    | disabled | bg/disabled/subtle     | shadow/borderNeutral/sm  |
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

export type RadioCardSize = "sm" | "md" | "lg";

export interface RadioCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "children" | "type"
> {
  /** 크기 축. 기본 'md' */
  size?: RadioCardSize;
  /** 카드 제목(필수). Figma `label`. */
  label: ReactNode;
  /** 라벨 아래 보조 설명. Figma `subTextValue`. 없으면 미렌더. */
  subTextValue?: ReactNode;
  /** 카드 하단 자유 콘텐츠 슬롯. Figma 레이어 `contentsSlot`. 없으면 미렌더. */
  children?: ReactNode;
  /** 루트 `<label>` 에 전달할 클래스. */
  className?: string;
}

/** 루트 공통 — group(hover 전파) · 세로 스택 · 코너 클립 · font-feature · 표면 전이. */
const ROOT_CLASS =
  "group relative flex w-full flex-col items-start overflow-hidden " +
  "p-(--sz-14) [font-feature-settings:var(--font-feature-case)] " +
  "transition-[background-color,box-shadow] duration-150 ease-in-out motion-reduce:transition-none";

/** 라디오 래퍼 공통 — 세로 중앙 · 축소 방지 · 키보드 포커스 어포던스 · 전이. */
const LEFT_CLASS =
  "inline-flex shrink-0 items-center " +
  "peer-focus-visible:opacity-(--alpha-80) " +
  "transition-opacity duration-150 ease-in-out motion-reduce:transition-none";

/** size 별 카드 gap(콘텐츠 ↔ 슬롯) + radius. */
const CARD_SIZE: Record<RadioCardSize, string> = {
  sm: "gap-(--sz-8) rounded-md",
  md: "gap-(--sz-10) rounded-lg",
  lg: "gap-(--sz-12) rounded-xl",
};

/** size 별 라디오 래퍼 상단 패딩(첫 줄 라벨과 광학 정렬). `CheckboxCard` 와 달리 sm 도 --sz-2(Figma 실측). */
const LEFT_PT: Record<RadioCardSize, string> = {
  sm: "pt-(--sz-2)",
  md: "pt-(--sz-1)",
  lg: "pt-(--sz-5)",
};

/** size 별 라벨 합성 타이포(uncheck=Medium / check=Bold). */
const LABEL_TYPO: Record<RadioCardSize, { normal: string; bold: string }> = {
  sm: { normal: "text-body-4", bold: "text-body-4-bold" },
  md: { normal: "text-body-3", bold: "text-body-3-bold" },
  lg: { normal: "text-body-1", bold: "text-body-1-bold" },
};

/** size 별 서브텍스트 합성 타이포(항상 Medium). */
const SUBTEXT_TYPO: Record<RadioCardSize, string> = {
  sm: "text-body-5",
  md: "text-body-4",
  lg: "text-body-3",
};

/** size 별 서브텍스트 좌측 패딩(라디오 열 폭만큼 들여쓰기). */
const SUBTEXT_PL: Record<RadioCardSize, string> = {
  sm: "pl-(--sz-30)",
  md: "pl-(--sz-32)",
  lg: "pl-(--sz-32)",
};

/** size → 합성할 `Radio` 아톰 size (lg 카드는 md 아톰을 쓴다 — Figma 검증, `CheckboxCard` 와 동일 쿼크). */
const ATOM_SIZE: Record<RadioCardSize, RadioSize> = {
  sm: "sm",
  md: "md",
  lg: "md",
};

/**
 * (checked, disabled) → 카드 표면(배경 + inner-shadow 외곽선) 클래스.
 * hover 는 루트 `<label>` **자기 자신**에 거는 스타일이므로 `hover:` 를 쓴다
 * (`group-hover:` 는 `.group` 의 자손에만 적용 → 루트 자신에는 안 먹는다).
 * disabled 분기에는 hover 클래스를 붙이지 않는다.
 */
function cardSurface(checked: boolean, disabled: boolean): string {
  if (disabled) {
    return checked
      ? "bg-bg-disabled-subtle shadow-borderNeutral-sm"
      : "bg-bg-disabled-subtle shadow-borderNeutral-xs";
  }
  return checked
    ? "bg-bg-brand-bright shadow-borderBrand-sm hover:bg-bg-brandGrayish-deep"
    : "bg-bg-neutral-normal shadow-borderNeutral-xs " +
        "hover:bg-bg-brandGrayish-deep hover:shadow-borderBrand-xs";
}

export function RadioCard({
  size = "md",
  label,
  subTextValue,
  children,
  className,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  ...rest
}: RadioCardProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isChecked = checked ?? internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  const labelColor = disabled
    ? "text-typo-disabled-normal"
    : isChecked
      ? "text-typo-brand-dark"
      : "text-typo-neutral-normal";

  return (
    <label
      data-size={size}
      data-checked={isChecked}
      data-state={disabled ? "disabled" : "enable"}
      className={[
        ROOT_CLASS,
        CARD_SIZE[size],
        cardSurface(isChecked, disabled),
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

      <div className="flex w-full flex-col gap-(--sz-4)">
        <div className="flex w-full items-start gap-(--sz-8)">
          <span className={[LEFT_CLASS, LEFT_PT[size]].join(" ")}>
            <Radio
              size={ATOM_SIZE[size]}
              checked={isChecked}
              disabled={disabled}
            />
          </span>
          <span
            className={[
              "min-w-0 flex-1 [word-break:break-word]",
              isChecked ? LABEL_TYPO[size].bold : LABEL_TYPO[size].normal,
              labelColor,
            ].join(" ")}
          >
            {label}
          </span>
        </div>

        {subTextValue != null && subTextValue !== false ? (
          <div className={["w-full", SUBTEXT_PL[size]].join(" ")}>
            <span
              className={[
                "block [word-break:break-word]",
                SUBTEXT_TYPO[size],
                disabled
                  ? "text-typo-disabled-subtle"
                  : "text-typo-neutral-light",
              ].join(" ")}
            >
              {subTextValue}
            </span>
          </div>
        ) : null}
      </div>

      {children != null && children !== false ? (
        <div className="w-full">{children}</div>
      ) : null}
    </label>
  );
}
