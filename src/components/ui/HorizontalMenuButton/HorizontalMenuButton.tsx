/**
 * HorizontalMenuButton — 가로형 메뉴 버튼(메뉴/설정 리스트 행).
 *
 * Figma "또가3.0 Design System / HorizontalMenuButton" (node 51405:116292) 와 1:1.
 * `라벨(children, 필수) + 좌측 아이콘/그래픽 슬롯(startSlot) + 우측 임의 콘텐츠
 * 슬롯(endSlot) + chevron` 구조의 리스트형 버튼이다.
 *
 * Figma 프레임은 240px 고정 폭이지만, 이 컴포넌트는 메뉴/리스트 행 용도이므로
 * 고정폭 대신 부모 컨테이너 폭에 맞추는 `w-full` 로 구현한다(사용자 확정 사항).
 *
 * 구조(Figma 레이어 1:1): root(button) > inner > left(startSlot + label) +
 * option(endSlot + chevron). `option` 은 `chevron` 이 켜져 있거나 `endSlot` 이
 * 있을 때만 렌더한다(Figma `trailingContents` 토글에 대응).
 *
 * 축(Figma variant → props):
 * - `variant` : text / outline
 * - `size`    : sm / md / lg / xl / 2xl
 * - `bold`    : boolean (라벨 굵기)
 * - hover / focus 는 상태이므로 props 가 아니라 CSS 의사클래스로 처리
 *   (Figma 에 disabled 없음 → 만들지 않는다).
 *
 * 상태 규칙(Figma 검증, 배경색 자체는 변하지 않는다):
 * - hover : 루트 `opacity` `--alpha-80`
 * - focus : 루트 `opacity` `--alpha-60` (`focus-visible` 로 처리)
 *
 * size 별 토큰(Figma 검증 완료 — md·lg, xl·2xl 는 타이포·간격이 동일하고
 * min-height·아이콘 슬롯 크기만 다르다):
 * | size | min-h(text) | min-h(outline) | radius | 타이포(normal/bold)          | left-gap  | inner-gap | option-gap | chevron | start slot |
 * | sm   | --sz-36    | --sz-40        | sm     | text-body-4 / -bold          | --sz-8   | --sz-6   | --sz-4    | 16      | --sz-22   |
 * | md   | --sz-40    | --sz-46        | md     | text-body-3 / -bold          | --sz-10  | --sz-8   | --sz-6    | 18      | --sz-28   |
 * | lg   | --sz-40    | --sz-46        | md     | text-body-3 / -bold          | --sz-10  | --sz-8   | --sz-6    | 18      | --sz-32   |
 * | xl   | --sz-42    | --sz-52        | md     | text-body-2 / -bold          | --sz-10  | --sz-8   | --sz-6    | 20      | --sz-38   |
 * | 2xl  | --sz-46    | --sz-56        | md     | text-body-2 / -bold          | --sz-10  | --sz-8   | --sz-6    | 20      | --sz-42   |
 *
 * padding: `text` 는 전 size 공통 `px-0 py-[--sz-2]`(가로 hug).
 * `outline` 은 sm `px-[--sz-8] py-[--sz-4]`, md~2xl `px-[--sz-10] py-[--sz-7]`,
 * 배경 `bg-bg-neutral-normal` + `border-xs border-solid border-border-neutral-bright`
 * (Button neutral outline 과 동일 패턴).
 *
 * 색: 라벨 `text-typo-neutral-normal`, chevron·startSlot 아이콘 톤
 * `text-icon-neutral-light` — variant·bold 와 무관하게 고정(Figma 검증).
 *
 * `startSlot`/`endSlot` 자리의 빨간 점선 박스는 Figma 의 "빈 슬롯" 표시일 뿐이므로
 * 실제 스타일에 반영하지 않는다(`BlankIcon`/`BlankGraphic` 선례와 동일 맥락 —
 * 컴포넌트 설명에 "Icon 이나 Graphic 이 적용된다" 고 명시). `startSlot` 은 size 별
 * 정사각 슬롯에 담기고, `endSlot` 은 임의 콘텐츠라 크기를 강제하지 않는다.
 * chevron 은 `chevron_right_line` 아이콘(`src/icons`)을 그대로 재사용한다.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Icon } from "../../../icons";

export type HorizontalMenuButtonVariant = "text" | "outline";
export type HorizontalMenuButtonSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface HorizontalMenuButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** 스타일 축(Figma Style). 기본 'text' */
  variant?: HorizontalMenuButtonVariant;
  /** 크기 축. 기본 'sm' */
  size?: HorizontalMenuButtonSize;
  /** 라벨 굵기. 기본 false */
  bold?: boolean;
  /** 우측 chevron 아이콘 노출 여부. 기본 true(Figma 기본값) */
  chevron?: boolean;
  /** 라벨 앞 아이콘/그래픽 슬롯. 없으면 미렌더. */
  startSlot?: ReactNode;
  /** 라벨 뒤(chevron 앞) 임의 콘텐츠 슬롯. 없으면 미렌더. */
  endSlot?: ReactNode;
  /** 라벨(필수). */
  children: ReactNode;
}

/** 루트 공통 — 가로 전체폭 + 레이아웃 + cursor-pointer + hover/focus opacity(배경색은 불변). */
const ROOT_BASE =
  "flex w-full cursor-pointer items-center justify-center " +
  "[font-feature-settings:var(--font-feature-case)] transition-opacity " +
  "hover:opacity-(--alpha-80) " +
  "focus-visible:opacity-(--alpha-60) focus-visible:outline-none";

/** variant 별 루트 배경·테두리(outline 만 — text 는 배경 없음). */
const VARIANT_ROOT: Record<HorizontalMenuButtonVariant, string> = {
  text: "",
  outline:
    "bg-bg-neutral-normal border-xs border-solid border-border-neutral-bright",
};

/** size 별 radius (Figma 검증: sm 만 sm, 나머지는 md). */
const SIZE_RADIUS: Record<HorizontalMenuButtonSize, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-md",
  xl: "rounded-md",
  "2xl": "rounded-md",
};

/** variant × size → min-height. */
const SIZE_MIN_HEIGHT: Record<
  HorizontalMenuButtonVariant,
  Record<HorizontalMenuButtonSize, string>
> = {
  text: {
    sm: "min-h-(--sz-36)",
    md: "min-h-(--sz-40)",
    lg: "min-h-(--sz-40)",
    xl: "min-h-(--sz-42)",
    "2xl": "min-h-(--sz-46)",
  },
  outline: {
    sm: "min-h-(--sz-40)",
    md: "min-h-(--sz-46)",
    lg: "min-h-(--sz-46)",
    xl: "min-h-(--sz-52)",
    "2xl": "min-h-(--sz-56)",
  },
};

/** `text` 는 전 size 공통 padding(가로 hug). */
const TEXT_PADDING = "px-0 py-(--sz-2)";

/** `outline` 은 sm 만 다른 padding, md~2xl 는 동일. */
const OUTLINE_PADDING: Record<HorizontalMenuButtonSize, string> = {
  sm: "px-(--sz-8) py-(--sz-4)",
  md: "px-(--sz-10) py-(--sz-7)",
  lg: "px-(--sz-10) py-(--sz-7)",
  xl: "px-(--sz-10) py-(--sz-7)",
  "2xl": "px-(--sz-10) py-(--sz-7)",
};

/** left(아이콘+라벨) ↔ option(끝 슬롯+chevron) 사이 gap. */
const SIZE_INNER_GAP: Record<HorizontalMenuButtonSize, string> = {
  sm: "gap-(--sz-6)",
  md: "gap-(--sz-8)",
  lg: "gap-(--sz-8)",
  xl: "gap-(--sz-8)",
  "2xl": "gap-(--sz-8)",
};

/** startSlot ↔ 라벨 gap. */
const SIZE_LEFT_GAP: Record<HorizontalMenuButtonSize, string> = {
  sm: "gap-(--sz-8)",
  md: "gap-(--sz-10)",
  lg: "gap-(--sz-10)",
  xl: "gap-(--sz-10)",
  "2xl": "gap-(--sz-10)",
};

/** endSlot ↔ chevron gap. */
const SIZE_OPTION_GAP: Record<HorizontalMenuButtonSize, string> = {
  sm: "gap-(--sz-4)",
  md: "gap-(--sz-6)",
  lg: "gap-(--sz-6)",
  xl: "gap-(--sz-6)",
  "2xl": "gap-(--sz-6)",
};

/** size × bold → 라벨 타이포 유틸(Figma 검증: md·lg / xl·2xl 는 짝을 이룬다). */
const SIZE_TYPO: Record<
  HorizontalMenuButtonSize,
  Record<"normal" | "bold", string>
> = {
  sm: { normal: "text-body-4", bold: "text-body-4-bold" },
  md: { normal: "text-body-3", bold: "text-body-3-bold" },
  lg: { normal: "text-body-3", bold: "text-body-3-bold" },
  xl: { normal: "text-body-2", bold: "text-body-2-bold" },
  "2xl": { normal: "text-body-2", bold: "text-body-2-bold" },
};

/** startSlot 정사각 슬롯 크기(Figma 검증). */
const SIZE_START_SLOT: Record<HorizontalMenuButtonSize, string> = {
  sm: "size-(--sz-22)",
  md: "size-(--sz-28)",
  lg: "size-(--sz-32)",
  xl: "size-(--sz-38)",
  "2xl": "size-(--sz-42)",
};

/** chevron 아이콘 px(Figma 검증). */
const SIZE_CHEVRON_PX: Record<HorizontalMenuButtonSize, number> = {
  sm: 16,
  md: 18,
  lg: 18,
  xl: 20,
  "2xl": 20,
};

export function HorizontalMenuButton({
  variant = "text",
  size = "sm",
  bold = false,
  chevron = true,
  startSlot,
  endSlot,
  children,
  type,
  className,
  ...rest
}: HorizontalMenuButtonProps) {
  const padding = variant === "outline" ? OUTLINE_PADDING[size] : TEXT_PADDING;
  const showOption = chevron || Boolean(endSlot);

  return (
    <button
      type={type ?? "button"}
      data-variant={variant}
      data-size={size}
      data-bold={bold}
      className={[
        ROOT_BASE,
        VARIANT_ROOT[variant],
        SIZE_RADIUS[size],
        SIZE_MIN_HEIGHT[variant][size],
        padding,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <span
        data-name="inner"
        className={[
          "flex flex-1 min-w-0 items-center justify-center",
          SIZE_INNER_GAP[size],
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          data-name="left"
          className={[
            "flex flex-1 min-w-0 items-center justify-center",
            SIZE_LEFT_GAP[size],
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {startSlot ? (
            <span
              className={[
                "inline-flex shrink-0 items-center justify-center text-icon-neutral-light",
                SIZE_START_SLOT[size],
              ].join(" ")}
            >
              {startSlot}
            </span>
          ) : null}
          <span
            className={[
              "min-w-0 flex-1 break-words text-left text-typo-neutral-normal",
              SIZE_TYPO[size][bold ? "bold" : "normal"],
            ].join(" ")}
          >
            {children}
          </span>
        </span>
        {showOption ? (
          <span
            data-name="option"
            className={[
              "inline-flex shrink-0 items-center justify-center",
              SIZE_OPTION_GAP[size],
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {endSlot}
            {chevron ? (
              <Icon
                name="chevron_right_line"
                size={SIZE_CHEVRON_PX[size]}
                className="shrink-0 text-icon-neutral-light"
                aria-hidden
              />
            ) : null}
          </span>
        ) : null}
      </span>
    </button>
  );
}
