/**
 * 배너(Banner).
 *
 * Figma "또가3.0 Design System" 문서 페이지(캔버스 51405:7223, "❖ Banner") 안의
 * Banner 컴포넌트(메인 컴포넌트 프레임 51405:7725) 와 1:1. 카드 리스트 사이사이에
 * 끼워 넣는 광고/공지성 콘텐츠 슬롯 — 콘텐츠 없이 크기·모서리·비율만 정의하는
 * 순수 컨테이너다.
 *
 * Figma 심볼은 4개뿐이다: `variant`("round"|"sharp") × `ratio`("16:9"|"4:1").
 * `ratio` 값 자체가 CSS `aspect-ratio` 로 그대로 쓰이는 이름이라(320:180=16/9,
 * 320:80=4/1) 폭 고정 없이 `aspect-[16/9]`/`aspect-[4/1]` 로 구현한다. Figma 캔버스
 * 실측 폭 320px 은 문서화용 고정 프레임일 뿐이라(HorizontalMenuButton/GalleryCard
 * 선례와 동일 원칙) 하드코딩하지 않고 `w-full` 로 호출부가 실제 폭을 결정한다.
 *
 * `variant="round"` 는 `rounded-2xl`(Figma `radius/2xl` 16px), `variant="sharp"`
 * 는 모서리 없음(Figma 실측 그대로 radius 클래스 미부여). state(hover/focus) 축은
 * Figma 에 없다 — 정적 컨테이너.
 *
 * Figma 는 `ratio` 별로 슬롯 prop 이 `prop169Blank`/`prop41Blank` 두 개로 나뉘어
 * 있지만 어차피 동시에 하나만 쓰이므로(상호 배타) 코드에서는 `children` 슬롯
 * 하나로 통합했다(Card 계열 선례와 동일 원칙). 두 prop 모두 기본값이 Figma
 * "BlankGraphic" 인스턴스라 — children 을 생략하면 기존 `BlankGraphic` 컴포넌트를
 * 그대로 기본 콘텐츠로 렌더한다(ImageCard 의 "슬롯 완전히 비어있음"과 달리 이
 * 컴포넌트는 Figma 자체가 플레이스홀더를 기본값으로 지정해 둔 케이스).
 */

import type { ReactNode } from "react";

import { BlankGraphic } from "../BlankGraphic";

export type BannerVariant = "round" | "sharp";
export type BannerRatio = "16:9" | "4:1";

export interface BannerProps {
  /** 모서리 형태. "round"=rounded-2xl, "sharp"=모서리 없음. 기본 "round" */
  variant?: BannerVariant;
  /** 가로세로 비율(CSS aspect-ratio 값과 동일 표기). 기본 "16:9" */
  ratio?: BannerRatio;
  /** 콘텐츠 슬롯. 기본값은 `BlankGraphic`(Figma 기본 플레이스홀더). */
  children?: ReactNode;
  /** 루트에 병합할 클래스. */
  className?: string;
}

/** `variant` 별 모서리(Figma 실측 — sharp 는 radius 클래스 없음). */
const RADIUS_CLASS: Record<BannerVariant, string> = {
  round: "rounded-2xl",
  sharp: "",
};

/** `ratio` 별 aspect-ratio(Figma 320x180/320x80 실측 == 16/9, 4/1). */
const RATIO_ASPECT_CLASS: Record<BannerRatio, string> = {
  "16:9": "aspect-[16/9]",
  "4:1": "aspect-[4/1]",
};

const ROOT_BASE = "flex w-full items-start overflow-hidden isolate";

export function Banner({
  variant = "round",
  ratio = "16:9",
  children,
  className,
}: BannerProps) {
  const rootClassName = [
    ROOT_BASE,
    RADIUS_CLASS[variant],
    RATIO_ASPECT_CLASS[ratio],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-name="Banner"
      data-variant={variant}
      data-ratio={ratio}
      className={rootClassName}
    >
      {children ?? <BlankGraphic className="h-full w-full" />}
    </div>
  );
}
