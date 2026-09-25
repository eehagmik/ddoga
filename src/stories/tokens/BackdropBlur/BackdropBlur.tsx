/**
 * BackdropBlur 토큰 갤러리.
 *
 * Figma "또가3.0 Design System / BackdropBlur" (node 106:564) 와 1:1.
 * 넓은 면적의 UI 배경에 쓰는 흐림 효과 — CSS `backdrop-filter: blur()` 로 소비된다.
 * - dim: sz 8, 약한 흐림 (dim 오버레이 등)
 * - header: sz 16, 강한 흐림 (헤더 등)
 *
 * 각 토큰은 대비가 큰 배경 위에 반투명 "유리 패널"을 얹어 흐림 정도를 보여준다
 * (Figma 의 "Preview" 프레임과 같은 의도). 배경은 primitive 컬러 토큰으로 만든
 * CSS 반복 그라디언트, blur 는 정적 클래스 매핑으로 지정한다(동적 클래스는 스캐너가
 * 못 잡음). 리터럴 치수·색상 값 없음.
 */

export type BlurToken = "dim" | "header";

export type BackdropBlurProps = {
  /** 특정 토큰만 표시. 미지정 시 전체. */
  section?: BlurToken;
};

type TokenDef = {
  id: BlurToken;
  figmaVar: string;
  radiusPx: number;
  description: string;
};

const TOKENS: TokenDef[] = [
  {
    id: "dim",
    figmaVar: "backdropBlur/dim",
    radiusPx: 8,
    description:
      "약한 흐림. 콘텐츠 위에 얇게 씌우는 dim 오버레이처럼, 뒤 배경의 형태는 남기되 시선을 눌러야 할 때.",
  },
  {
    id: "header",
    figmaVar: "backdropBlur/header",
    radiusPx: 16,
    description:
      "강한 흐림. 스크롤에 겹쳐 고정되는 헤더·상단 바처럼, 뒤 콘텐츠와 확실히 분리해야 할 때.",
  },
];

/** 토큰 id → 정적 Tailwind 클래스 (동적 `backdrop-blur-${id}` 는 스캐너가 못 잡음) */
const BLUR_CLASS: Record<BlurToken, string> = {
  dim: "backdrop-blur-dim",
  header: "backdrop-blur-header",
};

/** 흐림이 잘 드러나도록 대비가 큰 배경 — primitive 컬러 토큰으로 만든 반복 그라디언트 */
const BACKDROP =
  "repeating-linear-gradient(135deg, var(--color-green-300) 0, var(--color-green-300) var(--sz-12), var(--color-blue-300) var(--sz-12), var(--color-blue-300) var(--sz-24))";

function Section({ token }: { token: TokenDef }) {
  const cssVar = `--blur-${token.id}`;
  return (
    <section data-section={token.id} className="flex flex-col gap-(--sz-16)">
      <div className="flex flex-col gap-(--sz-4)">
        <h2 className="text-2xl font-bold">{token.id}</h2>
        <p className="text-xs text-typo-neutral-light">{token.description}</p>
      </div>

      {/* 예시 패널 — Figma "Preview" 프레임과 동일 의도 */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ background: BACKDROP }}
      >
        <div
          data-token={cssVar}
          className={`m-(--sz-32) flex h-(--sz-100) items-center justify-center rounded-lg border border-solid border-border-inverse-subtle bg-bg-overlay-whiteNormal text-xs font-bold text-typo-neutral-normal ${BLUR_CLASS[token.id]}`}
        >
          {cssVar}
        </div>
      </div>

      {/* 토큰명 · 값 레퍼런스 */}
      <dl className="flex flex-wrap gap-x-(--sz-24) gap-y-(--sz-4)">
        <div className="flex gap-(--sz-8)">
          <dt className="text-2xs font-bold text-typo-neutral-light">token</dt>
          <dd className="text-2xs font-normal text-typo-neutral-normal">
            <code>{cssVar}</code> · <code>{BLUR_CLASS[token.id]}</code>
          </dd>
        </div>
        <div className="flex gap-(--sz-8)">
          <dt className="text-2xs font-bold text-typo-neutral-light">Figma</dt>
          <dd className="text-2xs font-normal text-typo-neutral-normal">
            <code>{token.figmaVar}</code>
          </dd>
        </div>
        <div className="flex gap-(--sz-8)">
          <dt className="text-2xs font-bold text-typo-neutral-light">value</dt>
          <dd className="text-2xs font-normal text-typo-neutral-normal">
            <code>{`blur(${token.radiusPx}px)`}</code> ←{" "}
            <code>{`sz ${token.radiusPx}`}</code>
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function BackdropBlur({ section }: BackdropBlurProps) {
  const tokens = section ? TOKENS.filter((t) => t.id === section) : TOKENS;
  return (
    <div className="flex flex-col gap-(--sz-32) bg-bg-neutral-deep p-(--sz-16) text-typo-neutral-normal">
      {tokens.map((t) => (
        <Section key={t.id} token={t} />
      ))}
    </div>
  );
}
