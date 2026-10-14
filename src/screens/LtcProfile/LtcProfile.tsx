/**
 * LtcProfile — "김또가 어르신" 화면(장기요양 수급자 어르신 정보 · 복지용구 혜택).
 *
 * Figma "김또가"(node 31062:105088, "1) 수급자"). 하단 탭바 첫 번째(어르신) 탭의 화면이다.
 * 위에서부터 Header → 어르신 프로필 목록(가로 스와이프) → 요약 카드 → 알림 카드 →
 * 구매/대여 가능 복지용구 → 복지혜택 알림받기 → 받을 수 있는 혜택 → 프로필 삭제 순서.
 *
 * 데이터는 전부 props로 받고, 생략하면 `ltcProfile.mock.ts`의 더미 데이터를 쓴다.
 *
 * @example
 * <LtcProfile />                                  // 더미 데이터로 렌더
 * <LtcProfile profiles={myElders} alarms={alarms} /> // API 데이터 주입
 *
 * ─── 개발자 할 일 체크리스트 ─────────────────────────────────────────────
 * - [ ] API 연결: `ltcProfile.mock.ts`의 TODO(dev) 항목(프로필 목록, 요약, 알림, 구매/대여
 *       품목·잔여 개수, 혜택 금액)을 실제 응답으로 교체
 * - [ ] 프로필 탭 전환: 지금은 탭 선택 표시만 바뀌고 본문은 첫 번째 어르신 기준으로 고정.
 *       선택한 어르신 기준으로 요약/알림/품목/혜택을 다시 조회해야 함
 * - [ ] 알림 노출 조건: "요양등급 갱신" 카드는 유효기간 만료 90~30일 전에만 노출(Figma 주석).
 *       서버에서 내려주거나 화면에서 날짜로 거르기
 * - [ ] 클릭 이동: 이 파일의 `// TODO(dev):` 표시 핸들러(어르신 추가, 상세 정보, 알림 버튼,
 *       안내 바텀시트, 대여 품목, 카카오 알림받기, 서비스 찾기, 프로필 삭제, 상담사 연결,
 *       유저/장바구니)
 * - [ ] 아바타 변경: 바텀시트에서 고른 이미지를 저장하는 API(지금은 화면 state만 변경)
 * - [ ] 프로필 삭제: 확인 다이얼로그 → 삭제 후 "페이지 유지"(Figma 주석)
 * - [ ] 로딩/빈/에러 상태: Figma 시안 없음 — 기획 확인 필요
 *
 * ─── 디자인 의도 (코드만 봐선 알기 어려운 것) ─────────────────────────────
 * - 알림 카드 3장은 화면 진입 때마다 위에서부터 0.12초 간격으로 오른쪽에서 밀려
 *   들어온다(`fade-slide-in`). 카드 리스트를 `overflow-x-clip`으로 감싼 건 이 애니메이션
 *   동안 가로 스크롤바가 생기지 않게 하려는 것(`overflow-x-auto`로 바꾸면 sticky Header가 깨짐).
 * - "구매하기" 품목을 누르면 스토어(메인)로 간다. "대여하기" 품목은 "복지용구 품목 안내"
 *   바텀시트를 띄워야 하는데 Figma 시안이 없어 비워 둠.
 * - 아바타 옆 연필 버튼 → "성별 이미지" 선택 바텀시트(4종 일러스트).
 * - 하단에 "상담사 대기중" 버튼이 항상 떠 있고, 그 위에 TopButton(20px 스크롤 후 노출)이
 *   쌓인다. 상담사 이름 줄은 화면 폭을 넘을 때만 말줄임(…).
 * - 화면 맨 아래 여백이 큰 이유: 하단 탭바 + 상담사 버튼에 마지막 콘텐츠가 가리지 않게.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import consultantCharacterImg from "../../assets/images/character/guideman1.png";
import coinImg from "../../assets/images/coin-1.png";
import kakaotalkAlarmImg from "../../assets/images/ltc-profile/kakaotalk-alarm.png";
import { Icon } from "../../icons";
import { BulletItem } from "../../components/ui/BulletItem";
import { ButtonWithLabel } from "../../components/ui/ButtonWithLabel";
import { FooterAccordion } from "../../components/ui/FooterAccordion";
import { Header } from "../../components/ui/Header";
import { TopButton } from "../../components/ui/TopButton";
import { AvatarPickerBottomSheet } from "../_localComponents/AvatarPickerBottomSheet";
import type { AvatarPickerOption } from "../_localComponents/AvatarPickerBottomSheet";
import { BenefitSection } from "../_localComponents/BenefitSection";
import { BottomNavigation } from "../_localComponents/BottomNavigation";
import { FloatingLayer } from "../_localComponents/FloatingLayer";
import { LtcAlarmCard } from "../_localComponents/LtcAlarmCard";
import { LtcProfileSummaryCard } from "../_localComponents/LtcProfileSummaryCard";
import { ProfileListTabs } from "../_localComponents/ProfileListTabs";
import { SectionTitle } from "../_localComponents/SectionTitle";
import { WelfareItemButton } from "../_localComponents/WelfareItemButton";
import { useBottomNavigation } from "../useBottomNavigation";
import {
  LTC_ALARMS,
  LTC_AVATAR_OPTIONS,
  LTC_BENEFITS,
  LTC_PROFILES,
  LTC_PURCHASE_ITEMS,
  LTC_RENTAL_ITEMS,
  LTC_SUMMARY,
  LTC_WELFARE_NOTICES,
} from "./ltcProfile.mock";
import type {
  LtcAlarm,
  LtcBenefit,
  LtcElderProfile,
  LtcElderSummary,
  LtcWelfareItem,
} from "./ltcProfile.mock";

/** 알림 카드 등장 간격(ms). N번째 카드는 N × 120ms 뒤에 애니메이션(300ms)을 시작한다. */
const ALARM_CARD_STAGGER_MS = 120;

// Tailwind는 소스에 "완전한 문자열"로 적힌 클래스만 만든다 — 위치·여백 클래스는 통째로 적는다.

/** 상담사 버튼: 좌우 16, 탭바(60) 위 12. */
const CONSULTANT_BUTTON_POSITION_CLASS =
  "left-[calc(env(safe-area-inset-left,0px)+var(--sz-16))] right-[calc(env(safe-area-inset-right,0px)+var(--sz-16))] bottom-[calc(env(safe-area-inset-bottom,0px)+var(--sz-60)+var(--sz-12))]";
/**
 * TopButton: 상담사 버튼(68) 위 8. 오른쪽 여백은 메인과 같은 DS 기본값 12 유지(Figma는 16).
 * TopButton이 기본 `bottom-*`를 이미 갖고 있어 확실히 덮어쓰도록 `!`(important).
 */
const TOP_BUTTON_POSITION_CLASS =
  "!bottom-[calc(env(safe-area-inset-bottom,0px)+var(--sz-60)+var(--sz-12)+var(--sz-68)+var(--sz-8))]";
/** 화면 하단 여백: 탭바 60 + 간격 12 + 상담사 버튼 68 + 여유 12 + 추가 스크롤 20. */
const SCREEN_BOTTOM_PADDING_CLASS =
  "pb-[calc(var(--sz-60)+var(--sz-12)+var(--sz-68)+var(--sz-12)+var(--sz-20))]";

/** 본문에서 `highlight` 부분만 굵게. */
function renderAlarmDescription({ description, highlight }: LtcAlarm) {
  if (!highlight || !description.includes(highlight)) return description;
  const [before, after] = description.split(highlight);
  return (
    <>
      {before}
      <strong className="font-bold text-typo-neutral-normal">
        {highlight}
      </strong>
      {after}
    </>
  );
}

export interface LtcProfileProps {
  /** 계정에 등록된 어르신 목록. 첫 번째가 기본 선택이자 본문 기준 어르신. */
  profiles?: LtcElderProfile[];
  /** 본문 기준 어르신의 등급/지원금 요약. */
  summary?: LtcElderSummary;
  /** "성별 이미지" 바텀시트 선택지. */
  avatarOptions?: AvatarPickerOption[];
  /** 어르신 정보 알림 카드(배열 순서 = 노출·애니메이션 순서). */
  alarms?: LtcAlarm[];
  /** 구매 가능 복지용구. */
  purchaseItems?: LtcWelfareItem[];
  /** 대여 가능 복지용구. */
  rentalItems?: LtcWelfareItem[];
  /** "꼭 확인하세요!" 유의사항. */
  notices?: string[];
  /** 받을 수 있는 혜택 섹션들(번호는 배열 순서). */
  benefits?: LtcBenefit[];
}

export function LtcProfile({
  profiles = LTC_PROFILES,
  summary = LTC_SUMMARY,
  avatarOptions = LTC_AVATAR_OPTIONS,
  alarms = LTC_ALARMS,
  purchaseItems = LTC_PURCHASE_ITEMS,
  rentalItems = LTC_RENTAL_ITEMS,
  notices = LTC_WELFARE_NOTICES,
  benefits = LTC_BENEFITS,
}: LtcProfileProps) {
  const navigate = useNavigate();
  const handleBottomNavigate = useBottomNavigation("profile");
  const primaryProfile = profiles[0];

  // 화면 내부 임시 state — 실제로는 서버 데이터/저장 API와 연결해야 한다(체크리스트 참고).
  const [activeProfileId, setActiveProfileId] = useState(primaryProfile.id);
  const [selectedAvatarId, setSelectedAvatarId] = useState(
    avatarOptions[0]?.id ?? "",
  );
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);

  const selectedAvatarSrc =
    avatarOptions.find((option) => option.id === selectedAvatarId)?.src ??
    primaryProfile.avatarSrc;

  return (
    <div
      className={[
        "min-h-screen w-full bg-bg-brandGrayish-normal",
        SCREEN_BOTTOM_PADDING_CLASS,
      ].join(" ")}
    >
      <Header
        type="normal"
        variant="blur"
        bold
        back
        titleValue={`${primaryProfile.name} 어르신`}
        onBack={() => navigate(-1)}
        showUser
        userBadge
        showCart
        cartCount={1}
        onUserClick={() => {
          // TODO(dev): 마이페이지로 이동
        }}
        onCartClick={() => {
          // TODO(dev): 장바구니로 이동(cartCount도 API 값으로)
        }}
      />

      <ProfileListTabs
        profiles={profiles}
        activeId={activeProfileId}
        onSelect={setActiveProfileId}
        onAddClick={() => {
          // TODO(dev): 어르신 프로필 추가 화면으로 이동
        }}
      />

      <div className="flex w-full flex-col items-start gap-(--sz-16) px-(--sz-20) pb-(--sz-50)">
        <LtcProfileSummaryCard
          name={primaryProfile.name}
          avatarSrc={selectedAvatarSrc}
          gradeText={summary.gradeText}
          remainingAmount={summary.remainingAmount}
          validUntilText={summary.validUntilText}
          onEditAvatarClick={() => setAvatarSheetOpen(true)}
          onDetailClick={() => {
            // TODO(dev): 어르신 상세 정보 화면으로 이동
          }}
        />

        {/* 진입 애니메이션 중 가로 스크롤바 방지용 클리핑 — 경계를 화면 컬럼 끝으로 두려고 좌우 여백만큼 넓힌다. */}
        <div className="-mx-(--sz-20) flex flex-col items-start gap-(--sz-8) self-stretch overflow-x-clip px-(--sz-20)">
          {alarms.map((alarm, index) => (
            <LtcAlarmCard
              key={alarm.id}
              icon={alarm.icon}
              tone={alarm.tone}
              title={alarm.title}
              description={renderAlarmDescription(alarm)}
              actionLabel={alarm.actionLabel}
              onActionClick={
                alarm.actionLabel
                  ? () => {
                      // TODO(dev): 알림별 액션(alarm.id) — 정보 제출 폼 / 등급 갱신 신청 등
                    }
                  : undefined
              }
              enterDelayMs={index * ALARM_CARD_STAGGER_MS}
            />
          ))}
        </div>

        <div className="flex w-full flex-col items-start gap-(--sz-16) overflow-clip rounded-2xl border-[length:var(--border-width-xs)] border-border-brandGrayish-bright bg-bg-neutral-normal pb-(--sz-20)">
          <div className="flex w-full items-center justify-center bg-[linear-gradient(to_right,var(--color-bg-brand-bright),var(--color-bg-info-bright))] px-(--sz-12) py-(--sz-10)">
            {/* 실서비스는 동전 Lottie 애니메이션(Figma 주석) — 파일 미전달로 정지 이미지 사용. */}
            <div className="flex min-w-0 items-center gap-(--sz-6)">
              <img
                src={coinImg}
                alt=""
                aria-hidden
                className="size-(--sz-18) shrink-0 object-contain"
              />
              <p className="min-w-0 text-body-5 text-typo-neutral-subtle">
                스토어에서{" "}
                <strong className="font-bold text-typo-brand-normal">
                  잔여 지원금
                </strong>
                을 사용해 보세요!
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-(--sz-20)">
            <div className="flex w-full flex-col items-start">
              <div className="flex w-full items-center justify-between gap-(--sz-16) px-(--sz-20) py-(--sz-4)">
                <p className="text-title-1 text-typo-neutral-normal">
                  구매/대여 가능한
                  <br />
                  복지용구
                </p>
                <ButtonWithLabel
                  color="info"
                  variant="bright"
                  size="xs"
                  startIcon={<Icon name="info_circle_solid" size={14} />}
                  onClick={() => {
                    // TODO(dev): "복지용구 품목 안내" 바텀시트 — Figma 시안 확인 필요
                  }}
                >
                  안내
                </ButtonWithLabel>
              </div>
              <p className="w-full px-(--sz-20) text-body-4 text-typo-neutral-light">
                구매/대여 가능 개수가 0개인 품목은
                <br />
                일반가로만 구매할 수 있어요.
              </p>
            </div>

            <div className="flex w-full flex-col items-start gap-(--sz-8)">
              <SectionTitle title="구매하기" typo="title3" />
              <div className="grid w-full grid-cols-3 gap-(--sz-6) px-(--sz-16)">
                {purchaseItems.map((item) => (
                  <WelfareItemButton
                    key={item.id}
                    label={item.label}
                    iconSrc={item.iconSrc}
                    count={`${item.availableCount}개`}
                    // TODO(dev): 스토어의 해당 품목 목록으로 이동(item.id) — 지금은 메인으로만 이동
                    onClick={() => navigate("/screens/main")}
                  />
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col items-start gap-(--sz-8)">
              <SectionTitle title="대여하기" typo="title3" />
              <div className="grid w-full grid-cols-3 gap-(--sz-6) px-(--sz-20)">
                {rentalItems.map((item) => (
                  <WelfareItemButton
                    key={item.id}
                    label={item.label}
                    iconSrc={item.iconSrc}
                    count={`${item.availableCount}개`}
                    onClick={() => {
                      // TODO(dev): "복지용구 품목 안내" 바텀시트(item.id) — Figma 시안 확인 필요
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-start px-(--sz-20)">
            <FooterAccordion title="꼭 확인하세요!" defaultExpanded>
              <div className="flex w-full flex-col items-start gap-(--sz-8)">
                {notices.map((notice) => (
                  <BulletItem
                    key={notice}
                    title={false}
                    contentsText={notice}
                  />
                ))}
              </div>
            </FooterAccordion>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            // TODO(dev): 카카오 알림톡 수신 동의 플로우
          }}
          className="flex w-full items-center gap-(--sz-10) rounded-2xl border-[length:var(--border-width-xs)] border-border-brandGrayish-light bg-bg-neutral-normal px-(--sz-18) py-(--sz-16) text-left shadow-greenGray-xl transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none"
        >
          <img
            src={kakaotalkAlarmImg}
            alt=""
            aria-hidden
            className="size-(--sz-36) shrink-0 object-contain"
          />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-(--sz-2)">
            <span className="w-full text-body-3-bold text-typo-neutral-normal">
              어르신 복지혜택 알림받기
            </span>
            <span className="w-full text-label-2 text-typo-neutral-light">
              놓치지 않게 카카오톡으로 알려드려요
            </span>
          </span>
          <Icon
            name="chevron_right_line"
            size={20}
            className="shrink-0 text-icon-neutral-bright"
          />
        </button>

        <div className="flex w-full flex-col items-start gap-(--sz-20) rounded-2xl border-[length:var(--border-width-xs)] border-border-brandGrayish-bright bg-bg-neutral-normal py-(--sz-20)">
          <p className="w-full px-(--sz-20) text-title-1 text-typo-neutral-normal">
            {primaryProfile.name}님이 받을 수 있는
            <br />
            혜택이에요
          </p>
          {benefits.map((benefit, index) => (
            <BenefitSection
              key={benefit.id}
              index={index + 1}
              {...benefit}
              onServiceClick={() => {
                // TODO(dev): 시설찾기 화면으로 이동(서비스 종류로 필터)
              }}
            />
          ))}
        </div>

        <div className="flex w-full items-start justify-end">
          <ButtonWithLabel
            color="neutral"
            variant="outline"
            size="sm"
            startIcon={<Icon name="trash_03_line" size={14} />}
            onClick={() => {
              // TODO(dev): 삭제 확인 다이얼로그 → 삭제 API → 페이지 유지(Figma 주석)
            }}
          >
            어르신 프로필 삭제
          </ButtonWithLabel>
        </div>
      </div>

      <FloatingLayer>
        <TopButton
          showAfter={20}
          className={["pointer-events-auto", TOP_BUTTON_POSITION_CLASS].join(
            " ",
          )}
        />
        <button
          type="button"
          aria-label={`${primaryProfile.name}님 전용 상담사와 상담하기`}
          onClick={() => {
            // TODO(dev): 전용 상담사 채팅/전화 연결
          }}
          className={[
            "pointer-events-auto fixed flex items-center gap-(--sz-10)",
            "rounded-2xl border-[length:var(--border-width-xs)] border-border-brandGrayish-light",
            "bg-bg-neutral-normal px-(--sz-16) py-(--sz-14) text-left shadow-greenGray-xl",
            "transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none",
            CONSULTANT_BUTTON_POSITION_CLASS,
          ].join(" ")}
        >
          <img
            src={consultantCharacterImg}
            alt=""
            aria-hidden
            className="size-(--sz-34) shrink-0 object-cover"
          />
          <span className="flex min-w-0 flex-1 flex-col items-start gap-(--sz-2)">
            <span className="w-full text-label-2 text-typo-neutral-light">
              궁금한게 있으신가요?
            </span>
            <span className="w-full truncate text-body-4-bold text-typo-neutral-normal">
              {primaryProfile.name}님 전용 상담사 대기중
            </span>
          </span>
          <Icon
            name="chevron_right_line"
            size={20}
            className="shrink-0 text-icon-neutral-bright"
          />
        </button>
      </FloatingLayer>

      <AvatarPickerBottomSheet
        open={avatarSheetOpen}
        onClose={() => setAvatarSheetOpen(false)}
        options={avatarOptions}
        selectedId={selectedAvatarId}
        onSelect={setSelectedAvatarId}
        onConfirm={() => {
          // TODO(dev): 선택한 아바타 저장 API
          setAvatarSheetOpen(false);
        }}
      />

      <BottomNavigation
        active="profile"
        userName={primaryProfile.name}
        userAvatarSrc={primaryProfile.avatarSrc}
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-(--layout-viewport-max)"
        onNavigate={handleBottomNavigate}
      />
    </div>
  );
}
