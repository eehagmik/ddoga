/**
 * 이미지 카드(ImageCard).
 *
 * Figma "또가3.0 Design System / Card" 문서 페이지(캔버스 51405:14293) 안의
 * ImageCard 컴포넌트(node 51405:14482) 와 1:1. 이미지 위에 타이틀을 오버레이하고
 * 하단에 날짜·좋아요 바를 붙이는 카드 — 같은 페이지의 TextCard/GalleryCard 와
 * 형제 관계일 뿐 서로 합성하지 않는 독립 컴포넌트다(이번 구현 범위는 ImageCard 만).
 *
 * Figma 심볼은 `ratio`("16:9"|"1:1") × `bottom`(boolean) 조합 4개뿐이다.
 * TextCard 와 달리 카드 레벨 `state`(hover/focus) 심볼이 없다 — 카드 자체는 상태
 * 없는 정적 컨테이너이고, 인터랙션은 내부 `LikeToggleWithLabel` 버튼에만 있다.
 *
 * 구조 결정(Figma 밖, 사용자 승인 사항 — 2026-09-19 카드 클릭 가능 요청으로 갱신):
 * - 루트는 항상 `<div>` 다(내부에 실제 `<button>`인 `LikeToggleWithLabel` 이 있어
 *   루트를 `<button>` 으로 하면 버튼-in-버튼이 된다 — TextCard 와 동일한 이유).
 * - 카드 전체가 항상 클릭 가능하다(TextCard 와 동일 컨벤션) — `onClick` 유무와
 *   무관하게 루트는 항상 `role="button" tabIndex={0}` + `cursor-pointer` +
 *   Enter/Space 키보드 델리게이션(`element.click()` 위임)을 갖는다. `onClick`
 *   이 없어도 인터랙티브 시맨틱은 유지되고, 넘기면 클릭/Enter/Space 시 호출된다.
 *   Figma 에 카드 레벨 hover/focus 시각 상태가 없으므로 TextCard 처럼
 *   `hover:`/`focus-visible:` 배경 스타일은 넣지 않는다. 다만 focus 시 포커스
 *   링 대신 루트 전체에 `opacity-(--alpha-80)` dip 을 준다(2026-09-19
 *   사용자 확정 — Figma 근거는 없지만 카드 클릭 가능 확장에 맞춰 TextCard/
 *   GalleryCard 와 동일한 `--alpha-80` 값으로 통일, 프로젝트 전역 포커스 링
 *   대체 관례와도 일치). 내부 `LikeToggleWithLabel` 은 별도 tab stop 이라
 *   `:focus-visible` 이 서로 간섭하지 않는다.
 * - Figma 이미지 슬롯(`children`)은 실측 결과 완전히 빈 슬롯이라 컴포넌트 자체에
 *   기본값을 두지 않는다(TextCard 의 startSlotContents/endSlotContents 와 동일
 *   원칙) — 실제 사용 시 호출부가 진짜 이미지를 넣는 자리다. Storybook 데모에서만
 *   기존 `BlankGraphic` 을 채워 넣는다(신규 "BlankImage" 컴포넌트는 만들지 않음 —
 *   Figma 에 그런 컴포넌트가 실제로 연결되어 있지 않음을 확인함).
 *
 * 레이아웃(Figma 실측): 루트 flex-col overflow-hidden isolate rounded-2xl
 * (`--radius-2xl`). `bottom=true` 일 때만 `border-neutral-bright` 1px 테두리가
 * 붙는다(`bottom=false` 에는 테두리 없음). Image area 는 `ratio` 에 따라
 * aspect-ratio 를 갖는 relative 컨테이너 — 타이틀(z-3)·Dim(z-2)·이미지 슬롯(z-1)
 * 이 겹쳐 쌓인다. **슬롯도 title/Dim 과 동일하게 `absolute inset-0`** 이다(2026-09-19
 * 버그 수정 — 원래 `relative h-full w-full` 이었는데, `h-full` 이 height:auto 인
 * 부모를 기준으로는 `auto` 로 무너져 children 의 실제 콘텐츠 높이가 Image area 를
 * 밀어 올리는 문제가 있었다 — 예: children 이 `BlankGraphic`(기본 ratio 1:1)이면
 * 정사각으로 부풀어 `ratio="16:9"` 가 시각적으로 무시됨. 슬롯을 absolute 로 레이어
 * 밖에 두면 Image area 의 크기는 오직 `aspect-[16/9]`/`aspect-square` 로만
 * 결정된다). 하단 바는 `bg-bg-neutral-normal`, `px-(--sz-20)
 * py-(--sz-16)`, `gap-(--sz-16)`.
 *
 * 재사용: 딤 오버레이는 기존 `Dim`(`variant="gradient"`, Figma 의
 * blackNone→blackDeep 그라데이션과 정확히 일치), 좋아요 버튼은 기존
 * `LikeToggleWithLabel`(2026-09-19 Figma 갱신 — 이전엔 `LikeToggle` 아톰 단독 +
 * ImageCard 가 직접 그리는 카운트 `<span>` 조합이었으나, Figma 가
 * `LikeToggleWithLabel` 인스턴스(`label` 생략, `countable`/`count` 사용)로
 * 바뀌어 그대로 맞춤). `variant="heart"`, `appearance="transparent"`(크롬 없음,
 * 24px 아이콘, `label-1` 타이포 — 컴포넌트 기본값인 `outline` 과 다름),
 * `color="neutralLight"`(Figma 실측 `icon/neutral/light` #878787 과 맞추기 위해
 * 컴포넌트 기본값 `neutralNormal` 과 다르게 지정). `label` 은 생략하고(텍스트 라벨
 * 없음) `aria-label="좋아요"` 를 직접 지정한다 — `LikeToggleWithLabel` 은 `label`
 * 생략 시 접근성 이름을 자동으로 채워주지 않는다(과거 `LikeToggle` 아톰과의 차이,
 * count 숫자만으로는 "좋아요"/"관심있어요" 구분이 안 돼 명시가 필수). `count` 는
 * `number` 타입이라 `likeCount` prop 자체도 `number` 로 맞췄다(과거엔 ImageCard가
 * 직접 그리던 `<span>` 텍스트라 `string` 이었음). `liked`/`defaultLiked`/
 * `onLikeChange` 는 `LikeToggleWithLabel` 의 `checked`/`defaultChecked`/
 * `onCheckedChange` 를 그대로 패스스루한다(이미 controlled/uncontrolled 둘 다
 * 지원해 재구현하지 않음).
 */

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import { Dim } from "../Dim";
import { LikeToggleWithLabel } from "../LikeToggleWithLabel";

export type ImageCardRatio = "16:9" | "1:1";

export interface ImageCardProps {
  /** 이미지 영역 비율. 기본 "16:9" */
  ratio?: ImageCardRatio;
  /** 하단 "날짜·좋아요" 바 렌더 여부. true 일 때만 카드에 1px 테두리가 붙는다. 기본 true */
  bottom?: boolean;
  /** 이미지 좌하단 오버레이 타이틀 렌더 여부. 기본 true */
  title?: boolean;
  /** 오버레이 타이틀 텍스트. `title=true` 일 때만 의미. 기본 "Title Text" */
  titleValue?: string;
  /** 이미지 위 검정 그라데이션 딤 렌더 여부(`Dim` variant="gradient"). 기본 true */
  dim?: boolean;
  /** 하단 바 좌측 날짜 렌더 여부. `bottom=true` 일 때만 의미. 기본 true */
  postedTime?: boolean;
  /** 날짜 텍스트("전" 접미사는 고정). `postedTime=true` 일 때만 의미. 기본 "3일" */
  postedTimeValue?: string;
  /** 하단 바 우측 좋아요 카운트. 기본 0 */
  likeCount?: number;
  /** 좋아요 체크 여부(controlled) — `LikeToggleWithLabel` 로 패스스루. */
  liked?: boolean;
  /** 좋아요 초기 체크 여부(uncontrolled) — `LikeToggleWithLabel` 로 패스스루. 기본 false */
  defaultLiked?: boolean;
  /** 좋아요 체크 상태 변경 콜백 — `LikeToggleWithLabel` 로 패스스루. */
  onLikeChange?: (liked: boolean) => void;
  /** 이미지 슬롯. 기본값 없음(호출부가 채운다). */
  children?: ReactNode;
  /**
   * 카드 클릭 핸들러. 루트는 이 prop 유무와 무관하게 항상
   * `role="button" tabIndex={0}`(TextCard 와 동일 컨벤션) — 넘기면 클릭/Enter/Space
   * 시 호출된다.
   */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

/**
 * 루트 공통 — 레이아웃 + 클립 + radius + 클릭 가능 커서 + focus-visible opacity dip
 * (props 아님, Figma 축 없음 — 2026-09-19 사용자 확정, TextCard/GalleryCard 와
 * 동일한 `--alpha-80`으로 통일, 포커스 링 대신 dip).
 */
const ROOT_BASE =
  "flex flex-col overflow-hidden isolate rounded-2xl cursor-pointer " +
  "focus-visible:opacity-(--alpha-80) focus-visible:outline-none";

/** `bottom=true` 일 때만 붙는 1px 테두리(Figma 실측 — bottom=false 엔 없음). */
const BORDER_CLASS = "border border-border-neutral-bright";

/** `ratio` 별 Image area aspect-ratio(Figma 320x180/320x320 실측 == 16/9, 1/1). */
const RATIO_ASPECT_CLASS: Record<ImageCardRatio, string> = {
  "16:9": "aspect-[16/9]",
  "1:1": "aspect-square",
};

export function ImageCard({
  ratio = "16:9",
  bottom = true,
  title = true,
  titleValue = "Title Text",
  dim = true,
  postedTime = true,
  postedTimeValue = "3일",
  likeCount = 0,
  liked,
  defaultLiked = false,
  onLikeChange,
  children,
  onClick,
  className,
}: ImageCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.currentTarget.click();
  };

  const rootClassName = [ROOT_BASE, bottom && BORDER_CLASS, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="button"
      tabIndex={0}
      data-name="ImageCard"
      className={rootClassName}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div
        data-name="Image area"
        className={[
          "relative isolate w-full shrink-0",
          RATIO_ASPECT_CLASS[ratio],
        ].join(" ")}
      >
        {title && (
          <p
            data-name="title"
            className="absolute bottom-(--sz-16) left-(--sz-16) right-(--sz-16) z-3 text-title-3 text-typo-inverse-normal"
          >
            {titleValue}
          </p>
        )}
        {dim && <Dim variant="gradient" className="z-2" />}
        <div data-name="slot" className="absolute inset-0 z-1">
          {children}
        </div>
      </div>
      {bottom && (
        <div
          data-name="like & period"
          className="flex w-full items-center gap-(--sz-16) bg-bg-neutral-normal px-(--sz-20) py-(--sz-16)"
        >
          {postedTime && (
            <div
              data-name="date"
              className="flex items-center gap-(--sz-2) whitespace-nowrap text-label-2 text-typo-neutral-light"
            >
              <span>{postedTimeValue}</span>
              <span>전</span>
            </div>
          )}
          <div
            data-name="like area"
            className="flex flex-1 items-center justify-end"
          >
            <LikeToggleWithLabel
              variant="heart"
              appearance="transparent"
              color="neutralLight"
              aria-label="좋아요"
              count={likeCount}
              checked={liked}
              defaultChecked={defaultLiked}
              onCheckedChange={onLikeChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
