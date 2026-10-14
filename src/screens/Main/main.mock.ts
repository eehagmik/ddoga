/**
 * 메인 화면 더미 데이터 + 타입.
 *
 * 화면(`Main.tsx`)은 이 파일의 값만 받아 그린다 — API 연동 시 이 파일의 export를
 * 실제 응답으로 교체하면 된다. 상품·가격·별점은 운영 사이트(ddoga.co.kr)의 실제
 * 값을 옮겨온 예시이고, 이미지는 로컬 자산이다(API 연동 시 이미지 URL로 교체).
 */

import type { ProductCardProps } from "../_localComponents/ProductCard/ProductCard";
import type { StoreCardProps } from "../_localComponents/StoreCard/StoreCard";

import avatarFemalePink from "../../assets/images/avatar/Person=female_pink.svg";
import storeCtgAllIcon from "../../assets/images/store_ctg_all.svg";
import bannerFilialGiftImg from "../../assets/images/main/banner-filial-gift-event.png";
import bannerMonthlyCareImg from "../../assets/images/main/banner-monthly-care-supplies.png";
import bannerSituationPackageImg from "../../assets/images/main/banner-situation-package.png";
import eventRealtimePopularImg from "../../assets/images/main/event-realtime-popular.png";
import eventBestsellerImg from "../../assets/images/main/event-bestseller.png";
import eventPremiumMembershipImg from "../../assets/images/main/event-premium-membership.png";
import categoryWalkAidImg from "../../assets/images/main/category-walk-aid.png";
import categoryBathHygieneImg from "../../assets/images/main/category-bath-hygiene.png";
import categoryBedCareImg from "../../assets/images/main/category-bed-care.png";
import categoryPressureSoreImg from "../../assets/images/main/category-pressure-sore.png";
import categoryMealAidImg from "../../assets/images/main/category-meal-aid.png";
import categoryCareAidImg from "../../assets/images/main/category-care-aid.png";
import categoryHealthCareImg from "../../assets/images/main/category-health-care.png";
import popular01Img from "../../assets/images/main/popular-01-incontinence-pants-active.jpg";
import popular02Img from "../../assets/images/main/popular-02-wheelchair-mirage7.jpg";
import popular03Img from "../../assets/images/main/popular-03-cane-aion.jpg";
import popular04Img from "../../assets/images/main/popular-04-incontinence-pants-fm700.jpg";
import popular05Img from "../../assets/images/main/popular-05-incontinence-pants-swp01.jpg";
import popular06Img from "../../assets/images/main/popular-06-antislip-socks-wipoot.jpg";
import popular07Img from "../../assets/images/main/popular-07-antislip-socks-neo10.jpg";
import popular08Img from "../../assets/images/main/popular-08-bath-chair.jpg";
import popular09Img from "../../assets/images/main/popular-09-portable-toilet.jpg";
import popular10Img from "../../assets/images/main/popular-10-safety-handle.jpg";
import bestseller01Img from "../../assets/images/main/display-bestseller-01-walker-hm606.png";
import bestseller02Img from "../../assets/images/main/display-bestseller-02-cane-bs.png";
import bestseller03Img from "../../assets/images/main/display-bestseller-03-cane-el40s.jpg";
import bestseller04Img from "../../assets/images/main/display-bestseller-04-walker-skb101w.jpg";
import lowest01Img from "../../assets/images/main/display-lowest-01-walker-das01.jpg";
import lowest02Img from "../../assets/images/main/display-lowest-02-walker-f218.png";
import lowest03Img from "../../assets/images/main/display-lowest-03-wheelchair-mirage22dp.jpg";
import lowest04Img from "../../assets/images/main/display-lowest-04-mattress-hg100.jpg";

// ─── 타입 ────────────────────────────────────────────────────────────────

/** 로그인 사용자 + 대표 어르신 프로필 요약(상단 Profile 바·하단 탭바에 표시). */
export interface MainUser {
  name: string;
  avatarSrc: string;
  /** 등급·본인부담률 강조 텍스트(주황). 예: "일반 15%" */
  gradeText: string;
  /** 등급 뒤 보조 텍스트. 예: "· 입소중" */
  statusText: string;
  /** 잔여 지원금(숫자 문자열, "원"은 컴포넌트가 붙임). */
  remainingPoint: string;
  cartCount: number;
}

export interface MainBanner {
  id: string;
  imageSrc: string;
  /** 이미지 안에 들어간 문구 — 스크린리더용 대체 텍스트. */
  alt: string;
}

/** 카테고리 바로가기. 타일 배경색은 `id` 기준으로 화면에서 매핑한다(`Main.tsx`). */
export interface MainCategory {
  id: string;
  label: string;
  iconSrc: string;
}

export interface MainStoreEvent {
  id: string;
  /** `\n`으로 줄바꿈 위치 지정. */
  title: string;
  iconSrc: string;
}

/** "실시간 인기 상품" 카드 1개 = `StoreCard`(vertical/minimum) props + id. */
export type MainPopularProduct = Pick<
  StoreCardProps,
  | "category"
  | "name"
  | "thumbnailSrc"
  | "originalPrice"
  | "discountPercent"
  | "price"
  | "badges"
  | "rating"
> & { id: string; rank: number };

/** "베스트셀러/최저가" 카드 1개 = `ProductCard` props + id. `rating` 생략 = 리뷰 0건(평점 줄 미노출). */
export type MainDisplayProduct = Pick<
  ProductCardProps,
  | "category"
  | "name"
  | "thumbnailSrc"
  | "originalPrice"
  | "discountPercent"
  | "price"
  | "badges"
  | "rating"
> & { id: string };

export interface MainCustomerCenter {
  phone: string;
  hours: string;
}

// ─── 더미 데이터 ─────────────────────────────────────────────────────────

// TODO(dev): 로그인 사용자/대표 어르신 프로필 API로 교체
export const MAIN_USER: MainUser = {
  name: "김또가",
  avatarSrc: avatarFemalePink,
  gradeText: "일반 15%",
  statusText: "· 입소중",
  remainingPoint: "1,600,000",
  cartCount: 1,
};

// TODO(dev): 메인 배너 API로 교체
export const MAIN_BANNERS: MainBanner[] = [
  {
    id: "filial-gift",
    imageSrc: bannerFilialGiftImg,
    alt: "명절엔 부모님에게 안전을 선물 — 효도 선물 기획전",
  },
  {
    id: "monthly-care",
    imageSrc: bannerMonthlyCareImg,
    alt: "매달 사용하는 요양용품 — 용량은 더 많이, 가격은 더 싸게",
  },
  {
    id: "situation-package",
    imageSrc: bannerSituationPackageImg,
    alt: "뭐부터 준비할지 모르겠다면? 상황별 추천 패키지 기획전 보러가기",
  },
];

// TODO(dev): 카테고리 목록 API로 교체(새 카테고리 추가 시 Main.tsx의 타일 배경색 매핑도 확인)
export const MAIN_CATEGORIES: MainCategory[] = [
  { id: "all", label: "카테고리", iconSrc: storeCtgAllIcon },
  { id: "walk-aid", label: "보행보조", iconSrc: categoryWalkAidImg },
  { id: "bath-hygiene", label: "목욕위생", iconSrc: categoryBathHygieneImg },
  { id: "bed-care", label: "침상케어", iconSrc: categoryBedCareImg },
  { id: "pressure-sore", label: "욕창예방", iconSrc: categoryPressureSoreImg },
  { id: "meal-aid", label: "식사보조", iconSrc: categoryMealAidImg },
  { id: "care-aid", label: "케어보조", iconSrc: categoryCareAidImg },
  { id: "health-care", label: "건강관리", iconSrc: categoryHealthCareImg },
];

// TODO(dev): 실시간 인기 상품 API로 교체(순위 = rank)
export const MAIN_POPULAR_PRODUCTS: MainPopularProduct[] = [
  {
    id: "popular-1",
    rank: 1,
    category: "요실금팬티",
    name: "요실금팬티 액티데일리110 200cc",
    thumbnailSrc: popular01Img,
    originalPrice: "34,900원",
    discountPercent: "85%",
    price: "5,230원",
    badges: ["무료배송"],
    rating: { score: "4.8", count: "(18)" },
  },
  {
    id: "popular-2",
    rank: 2,
    category: "수동휠체어",
    name: "[대여 3개월] 수동휠체어 MIRAGE-7(22D)-B",
    thumbnailSrc: popular02Img,
    originalPrice: "102,900원",
    discountPercent: "85%",
    price: "15,430원",
    badges: ["무료배송"],
    rating: { score: "4.8", count: "(36)" },
  },
  {
    id: "popular-3",
    rank: 3,
    category: "지팡이",
    name: "지팡이 아이온 사발 카본 경량형",
    thumbnailSrc: popular03Img,
    originalPrice: "61,500원",
    discountPercent: "85%",
    price: "9,220원",
    badges: ["무료배송"],
    rating: { score: "4.9", count: "(9)" },
  },
  {
    id: "popular-4",
    rank: 4,
    category: "요실금팬티",
    name: "요실금팬티 FM700 50cc",
    thumbnailSrc: popular04Img,
    originalPrice: "31,000원",
    discountPercent: "85%",
    price: "4,650원",
    badges: ["무료배송"],
    rating: { score: "5.0", count: "(9)" },
  },
  {
    id: "popular-5",
    rank: 5,
    category: "요실금팬티",
    name: "요실금팬티 SWP-01 50cc",
    thumbnailSrc: popular05Img,
    originalPrice: "30,400원",
    discountPercent: "85%",
    price: "4,560원",
    badges: ["무료배송"],
    rating: { score: "5.0", count: "(1)" },
  },
  {
    id: "popular-6",
    rank: 6,
    category: "미끄럼방지양말",
    name: "미끄럼방지양말 위풋 논슬립 돌돌이 양말 양면",
    thumbnailSrc: popular06Img,
    originalPrice: "6,500원",
    discountPercent: "85%",
    price: "970원",
    badges: ["무료배송"],
    rating: { score: "4.7", count: "(39)" },
  },
  {
    id: "popular-7",
    rank: 7,
    category: "미끄럼방지양말",
    name: "미끄럼방지양말 NEO-10",
    thumbnailSrc: popular07Img,
    originalPrice: "3,100원",
    discountPercent: "85%",
    price: "460원",
    badges: ["무료배송"],
    rating: { score: "4.7", count: "(118)" },
  },
  {
    id: "popular-8",
    rank: 8,
    category: "목욕의자",
    name: "목욕의자 PN-L4152101D",
    thumbnailSrc: popular08Img,
    originalPrice: "187,000원",
    discountPercent: "85%",
    price: "28,050원",
    badges: ["무료배송"],
    rating: { score: "4.9", count: "(19)" },
  },
  {
    id: "popular-9",
    rank: 9,
    category: "이동변기",
    name: "이동변기 APT-210",
    thumbnailSrc: popular09Img,
    originalPrice: "198,000원",
    discountPercent: "85%",
    price: "29,700원",
    badges: ["무료배송"],
    rating: { score: "5.0", count: "(7)" },
  },
  {
    id: "popular-10",
    rank: 10,
    category: "안전손잡이",
    name: "안전손잡이 DGP-0002 거치형",
    thumbnailSrc: popular10Img,
    originalPrice: "158,000원",
    discountPercent: "85%",
    price: "23,700원",
    badges: ["무료배송"],
    rating: { score: "4.6", count: "(5)" },
  },
];

// TODO(dev): 기획전 목록 API로 교체
export const MAIN_STORE_EVENTS: MainStoreEvent[] = [
  {
    id: "realtime-popular",
    title: "실시간\n인기상품",
    iconSrc: eventRealtimePopularImg,
  },
  {
    id: "bestseller",
    title: "믿고사는\n베스트셀러",
    iconSrc: eventBestsellerImg,
  },
  {
    id: "premium-membership",
    title: "프리미엄\n회원전용관",
    iconSrc: eventPremiumMembershipImg,
  },
];

// TODO(dev): "베스트셀러" 진열 상품 API로 교체
export const MAIN_BESTSELLER_PRODUCTS: MainDisplayProduct[] = [
  {
    id: "bestseller-1",
    category: "성인용보행기",
    name: "성인용보행기 HM-606",
    thumbnailSrc: bestseller01Img,
    originalPrice: "54,800원",
    discountPercent: "85%",
    price: "8,220원",
    badges: ["무료배송"],
    rating: { score: "4.8", count: "(164)" },
  },
  {
    id: "bestseller-2",
    category: "지팡이",
    name: "지팡이 BS 2중 카본 경량형",
    thumbnailSrc: bestseller02Img,
    originalPrice: "61,500원",
    discountPercent: "85%",
    price: "9,220원",
    badges: ["무료배송"],
    rating: { score: "4.9", count: "(78)" },
  },
  {
    id: "bestseller-3",
    category: "지팡이",
    name: "지팡이 EL-40S 카본 경량형",
    thumbnailSrc: bestseller03Img,
    originalPrice: "50,600원",
    discountPercent: "85%",
    price: "7,590원",
    badges: ["무료배송"],
    rating: { score: "4.8", count: "(55)" },
  },
  {
    id: "bestseller-4",
    category: "성인용보행기",
    name: "성인용보행기 SKB-101W",
    thumbnailSrc: bestseller04Img,
    originalPrice: "239,000원",
    discountPercent: "85%",
    price: "35,850원",
    badges: ["무료배송"],
    rating: { score: "4.7", count: "(25)" },
  },
];

// TODO(dev): "최저가" 진열 상품 API로 교체(할인 없는 상품은 originalPrice 생략 + discountPercent "0%")
export const MAIN_LOWEST_PRICE_PRODUCTS: MainDisplayProduct[] = [
  {
    id: "lowest-1",
    category: "성인용보행기",
    name: "[프로모션]성인용보행기 DAS-01",
    thumbnailSrc: lowest01Img,
    originalPrice: "126,000원",
    discountPercent: "30%",
    price: "88,200원",
    badges: ["무료배송"],
    rating: { score: "5.0", count: "(2)" },
  },
  {
    id: "lowest-2",
    category: "성인용보행기",
    name: "성인용보행기 F-218 (엘로우체크)",
    thumbnailSrc: lowest02Img,
    originalPrice: "180,000원",
    discountPercent: "9%",
    price: "163,000원",
    badges: ["무료배송"],
  },
  {
    id: "lowest-3",
    category: "수동휠체어",
    name: "수동휠체어 MIRAGE22D-P",
    thumbnailSrc: lowest03Img,
    discountPercent: "0%",
    price: "615,000원",
    badges: ["무료배송"],
  },
  {
    id: "lowest-4",
    category: "욕창예방매트리스",
    name: "욕창예방매트리스 HG-100 M1",
    thumbnailSrc: lowest04Img,
    originalPrice: "130,000원",
    discountPercent: "7%",
    price: "120,000원",
    badges: ["무료배송"],
    rating: { score: "4.5", count: "(2)" },
  },
];

// TODO(dev): 고객센터 정보(운영 설정값)로 교체
export const MAIN_CUSTOMER_CENTER: MainCustomerCenter = {
  phone: "02-782-9840",
  hours: "평일 10:00~17:00",
};
