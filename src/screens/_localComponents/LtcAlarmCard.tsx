/**
 * LtcAlarmCard — "어르신 정보 알림" 카드.
 *
 * Figma "김또가" 화면(node 31424:176939 "section-어르신 정보 알림" 안의
 * `Card/LtcAlarm` 인스턴스 31456:180412/180357/180428)과 1:1. 톤별 원형 아이콘 +
 * 제목 + 설명(일부 구간 Bold 강조 가능) + (선택) 소형 outline 버튼으로 구성된
 * 독립 알림 카드다.
 *
 * 2026-10-07 Figma 리디자인 반영(사용자가 Figma에서 직접 수정): 이전엔 "어르신 정보
 * 알림" 섹션 헤더 + 바깥 흰 카드 안에 `Divider`로 구분된 "리스트 행"이었지만, 이제는
 * 섹션 헤더·바깥 카드·`Divider`가 모두 제거되고 **카드 하나하나가 독립된 카드**
 * (`rounded-2xl` + 내부 패딩 12)로 바뀌었다. 카드 표면은 2026-10-08 다시 바뀌어
 * 반투명 흰 radial 그라디언트 + 2px 흰 테두리 + 그림자의 "글래스" 카드다(`ROOT_CLASS`
 * 주석 참고).
 * 그래서 루트가 자체 카드 스타일을 갖고, 카드 간 간격은 호출부(`gap-(--sz-8)`)가
 * 담당한다. 아이콘↔본문 gap도 10→8로 바뀌었다(Figma 실측).
 *
 * `tone`(Figma 인스턴스별로 아이콘 원형 배경/아이콘 색이 달라진 축, 아이콘 SVG fill을
 * 직접 받아 기존 세만틱 토큰과 대조 — 신규 토큰 없음):
 * | tone    | 원형 배경             | 아이콘 색                 | Figma 실측 fill |
 * | neutral | bg-bg-neutral-deep    | text-icon-neutral-bright  | #ABABAB         |
 * | warning | bg-bg-warning-bright  | text-icon-warning-normal  | #F4B02A         |
 * | danger  | bg-bg-danger-bright   | text-icon-danger-normal   | #F84B55         |
 * 글리프(`icon`)는 톤과 독립된 prop으로 받는다(Figma: neutral=bell_01_solid,
 * warning=alert_circle_solid, danger=alert_triangle_solid).
 *
 * 하단 버튼은 옵셔널 — Figma 리디자인에서 "요양원 입소 중" 카드는 버튼 인스턴스
 * 자체가 삭제돼, `actionLabel`이 없으면 버튼을 렌더하지 않는다.
 *
 * 첫 진입 스태거 트랜지션: 루트에 `animate-fade-slide-in`(`src/index.css`의 커스텀
 * `@keyframes`, opacity 0→1 + translateY -8px→0, 300ms ease-in-out, fill-mode both)을
 * 걸고, 카드별 지연은 `enterDelayMs` prop을 인라인 `animationDelay`로 받는다
 * (인덱스별 값은 유틸 클래스로 표현할 수 없어 `BottomSheet`의 `transitionDuration`
 * 인라인 스타일 선례와 동일 처리). 순수 CSS 애니메이션이라 화면이 마운트될 때마다
 * (다른 화면 갔다가 뒤로가기로 돌아와도) 다시 재생된다 — 사용자 확정 동작.
 * `motion-reduce:animate-none`으로 reduced-motion 사용자에겐 끈다.
 *
 * 요양등급 갱신 카드에는 Figma 주석으로 "유효기간 만료 90일 전~30일 전까지만 노출"
 * 이라는 노출 조건이 달려 있다 — 백엔드 연동이 없는 이번 범위에서는 날짜 조건을
 * 분기하지 않고 정적으로 렌더한다(포함 여부는 호출부가 결정).
 *
 * @example
 * <LtcAlarmCard
 *   icon="alert_circle_solid"
 *   tone="warning"
 *   title="요양등급 갱신 신청이 필요해요"
 *   description={"유효기간 만료가 다가오고 있어요!\n27.12.31까지 반드시 갱신 신청해 주세요."}
 *   actionLabel="갱신 신청하기" // 생략하면 버튼 없음
 *   onActionClick={openRenewal}
 *   enterDelayMs={120} // 여러 장일 때 순서대로 등장
 * />
 */

import { useId } from "react";
import type { ReactNode } from "react";

import { Icon } from "../../icons";
import type { IconName } from "../../icons";
import { ButtonWithLabel } from "../../components/ui/ButtonWithLabel";

export type LtcAlarmCardTone = "neutral" | "warning" | "danger";

export interface LtcAlarmCardProps {
  /** 원형 배경 안 아이콘 글리프. */
  icon: IconName;
  /** 아이콘 원형 배경/아이콘 색 톤. */
  tone: LtcAlarmCardTone;
  /** 제목(필수). */
  title: string;
  /** 설명(필수). 강조 구간이 있으면 `<strong>` 등으로 직접 마크업해서 전달한다. */
  description: ReactNode;
  /** 하단 소형 버튼 라벨. 생략하면 버튼을 렌더하지 않는다. */
  actionLabel?: string;
  /** 버튼 클릭 핸들러. */
  onActionClick?: () => void;
  /** 첫 진입 애니메이션 지연(ms) — 스태거용. 기본 0. */
  enterDelayMs?: number;
  /** 루트에 병합할 클래스. */
  className?: string;
}

const TONE_CLASS: Record<LtcAlarmCardTone, { bg: string; icon: string }> = {
  neutral: { bg: "bg-bg-neutral-deep", icon: "text-icon-neutral-bright" },
  warning: { bg: "bg-bg-warning-bright", icon: "text-icon-warning-normal" },
  danger: { bg: "bg-bg-danger-bright", icon: "text-icon-danger-normal" },
};

/**
 * 카드 표면(2026-10-08 Figma 변경 반영): 단색 흰 배경 + 1px `border-brandGrayish-bright`
 * → **반투명 흰 radial 그라디언트 배경 + 2px 흰 테두리(`border-inverse-dark`) +
 * `shadow-greenGray-md`** 의 "글래스" 카드로 바뀌었다. 그라디언트는 `CardGlassBackground`
 * (아래)가 그리고, 루트는 `isolate`(배경 SVG를 `-z-10`으로 카드 안쪽에만 깔기 위한
 * 스태킹 컨텍스트) + `overflow-clip`(배경을 `rounded-2xl` 모서리에 맞춰 자름 — 그림자는
 * 자기 overflow에 잘리지 않음)을 갖는다.
 */
const ROOT_CLASS =
  "relative isolate flex w-full items-start gap-(--sz-8) overflow-clip rounded-2xl " +
  "border-[length:var(--border-width-sm)] border-border-inverse-dark " +
  "p-(--sz-12) shadow-greenGray-md " +
  "animate-fade-slide-in motion-reduce:animate-none";

/**
 * 카드 배경 radial 그라디언트 — Figma `Card/LtcAlarm` fill(GRADIENT_RADIAL)을 그대로
 * 옮긴 인라인 SVG. 중심은 카드 우하단 근처(x 281.5/320, y = 카드 바닥)이고, 중심
 * `bg/overlay/whiteSubtle`(흰 10%) → 바깥 `bg/overlay/whiteDark`(흰 80%)로 번진다 —
 * 우하단만 화면 배경이 비치고 나머지는 거의 흰색인 카드.
 *
 * Figma가 내보낸 값은 카드 높이별 `userSpaceOnUse` 행렬(예: 172px 카드
 * `matrix(-8.75 -9.675 18 -38.393 281.5 172)`)인데, 세 카드(172/132/116px)의 y 성분이
 * 전부 높이에 정확히 비례해서(-9.675/172 = -7.425/132 = -0.05625 등) 카드 크기에
 * 상대적인 그라디언트임이 확인됐다. 그래서 `objectBoundingBox` 단위로 한 번 환산한
 * 행렬(x 성분 ÷320, y 성분 ÷높이)을 써서 어떤 높이·폭의 카드에도 같은 모양이 나오게
 * 했다. CSS `radial-gradient`로는 이 기울어진 타원을 표현할 수 없어 SVG를 쓴다.
 * 정지점 색은 data URI가 아닌 인라인 SVG라 CSS 변수(세만틱 토큰)를 그대로 참조할 수
 * 있다 — 하드코딩 없음.
 */
const GLASS_GRADIENT_TRANSFORM =
  "matrix(-0.02734375 -0.05625 0.05625 -0.22321 0.8796875 1)";

function CardGlassBackground() {
  // React `useId` 값엔 `«»`/`:` 같은 문자가 섞일 수 있어 `url(#…)` 참조가 깨지지 않게
  // 영숫자만 남긴다(카드가 여러 장이라 id는 인스턴스마다 달라야 함).
  const gradientId = `ltc-alarm-glass-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 size-full"
    >
      <defs>
        <radialGradient
          id={gradientId}
          gradientUnits="objectBoundingBox"
          cx="0"
          cy="0"
          r="10"
          gradientTransform={GLASS_GRADIENT_TRANSFORM}
        >
          <stop
            offset="0"
            style={{ stopColor: "var(--color-bg-overlay-whiteSubtle)" }}
          />
          <stop
            offset="1"
            style={{ stopColor: "var(--color-bg-overlay-whiteDark)" }}
          />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </svg>
  );
}

export function LtcAlarmCard({
  icon,
  tone,
  title,
  description,
  actionLabel,
  onActionClick,
  enterDelayMs = 0,
  className,
}: LtcAlarmCardProps) {
  const toneClass = TONE_CLASS[tone];

  return (
    <div
      data-tone={tone}
      style={{ animationDelay: `${enterDelayMs}ms` }}
      className={[ROOT_CLASS, className].filter(Boolean).join(" ")}
    >
      <CardGlassBackground />
      <span
        className={[
          "flex shrink-0 items-center rounded-circle p-(--sz-6)",
          toneClass.bg,
        ].join(" ")}
      >
        <Icon name={icon} size={16} className={toneClass.icon} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-(--sz-8)">
        <div className="flex w-full flex-col items-start gap-(--sz-4)">
          <p className="w-full text-body-4-bold text-typo-neutral-normal">
            {title}
          </p>
          <p className="w-full whitespace-pre-line text-body-5 text-typo-neutral-subtle">
            {description}
          </p>
        </div>
        {actionLabel ? (
          <ButtonWithLabel
            color="neutral"
            variant="outline"
            size="sm"
            endIcon={<Icon name="chevron_right_line" size={14} />}
            onClick={onActionClick}
          >
            {actionLabel}
          </ButtonWithLabel>
        ) : null}
      </div>
    </div>
  );
}
