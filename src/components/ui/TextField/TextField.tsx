/**
 * TextField — 단일 행 텍스트 입력 필드(라벨 + 인풋 + 헬퍼 텍스트).
 *
 * Figma "또가3.0 Design System / TextField" (문서/가이드 node 51405:139892,
 * 컴포넌트 세트 node 51405:141075) 와 1:1. 참고 노드(139892)는 별도 컴포넌트가 아니라
 * TextField 스펙/가이드 페이지(Setting·Animation·Display·Helper 설명 + Props 테이블)라
 * 실구현은 141075 세트를 그대로 따른다.
 *
 * **구성(2026-09-17 리팩토링)**: 필드 셸(테두리/밑줄/아이콘 슬롯/clear 버튼/색상 로직)은
 * 더 이상 TextField 가 자체 구현하지 않고, Figma node 51405:104612 를 1:1로 구현한
 * `Input`(`src/components/ui/Input`) 을 그대로 조합해서 쓴다. 마찬가지로 라벨 행은
 * `Label`(`src/components/ui/Label`, node 51405:108505), helperText 는 `HelperLabel`
 * (`src/components/ui/HelperLabel`, node 51405:108524) 을 그대로 조합한다. TextField 는
 * 이 세 프리미티브를 얹기만 하는 얇은 합성 컴포넌트다.
 * **(2026-09-17 후속: transparent 흡수)** 처음엔 `Input`/`Label` 세트에는 없는
 * transparentBody/transparentTitle 두 variant 만 TextField 레벨에서 자체 렌더링을
 * 유지했으나(구조가 완전히 달라 테두리·아이콘 슬롯·라벨 행 자체가 없어서), 이번에 그
 * 필드 렌더링 로직(값 자체는 변경 없이 그대로)을 `Input` 원자 컴포넌트로 옮겼다. 그
 * 결과 TextField 는 **4개 variant 전부** `Label`+`Input`+`HelperLabel` 조합만으로
 * 구성되는 순수 합성 컴포넌트가 됐다 — 자체 `<input>` 렌더링은 완전히 사라졌다.
 * transparentBody/transparentTitle 은 라벨 행 자체가 없을 뿐(아래 참고), helperText 는
 * 여전히 있으므로 `HelperLabel` 조합은 두 variant 모두에 적용된다.
 *
 * **Label 조합 세부사항**:
 * - 타이포는 `Label size="sm" isBold={false}`(둘 다 명시적으로 고정) 로 확정한다 — 기존
 *   `text-label-1`(16px/weight 500/tracking -0.16px) 과 font-size·weight·tracking 이
 *   정확히 일치함을 토큰 대조로 확인했다(`Label` sm 사이즈는 Figma 실측상 line-height 를
 *   지정하지 않아 `text-label-1` 의 `line-height:1` 과는 다르지만, `Label` 이 이미 Figma
 *   1:1 검증된 소스라 이 값을 그대로 따른다 — 한 줄 텍스트 + `items-center` 라 시각적
 *   영향은 미미).
 * - `required` → `Label` `principal`(Label 기본값이 `true` 라 명시적으로 전달해야 한다).
 * - `onInfoClick` 존재 여부 → `Label` `info`(Label 기본값이 `true` 라
 *   `Boolean(onInfoClick)` 로 명시적으로 계산해서 전달해야 한다).
 * - `infoLabel` → `Label` `infoLabel` 로 그대로 전달(`Label` 자체 기본값은 '정보 보기'
 *   이지만 `TextField` 는 자신의 기본값 '자세히 보기' 를 명시적으로 넘긴다).
 * - `id`(계산된 `inputId`) → `Label` `htmlFor` — `label[for]` ↔ `Input` 내부
 *   `<input id>` 접근성 연결을 그대로 유지한다(이 확장은 이번 리팩토링에서 `Label` 에
 *   새로 추가됐다 — 하위 호환: `htmlFor` 미지정 시 `Label` 은 기존처럼 `<p>` 로 렌더).
 * - `Label` 의 정보 아이콘은 2026-09-17 이전엔 Figma CDN `<img>` 에셋을 참조했으나, 이번에
 *   로컬 `Icon name="info_circle_line"` 컴포넌트로 교체됐다(코드베이스 아이콘
 *   레지스트리에 동일 글리프가 이미 있었음 — 외부 네트워크 의존성 제거). 색은 `Label`
 *   JSDoc 참고(icon/info/normal, Figma 에셋 `fill` 실측값 `#5383ff` 로 확인).
 *
 * **HelperLabel 조합 세부사항**:
 * - `helperText` → `HelperLabel` `label`.
 * - 타이포는 `HelperLabel size="md"` 로 확정한다 — 기존 `text-body-4`(16px, tracking
 *   -0.16px, leading-1.47) 와 `HelperLabel` md 클래스가 font-size·tracking·leading 까지
 *   정확히 일치함을 토큰 대조로 확인했다(`sm` 은 14px 라 불일치).
 * - `danger` → `HelperLabel` `variant`(`danger` / `default`). danger 아이콘
 *   (`alert_triangle_solid`, 18px, `pt-(--sz-4)`, `text-icon-danger-normal`) 도
 *   `HelperLabel` `variant="danger"` + `size="md"` 조합이 기존 TextField 자체 렌더와
 *   정확히 일치함을 확인했다.
 * - transparentBody/transparentTitle 의 중앙정렬은 `HelperLabel` 에 정렬 prop 이 없어
 *   `className` 을 루트에 병합하는 방식으로 유지한다(`justify-center`). 기존 코드의
 *   비대칭(‌`danger=true` 일 땐 transparentBody 만 중앙정렬, transparentTitle 은
 *   좌측정렬 유지) 을 그대로 복제했다 — 이번 리팩토링에서 새로 판단해 바꾸지 않음.
 *
 * 축(Figma variant/state → props):
 * - `variant` : line(밑줄형, 기본) / box(테두리 박스형) / transparentBody(크롬 없는
 *   중앙정렬 텍스트) / transparentTitle(크롬 없는 대형 볼드 타이틀형) — 4개 전부 `Input`
 *   조합(2026-09-17 이후 `TextFieldVariant` 는 `Input` 의 `InputVariant` 와 동일).
 *   transparentBody·transparentTitle 은 Figma 구조상 라벨 행·좌우 아이콘 슬롯이 아예
 *   없다 — `label`·`startIcon`·`endIcon` 은 line/box 에서만 렌더된다(TextField 가 라벨
 *   행 자체를 렌더하지 않고, `startIcon`/`endIcon` 은 넘겨도 `Input` 이 transparent
 *   variant 에서 내부적으로 무시한다 — 상세는 `Input.tsx` JSDoc 참고).
 * - `state`   : enable(기본) / hover(→`:hover`) / focus(→`:focus-within`) /
 *   danger(→`danger` prop) / disabled(→ 네이티브 `disabled`) / readOnly(→ 네이티브
 *   `readOnly`, Figma 설명: "직접 편집할 수 없고 입력된 정보값 표시만 함"). 4개 variant
 *   전부 `Input` 내부 로직 그대로(아래 표 참고).
 * - `hasValue`: 별도 prop 없이 `value` 존재 여부로 판단(placeholder ↔ 입력값 렌더 분기).
 * - TextLabel `principal`(필수 표시 `*`) → `required?: boolean`.
 * - TextLabel `info`(Tooltip/BottomSheet 를 여는 16px 아이콘 버튼) → `onInfoClick?`
 *   presence 기반(생략 시 아이콘 자체를 렌더하지 않음). 실제 오버레이 오픈은 호출부 책임.
 * - Input 좌측 `startIcon`/우측 `iconButton`(Figma 설명: "색상을 자유롭게 변경하여
 *   사용" — 범용 24px 슬롯) → `startIcon?`/`endIcon?: ReactNode`. line/box 는 그대로
 *   `Input` 에 전달.
 * - Input `clearButton`(18px, `x_circle_solid`) → `Input` 내부에서 처리(TextField 는
 *   더 이상 `ClearButton` 을 직접 들고 있지 않음). `Input` 의 의도적 조정(hasValue 이면
 *   상시 노출, Figma 는 hover/focus 전용)을 그대로 상속.
 * - line 밑줄 성장 애니메이션도 `Input` 내부에서 `transition-colors` 로 대체된 버전을
 *   그대로 상속.
 *
 * 상태 색 매핑(line/box + transparentBody/transparentTitle 전부)은
 * `Input`(`src/components/ui/Input/Input.tsx`) JSDoc 표를 그대로 상속한다(중복 기술하지
 * 않음). transparentBody/transparentTitle 은 테두리·아이콘 슬롯이 없어 상태에 따른 시각
 * 변화가 disabled(텍스트 dim, transparentTitle 은 추가로 `opacity-(--alpha-60)`)
 * 와 danger(HelperLabel 만 경고 아이콘 + 빨간색) 뿐이다(hover/focus/readOnly 는 Figma
 * 실측상 텍스트 색조차 바뀌지 않음). transparentTitle 값 색은 브랜드green 이 아니라
 * `typo-info-normal`(파랑) — Figma 원본 그대로다.
 * **known 오차 2건(line/box) — 이전 TextField 통짜 구현 대비 Input 조합으로 자동
 * 정정됨**:
 * 1. disabled + 값 있음 텍스트색은 `typo-disabled-normal`(placeholder 의
 *    `typo-disabled-subtle` 보다 진함) — 예전 TextField 는 이 구분 없이 전부 subtle 로
 *    통일해서 실측과 달랐다.
 * 2. box 변형 테두리색은 `hasValue` 만으로 브랜드색 전환(enable+hasValue, readOnly+
 *    hasValue 포함, hover·focus 여부 무관) — 예전 TextField 는 `focus-within:` 에서만
 *    전환해서 enable/readOnly + 값 있음 조합에서 회색 테두리로 남아있었다.
 *
 * 타이포: line/box/transparentBody/transparentTitle 값·placeholder 는 모두 `Input`
 * 이 결정(`text-body-1`/`text-body-3`/`text-body-1`/`text-title-1`), 라벨은
 * `Label size="sm"`(16px, Figma sm 실측대로 line-height 미지정), 헬퍼는
 * `HelperLabel size="md"`(16px).
 */

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { HelperLabel } from "../HelperLabel";
import { Input, type InputVariant } from "../Input";
import { Label } from "../Label";

/**
 * TextField 의 variant 축은 더 이상 TextField 자체가 추가하는 값이 없다(2026-09-17
 * transparent 흡수 이후) — `Input` 의 `InputVariant` 를 그대로 재수출한다.
 */
export type TextFieldVariant = InputVariant;

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "onChange" | "children" | "className"
> {
  /** 시각 형태(Figma `variant`). 기본 'line' */
  variant?: TextFieldVariant;
  /**
   * 라벨 텍스트. line/box 전용(transparentBody/Title 은 구조상 라벨 행이 없음).
   * `Label` 조합(2026-09-17)으로 `string` 만 받는다(Figma 스펙도 원래 텍스트 전용).
   */
  label?: string;
  /** 라벨 옆 필수 표시 `*`(Figma `principal`). `label` 이 있을 때만 의미가 있다 */
  required?: boolean;
  /** 라벨 옆 16px 정보 아이콘 버튼 클릭 핸들러. 생략 시 아이콘 자체를 렌더하지 않는다 */
  onInfoClick?: () => void;
  /** 정보 아이콘 버튼 접근성 라벨. 기본 '자세히 보기' */
  infoLabel?: string;
  /** 좌측 24px 아이콘 슬롯. line/box 전용 */
  startIcon?: ReactNode;
  /** 우측 24px 커스텀 아이콘 버튼 슬롯(Figma: "색상을 자유롭게 변경하여 사용"). line/box 전용 */
  endIcon?: ReactNode;
  /** controlled value */
  value?: string;
  /** 입력값 변경 */
  onChange?: (value: string) => void;
  /** 지우기 버튼 클릭 시(`value` 가 있고 disabled/readOnly 가 아닐 때만 노출) */
  onClear?: () => void;
  /** 지우기 버튼 접근성 라벨. 기본 '지우기' */
  clearLabel?: string;
  /**
   * 헬퍼 텍스트. 있을 때만 렌더(danger 면 경고 아이콘 + 빨간색으로 자동 전환).
   * `HelperLabel` 조합(2026-09-17)으로 `string` 만 받는다(Figma 스펙도 원래 텍스트 전용).
   */
  helperText?: string;
  /** 에러/경고 상태(Figma `state=danger`) */
  danger?: boolean;
  /** 루트에 병합할 클래스 */
  className?: string;
  /** 네이티브 `<input>` 에 병합할 클래스 */
  inputClassName?: string;
}

/** variant 별 루트 세로 gap(라벨&필드 블록 ↔ 헬퍼). transparentTitle 만 --sz-4, 나머지 --sz-8 */
const ROOT_GAP: Record<TextFieldVariant, string> = {
  line: "gap-(--sz-8)",
  box: "gap-(--sz-8)",
  transparentBody: "gap-(--sz-8)",
  transparentTitle: "gap-(--sz-4)",
};

export function TextField({
  variant = "line",
  label,
  required = false,
  onInfoClick,
  infoLabel = "자세히 보기",
  startIcon,
  endIcon,
  value,
  onChange,
  onClear,
  clearLabel = "지우기",
  placeholder,
  helperText,
  danger = false,
  disabled = false,
  readOnly = false,
  className,
  inputClassName,
  id,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isLineOrBox = variant === "line" || variant === "box";

  // HelperLabel 중앙정렬 여부 — 기존 TextField 자체 렌더의 비대칭을 그대로 복제한다:
  // danger 일 땐 transparentBody 만 중앙정렬(transparentTitle 은 좌측정렬 유지),
  // danger 아닐 땐 transparentBody/transparentTitle 둘 다 중앙정렬.
  const helperCentered = danger
    ? variant === "transparentBody"
    : variant === "transparentBody" || variant === "transparentTitle";

  return (
    <div
      data-variant={variant}
      data-danger={danger}
      data-disabled={disabled}
      data-readonly={readOnly}
      className={[
        "flex w-full flex-col items-start",
        ROOT_GAP[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLineOrBox ? (
        <div className="flex w-full flex-col items-start gap-(--sz-10)">
          {label ? (
            <Label
              label={label}
              htmlFor={inputId}
              size="sm"
              isBold={false}
              principal={required}
              info={Boolean(onInfoClick)}
              onInfoClick={onInfoClick}
              infoLabel={infoLabel}
              className="w-full"
            />
          ) : null}

          <Input
            id={inputId}
            variant={variant}
            startIcon={startIcon}
            endIcon={endIcon}
            value={value}
            onChange={onChange}
            onClear={onClear}
            clearLabel={clearLabel}
            placeholder={placeholder}
            danger={danger}
            disabled={disabled}
            readOnly={readOnly}
            inputClassName={inputClassName}
            {...rest}
          />
        </div>
      ) : (
        // transparentBody/transparentTitle — 라벨 행 자체가 없으므로 Input 을 바로 렌더한다
        // (line/box 처럼 label-group 래퍼로 감쌀 필요가 없다. Input 이 자신의 variant 분기로
        // 크롬 없는 중앙/타이틀형 렌더링과 색상 로직을 전부 처리한다).
        <Input
          id={inputId}
          variant={variant}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          danger={danger}
          disabled={disabled}
          readOnly={readOnly}
          inputClassName={inputClassName}
          {...rest}
        />
      )}

      {helperText ? (
        <HelperLabel
          label={helperText}
          size="md"
          variant={danger ? "danger" : "default"}
          className={["w-full", helperCentered ? "justify-center" : ""]
            .filter(Boolean)
            .join(" ")}
        />
      ) : null}
    </div>
  );
}
