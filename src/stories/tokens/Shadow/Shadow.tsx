/**
 * Shadow 토큰 갤러리.
 *
 * Figma "또가3.0 Design System / Shadow" (node 106:181) 와 1:1.
 * - black / greenGray: drop shadow 2겹 (light + normal 색). xs~xl 5단계.
 * - bottomNav: 하단 네비 위로 뜨는 그림자 (음수 Y offset), greenGray.
 * - borderNeutral / borderBrand: inset shadow 로 그리는 외곽선. xs/sm/md.
 *
 * 각 그룹은 Figma 의 "Preview" 프레임과 같은 예시 패널 — 흰 카드에 그림자를
 * 얹은 80px 칩을 나열 — 로 렌더한다. boxShadow 는 동적 클래스를 스캐너가
 * 못 잡으므로 인라인 `style` 의 `var()` 로 지정한다. 리터럴 값 없음.
 */

export type ShadowGroup =
  "black" | "greenGray" | "bottomNav" | "borderNeutral" | "borderBrand";

export type ShadowProps = {
  /** 특정 그룹만 표시. 미지정 시 전체. */
  section?: ShadowGroup;
};

type GroupDef = {
  id: ShadowGroup;
  title: string;
  description: string;
  steps: string[];
};

const GROUPS: GroupDef[] = [
  {
    id: "black",
    title: "black",
    description:
      "monotone 그림자. 배경에서 요소를 띄우는 기본 elevation. light + normal 2겹, xs→xl 로 깊어진다.",
    steps: ["xs", "sm", "md", "lg", "xl"],
  },
  {
    id: "greenGray",
    title: "greenGray",
    description:
      "brandGrayish 톤 그림자. brand 표면(카드·시트 등)에 자연스럽게 어울린다. light + normal 2겹.",
    steps: ["xs", "sm", "md", "lg", "xl"],
  },
  {
    id: "bottomNav",
    title: "bottomNav",
    description:
      "하단 고정 네비게이션이 콘텐츠 위로 떠 보이도록 위쪽으로 드리우는 그림자. greenGray, 음수 Y offset.",
    steps: ["bottomNav"],
  },
  {
    id: "borderNeutral",
    title: "borderNeutral",
    description:
      "neutral 외곽선을 inset shadow 로 표현. 레이아웃을 밀지 않는 sz 1·2·3 두께 테두리.",
    steps: ["xs", "sm", "md"],
  },
  {
    id: "borderBrand",
    title: "borderBrand",
    description:
      "brand 외곽선을 inset shadow 로 표현. 포커스·선택 상태 강조에 사용.",
    steps: ["xs", "sm", "md"],
  },
];

/** 그룹·스텝 → 토큰명 (bottomNav 는 스텝 없는 단일 토큰) */
function tokenName(group: ShadowGroup, step: string): string {
  return group === "bottomNav"
    ? "--shadow-bottomNav"
    : `--shadow-${group}-${step}`;
}

function Section({ group }: { group: GroupDef }) {
  return (
    <section
      data-section={group.id}
      className="flex flex-col gap-[var(--sz-16)]"
    >
      <div className="flex flex-col gap-[var(--sz-4)]">
        <h2 className="text-2xl font-bold">{group.title}</h2>
        <p className="text-xs text-typo-neutral-light">{group.description}</p>
      </div>

      {/* 예시 패널 — Figma "Preview" 프레임과 동일 */}
      <div className="rounded-xl bg-bg-neutral-normal px-[var(--sz-32)] py-[var(--sz-16)]">
        {/* 내부 컨테이너 — 큰 그림자(xl ≈ 42)가 패널 경계선에 닿지 않도록 위아래 sz-40 여유 */}
        <div className="flex flex-wrap items-center justify-center gap-[var(--sz-32)] py-[var(--sz-40)]">
          {group.steps.map((step) => {
            const token = tokenName(group.id, step);
            return (
              <div
                key={step}
                data-token={token}
                className="flex h-[var(--sz-72)] w-[var(--sz-72)] shrink-0 items-center justify-center rounded-md bg-bg-neutral-normal text-xs font-normal text-typo-neutral-light"
                style={{ boxShadow: `var(${token})` }}
              >
                {group.id === "bottomNav" ? "↑" : step}
              </div>
            );
          })}
        </div>
      </div>

      {/* 토큰명 레퍼런스 */}
      <ul className="flex flex-wrap gap-x-[var(--sz-16)] gap-y-[var(--sz-4)]">
        {group.steps.map((step) => (
          <li key={step}>
            <code className="text-2xs font-normal text-typo-neutral-normal">
              {tokenName(group.id, step)}
            </code>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Shadow({ section }: ShadowProps) {
  const groups = section ? GROUPS.filter((g) => g.id === section) : GROUPS;
  return (
    <div className="flex flex-col gap-[var(--sz-32)] bg-bg-neutral-deep p-[var(--sz-16)] text-typo-neutral-normal">
      {groups.map((g) => (
        <Section key={g.id} group={g} />
      ))}
    </div>
  );
}
