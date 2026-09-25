/**
 * 아바타(Avatar).
 *
 * Figma "또가3.0 Design System / Avatar" (문서 노드 51405:6022 / 메인 컴포넌트 51405:6120)
 * 와 1:1. 사람·시설 프로필 이미지를 원형으로 보여주고, 선택적으로 편집 배지 또는
 * 선택 가능한(checkable) 상태를 얹는다.
 *
 * 축(Figma property → props):
 * - `size`     : xs(24) / sm(32) / md(48) / lg(60) / xl(72) / 2xl(84) — 기본 'md'.
 *   Figma 원본은 `type=add` 만 xl=76 / 2xl=96 으로 다르게 찍혀 있었으나, 실제 확인 결과
 *   Figma 쪽 오타로 확정되어(2026-09-16) 모든 type/variant 가 동일한 사이즈 세트를 쓴다.
 * - `type`     : 'person'(기본) / 'ltch' / 'add'.
 *   - 'ltch' 는 또가에서 요양시설(장기요양기관)을 가리킬 때 쓰는 내부 개발 약어다.
 *     person 과 이미지만 다를 뿐 항상 readOnly 취급(`variant` 를 받아도 무시) — Figma 자체가
 *     이 경우를 비인터랙티브 `<div>` 로 낸다(person/add 는 `<button>`)는 점을 그대로 따른다.
 *   - 'add' 는 "새 아바타 추가" 슬롯 — 점선 원 + 중앙 plus 아이콘으로 `variant` 와 무관하게
 *     독립 렌더된다. Figma 원본은 `<div>` 지만, 실제로는 클릭 가능한 액션이라 접근성을 위해
 *     코드에서는 `<button>` 으로 낸다(Figma 출력은 디자인 의도이지 최종 마크업이 아님).
 * - `variant`  : 'readOnly'(기본) / 'edit' / 'checkable'. **`type='person'` 일 때만 의미가
 *   있다** — 'ltch'/'add' 에서는 무시된다(별도로 타입을 좁히지 않고 평평한 props 로 유지,
 *   `Chip`의 startType/startSlot 선례와 동일한 절충).
 *   - `readOnly` : 원형 이미지만, 크롬 없음. 비인터랙티브 `<div>`(2026-09-16 확정 —
 *     과거엔 `<button>`이었으나 "클릭되면 안 된다"는 요구로 `ltch`와 동일한 div 패턴으로
 *     변경. `onClick`/`focus-visible`/`cursor-pointer` 전부 없음).
 *   - `edit` : person 루트는 비인터랙티브 `<div>`(이미지 자체는 클릭 불가 — `ltch`의
 *     `<div>` 루트 선례와 동일 패턴)이고, 우하단 원형 편집 배지(`edit_02_solid`)만 실제
 *     `<button type="button">`으로 클릭 가능하다(버튼-in-버튼 회피). 배지 클릭은
 *     `onEditClick` 으로 받고, `aria-label`(기본값 `DEFAULT_LABEL.edit`="아바타 편집")도
 *     배지 버튼에 붙는다 — `readOnly`/`checkable`과 달리 아바타 이미지 영역 자체는 아무
 *     역할도 갖지 않는다(2026-09-16 확정, 과거엔 person 루트 전체가 버튼이었다).
 *   - `checkable` : readOnly + 클릭 시 뒤집히는 체크 상태(`checked`/`defaultChecked`/
 *     `onCheckedChange` — `LikeToggle` 선례 그대로 controlled/uncontrolled 지원) + 포커스
 *     링 스타일의 브랜드 컬러 원형 링.
 *
 * 이미지 / placeholder:
 * - `src` 가 있으면 `<img src object-cover>` 로 채운다(컬러 아바타 이미지 8종은 Avatar
 *   자체에 넣지 않는다 — 호출부가 `src` 로 주입하는 몫).
 * - `src` 가 없으면 type 별 기본 placeholder 이미지를 같은 방식(`object-cover`
 *   `object-center`)으로 렌더한다(2026-09-16 확정, 디자인팀 제공 자산):
 *   - `type='person'` → `src/assets/images/avatar/personPlaceholder.png`(정사각·원형
 *     마감까지 끝난 자산 — Figma `avatar/personPlaceholder` 대응).
 *   - `type='ltch'` → `src/assets/images/placeholder/ltch.png`(960×540 비정사각 원본 —
 *     Figma `placeholder_ltch` 대응). `object-cover` 가 비율을 유지한 채 아바타 높이 기준
 *     으로 꽉 채우고 넘치는 폭을 중앙 기준으로 크롭한다(정사각 아바타 컨테이너 특성상
 *     landscape 원본은 항상 높이가 기준이 된다).
 *
 * edit 배지(Figma node 51405:6120 실측, size 별):
 * | size | 배지 지름 | 우측 오프셋 | 내부 아이콘(근사) |
 * | xs   | 14 (sz-14)| -4 (sz-4)  | 8                  |
 * | sm   | 16 (sz-16)| -4 (sz-4)  | 9                  |
 * | md   | 22 (sz-22)| -2 (sz-2)  | 13                 |
 * | lg   | 24 (sz-24)| -2 (sz-2)  | 14                 |
 * | xl   | 26 (sz-26)| -2 (sz-2)  | 15                 |
 * | 2xl  | 28 (sz-28)| 0          | 16                 |
 * 배경 `bg-bg-brandGrayish-deep`, 테두리 1px `border-border-brandGrayish-light`, 그림자
 * `shadow-black-xs`(Figma effect `shadow/black/xs` 와 1:1 일치 확인, 기존 유틸 재사용),
 * 항상 `bottom-0`. 아이콘 색은 `text-icon-brandGrayish-normal`(2026-09-16 정정 — 과거
 * `text-icon-neutral-normal` 오구현이었다). 배지 자체가 `<button type="button">` 이라
 * `focus-visible:outline-none focus-visible:opacity-(--alpha-60)` + `cursor-pointer`
 * 를 갖는다(`ClearButton`/`add` 슬롯 버튼 선례와 동일한 포커스 처리).
 *
 * checkable 링(Figma node 51405:6120 실측 inset → borderWidth 토큰 매핑):
 * | size | inset(오프셋) | borderWidth 토큰      |
 * | xs   | 2px (-8.33%)  | --border-width-sm (2) |
 * | sm   | 2px (-6.25%)  | --border-width-sm (2) |
 * | md   | 3px (-6.25%)  | --border-width-md (3) |
 * | lg   | 4px (-6.67%)  | --border-width-lg (4) |
 * | xl   | 4px (-5.56%)  | --border-width-lg (4) |
 * | 2xl  | 6px (-7.14%)  | --border-width-xl (6) |
 * 색 `--color-icon-brand-dark`(#007a54). Figma 원본은 `checked=false` 시 링이 DOM 에서
 * 완전히 빠지는 구조(radial sweep 애니메이션)지만, MCP 로 duration/easing 을 확인할 수
 * 없어 재현하지 않는 대신 — 사용자 확정 사항으로 링 엘리먼트를 항상 마운트해두고
 * `checked` 에 따라 `opacity-100`/`opacity-0` 로 150ms 페이드 처리한다. 링은 `border`
 * 로 그린다(오프셋만큼 `inset` 을 음수로 벌리고 같은 값을 `border-width` 로 주면
 * border-box 특성상 아바타 가장자리 바로 바깥을 정확히 두르는 밴드가 된다 — `outline`
 * 음수 offset 계산 없이 `Switch` 의 "레이아웃 시프트 없는 절대배치" 철학만 차용).
 * DOM 순서(링 → 이미지 → 배지)만으로 페인트 순서를 결정해 별도 z-index 유틸 없이도
 * 링은 이미지 뒤, 배지는 이미지 위로 자연스럽게 쌓인다.
 *
 * 색·크기·간격·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 */

import { useState } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, MouseEvent } from "react";

import personPlaceholderImg from "../../../assets/images/avatar/personPlaceholder.png";
import ltchPlaceholderImg from "../../../assets/images/placeholder/ltch.png";
import { Icon } from "../../../icons";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarType = "person" | "ltch" | "add";
export type AvatarVariant = "readOnly" | "edit" | "checkable";

export interface AvatarProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> {
  /** 크기 축. 기본 'md' */
  size?: AvatarSize;
  /** 아바타 종류(Figma `type`). 기본 'person' */
  type?: AvatarType;
  /** person 전용 크롬(Figma `variant`). `type` 이 'ltch'/'add' 면 무시된다. 기본 'readOnly' */
  variant?: AvatarVariant;
  /** 표시할 이미지 URL. 없으면 type 별 기본 placeholder 이미지를 렌더한다. */
  src?: string;
  /** `<img>` alt 텍스트. 기본 빈 문자열(버튼 자체 `aria-label` 로 접근성을 제공). */
  alt?: string;
  /** `variant='checkable'` 일 때 체크 여부(controlled). 지정 시 `defaultChecked` 는 무시된다. */
  checked?: boolean;
  /** `variant='checkable'` 일 때 초기 체크 여부(uncontrolled). 기본 false */
  defaultChecked?: boolean;
  /** `variant='checkable'` 체크 상태 변경 콜백. */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * `variant='edit'` 일 때 편집 배지 클릭 콜백. person 루트는 이 variant 에서 비인터랙티브
   * `<div>` 이므로(이미지 자체는 클릭 불가), 클릭 가능한 건 배지 `<button>` 뿐이다. 상속받는
   * `onClick`(ButtonHTMLAttributes)은 `readOnly`/`checkable` 루트 버튼 전용으로 유지된다.
   */
  onEditClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** 루트 엘리먼트에 병합할 클래스. */
  className?: string;
}

/** variant 별 기본 접근성 라벨(Figma 미정의라 코드에서 부여, `LikeToggle`/`ClearButton` 선례). */
const DEFAULT_LABEL: Record<AvatarVariant, string> = {
  readOnly: "아바타",
  edit: "아바타 편집",
  checkable: "아바타 선택",
};

/** size 별 루트 지름(Figma 실측, 2026-09-16 오타 정정 후 전 type/variant 공통). */
const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "size-(--sz-24)",
  sm: "size-(--sz-32)",
  md: "size-(--sz-48)",
  lg: "size-(--sz-60)",
  xl: "size-(--sz-72)",
  "2xl": "size-(--sz-84)",
};

/** size 별 edit 배지 지름(Figma 실측: 14/16/22/24/26/28 → 기존 sz 토큰과 정확히 일치). */
const EDIT_BADGE_SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "size-(--sz-14)",
  sm: "size-(--sz-16)",
  md: "size-(--sz-22)",
  lg: "size-(--sz-24)",
  xl: "size-(--sz-26)",
  "2xl": "size-(--sz-28)",
};

/** size 별 edit 배지 우측 오프셋(Figma 실측: -4/-4/-2/-2/-2/0). */
const EDIT_BADGE_OFFSET_CLASS: Record<AvatarSize, string> = {
  xs: "-right-(--sz-4)",
  sm: "-right-(--sz-4)",
  md: "-right-(--sz-2)",
  lg: "-right-(--sz-2)",
  xl: "-right-(--sz-2)",
  "2xl": "right-0",
};

/** size 별 edit 배지 내부 아이콘 px(배지 지름의 ~4/7 근사, Figma inset 21.43% 실측). */
const EDIT_ICON_SIZE: Record<AvatarSize, number> = {
  xs: 8,
  sm: 9,
  md: 13,
  lg: 14,
  xl: 15,
  "2xl": 16,
};

/** size 별 checkable 링 두께 = inset 오프셋(Figma 실측, borderWidth 토큰과 정확히 일치). */
const RING_CLASS: Record<AvatarSize, string> = {
  xs: "-inset-(--border-width-sm) border-[length:var(--border-width-sm)]",
  sm: "-inset-(--border-width-sm) border-[length:var(--border-width-sm)]",
  md: "-inset-(--border-width-md) border-[length:var(--border-width-md)]",
  lg: "-inset-(--border-width-lg) border-[length:var(--border-width-lg)]",
  xl: "-inset-(--border-width-lg) border-[length:var(--border-width-lg)]",
  "2xl": "-inset-(--border-width-xl) border-[length:var(--border-width-xl)]",
};

/** size 별 add 슬롯 plus 아이콘 px(Figma inset ~28~33% 실측 근사). */
const ADD_ICON_SIZE: Record<AvatarSize, number> = {
  xs: 10,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 25,
  "2xl": 28,
};

/** type 별 기본 placeholder 이미지(디자인팀 제공 자산, `src` 미지정 시 사용). */
const DEFAULT_PLACEHOLDER_IMG: Record<"person" | "ltch", string> = {
  person: personPlaceholderImg,
  ltch: ltchPlaceholderImg,
};

/**
 * 이미지 있으면 `<img src>`, 없으면 type 별 기본 placeholder 이미지를 렌더한다
 * (`person` → `personPlaceholder.png`, `ltch` → `placeholder/ltch.png`). 원본 비율을
 * 유지한 채 `object-cover`(+기본 `object-position: center`)로 아바타 높이 기준 꽉 채우고
 * 넘치는 폭은 중앙 기준으로 크롭한다 — `ltch.png` 처럼 정사각이 아닌 원본(960×540)도
 * 동일하게 동작한다.
 */
function AvatarVisual({
  type,
  src,
  alt,
}: {
  type: "person" | "ltch";
  src?: string;
  alt: string;
}) {
  return (
    <img
      src={src ?? DEFAULT_PLACEHOLDER_IMG[type]}
      alt={alt}
      className="size-full rounded-circle object-cover object-center"
    />
  );
}

export function Avatar({
  size = "md",
  type = "person",
  variant = "readOnly",
  src,
  alt = "",
  checked,
  defaultChecked = false,
  onCheckedChange,
  onEditClick,
  className,
  onClick,
  "aria-label": ariaLabel,
  ...rest
}: AvatarProps) {
  // checkable 상태는 type='person' 일 때만 쓰이지만, Hooks 규칙상 조건부 return 이전에
  // 항상 호출해야 한다(early return 은 이 아래에서 일어난다).
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? (checked as boolean) : internalChecked;

  // checkable 전용(readOnly 는 더 이상 버튼이 아니라 이 핸들러를 쓰지 않는다).
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const next = !isChecked;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  if (type === "add") {
    return (
      <button
        type="button"
        aria-label={ariaLabel ?? "새 아바타 추가"}
        onClick={onClick}
        data-type="add"
        data-size={size}
        className={[
          "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-circle",
          "border border-dashed border-[color:var(--color-border-brandGrayish-light)]",
          "bg-bg-overlay-greenGraySubtle",
          "focus-visible:outline-none focus-visible:opacity-(--alpha-60)",
          SIZE_CLASS[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        <Icon
          name="plus_line"
          size={ADD_ICON_SIZE[size]}
          className="text-icon-brandGrayish-subtle"
        />
      </button>
    );
  }

  if (type === "ltch") {
    return (
      <div
        data-type="ltch"
        data-size={size}
        className={[
          "relative inline-flex shrink-0 overflow-hidden rounded-circle",
          SIZE_CLASS[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        // ltch 는 Figma 상 항상 비인터랙티브 <div>(person/add 만 <button>). ButtonHTMLAttributes
        // 의 공용 DOM 속성(id·style·aria-*·data-* 등)만 실사용을 전제로 캐스트해 전달한다.
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        <AvatarVisual type="ltch" src={src} alt={alt} />
      </div>
    );
  }

  // type === "person", variant === "edit": 이미지 영역은 비인터랙티브 <div>(ltch 선례와
  // 동일 패턴, 버튼-in-버튼 회피)이고 편집 배지만 실제 <button> 이다.
  if (variant === "edit") {
    return (
      <div
        data-type="person"
        data-size={size}
        data-variant="edit"
        className={[
          "relative inline-flex shrink-0 items-center justify-center rounded-circle",
          SIZE_CLASS[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        // person 의 edit variant 는 Figma 상 이미지 영역 자체가 클릭 불가능해야 하므로
        // <div> 로 낸다. ButtonHTMLAttributes 의 공용 DOM 속성(id·style·aria-*·data-* 등)만
        // 실사용을 전제로 캐스트해 전달한다(ltch 분기와 동일한 절충).
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        <span className="size-full overflow-hidden rounded-circle">
          <AvatarVisual type="person" src={src} alt={alt} />
        </span>

        <button
          type="button"
          aria-label={ariaLabel ?? DEFAULT_LABEL.edit}
          onClick={onEditClick}
          data-type="person"
          data-size={size}
          data-variant="edit"
          className={[
            "absolute bottom-0 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-circle",
            "bg-bg-brandGrayish-deep border border-[color:var(--color-border-brandGrayish-light)]",
            "shadow-black-xs",
            "focus-visible:outline-none focus-visible:opacity-(--alpha-60)",
            EDIT_BADGE_SIZE_CLASS[size],
            EDIT_BADGE_OFFSET_CLASS[size],
          ].join(" ")}
        >
          <Icon
            name="edit_02_solid"
            size={EDIT_ICON_SIZE[size]}
            className="text-icon-brandGrayish-normal"
          />
        </button>
      </div>
    );
  }

  // type === "person", variant === "readOnly": 비인터랙티브 <div>(ltch 선례와 동일 패턴,
  // "클릭되면 안 된다"는 요구 — onClick/rest 의 onClick 도 여기엔 일부러 붙이지 않는다).
  if (variant === "readOnly") {
    return (
      <div
        data-type="person"
        data-size={size}
        data-variant="readOnly"
        className={[
          "relative inline-flex shrink-0 items-center justify-center rounded-circle",
          SIZE_CLASS[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        <span className="size-full overflow-hidden rounded-circle">
          <AvatarVisual type="person" src={src} alt={alt} />
        </span>
      </div>
    );
  }

  // type === "person", variant === "checkable"
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? DEFAULT_LABEL.checkable}
      aria-pressed={isChecked}
      onClick={handleClick}
      data-type="person"
      data-size={size}
      data-variant="checkable"
      data-checked={isChecked}
      className={[
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-circle",
        "focus-visible:outline-none focus-visible:opacity-(--alpha-60)",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute rounded-circle",
          "border-[color:var(--color-icon-brand-dark)]",
          "transition-opacity duration-150 ease-in-out motion-reduce:transition-none",
          isChecked ? "opacity-100" : "opacity-0",
          RING_CLASS[size],
        ].join(" ")}
      />

      <span className="size-full overflow-hidden rounded-circle">
        <AvatarVisual type="person" src={src} alt={alt} />
      </span>
    </button>
  );
}
