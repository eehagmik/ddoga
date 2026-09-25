/**
 * 갤러리 카드(GalleryCard).
 *
 * Figma "또가3.0 Design System / Card" 문서 페이지(캔버스 51405:14293) 안의
 * GalleryCard 컴포넌트 셋(node 51405:14521, `ratio=16:9` 51405:14529 /
 * `ratio=1:1` 51405:14522) 과 1:1. 게시글 사진 썸네일 카드 — 같은 페이지의
 * ImageCard/TextCard 와 형제 관계일 뿐 서로 합성하지 않는 독립 컴포넌트다.
 *
 * Figma 심볼은 `ratio`("16:9"|"1:1") 2개뿐이고, 나머지(`badge`/`multipleIcon`/
 * `title`)는 boolean 토글, `children`(슬롯)은 항상 빈 상태다. 카드 레벨
 * hover/focus/disabled 시각 상태는 Figma에 없다(정적 컨테이너).
 *
 * 구조 결정(Figma 밖, 사용자 승인 사항):
 * - 루트는 `<div role="button" tabIndex={0} onClick>` 이다(ImageCard/TextCard
 *   선례 — `onClick` 유무와 무관하게 항상 `role="button"`, 카드 전체가 클릭
 *   가능). Enter/Space 키 입력도 클릭과 동일하게 트리거한다(`element.click()`
 *   위임). focus 시 포커스 링 대신 루트에 `opacity-(--alpha-80)` dip 을
 *   준다(2026-09-19 사용자 확정 — Figma 근거 없음, TextCard/ImageCard 와 동일
 *   `--alpha-80` 값으로 통일, 프로젝트 전역 포커스 링 대체 관례와도 일치).
 * - Figma prop명 `mutipleIcon`(오타)은 코드에서 `multipleIcon`으로 정정했다
 *   (코드베이스에 유사 오타를 그대로 유지한 선례가 없음을 확인).
 * - Figma 실측 폭 150px/`max-w-[480px]`은 `--sz-*` 토큰(100/128/160/192…)에
 *   대응값이 없는 캔버스 레이아웃 아티팩트라 하드코딩하지 않는다
 *   (HorizontalMenuButton 의 240px→`w-full` 오버라이드 선례와 동일 원칙) —
 *   루트는 `w-full` 이고 실제 폭은 호출부(그리드/컨테이너)가 결정한다.
 * - 타이틀은 ImageCard/TextCard(1줄 truncate)와 달리 최대 2줄까지 허용한다
 *   (`line-clamp-2`) — 사용자 확정 사항.
 * - 복사 아이콘(`copy_03_solid`, 사진 2장 이상 첨부 시 노출 — Figma 컴포넌트
 *   설명 근거)은 흰색(`text-typo-inverse-normal`, ImageCard 오버레이 타이틀과
 *   동일 색 선택) + Figma `shadow/black/xs` 이펙트를 drop-shadow 필터로 수동
 *   조립한다(Tooltip 선례와 동일 원칙 — 프로젝트 shadow 토큰은 box-shadow
 *   포맷이라 알파를 가진 아이콘 위에는 filter 로 직접 조립).
 *
 * 레이아웃(Figma 실측): 루트 flex-col items-start gap `--sz-8`. 썸네일 영역은
 * `w-full` + relative + isolate, `ratio` 별 aspect-ratio(16:9 →
 * `aspect-video`, 1:1 → `aspect-square`). `overflow-hidden rounded-2xl`
 * (`--radius-2xl`)은 바깥 컨테이너가 아니라 slot(children) 레이어에만 건다 —
 * 배지(Dot)가 우상단 모서리 밖으로 `-top-(--sz-2) -right-(--sz-2)`
 * 만큼 튀어나오는데, 바깥 컨테이너에 overflow-hidden을 걸면 그 튀어나온
 * 부분이 잘려버리기 때문이다(버그 수정, 2026-09-19). 복사 아이콘은 우하단
 * `bottom-(--sz-10) right-(--sz-10)`(클리핑 레이어 밖이지만 항상
 * 컨테이너 안쪽이라 영향 없음), 슬롯(children)은 ImageCard 선례와 동일하게
 * `absolute inset-0`(children 실제 콘텐츠 크기가 썸네일 aspect-ratio 를
 * 밀어내지 않도록).
 *
 * 재사용: 배지는 기존 `Dot`(size="md" color="red" isBorder — Figma 실측
 * `size/10` `borderWidth/xs` `border/inverse/dark` `background/danger/normal`
 * 과 정확히 일치), 복사 아이콘은 기존 `Icon`(`name="copy_03_solid"`, 이미
 * iconRegistry 에 등록됨).
 */

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

import { Icon } from "../../../icons";
import { Dot } from "../Dot";

export type GalleryCardRatio = "16:9" | "1:1";

export interface GalleryCardProps {
  /** 썸네일 영역 비율. */
  ratio: GalleryCardRatio;
  /** 썸네일 우상단 신규 표시 배지(`Dot`) 렌더 여부. 기본 true */
  badge?: boolean;
  /**
   * 썸네일 우하단 복수 사진 아이콘(`copy_03_solid`) 렌더 여부. 게시글에
   * 사진이 2장 이상 첨부됐을 때 노출(Figma 컴포넌트 설명 근거). 기본 true
   */
  multipleIcon?: boolean;
  /** 타이틀 텍스트 렌더 여부. 기본 true */
  title?: boolean;
  /** 타이틀 텍스트. `title=true` 일 때만 의미. 기본 "Title Text" */
  titleValue?: string;
  /** 썸네일 슬롯. 기본값 없음(호출부가 채운다). */
  children?: ReactNode;
  /**
   * 클릭 핸들러. 루트는 이 prop 유무와 무관하게 항상 `role="button"
   * tabIndex={0}`(ImageCard/TextCard 와 동일 컨벤션) — 넘기면 클릭/Enter/
   * Space 시 호출된다.
   */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

/**
 * 루트 공통 — 레이아웃 + 클릭 가능 커서 + focus-visible opacity dip(props 아님,
 * Figma 축 없음 — 2026-09-19 사용자 확정, TextCard/ImageCard 와 동일한
 * `--alpha-80`으로 통일, 포커스 링 대신 dip).
 */
const ROOT_BASE =
  "flex w-full flex-col items-start gap-(--sz-8) cursor-pointer " +
  "focus-visible:opacity-(--alpha-80) focus-visible:outline-none";

/** `ratio` 별 썸네일 aspect-ratio(Figma 150x84/150x150 실측 ≈ 16/9, 1/1). */
const RATIO_ASPECT_CLASS: Record<GalleryCardRatio, string> = {
  "16:9": "aspect-video",
  "1:1": "aspect-square",
};

/** 복사 아이콘 — 흰색 + Figma shadow/black/xs 를 drop-shadow 필터로 수동 조립(Tooltip 선례). */
const MULTIPLE_ICON_CLASS =
  "absolute bottom-(--sz-10) right-(--sz-10) z-2 text-typo-inverse-normal " +
  "[filter:drop-shadow(0_var(--sz-1)_var(--sz-2)_var(--color-shadow-black-light))_drop-shadow(0_var(--sz-2)_var(--sz-4)_var(--color-shadow-black-normal))]";

export function GalleryCard({
  ratio,
  badge = true,
  multipleIcon = true,
  title = true,
  titleValue = "Title Text",
  children,
  onClick,
  className,
}: GalleryCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.currentTarget.click();
  };

  const rootClassName = [ROOT_BASE, className].filter(Boolean).join(" ");

  return (
    <div
      role="button"
      tabIndex={0}
      data-name="GalleryCard"
      className={rootClassName}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div
        data-name="Thumbnail area"
        className={[
          "relative isolate w-full shrink-0",
          RATIO_ASPECT_CLASS[ratio],
        ].join(" ")}
      >
        <div
          data-name="slot"
          className="absolute inset-0 z-1 overflow-hidden rounded-2xl"
        >
          {children}
        </div>
        {badge && (
          <Dot
            size="md"
            color="red"
            isBorder
            className="absolute -top-(--sz-2) -right-(--sz-2) z-3"
          />
        )}
        {multipleIcon && (
          <Icon
            name="copy_03_solid"
            size={20}
            className={MULTIPLE_ICON_CLASS}
            data-name="multiple icon"
          />
        )}
      </div>
      {title && (
        <p
          data-name="title"
          className="line-clamp-2 w-full text-body-5 text-typo-neutral-normal"
        >
          {titleValue}
        </p>
      )}
    </div>
  );
}
