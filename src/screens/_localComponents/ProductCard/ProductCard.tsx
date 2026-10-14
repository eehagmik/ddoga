/**
 * ProductCard — 상품 진열(베스트셀러/최저가) 그리드용 세로형 상품 카드.
 *
 * 쓰는 곳: 메인 화면 `ProductGridSection`. 2열 그리드 안에서 폭은 호출부가 `className`으로 정한다.
 *
 * 디자인 의도(코드만 봐선 알기 어려운 것):
 * - 리뷰가 0건이면 `rating`을 생략한다 → 평점 줄 자체가 안 보인다("0.0 (0)"을 띄우지 않음).
 * - 할인이 없는 상품은 `originalPrice`를 생략하고 `discountPercent="0%"`로 넘긴다 → 취소선 정가 줄이 사라진다.
 * - 생김새는 `StoreCard`(vertical/maximum)와 같지만, `StoreCard`는 Figma 컴포넌트와
 *   1:1이라 `rating`이 필수라서 이 섹션용으로 따로 둔다.
 * - `onClick`을 주면 카드 전체가 버튼이 된다(키보드 Enter/Space, hover·포커스 표시 포함).
 *
 * @example
 * <ProductCard
 *   className="w-full"
 *   category="지팡이"
 *   name="지팡이 BS 2중 카본 경량형"
 *   thumbnailSrc={url}
 *   originalPrice="61,500원"
 *   discountPercent="85%"
 *   price="9,220원"
 *   badges={["무료배송"]}
 *   rating={{ score: "4.9", count: "(78)" }}
 *   onClick={() => navigate(`/product/${id}`)}
 * />
 */

import type { KeyboardEvent } from "react";

import { Icon } from "../../../icons";
import { BlankGraphic } from "../../../components/ui/BlankGraphic";

export interface ProductCardProps {
  /** 썸네일 이미지 URL. 생략하면 `BlankGraphic` 플레이스홀더. */
  thumbnailSrc?: string;
  /** 카테고리명. */
  category: string;
  /** 상품명(최대 2줄, 초과 시 말줄임). */
  name: string;
  /** 정가(취소선). 생략하면 렌더하지 않는다(할인 자체가 없는 상품). */
  originalPrice?: string;
  /** 할인율 텍스트(예: "85%"). 할인이 없으면 "0%". */
  discountPercent: string;
  /** 할인가 텍스트(예: "15,000원"). */
  price: string;
  /** 하단 배지 텍스트 목록(예: "무료배송"). 생략하면 렌더하지 않는다. */
  badges?: string[];
  /** 리뷰 평점. 생략하면 평점 줄 자체를 렌더하지 않는다(실제 사이트 — 리뷰
   * 0건 상품은 "0.0 (0)"이 아니라 줄 자체가 없음). */
  rating?: { score: string; count: string };
  /** 루트에 병합할 클래스(폭 등 — 호출부가 결정). */
  className?: string;
  /** 카드 클릭 핸들러. 없으면 비인터랙티브. */
  onClick?: () => void;
}

export function ProductCard({
  thumbnailSrc,
  category,
  name,
  originalPrice,
  discountPercent,
  price,
  badges,
  rating,
  className,
  onClick,
}: ProductCardProps) {
  return (
    <div
      {...(onClick
        ? {
            role: "button" as const,
            tabIndex: 0,
            onClick,
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            },
          }
        : {})}
      className={[
        "flex flex-col items-start gap-(--sz-10)",
        onClick
          ? "cursor-pointer transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full shrink-0">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt=""
            aria-hidden="true"
            className="aspect-square w-full rounded-md object-cover"
          />
        ) : (
          <BlankGraphic
            ratio="1/1"
            className="aspect-square w-full rounded-md"
          />
        )}
      </div>

      <div className="flex w-full flex-col items-start gap-(--sz-5)">
        <p className="w-full truncate text-body-6 text-typo-neutral-bright">
          {category}
        </p>
        <p className="line-clamp-2 w-full text-body-4 text-typo-neutral-subtle">
          {name}
        </p>

        <div className="flex w-full flex-col items-start">
          {originalPrice ? (
            <p className="text-body-6 text-typo-neutral-bright line-through">
              {originalPrice}
            </p>
          ) : null}
          <div className="flex w-full items-center gap-(--sz-2)">
            <span className="text-body-4-bold text-typo-danger-normal">
              {discountPercent}
            </span>
            <span className="text-body-3-bold text-typo-neutral-normal">
              {price}
            </span>
          </div>
        </div>

        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap items-center gap-(--sz-6)">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-xs border-xs border-solid border-border-neutral-bright bg-bg-neutral-deep px-(--sz-6) py-(--sz-2) text-body-6 text-typo-neutral-subtle"
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}

        {rating ? (
          <div className="flex items-center gap-(--sz-2)">
            <Icon
              name="star_01_solid"
              size={16}
              className="text-icon-warning-normal"
            />
            <span className="text-body-5 text-typo-neutral-subtle">
              {rating.score}
            </span>
            <span className="text-body-5 text-typo-neutral-bright">
              {rating.count}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
