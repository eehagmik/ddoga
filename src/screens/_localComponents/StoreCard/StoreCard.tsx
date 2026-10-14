/**
 * StoreCard — 스토어 상품 카드(통합).
 *
 * 기존 `PopularProductCard`(가로 스크롤 전용)와 `StoreProductCard`(그리드 전용)를
 * 하나로 합쳤다(2026-09-25). Figma 재조사 결과 두 파일은 실제로는 둘 다
 * `Card/Store/Vertical`(문서 노드 14885:16824) 계열이었다 — 각각
 * `size="minimum"`(정본 노드 15564:171356, 128px 고정폭)과 `size="maximum"`(정본
 * 노드 14885:16731, 195px 고정폭이지만 그리드 채움 목적상 폭 축은 호출부에
 * 맡긴다) 변형이었을 뿐, 이름과 달리 "Horizontal" 계열을 구현한 적은 없었다.
 * `Card/Store/Horizontal`(문서 노드 16458:44058, 썸네일이 왼쪽에 오는 가로형
 * 레이아웃, size="maximum"→14885:16873/size="minimum"→16111:233283)은 이번에
 * 처음 구현한다.
 *
 * `direction`(`"vertical" | "horizontal"`) × `size`(`"maximum" | "minimum"`) 두
 * 축으로 4가지 조합을 지원한다. `soldout` variant 축은 두 원본 컴포넌트 모두
 * 미구현 상태였고 이번 화면에도 품절 데이터가 없어 범위 밖으로 유지한다.
 *
 * 타이포는 실측 결과 두 그룹으로만 갈린다("compact"/"regular") —
 * `direction="vertical" && size="maximum"`(구 `StoreProductCard`)만 "regular"
 * (`text-body-6`/`text-body-4`/`text-body-4-bold`/`text-body-3-bold`/`text-body-5`)이고,
 * 나머지 세 조합(vertical/minimum, horizontal/maximum, horizontal/minimum)은
 * 전부 "compact"(`text-label-3`/`text-other-store-card`/`text-other-price-2`/
 * `text-label-2-bold`/`text-body-4-bold`/`text-label-2`) — Figma `Card/Store/
 * Horizontal`은 `size` variant와 무관하게 항상 `EtcCost`의 `xs`(compact) 스타일만
 * 쓰기 때문에 `PopularProductCard`(vertical/minimum)와 타이포가 완전히 같다.
 * 하단 배지(`BadgesRow`)도 같은 기준으로 compact(=`w-full pb-(--sz-5)
 * text-label-3`)/regular(=패딩 없음 `text-body-6`)로 갈리는데, 이 regular 쪽의
 * `w-full`/`pb-*` 부재는 구 `StoreProductCard`의 실제 동작을 그대로 보존한 것이다
 * (Figma 실측과 다를 수 있으나, 이번 통합에서 기존 vertical 렌더링 결과를 바꾸지
 * 않기로 확정했다 — 정정은 랭킹 뱃지 한 건만 예외).
 *
 * 랭킹 뱃지: 구 `StoreProductCard`는 원형 숫자 배지로 근사했었는데, Figma
 * 재조사 결과 `Card/Store/Vertical`과 `Card/Store/Horizontal` 양쪽 모두(둘 다
 * `size="maximum"`) 동일한 리본형 그래픽(`_parts/Sticker/Ranking`, 30×32,
 * `PopularProductCard`가 이미 구현해둔 `RankBadge`와 완전히 동일)을 쓴다는 게
 * 확인돼, 이번 통합에서 리본형으로 정정했다(사용자 승인, 유일한 렌더링 변경
 * 지점). `direction="horizontal" && size="minimum"`은 Figma 자체에 랭킹 뱃지
 * 슬롯이 없어(`isMaximumAndNotSoldout` 조건에만 묶여 있음) `rank` prop을 받아도
 * 렌더하지 않는다.
 *
 * 하단 배지(무료배송/안심보장)는 Figma가 `EtcStickerFreeShpping`(고정폭 pill)/
 * `EtcStickerComfort`(이미지 자산, 컴포넌트 설명에 "디자인 미확정이라 보류"로
 * 명시)의 2슬롯 구조를 쓰지만, 두 원본 파일이 이미 `badges: string[]` 텍스트
 * pill 배열로 단순화해뒀고 `Main.tsx` 데이터도 이 형태라 그대로 유지한다(개별
 * boolean 슬롯으로 바꾸지 않음).
 *
 * 폭: `direction="vertical" && size="minimum"`만 Figma 마스터 자체가 고정폭이라
 * (다른 곳에서 재사용될 치수가 아님) 루트에 `w-(--sz-128)`을 직접 박아넣는다.
 * 나머지 세 조합은 전부 호출부가 `className`으로 폭을 결정한다(vertical/maximum은
 * 기존 `StoreProductCard` 관례 그대로, horizontal 두 종은 Figma 상 `info` 영역이
 * `flex-1`이라 애초에 고정폭 개념이 없다).
 *
 * 썸네일: 2026-09-26 1차 조사 때는 "실시간 인기 상품"(`direction="vertical"
 * size="minimum"`)만 Figma가 상품별로 다른 실제 사진을 갖고 있어 `thumbnailSrc`
 * prop을 그 경로에만 연결했다(`Thumbnail` 내부 컴포넌트). "상품 진열#1/#2"
 * (`size="maximum"`)는 그때 Figma 쪽 썸네일이 전부 동일한 `placeholder-store`
 * 스톡 이미지였어서 미정 상태로 보고 `BlankGraphic`을 하드코딩했었는데,
 * 2026-10-04 사용자가 이 영역도 실제 운영 사이트(ddoga.co.kr) 데이터를
 * 반영해달라고 요청해 `size="maximum"` 경로도 `Thumbnail`로 연결했다 —
 * 이제 `thumbnailSrc`가 있으면 두 size 모두 실제 이미지를 쓴다. `direction=
 * "horizontal"` 두 종은 이번 화면에서 실사용되지 않아 `thumbnailSrc`를
 * 연결하지 않았다(항상 `BlankGraphic`).
 *
 * @example
 * <StoreCard
 *   direction="vertical"
 *   size="minimum" // 128px 고정폭(가로 캐러셀용). maximum은 폭을 className으로
 *   rank={1}
 *   category="요실금팬티"
 *   name="요실금팬티 액티데일리110 200cc"
 *   thumbnailSrc={url}
 *   originalPrice="34,900원"
 *   discountPercent="85%"
 *   price="5,230원"
 *   badges={["무료배송"]}
 *   rating={{ score: "4.8", count: "(18)" }}
 *   onClick={goToProduct}
 * />
 */

import type { KeyboardEvent } from "react";

import { Icon } from "../../../icons";
import { BlankGraphic } from "../../../components/ui/BlankGraphic";

/** `onClick`이 있을 때 카드 루트에 붙는 hover·키보드 포커스 표시(로컬 컴포넌트 공통 관례). */
const INTERACTIVE_CLASS =
  "cursor-pointer transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none";

export type StoreCardDirection = "vertical" | "horizontal";
export type StoreCardSize = "maximum" | "minimum";

type Typo = "compact" | "regular";

/** Figma "RankingRibbon"(node 14881:21741) 벡터 path 그대로. fill 만 세만틱 토큰. */
function RankBadge({ rank }: { rank: number }) {
  return (
    <div className="absolute top-0 right-(--sz-4) h-(--sz-32) w-(--sz-30)">
      <svg
        viewBox="0 0 30 32"
        fill="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path
          d="M0 0V30.0027C0 31.4874 2.04324 32.4524 3.79459 31.7843L13.8324 27.9613C14.5622 27.6767 15.4378 27.6767 16.1676 27.9613L26.2054 31.7843C27.9405 32.4524 30 31.4874 30 30.0027V0H0Z"
          fill="var(--color-bg-danger-normal)"
        />
      </svg>
      <div className="absolute inset-x-0 top-(--sz-2) flex h-(--sz-24) items-center justify-center px-(--sz-2)">
        <span className="text-label-2-bold text-typo-inverse-normal">
          {rank}
        </span>
      </div>
    </div>
  );
}

function CategoryName({
  category,
  name,
  typo,
}: {
  category: string;
  name: string;
  typo: Typo;
}) {
  const categoryClass = typo === "compact" ? "text-label-3" : "text-body-6";
  const nameClass =
    typo === "compact" ? "text-other-store-card" : "text-body-4";
  return (
    <div className="flex w-full flex-col items-start gap-(--sz-4)">
      <p
        className={`w-full truncate ${categoryClass} text-typo-neutral-bright`}
      >
        {category}
      </p>
      <p
        className={`line-clamp-2 w-full ${nameClass} text-typo-neutral-subtle`}
      >
        {name}
      </p>
    </div>
  );
}

function PriceBlock({
  originalPrice,
  discountPercent,
  price,
  typo,
}: {
  originalPrice?: string;
  discountPercent: string;
  price: string;
  typo: Typo;
}) {
  const originalClass =
    typo === "compact" ? "text-other-price-2" : "text-body-6";
  const percentClass =
    typo === "compact" ? "text-label-2-bold" : "text-body-4-bold";
  const priceClass =
    typo === "compact" ? "text-body-4-bold" : "text-body-3-bold";
  return (
    <div className="flex w-full flex-col items-start">
      {originalPrice ? (
        <p className={`${originalClass} text-typo-neutral-bright line-through`}>
          {originalPrice}
        </p>
      ) : null}
      <div className="flex w-full items-center gap-(--sz-2)">
        <span className={`${percentClass} text-typo-danger-normal`}>
          {discountPercent}
        </span>
        <span className={`${priceClass} text-typo-neutral-normal`}>
          {price}
        </span>
      </div>
    </div>
  );
}

function BadgesRow({ badges, typo }: { badges?: string[]; typo: Typo }) {
  if (!badges || badges.length === 0) return null;
  if (typo === "compact") {
    return (
      <div className="flex w-full flex-wrap items-center gap-(--sz-6) pb-(--sz-5)">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-xs border-xs border-solid border-border-neutral-bright bg-bg-neutral-deep px-(--sz-6) py-(--sz-2) text-label-3 text-typo-neutral-subtle"
          >
            {badge}
          </span>
        ))}
      </div>
    );
  }
  return (
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
  );
}

/** 썸네일 슬롯 — `thumbnailSrc` 가 있으면 실제 이미지, 없으면 `BlankGraphic`. */
function Thumbnail({ src, className }: { src?: string; className?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={`rounded-md object-cover ${className ?? "size-full"}`}
      />
    );
  }
  return <BlankGraphic ratio="1/1" className={className ?? "rounded-md"} />;
}

function RatingRow({
  rating,
  typo,
}: {
  rating: { score: string; count: string };
  typo: Typo;
}) {
  const textClass = typo === "compact" ? "text-label-2" : "text-body-5";
  return (
    <div className="flex items-center gap-(--sz-2)">
      <Icon
        name="star_01_solid"
        size={16}
        className="text-icon-warning-normal"
      />
      <span className={`${textClass} text-typo-neutral-subtle`}>
        {rating.score}
      </span>
      <span className={`${textClass} text-typo-neutral-bright`}>
        {rating.count}
      </span>
    </div>
  );
}

export interface StoreCardProps {
  /** 카드 내부 레이아웃 방향. Figma `Card/Store/Vertical`(썸네일 위) /
   * `Card/Store/Horizontal`(썸네일 왼쪽)에 대응. */
  direction: StoreCardDirection;
  /** Figma `size` variant. */
  size: StoreCardSize;
  /**
   * 썸네일 이미지 URL. 생략하면 `BlankGraphic` 플레이스홀더를 그대로 쓴다(Card
   * 3형제의 "빈 슬롯" 관례). 2026-09-26엔 "실시간 인기 상품"(`direction="vertical"
   * size="minimum"`)만 Figma가 상품별로 다른 실제 사진을 갖고 있어 이 prop을
   * `size="maximum"`("상품 진열#1/#2") 경로엔 연결하지 않았었는데(그땐 Figma
   * 쪽 썸네일이 전부 동일한 `placeholder-store` 스톡 이미지였음), 2026-10-04
   * 사용자가 실제 운영 사이트(ddoga.co.kr) 데이터를 이 영역에도 반영해달라고
   * 요청해 `size="maximum"` 경로도 `Thumbnail` 헬퍼로 연결했다 — 이제 두
   * size 모두 `thumbnailSrc`가 있으면 실제 이미지를 쓴다.
   */
  thumbnailSrc?: string;
  /** 랭킹 뱃지 숫자. 생략하면 렌더하지 않는다. `direction="horizontal" &&
   * size="minimum"` 조합은 Figma에 뱃지 슬롯 자체가 없어 값이 있어도 렌더하지
   * 않는다. */
  rank?: number;
  /** 카테고리명(Figma `cateogry2`). */
  category: string;
  /** 상품명(최대 2줄, 초과 시 말줄임). */
  name: string;
  /** 정가(취소선). 생략하면 렌더하지 않는다(Figma `EtcCost.isDiscount`). */
  originalPrice?: string;
  /** 할인율 텍스트(예: "85%"). */
  discountPercent: string;
  /** 할인가 텍스트(예: "15,000원"). */
  price: string;
  /** 하단 배지 텍스트 목록(예: "무료배송", "안심보장"). 생략하면 렌더하지 않는다. */
  badges?: string[];
  /** 리뷰 평점. */
  rating: { score: string; count: string };
  /** 루트에 병합할 클래스(폭·배치용 — `direction="vertical" && size="minimum"`
   * 외에는 호출부가 폭을 결정한다). */
  className?: string;
  /** 카드 클릭 핸들러. Figma 범위 밖 확장(Card 3형제 선례) — 없으면 비인터랙티브. */
  onClick?: () => void;
}

export function StoreCard({
  direction,
  size,
  thumbnailSrc,
  rank,
  category,
  name,
  originalPrice,
  discountPercent,
  price,
  badges,
  rating,
  className,
  onClick,
}: StoreCardProps) {
  const typo: Typo =
    direction === "vertical" && size === "maximum" ? "regular" : "compact";
  const showRank =
    rank !== undefined && !(direction === "horizontal" && size === "minimum");

  const interactiveProps = onClick
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
    : {};

  if (direction === "horizontal") {
    const topGapClass = "gap-(--sz-6)";
    const topPbClass = size === "maximum" ? "pb-(--sz-6)" : "pb-(--sz-4)";
    const thumbnailSizeClass =
      size === "maximum" ? "size-(--sz-128)" : "size-(--sz-84)";

    return (
      <div
        {...interactiveProps}
        className={[
          "flex items-start gap-(--sz-12)",
          onClick ? INTERACTIVE_CLASS : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={`relative shrink-0 overflow-hidden rounded-md ${thumbnailSizeClass}`}
        >
          <BlankGraphic ratio="1/1" className="size-full" />
          {showRank ? <RankBadge rank={rank as number} /> : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start">
          <div
            className={`flex w-full flex-col items-start ${topGapClass} ${topPbClass}`}
          >
            <CategoryName category={category} name={name} typo={typo} />
            <PriceBlock
              originalPrice={originalPrice}
              discountPercent={discountPercent}
              price={price}
              typo={typo}
            />
          </div>

          <BadgesRow badges={badges} typo={typo} />

          <RatingRow rating={rating} typo={typo} />
        </div>
      </div>
    );
  }

  // direction === "vertical"
  const rootWidthClass = size === "minimum" ? "w-(--sz-128)" : "";

  // size === "maximum"(구 StoreProductCard)은 category/name/가격/배지/평점이
  // 전부 gap-(--sz-5) 하나로 균등 배치되는 flat 구조라, Top-wrapper 구조인
  // "minimum"과 마크업을 공유하지 않고 원본 그대로 보존한다(통합 시 랭킹뱃지
  // 외 렌더링을 바꾸지 않기 위함).
  if (size === "maximum") {
    return (
      <div
        {...interactiveProps}
        className={[
          "flex flex-col items-start gap-(--sz-10)",
          onClick ? INTERACTIVE_CLASS : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative w-full shrink-0">
          <Thumbnail
            src={thumbnailSrc}
            className="aspect-square w-full rounded-md"
          />
          {showRank ? <RankBadge rank={rank as number} /> : null}
        </div>

        <div className="flex w-full flex-col items-start gap-(--sz-5)">
          <p className="w-full truncate text-body-6 text-typo-neutral-bright">
            {category}
          </p>
          <p className="line-clamp-2 w-full text-body-4 text-typo-neutral-subtle">
            {name}
          </p>

          <PriceBlock
            originalPrice={originalPrice}
            discountPercent={discountPercent}
            price={price}
            typo={typo}
          />

          <BadgesRow badges={badges} typo={typo} />

          <RatingRow rating={rating} typo={typo} />
        </div>
      </div>
    );
  }

  return (
    <div
      {...interactiveProps}
      className={[
        "flex flex-col items-start gap-(--sz-10)",
        rootWidthClass,
        onClick ? INTERACTIVE_CLASS : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full shrink-0">
        <Thumbnail
          src={thumbnailSrc}
          className="aspect-square w-full rounded-md"
        />
        {showRank ? <RankBadge rank={rank as number} /> : null}
      </div>

      <div className="flex w-full flex-col items-start">
        <div className="flex w-full flex-col items-start gap-(--sz-5) pb-(--sz-4)">
          <CategoryName category={category} name={name} typo={typo} />
          <PriceBlock
            originalPrice={originalPrice}
            discountPercent={discountPercent}
            price={price}
            typo={typo}
          />
        </div>

        <BadgesRow badges={badges} typo={typo} />

        <RatingRow rating={rating} typo={typo} />
      </div>
    </div>
  );
}
