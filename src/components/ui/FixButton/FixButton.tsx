/**
 * 화면 하단 고정 CTA 버튼 영역(FixButton).
 *
 * Figma "또가3.0 Design System / FixButton" (node 51405:84574, 문서 페이지 51405:84563) 와 1:1.
 * 폰 화면 최하단, OS 내비게이션 바로 바로 위에 고정되어 상시 노출되는 CTA 바다.
 * 한글 별칭: 픽스드버튼/고정버튼/하단고정버튼/바텀버튼.
 *
 * 구현: 슬롯은 전부 기존 원자 컴포넌트(`ButtonWithLabel`/`ButtonWithIcon`)를 고정된
 * color/variant/size로 합성한다 — 소비자가 임의로 색·스타일을 바꿔 토큰 규칙을 깨지
 * 못하게 컴포넌트 경계에서 강제한다.
 *
 * 축(Figma `variable` → `variant` prop, 6종 — 필요한 슬롯 구조 자체가 달라 discriminated
 * union으로 표현한다):
 * | variant    | 구성                                                              |
 * | single     | 메인 버튼 1개, 풀와이드 (`ButtonWithLabel` brand/fill/2xl)          |
 * | symmetry   | 보조(outline/neutral/2xl) + 메인, 동일폭 flex-1                    |
 * | asymmetry  | 보조(min-width `--sz-100` 고정) + 메인 flex-1                      |
 * | iconButton | 아이콘 정사각(`ButtonWithIcon` neutral/outline/2xl, 54×54) + 메인   |
 * | likeToggle | 54×54 자유 콘텐츠 슬롯(`toggleSlot`, 크롬 없음 — 자체 `<button>` 을 |
 * |            | 이미 소유한 `<LikeToggle/>` 등을 그대로 렌더, FixButton이 추가로     |
 * |            | `<button>` 으로 감싸지 않는다) + 메인                                |
 * | vertical   | 세로 스택: 메인(풀와이드) + 보조 텍스트 버튼(neutral/text/md, 풀와이드) |
 *
 * `gradientVisible`(Figma boolean): 상단 18px 흰색 스크림 페이드 노출 여부. 콘텐츠와의
 * 시각적 분리를 보더/그림자가 아니라 순수 그라데이션으로만 한다(Figma 스펙에 보더·그림자
 * 없음 — `--shadow-bottomNav` 토큰이 별도로 존재하지만 이 컴포넌트는 채택하지 않는다).
 * 방향은 위(투명)→아래(불투명, 버튼 바와 바로 이어짐)로 구현했다.
 *
 * 배치: `TopButton`처럼 원형 버튼의 좌표 자체를 밀어 올리는 방식이 아니라, 풀블리드
 * 흰 배경이 화면 바닥까지 차야 하므로 루트는 항상 `bottom-0`으로 고정하고, safe-area
 * 여백은 버튼 바의 `padding-bottom`에 흡수한다(배경은 바닥까지, 버튼 콘텐츠만 home
 * indicator 위로 밀려 올라간다).
 *
 * 통합 시 소비자 책임(Header가 위치를 소비자에게 넘기는 설계 원칙과 동일):
 * - `TopButton`과 함께 쓸 때는 겹치지 않도록 `TopButton`의 `className`으로 `bottom-*`를
 *   이 컴포넌트 높이(+safe-area+간격)만큼 밀어야 한다.
 * - 스크롤 콘텐츠 마지막 요소가 가리지 않도록 컨테이너 하단에 이 바 높이(+safe-area)만큼
 *   `padding-bottom`을 둬야 한다.
 *
 * 색·크기·간격은 전부 semantic 토큰 유틸/`var(--sz-*)`로만 지정한다 — 하드코딩 없음.
 */

import type { MouseEventHandler, ReactNode } from "react";

import { ButtonWithIcon } from "../ButtonWithIcon";
import { ButtonWithLabel } from "../ButtonWithLabel";

export type FixButtonVariant =
  | "single"
  | "symmetry"
  | "asymmetry"
  | "iconButton"
  | "likeToggle"
  | "vertical";

interface FixButtonCommonProps {
  /** 상단 18px 그라데이션 페이드 노출 여부(Figma `gradientVisible`). 기본 false */
  gradientVisible?: boolean;
  /** 루트(fixed 컨테이너)에 병합할 클래스. */
  className?: string;
}

/** 모든 variant 공통 메인 액션(`ButtonWithLabel` brand/fill/2xl). */
interface FixButtonPrimaryProps {
  /** 메인 버튼 라벨(필수). */
  primaryLabel: ReactNode;
  onPrimaryClick?: MouseEventHandler<HTMLButtonElement>;
  primaryDisabled?: boolean;
  primaryStartIcon?: ReactNode;
  primaryEndIcon?: ReactNode;
  /** 기본 "button". 폼 제출 버튼으로 쓸 때 "submit" 지정. */
  primaryType?: "button" | "submit" | "reset";
}

/** symmetry/asymmetry 전용 보조 액션(`ButtonWithLabel` neutral/outline/2xl). */
interface FixButtonSecondaryProps {
  /** 보조 버튼 라벨(필수). */
  secondaryLabel: ReactNode;
  onSecondaryClick?: MouseEventHandler<HTMLButtonElement>;
  secondaryDisabled?: boolean;
  secondaryStartIcon?: ReactNode;
  secondaryEndIcon?: ReactNode;
}

export interface FixButtonSingleProps
  extends FixButtonCommonProps, FixButtonPrimaryProps {
  variant: "single";
}

export interface FixButtonSymmetryProps
  extends FixButtonCommonProps, FixButtonPrimaryProps, FixButtonSecondaryProps {
  variant: "symmetry";
}

export interface FixButtonAsymmetryProps
  extends FixButtonCommonProps, FixButtonPrimaryProps, FixButtonSecondaryProps {
  variant: "asymmetry";
}

export interface FixButtonIconButtonProps
  extends FixButtonCommonProps, FixButtonPrimaryProps {
  variant: "iconButton";
  /** 54×54 아이콘 버튼 내부 글리프(필수). */
  icon: ReactNode;
  /** 아이콘 버튼 접근 가능한 이름(필수, 텍스트가 없어 `aria-label`로만 노출). */
  iconAriaLabel: string;
  onIconClick?: MouseEventHandler<HTMLButtonElement>;
  iconDisabled?: boolean;
}

export interface FixButtonLikeToggleProps
  extends FixButtonCommonProps, FixButtonPrimaryProps {
  variant: "likeToggle";
  /**
   * 54×54 정사각 영역에 그대로 렌더할 자유 콘텐츠(예: `<LikeToggle/>`).
   * 이미 자체 `<button>`을 소유한 콘텐츠를 그대로 전달한다 — FixButton은 이 슬롯을
   * 추가로 `<button>`으로 감싸지 않는다(버튼 중첩 방지, `LikeToggleWithLabel` 선례).
   */
  toggleSlot: ReactNode;
}

export interface FixButtonVerticalProps
  extends FixButtonCommonProps, FixButtonPrimaryProps {
  variant: "vertical";
  /** 하단 보조 텍스트 버튼 라벨(필수, `ButtonWithLabel` neutral/text/md). */
  secondaryTextLabel: ReactNode;
  onSecondaryTextClick?: MouseEventHandler<HTMLButtonElement>;
  secondaryTextDisabled?: boolean;
}

export type FixButtonProps =
  | FixButtonSingleProps
  | FixButtonSymmetryProps
  | FixButtonAsymmetryProps
  | FixButtonIconButtonProps
  | FixButtonLikeToggleProps
  | FixButtonVerticalProps;

/** 루트 — 화면 하단 풀블리드 고정. safe-area는 배경이 아니라 바(BAR_BASE) padding에 흡수. */
const ROOT_CLASS = "fixed inset-x-0 bottom-0 z-50 flex w-full flex-col";

/** 상단 스크림. 순수 장식(`aria-hidden`), 보더·그림자 없음(Figma 스펙 준수). */
const GRADIENT_CLASS =
  "h-[var(--sz-18)] w-full shrink-0 " +
  "bg-[linear-gradient(to_bottom,var(--color-bg-neutral-none),var(--color-bg-neutral-normal))]";

/** 버튼 바 — 풀와이드, 흰 배경, safe-area를 pb 에 흡수. */
const BAR_BASE =
  "flex w-full items-stretch gap-[var(--sz-8)] bg-bg-neutral-normal " +
  "pt-[var(--sz-4)] px-[var(--sz-20)] " +
  "pb-[calc(env(safe-area-inset-bottom,0px)+var(--sz-8))]";

/** vertical만 세로 스택, 나머지는 기본 가로 배치. */
const BAR_DIRECTION: Record<FixButtonVariant, string> = {
  single: "",
  symmetry: "",
  asymmetry: "",
  iconButton: "",
  likeToggle: "",
  vertical: "flex-col",
};

function renderPrimary(props: FixButtonPrimaryProps, className: string) {
  return (
    <ButtonWithLabel
      color="brand"
      variant="fill"
      size="2xl"
      type={props.primaryType ?? "button"}
      onClick={props.onPrimaryClick}
      disabled={props.primaryDisabled}
      startIcon={props.primaryStartIcon}
      endIcon={props.primaryEndIcon}
      className={className}
    >
      {props.primaryLabel}
    </ButtonWithLabel>
  );
}

function renderSecondary(props: FixButtonSecondaryProps, className: string) {
  return (
    <ButtonWithLabel
      color="neutral"
      variant="outline"
      size="2xl"
      onClick={props.onSecondaryClick}
      disabled={props.secondaryDisabled}
      startIcon={props.secondaryStartIcon}
      endIcon={props.secondaryEndIcon}
      className={className}
    >
      {props.secondaryLabel}
    </ButtonWithLabel>
  );
}

function renderSlots(props: FixButtonProps) {
  switch (props.variant) {
    case "single":
      return renderPrimary(props, "flex-1");

    case "symmetry":
      return (
        <>
          {renderSecondary(props, "flex-1")}
          {renderPrimary(props, "flex-1")}
        </>
      );

    case "asymmetry":
      return (
        <>
          {renderSecondary(props, "min-w-[var(--sz-100)]")}
          {renderPrimary(props, "flex-1")}
        </>
      );

    case "iconButton":
      return (
        <>
          <ButtonWithIcon
            aria-label={props.iconAriaLabel}
            color="neutral"
            variant="outline"
            size="2xl"
            onClick={props.onIconClick}
            disabled={props.iconDisabled}
          >
            {props.icon}
          </ButtonWithIcon>
          {renderPrimary(props, "flex-1")}
        </>
      );

    case "likeToggle":
      return (
        <>
          <div className="flex size-[var(--sz-54)] shrink-0 items-center justify-center">
            {props.toggleSlot}
          </div>
          {renderPrimary(props, "flex-1")}
        </>
      );

    case "vertical":
      return (
        <>
          {renderPrimary(props, "w-full")}
          <ButtonWithLabel
            color="neutral"
            variant="text"
            size="md"
            onClick={props.onSecondaryTextClick}
            disabled={props.secondaryTextDisabled}
            className="w-full"
          >
            {props.secondaryTextLabel}
          </ButtonWithLabel>
        </>
      );
  }
}

export function FixButton(props: FixButtonProps) {
  const { gradientVisible = false, className, variant } = props;

  return (
    <div
      data-variant={variant}
      data-gradient={gradientVisible}
      className={[ROOT_CLASS, className].filter(Boolean).join(" ")}
    >
      {gradientVisible ? <div aria-hidden className={GRADIENT_CLASS} /> : null}
      <div
        className={[BAR_BASE, BAR_DIRECTION[variant]].filter(Boolean).join(" ")}
      >
        {renderSlots(props)}
      </div>
    </div>
  );
}
