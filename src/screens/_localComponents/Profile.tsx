/**
 * Profile — 메인 화면 최상단 프로필 바.
 *
 * Figma 마스터/variant 세트(node 30733:25378, "Profile" — `hasProfile`(false/true) ×
 * `isError`(false/true) 3개 심볼)와 1:1. 이 화면 인스턴스(node 30733:25116)는
 * `hasProfile=true, isError=false` 조합만 쓰지만, 사용자가 "자주 재사용되는 로컬
 * 컴포넌트"로 확정해 3개 상태 전부를 반영했다(다른 화면에서 프로필 미등록/조회
 * 에러 상태로도 재사용될 것을 전제). 앱 전역에서 쓰일 수 있는 상단 바라
 * `src/screens/_localComponents/`(`BottomNavigation`과 같은 급의 앱 셸 조각) 에 둔다 —
 * 디자인시스템 원시 컴포넌트는 아니다.
 *
 * 2026-09-25 재조사(node 30733:33910, 상위 "Profile" 문서 섹션) — 3개 핵심 심볼
 * (30733:25378) 자체는 그대로다(새 hasProfile/isError 조합 없음). 다만 이 섹션에서
 * 처음으로 상태 텍스트의 실제 하위 구조가 문서화된 `_parts/ProfileLtcOption`
 * (node 30733:33907, `type`×`typography` 8-variant)을 발견해 기존 구현의 색상
 * 누락을 찾아 고쳤다: "일반 00%" 퍼센트 구간은 Figma 원본에서 `orange/500`
 * (`#f2711c`, 세만틱 미바인딩 raw 값)로 강조돼 있는데, 이전 구현은 `statusText`를
 * 통짜 문자열로 받아 전부 회색(`text-typo-neutral-bright`)으로만 렌더해 이 강조가
 * 빠져 있었다 — `kakao` 색 선례와 동일하게 신규 세만틱 토큰(`--color-grade-percent`,
 * `tokens/color/semantic.json`)을 추가해 `text-grade-percent` 로 정확히 반영했다.
 * 그래서 `statusText`(통짜 문자열) prop을 `percentText`(주황 강조, 예: "일반 00%")
 * + `suffixText`(기본색 보조 텍스트, 예: "· 입소중") 두 개로 분리했다 — Figma
 * `type="percent&ltch", typography="label_3"` 조합과 1:1(이 화면이 실제로 쓰는
 * 유일한 조합, 나머지 6개 조합(`grade&percent&ltch`/`percent`/`normal` ×
 * `label_2`)은 화면에 없는 상태라 범위 밖으로 남겨뒀다).
 *
 * 같은 섹션에서 좌측 아바타+이름 블록이 `_parts/Button/ltcProfile`(node
 * 30788:25276, `optionType`(cost/grade/empty) × `hasDeadDate` × `isError` ×
 * `showOption`/`showProfileList` 축)이라는 더 범용적인 재사용 아톰으로도
 * 문서화돼 있는 걸 확인했지만, 이 축들은 최상단 Profile 바(정본 30733:25378)가
 * 실제로 쓰는 조합(`optionType="grade"` 정상 / `optionType="empty"+isError`
 * 에러)과 정확히 일치해 지금 구현과 다른 점이 없다 — `optionType="cost"`(좌측에
 * 적립금 노출)·`hasDeadDate`(만료일 표시) 조합은 이 Profile 바에서 쓰이지 않는
 * 다른 화면 맥락의 변형으로 판단해 범위 밖으로 뒀다. `Profile/Category`(node
 * 31470:183732, 상품유형별 카테고리 행)도 이름 자체가 다른 별개 컴포넌트라
 * 이번 갱신 범위에서 제외했다.
 *
 * 3개 상태:
 * - `hasProfile=false` — 어르신 프로필 미등록 유도 CTA(그라데이션 텍스트 링크 + 화살표).
 * - `hasProfile=true, isError=false` — 정상 프로필(아바타+이름+등급/상태 텍스트,
 *   우측 적립금(`isBeneficiary`)+"더보기"(`goToLtc`) — 둘 다 Figma 축 그대로 boolean
 *   프롭으로 노출).
 * - `hasProfile=true, isError=true` — 조회 실패(연한 danger 배경, 상태 텍스트 행
 *   없음, 우측은 점/더보기 대신 "다시 조회하기" 버튼).
 *
 * 아바타는 기존 `Avatar`(size="sm"=32px, type="person", variant="readOnly") 를 그대로
 * 재사용 — Figma 는 정상 상태에 인물사진(female_pink), 에러 상태에 제네릭
 * placeholder를 쓴다. 2026-10-07 "김또가" 화면(`LtcProfile`) 구현 중 저장소에 이미
 * 있던 실제 일러스트 아바타 자산(`src/assets/images/avatar/Person=female_pink.svg`,
 * Figma 레이어명과 동일)을 발견해 두 상태 모두 이 자산으로 갱신했다(기존엔 자산이
 * 없는 줄 알고 `Avatar` 기본 placeholder로 통일했었음 — 에러 상태는 Figma 원본이
 * 제네릭 placeholder를 쓰지만, 사용자가 "BottomNavigation 과 동일 이미지 반영"을
 * 요청해 일관성을 위해 에러 상태에도 같은 자산을 적용했다).
 * 에러 배경(Figma raw `red/10` #fffafa)은 팔레트에 없는 미세 음영이라 가장 가까운
 * 기존 세만틱 토큰 `bg-bg-danger-bright`(red/30)로 근사했다(신규 토큰 추가 없음).
 *
 * 2026-09-26 QA 재수정 (node 30733:33910 안의 실사용 인스턴스 30788:25236 `_parts/
 * Button/ltcProfile`을 `get_design_context`로 재조회, 스크린샷(node 30727:25697)과
 * 픽셀 비교) — 사용자가 "김또가" 이름 줄이 스크린샷과 어긋나 보인다고 지적해
 * 원인을 찾았다:
 * 1. **이름 타이포 오류**: 이름 텍스트는 `text-body-4-bold`(16px, line-height
 *    1.47)가 아니라 `text-label-1-bold`(16px, `leading-none`=line-height 1,
 *    tracking -1.5%)였다 — Figma 실측 `leading-none` 클래스를 놓치고 body 계열
 *    선례를 무비판적으로 재사용했던 게 원인. line-height 1.47 vs 1 차이가 32px
 *    아바타·15px 드롭다운 아이콘과 나란히 놓였을 때 눈에 띄는 수직 오프셋을
 *    만들었다(줄 높이가 커지면 글자 자체는 flex `items-center`로 정중앙에
 *    있어도, 이름 옆 붙어야 할 드롭다운 아이콘과의 광학적 정렬이 흐트러져
 *    보임). 아바타 크기(32px)와 gap 값들(`gap-8`/`gap-5`/`gap-3`)은 재조회 결과
 *    기존 구현과 전부 일치해 원인이 아니었다.
 * 2. **드롭다운 아이콘이 일반 픽토그램이 아니었음**: `chevron_down_line` 근사는
 *    틀렸다 — 실제 `profileSelectIcon`(node 30788:25201, 14×15) SVG를 직접
 *    다운로드해 확인한 결과 "회색 원(`circle`, fill `#EEEEEE`=`gray/60`) 위에
 *    진회색 역삼각형(`path`, fill `#4A4A4A`=`gray/800`)" 조합의 카드 전용 커스텀
 *    그래픽이었다(일반 아이콘셋에 없음, `PopularProductCard`의 `RankBadge`
 *    인라인 SVG 선례와 동일 방식으로 처리). 에러 상태 아이콘(node 30788:25295,
 *    14×14)도 같은 벡터를 1px 차이로 재사용한 것이라 굳이 별도 자산으로 두지
 *    않고 하나의 `ProfileSelectIcon` 컴포넌트(14×14 정사각 근사, viewBox 비율
 *    유지)로 통합했다. hex 는 그대로 박지 않고 기존 세만틱 토큰으로 치환:
 *    `#EEEEEE`→`--color-bg-neutral-deepDark`(= `gray/60` 별칭, 이미 존재),
 *    `#4A4A4A`→`--color-icon-neutral-subtle`(= `gray/800` 별칭, 이미 존재) —
 *    신규 토큰 추가 없이 기존 값으로 정확히 커버됐다.
 *
 * 2026-09-26 이름 줄 폭 수정(사용자 확정, Figma 범위 밖): 이름 span 이 `flex-1`로
 * 남은 가로 공간을 전부 차지해 짧은 이름일 때 드롭다운 아이콘이 텍스트에서 멀리
 * 떨어져 보이는 문제가 있었다. `flex-1`을 제거해 텍스트 길이만큼만 차지하도록
 * 하고(`w-fit`), 긴 이름은 `max-w-(--sz-100)`(100px = 사용자가 요청한 102px의
 * 가장 가까운 토큰, 약 8자)에서 말줄임되게 했다 — `Avatar`/`HorizontalMenuButton`
 * 의 "가장 가까운 토큰 근사" 원칙과 동일.
 *
 * 2026-09-26 상단 고정(사용자 확정, Figma 범위 밖): 이 화면 최상단에서 `Header`
 * 바로 아래에 위치하는 두 번째 고정 바라, 3개 상태(CTA/정상/에러) 루트 전부에
 * `sticky top-(--sz-52)`(Header 높이만큼 오프셋 — `Header.tsx` 도 항상
 * `sticky top-0` 고정) + `z-30`(Header `z-40`보다 아래, `BottomNavigation`과
 * 같은 "앱 셸 고정 UI" 티어)을 건다. `Header`가 없는 화면에서 `Profile`을 단독
 * 재사용하면 `top-(--sz-52)` 오프셋이 잘못되므로, 항상 `Header` 바로 다음에만
 * 배치한다는 전제가 있다.
 *
 * @example
 * // 정상 상태
 * <Profile hasProfile name="김또가" avatarSrc={avatarSrc} percentText="일반 15%"
 *   suffixText="· 입소중" point="1,600,000" onMoreClick={goToElder} />
 * // 프로필 미등록 → 추가 유도 CTA
 * <Profile onAddProfileClick={goToAddElder} />
 * // 조회 실패
 * <Profile hasProfile isError name="김또가" onRetryClick={refetch} />
 */

import { Icon } from "../../icons";
import { Avatar } from "../../components/ui/Avatar";
import { BlankGraphic } from "../../components/ui/BlankGraphic";

/**
 * Figma "profileSelectIcon"(node 30788:25201) 벡터 path 그대로 — 회색 원 +
 * 진회색 역삼각형 조합의 이름 옆 드롭다운 표식. 일반 아이콘셋에 없는 카드 전용
 * 커스텀 그래픽이라 인라인 SVG로 직접 구현한다(`PopularProductCard`의
 * `RankBadge` 선례와 동일 방식). fill 은 원본 hex 대신 동일 값의 기존 세만틱
 * 토큰을 참조한다.
 */
function ProfileSelectIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 15"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="7" cy="7.5" r="7" fill="var(--color-bg-neutral-deepDark)" />
      <path
        d="M7.45947 9.65286C7.21969 9.93839 6.78031 9.93839 6.54053 9.65286L4.3638 7.06085C4.03597 6.67048 4.31351 6.075 4.82328 6.075L9.17673 6.075C9.68649 6.075 9.96403 6.67048 9.6362 7.06085L7.45947 9.65286Z"
        fill="var(--color-icon-neutral-subtle)"
      />
    </svg>
  );
}

export interface ProfileProps {
  /** 어르신 프로필 등록 여부(Figma `hasProfile`). 기본 false(미등록 CTA). */
  hasProfile?: boolean;
  /** 프로필 조회 실패 여부(Figma `isError`). `hasProfile=true` 일 때만 의미 있다. 기본 false. */
  isError?: boolean;
  /** 적립금 표시 여부(Figma `isBeneficiary`). 정상 상태에서만 의미 있다. 기본 true. */
  isBeneficiary?: boolean;
  /** "더보기" 버튼 노출 여부(Figma `goToLtc`). 정상 상태에서만 의미 있다. 기본 true. */
  goToLtc?: boolean;
  /** 어르신 이름. `hasProfile=true` 일 때만 쓰인다. */
  name?: string;
  /** 어르신 아바타 이미지 URL. 생략하면 `Avatar` 기본 플레이스홀더. */
  avatarSrc?: string;
  /**
   * 등급/성실도 퍼센트 텍스트(주황 강조, 예: "일반 00%"). 생략하면 상태 텍스트
   * 행 자체를 렌더하지 않는다(Figma `_parts/ProfileLtcOption`
   * `type="percent&ltch"` 의 강조 구간 — `--color-grade-percent` 토큰).
   */
  percentText?: string;
  /**
   * 퍼센트 뒤에 붙는 기본색 보조 텍스트(예: "· 입소중"). `percentText` 가 있을
   * 때만 의미 있다.
   */
  suffixText?: string;
  /** 적립금 텍스트(숫자만, "원" 접미사는 컴포넌트가 붙인다). */
  point?: string;
  /** "더보기" 버튼 클릭 핸들러(정상 상태). */
  onMoreClick?: () => void;
  /** "다시 조회하기" 버튼 클릭 핸들러(에러 상태). */
  onRetryClick?: () => void;
  /** 프로필 영역(아바타+이름) 클릭 핸들러. `hasProfile=true` 일 때만 쓰인다. */
  onProfileClick?: () => void;
  /** "어르신 프로필 추가" CTA 클릭 핸들러(`hasProfile=false`). */
  onAddProfileClick?: () => void;
}

export function Profile({
  hasProfile = false,
  isError = false,
  isBeneficiary = true,
  goToLtc = true,
  name = "",
  avatarSrc,
  percentText,
  suffixText,
  point = "0",
  onMoreClick,
  onRetryClick,
  onProfileClick,
  onAddProfileClick,
}: ProfileProps) {
  if (!hasProfile) {
    return (
      <button
        type="button"
        onClick={onAddProfileClick}
        className="sticky top-(--sz-52) z-30 flex w-full items-center justify-center gap-(--sz-4) border-y-[length:var(--border-width-2xs)] border-solid border-border-brandGrayish-light bg-bg-neutral-normal py-(--sz-8) transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
      >
        <BlankGraphic ratio="60/36" className="w-(--sz-60)" />
        <span className="bg-[image:var(--color-typo-gradient-highlight)] bg-clip-text text-body-6-bold text-transparent">
          어르신 프로필 추가하고 연 160만원 혜택 받기!
        </span>
        <Icon
          name="chevron_right_line"
          size={18}
          className="shrink-0 text-icon-neutral-bright"
        />
      </button>
    );
  }

  if (isError) {
    return (
      <div className="sticky top-(--sz-52) z-30 flex w-full items-center gap-(--sz-8) border-y-[length:var(--border-width-2xs)] border-solid border-border-brandGrayish-light bg-bg-danger-bright py-(--sz-8)">
        <button
          type="button"
          onClick={onProfileClick}
          className="flex min-w-0 flex-1 items-center gap-(--sz-8) pl-(--sz-20) transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
        >
          <Avatar size="sm" type="person" variant="readOnly" src={avatarSrc} />
          <span className="flex min-w-0 items-center gap-(--sz-3)">
            <span className="w-fit max-w-(--sz-100) truncate text-label-1-bold text-typo-neutral-normal">
              {name}
            </span>
            <ProfileSelectIcon className="size-(--sz-14) shrink-0" />
          </span>
        </button>

        <div className="flex h-full shrink-0 items-center justify-end pr-(--sz-20)">
          <button
            type="button"
            onClick={onRetryClick}
            className="flex min-h-(--sz-26) shrink-0 items-center justify-center gap-(--sz-3) rounded-sm bg-bg-danger-bright px-(--sz-8) py-(--sz-3) text-body-5 text-typo-danger-deep transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
          >
            <Icon name="alert_triangle_solid" size={14} />
            어르신 정보 다시 조회하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-(--sz-52) z-30 flex w-full items-center gap-(--sz-8) border-y-[length:var(--border-width-2xs)] border-solid border-border-brandGrayish-light bg-bg-neutral-normal py-(--sz-8)">
      <button
        type="button"
        onClick={onProfileClick}
        className="flex min-w-0 flex-1 items-center gap-(--sz-8) pl-(--sz-20) transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
      >
        <Avatar size="sm" type="person" variant="readOnly" src={avatarSrc} />
        <span className="flex min-w-0 flex-1 flex-col items-start gap-(--sz-5)">
          <span className="flex min-w-0 items-center gap-(--sz-3)">
            <span className="w-fit max-w-(--sz-100) truncate text-label-1-bold text-typo-neutral-normal">
              {name}
            </span>
            <ProfileSelectIcon className="size-(--sz-14) shrink-0" />
          </span>
          {percentText ? (
            <span className="truncate text-body-6 text-typo-neutral-bright">
              <span className="text-grade-percent">{percentText}</span>
              {suffixText ? ` ${suffixText}` : null}
            </span>
          ) : null}
        </span>
      </button>

      <div className="flex h-full items-center justify-end gap-(--sz-8) pr-(--sz-20)">
        {isBeneficiary ? (
          <p className="text-right text-body-4-bold text-typo-neutral-normal">
            <span className="text-typo-brand-normal">{point}</span>원
          </p>
        ) : null}
        {goToLtc ? (
          <button
            type="button"
            onClick={onMoreClick}
            className="flex min-h-(--sz-26) shrink-0 items-center justify-center rounded-sm bg-bg-neutral-dark px-(--sz-8) py-(--sz-3) text-body-5 text-typo-neutral-normal transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
          >
            더보기
          </button>
        ) : null}
      </div>
    </div>
  );
}
