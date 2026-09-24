/**
 * 이미지 프리뷰(ImagePreview) — 이미지 여러 장을 풀스크린으로 넘겨보는 뷰어.
 *
 * Figma "또가3.0 Design System / ImagePreview" (node 51405:99214, 360×800 단일
 * 프레임, variant 없음) 와 1:1. OS 상태바/안드로이드 내비게이션 바는 Figma 데모용
 * UI일 뿐이라 구현 범위에서 완전히 제외했다.
 *
 * `Swiper`(`../Swiper`, node 51405:132693)가 쓰는 것과 동일한 스와이프 엔진
 * (`swiper/react`)을 직접 사용하지만, `Swiper.tsx` 파일 자체는 합성/수정하지
 * 않는다 — 실제로 시도해보니 두 가지 이유로 그대로 합성할 수 없었다(사용자 확인
 * 완료, 2026-09-20):
 * 1) `Swiper` 는 "고정 비율(16:9/1:1) 카드형 캐러셀"로 설계돼 있어 `ratio` 축이
 *    항상 내부 `contentsSlot` 에 `aspect-[320/180]`/`aspect-[320/320]` 를 강제한다
 *    (`Swiper.tsx` 121~124, 254~267줄). 이 div 는 prop 으로 노출돼 있지 않아
 *    외부에서 오버라이드할 수 없는데, `ImagePreview` 는 화면에 남는 세로 공간을
 *    그대로 채워야 하는 임의 비율 영역이 필요해 근본적으로 맞지 않는다.
 * 2) `indicator="chip"` 도 위치가 우하단/우측 계산식으로 하드코딩돼 있고
 *    (`Swiper.tsx` 344~363줄) `type` 을 노출하지 않아 항상 `"default"` 로 렌더된다
 *    (`ChipIndicator.tsx` 71줄 — `type==="default"` 면 라벨이 비어 있어도 무조건
 *    "·" 구분자가 붙음). 이 컴포넌트가 필요로 하는 "하단 중앙 고정 + 순수 카운트
 *    (`1 / 5`, `type="onlyCount"`)" 조합을 `Swiper` prop 만으로는 만들 수 없다.
 *
 * 위 두 제약 때문에 `Swiper.tsx` 는 건드리지 않고, 같은 스와이프 엔진(`swiper/react`)
 * 을 이 컴포넌트에서 직접 사용해 필요한 레이아웃/인디케이터를 자체 조합한다.
 * `ChipIndicator`(`type="onlyCount"`, `unit=""`)와 `IconButton`(`x_close_line`)은
 * 그대로 재사용한다.
 *
 * 이미지 뷰어라 자동재생(Autoplay)은 쓰지 않는다. 슬라이드가 2개 이상이면 네이티브
 * `loop` 만 켠다 — `Swiper` `round` variant 전용 수동 루프 워크어라운드는
 * `centeredSlides`+`slidesPerView="auto"` 조합에서만 발생하는 라이브러리 버그
 * 대응이라(`Swiper.tsx` 45~49줄 주석 참고), 이 컴포넌트처럼 슬라이드 1개가 뷰포트
 * 전체를 차지하는 기본 배치(`slidesPerView` 기본값 1)에서는 네이티브 `loop` 를
 * 그대로 써도 안전하다.
 *
 * 레이아웃(Figma 실측):
 * - 루트: `fixed inset-0`(풀스크린) + `bg-bg-inverse-deep`(배경, `background/inverse/deep`).
 * - Body: 상단 여백 `top-[var(--sz-36)]` 아래 남은 영역 전체를 차지(`inset-x-0 bottom-0`).
 *   이미지 슬라이드 영역이 이 안을 꽉 채운다(`size-full`) — 각 슬라이드 안의 `img`/
 *   `video` 는 기본적으로 영역을 채우며 크롭되도록(`object-cover`) 유틸을 걸어둔다.
 * - ChipIndicator: Body 기준 하단 중앙 고정(`bottom-[var(--sz-24)] left-1/2
 *   -translate-x-1/2`), 슬라이드가 1장 이상일 때만 렌더.
 * - 닫기 버튼: `top-[var(--sz-44)]`, `right-[var(--sz-14)]`(Figma 실측: touch area
 *   x=310/width=36, 프레임 폭 360 기준 `360-(310+36)=14px` → `--sz-14` 토큰과
 *   정확히 일치, 2026-09-20 재확인). 위치는 별도 wrapper `div`가 담당한다 —
 *   `IconButton` 은 내부에 `relative` 를 이미 갖고 있는데, Tailwind 가 생성한
 *   CSS 에서 `.relative` 규칙이 `.absolute` 규칙보다 뒤에 나와(동일 우선순위라
 *   나중 규칙이 이김) `IconButton` 에 직접 `absolute` 를 얹으면 무시되고
 *   `position: relative` 로 렌더되는 문제가 있었다(2026-09-20 확인 — 컴파일된
 *   `dist/assets/*.css` 에서 `.absolute{}` 가 `.relative{}` 보다 앞에 위치).
 *   터치 영역 확보를 위해 `IconButton` 에는 `p-[var(--sz-6)]` 만 준다(아이콘
 *   자체는 24×24 유지). 어두운 이미지 위에서도 보이도록 `shadow-black-xs` 는
 *   `IconButton`(패딩 포함 36×36 박스)이 아니라 `Icon`(24×24 svg) 에 직접 걸어
 *   그림자가 아이콘 크기에 맞게 붙게 한다.
 */

import { Children, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Swiper as SwiperCore, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";

import { Icon } from "../../../icons";
import { ChipIndicator } from "../ChipIndicator";
import { IconButton } from "../IconButton";

export interface ImagePreviewProps {
  /** 슬라이드로 렌더할 콘텐츠들(이미지 등). 각 엘리먼트가 슬라이드 하나가 된다. */
  children: ReactNode;
  /** 닫기 버튼 클릭 콜백. */
  onClose?: () => void;
  /** 다이얼로그 접근 가능한 이름(`aria-label`). 기본 '이미지 미리보기' */
  "aria-label"?: string;
  /** 루트 요소에 전달할 클래스 */
  className?: string;
}

/** 루트 — 풀스크린 고정 + 어두운 배경(Figma `background/inverse/deep`). */
const ROOT_CLASS = "fixed inset-0 z-50 overflow-hidden bg-bg-inverse-deep";

/** Body — 상단 여백 아래 남은 영역 전체(상태바 자리는 Figma 데모 전용이라 제외). */
const BODY_CLASS =
  "absolute inset-x-0 top-[var(--sz-36)] bottom-0 flex items-center justify-center gap-[var(--sz-10)]";

/** 슬라이드 콘텐츠 — 안의 img/video 는 기본적으로 영역을 꽉 채우며 크롭(object-cover). */
const SLIDE_CONTENT_CLASS =
  "relative size-full [&>img]:size-full [&>img]:object-cover " +
  "[&>video]:size-full [&>video]:object-cover";

/** ChipIndicator — Body 기준 하단 중앙 고정. */
const CHIP_CLASS =
  "absolute bottom-[var(--sz-24)] left-1/2 z-[2] -translate-x-1/2";

/** 닫기 버튼 위치 wrapper — `IconButton` 자체엔 `absolute` 를 주지 않는다(내부
 * `relative` 와 충돌해 무시되는 문제, 상단 주석 참고). */
const CLOSE_WRAPPER_CLASS =
  "absolute top-[var(--sz-44)] right-[var(--sz-14)] z-[3]";

/** 닫기 버튼 — 터치 영역 확보 패딩만 담당(위치는 wrapper, 그림자는 Icon). */
const CLOSE_BUTTON_CLASS =
  "rounded-circle p-[var(--sz-6)] text-icon-inverse-normal";

/**
 * 닫기 아이콘 — 어두운 이미지 위 대비용 그림자를 svg 자체에 직접 적용.
 * `--shadow-black-xs` 와 같은 수치(0/1/2, 0/2/4)이지만 box-shadow 로는 아이콘의
 * 실루엣(X 모양)을 따라가지 못하고 사각 박스로 퍼지므로, Tooltip 컴포넌트 선례와
 * 동일하게 `filter:drop-shadow()` 2겹으로 직접 조립한다 — drop-shadow 는 알파
 * 채널(실제 획 모양)을 따라가 아이콘 윤곽에 그림자가 붙는다.
 */
const CLOSE_ICON_CLASS =
  "[filter:drop-shadow(0_var(--sz-1)_var(--sz-2)_var(--color-shadow-black-light))_drop-shadow(0_var(--sz-2)_var(--sz-4)_var(--color-shadow-black-normal))]";

export function ImagePreview({
  children,
  onClose,
  "aria-label": ariaLabel = "이미지 미리보기",
  className,
}: ImagePreviewProps) {
  const slides = Children.toArray(children);
  const slideCount = slides.length;
  const canLoop = slideCount > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperInstance | null>(null);
  const currentCount = slideCount === 0 ? 0 : activeIndex + 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={[ROOT_CLASS, className].filter(Boolean).join(" ")}
    >
      <div className={BODY_CLASS} data-name="body">
        <SwiperCore
          loop={canLoop}
          onSwiper={(instance) => {
            swiperRef.current = instance;
          }}
          onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
          className="size-full"
        >
          {slides.map((node, index) => (
            <SwiperSlide key={index} className="size-full">
              <div className={SLIDE_CONTENT_CLASS}>{node}</div>
            </SwiperSlide>
          ))}
        </SwiperCore>

        {slideCount > 0 ? (
          <ChipIndicator
            type="onlyCount"
            unit=""
            currentCount={currentCount}
            totalCount={slideCount}
            className={CHIP_CLASS}
          />
        ) : null}
      </div>

      <div className={CLOSE_WRAPPER_CLASS}>
        <IconButton
          aria-label="닫기"
          onClick={onClose}
          className={CLOSE_BUTTON_CLASS}
        >
          <Icon name="x_close_line" size={24} className={CLOSE_ICON_CLASS} />
        </IconButton>
      </div>
    </div>
  );
}
