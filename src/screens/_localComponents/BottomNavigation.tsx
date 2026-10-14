/**
 * BottomNavigation — 앱 전역 하단 탭바.
 *
 * Figma 메인 화면의 `Inset`(node 31522:189766) 안 `BottomNavigation`(node
 * 30210:54017, `_parts/NavMenuButton` 5개: 김또가/시설찾기/스토어/요양정보/검색) 와
 * 1:1 구조. 여러 화면에서 공통으로 쓰이는 앱 셸 조각이라 로컬 공용 컴포넌트로 분리했다
 * (디자인시스템 원시 컴포넌트는 아님 — `Profile` 과 같은 급).
 *
 * "스토어"만 채워진 원형 배경 + `Logo`(lockup="symbol", 브랜드 심볼)로 강조되는
 * 고정 스타일이고 나머지 4개는 아이콘+라벨 텍스트다. 라우팅은 호출부 `onNavigate` 로
 * 주입한다(컴포넌트 자체는 라우터에 의존하지 않는다) — "스토어"는 메인 화면,
 * "김또가"(profile)는 `LtcProfile` 화면(`/screens/ltc-profile`)으로 연결되고,
 * 나머지(시설찾기/요양정보/검색)는 아직 공용 `ComingSoon` 플레이스홀더 라우트로
 * 이동한다.
 *
 * "시설찾기" 글리프는 아이콘셋에 없어 기존 프로젝트 자산
 * (`src/assets/images/menu/ltch-line.svg`)을 그대로 재사용했다.
 *
 * 첫 번째 탭(사용자 = 대표 어르신)의 이름·아바타는 호출부가 `userName`/`userAvatarSrc`로
 * 넘긴다(로그인 사용자 데이터). 키보드 포커스 시 hover와 같은 pill 배경이 켜진다.
 *
 * @example
 * <BottomNavigation
 *   active="store"
 *   userName={user.name}
 *   userAvatarSrc={user.avatarSrc}
 *   onNavigate={useBottomNavigation("store")}
 * />
 *
 * hover / active(선택) 시각 스타일(2026-09-25 보완):
 * 최초 구현은 `_parts/NavMenuButton`의 `state=enable` 만 보고 만들어져 인터랙션
 * 스타일이 전혀 없었다(`aria-current` 만 붙고 시각적으로는 구분 안 됨). 이후 사용자가
 * 전달한 새 Figma 링크(node 26097:231930)를 재조사한 결과, 같은 컴포넌트(`30210:54017`
 * 로 노드 ID까지 동일 — 별도 컴포넌트 아님)의 문서 캔버스에서 `state=hover`/`state=focus`
 * 배리언트가 추가로 확인됐다:
 * - hover(5탭 공통): `bg-bg-brandGrayish-normal` pill 배경 추가.
 * - focus(=탭 5개 중 실제로 "선택된" 탭의 시각 표현 — 키보드 포커스 링이 아니라 active
 *   상태를 이 컴포넌트에서는 `focus` 로 명명해둔 것): 탭별 강조만 붙는다 — 프로필은 아바타
 *   테두리 링, 시설찾기/요양정보는 라인→솔리드 아이콘 교체, 검색은 아예 다른 글리프
 *   (`search_refraction_line`)로 교체, 스토어는 단색 배경이 info→brand 그라디언트로 바뀐다.
 *   이 `focus` 배리언트를 기존 `active` prop과 매칭해 렌더한다(별도 prop 신설 없음).
 *
 * pill 배경 재조사 정정(같은 날 재조사, node 30218:54842 재조회): 최초 보고 시점엔
 * focus 도 hover 와 동일하게 `bg-brandgrayish-normal` pill 을 켜는 것으로 확인됐었으나,
 * 이후 Figma 파일이 편집되어 **focus 에서는 pill 배경이 완전히 빠졌다**(hover 만 pill 유지).
 * 그래서 `PILL_CLASS` 는 hover 에만 배경을 걸고, active 여부는 배경과 무관하게 아이콘/아바타/
 * 스토어 강조로만 표현한다.
 */

import ltchLineIcon from "../../assets/images/menu/ltch-line.svg";
import ltchSolidIcon from "../../assets/images/menu/ltch-solid.svg";
import { Icon } from "../../icons";
import { Avatar } from "../../components/ui/Avatar";
import { Logo } from "../../components/ui/Logo";

export type BottomNavigationItem =
  "profile" | "ltch" | "store" | "guide" | "search";

export interface BottomNavigationProps {
  /** 현재 활성 탭. 기본 'store'(메인 화면). */
  active?: BottomNavigationItem;
  /** 사용자(대표 어르신) 이름 — 첫 번째 탭 라벨. */
  userName: string;
  /** 첫 번째 탭 아바타 이미지 URL. 생략하면 `Avatar` 기본 플레이스홀더. */
  userAvatarSrc?: string;
  /** 탭 클릭 핸들러. */
  onNavigate?: (item: BottomNavigationItem) => void;
  /** 루트에 병합할 클래스(배치용). */
  className?: string;
}

const ITEM_LABEL: Record<
  Exclude<BottomNavigationItem, "profile" | "store">,
  string
> = {
  ltch: "시설찾기",
  guide: "요양정보",
  search: "검색",
};

/**
 * 탭 버튼 공통 pill 배경 — `state=hover` 에만 켜진다. `state=focus`(active)는 pill
 * 배경이 없다(위 파일 상단 주석의 재조사 정정 참고) — 선택 여부는 아이콘/아바타/스토어
 * 강조로만 드러난다.
 */
const PILL_CLASS =
  "rounded-md hover:bg-bg-brandGrayish-normal focus-visible:bg-bg-brandGrayish-normal focus-visible:outline-none";

export function BottomNavigation({
  active = "store",
  userName,
  userAvatarSrc,
  onNavigate,
  className,
}: BottomNavigationProps) {
  return (
    <nav
      aria-label="하단 내비게이션"
      className={[
        "flex h-(--sz-60) w-full items-center gap-(--sz-4)",
        "border-t-[length:var(--border-width-2xs)] border-solid border-border-neutral-bright",
        "bg-bg-neutral-normal px-(--sz-4)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        aria-current={active === "profile" ? "page" : undefined}
        onClick={() => onNavigate?.("profile")}
        className={[
          "flex h-(--sz-52) flex-1 flex-col items-center justify-center gap-(--sz-4) px-(--sz-6) py-(--sz-4)",
          PILL_CLASS,
        ].join(" ")}
      >
        <Avatar
          size="xs"
          type="person"
          variant="readOnly"
          src={userAvatarSrc}
          className={
            active === "profile"
              ? "border border-border-neutral-dark"
              : undefined
          }
        />
        <span className="text-body-6 text-typo-neutral-normal">{userName}</span>
      </button>

      <button
        type="button"
        aria-current={active === "ltch" ? "page" : undefined}
        onClick={() => onNavigate?.("ltch")}
        className={[
          "flex h-(--sz-52) flex-1 flex-col items-center justify-center gap-(--sz-4) px-(--sz-2) py-(--sz-4)",
          PILL_CLASS,
        ].join(" ")}
      >
        <img
          src={active === "ltch" ? ltchSolidIcon : ltchLineIcon}
          alt=""
          aria-hidden
          className="size-(--sz-24)"
        />
        <span className="text-body-6 text-typo-neutral-normal">
          {ITEM_LABEL.ltch}
        </span>
      </button>

      <button
        type="button"
        aria-current={active === "store" ? "page" : undefined}
        onClick={() => onNavigate?.("store")}
        className={[
          "flex h-(--sz-52) flex-1 flex-col items-center justify-center gap-(--sz-4) px-(--sz-2) py-(--sz-4)",
          PILL_CLASS,
        ].join(" ")}
      >
        <span
          className={[
            "flex size-(--sz-40) items-center justify-center rounded-circle",
            active === "store"
              ? "bg-[linear-gradient(-48.6deg,var(--color-bg-info-normal)_13.5%,var(--color-bg-brand-normal)_83.2%)]"
              : "bg-bg-brand-normal",
          ].join(" ")}
        >
          <Logo
            lockup="symbol"
            tone="transparentWhite"
            width={24}
            title="스토어"
          />
        </span>
      </button>

      <button
        type="button"
        aria-current={active === "guide" ? "page" : undefined}
        onClick={() => onNavigate?.("guide")}
        className={[
          "flex h-(--sz-52) flex-1 flex-col items-center justify-center gap-(--sz-4) px-(--sz-2) py-(--sz-4)",
          PILL_CLASS,
        ].join(" ")}
      >
        <Icon
          name={active === "guide" ? "book_open_01_solid" : "book_open_01_line"}
          size={24}
          className="text-icon-neutral-normal"
        />
        <span className="text-body-6 text-typo-neutral-normal">
          {ITEM_LABEL.guide}
        </span>
      </button>

      <button
        type="button"
        aria-current={active === "search" ? "page" : undefined}
        onClick={() => onNavigate?.("search")}
        className={[
          "flex h-(--sz-52) flex-1 flex-col items-center justify-center gap-(--sz-4) px-(--sz-2) py-(--sz-4)",
          PILL_CLASS,
        ].join(" ")}
      >
        <Icon
          name={
            active === "search" ? "search_refraction_line" : "search_md_line"
          }
          size={24}
          className="text-icon-neutral-normal"
        />
        <span className="text-body-6 text-typo-neutral-normal">
          {ITEM_LABEL.search}
        </span>
      </button>
    </nav>
  );
}
