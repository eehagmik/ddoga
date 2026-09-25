import type { CSSProperties, ReactNode } from "react";

/**
 * Typography 토큰 갤러리.
 *
 * - 원시 (family·weight·size): Figma "또가3.0 Design System / Font" (node 2111:2108).
 *   family `--font-sans`(Pretendard), weight `--font-weight-normal`(Medium/500)·`--font-weight-bold`(Bold/700),
 *   size `--text-<step>` 2xs~5xl 9단계 (Tailwind `text-<step>` 유틸 자동 생성).
 * - 합성 (typo_*): Figma "Typography" (node 21:1978) 의 텍스트 스타일.
 *   weight+size+line-height+letter-spacing 를 한 스타일로 묶는다.
 *   Figma 표기 `typo_<cat>_<n>[_bold]` ↔ 코드 `--text-<cat>-<n>[-bold]` ↔ 유틸 `text-<cat>-<n>[-bold]`.
 *   색상은 스타일에 포함하지 않는다 — `text-typo-*` 시맨틱 색상으로 별도 지정.
 *
 * 미리보기는 전부 토큰(`var(--font-sans)`, `var(--font-weight-*)`, `var(--text-*)` 및
 * 컴패니언 `var(--text-<name>--line-height)` 등)으로만 렌더한다 — 리터럴 값 없음.
 */

export type TypographySection =
  | "family"
  | "weight"
  | "size"
  | "display"
  | "title"
  | "body"
  | "label"
  | "other";

export type TypographyProps = {
  /** 특정 섹션만 표시. 미지정 시 전체. */
  section?: TypographySection;
};

const SECTION_ORDER: TypographySection[] = [
  "family",
  "weight",
  "size",
  "display",
  "title",
  "body",
  "label",
  "other",
];

/** 한글·영문·숫자가 섞인 원시 섹션 미리보기 문구 */
const SAMPLE = "또하나의가족 실버케어 AaBbGg 0123";

/** 합성 섹션 미리보기 문구 (Figma 문서와 동일) */
const STYLE_SAMPLE = "또하나의가족에서 요양시설을 검색해 보세요";

/** family/<name> — Figma 는 normal 단일 */
const FAMILY: { token: string; label: string; fallback: string }[] = [
  {
    token: "--font-sans",
    label: "Pretendard",
    fallback: "ui-sans-serif · system-ui · Apple SD Gothic Neo · Malgun Gothic",
  },
];

/** weight/<step> → 숫자 값 (Figma: normal=Medium, bold=Bold) */
const WEIGHT: { t: string; label: string; n: number }[] = [
  { t: "normal", label: "Medium", n: 500 },
  { t: "bold", label: "Bold", n: 700 },
];

/** size/<step> → px 값 (rem = px / 16). Figma font/size 와 1:1 (4xl 없음). */
const SIZE: { t: string; px: number }[] = [
  { t: "2xs", px: 12 },
  { t: "xs", px: 14 },
  { t: "sm", px: 16 },
  { t: "md", px: 18 },
  { t: "lg", px: 20 },
  { t: "xl", px: 22 },
  { t: "2xl", px: 24 },
  { t: "3xl", px: 26 },
  { t: "5xl", px: 30 },
];

type StyleCategory = "display" | "title" | "body" | "label" | "other";

/** 합성 텍스트 스타일 1건 (Figma "Typography" 문서와 1:1) */
type TextStyle = {
  /** 코드 이름: `--text-<name>` / 유틸 `text-<name>` */
  name: string;
  /** Figma 문서 표기명 */
  figma: string;
  /** 참조 size step (SIZE 의 t) */
  sizeStep: string;
  /** 두께 — --font-weight-<weight> */
  weight: "normal" | "bold";
  /** line-height (무단위 비율) */
  lh: number;
  /** letter-spacing (Figma % 값. em = pct / 100) */
  lsPct: number;
  /** 권장 색상 유틸 (other 전용) */
  colorClass?: string;
  /** 권장 색상 토큰명 (other 전용) */
  colorToken?: string;
};

const STYLES: Record<
  StyleCategory,
  { description: string; items: TextStyle[] }
> = {
  display: {
    description:
      "가장 주요하게 나타낸다. 단독 컨텐츠 또는 랜딩페이지에 주로 쓴다. ex) 온보딩, 장기요양테스트, 파트너스 소개페이지.",
    items: [
      {
        name: "display-1",
        figma: "typo_display_1",
        sizeStep: "5xl",
        weight: "bold",
        lh: 1.4,
        lsPct: -1,
      },
    ],
  },
  title: {
    description: "화면 및 섹션의 주제를 나타낸다.",
    items: [
      {
        name: "title-1",
        figma: "typo_title_1",
        sizeStep: "3xl",
        weight: "bold",
        lh: 1.46,
        lsPct: -1,
      },
      {
        name: "title-2",
        figma: "typo_title_2",
        sizeStep: "2xl",
        weight: "bold",
        lh: 1.43,
        lsPct: -1,
      },
      {
        name: "title-3",
        figma: "typo_title_3",
        sizeStep: "xl",
        weight: "bold",
        lh: 1.38,
        lsPct: -1,
      },
    ],
  },
  body: {
    description: "본문을 나타낸다.",
    items: [
      {
        name: "body-1",
        figma: "typo_body_1",
        sizeStep: "xl",
        weight: "normal",
        lh: 1.56,
        lsPct: -1,
      },
      {
        name: "body-1-bold",
        figma: "typo_body_1_bold",
        sizeStep: "xl",
        weight: "bold",
        lh: 1.56,
        lsPct: -1.5,
      },
      {
        name: "body-2",
        figma: "typo_body_2",
        sizeStep: "lg",
        weight: "normal",
        lh: 1.48,
        lsPct: -1,
      },
      {
        name: "body-2-bold",
        figma: "typo_body_2_bold",
        sizeStep: "lg",
        weight: "bold",
        lh: 1.48,
        lsPct: -1.5,
      },
      {
        name: "body-3",
        figma: "typo_body_3",
        sizeStep: "md",
        weight: "normal",
        lh: 1.47,
        lsPct: -1,
      },
      {
        name: "body-3-bold",
        figma: "typo_body_3_bold",
        sizeStep: "md",
        weight: "bold",
        lh: 1.47,
        lsPct: -1.5,
      },
      {
        name: "body-4",
        figma: "typo_body_4",
        sizeStep: "sm",
        weight: "normal",
        lh: 1.47,
        lsPct: -1,
      },
      {
        name: "body-4-bold",
        figma: "typo_body_4_bold",
        sizeStep: "sm",
        weight: "bold",
        lh: 1.47,
        lsPct: -1.5,
      },
      {
        name: "body-5",
        figma: "typo_body_5",
        sizeStep: "xs",
        weight: "normal",
        lh: 1.46,
        lsPct: -1,
      },
      {
        name: "body-5-bold",
        figma: "typo_body_5_bold",
        sizeStep: "xs",
        weight: "bold",
        lh: 1.46,
        lsPct: -1.5,
      },
      {
        name: "body-6",
        figma: "typo_body_6",
        sizeStep: "2xs",
        weight: "normal",
        lh: 1.4,
        lsPct: -1,
      },
      {
        name: "body-6-bold",
        figma: "typo_body_6_bold",
        sizeStep: "2xs",
        weight: "bold",
        lh: 1.4,
        lsPct: -1.5,
      },
    ],
  },
  label: {
    description:
      "주요 구성요소의 라벨과 같은 작은 항목에 쓴다. 2줄 이상 문구에는 쓰지 않는다. ex) Chip, Map Pin.",
    items: [
      {
        name: "label-1",
        figma: "typo_label_1",
        sizeStep: "sm",
        weight: "normal",
        lh: 1,
        lsPct: -1,
      },
      {
        name: "label-1-bold",
        figma: "typo_label_1_bold",
        sizeStep: "sm",
        weight: "bold",
        lh: 1,
        lsPct: -1.5,
      },
      {
        name: "label-2",
        figma: "typo_label_2",
        sizeStep: "xs",
        weight: "normal",
        lh: 1,
        lsPct: -1,
      },
      {
        name: "label-2-bold",
        figma: "typo_label_2_bold",
        sizeStep: "xs",
        weight: "bold",
        lh: 1,
        lsPct: -1.5,
      },
      {
        name: "label-3",
        figma: "typo_label_3",
        sizeStep: "2xs",
        weight: "normal",
        lh: 1,
        lsPct: -1,
      },
      {
        name: "label-3-bold",
        figma: "typo_label_3_bold",
        sizeStep: "2xs",
        weight: "bold",
        lh: 1,
        lsPct: -1.5,
      },
    ],
  },
  other: {
    description:
      "위 스타일 외에 특수한 상황을 구분하여 쓴다. 색상은 스타일에 함께 고정된다.",
    items: [
      {
        name: "other-store-card",
        figma: "typo_other_storeCard",
        sizeStep: "sm",
        weight: "normal",
        lh: 1.24,
        lsPct: -1,
        colorClass: "text-typo-neutral-subtle",
        colorToken: "--color-typo-neutral-subtle",
      },
      {
        name: "other-price-1",
        figma: "typo_other_price_1",
        sizeStep: "xs",
        weight: "normal",
        lh: 1,
        lsPct: -1,
        colorClass: "text-typo-neutral-light",
        colorToken: "--color-typo-neutral-light",
      },
      {
        name: "other-price-2",
        figma: "typo_other_price_2",
        sizeStep: "2xs",
        weight: "normal",
        lh: 1,
        lsPct: -1,
        colorClass: "text-typo-neutral-light",
        colorToken: "--color-typo-neutral-light",
      },
    ],
  },
};

const STYLE_ORDER: StyleCategory[] = [
  "display",
  "title",
  "body",
  "label",
  "other",
];

/** N(px) → rem 표기 (리터럴 rem 을 소스에 남기지 않으려 런타임 조립) */
function toRem(px: number): string {
  return `${+(px / 16).toFixed(4)}rem`;
}

/** size step → px (SIZE 조회) */
function stepPx(step: string): number {
  return SIZE.find((s) => s.t === step)?.px ?? 0;
}

/** 합성 스타일 메타 문자열 (리터럴 없이 런타임 조립) */
function styleMeta(s: TextStyle): string {
  const px = stepPx(s.sizeStep);
  const weightLabel = s.weight === "bold" ? "Bold" : "Medium";
  const size = `${px}px (${toRem(px)})`;
  const lh = `LH ${s.lh} (${Math.round(s.lh * 100)}%)`;
  const ls = `LS ${s.lsPct}% (${s.lsPct / 100}em)`;
  return `${weightLabel} · ${size} · ${lh} · ${ls} · text-${s.name}`;
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: TypographySection;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section data-section={id} className="flex flex-col gap-(--sz-16)">
      <div className="flex flex-col gap-(--sz-4)">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-xs text-typo-neutral-light">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Row({
  token,
  figmaName,
  meta,
  preview,
  style,
  previewClassName,
}: {
  token: string;
  figmaName?: string;
  meta: string;
  preview: string;
  style?: CSSProperties;
  previewClassName?: string;
}) {
  return (
    <div
      data-token={token}
      className="flex flex-col gap-(--sz-4) border-solid border-b border-border-neutral-light py-(--sz-12)"
    >
      <div className="flex flex-wrap items-baseline gap-x-(--sz-12) gap-y-(--sz-2)">
        {figmaName && (
          <code className="text-2xs font-bold text-typo-neutral-normal">
            {figmaName}
          </code>
        )}
        <code className="text-2xs font-normal text-typo-neutral-light">
          {token}
        </code>
        <span className="text-2xs text-typo-neutral-light">{meta}</span>
      </div>
      <span
        className={`min-w-0 truncate ${previewClassName ?? "text-typo-neutral-normal"}`}
        style={style}
      >
        {preview}
      </span>
    </div>
  );
}

export function Typography({ section }: TypographyProps) {
  const sections = section ? [section] : SECTION_ORDER;

  return (
    <div className="flex flex-col gap-(--sz-32) bg-bg-neutral-normal p-(--sz-16) text-typo-neutral-normal">
      {sections.includes("family") && (
        <Section
          id="family"
          title="family"
          description="서체는 Pretendard 단일. `--font-sans` 로 등록되어 Tailwind Preflight 가 페이지 기본 서체로 적용한다. 웹폰트 파일 로딩은 후속 작업이라, 아직은 fallback 서체로 표시된다."
        >
          <div className="flex flex-col">
            {FAMILY.map((f) => (
              <Row
                key={f.token}
                token={f.token}
                meta={`${f.label} — fallback: ${f.fallback}`}
                preview={SAMPLE}
                style={{ fontFamily: `var(${f.token})` }}
              />
            ))}
          </div>
        </Section>
      )}

      {sections.includes("weight") && (
        <Section
          id="weight"
          title="weight"
          description="디자인 시스템은 Medium·Bold 2단계만 쓴다. 본문·기본은 font-normal(=Medium), 강조·제목은 font-bold. 그 외 Tailwind 기본 두께 유틸(font-medium·font-semibold 등)은 토큰 초기화로 제거됐다."
        >
          <div className="flex flex-col">
            {WEIGHT.map((w) => (
              <Row
                key={w.t}
                token={`--font-weight-${w.t}`}
                meta={`${w.label} · ${w.n} · font-${w.t}`}
                preview={SAMPLE}
                style={{ fontWeight: `var(--font-weight-${w.t})` }}
              />
            ))}
          </div>
        </Section>
      )}

      {sections.includes("size") && (
        <Section
          id="size"
          title="size"
          description="Figma font/size/<step> 와 1:1 (4xl 없음, 9단계). `--text-<step>` 로 등록되어 Tailwind text-<step> 유틸이 자동 생성된다. 값은 rem(= px / 16). line-height·letter-spacing 은 아래 합성 스타일에서 묶어 토큰화한다."
        >
          <div className="flex flex-col">
            {SIZE.map(({ t, px }) => (
              <Row
                key={t}
                token={`--text-${t}`}
                meta={`${px}px · ${toRem(px)} · text-${t}`}
                preview={SAMPLE}
                style={{ fontSize: `var(--text-${t})` }}
              />
            ))}
          </div>
        </Section>
      )}

      {STYLE_ORDER.filter((cat) => sections.includes(cat)).map((cat) => (
        <Section
          key={cat}
          id={cat}
          title={cat}
          description={STYLES[cat].description}
        >
          <div className="flex flex-col">
            {STYLES[cat].items.map((s) => (
              <Row
                key={s.name}
                token={`--text-${s.name}`}
                figmaName={s.figma}
                meta={
                  s.colorToken
                    ? `${styleMeta(s)} · ${s.colorToken}`
                    : styleMeta(s)
                }
                preview={STYLE_SAMPLE}
                previewClassName={s.colorClass}
                style={{
                  fontSize: `var(--text-${s.name})`,
                  lineHeight: `var(--text-${s.name}--line-height)`,
                  letterSpacing: `var(--text-${s.name}--letter-spacing)`,
                  fontWeight: `var(--text-${s.name}--font-weight)`,
                }}
              />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}
