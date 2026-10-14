/**
 * Main — 앱 메인(스토어) 화면.
 *
 * Figma "메인"(node 30416:71106). 하단 탭바 "스토어" 탭의 화면이다.
 * 위에서부터 Header → 어르신 Profile 바 → 배너 → 카테고리 → 실시간 인기 상품 →
 * 또가 베스트 기획전 → 상품 진열(베스트셀러/최저가) → Footer 순서.
 *
 * 데이터는 전부 props로 받고, 생략하면 `main.mock.ts`의 더미 데이터를 쓴다.
 *
 * @example
 * <Main />                                   // 더미 데이터로 렌더
 * <Main user={me} popularProducts={popular} /> // API 데이터 주입
 *
 * ─── 개발자 할 일 체크리스트 ─────────────────────────────────────────────
 * - [ ] API 연결: `main.mock.ts`의 TODO(dev) 항목(사용자, 배너, 카테고리, 인기 상품,
 *       기획전, 베스트셀러/최저가, 고객센터)을 실제 응답으로 교체
 * - [ ] 클릭 이동: 이 파일의 `// TODO(dev):` 표시 핸들러(유저/장바구니, 프로필 더보기,
 *       카테고리, 더보기, 기획전, 상품 상세, 카카오/이메일 상담)
 * - [ ] 로딩/빈/에러 상태: Figma 시안이 없어 미구현. 목록이 비면 섹션을 숨길지,
 *       스켈레톤을 둘지 기획 확인 필요
 * - [ ] 하단 탭바 라우팅: `useBottomNavigation`의 placeholder 경로를 실제 화면으로 교체
 *
 * ─── 디자인 의도 (코드만 봐선 알기 어려운 것) ─────────────────────────────
 * - 스크롤해도 Header → Profile → "베스트셀러/최저가" 탭바가 위에서부터 차례로 상단에
 *   붙는다(sticky 3단). 탭바의 `top` 값 = Header 52 + Profile 54.
 * - "베스트셀러/최저가" 탭은 내용을 바꿔치는 탭이 아니라 같은 페이지 안 **스크롤 앵커**다.
 *   두 그리드는 항상 함께 보이고, 탭 클릭 = 해당 섹션으로 스크롤, 스크롤 위치에 따라
 *   선택 탭이 자동으로 바뀐다(`IntersectionObserver`).
 * - "실시간 인기 상품"은 가로 스와이프 캐러셀. 짧게 밀면 카드 1장씩, 길게 밀면 따라오다
 *   가장 가까운 카드에 멈춘다(`freeMode` + `sticky`). 트랙패드 가로 스크롤도 된다.
 * - 배너는 3장 이상이면 무한 루프 + 5초 자동 재생(`Swiper` 컴포넌트 기본 동작),
 *   우하단 "n/3" 카운터는 화면에서 따로 겹쳐 그린다.
 * - TopButton은 20px 넘게 스크롤하면 나타난다. 카카오 상담 버튼은 항상 떠 있다.
 */

import { useEffect, useRef, useState } from "react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper as SwiperReact, SwiperSlide } from "swiper/react";
import "swiper/css";

import { Icon } from "../../icons";
import { ChipIndicator } from "../../components/ui/ChipIndicator";
import { Divider } from "../../components/ui/Divider";
import { Header } from "../../components/ui/Header";
import { Swiper } from "../../components/ui/Swiper";
import { Tab } from "../../components/ui/Tab";
import { Tabs } from "../../components/ui/Tabs";
import { TopButton } from "../../components/ui/TopButton";
import { VerticalMenuButton } from "../../components/ui/VerticalMenuButton";
import { BottomNavigation } from "../_localComponents/BottomNavigation";
import { FloatingLayer } from "../_localComponents/FloatingLayer";
import { Footer } from "../_localComponents/Footer";
import { ProductGridSection } from "../_localComponents/ProductGridSection";
import { Profile } from "../_localComponents/Profile";
import { SectionTitle } from "../_localComponents/SectionTitle";
import { StoreCard } from "../_localComponents/StoreCard/StoreCard";
import { StoreEventCard } from "../_localComponents/StoreEventCard";
import { useBottomNavigation } from "../useBottomNavigation";
import {
  MAIN_BANNERS,
  MAIN_BESTSELLER_PRODUCTS,
  MAIN_CATEGORIES,
  MAIN_CUSTOMER_CENTER,
  MAIN_LOWEST_PRICE_PRODUCTS,
  MAIN_POPULAR_PRODUCTS,
  MAIN_STORE_EVENTS,
  MAIN_USER,
} from "./main.mock";
import type {
  MainBanner,
  MainCategory,
  MainCustomerCenter,
  MainDisplayProduct,
  MainPopularProduct,
  MainStoreEvent,
  MainUser,
} from "./main.mock";

// Tailwind는 소스에 "완전한 문자열"로 적힌 클래스만 만든다 — `${변수}`로 조립한
// 클래스는 CSS가 생성되지 않으니, 위치·여백 클래스는 아래처럼 통째로 적는다.

/** 플로팅 버튼 위치: 탭바(60) 위 12 띄운 자리에 카카오 상담, 그 위(28+8)에 TopButton. */
const KAKAO_BUTTON_BOTTOM_CLASS =
  "bottom-[calc(env(safe-area-inset-bottom,0px)+var(--sz-60)+var(--sz-12))]";
const TOP_BUTTON_BOTTOM_CLASS =
  "bottom-[calc(env(safe-area-inset-bottom,0px)+var(--sz-60)+var(--sz-12)+var(--sz-28)+var(--sz-8))]";

/** "베스트셀러/최저가" 탭바: Header(52) + Profile(54) 바로 아래에 붙는다. */
const PRODUCT_TABS_STICKY_CLASS =
  "sticky top-[calc(var(--sz-52)+var(--sz-54))] z-20";

/** 탭 클릭 시 섹션 제목이 sticky 3단(Header 52 + Profile 54 + 탭바 54)에 가리지 않게 하는 여백. */
const PRODUCT_SECTION_SCROLL_MARGIN_CLASS =
  "scroll-mt-[calc(var(--sz-52)+var(--sz-54)+var(--sz-54))]";
/** 위와 같은 값의 숫자 버전 — `IntersectionObserver`는 CSS 변수를 못 받는다(토큰 바뀌면 같이 수정). */
const PRODUCT_TABS_STICKY_STACK_HEIGHT_PX = 52 + 54 + 54;

/**
 * "실시간 인기 상품" 캐러셀 좌우 여백·카드 간격(px, `--sz-20`/`--sz-8`과 같은 값).
 * Swiper는 숫자만 받고, `swiper/css`가 Tailwind padding 클래스를 덮어써서 클래스로는 안 먹는다.
 */
const POPULAR_LIST_EDGE_GAP = 20;
const POPULAR_LIST_CARD_GAP = 8;

/**
 * 카테고리 아이콘 타일 배경색. Figma 값과 가장 가까운 primitive 토큰(장식용 1회성 색이라
 * 세만틱 토큰을 따로 만들지 않음). 목록에 없는 카테고리("카테고리 전체" 등)는 타일 없이 아이콘만.
 */
const CATEGORY_TILE_BG_CLASS: Record<string, string> = {
  "walk-aid": "bg-orange-10",
  "bath-hygiene": "bg-blue-60",
  "bed-care": "bg-purple-10",
  "pressure-sore": "bg-yellow-30",
  "meal-aid": "bg-green-gray-10",
  "care-aid": "bg-green-30",
  "health-care": "bg-red-30",
};

type ProductTabKey = "bestseller" | "lowest";

export interface MainProps {
  /** 로그인 사용자 + 대표 어르신 요약. */
  user?: MainUser;
  /** 상단 배너(3장 이상이면 자동 재생). */
  banners?: MainBanner[];
  /** 카테고리 바로가기(4열 그리드). */
  categories?: MainCategory[];
  /** 실시간 인기 상품(가로 캐러셀, `rank` 순). */
  popularProducts?: MainPopularProduct[];
  /** 또가 베스트 기획전 카드. */
  storeEvents?: MainStoreEvent[];
  /** 상품 진열 — 베스트셀러. */
  bestsellerProducts?: MainDisplayProduct[];
  /** 상품 진열 — 최저가. */
  lowestPriceProducts?: MainDisplayProduct[];
  /** Footer 고객센터 정보. */
  customerCenter?: MainCustomerCenter;
}

export function Main({
  user = MAIN_USER,
  banners = MAIN_BANNERS,
  categories = MAIN_CATEGORIES,
  popularProducts = MAIN_POPULAR_PRODUCTS,
  storeEvents = MAIN_STORE_EVENTS,
  bestsellerProducts = MAIN_BESTSELLER_PRODUCTS,
  lowestPriceProducts = MAIN_LOWEST_PRICE_PRODUCTS,
  customerCenter = MAIN_CUSTOMER_CENTER,
}: MainProps) {
  const handleBottomNavigate = useBottomNavigation("store");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [selectedProductTab, setSelectedProductTab] =
    useState<ProductTabKey>("bestseller");
  const bestsellerSectionRef = useRef<HTMLDivElement>(null);
  const lowestSectionRef = useRef<HTMLDivElement>(null);

  // 스크롤 스파이: sticky 3단 바로 아래 띠에 걸린 섹션의 탭을 선택 상태로 만든다.
  useEffect(() => {
    const sections: Array<[ProductTabKey, HTMLDivElement | null]> = [
      ["bestseller", bestsellerSectionRef.current],
      ["lowest", lowestSectionRef.current],
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const matched = sections.find(([, el]) => el === entry.target);
          if (matched) setSelectedProductTab(matched[0]);
        }
      },
      {
        rootMargin: `-${PRODUCT_TABS_STICKY_STACK_HEIGHT_PX}px 0px -70% 0px`,
        threshold: 0,
      },
    );
    for (const [, el] of sections) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-bg-neutral-normal pb-[calc(var(--sz-60)+var(--sz-20))]">
      <Header
        type="home"
        userBadge
        cartCount={user.cartCount}
        onUserClick={() => {
          // TODO(dev): 마이페이지로 이동
        }}
        onCartClick={() => {
          // TODO(dev): 장바구니로 이동
        }}
      />
      <Profile
        hasProfile
        isBeneficiary
        goToLtc
        name={user.name}
        avatarSrc={user.avatarSrc}
        percentText={user.gradeText}
        suffixText={user.statusText}
        point={user.remainingPoint}
        onMoreClick={() => {
          // TODO(dev): 어르신 상세(LtcProfile)로 이동할지 기획 확인
        }}
      />

      <div className="relative w-full">
        <Swiper
          variant="sharp"
          indicator="none"
          ratio="16:9"
          onActiveIndexChange={(index) => setBannerIndex(index)}
        >
          {banners.map((banner) => (
            <img
              key={banner.id}
              src={banner.imageSrc}
              alt={banner.alt}
              className="size-full object-cover"
            />
          ))}
        </Swiper>
        <ChipIndicator
          type="onlyCount"
          currentCount={bannerIndex + 1}
          totalCount={banners.length}
          unit=""
          className="absolute right-(--sz-10) bottom-(--sz-10) z-2"
        />
      </div>

      <div className="grid w-full grid-cols-4 gap-y-(--sz-12) px-(--sz-8) pt-(--sz-8) pb-(--sz-28)">
        {categories.map((category) => {
          const tileBg = CATEGORY_TILE_BG_CLASS[category.id];
          return (
            <div key={category.id} className="flex justify-center">
              <VerticalMenuButton
                size="2xl"
                label={category.label}
                onClick={() => {
                  // TODO(dev): 카테고리 상품 목록으로 이동(category.id)
                }}
              >
                {tileBg ? (
                  <div
                    className={`flex size-full items-center justify-center rounded-lg ${tileBg}`}
                  >
                    <img
                      src={category.iconSrc}
                      alt=""
                      aria-hidden
                      className="size-full rounded-lg object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={category.iconSrc}
                    alt=""
                    aria-hidden
                    className="size-full"
                  />
                )}
              </VerticalMenuButton>
            </div>
          );
        })}
      </div>

      <section className="flex w-full flex-col items-start gap-(--sz-16) pb-(--sz-40)">
        <SectionTitle
          title="실시간 인기 상품"
          typo="title3"
          buttonType="icon"
          moreAriaLabel="실시간 인기 상품 더보기"
          onMoreClick={() => {
            // TODO(dev): 실시간 인기 상품 전체 목록으로 이동
          }}
        />
        <SwiperReact
          modules={[FreeMode, Mousewheel]}
          slidesPerView="auto"
          spaceBetween={POPULAR_LIST_CARD_GAP}
          slidesOffsetBefore={POPULAR_LIST_EDGE_GAP}
          slidesOffsetAfter={POPULAR_LIST_EDGE_GAP}
          freeMode={{ enabled: true, sticky: true }}
          mousewheel={{ forceToAxis: true }}
          className="w-full"
        >
          {popularProducts.map(({ id, ...product }) => (
            // 슬라이드 폭은 카드 고정폭(128)을 따른다 — `swiper/css`가 클래스를 덮어써서 인라인으로 지정.
            <SwiperSlide key={id} style={{ width: "auto" }}>
              <StoreCard
                direction="vertical"
                size="minimum"
                {...product}
                onClick={() => {
                  // TODO(dev): 상품 상세로 이동(id)
                }}
              />
            </SwiperSlide>
          ))}
        </SwiperReact>
      </section>

      <section className="flex w-full flex-col items-start gap-(--sz-12) bg-[linear-gradient(to_bottom,var(--color-bg-brandGrayish-normal),var(--color-bg-neutral-normal))] pt-(--sz-16) pb-(--sz-28)">
        <SectionTitle
          title="또가 베스트 기획전"
          typo="title3"
          buttonType="empty"
        />
        <div className="flex w-full gap-(--sz-8) px-(--sz-20)">
          {storeEvents.map((event) => (
            <StoreEventCard
              key={event.id}
              title={event.title}
              iconSrc={event.iconSrc}
              onClick={() => {
                // TODO(dev): 기획전 상세로 이동(event.id)
              }}
            />
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col items-start">
        <Tabs
          aria-label="상품 진열 탭"
          type="focus"
          className={PRODUCT_TABS_STICKY_CLASS}
        >
          <Tab
            size="sm"
            selected={selectedProductTab === "bestseller"}
            onClick={() =>
              bestsellerSectionRef.current?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            베스트셀러
          </Tab>
          <Tab
            size="sm"
            selected={selectedProductTab === "lowest"}
            onClick={() =>
              lowestSectionRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            최저가
          </Tab>
        </Tabs>

        <div className="flex w-full flex-col items-start gap-(--sz-20) py-(--sz-20)">
          <ProductGridSection
            ref={bestsellerSectionRef}
            className={PRODUCT_SECTION_SCROLL_MARGIN_CLASS}
            title="베스트셀러"
            products={bestsellerProducts}
            onProductClick={() => {
              // TODO(dev): 상품 상세로 이동(id)
            }}
          />
          <Divider thickness="thick" />
          <ProductGridSection
            ref={lowestSectionRef}
            className={PRODUCT_SECTION_SCROLL_MARGIN_CLASS}
            title="최저가"
            products={lowestPriceProducts}
            onProductClick={() => {
              // TODO(dev): 상품 상세로 이동(id)
            }}
          />
        </div>
      </section>

      <Footer
        phone={customerCenter.phone}
        hours={customerCenter.hours}
        onKakaoClick={() => {
          // TODO(dev): 카카오톡 채널 상담 연결
        }}
        onEmailClick={() => {
          // TODO(dev): 이메일 문의(mailto 또는 문의 폼)
        }}
      />

      <FloatingLayer>
        <TopButton
          className={["pointer-events-auto", TOP_BUTTON_BOTTOM_CLASS].join(" ")}
          showAfter={20}
        />
        {/* 카카오 공식 브랜드 컬러(#fee500/#191919)는 디자인시스템 팔레트에 없어 hex를 그대로 쓴다(프로젝트 유일 예외). */}
        <button
          type="button"
          aria-label="카카오톡 상담"
          onClick={() => {
            // TODO(dev): 카카오톡 채널 상담 연결
          }}
          className={[
            "pointer-events-auto fixed z-50 flex h-(--sz-28) items-center gap-(--sz-2)",
            "rounded-circle bg-[#fee500] px-(--sz-6) py-(--sz-8)",
            "shadow-black-sm right-[calc(env(safe-area-inset-right,0px)+var(--sz-16))]",
            "transition-opacity hover:opacity-(--alpha-80) focus-visible:opacity-(--alpha-60) focus-visible:outline-none",
            KAKAO_BUTTON_BOTTOM_CLASS,
          ].join(" ")}
        >
          <Icon name="kakaotalk" size={14} className="text-[#191919]" />
          <span className="text-body-6-bold text-[#191919]">상담</span>
        </button>
      </FloatingLayer>

      <BottomNavigation
        active="store"
        userName={user.name}
        userAvatarSrc={user.avatarSrc}
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-(--layout-viewport-max)"
        onNavigate={handleBottomNavigate}
      />
    </div>
  );
}
