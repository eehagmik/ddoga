/**
 * 스위치(Switch).
 *
 * Figma "또가3.0 Design System / Switch" (문서 노드 51405:133456 / 메인 컴포넌트 51405:133464) 와 1:1.
 * on/off 두 값을 즉시 토글하는 단일 인터랙티브 컨트롤이다. 라벨은 포함하지 않는다
 * (`SwitchWithLabel` 은 만들지 않음 — 라벨이 필요하면 호출부에서 `<label>` 로 감싼다).
 *
 * 구현:
 * - 루트는 `<label class="group">`. 안에 시각적으로 숨긴 native
 *   `<input type="checkbox" role="switch" class="peer sr-only">` + 트랙 `<span>` + 썸 `<span>` 을 둔다.
 *   트랙 어디를 눌러도 native 하게 토글된다(암시적 라벨 연결 — `htmlFor`/`id` 불필요, `id` 는 passthrough).
 * - controlled(`checked` + `onChange`) / uncontrolled(`defaultChecked`) 둘 다 지원.
 *   `onChange` 는 네이티브 `ChangeEventHandler<HTMLInputElement>` 를 그대로 전달한다.
 *   `checked` 외 나머지 input 속성(`name`·`value`·`required` 등)은 `...rest` 로 `<input>` 에 spread.
 * - hover: `<label class="group">` → 트랙이 `group-hover:` 로 배경/테두리를 전이한다.
 *   `disabled` 면 hover 유틸을 아예 포함하지 않는다(`Checkbox` 의 `boxColors` 선례와 동일).
 * - focus: Figma 에 없음. repo `Button`/`CheckboxWithLabel` 선례대로 포커스 링 대신
 *   `peer-focus-visible:opacity-(--alpha-80)` opacity dip 을 트랙에 적용한다.
 * - disabled: `<input disabled>` + 트랙/썸 고정 disable 색 + `cursor-not-allowed`.
 *   전체 opacity dip 은 하지 않는다 — Figma 가 disable 명시색을 제공한다.
 * - off 테두리는 `border-*` 가 아니라 `outline` 으로 그린다. Figma 는 stroke 를 레이아웃에서 제외하므로
 *   테두리가 box geometry 를 갉아먹으면 썸 이동 거리(20/22)가 어긋나고 on↔off 레이아웃 시프트가 생긴다.
 *   `outline` 은 box 바깥에 그려져 레이아웃 시프트가 0 이고 최신 브라우저에서 border-radius 를 따른다.
 *   on 상태는 `outline-transparent` 로 두께만 유지해 트랜지션 중 떨림을 없앤다.
 * - 색·크기·radius·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 *   spacing 은 `--spacing-*` 가 아니라 `--sz-*` 를 arbitrary value 로 쓴다.
 *
 * 축(Figma variant → props):
 * - `size`   : sm / md   (기본 'md')
 * - `checked`: true / false
 * - `state`  : enable(기본) / hover(→ `group-hover:` 유틸) / disabled(→ `disabled` prop)
 *
 * 치수(Figma 실측):
 * | size | 트랙 W×H | 썸 지름 | 트랙 padding | 썸 이동 거리(on) |
 * | sm   | 46 × 26  | 20      | 3            | 20px            |
 * | md   | 56 × 34  | 28      | 3            | 22px            |
 * off 일 때 썸은 `translate-x-0`. radius 는 트랙·썸 공통 `rounded-circle`.
 *
 * 상태별 색상(Figma node 51405:133464 검증):
 * | checked | state    | 트랙 배경            | outline                  | 썸                 |
 * | false   | enable   | bg/neutral/deepDark | border/neutral/light     | bg/neutral/normal  |
 * | false   | hover    | bg/neutral/deepDark | border/neutral/subtle    | bg/neutral/normal  |
 * | false   | disabled | bg/neutral/dark     | border/neutral/light     | bg/disabled/normal |
 * | true    | enable   | bg/brand/normal     | 없음(transparent)        | bg/neutral/deep    |
 * | true    | hover    | bg/brand/deep       | 없음(transparent)        | bg/neutral/deep    |
 * | true    | disabled | bg/disabled/deep    | 없음(transparent)        | bg/disabled/subtle |
 *
 * 썸 그림자는 코드 유틸 `shadow-black-sm` (Figma effect style `shadow/black/sm` 와 1:1 일치 확인).
 */

import {
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type InputHTMLAttributes,
} from "react";

export type SwitchSize = "sm" | "md";

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "children"
> {
  /** 크기 축. 기본 'md' */
  size?: SwitchSize;
  /** on 여부 — controlled. 지정 시 `onChange` 로 상태를 갱신해야 한다. */
  checked?: boolean;
  /** uncontrolled 초기 on 여부. 기본 'false' */
  defaultChecked?: boolean;
  /** 비활성 여부. 기본 'false' */
  disabled?: boolean;
  /** 값이 바뀔 때 호출되는 네이티브 change 핸들러. */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /** 루트 `<label>` 에 전달할 클래스. */
  className?: string;
}

/** 루트 공통 — group(트랙 hover 전파) · 세로 중앙 정렬. */
const ROOT_CLASS = "group inline-flex items-center";

/**
 * 트랙 공통 — 상대 배치 · 썸 정렬 · 축소 방지 · 원형 · 안쪽 padding ·
 * outline 테두리(레이아웃 시프트 0) · 배경/테두리색 전이 · 포커스 opacity dip.
 */
const TRACK_CLASS =
  "relative inline-flex items-center shrink-0 rounded-circle p-(--sz-3) " +
  "outline outline-1 [outline-offset:-1px] " +
  "transition-[background-color,outline-color] duration-150 ease-in-out motion-reduce:transition-none " +
  "peer-focus-visible:opacity-(--alpha-80)";

/** 썸 공통 — 블록 · 원형 · 그림자 · 위치 전이. */
const THUMB_CLASS =
  "block rounded-circle shadow-black-sm " +
  "transition-transform duration-150 ease-in-out motion-reduce:transition-none";

/** size 별 트랙 치수(Figma: 46×26 / 56×34). */
const TRACK_SIZE_CLASS: Record<SwitchSize, string> = {
  sm: "w-(--sz-46) h-(--sz-26)",
  md: "w-(--sz-56) h-(--sz-34)",
};

/** size 별 썸 지름(Figma: 20 / 28). */
const THUMB_SIZE_CLASS: Record<SwitchSize, string> = {
  sm: "size-(--sz-20)",
  md: "size-(--sz-28)",
};

/** size 별 썸 on 이동 거리(Figma: 20px / 22px). off 는 공통 `translate-x-0`. */
const THUMB_TRANSLATE_CLASS: Record<SwitchSize, string> = {
  sm: "translate-x-(--sz-20)",
  md: "translate-x-(--sz-22)",
};

/** (checked, disabled) → 트랙 배경 / outline / 썸 색 묶음. */
interface SwitchStateClass {
  track: string;
  outline: string;
  thumb: string;
}

/**
 * 상태별 색상 헬퍼(`Checkbox` 의 `boxColors` 선례).
 * hover 유틸(`group-hover:*`)은 `disabled` 가 아닐 때만 포함한다.
 */
function switchColors(checked: boolean, disabled: boolean): SwitchStateClass {
  if (disabled) {
    return checked
      ? {
          track: "bg-bg-disabled-deep",
          outline: "outline-transparent",
          thumb: "bg-bg-disabled-subtle",
        }
      : {
          track: "bg-bg-neutral-dark",
          outline: "outline-border-neutral-light",
          thumb: "bg-bg-disabled-normal",
        };
  }
  return checked
    ? {
        track: "bg-bg-brand-normal group-hover:bg-bg-brand-deep",
        outline: "outline-transparent",
        thumb: "bg-bg-neutral-deep",
      }
    : {
        track: "bg-bg-neutral-deepDark",
        outline:
          "outline-border-neutral-light group-hover:outline-border-neutral-subtle",
        thumb: "bg-bg-neutral-normal",
      };
}

export function Switch({
  size = "md",
  className,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  ...rest
}: SwitchProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isChecked = checked ?? internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(event.target.checked);
    onChange?.(event);
  };

  const { track, outline, thumb } = switchColors(isChecked, disabled);

  return (
    <label
      data-size={size}
      data-checked={isChecked}
      data-state={disabled ? "disabled" : "enable"}
      className={[
        ROOT_CLASS,
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        {...rest}
      />
      <span
        className={[TRACK_CLASS, TRACK_SIZE_CLASS[size], track, outline]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            THUMB_CLASS,
            THUMB_SIZE_CLASS[size],
            isChecked ? THUMB_TRANSLATE_CLASS[size] : "translate-x-0",
            thumb,
          ].join(" ")}
        />
      </span>
    </label>
  );
}
