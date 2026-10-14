/**
 * StoreEventCard — 기획전(이벤트) 타일 카드.
 *
 * Figma "Card/StoreEvent" (node 21496:86578, "또가 베스트 기획전" 섹션에서 3개
 * 반복 사용) 와 1:1 구조 — 아이콘 그래픽 + 굵은 타이틀. Figma 심볼에 state(hover/
 * focus) 축이 없는 정적 카드라 클릭 가능 여부는 Card 3형제 선례를 따라 `onClick`
 * 유무로 확장했다.
 *
 * 아이콘: 2026-09-26 재조사(node 30416:71139, 화면 실사용 "row") 결과 3개 카드
 * 모두 Figma 레이어 이름은 "BlankGraphic"이지만(1차 구현 때 이 이름만 보고
 * (b) 미정 placeholder로 오판했음), 실제로 다운로드해 픽셀 대조한 결과 카드마다
 * 완전히 다른 실제 3D 아이콘 그래픽(하트/왕관/집 모양 엠블럼)이었다 —
 * "상품 진열#1/#2"(전 카드 동일한 `placeholder-store` 재사용, 진짜 (b))와는
 * 반대 사례. 레이어 이름만으로 (a)/(b)를 단정하지 말고 실제 에셋을 다운로드해
 * MD5/픽셀로 대조해야 한다는 교훈. `iconSrc` prop으로 실제 이미지를 받고,
 * 값이 없으면 기존 `BlankGraphic` 플레이스홀더로 폴백한다.
 *
 * 그림자는 Figma `shadow/greenGray/sm`(0 1px 4px light, 0 4px 8px normal)과 1:1인
 * 기존 `shadow-greenGray-sm` 박스섀도 유틸을 그대로 쓴다(불투명 카드라 drop-shadow
 * filter 로 수동 조립할 필요 없음, Tooltip/GalleryCard 의 filter 조립은 반투명 배경
 * 위에서만 필요했던 케이스).
 *
 * @example
 * <StoreEventCard title={"실시간\n인기상품"} iconSrc={iconSrc} onClick={goToEvent} />
 */

import { BlankGraphic } from "../../components/ui/BlankGraphic";

export interface StoreEventCardProps {
  /** 카드 타이틀(2줄, 초과 시 말줄임). */
  title: string;
  /**
   * 아이콘 이미지 URL. 생략하면 `BlankGraphic` 플레이스홀더를 쓴다(Figma가
   * 실제로 미정 상태인 경우에만 생략할 것 — 2026-09-26 재조사로 이 카드는
   * 보통 실제 아이콘을 갖는다는 게 확인됐다).
   */
  iconSrc?: string;
  /** 카드 클릭 핸들러. 없으면 비인터랙티브. */
  onClick?: () => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

export function StoreEventCard({
  title,
  iconSrc,
  onClick,
  className,
}: StoreEventCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={[
        "flex min-w-0 flex-1 flex-col items-center gap-(--sz-8) rounded-2xl",
        "border-xs border-solid border-border-brandGrayish-bright bg-bg-neutral-normal",
        "p-(--sz-12) shadow-greenGray-sm",
        onClick
          ? "cursor-pointer transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          className="size-(--sz-58) rounded-md object-cover"
        />
      ) : (
        <BlankGraphic ratio="1/1" className="size-(--sz-58) rounded-md" />
      )}
      <p className="flex min-h-[2lh] whitespace-pre line-clamp-2 break-keep wrap-break-word text-center text-body-4-bold text-typo-neutral-normal">
        {title}
      </p>
    </div>
  );
}
