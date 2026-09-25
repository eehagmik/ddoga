/**
 * 좋아요/북마크 토글 버튼(LikeToggle).
 *
 * Figma "또가3.0 Design System / LikeToggle" (node 51405:112826) 와 1:1.
 * 아이콘 단독으로, 클릭할 때마다 찜/좋아요 상태를 뒤집는 아톰형 토글 버튼이다.
 *
 * `LikeToggleWithLabel` 이 이 모듈이 내보내는 아이콘 렌더 함수(`LikeToggleGlyph`)를
 * 그대로 가져다 쓴다 — 다만 실제 `<button>` 엘리먼트는 두 컴포넌트가 각자 소유한다
 * (Figma 상 라벨 버전도 `LikeToggle` 인스턴스를 중첩하지 않고 별도 하위 아이콘
 * 컴포넌트를 쓰며, HTML 로도 버튼 안에 버튼을 넣을 수 없기 때문). `Checkbox` 아톰이
 * `CheckboxWithLabel`/`CheckboxCard` 에 재사용되는 것과 같은 원리를, "버튼 크롬은
 * 각자, 아이콘 렌더 로직은 공유"로 변형한 구조다.
 *
 * 축(Figma variant → props):
 * - `variant` : heart / bookmark
 * - `color`   : neutralNormal / neutralLight / inverse — **unchecked 라인 아이콘 색만** 바꾼다
 *               (밝은/어두운 배경 위에서 대비를 맞추는 용도). checked 아이콘은 색이 고정이라
 *               이 prop 과 무관하다.
 * - `checked` : controlled(`checked`+`onCheckedChange`) 또는 uncontrolled(`defaultChecked`).
 *               Figma 에 state(hover/disabled/readOnly) 축이 없다 — variant/color/checked 3축뿐이다.
 *
 * checked 아이콘 색(Figma 검증, `color` prop 과 무관하게 고정):
 * - heart    : Pink/500 → Red/500 그라데이션. Figma 설명에 "Semantic 토큰이 없어 임의로
 *              Hex 를 적용했다"고 명시된 예외 케이스 — 이번 구현은 `like` 세만틱 컬러
 *              스케일(danger/info 패턴 확장)을 신설해 프리미티브 직접 참조를 없앴다.
 *              `--color-icon-like-gradientStart`(pink.500) / `--color-icon-like-gradientEnd`(red.500).
 * - bookmark : 단색 `icon/info/normal`(blue.500, 기존 세만틱 토큰 재사용, 신규 토큰 불필요).
 *
 * 아이콘 전용 버튼이라 접근 가능한 이름이 필요하다. `aria-label` 을 생략하면
 * variant 별 기본값("좋아요"/"북마크")을 쓴다(`ClearButton` 선례).
 *
 * 색·크기·투명도는 전부 semantic 토큰 유틸/`var(--*)` 로만 지정한다 — 하드코딩 없음.
 *
 * off→on 바운스 애니메이션(2026-09-14 추가): `checked` 가 `false→true` 로 바뀌는
 * 순간에만 아이콘이 살짝 커졌다 작아진다(`false` 로 꺼질 때·최초 마운트 시엔 없음).
 * `LikeToggleGlyph` 내부에서 이전 `checked` 를 ref 로 추적해 전환을 감지하고,
 * `src/index.css` 에 정의한 `animate-like-bounce`(Tailwind v4 커스텀 애니메이션
 * 유틸, keyframe `like-bounce`)를 애니메이션이 끝날 때까지만 임시로 부여한다.
 * `LikeToggle`/`LikeToggleWithLabel` 모두 이 글리프를 공유하므로 별도 작업 없이
 * 둘 다 동일하게 적용된다. `motion-reduce:animate-none` 으로 접근성도 지킨다.
 */

import { useEffect, useId, useRef, useState } from "react";
import type {
  AnimationEventHandler,
  ButtonHTMLAttributes,
  MouseEvent,
} from "react";

import { Icon } from "../../../icons";

export type LikeToggleVariant = "heart" | "bookmark";
export type LikeToggleColor = "neutralNormal" | "neutralLight" | "inverse";

export interface LikeToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> {
  /** 아이콘 종류(Figma `variant`). 기본 'heart' */
  variant?: LikeToggleVariant;
  /** unchecked 라인 아이콘 색(Figma `color`). 기본 'neutralNormal' */
  color?: LikeToggleColor;
  /** 체크 여부(controlled). 지정 시 `defaultChecked` 는 무시된다. */
  checked?: boolean;
  /** 초기 체크 여부(uncontrolled). 기본 false */
  defaultChecked?: boolean;
  /** 체크 상태 변경 콜백. */
  onCheckedChange?: (checked: boolean) => void;
  /** 루트 button 에 병합할 클래스 */
  className?: string;
}

/** variant 별 기본 접근성 라벨(Figma 미정의라 코드에서 부여, `ClearButton` 선례). */
const DEFAULT_LABEL: Record<LikeToggleVariant, string> = {
  heart: "좋아요",
  bookmark: "북마크",
};

/** unchecked 라인 아이콘 색 매핑(`LikeToggle` 전용 — `color` 축 3종). */
const LINE_COLOR_CLASS: Record<LikeToggleColor, string> = {
  neutralNormal: "text-icon-neutral-normal",
  neutralLight: "text-icon-neutral-light",
  inverse: "text-icon-inverse-normal",
};

export type LikeToggleGlyphSize = 18 | 24;

export interface LikeToggleGlyphProps {
  variant: LikeToggleVariant;
  checked: boolean;
  /** 18(LikeToggleWithLabel outline) / 24(LikeToggle, LikeToggleWithLabel transparent) */
  size: LikeToggleGlyphSize;
  /**
   * unchecked 라인 아이콘 색 클래스(예: `text-icon-neutral-normal`). checked 는 고정색이라
   * 무시된다. 호출부가 직접 결정해서 넘긴다 — `LikeToggle` 은 `color` 축 3종 중 하나를,
   * `LikeToggleWithLabel` 은 `appearance` 축에 종속된 2종 중 하나를 넘긴다(둘의 팔레트가
   * 달라 이 함수 내부에 고정 매핑을 두지 않는다).
   */
  lineColorClassName: string;
  className?: string;
}

/**
 * Figma `heart_solid` 경로에 Pink→Red 그라데이션 `fill` 을 입힌 전용 글리프.
 * 파운데이션 `Icon` 은 `currentColor` 단색만 지원해 그라데이션을 표현할 수 없어
 * 인라인 SVG 로 직접 그린다(`Checkbox` 의 `CheckMark` 선례). 여러 인스턴스가 한
 * 페이지에 있어도 그라데이션 id 가 충돌하지 않도록 `useId` 로 고유 id 를 만든다.
 */
function HeartSolidGradient({
  size,
  className,
  onAnimationEnd,
}: {
  size: number;
  className?: string;
  onAnimationEnd?: AnimationEventHandler<SVGSVGElement>;
}) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      focusable={false}
      aria-hidden
      className={className}
      onAnimationEnd={onAnimationEnd}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-icon-like-gradientStart)" />
          <stop offset="100%" stopColor="var(--color-icon-like-gradientEnd)" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9928 3.71691C9.65285 1.67202 6.19239 1.25356 3.50509 3.54965C0.598301 6.03328 0.175971 10.2161 2.47459 13.1739C3.34712 14.2967 5.05011 15.9835 6.68672 17.5282C8.34249 19.0911 9.99445 20.5679 10.8091 21.2894C10.8142 21.2939 10.8194 21.2985 10.8247 21.3032C10.9012 21.371 10.9966 21.4556 11.088 21.5244C11.1974 21.6068 11.3545 21.7091 11.5643 21.7717C11.8432 21.8549 12.143 21.8549 12.422 21.7717C12.6318 21.7091 12.7889 21.6068 12.8983 21.5244C12.9897 21.4556 13.085 21.371 13.1616 21.3032C13.1669 21.2985 13.1721 21.2939 13.1772 21.2894C13.9918 20.5679 15.6438 19.0911 17.2996 17.5282C18.9362 15.9835 20.6392 14.2967 21.5117 13.1739C23.8015 10.2275 23.4444 6.01238 20.4708 3.54088C17.7536 1.28246 14.33 1.67124 11.9928 3.71691Z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}

/** off→on 전환 시에만 켜지는 바운스 애니메이션 클래스(끝나면 스스로 제거됨). */
const BOUNCE_CLASS =
  "origin-center animate-like-bounce motion-reduce:animate-none";

/**
 * `checked` 가 `false→true` 로 바뀐 순간만 감지해서 `true` 를 잠깐 반환하는 훅.
 * `true→false`(꺼짐)나 최초 마운트 시(마운트 시점 값을 그대로 기준으로 삼음)는
 * 감지하지 않는다. 호출부가 `onAnimationEnd` 에서 리셋해줘야 한다.
 */
function useBounceOnChecked(checked: boolean) {
  const wasChecked = useRef(checked);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (checked && !wasChecked.current) {
      setIsBouncing(true);
    }
    wasChecked.current = checked;
  }, [checked]);

  return [isBouncing, () => setIsBouncing(false)] as const;
}

/**
 * variant/checked 에 맞는 아이콘 글리프만 렌더한다(버튼 크롬 없음).
 * `LikeToggle`(단독 버튼)과 `LikeToggleWithLabel`(라벨 포함 버튼) 양쪽이 이 함수를 공유한다.
 * off→on 전환 바운스도 여기서 처리하므로 두 부모 컴포넌트는 신경 쓸 필요가 없다.
 */
export function LikeToggleGlyph({
  variant,
  checked,
  size,
  lineColorClassName,
  className,
}: LikeToggleGlyphProps) {
  const [isBouncing, stopBounce] = useBounceOnChecked(checked);
  const bounceClassName = isBouncing ? BOUNCE_CLASS : "";

  if (checked && variant === "heart") {
    return (
      <HeartSolidGradient
        size={size}
        className={[bounceClassName, className].filter(Boolean).join(" ")}
        onAnimationEnd={stopBounce}
      />
    );
  }
  if (checked) {
    return (
      <Icon
        name="bookmark_solid"
        size={size}
        className={["text-icon-info-normal", bounceClassName, className]
          .filter(Boolean)
          .join(" ")}
        onAnimationEnd={stopBounce}
      />
    );
  }
  return (
    <Icon
      name={variant === "heart" ? "heart_line" : "bookmark_line"}
      size={size}
      className={[lineColorClassName, className].filter(Boolean).join(" ")}
    />
  );
}

/**
 * 루트 공통 — 24×24 고정 · 중앙정렬 · 클릭 가능 커서 · focus-visible opacity dip
 * (`IconButton`/`ClearButton` 선례 — 크롬 없는 아이콘 버튼은 --alpha-60).
 */
const BASE_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center size-(--sz-24) " +
  "transition-opacity duration-150 ease-in-out motion-reduce:transition-none " +
  "focus-visible:outline-none focus-visible:opacity-(--alpha-60)";

export function LikeToggle({
  variant = "heart",
  color = "neutralNormal",
  checked,
  defaultChecked = false,
  onCheckedChange,
  className,
  onClick,
  type = "button",
  "aria-label": ariaLabel,
  ...rest
}: LikeToggleProps) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(defaultChecked);
  const current = isControlled ? (checked as boolean) : internal;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const next = !current;
    if (!isControlled) setInternal(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type={type}
      aria-pressed={current}
      aria-label={ariaLabel ?? DEFAULT_LABEL[variant]}
      data-variant={variant}
      data-color={color}
      data-checked={current}
      onClick={handleClick}
      className={[BASE_CLASS, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <LikeToggleGlyph
        variant={variant}
        checked={current}
        lineColorClassName={LINE_COLOR_CLASS[color]}
        size={24}
      />
    </button>
  );
}
