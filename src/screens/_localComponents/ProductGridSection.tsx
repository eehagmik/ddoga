/**
 * ProductGridSection — 제목 + 2열 상품 카드 그리드 한 덩어리(메인 "베스트셀러"/"최저가").
 *
 * 메인 화면의 상단 탭("베스트셀러/최저가")은 이 섹션으로 스크롤해 오는 앵커다.
 * 그래서 화면이 `ref`로 섹션 위치를 잡고, 스크롤 목표 여백(`scroll-mt-*`)은
 * `className`으로 넘긴다.
 *
 * @example
 * <ProductGridSection
 *   ref={bestsellerRef}
 *   className="scroll-mt-[...]"
 *   title="베스트셀러"
 *   products={products}
 *   onProductClick={(id) => navigate(`/product/${id}`)}
 * />
 */

import type { Ref } from "react";

import { ProductCard } from "./ProductCard/ProductCard";
import type { ProductCardProps } from "./ProductCard/ProductCard";
import { SectionTitle } from "./SectionTitle";

export type ProductGridItem = Omit<
  ProductCardProps,
  "className" | "onClick"
> & {
  id: string;
};

export interface ProductGridSectionProps {
  /** 섹션 제목. */
  title: string;
  /** 표시할 상품 목록(2열로 채워진다). */
  products: ProductGridItem[];
  /** 상품 카드 클릭 핸들러. 생략하면 카드가 클릭되지 않는다. */
  onProductClick?: (id: string) => void;
  /** 섹션 루트 ref(탭 → 스크롤 이동 앵커용). */
  ref?: Ref<HTMLDivElement>;
  /** 루트에 병합할 클래스(스크롤 여백 등). */
  className?: string;
}

export function ProductGridSection({
  title,
  products,
  onProductClick,
  ref,
  className,
}: ProductGridSectionProps) {
  return (
    <div
      ref={ref}
      className={["flex w-full flex-col items-start", className]
        .filter(Boolean)
        .join(" ")}
    >
      <SectionTitle title={title} typo="title3" buttonType="empty" />
      <div className="grid w-full grid-cols-2 gap-x-(--sz-12) gap-y-(--sz-24) px-(--sz-20) pt-(--sz-12)">
        {products.map(({ id, ...product }) => (
          <ProductCard
            key={id}
            className="w-full"
            onClick={onProductClick ? () => onProductClick(id) : undefined}
            {...product}
          />
        ))}
      </div>
    </div>
  );
}
