import { useEffect, useRef, useState } from "react";

/**
 * Semantic 컬러 토큰 갤러리.
 *
 * Figma "또하나3.0 Design System / Sementic Color List" (node 282:7595) 와 1:1.
 * 각 스와치는 `var(--color-<element>-<role>-<brightness>)` 를 그대로 렌더한다.
 * (값은 Primitive 참조 — 여기서 색상 리터럴을 쓰지 않는다.)
 */

export type SemanticElement = "bg" | "typo" | "border" | "icon" | "shadow";

export type SemanticColorsProps = {
  /** 특정 UI Element 만 표시. 미지정 시 전체. */
  element?: SemanticElement;
};

/** element → role → brightness[] (Figma 에 실제 정의된 조합만) */
const TOKENS: Record<SemanticElement, Record<string, string[]>> = {
  bg: {
    neutral: ["none", "normal", "deep", "dark", "deepDark"],
    brand: ["bright", "light", "subtle", "normal", "deep", "dark"],
    brandGrayish: ["none", "normal", "deep", "dark"],
    danger: ["bright", "light", "subtle", "normal", "deep", "dark"],
    warning: ["bright", "light", "subtle", "normal", "deep", "dark"],
    info: ["bright", "light", "subtle", "normal", "deep", "dark"],
    disabled: ["subtle", "normal", "deep", "dark"],
    inverse: ["normal", "deep"],
    overlay: [
      "blackNone",
      "blackSubtle",
      "blackNormal",
      "blackDeep",
      "blackDark",
      "whiteNone",
      "whiteSubtle",
      "whiteNormal",
      "whiteDeep",
      "whiteDark",
      "greenGraySubtle",
      "greenGrayNormal",
      "greenGrayDeep",
      "greenGrayDark",
    ],
  },
  typo: {
    neutral: ["bright", "light", "subtle", "normal"],
    brand: ["subtle", "normal", "deep", "dark"],
    danger: ["subtle", "normal", "deep", "dark"],
    warning: ["subtle", "normal", "deep", "dark"],
    info: ["subtle", "normal", "deep", "dark"],
    hint: ["light", "subtle", "normal"],
    disabled: ["subtle", "normal"],
    inverse: ["normal"],
    gradient: ["highlight"],
  },
  border: {
    neutral: [
      "bright",
      "light",
      "subtle",
      "normal",
      "deep",
      "dark",
      "deepDark",
    ],
    brand: ["light", "subtle", "normal", "deep", "dark"],
    brandGrayish: ["bright", "light", "subtle", "normal"],
    danger: ["light", "subtle", "normal", "deep", "dark"],
    warning: ["light", "subtle", "normal", "deep", "dark"],
    info: ["light", "subtle", "normal", "deep", "dark"],
    disabled: ["normal", "deep", "dark"],
    inverse: ["light", "subtle", "normal", "deep", "dark"],
    gradient: ["highlight"],
  },
  icon: {
    neutral: ["bright", "light", "subtle", "normal"],
    brand: ["subtle", "normal", "deep", "dark"],
    brandGrayish: ["light", "subtle", "normal"],
    danger: ["subtle", "normal", "deep", "dark"],
    warning: ["subtle", "normal", "deep", "dark"],
    info: ["subtle", "normal", "deep", "dark"],
    disabled: ["light", "subtle", "normal", "deep", "dark"],
    inverse: ["subtle", "normal"],
  },
  shadow: {
    black: ["light", "normal"],
    greenGray: ["light", "normal"],
  },
};

const ELEMENT_ORDER: SemanticElement[] = [
  "bg",
  "typo",
  "border",
  "icon",
  "shadow",
];

/** 알파 토큰이 보이도록 스와치 뒤에 까는 체커 패턴 (토큰만 사용) */
const CHECKER =
  "repeating-conic-gradient(from 45deg, var(--color-gray-100) 0deg 90deg, var(--color-white-pure) 90deg 180deg)";
const CHECKER_SIZE = {
  backgroundImage: CHECKER,
  backgroundSize: "var(--sz-16) var(--sz-16)",
} as const;

function Swatch({ token, label }: { token: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    setValue(
      style.backgroundImage !== "none"
        ? style.backgroundImage
        : style.backgroundColor,
    );
  }, [token]);

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border-neutral-light">
      <div className="relative h-16 w-full" style={CHECKER_SIZE}>
        <div
          ref={ref}
          className="absolute inset-0"
          style={{ background: `var(${token})` }}
          data-token={token}
        />
      </div>
      <div className="flex flex-col gap-[var(--sz-2)] bg-bg-neutral-normal px-[var(--sz-8)] py-[var(--sz-4)]">
        <span className="text-2xs font-normal text-typo-neutral-normal">
          {label}
        </span>
        <span className="text-2xs break-all text-typo-neutral-light">
          {token.replace("--color-", "")}
        </span>
        {value && (
          <span className="text-2xs break-all text-typo-hint-normal">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export function SemanticColors({ element }: SemanticColorsProps) {
  const elements = element ? [element] : ELEMENT_ORDER;

  return (
    <div className="flex flex-col gap-[var(--sz-32)] bg-bg-neutral-normal p-[var(--sz-16)] text-typo-neutral-normal">
      {elements.map((el) => (
        <section
          key={el}
          data-element={el}
          className="flex flex-col gap-[var(--sz-16)]"
        >
          <h2 className="text-2xl font-bold">{el}</h2>
          {Object.entries(TOKENS[el]).map(([role, brightnesses]) => (
            <div key={role} className="flex flex-col gap-[var(--sz-8)]">
              <h3 className="text-xs font-normal text-typo-neutral-light">
                {role}
              </h3>
              <div className="grid grid-cols-2 gap-[var(--sz-12)] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {brightnesses.map((brightness) => (
                  <Swatch
                    key={brightness}
                    label={brightness}
                    token={`--color-${el}-${role}-${brightness}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
