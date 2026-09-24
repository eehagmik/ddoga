import type { ReactNode } from "react";

/**
 * Size 토큰 갤러리.
 *
 * Figma "또가3.0 Design System / Size" (node 8:2887) 와 1:1.
 * - sz: Primitive 숫자 스케일 `--sz-<N>` (N = px). 티셔츠 단계 없이 자유 적용.
 * - radius / borderWidth: sz 를 참조하는 Semantic 별칭.
 *
 * 프리뷰의 크기·색·모서리·보더는 전부 토큰(`var(--sz-*)`, `var(--radius-*)`,
 * `var(--border-width-*)`, semantic 색 토큰)으로만 렌더한다 — 리터럴 값 없음.
 */

export type SizeSection = "sz" | "radius" | "borderWidth";

export type SizeProps = {
  /** 특정 섹션만 표시. 미지정 시 전체. */
  section?: SizeSection;
};

/** Figma Size 문서의 sz/<N> 전체 (N = px 값) */
const SZ: number[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32,
  34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 64, 68, 72, 76, 80,
  84, 88, 92, 96, 100, 128, 160, 192, 224, 256, 320, 9999,
];

/** radius/<t> → 참조하는 sz 값 */
const RADIUS: { t: string; sz: number }[] = [
  { t: "xs", sz: 4 },
  { t: "sm", sz: 6 },
  { t: "md", sz: 8 },
  { t: "lg", sz: 10 },
  { t: "xl", sz: 12 },
  { t: "2xl", sz: 16 },
  { t: "3xl", sz: 20 },
  { t: "circle", sz: 9999 },
];

/** borderWidth/<t> → 참조하는 sz 값 (2xs 는 sz 에 없는 raw 값) */
const BORDER_WIDTH: { t: string; sz: number }[] = [
  { t: "2xs", sz: 0.5 },
  { t: "xs", sz: 1 },
  { t: "sm", sz: 2 },
  { t: "md", sz: 3 },
  { t: "lg", sz: 4 },
  { t: "xl", sz: 6 },
];

const SECTION_ORDER: SizeSection[] = ["sz", "radius", "borderWidth"];

/** N(px) → rem 표기. 0 과 센티넬은 예외. */
function toRem(n: number): string {
  if (n === 0) return "0";
  if (n === 9999) return "—";
  return `${+(n / 16).toFixed(4)}rem`;
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: SizeSection;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section data-section={id} className="flex flex-col gap-[var(--sz-16)]">
      <div className="flex flex-col gap-[var(--sz-4)]">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-xs text-typo-neutral-light">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SzRow({ n }: { n: number }) {
  return (
    <div
      data-token={`--sz-${n}`}
      className="flex items-center gap-[var(--sz-12)] border-solid border-b border-border-neutral-light py-[var(--sz-6)]"
    >
      <code className="w-[var(--sz-100)] shrink-0 text-2xs font-normal text-typo-neutral-normal">
        --sz-{n}
      </code>
      <span className="w-[var(--sz-48)] shrink-0 text-2xs text-typo-neutral-light">{`${n}px`}</span>
      <span className="w-[var(--sz-72)] shrink-0 text-2xs text-typo-neutral-light">
        {toRem(n)}
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span
          className="block h-[var(--sz-8)] rounded-xs bg-bg-brand-normal"
          style={{ width: `var(--sz-${n})` }}
        />
      </span>
    </div>
  );
}

function RadiusCell({ t, sz }: { t: string; sz: number }) {
  return (
    <div
      data-token={`--radius-${t}`}
      className="flex flex-col items-center gap-[var(--sz-8)]"
    >
      <div
        className="h-[var(--sz-72)] w-[var(--sz-72)] border-solid border border-border-brand-normal bg-bg-brand-light"
        style={{ borderRadius: `var(--radius-${t})` }}
      />
      <div className="flex flex-col items-center">
        <code className="text-2xs font-normal text-typo-neutral-normal">
          --radius-{t}
        </code>
        <span className="text-2xs text-typo-neutral-light">{`${sz}px`}</span>
      </div>
    </div>
  );
}

function BorderWidthCell({ t, sz }: { t: string; sz: number }) {
  return (
    <div
      data-token={`--border-width-${t}`}
      className="flex flex-col items-center gap-[var(--sz-8)]"
    >
      <div
        className="h-[var(--sz-72)] w-[var(--sz-72)] rounded-sm border-solid border-border-brand-normal bg-bg-brand-light"
        style={{ borderWidth: `var(--border-width-${t})` }}
      />
      <div className="flex flex-col items-center">
        <code className="text-2xs font-normal text-typo-neutral-normal">
          --border-width-{t}
        </code>
        <span className="text-2xs text-typo-neutral-light">{`${sz}px`}</span>
      </div>
    </div>
  );
}

export function Size({ section }: SizeProps) {
  const sections = section ? [section] : SECTION_ORDER;

  return (
    <div className="flex flex-col gap-[var(--sz-32)] bg-bg-neutral-normal p-[var(--sz-16)] text-typo-neutral-normal">
      {sections.includes("sz") && (
        <Section
          id="sz"
          title="sz"
          description="사이즈 관련 요소(width, height, padding…)에 적용되는 모든 숫자 값. 0~9 낱개 지정, 10~60 2의 배수, 64~100 4의 배수, 128~ 임의의 짝수, 9999 원형 제작용. 값은 rem(= N / 16). Figma 에서는 디자이너가 쓰는 스케일이고, 코드에서는 시맨틱(radius·borderWidth)이 없는 크기 값에 직접 쓴다."
        >
          <div className="flex flex-col">
            {SZ.map((n) => (
              <SzRow key={n} n={n} />
            ))}
          </div>
        </Section>
      )}

      {sections.includes("radius") && (
        <Section
          id="radius"
          title="radius"
          description="요소의 둥근 모서리. sz 별칭이며 Tailwind rounded-<t> 유틸이 자동 생성된다."
        >
          <div className="grid grid-cols-2 gap-[var(--sz-16)] sm:grid-cols-4 lg:grid-cols-8">
            {RADIUS.map(({ t, sz }) => (
              <RadiusCell key={t} t={t} sz={sz} />
            ))}
          </div>
        </Section>
      )}

      {sections.includes("borderWidth") && (
        <Section
          id="borderWidth"
          title="borderWidth"
          description="border 의 굵기. sz 별칭이며 Tailwind border-<t> 유틸이 자동 생성된다. 2xs 만 sz 에 없는 raw 서브픽셀 값."
        >
          <div className="grid grid-cols-2 gap-[var(--sz-16)] sm:grid-cols-3 lg:grid-cols-6">
            {BORDER_WIDTH.map(({ t, sz }) => (
              <BorderWidthCell key={t} t={t} sz={sz} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
