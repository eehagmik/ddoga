import { Icon } from "../../../icons";

/**
 * BlankGraphic — "그래픽/이미지가 들어올 자리"를 표시하는 디자인 시스템 프리미티브.
 *
 * Figma "또하나 3.0 Design System / Assets / Blank" (node 3250:193) 의
 * 이미지 슬롯 표식. 원본은 옅은 회색 면 + 또가 심볼 실루엣이지만, 코드에서는
 * 중립 배경 면 + 중앙 이미지 아이콘(`image_01_line`)으로 대체한다(에셋 불필요).
 *
 * - 배경: `bg-bg-neutral-deep` (Figma 회색 면 대응, 가장 옅은 중립 면).
 * - 중앙 아이콘 색: `text-icon-neutral-bright` (가장 muted). hex 하드코딩 없음.
 * - 크기: `ratio`(CSS aspect-ratio) + `width: 100%`. 실제 폭은 부모/`className` 이 결정한다.
 *   (비율은 Figma 에서 자유롭게 적용.)
 * - radius 없음(Figma 원본과 일치).
 * - 순수 장식용 프리미티브라 내부 아이콘은 항상 `aria-hidden` 이다.
 */

export type BlankGraphicProps = {
  /** CSS `aspect-ratio` 값. 기본 "1/1". 예: "16/9", "4/3", "3/4". */
  ratio?: string;
  /** 루트 div 에 병합할 클래스. */
  className?: string;
};

const BASE_CLASS =
  "flex items-center justify-center overflow-hidden bg-bg-neutral-deep";

export function BlankGraphic({ ratio = "1/1", className }: BlankGraphicProps) {
  return (
    <div
      className={className ? `${BASE_CLASS} ${className}` : BASE_CLASS}
      style={{ aspectRatio: ratio, width: "100%" }}
      data-blank="graphic"
      data-ratio={ratio}
    >
      <Icon
        name="image_01_line"
        size={48}
        className="text-icon-neutral-bright max-w-[50%] max-h-[50%] w-auto h-auto"
      />
    </div>
  );
}
