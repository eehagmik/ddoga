/**
 * Alpha 토큰 갤러리.
 *
 * Figma "또가3.0 Design System / Alpha" (node 2327:4758) 와 1:1.
 * 요소의 `opacity` 에 적용하는 불투명도 배수 스케일 — 오버레이·비활성 상태·구분선 등에
 * 일관된 투명도를 줄 때 쓴다. `--color-*-a<NN>` 알파 컬러 램프(색상 자체의 알파 채널)와는
 * 별개다.
 *
 * 각 스텝은 대비가 큰 배경 위에 표면(Layer)을 얹고 그 표면의 opacity 를 해당 토큰으로 낮춰
 * 투명도 단계를 눈으로 보여준다. 토큰명 라벨은 opacity 가 걸리지 않는 별도 레이어로 띄워
 * 알파가 커도 항상 선명하게 읽힌다. 배경은 primitive 컬러 토큰으로 만든 CSS 반복 그라디언트,
 * opacity 는 스텝별 정적 Tailwind 유틸 클래스 맵(OPACITY_CLASS)으로 지정한다(동적 클래스
 * 조립은 스캐너가 못 잡음 — BackdropBlur 와 동일 패턴). 리터럴 치수·색상 값 없음.
 */

export type AlphaStep = "00" | "05" | "10" | "20" | "40" | "60" | "80";

export type AlphaProps = {
  /** 특정 스텝만 표시. 미지정 시 전체. */
  section?: AlphaStep;
};

type TokenDef = {
  id: AlphaStep;
  figmaVar: string;
  percent: number;
  description: string;
};

const TOKENS: TokenDef[] = [
  {
    id: "00",
    figmaVar: "alpha/00",
    percent: 0,
    description: '완전 투명. 트랜지션 시작점이나 "없음" 상태를 명시할 때.',
  },
  {
    id: "05",
    figmaVar: "alpha/05",
    percent: 5,
    description: "극히 옅은 막. 구분선, hover 시 살짝 뜨는 배경 힌트.",
  },
  {
    id: "10",
    figmaVar: "alpha/10",
    percent: 10,
    description: "옅은 막. 눌린(pressed) 상태의 배경, 얇은 오버레이.",
  },
  {
    id: "20",
    figmaVar: "alpha/20",
    percent: 20,
    description: "비활성(disabled) 요소. 뒤 콘텐츠가 충분히 비쳐 보인다.",
  },
  {
    id: "40",
    figmaVar: "alpha/40",
    percent: 40,
    description: "dim 오버레이. 뒤 배경의 형태는 남기되 시선을 눌러야 할 때.",
  },
  {
    id: "60",
    figmaVar: "alpha/60",
    percent: 60,
    description: "강한 dim. 모달·바텀시트 뒤 배경처럼 콘텐츠를 확실히 가릴 때.",
  },
  {
    id: "80",
    figmaVar: "alpha/80",
    percent: 80,
    description: "거의 불투명. 살짝만 뒤가 비치는 표면.",
  },
];

/** 스텝 id → 정적 Tailwind opacity 유틸 클래스 (동적 조립은 스캐너가 못 잡아 맵으로 고정) */
const OPACITY_CLASS: Record<AlphaStep, string> = {
  "00": "opacity-[var(--alpha-00)]",
  "05": "opacity-[var(--alpha-05)]",
  "10": "opacity-[var(--alpha-10)]",
  "20": "opacity-[var(--alpha-20)]",
  "40": "opacity-[var(--alpha-40)]",
  "60": "opacity-[var(--alpha-60)]",
  "80": "opacity-[var(--alpha-80)]",
};

/** 투명도가 잘 드러나도록 대비가 큰 배경 — primitive 컬러 토큰으로 만든 반복 그라디언트 */
const BACKDROP =
  "repeating-linear-gradient(135deg, var(--color-green-300) 0, var(--color-green-300) var(--sz-12), var(--color-blue-300) var(--sz-12), var(--color-blue-300) var(--sz-24))";

function Section({ token }: { token: TokenDef }) {
  const cssVar = `--alpha-${token.id}`;
  return (
    <section
      data-section={token.id}
      className="flex flex-col gap-[var(--sz-16)]"
    >
      <div className="flex flex-col gap-[var(--sz-4)]">
        <h2 className="text-2xl font-bold">
          {token.id}{" "}
          <span className="text-lg font-normal text-typo-neutral-light">
            {token.percent}%
          </span>
        </h2>
        <p className="text-xs text-typo-neutral-light">{token.description}</p>
      </div>

      {/* 예시 패널 — 대비 큰 배경 위에서 투명도 단계가 눈에 보인다 */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ background: BACKDROP }}
      >
        {/* 알파가 적용된 표면 — 투명도 단계 시연 */}
        <div
          data-token={cssVar}
          className={`m-[var(--sz-32)] h-[var(--sz-100)] rounded-lg bg-bg-neutral-normal ${OPACITY_CLASS[token.id]}`}
        />
        {/* 토큰명 라벨 — opacity 미적용, 알파가 커도 항상 선명하게 읽힌다 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-md bg-bg-neutral-normal px-[var(--sz-12)] py-[var(--sz-6)] text-sm font-bold text-typo-neutral-normal shadow-black-xs">
            Layer · {cssVar}
          </span>
        </div>
      </div>

      {/* 토큰명 · 값 레퍼런스 */}
      <dl className="flex flex-wrap gap-x-[var(--sz-24)] gap-y-[var(--sz-4)]">
        <div className="flex gap-[var(--sz-8)]">
          <dt className="text-2xs font-bold text-typo-neutral-light">token</dt>
          <dd className="text-2xs font-normal text-typo-neutral-normal">
            <code>{cssVar}</code>
          </dd>
        </div>
        <div className="flex gap-[var(--sz-8)]">
          <dt className="text-2xs font-bold text-typo-neutral-light">Figma</dt>
          <dd className="text-2xs font-normal text-typo-neutral-normal">
            <code>{token.figmaVar}</code>
          </dd>
        </div>
        <div className="flex gap-[var(--sz-8)]">
          <dt className="text-2xs font-bold text-typo-neutral-light">value</dt>
          <dd className="text-2xs font-normal text-typo-neutral-normal">
            <code>{`opacity: ${token.percent / 100}`}</code>{" "}
            <span className="text-typo-neutral-light">({token.percent}%)</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function Alpha({ section }: AlphaProps) {
  const tokens = section ? TOKENS.filter((t) => t.id === section) : TOKENS;
  return (
    <div className="flex flex-col gap-[var(--sz-32)] bg-bg-neutral-deep p-[var(--sz-16)] text-typo-neutral-normal">
      {tokens.map((t) => (
        <Section key={t.id} token={t} />
      ))}
    </div>
  );
}
