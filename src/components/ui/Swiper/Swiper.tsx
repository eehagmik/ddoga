/**
 * 스와이퍼(Swiper) — 슬라이드 콘텐츠를 좌우로 넘겨보는 캐러셀 컨테이너.
 *
 * Figma "또가3.0 Design System / Swiper" (문서 페이지 51405:132684 / 메인 컴포넌트
 * 51405:132693, 12개 variant 조합) 와 1:1. Figma 내부의 `DirectionIndicator`
 * (51405:102224, 이전/다음 버튼 + `CountLabel`)와 `ChipIndicator`(51405:102231,
 * 우하단 오버레이 배지)는 이제 독립 컴포넌트(`../DirectionIndicator`,
 * `../ChipIndicator`)로 분리돼 있어 그대로 합성해서 쓴다(예고됐던 리팩토링 — `indicator`
 * 별 시각/동작 결과는 인라인 구현과 동일).
 *
 * 스와이프 엔진은 `swiper`(npm) 의 `swiper/react` 를 사용한다. 요청 범위에 맞춰
 * `Autoplay` 모듈만 쓴다(`Pagination`/`Navigation` 모듈은 커스텀 인디케이터로
 * 대체하므로 사용하지 않는다). 콘텐츠(children)가 2개 이상일 때만 무한 루프
 * (`loop`) + 자동 재생(5초 간격)이 켜지고, 1개뿐이면 둘 다 꺼진다(스와이프 자체도
 * 의미가 없다). `indicator="direction"` 의 이전/다음 버튼은 `onSwiper` 로 받은
 * 인스턴스의 `slidePrev()`/`slideNext()` 를 직접 호출하고(버튼이 `DirectionIndicator`
 * 아래 별도 행에 있어 `useSwiper()` 훅을 쓸 수 없다 — `Swiper`/`SwiperSlide` 트리
 * 내부에서만 동작하는 훅이다), 현재 위치는 `onSlideChange` 의 `swiper.realIndex`
 * (loop 모드에서 복제되지 않은 실제 인덱스)를 React state 로 추적해 `CountLabel` 에
 * 반영한다.
 *
 * 축(Figma variant → props):
 * - `variant`   : round / sharp.
 *   - `sharp` 는 기존과 동일 — `contentsSlot`이 부모 폭(`w-full`) 안에 갇힌
 *     `overflow-hidden` 박스이고, 슬라이드 1개가 그 박스를 그대로 채운다(각짐, radius 없음).
 *   - `round` 는 이미지 밴드가 부모의 좌우 여백/폭 제약을 뚫고 **뷰포트 전체 폭(100vw)**
 *     을 쓰는 "센터드 peek 캐러셀"이다. 루트가 이미 `flex flex-col items-center`라
 *     `w-screen`만 줘도 flex 가 좌우로 균등하게 넘치도록 중앙 정렬해준다(별도
 *     `left-50%`/`translateX` offset 트릭은 이중 보정이 되어 위치가 어긋나므로 쓰지
 *     않는다 — 실측으로 확인). 각 슬라이드는 인라인 `style={{ width:
 *     "calc(100vw - (var(--sz-40) * 2))" }}`(뷰포트 폭 − 좌우 inset 40px×2)로 폭이
 *     고정된 둥근 카드(`rounded-2xl` + `RATIO_CLASS[ratio]`, `Swiper` `centeredSlides`
 *     + `slidesPerView="auto"` + `spaceBetween`(16, `--sz-16`과 동일값)로 중앙
 *     정렬돼 좌우 이웃 카드가 peek(≈24px) 되어 보인다. 폭을 Tailwind `w-[calc(...)]`
 *     클래스가 아니라 인라인 `style` 로 주는 이유는 `swiper/css`가 `@layer` 밖의
 *     스타일시트라 `.swiper-slide{width:100%}` 가 CSS cascade layers 규칙상 Tailwind
 *     `@layer utilities` 안의 어떤 유틸보다도 항상 이기기 때문(실측으로 확인) —
 *     인라인 스타일은 이 문제를 피하면서도 여전히 `var(--sz-40)` 토큰을 참조한다.
 *     정확한 peek/inset 수치가 Figma 스펙 캡처에 명시돼 있지 않아 추정했다 — 처음엔
 *     `tokens/layout.json`의 `margin`(20)을 썼으나 `spaceBetween`(캡처의 "Distance:
 *     40")과 조합하면 peek 가 거의 안 보여, 사용자 확인 후 inset 을 `--sz-40`(40)으로
 *     올렸다 — 자세한 계산은 `ROUND_SPACE_BETWEEN`/`ROUND_SLIDE_WIDTH_STYLE` 상수
 *     주석 참고(2026-09-19). 실제 페이지 셸/Figma 수치가 확인되면 재검증 필요.
 *
 *     Swiper 네이티브 `loop`+`centeredSlides`+`slidesPerView="auto"` 조합은 라이브러리
 *     자체 버그(nolimits4web/swiper#6559, #7216 — 첫 렌더부터 마지막 슬라이드를
 *     active 로 오판하고 이웃을 한쪽으로만 쌓아버림, 실측으로 재현 확인)라 `round`는
 *     `loop`를 끄고 앞뒤에 복제 슬라이드를 붙여 직접 무한 루프를 구현한다 —
 *     컴포넌트 본문의 `paddedSlides`/`onSlideChangeTransitionEnd` 참고.
 * - `indicator` : none / direction / chip — direction 은 `contentsSlot` 아래 별도
 *   행에 이전/다음 버튼 + `CountLabel`(부모 폭 기준, full-bleed 미적용). chip 은
 *   `contentsSlot` 우하단에 반투명 배지(`ChipIndicator`)를 오버레이한다 — `sharp`는
 *   슬롯 전체에 하나, `round`는 슬라이드마다 렌더 prop(`isActive`)으로 감싸 **현재
 *   활성 슬라이드에만** 붙인다(peek 되는 이웃 카드에는 배지가 뜨지 않아야 하므로).
 * - `ratio`     : 16:9 → `aspect-[320/180]`, 1:1 → `aspect-[320/320]`
 *   (Tailwind aspect-ratio 유틸). `sharp`는 `contentsSlot`(슬롯) 단위, `round`는
 *   슬라이드 카드 단위로 적용 위치가 다르다(위 참고).
 *
 * 토큰 매핑(Figma 실측, `get_design_context`/`get_variable_defs` 재검증 완료):
 * | 대상                              | 클래스/값                                                          |
 * | 루트 세로 gap                      | `gap-[var(--sz-16)]`                                               |
 * | contentsSlot radius(round)        | `rounded-2xl`(`radius/2xl`, 16px)                                  |
 * | round 슬라이드 폭                  | 인라인 `style` width: `calc(100vw - (var(--sz-40) * 2))`           |
 * | round 슬라이드 간격(spaceBetween)  | 16(`--sz-16`과 동일값, Swiper API 는 숫자만 허용해 JS 상수로 고정)   |
 * | ChipIndicator 배경                 | `bg-bg-overlay-blackDeep`(`background/overlay/blackDeep`, a60)     |
 * | ChipIndicator radius/padding      | `rounded-2xl`, `px-[var(--sz-10)] py-[var(--sz-8)]`                |
 * | ChipIndicator 우하단 오프셋         | `bottom-[var(--sz-10)] right-[var(--sz-10)]`(래핑 wrapper 담당)     |
 * | 이전/다음 버튼                     | `size-[var(--sz-32)] rounded-circle border-xs                      |
 * |                                    | border-border-neutral-bright bg-bg-neutral-normal shadow-black-xs` |
 *
 * `ChipIndicator`/`DirectionIndicator` 자체의 세부 토큰(텍스트 크기, gap 등)은 각 컴포넌트
 * 문서(`../ChipIndicator/ChipIndicator.tsx`, `../DirectionIndicator/DirectionIndicator.tsx`)
 * 참고 — 이 파일은 그 둘을 배치하는 책임만 진다.
 *
 * `contentsSlot`/`ChipIndicator` 배경의 빨간 점선 테두리는 Figma 의 "빈 슬롯" 표시일
 * 뿐이라 실제 스타일에 반영하지 않는다(`BlankIcon`/`BlankGraphic` 선례와 동일 맥락).
 * `children` 각각은 `Children.toArray` 로 순회해 `SwiperSlide` 로 감싸 렌더한다 —
 * 소비자는 별도 `SwiperSlide` 래핑 없이 그냥 여러 엘리먼트를 `children` 으로 넘기면 된다.
 */

import { Children, useRef, useState, type ReactNode } from "react";
import { Swiper as SwiperCore, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";

import { ChipIndicator } from "../ChipIndicator";
import { DirectionIndicator } from "../DirectionIndicator";

export type SwiperVariant = "round" | "sharp";
export type SwiperIndicator = "none" | "direction" | "chip";
export type SwiperRatio = "16:9" | "1:1";

export interface SwiperProps {
  /** 모서리 축(Figma `variant`). 기본 'round' */
  variant?: SwiperVariant;
  /** 인디케이터 축(Figma `indicator`). 기본 'none' */
  indicator?: SwiperIndicator;
  /** 비율 축(Figma `ratio`). 기본 '16:9' */
  ratio?: SwiperRatio;
  /** `indicator="chip"` 일 때 라벨 텍스트(Figma `Label`). 기본 'Label' */
  chipLabel?: string;
  /** CountLabel 단위 텍스트(Figma `unit`, direction/chip 공통). 기본 'Unit' */
  unit?: string;
  /** 슬라이드로 렌더할 콘텐츠들. 각 엘리먼트가 `SwiperSlide` 하나가 된다. */
  children: ReactNode;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** 자동재생 슬라이드 정지 시간(ms) — 요청 스펙(약 5초). */
const AUTOPLAY_DELAY = 5000;

/** variant → contentsSlot radius (round 만 `radius/2xl`, sharp 는 각짐). */
const CONTENTS_RADIUS: Record<SwiperVariant, string> = {
  round: "rounded-2xl",
  sharp: "",
};

/** ratio → contentsSlot aspect-ratio(Figma 실측: 320/180, 320/320). */
const RATIO_CLASS: Record<SwiperRatio, string> = {
  "16:9": "aspect-[320/180]",
  "1:1": "aspect-[320/320]",
};

/**
 * round variant 의 peek 슬라이드 간 간격(px). Swiper `spaceBetween` 은 숫자(px)만
 * 받는 라이브러리 API 라 JS 상수로 고정한다 — `AUTOPLAY_DELAY`와 같은 이유(CSS 토큰
 * 하드코딩이 아니라 런타임 API 제약).
 *
 * 원래 Figma 스펙 캡처의 "Distance: 40"(`--sz-40`)을 그대로 썼으나, 당시 inset(좌우
 * `--layout-margin` 20×2)과 조합하면 `inset(20) - spaceBetween(40) = -20` 이 되어
 * 옆 슬라이드가 화면 밖으로 더 들어가 peek 가 전혀 안 보이는 문제가 실측으로 확인됐다
 * (`peek = inset - spaceBetween`, 값이 음수면 그냥 여백만 보이고 slack가 없음).
 * 1차로 spaceBetween 을 `--sz-16`(16)으로 낮췄으나 `inset(20) - 16 = 4px` 로 여전히
 * 거의 안 보여, 사용자 확인 후 대신 inset 을 `--sz-40`(40)으로 올리는 쪽으로
 * 조정했다(`ROUND_SLIDE_WIDTH_STYLE` 참고) — `inset(40) - spaceBetween(16) = 24px`
 * 로 peek 이 뚜렷하게 보인다(2026-09-19). 정확한 Figma 수치가 확인되면 재조정 필요.
 */
const ROUND_SPACE_BETWEEN = 16;

/**
 * round 슬라이드 폭 — 뷰포트 전체 폭에서 좌우 inset(`--sz-40`, 40×2)을 뺀 값.
 * 화면 양끝에 카드가 붙지 않고 inset 되어 다음/이전 카드가 그 바깥으로 peek 된다.
 *
 * inset 을 `tokens/layout.json`의 `margin`(`--layout-margin`, 20)이 아니라 `--sz-40`
 * 으로 쓰는 이유는 `ROUND_SPACE_BETWEEN`(16)과 조합했을 때 실제로 peek 이 보이는
 * 폭을 만들기 위해서다 — `peek = inset - spaceBetween`(자세한 계산은
 * `ROUND_SPACE_BETWEEN` 주석 참고). `--layout-margin`(20)을 쓰면 peek 이 4px 로
 * 거의 안 보여서, 사용자 확인 후 `--sz-40`으로 올려 peek ≈ 24px 을 확보했다
 * (2026-09-19). 정확한 Figma 수치가 확인되면 재조정 필요.
 *
 * Tailwind `w-[calc(...)]` 유틸 클래스가 아니라 인라인 `style` 로 준다 — `swiper/css`
 * (`import "swiper/css"`)가 `@layer` 밖의 일반 스타일시트라 `.swiper-slide{width:100%}`
 * 가 Tailwind `@layer utilities` 안의 어떤 유틸보다도 항상 우선한다(CSS cascade layers
 * 규칙: un-layered 스타일이 layered 스타일을 소스 순서/명시도 무관하게 이긴다). 인라인
 * `style` 은 그 어떤 스타일시트 규칙보다도 우선하므로 이 문제를 피할 수 있다 — 값 자체는
 * 여전히 `var(--sz-40)` 토큰을 참조해 하드코딩이 아니다(실측으로 확인된 이슈).
 */
const ROUND_SLIDE_WIDTH_STYLE = {
  width: "calc(100vw - (var(--sz-40) * 2))",
} as const;

/**
 * round 이미지 밴드 — 부모의 좌우 padding/max-width 를 뚫고 뷰포트 전체 폭을 쓴다.
 * 루트가 이미 `flex flex-col items-center`(cross-axis 중앙 정렬)라, `w-screen`
 * 하나만 줘도 flex 가 알아서 좌우로 균등하게 넘치도록 중앙 정렬해준다 — 여기에
 * `relative left-1/2 -translate-x-1/2` 같은 별도 offset 트릭을 추가하면 이미 맞는
 * 위치를 이중으로 어긋나게 만드니 추가하지 않는다(실측으로 확인된 버그, 주의).
 * 단, 이 계산은 루트의 부모가 뷰포트 기준 가로 중앙에 있을 때만 정확하다 —
 * `tokens/layout.json`의 `viewport-max`(520) 앱 셸처럼 좌우 대칭 정렬된 컨테이너를
 * 전제한다(실제 페이지 셸 확정 후 재검증 필요, 컴포넌트 상단 문서 참고).
 *
 * `relative` 는 레이아웃에 영향 없이 `ChipIndicator` 오버레이(아래 `ROUND_CHIP_RIGHT_STYLE`)
 * 의 위치 기준(containing block)을 이 밴드로 고정하기 위한 것 — 스와이프로 넘어가는
 * 슬라이드 안이 아니라 밴드에 붙여야 전환 중에도 화면상 위치가 고정된다.
 */
const ROUND_BAND_CLASS = "relative w-screen shrink-0";

/**
 * round 의 `ChipIndicator` 우측 오프셋 — 카드 자체의 오른쪽 inset(`--sz-40`, 위
 * `ROUND_SLIDE_WIDTH_STYLE` 참고) + 배지와 카드 모서리 사이 여백(`--sz-10`).
 * band(뷰포트 전체 폭) 기준으로 이 만큼 오른쪽에서 띄우면 정확히 카드 우측 하단에
 * 붙는다. `+` 연산자도 CSS `calc()`에서 양옆 공백이 필요해(`ROUND_SLIDE_WIDTH_STYLE`
 * 주석 참고) Tailwind 화살괄호 클래스 대신 인라인 `style` 로 준다.
 */
const ROUND_CHIP_RIGHT_STYLE = {
  right: "calc(var(--sz-40) + var(--sz-10))",
} as const;

/** `PADDED_SLIDES` 항목 하나 — 렌더할 노드와, 그 노드가 가리키는 실제(중복 없는) 인덱스. */
interface PaddedSlide {
  node: ReactNode;
  realIndex: number;
  key: string;
}

export function Swiper({
  variant = "round",
  indicator = "none",
  ratio = "16:9",
  chipLabel = "Label",
  unit = "Unit",
  children,
  className,
}: SwiperProps) {
  const slides = Children.toArray(children);
  const slideCount = slides.length;
  const canLoop = slideCount > 1;
  const isRound = variant === "round";
  // round 의 네이티브 `loop`+`centeredSlides`+`slidesPerView="auto"` 조합은 Swiper
  // 라이브러리 자체 버그로 첫 렌더부터 마지막 슬라이드를 active 로 오판하고 이웃
  // 슬라이드를 한쪽으로만 쌓아버려 peek 가 반대쪽에 전혀 안 보인다(실측 + 공개 이슈
  // 확인 — nolimits4web/swiper#6559, #7216). 그래서 round 에서는 네이티브 `loop` 를
  // 끄고, 앞뒤에 복제 슬라이드를 하나씩 붙인 뒤(`PADDED_SLIDES`) 그 복제 칸에 도달하면
  // 애니메이션 없이 진짜 슬라이드로 순간 이동시켜(`onSlideChangeTransitionEnd`) 무한
  // 루프처럼 보이게 만든다 — 아래 `PADDED_SLIDES`/`onSlideChangeTransitionEnd` 참고.
  const useManualLoop = isRound && canLoop;

  const paddedSlides: PaddedSlide[] = useManualLoop
    ? [
        {
          node: slides[slideCount - 1],
          realIndex: slideCount - 1,
          key: "clone-last",
        },
        ...slides.map((node, i) => ({ node, realIndex: i, key: `real-${i}` })),
        { node: slides[0], realIndex: 0, key: "clone-first" },
      ]
    : slides.map((node, i) => ({ node, realIndex: i, key: `real-${i}` }));
  // 복제가 있을 때 진짜 슬라이드 구간의 시작/끝 인덱스(padded 배열 기준).
  const firstRealPaddedIndex = useManualLoop ? 1 : 0;
  const lastRealPaddedIndex = useManualLoop
    ? paddedSlides.length - 2
    : paddedSlides.length - 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperInstance | null>(null);

  const currentCount = slideCount === 0 ? 0 : activeIndex + 1;

  return (
    <div
      data-variant={variant}
      data-indicator={indicator}
      data-ratio={ratio}
      className={[
        "isolate flex w-full flex-col items-center gap-[var(--sz-16)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={
          isRound
            ? ROUND_BAND_CLASS
            : [
                "relative w-full shrink-0 overflow-hidden",
                RATIO_CLASS[ratio],
                CONTENTS_RADIUS[variant],
              ]
                .filter(Boolean)
                .join(" ")
        }
        data-name={isRound ? undefined : "contentsSlot"}
      >
        <SwiperCore
          modules={[Autoplay]}
          loop={useManualLoop ? false : canLoop}
          initialSlide={useManualLoop ? firstRealPaddedIndex : undefined}
          autoplay={
            canLoop
              ? { delay: AUTOPLAY_DELAY, disableOnInteraction: false }
              : false
          }
          onSwiper={(instance) => {
            swiperRef.current = instance;
          }}
          onSlideChange={(instance) =>
            setActiveIndex(
              useManualLoop
                ? (paddedSlides[instance.activeIndex]?.realIndex ?? 0)
                : instance.realIndex,
            )
          }
          onSlideChangeTransitionEnd={
            useManualLoop
              ? (instance) => {
                  // 복제 칸(맨 앞/뒤)에 도달하면 애니메이션 없이 진짜 슬라이드로
                  // 순간 이동해 무한 루프처럼 보이게 한다 — 복제 콘텐츠가 실제 슬라이드와
                  // 동일해 전환이 눈에 띄지 않는다.
                  if (instance.activeIndex === 0) {
                    instance.slideTo(lastRealPaddedIndex, 0, false);
                    instance.autoplay?.start();
                  } else if (instance.activeIndex === paddedSlides.length - 1) {
                    instance.slideTo(firstRealPaddedIndex, 0, false);
                    instance.autoplay?.start();
                  }
                }
              : undefined
          }
          className={isRound ? "w-full" : "size-full"}
          {...(isRound
            ? {
                slidesPerView: "auto" as const,
                centeredSlides: true,
                spaceBetween: ROUND_SPACE_BETWEEN,
              }
            : {})}
        >
          {paddedSlides.map(({ node, key }) =>
            isRound ? (
              <SwiperSlide
                key={key}
                className="shrink-0"
                style={ROUND_SLIDE_WIDTH_STYLE}
              >
                <div
                  className={[
                    "relative w-full overflow-hidden rounded-2xl",
                    RATIO_CLASS[ratio],
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-name="contentsSlot"
                >
                  {node}
                </div>
              </SwiperSlide>
            ) : (
              <SwiperSlide key={key} className="size-full">
                {node}
              </SwiperSlide>
            ),
          )}
        </SwiperCore>

        {indicator === "chip" ? (
          isRound ? (
            // round 는 슬라이드(스와이프로 이동하는 요소) 밖, band(고정) 쪽에 절대
            // 위치시켜 콘텐츠가 넘어가는 동안에도 화면상 위치가 고정되도록 한다
            // (Figma Animation 스펙 3번: "우측 하단의 ChipIndicator 위치는 고정").
            <div
              className="absolute bottom-[var(--sz-10)] z-[2]"
              style={ROUND_CHIP_RIGHT_STYLE}
            >
              <ChipIndicator
                label={chipLabel}
                currentCount={currentCount}
                totalCount={slideCount}
                unit={unit}
              />
            </div>
          ) : (
            <ChipIndicator
              className="absolute bottom-[var(--sz-10)] right-[var(--sz-10)] z-[2]"
              label={chipLabel}
              currentCount={currentCount}
              totalCount={slideCount}
              unit={unit}
            />
          )
        ) : null}
      </div>

      {indicator === "direction" ? (
        <DirectionIndicator
          currentCount={currentCount}
          totalCount={slideCount}
          unit={unit}
          onPrev={() => swiperRef.current?.slidePrev()}
          onNext={() => swiperRef.current?.slideNext()}
        />
      ) : null}
    </div>
  );
}
