/**
 * Style Dictionary 산출물(_generated.css) 회귀 테스트.
 *
 * 원본 tokens/*.json 을 고쳤을 때 커스텀 포맷이 깨지지 않았는지 검증한다.
 * (companion 더블대시 전개 / 와일드카드 리셋 / Semantic var() 참조 / 구조 라인)
 *
 * `pretest` 훅이 `npm run build:tokens` 를 먼저 돌리므로 항상 최신 산출물을 읽는다.
 */
import { describe, expect, it } from "vitest";
import css from "../_generated.css?raw";

/** 주석 제거 후 `--name: value` 선언 Map */
function declarations(source: string): Map<string, string> {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, " ");
  const map = new Map<string, string>();
  const re = /(--[a-zA-Z0-9*_-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stripped)) !== null) {
    map.set(m[1].trim(), m[2].replace(/\s+/g, " ").trim());
  }
  return map;
}

const decl = declarations(css);

describe("_generated.css 구조", () => {
  it("@import 'tailwindcss' 와 @theme static 래퍼를 포함한다", () => {
    expect(css).toMatch(/@import\s+['"]tailwindcss['"];/);
    expect(css).toMatch(/@theme\s+static\s*\{/);
  });

  it("와일드카드 리셋 라인 3종이 각각 정확히 1회 나온다", () => {
    for (const reset of ["--blur-*", "--font-weight-*", "--text-*"]) {
      const count = css.split(`${reset}: initial;`).length - 1;
      expect(count, reset).toBe(1);
    }
  });
});

describe("합성 타이포 companion 전개", () => {
  const COMPOSITES = [
    "display-1",
    "title-1",
    "title-2",
    "title-3",
    "body-1",
    "body-1-bold",
    "body-2",
    "body-2-bold",
    "body-3",
    "body-3-bold",
    "body-4",
    "body-4-bold",
    "body-5",
    "body-5-bold",
    "body-6",
    "body-6-bold",
    "label-1",
    "label-1-bold",
    "label-2",
    "label-2-bold",
    "label-3",
    "label-3-bold",
    "other-store-card",
    "other-price-1",
    "other-price-2",
  ];

  it("25종 × 4속성(base + 더블대시 companion 3개)이 모두 존재한다", () => {
    for (const name of COMPOSITES) {
      expect(decl.has(`--text-${name}`), `--text-${name}`).toBe(true);
      expect(
        decl.has(`--text-${name}--line-height`),
        `${name} line-height`,
      ).toBe(true);
      expect(
        decl.has(`--text-${name}--letter-spacing`),
        `${name} letter-spacing`,
      ).toBe(true);
      expect(
        decl.has(`--text-${name}--font-weight`),
        `${name} font-weight`,
      ).toBe(true);
    }
  });

  it("companion 총 개수가 25 × 3 = 75 이다", () => {
    expect((css.match(/--line-height:/g) ?? []).length).toBe(25);
    expect((css.match(/--letter-spacing:/g) ?? []).length).toBe(25);
    expect((css.match(/--text-[a-z0-9-]+--font-weight:/g) ?? []).length).toBe(
      25,
    );
  });
});

describe("Semantic → Primitive 참조", () => {
  it("semantic 색상은 raw hex 가 아니라 var(--*) 를 쓴다 (logo-ink 만 예외)", () => {
    for (const [name, value] of decl) {
      if (!/^--color-(bg|typo|border|icon|shadow|logo)-/.test(name)) continue;
      if (name === "--color-logo-ink") {
        expect(value).toBe("#262a30");
        continue;
      }
      expect(value, name).not.toMatch(/#[0-9a-f]{3,8}/i);
    }
  });

  it("대표 토큰 스냅샷", () => {
    expect(decl.get("--color-bg-brand-normal")).toBe("var(--color-green-500)");
    expect(decl.get("--color-bg-brandGrayish-none")).toBe(
      "var(--color-green-gray-a00)",
    );
    expect(decl.get("--color-red-500")).toBe("#f84b55");
    expect(decl.get("--sz-16")).toBe("1rem");
    expect(decl.get("--sz-9999")).toBe("9999px");
    expect(decl.get("--radius-circle")).toBe("var(--sz-9999)");
    expect(decl.get("--border-width-2xs")).toBe("0.5px");
    expect(decl.get("--layout-columns")).toBe("4");
    expect(decl.get("--alpha-05")).toBe("0.05");
    expect(decl.get("--text-title-1")).toBe("var(--text-3xl)");
    expect(decl.get("--text-title-1--font-weight")).toBe(
      "var(--font-weight-bold)",
    );
    expect(decl.get("--shadow-black-xs")).toBe(
      "0 var(--sz-1) var(--sz-2) var(--color-shadow-black-light), 0 var(--sz-2) var(--sz-4) var(--color-shadow-black-normal)",
    );
    expect(decl.get("--shadow-bottomNav")).toContain("calc(var(--sz-8) * -1)");
  });
});
