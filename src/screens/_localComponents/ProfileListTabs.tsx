/**
 * ProfileListTabs — "김또가" 화면 최상단 프로필 선택 탭 목록.
 *
 * Figma "김또가" 화면(node 31062:105091, "section-프로필목록") 과 1:1. 한 계정에
 * 등록된 여러 어르신(수급자) 프로필을 가로 pill 목록으로 보여주고, 선택된 프로필만
 * 브랜드 그라데이션 텍스트 + 브랜드 테두리로 강조한다. 맨 끝 "어르신 추가" pill은
 * 점선 테두리 + `plus_line` 아이콘의 고정 액션이다.
 *
 * 이 화면에서만 쓰이는 조합(프로필 아바타 pill + 어르신 추가)이라
 * `src/screens/_localComponents/`에 둔다 — 디자인시스템 원시 컴포넌트는 아니다.
 *
 * 선택 pill: `border-border-brand-normal`(green/500) + `shadow-greenGray-xs`(Figma
 * `shadow/greenGray/xs` 와 1:1) + 이름 텍스트는 `Profile.tsx`의 CTA 그라데이션 선례와
 * 동일한 `--color-typo-gradient-highlight` 합성 토큰을 `bg-clip-text`로 적용한다.
 * 비선택 pill: 기본 `border-border-neutral-bright` + `text-typo-neutral-subtle`.
 *
 * 아바타는 기존 `Avatar`(size="xs"=24px, type="person", variant="readOnly") 를 그대로
 * 재사용한다.
 *
 * 2026-10-07 스와이퍼 전환(사용자 확정): Figma 재조회 결과 이 노드에 dev 주석
 * "1. 가로 스와이퍼 2. 목록 양쪽 여백 20"이 달려 있어, 기존 `overflow-x-auto`
 * (순수 브라우저 스크롤)를 실제 `swiper`(npm) `swiper/react`로 교체했다. 디자인시스템
 * `Swiper`(`src/components/ui/Swiper`)는 배너용 단일/peek 슬라이드 전용이라 이런
 * 다중 pill 목록엔 맞지 않는다는 게 `Main.tsx`의 "실시간 인기 상품" 캐러셀에서 이미
 * 검증돼 있어, 그 선례를 그대로 재사용한다(이름 충돌 방지로 `SwiperReact`로 alias).
 * - `freeMode={{ enabled: true, sticky: true }}` + `mousewheel={{ forceToAxis: true }}`:
 *   `Main.tsx`와 동일한 상호작용 모델(짧게 끌면 다음 pill 경계로 스냅, 길게 끌면
 *   따라오다 놓는 지점 기준 스냅 + 트랙패드/휠 가로 스크롤)을 그대로 적용해 앱
 *   전역에서 스와이프 제스처가 일관되게 동작하도록 했다 — pill처럼 짧은 요소라도
 *   이 조합이 거슬리지 않고, Figma에 더 세부적인 스펙이 없어 기존 선례를 따랐다.
 *   loop/autoplay는 배너 전용 동작이라 쓰지 않는다.
 * - `spaceBetween={6}`/`slidesOffsetBefore`/`slidesOffsetAfter`={20}: 기존
 *   `gap-(--sz-6)`/`px-(--sz-20)`과 동일한 값을 JS 상수로 중복 유지한다 — Swiper
 *   전용 API(px 숫자만 허용)라 CSS 토큰을 직접 넘길 수 없는 기존 제약
 *   (`POPULAR_LIST_EDGE_GAP` 선례)과 동일 이유다. `className="px-(--sz-20)"`로
 *   주면 `swiper/css`(un-layered)의 `.swiper{padding:0}`가 항상 이겨서 무음
 *   실패한다(`Main.tsx`에 이미 문서화된 cascade-layers 함정).
 * - 각 `SwiperSlide`에 `style={{ width: "auto" }}`를 인라인으로 주는 이유도 동일한
 *   cascade-layers 문제 — `swiper/css`의 `.swiper-slide{width:100%}`가 Tailwind
 *   유틸보다 항상 이겨서 pill의 hug-content 폭(`inline-flex` + 내용물 크기)이
 *   100%로 늘어나 버리는 걸 막는다.
 * - "어르신 추가" pill도 Figma `list` 프레임 안에 다른 pill들과 함께 있으므로
 *   동일하게 마지막 `SwiperSlide`로 포함한다(별도 분리 없음). *
 * 2026-10-08 Figma 재대조(node 31062:105091, "간격+여백+타이포 정확하게"):
 * - 섹션 상하 여백 `py-(--sz-8)`이 실제로는 적용되지 않고 있었다 — `swiper/css`의
 *   un-layered `.swiper{padding:0}`가 Tailwind `@layer utilities`의 `py-*`를 항상
 *   이기는 같은 cascade-layers 함정(좌우 여백을 `slidesOffset*`로 우회한 것과 동일
 *   원인). 그 결과 위아래 8px이 사라지고, `.swiper{overflow:hidden}`에 선택 pill의
 *   그림자(`shadow-greenGray-xs`)까지 잘리고 있었다. 인라인 스타일
 *   `paddingBlock: var(--sz-8)`(토큰 참조)로 바꿔 확실히 적용 — 그림자도 padding
 *   영역 안에 들어와 더는 잘리지 않는다.
 * - 비선택 pill 이름은 Bold가 아니라 Medium(`label/2` = `text-label-2`)이었다. 선택
 *   pill만 `label/2_bold`, "어르신 추가"는 Bold 그대로(Figma 실측).
 * - "어르신 추가" plus 아이콘 색은 SVG fill `#8B9B93` = `icon-brandGrayish-normal`
 *   (기존 `-subtle`은 한 단계 연했음).
 * - 그 외(pill 내부 패딩 4/10·4, 추가 pill 우측 8, pill 간 6, 아바타 24, 이름 최대폭
 *   60, 좌우 20)는 기존 구현이 이미 실측과 일치함을 재확인.
 *
 * @example
 * <ProfileListTabs
 *   profiles={[{ id: "kim", name: "김또가", avatarSrc }]}
 *   activeId={activeId}
 *   onSelect={setActiveId}
 *   onAddClick={goToAddElder}
 * />
 */

import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Icon } from "../../icons";
import { Avatar } from "../../components/ui/Avatar";

/**
 * pill 간 간격/좌우 여백(px). Figma 실측 `gap-(--sz-6)`=6px, `px-(--sz-20)`=20px과
 * 동일 값 — Swiper API가 CSS 변수를 받지 못해 숫자로 중복 유지한다(위 문서 참고).
 */
const PILL_GAP_PX = 6;
const LIST_EDGE_GAP_PX = 20;

export interface ProfileListTabItem {
  id: string;
  name: string;
  avatarSrc?: string;
}

export interface ProfileListTabsProps {
  /** 프로필 목록. */
  profiles: ProfileListTabItem[];
  /** 현재 선택된 프로필 id. */
  activeId: string;
  /** 프로필 선택 핸들러. */
  onSelect?: (id: string) => void;
  /** "어르신 추가" pill 클릭 핸들러. */
  onAddClick?: () => void;
  /** 루트에 병합할 클래스. */
  className?: string;
}

const PILL_BASE =
  "inline-flex shrink-0 cursor-pointer items-center gap-(--sz-6) rounded-circle " +
  "border-solid pl-(--sz-4) pr-(--sz-10) py-(--sz-4) " +
  "transition-opacity hover:opacity-(--alpha-80) " +
  "focus-visible:opacity-(--alpha-60) focus-visible:outline-none";

export function ProfileListTabs({
  profiles,
  activeId,
  onSelect,
  onAddClick,
  className,
}: ProfileListTabsProps) {
  return (
    <SwiperReact
      modules={[FreeMode, Mousewheel]}
      slidesPerView="auto"
      spaceBetween={PILL_GAP_PX}
      slidesOffsetBefore={LIST_EDGE_GAP_PX}
      slidesOffsetAfter={LIST_EDGE_GAP_PX}
      freeMode={{ enabled: true, sticky: true }}
      mousewheel={{ forceToAxis: true }}
      style={{ paddingBlock: "var(--sz-8)" }}
      className={["w-full", className].filter(Boolean).join(" ")}
    >
      {profiles.map((profile) => {
        const isActive = profile.id === activeId;
        return (
          <SwiperSlide key={profile.id} style={{ width: "auto" }}>
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect?.(profile.id)}
              className={[
                PILL_BASE,
                "border-[length:var(--border-width-xs)] bg-bg-neutral-normal",
                isActive
                  ? "border-border-brand-normal shadow-greenGray-xs"
                  : "border-border-neutral-bright",
              ].join(" ")}
            >
              <Avatar
                size="xs"
                type="person"
                variant="readOnly"
                src={profile.avatarSrc}
              />
              <span
                className={[
                  "max-w-(--sz-60) truncate",
                  isActive
                    ? "bg-[image:var(--color-typo-gradient-highlight)] bg-clip-text text-label-2-bold text-transparent"
                    : "text-label-2 text-typo-neutral-subtle",
                ].join(" ")}
              >
                {profile.name}
              </span>
            </button>
          </SwiperSlide>
        );
      })}

      <SwiperSlide style={{ width: "auto" }}>
        <button
          type="button"
          onClick={onAddClick}
          className={[
            PILL_BASE,
            "border-[length:var(--border-width-xs)] border-dashed border-border-brandGrayish-light",
            "bg-bg-neutral-deep pr-(--sz-8)",
          ].join(" ")}
        >
          <span className="flex size-(--sz-24) items-center justify-center rounded-circle border-[length:var(--border-width-xs)] border-dashed border-border-brandGrayish-light bg-bg-overlay-greenGraySubtle">
            <Icon
              name="plus_line"
              size={10}
              className="text-icon-brandGrayish-normal"
            />
          </span>
          <span className="text-label-2-bold text-typo-neutral-subtle">
            어르신 추가
          </span>
        </button>
      </SwiperSlide>
    </SwiperReact>
  );
}
