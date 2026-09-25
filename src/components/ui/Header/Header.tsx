/**
 * 상단 앱 헤더(Header).
 *
 * Figma "또가3.0 Design System / Header" (node 51405:85638) 와 1:1.
 * 좌측 뒤로가기 + 타이틀(옵션 드롭다운), 우측 옵션 아이콘 그룹(최대 8개)으로 구성된
 * 상단 앱 바다.
 *
 * 축(Figma variant → props):
 * - `type`          : home / normal / select / search — 아래 "type=home/search 전용
 *                      레이아웃" 참고. home·search 는 타이틀 자체가 없어
 *                      `title`/`titleValue`/`onTitleClick` 을 무시한다.
 * - `variant`       : normal / blur / transparent — 배경 처리(아래 "스크롤 연동" 참고).
 * - `contentsColor` : neutral / inverse — transparent 배경 위에서만 의미가 있다
 *                      (밝은 이미지 위에 흰 텍스트/아이콘을 얹는 용도). `type="home"`
 *                      의 `Logo` `tone` 에도 그대로 연동된다.
 * - `bold`          : 타이틀 굵기.
 * - 아이콘 그룹의 노출 여부(`showHome`/`showUser`/…)는 Figma 인스턴스 스왑이 아니라
 *   컴포넌트 소비자가 필요한 아이콘만 골라 켜는 boolean prop 조합으로 구현했다
 *   (Figma 상 최대 8개까지 자유 조합되는 구조라 enum 하나로 표현하기 어렵다). 단,
 *   `type="home"` 은 아래 설명대로 이 조합을 무시하고 강제로 고정된다.
 * - `showSlot`/`slot` : Figma 마스터 컴포넌트("_parts/IconOptional", node 51405:85603)
 *   안에 `showSlot` 컴포넌트 프로퍼티로 정의된 진짜 커스텀 콘텐츠 슬롯(`SlotContents`)
 *   이다. 고정 아이콘이 아니라 소비자가 임의의 아이콘/버튼을 채워 넣는 instance-swap
 *   슬롯이라 다른 `showX` 아이콘과 달리 `slot`(`ReactNode`) 을 함께 받는다. 다른
 *   아이콘과 달리 가로 너비를 24px 로 강제하지 않고 콘텐츠만큼 늘어나며, 높이만
 *   24px 로 맞춘다(Figma 상 슬롯은 폭 고정값이 없음). 위치는 Home 바로 다음,
 *   User 이전이다. Figma 문서에 보이는 빨간 점선 테두리는 "내용이 비어 있음"을
 *   표시하는 디자인 문서 전용 표기라 프로덕션 렌더링에는 반영하지 않는다.
 *
 * type="home"/"search" 전용 레이아웃(Figma 인스턴스 재조사 결과, 2026-09-13 수정):
 * - `type="home"` — Figma 상 이 인스턴스는 좌측에 뒤로가기 노드 자체가 없다(모든
 *   variant/contentsColor 조합에서 동일). 그래서 `back`/`onBack` 값과 무관하게
 *   뒤로가기를 절대 렌더하지 않는다. 좌측에는 대신 브랜드 `Logo`
 *   (`lockup="horizontal"`, 폭 약 127.5px → 가장 가까운 `--sz-128` 토큰)를 렌더하고,
 *   `tone` 은 `renderedContentsColor` 에 연동한다(neutral→'color', inverse→'white').
 *   우측 옵션 아이콘 그룹은 Figma 인스턴스에서 `showHome`/`showSlot`/`showSearch`/
 *   `showLike`/`showShare`/`showClose` 를 전부 꺼두고 `showUser`+`showCart` 만 켜둔
 *   조합으로 고정돼 있다(4개 variant 조합 전부 동일하게 확인됨) — 소비자가 다른
 *   `showX` 를 켜거나 `showUser`/`showCart` 를 꺼도 `type="home"` 에서는 이 조합을
 *   무시하고 user+cart 두 아이콘만 강제로 렌더한다. `userBadge`/`cartCount` 는
 *   그대로 소비자가 조절한다(배지 유무와 무관하게 아이콘 자체는 항상 보임).
 * - `type="search"` — 좌측은 기존처럼 `back` prop 에 따른 뒤로가기 + 그 옆에 남는
 *   폭을 채우는 `Searchbar`(`variant="header"`, `asButton`, 아래 참고)로 구성된다.
 *   Figma 인스턴스는 `Searchbar` 를 `state="enable"`(기본값, 오버라이드 없음)로
 *   품고 있는데, 이 세트는 `state="button"`/`"enable"` 이 시각적으로 완전히 동일하고
 *   DOM(버튼/인풋) 만 다르다(`Searchbar` 자체 문서 참고). Header 는 페이지 이동을
 *   유도하는 프레젠테이션 트리거로 쓰는 다른 축(`onTitleClick` 선례)과 일관되게,
 *   그리고 이번 요청의 `onSearchbarClick` 요구사항에 맞춰 `asButton=true` 로 고정
 *   렌더한다(시각적 차이 없음). `searchPlaceholder` 로 라벨을 바꿀 수 있다. 우측
 *   옵션 아이콘 그룹은 Figma 인스턴스에서 8개 아이콘 `showX` 가 전부 오버라이드 없이
 *   기본값(true)인 채로 남아 있어 — home 인스턴스가 명시적으로 조합을 오버라이드한
 *   것과 달리 — 실제 고정 스펙이 아니라 마스터 컴포넌트 기본값을 그대로 노출한
 *   "전체 아이콘 예시"로 판단했다. 따라서 다른 타입과 동일하게 `showX` 자유 조합을
 *   그대로 유지한다(변경 없음).
 *
 * 스크롤 연동 배경 전환(신규 로직, Figma 밖 동작):
 * `variant` 가 `blur`/`transparent` 일 때만 스크롤 위치를 관찰해서, 페이지가
 * `scrollThreshold`(px) 이상 내려가면 렌더링에 쓰는 variant/contentsColor 를
 * 강제로 `normal`/`neutral` 로 되돌린다. `inverse` 텍스트·아이콘은 투명/블러 배경
 * 위에서만 대비가 맞고, 스크롤 후 실제로 깔리는 `normal`(흰색) 배경 위에서는 대비가
 * 깨지기 때문에 contentsColor 도 함께 되돌린다. `variant='normal'` 이면 애초에 배경
 * 전환이 필요 없으므로 스크롤 리스너 자체를 붙이지 않는다(no-op). Figma 에는 정확한
 * 전환 임계값이 정의돼 있지 않아 `scrollThreshold` prop(기본 4px)으로 노출했다.
 *
 * 재사용 컴포넌트:
 * - `IconButton` — 뒤로가기 및 우측 아이콘 그룹 전부(홈/유저/검색/공유/장바구니/닫기).
 *   유저는 `badge="dot"`(`userBadge`), 장바구니는 `badge="number"`(`cartCount`).
 * - `LikeToggle` — 찜(북마크) 아이콘. `variant="bookmark"` 고정.
 * - `Logo` — `type="home"` 좌측 브랜드 로고. `lockup="horizontal"` 고정.
 * - `Searchbar` — `type="search"` 좌측 검색 트리거. `variant="header"` +
 *   `asButton=true` 고정.
 *
 * 토큰 매핑(Figma 검증):
 * | 대상             | 클래스                                              |
 * | 높이              | h-(--sz-52)                                    |
 * | 좌우 패딩          | pl-(--sz-20) pr-(--sz-14)                 |
 * | 좌/우 그룹 간 gap   | gap-(--sz-12) (우측 아이콘 그룹 내부 간격도 동일 재사용) |
 * | back-title 간 gap | gap-(--sz-8)                                   |
 * | title-chevron gap | gap-(--sz-6)                                   |
 * | 배경 normal        | bg-bg-neutral-normal                                |
 * | 배경 blur          | bg-bg-overlay-whiteSubtle backdrop-blur-header       |
 * | 배경 transparent   | bg-bg-overlay-whiteNone                             |
 * | 타이틀 색          | text-typo-neutral-normal / text-typo-inverse-normal |
 * | 타이틀 타이포       | text-body-2 / text-body-2-bold                      |
 * | 아이콘 크기         | size-(--sz-24) (select 화살표만 size-(--sz-18)) |
 * | 슬롯 영역          | h-(--sz-24) (폭 고정값 없음, `slot` 콘텐츠 크기만큼 늘어남) |
 * | home 로고 폭       | width="var(--sz-128)" (Figma 실측 127.543px 반올림)  |
 */

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { Icon } from "../../../icons";
import { IconButton } from "../IconButton";
import { LikeToggle } from "../LikeToggle";
import type { LikeToggleColor } from "../LikeToggle";
import { Logo } from "../Logo";
import type { LogoTone } from "../Logo";
import { Searchbar } from "../Searchbar";

export type HeaderType = "home" | "normal" | "select" | "search";
export type HeaderVariant = "normal" | "blur" | "transparent";
export type HeaderContentsColor = "neutral" | "inverse";

export interface HeaderProps {
  /** 헤더 종류(Figma `type`). */
  type: HeaderType;
  /** 배경 처리(Figma `variant`, "스크롤 전" 기준). 기본 'normal' */
  variant?: HeaderVariant;
  /** 텍스트/아이콘 색(Figma `contentsColor`). `transparent` 에서만 의미 있음. 기본 'neutral' */
  contentsColor?: HeaderContentsColor;
  /** 타이틀 굵기. 기본 false */
  bold?: boolean;
  /**
   * 뒤로가기 아이콘 노출 여부. 기본 true. `type="home"` 은 이 값과 무관하게
   * 뒤로가기를 절대 렌더하지 않는다(Figma 상 해당 인스턴스에 뒤로가기 노드 자체가
   * 없음). `type="search"` 는 이 prop 대로 정상 동작한다.
   */
  back?: boolean;
  onBack?: () => void;
  /**
   * 타이틀 노출 여부. `type` 이 home/search 면 애초에 타이틀이 없어 무시된다
   * (home 은 `Logo`, search 는 `Searchbar` 로 대체됨). 기본 true
   */
  title?: boolean;
  /** 타이틀 텍스트. 기본 "Title" */
  titleValue?: string;
  /**
   * 타이틀 클릭 콜백. `type="select"` 일 때만 사용한다. 지정된 경우에만 타이틀을
   * 클릭 가능한 `<button>` 으로 렌더한다(추후 BottomSheet 등을 여는 트리거 — 지금은
   * 실제 오버레이 연결 없이 핸들러만 노출). 지정하지 않으면 비인터랙티브 텍스트로 렌더된다.
   */
  onTitleClick?: () => void;

  /**
   * `type="search"` 좌측에 렌더하는 `Searchbar`(`variant="header"`, `asButton=true`
   * 고정)의 placeholder 텍스트. 기본 "검색"
   */
  searchPlaceholder?: string;
  /**
   * `type="search"` 좌측 `Searchbar` 클릭 콜백(검색 페이지 진입 트리거 등). 우측
   * 옵션 아이콘 그룹의 검색 아이콘 클릭 콜백인 `onSearchClick` 과는 다른 요소다.
   */
  onSearchbarClick?: () => void;

  /** 홈 아이콘 노출 여부. 기본 false */
  showHome?: boolean;
  onHomeClick?: () => void;
  /**
   * 커스텀 콘텐츠 슬롯 노출 여부(Figma `showSlot`, Home 다음·User 이전 위치).
   * 기본 false
   */
  showSlot?: boolean;
  /**
   * 슬롯에 렌더할 실제 콘텐츠(아이콘/버튼 등 자유 구성). 가로 너비는 고정값이
   * 없어 콘텐츠 크기만큼 늘어날 수 있다(다른 아이콘처럼 24px 정사각으로
   * 강제하지 않음) — 높이만 다른 아이콘과 같은 24px 로 맞춘다. `showSlot=true`
   * 인데 생략하면 레이아웃 유지를 위한 빈 24px 높이 영역만 렌더한다.
   */
  slot?: ReactNode;
  /** 유저(마이페이지) 아이콘 노출 여부. 기본 false */
  showUser?: boolean;
  onUserClick?: () => void;
  /** 유저 아이콘에 알림 점 배지 노출 여부(`IconButton` `badge="dot"`). 기본 false */
  userBadge?: boolean;
  /** 검색 아이콘 노출 여부. 기본 false */
  showSearch?: boolean;
  onSearchClick?: () => void;
  /** 찜(북마크) 아이콘 노출 여부. 기본 false */
  showLike?: boolean;
  /** 찜 여부(controlled, `LikeToggle` 로 그대로 전달). */
  liked?: boolean;
  onLikedChange?: (liked: boolean) => void;
  /** 공유 아이콘 노출 여부. 기본 false */
  showShare?: boolean;
  onShareClick?: () => void;
  /** 장바구니 아이콘 노출 여부. 기본 false */
  showCart?: boolean;
  onCartClick?: () => void;
  /** 장바구니 아이콘에 표시할 개수(`IconButton` `badge="number"`). 기본 0 */
  cartCount?: number;
  /** 닫기 아이콘 노출 여부. 기본 false */
  showClose?: boolean;
  onCloseClick?: () => void;

  /** 스크롤 배경 전환 임계값(px, `variant` 가 blur/transparent 일 때만 사용). 기본 4 */
  scrollThreshold?: number;
  /** 루트 `<header>` 에 병합할 클래스 */
  className?: string;
}

/** variant 별 배경(Figma 검증). */
const VARIANT_BG: Record<HeaderVariant, string> = {
  normal: "bg-bg-neutral-normal",
  blur: "bg-bg-overlay-whiteSubtle backdrop-blur-header",
  transparent: "bg-bg-overlay-whiteNone",
};

/** contentsColor 별 아이콘 색(`IconButton`/`Icon` 에 `currentColor` 로 상속). */
const CONTENTS_ICON_COLOR: Record<HeaderContentsColor, string> = {
  neutral: "text-icon-neutral-normal",
  inverse: "text-icon-inverse-normal",
};

/** contentsColor 별 타이틀 텍스트 색. */
const CONTENTS_TYPO_COLOR: Record<HeaderContentsColor, string> = {
  neutral: "text-typo-neutral-normal",
  inverse: "text-typo-inverse-normal",
};

/** contentsColor → `LikeToggle` `color` prop(사용자 확정 매핑). */
const LIKE_TOGGLE_COLOR: Record<HeaderContentsColor, LikeToggleColor> = {
  neutral: "neutralNormal",
  inverse: "inverse",
};

/** contentsColor → `type="home"` `Logo` `tone` prop(Figma 인스턴스 검증). */
const LOGO_TONE: Record<HeaderContentsColor, LogoTone> = {
  neutral: "color",
  inverse: "white",
};

/** `type="home"` 로고 폭(Figma 실측 127.543px → 가장 가까운 sz 토큰). */
const HOME_LOGO_WIDTH = "var(--sz-128)";

const ROOT_BASE =
  "flex h-(--sz-52) items-center justify-between gap-(--sz-12) " +
  "pl-(--sz-20) pr-(--sz-14) transition-colors";

/**
 * `variant` 가 blur/transparent 일 때만 스크롤 위치를 관찰해서 `scrollThreshold`(px)
 * 를 넘었는지 반환한다. `enabled=false` 면 리스너를 붙이지 않는 완전한 no-op 이다.
 * 마운트 시 이미 스크롤된 상태(`window.scrollY`)도 최초 1회 반영한다.
 */
function useScrolledPastThreshold(threshold: number, enabled: boolean) {
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setIsScrolledPast(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolledPast(window.scrollY > threshold);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, threshold]);

  return isScrolledPast;
}

export function Header({
  type,
  variant = "normal",
  contentsColor = "neutral",
  bold = false,
  back = true,
  onBack,
  title = true,
  titleValue = "Title",
  onTitleClick,
  searchPlaceholder = "검색",
  onSearchbarClick,
  showHome = false,
  onHomeClick,
  showSlot = false,
  slot,
  showUser = false,
  onUserClick,
  userBadge = false,
  showSearch = false,
  onSearchClick,
  showLike = false,
  liked,
  onLikedChange,
  showShare = false,
  onShareClick,
  showCart = false,
  onCartClick,
  cartCount = 0,
  showClose = false,
  onCloseClick,
  scrollThreshold = 4,
  className,
}: HeaderProps) {
  const scrollSwapEnabled = variant !== "normal";
  const isScrolledPast = useScrolledPastThreshold(
    scrollThreshold,
    scrollSwapEnabled,
  );
  const swapped = scrollSwapEnabled && isScrolledPast;

  const renderedVariant: HeaderVariant = swapped ? "normal" : variant;
  const renderedContentsColor: HeaderContentsColor = swapped
    ? "neutral"
    : contentsColor;

  const iconColorClass = CONTENTS_ICON_COLOR[renderedContentsColor];
  const typoColorClass = CONTENTS_TYPO_COLOR[renderedContentsColor];
  const titleTypoClass = bold ? "text-body-2-bold" : "text-body-2";

  const isHome = type === "home";
  const isSearch = type === "search";
  // type="home" 은 Figma 상 뒤로가기 노드 자체가 없어 `back` 값과 무관하게 숨긴다.
  const showBack = !isHome && back;
  const showTitleArea = title && (type === "normal" || type === "select");

  // type="home" 은 Figma 인스턴스에서 옵션 아이콘 조합이
  // "user+cart 만 켜짐"으로 고정돼 있어, 소비자가 넘긴 showX 를 무시하고
  // 이 조합을 강제한다(위 문서 주석 "type=home/search 전용 레이아웃" 참고).
  const effectiveShowHome = isHome ? false : showHome;
  const effectiveShowSlot = isHome ? false : showSlot;
  const effectiveShowUser = isHome ? true : showUser;
  const effectiveShowSearch = isHome ? false : showSearch;
  const effectiveShowLike = isHome ? false : showLike;
  const effectiveShowShare = isHome ? false : showShare;
  const effectiveShowCart = isHome ? true : showCart;
  const effectiveShowClose = isHome ? false : showClose;

  const titleContent = (
    <>
      <span
        className={["min-w-0 truncate", typoColorClass, titleTypoClass].join(
          " ",
        )}
      >
        {titleValue}
      </span>
      {type === "select" ? (
        <Icon
          name="chevron_down_solid"
          size={18}
          className={["shrink-0 size-(--sz-18)", iconColorClass].join(" ")}
        />
      ) : null}
    </>
  );

  return (
    <header
      data-type={type}
      data-variant={renderedVariant}
      data-contents-color={renderedContentsColor}
      data-bold={bold}
      className={[ROOT_BASE, VARIANT_BG[renderedVariant], className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-1 items-center gap-(--sz-8)">
        {isHome ? (
          <Logo
            lockup="horizontal"
            tone={LOGO_TONE[renderedContentsColor]}
            width={HOME_LOGO_WIDTH}
          />
        ) : (
          <>
            {showBack ? (
              <IconButton
                aria-label="뒤로가기"
                onClick={onBack}
                className={iconColorClass}
              >
                <Icon name="chevron_left_line" size={24} />
              </IconButton>
            ) : null}
            {isSearch ? (
              <Searchbar
                variant="header"
                asButton
                placeholder={searchPlaceholder}
                onClick={onSearchbarClick}
                className="min-w-0 flex-1"
              />
            ) : showTitleArea ? (
              type === "select" && onTitleClick ? (
                <button
                  type="button"
                  onClick={onTitleClick}
                  className={[
                    "flex min-w-0 cursor-pointer items-center gap-(--sz-6)",
                    "transition-opacity hover:opacity-(--alpha-80)",
                    "focus-visible:opacity-(--alpha-60) focus-visible:outline-none",
                  ].join(" ")}
                >
                  {titleContent}
                </button>
              ) : (
                <span className="flex min-w-0 items-center gap-(--sz-6)">
                  {titleContent}
                </span>
              )
            ) : null}
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-(--sz-12)">
        {effectiveShowHome ? (
          <IconButton
            aria-label="홈"
            onClick={onHomeClick}
            className={iconColorClass}
          >
            <Icon name="home_02_line" size={24} />
          </IconButton>
        ) : null}
        {effectiveShowSlot ? (
          <div className="flex h-(--sz-24) shrink-0 items-center justify-center">
            {slot}
          </div>
        ) : null}
        {effectiveShowUser ? (
          <IconButton
            aria-label="마이페이지"
            onClick={onUserClick}
            badge={userBadge ? "dot" : undefined}
            className={iconColorClass}
          >
            <Icon name="user_01_line" size={24} />
          </IconButton>
        ) : null}
        {effectiveShowSearch ? (
          <IconButton
            aria-label="검색"
            onClick={onSearchClick}
            className={iconColorClass}
          >
            <Icon name="search_md_line" size={24} />
          </IconButton>
        ) : null}
        {effectiveShowLike ? (
          <LikeToggle
            variant="bookmark"
            checked={liked}
            onCheckedChange={onLikedChange}
            color={LIKE_TOGGLE_COLOR[renderedContentsColor]}
          />
        ) : null}
        {effectiveShowShare ? (
          <IconButton
            aria-label="공유"
            onClick={onShareClick}
            className={iconColorClass}
          >
            <Icon name="share_03_line" size={24} />
          </IconButton>
        ) : null}
        {effectiveShowCart ? (
          <IconButton
            aria-label="장바구니"
            onClick={onCartClick}
            badge="number"
            count={cartCount}
            className={iconColorClass}
          >
            <Icon name="shopping_bag_02_line" size={24} />
          </IconButton>
        ) : null}
        {effectiveShowClose ? (
          <IconButton
            aria-label="닫기"
            onClick={onCloseClick}
            className={iconColorClass}
          >
            <Icon name="x_close_line" size={24} />
          </IconButton>
        ) : null}
      </div>
    </header>
  );
}
