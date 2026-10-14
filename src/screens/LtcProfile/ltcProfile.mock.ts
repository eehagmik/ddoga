/**
 * "김또가 어르신"(LtcProfile) 화면 더미 데이터 + 타입.
 *
 * 화면(`LtcProfile.tsx`)은 이 파일의 값만 받아 그린다 — API 연동 시 이 파일의 export를
 * 실제 응답으로 교체하면 된다. 문구 안의 `\n`은 Figma의 줄바꿈 위치다.
 */

import type { IconName } from "../../icons";
import type { AvatarPickerOption } from "../_localComponents/AvatarPickerBottomSheet";
import type { LtcAlarmCardTone } from "../_localComponents/LtcAlarmCard";

import avatarFemalePink from "../../assets/images/avatar/Person=female_pink.svg";
import avatarMaleGreen from "../../assets/images/avatar/Person=male_green.svg";
import avatarFemalePurple from "../../assets/images/avatar/Person=female_purple.svg";
import avatarFemaleYellow from "../../assets/images/avatar/Person=female_yellow.svg";
import avatarFemaleOrange from "../../assets/images/avatar/Person=female_orange.svg";
import welfareToilet from "../../assets/images/ltc-profile/welfare-toilet.png";
import welfarePostureIn from "../../assets/images/ltc-profile/welfare-posture-in.png";
import welfareBathchair from "../../assets/images/ltc-profile/welfare-bathchair.png";
import welfareNonslipmat from "../../assets/images/ltc-profile/welfare-nonslipmat.png";
import welfareNonslipsocks from "../../assets/images/ltc-profile/welfare-nonslipsocks.png";
import welfareWalker from "../../assets/images/ltc-profile/welfare-walker.png";
import welfareHandle from "../../assets/images/ltc-profile/welfare-handle.png";
import welfareAntidecubitusmatt from "../../assets/images/ltc-profile/welfare-antidecubitusmatt.png";
import welfareAntidecubituscushion from "../../assets/images/ltc-profile/welfare-antidecubituscushion.png";
import welfareIncontinencepanties from "../../assets/images/ltc-profile/welfare-incontinencepanties.png";
import welfarePortablechair from "../../assets/images/ltc-profile/welfare-portablechair.png";
import welfarePositioningdevice from "../../assets/images/ltc-profile/welfare-positioningdevice.png";
import welfareWalkingstick from "../../assets/images/ltc-profile/welfare-walkingstick.png";
import welfareWheelchair from "../../assets/images/ltc-profile/welfare-wheelchair.png";
import welfareElectricbed from "../../assets/images/ltc-profile/welfare-electricbed.png";
import ltchVisit from "../../assets/images/ltc-profile/ltch-visit.png";
import ltchNight from "../../assets/images/ltc-profile/ltch-night.png";
import ltchNursing from "../../assets/images/ltc-profile/ltch-nursing.png";
import ltchBath from "../../assets/images/ltc-profile/ltch-bath.png";
import ltchSanatorium from "../../assets/images/ltc-profile/ltch-sanatorium.png";

// ─── 타입 ────────────────────────────────────────────────────────────────

/** 한 계정에 등록된 어르신 프로필(상단 가로 pill 목록). */
export interface LtcElderProfile {
  id: string;
  name: string;
  avatarSrc: string;
}

/** 선택된 어르신의 요약 카드 정보. */
export interface LtcElderSummary {
  /** 등급·본인부담률 뱃지. 예: "일반 15%" */
  gradeText: string;
  /** 연 잔여 지원금(숫자 문자열, "원"은 컴포넌트가 붙임). */
  remainingAmount: string;
  /** 지원금 유효기간 안내. 예: "~27.12.31까지" */
  validUntilText: string;
}

/** "어르신 정보 알림" 카드. 노출 조건(만료 90~30일 전 등)은 서버/화면 로직에서 판단. */
export interface LtcAlarm {
  id: string;
  icon: IconName;
  tone: LtcAlarmCardTone;
  title: string;
  /** 본문. `\n` = 줄바꿈. */
  description: string;
  /** 본문 중 굵게 강조할 부분(예: 마감일). 본문에 같은 문자열이 그대로 들어 있어야 한다. */
  highlight?: string;
  /** 하단 버튼 문구. 생략하면 버튼 없음. */
  actionLabel?: string;
}

/** 구매/대여 가능 복지용구 품목 1개. */
export interface LtcWelfareItem {
  id: string;
  label: string;
  iconSrc: string;
  /** 남은 구매/대여 가능 개수. 0이면 일반가로만 구매 가능. */
  availableCount: number;
}

/** 재가서비스·요양원 찾기 링크 카드. */
export interface LtcCareService {
  id: string;
  title: string;
  /** `\n` = 줄바꿈. */
  description: string;
  iconSrc: string;
}

/** "받을 수 있는 혜택" 섹션 한 덩어리(번호 + 제목 + 금액 박스 + 서비스 목록). */
export interface LtcBenefit {
  id: string;
  title: string;
  description: string;
  amountLabel: string;
  /** 숫자 문자열(콤마 포함, "원"은 컴포넌트가 붙임). */
  amount: string;
  /** 금액 아래 작은 기준 문구. 예: "*26년 2등급 기준" */
  amountNote?: string;
  footnote: string;
  /** 서비스 목록 위 소제목. 생략 가능. `\n` = 줄바꿈. */
  servicesHeading?: string;
  services: LtcCareService[];
}

// ─── 더미 데이터 ─────────────────────────────────────────────────────────

// TODO(dev): 계정에 등록된 어르신 프로필 목록 API로 교체(첫 번째 = 기본 선택)
export const LTC_PROFILES: LtcElderProfile[] = [
  { id: "kim", name: "김또가", avatarSrc: avatarFemalePink },
  { id: "choi", name: "최미나수", avatarSrc: avatarMaleGreen },
  { id: "oh", name: "OH ALICIA SUNJUNG", avatarSrc: avatarFemalePurple },
];

// TODO(dev): 선택한 어르신의 등급/지원금 API로 교체(프로필 탭 전환 시 다시 조회)
export const LTC_SUMMARY: LtcElderSummary = {
  gradeText: "일반 15%",
  remainingAmount: "1,600,000",
  validUntilText: "~YY.MM.DD까지",
};

/** "성별 이미지" 바텀시트의 아바타 선택지(고정 일러스트 4종). */
export const LTC_AVATAR_OPTIONS: AvatarPickerOption[] = [
  { id: "pink", label: "분홍 일러스트", src: avatarFemalePink },
  { id: "yellow", label: "노랑 일러스트", src: avatarFemaleYellow },
  { id: "orange", label: "주황 일러스트", src: avatarFemaleOrange },
  { id: "purple", label: "보라 일러스트", src: avatarFemalePurple },
];

// TODO(dev): 어르신 상태 기반 알림 API로 교체(카드 순서 = 배열 순서, 등장 애니메이션도 이 순서)
export const LTC_ALARMS: LtcAlarm[] = [
  {
    id: "basic-recipient",
    icon: "bell_01_solid",
    tone: "neutral",
    title: "기초수급자 정보 제출",
    description:
      "복지용구 구매를 원하신다면 장기요양인정 시 수령하신 복지용구 급여확인서, 장기요양인정서, 개인별장기요양이용계획서 첨부 및 주민등록지를 입력해 주세요.",
    actionLabel: "정보 제출하기",
  },
  {
    id: "grade-renewal",
    icon: "alert_circle_solid",
    tone: "warning",
    title: "요양등급 갱신 신청이 필요해요",
    description:
      "유효기간 만료가 다가오고 있어요!\n27.12.31까지 반드시 갱신 신청해 주세요.",
    highlight: "27.12.31까지",
    actionLabel: "갱신 신청하기",
  },
  {
    id: "nursing-home",
    icon: "alert_triangle_solid",
    tone: "danger",
    title: "요양원 입소 중에는 지원금을 사용할 수 없어요",
    description: "퇴소 후 가정으로 복귀할 때 구매지원이 가능해요.",
  },
];

// TODO(dev): 구매 가능 복지용구 품목/잔여 개수 API로 교체
export const LTC_PURCHASE_ITEMS: LtcWelfareItem[] = [
  {
    id: "toilet",
    label: "간이변기",
    iconSrc: welfareToilet,
    availableCount: 0,
  },
  {
    id: "ramp",
    label: "경사로(실내용)",
    iconSrc: welfarePostureIn,
    availableCount: 0,
  },
  {
    id: "bath-chair",
    label: "목욕의자",
    iconSrc: welfareBathchair,
    availableCount: 0,
  },
  {
    id: "nonslip-mat",
    label: "미끄럼방지매트",
    iconSrc: welfareNonslipmat,
    availableCount: 0,
  },
  {
    id: "nonslip-socks",
    label: "미끄럼방지양말",
    iconSrc: welfareNonslipsocks,
    availableCount: 0,
  },
  {
    id: "walker",
    label: "성인용보행기",
    iconSrc: welfareWalker,
    availableCount: 0,
  },
  {
    id: "handle",
    label: "안전손잡이",
    iconSrc: welfareHandle,
    availableCount: 0,
  },
  {
    id: "antidecubitus-mattress",
    label: "욕창예방매트리스",
    iconSrc: welfareAntidecubitusmatt,
    availableCount: 0,
  },
  {
    id: "antidecubitus-cushion",
    label: "욕창예방방석",
    iconSrc: welfareAntidecubituscushion,
    availableCount: 0,
  },
  {
    id: "incontinence-panties",
    label: "요실금팬티",
    iconSrc: welfareIncontinencepanties,
    availableCount: 0,
  },
  {
    id: "portable-toilet",
    label: "이동변기",
    iconSrc: welfarePortablechair,
    availableCount: 0,
  },
  {
    id: "positioning-device",
    label: "자세변환용구",
    iconSrc: welfarePositioningdevice,
    availableCount: 0,
  },
  {
    id: "walking-stick",
    label: "지팡이",
    iconSrc: welfareWalkingstick,
    availableCount: 0,
  },
];

// TODO(dev): 대여 가능 복지용구 품목/잔여 개수 API로 교체
export const LTC_RENTAL_ITEMS: LtcWelfareItem[] = [
  {
    id: "wheelchair",
    label: "수동휠체어",
    iconSrc: welfareWheelchair,
    availableCount: 0,
  },
  {
    id: "electric-bed",
    label: "전동침대",
    iconSrc: welfareElectricbed,
    availableCount: 0,
  },
];

// TODO(dev): 운영 공지(CMS)로 관리할지 확인 — 지금은 정적 문구
export const LTC_WELFARE_NOTICES: string[] = [
  "요양원 입소 시에는 복지용구 구매/대여가 모두 불가해요. 입소 전에 필요한 품목을 꼭 구비해 두세요!",
  "요양병원 입원 시에 전동침대는 대여할 수 없어요.",
  "복지용구 주문 시 구매 가능 품목이 아니거나 본인부담률이 상이한 경우, 주문이 취소될 수 있어요.",
  "현재 안내되는 복지용구 품목 및 수량은 장기요양수급자 전용 정보예요. 장애인 보장구의 경우 품목과 기준이 다르므로, 자세한 내용은 국민건강보험공단(1577-1000)을 통해 확인해 주세요.",
];

// TODO(dev): 등급별 한도액/본인부담금 API로 교체(금액은 등급·연도에 따라 달라짐)
export const LTC_BENEFITS: LtcBenefit[] = [
  {
    id: "home-care",
    title: "재가서비스",
    description:
      "재가서비스는 집에 계시는 어르신에게 제공하는 장기요양 서비스를 말해요.",
    amountLabel: "월 한도액",
    amount: "1,600,000",
    footnote:
      "월 한도액은 장기요양등급에 따라 달라져요. 만약 월 한도액을 초과할 경우 초과한 금액은 전액 수급자 본인이 부담하게 돼요.",
    servicesHeading: "어르신 상황에 맞는\n재가서비스를 찾아보세요",
    services: [
      {
        id: "visit-care",
        title: "방문요양 찾기",
        description:
          "어르신 댁에 요양보호사가 방문하여\n신체 · 가사활동을 지원해요",
        iconSrc: ltchVisit,
      },
      {
        id: "day-night-care",
        title: "주야간보호센터 찾기",
        description: "센터에서 하루 중 일정시간 동안\n어르신 돌봄을 제공해요",
        iconSrc: ltchNight,
      },
      {
        id: "visit-nursing",
        title: "방문간호 찾기",
        description: "어르신 댁에 간호사가 방문하여\n간호서비스 지원해요",
        iconSrc: ltchNursing,
      },
      {
        id: "visit-bath",
        title: "방문목욕 찾기",
        description: "어르신 댁에 방문하여\n목욕서비스를 제공해요",
        iconSrc: ltchBath,
      },
    ],
  },
  {
    id: "nursing-home",
    title: "요양원 입소 지원",
    description:
      "요양원 입소 비용은 장기요양등급 및 본인부담률에 따라 산정되기 때문에 대부분의 요양원 및 공동생활가정에서 동일해요.",
    amountLabel: "월 최대 본인부담금",
    amount: "1,600,000",
    amountNote: "*26년 2등급 기준",
    footnote:
      "비급여항목인 식재료비, 간식비, 상급침실사용료가 발생 시 비용이 차이가 날 수 있으니 시설별로 정확한 비용 확인이 필요해요.",
    services: [
      {
        id: "nursing-home",
        title: "요양원 찾기",
        description: "체계적인 시스템으로 전문적인 요양 서비스를 제공해요",
        iconSrc: ltchSanatorium,
      },
    ],
  },
];
