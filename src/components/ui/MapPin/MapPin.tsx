/**
 * 지도 핀(MapPin).
 *
 * Figma "또가3.0 Design System / MapPin" (문서 캔버스 51405:115932, 메인
 * 컴포넌트 프레임 51405:115940) 와 1:1. 지도 위에 위치를 표시하는 정적
 * 프레젠테이션 컴포넌트다 — 지도 SDK(네이버 지도 등)와의 통합·좌표 배치·클릭
 * 이벤트는 이 컴포넌트의 책임이 아니다(호출부가 `className` 등으로 절대
 * 위치시켜 사용).
 *
 * Figma 컴포넌트 설명: "개발 시 네이버 지도에서 기본으로 제공하는 pin을
 * 사용하여 해당 디자인과 유사하게 제작하였으며, 개발 여건이 바뀌지 않는 한
 * 커스텀하지 않습니다." — `marker`(말풍선형) 그래픽은 네이버 지도 기본
 * 마커를 참고해 그린 정적 벡터이고, 실제 지도 SDK 자체 마커 렌더링을
 * 대체하지 않는다.
 *
 * 축(Figma variant → props):
 * - `variant`: circle(원형 점) / marker(말풍선형 핀)
 * - `color`  : normal(빨강, Figma type=normal) / brand(초록, Figma type=brand)
 * - `label`  : Figma `label`(boolean) + `labelValue`(text) 를 presence 기반
 *   단일 문자열 prop 으로 통합(`CountLabel` `unit` 선례) — 생략 시 라벨
 *   미렌더.
 *
 * Figma 실측 밖 확장(사용자 확정, 2026-09-20): 라벨 텍스트 노드에 Figma 상
 * `w-[110px]` + `word-break: break-word` 가 바인딩돼 있으나 대응하는 `sz`
 * 토큰이 없다. 고정폭을 하드코딩하는 대신 `maxWidth` prop(기본값 없음,
 * 문자열|숫자)을 노출해 호출부가 상황에 맞게 줄바꿈 폭을 지정하도록 했다 —
 * 생략 시 폭 제한 없음. `break-words`(word-break) 는 `maxWidth` 유무와
 * 무관하게 항상 적용한다.
 *
 * 라벨 흰색 텍스트 아웃라인(2026-09-20 추가, 지도 배경 위 가독성 보정):
 * `get_design_context` 의 코드 생성 결과에는 라벨 `<p>` 에 별도 stroke 가
 * 반영돼 있지 않았지만, 텍스트 노드(51405:115943)를 `get_variable_defs` 로
 * 재조회한 결과 `borderWidth/sm`(2) + `border/inverse/dark`(#ffffff) 두
 * 변수가 바인딩돼 있음을 확인했다 — Circle 그래픽의 흰 테두리(51405:115942)
 * 와 정확히 동일한 토큰 조합이라 라벨 텍스트에도 같은 2px 흰색 스트로크가
 * 적용돼 있는 게 맞다(Figma MCP 코드 생성이 텍스트 stroke 속성을 놓친
 * 케이스). `-webkit-text-stroke` 는 글자 획을 안쪽으로 깎아먹는 렌더링
 * 이슈가 있어 대신 8방향(상하좌우+대각선) `text-shadow` 를 쌓아 균일한
 * 흰색 테두리를 만든다 — 오프셋은 `border/inverse/dark` 스트로크가
 * 글리프 중심선에 걸리는 걸 감안해 `borderWidth/sm`(2px) 의 절반인
 * `border-width/xs`(1px) 토큰을 그대로 사용한다(방향당 별도 계산 없이
 * 기존 토큰과 정확히 일치). 색상 하드코딩을 피하기 위해 Tailwind 클래스가
 * 아니라 인라인 `style.textShadow` 로 `var(--color-border-inverse-dark)`
 * 를 참조한다(`maxWidth` 와 동일한 이유로 인라인 style 사용).
 *
 * 그래픽:
 * - `circle` : 26px 원, `border-width/sm`(2px) `border/inverse/dark`(흰색)
 *   테두리, 배경은 색상 축에 따라 `background/danger/normal`(#F84B55) 또는
 *   `background/brand/normal`(#00AF78).
 * - `marker` : 54px 말풍선형 벡터. Figma 의 두 색상 심볼(marker 채움 #F84B55 /
 *   #00AF78)이 내려주는 SVG asset 을 실측한 결과 path 좌표가 완전히
 *   동일하고 채움색만 다르다 — 두 SVG 를 각각 이미지로 두지 않고 공용
 *   path 를 인라인 SVG 로 재구성해 `fill="currentColor"` +
 *   `text-icon-danger-normal`/`text-icon-brand-normal` 래퍼로 색만
 *   전환한다(`Checkbox` `CheckMark` 선례). 흰색 테두리·중앙 원은 색상
 *   축과 무관하게 항상 `border/inverse/dark` 고정이라 `fill`/`stroke` 를
 *   `var(--color-border-inverse-dark)` 로 직접 지정한다.
 *
 * 그림자: Figma 는 그래픽+라벨을 감싼 루트 전체에 단일
 * `filter: drop-shadow(...)`(`shadow/black/xs` 와 동일 레시피 — `0 1px 2px
 * black/light, 0 2px 4px black/normal`)를 적용한다. `marker` 는 투명 배경
 * SVG 라 `box-shadow` 유틸(`shadow-black-xs`) 대신 `filter` 로 직접
 * 조립해야 하므로(`Tooltip`/`GalleryCard` 선례), 두 variant 모두 동일하게
 * 루트에 `filter` 로 통일했다.
 *
 * Figma 에 hover/focus/pressed/disabled 축이 없다 — 정적 컴포넌트.
 */

export type MapPinColor = "normal" | "brand";
export type MapPinVariant = "circle" | "marker";

export interface MapPinProps {
  /** 색상 축. normal=빨강(danger), brand=초록(brand). 기본 'normal' */
  color?: MapPinColor;
  /** 모양 축. circle=원형 점, marker=말풍선형 핀. 기본 'circle' */
  variant?: MapPinVariant;
  /** 핀 아래 표시할 라벨 텍스트. 생략 시 라벨 미렌더 */
  label?: string;
  /** 라벨 줄바꿈 최대 폭. 숫자는 px 로 해석. 생략 시 폭 제한 없음 */
  maxWidth?: string | number;
  /** 루트에 병합할 클래스(지도 위 절대 위치 배치 등은 호출부 책임) */
  className?: string;
}

/** 루트 — 세로 중앙 정렬 + 그래픽·라벨 공통 gap + 통합 drop-shadow(shadow/black/xs). */
const ROOT_BASE =
  "relative inline-flex flex-col items-center gap-[var(--sz-4)] " +
  "[filter:drop-shadow(0_var(--sz-1)_var(--sz-2)_var(--color-shadow-black-light))_drop-shadow(0_var(--sz-2)_var(--sz-4)_var(--color-shadow-black-normal))]";

/** circle 배경(Figma: background/danger/normal · background/brand/normal) */
const CIRCLE_COLOR_CLASS: Record<MapPinColor, string> = {
  normal: "bg-bg-danger-normal",
  brand: "bg-bg-brand-normal",
};

/** marker 채움색(currentColor 로 전달 — Figma: icon/danger/normal · icon/brand/normal) */
const MARKER_COLOR_CLASS: Record<MapPinColor, string> = {
  normal: "text-icon-danger-normal",
  brand: "text-icon-brand-normal",
};

/** 라벨 타이포(Figma: Pretendard Bold 14px, line-height 1.46, letter-spacing -0.21px) */
const LABEL_CLASS =
  "shrink-0 break-words text-center text-body-5-bold text-typo-neutral-normal";

/**
 * 라벨 흰색 텍스트 아웃라인(Figma: borderWidth/sm 2px, border/inverse/dark
 * white — Circle 테두리와 동일 토큰). 8방향 오프셋 `text-shadow` 로 조립하며
 * 오프셋 거리는 `border-width/xs`(1px, borderWidth/sm 의 절반) 토큰을 쓴다.
 */
const LABEL_STROKE_OFFSET = "var(--border-width-xs)";
const LABEL_STROKE_NEG_OFFSET = "calc(var(--border-width-xs) * -1)";
const LABEL_TEXT_SHADOW = [
  [LABEL_STROKE_OFFSET, "0"],
  [LABEL_STROKE_NEG_OFFSET, "0"],
  ["0", LABEL_STROKE_OFFSET],
  ["0", LABEL_STROKE_NEG_OFFSET],
  [LABEL_STROKE_OFFSET, LABEL_STROKE_OFFSET],
  [LABEL_STROKE_NEG_OFFSET, LABEL_STROKE_OFFSET],
  [LABEL_STROKE_OFFSET, LABEL_STROKE_NEG_OFFSET],
  [LABEL_STROKE_NEG_OFFSET, LABEL_STROKE_NEG_OFFSET],
]
  .map(([x, y]) => `${x} ${y} 0 var(--color-border-inverse-dark)`)
  .join(", ");

/**
 * Figma `Pin` 인스턴스(marker 심볼) 실측 path. 두 색상 심볼 모두 동일 좌표이며
 * 채움색만 다르다(`#F84B55` / `#00AF78`) — 그래서 하나의 path 를 공유하고 색은
 * `currentColor` 로 상속받는다. 항상 장식용이라 `aria-hidden`.
 */
function MarkerGraphic({ color }: { color: MapPinColor }) {
  return (
    <svg
      viewBox="0 0 54 54"
      fill="none"
      focusable={false}
      aria-hidden
      data-name="Pin"
      className={[
        "size-[var(--sz-54)] shrink-0",
        MARKER_COLOR_CLASS[color],
      ].join(" ")}
    >
      <path
        d="M26.9995 3.16C37.7891 3.16 46.5198 11.8203 46.52 22.4832C46.52 27.8676 44.0551 32.6527 40.5571 37.1512C37.9977 40.4427 34.8025 43.6789 31.4888 46.9452L30.063 48.3465L30.0601 48.3495C29.3423 49.0542 28.6227 49.7605 27.9087 50.4676C27.408 50.9635 26.592 50.9635 26.0913 50.4676C25.3769 49.7601 24.6553 49.0518 23.937 48.3465C20.1233 44.602 16.3679 40.9129 13.4429 37.1512C9.94497 32.6527 7.48 27.8676 7.48 22.4832C7.48021 11.8205 16.2102 3.16025 26.9995 3.16Z"
        fill="currentColor"
        stroke="var(--color-border-inverse-dark)"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-width:var(--border-width-sm)]"
      />
      <ellipse
        cx="27"
        cy="22.5818"
        rx="6.87273"
        ry="6.87273"
        fill="var(--color-border-inverse-dark)"
      />
    </svg>
  );
}

export function MapPin({
  color = "normal",
  variant = "circle",
  label,
  maxWidth,
  className,
}: MapPinProps) {
  const isCircle = variant === "circle";
  const hasLabel = label != null && label !== "";

  return (
    <div
      data-name="MapPin"
      data-color={color}
      data-variant={variant}
      className={[ROOT_BASE, className].filter(Boolean).join(" ")}
    >
      {isCircle ? (
        <div
          data-name="Circle"
          className={[
            "relative size-[var(--sz-26)] shrink-0 rounded-circle",
            "border-sm border-solid border-border-inverse-dark",
            CIRCLE_COLOR_CLASS[color],
          ].join(" ")}
        />
      ) : (
        <MarkerGraphic color={color} />
      )}
      {hasLabel && (
        <span
          className={LABEL_CLASS}
          style={{
            textShadow: LABEL_TEXT_SHADOW,
            ...(maxWidth != null && {
              maxWidth:
                typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
            }),
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
