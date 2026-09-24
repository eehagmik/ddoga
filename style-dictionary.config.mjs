/**
 * Style Dictionary 빌드 설정 (v5).
 *
 * tokens/*.json (DTCG 문법) → src/tokens/_generated.css
 *
 * 출력은 Tailwind v4 CSS-first 문법을 그대로 재현한다:
 *   - `@import 'tailwindcss';` + `@theme static { ... }` 래퍼
 *   - Semantic → Primitive 참조를 var(--*) 로 유지 (outputReferences)
 *   - 와일드카드 리셋 `--text-*: initial;` 등 ("*" 키 토큰)
 *   - 합성 타이포의 companion 더블대시 `--text-title-1--line-height`
 *
 * 실행: npm run build:tokens  (= node style-dictionary.config.mjs)
 */

import { readFileSync } from "node:fs";
import StyleDictionary from "style-dictionary";
import { usesReferences, getReferences } from "style-dictionary/utils";

// ─────────────────────────────────────────────────────────────
// source — 배열 순서 = 출력 선언 순서
// ─────────────────────────────────────────────────────────────
const SOURCE = [
  "tokens/color/primitive.json",
  "tokens/color/semantic.json",
  "tokens/size.json",
  "tokens/radius.json",
  "tokens/border-width.json",
  "tokens/layout.json",
  "tokens/alpha.json",
  "tokens/shadow.json",
  "tokens/blur.json",
  "tokens/typography.json",
];

// ─────────────────────────────────────────────────────────────
// 그룹 $description 수집 — SD 는 format 에 넘기는 dictionary 에서 그룹(비 leaf)
// 노드의 메타($description)를 제거한다. 섹션 주석용으로 원본 JSON 에서 직접 읽는다.
// key = 그룹의 dotted path (예: "color", "color.red"), value = $description
// ─────────────────────────────────────────────────────────────
const GROUP_DESCRIPTIONS = (() => {
  const map = new Map();
  const collect = (node, path) => {
    if (!node || typeof node !== "object" || "$value" in node) return;
    if (typeof node.$description === "string" && path.length > 0) {
      map.set(path.join("."), node.$description);
    }
    for (const [k, v] of Object.entries(node)) {
      if (!k.startsWith("$")) collect(v, [...path, k]);
    }
  };
  for (const file of SOURCE) {
    collect(JSON.parse(readFileSync(file, "utf8")), []);
  }
  return map;
})();

// ─────────────────────────────────────────────────────────────
// (a) 커스텀 name 트랜스폼 — 규칙은 단 하나: path 를 '-' 로 join
//     ('color','green-gray','500') → 'color-green-gray-500'
//     ('text','2xs')               → 'text-2xs'   (표준 kebab 은 '2-xs')
//     ('color','black','a05')      → 'color-black-a05'
// ─────────────────────────────────────────────────────────────
StyleDictionary.registerTransform({
  name: "name/ddoga-path",
  type: "name",
  transform: (token) => token.path.join("-"),
});

// ─────────────────────────────────────────────────────────────
// (b) 커스텀 CSS 포맷
// ─────────────────────────────────────────────────────────────
StyleDictionary.registerFormat({
  name: "css/ddoga-theme",
  format: async ({ dictionary }) => {
    const tokens = dictionary.tokens;

    /** 값 문자열의 {ref} 를 var(--ref-name) 으로 치환. 참조 없으면 원문 그대로. */
    const resolveRefs = (raw) => {
      if (typeof raw !== "string" || !usesReferences(raw)) return raw;
      const refs = getReferences(raw, tokens, {
        usesDtcg: true,
        warnImmediately: false,
      });
      let out = raw;
      for (const ref of refs) {
        const re = new RegExp(
          `\\{${ref.path.join("\\.")}(?:\\.\\$value)?\\}`,
          "g",
        );
        out = out.replace(re, `var(--${ref.name})`);
      }
      return out;
    };

    const isLeaf = (node) =>
      node && typeof node === "object" && "$value" in node;
    const isGroup = (node) =>
      node &&
      typeof node === "object" &&
      !("$value" in node) &&
      Object.keys(node).some((k) => !k.startsWith("$"));

    /** 그룹의 자식 키 순서 결정: 전부 숫자로 시작하면 오름차순 정렬, 아니면 삽입 순서. */
    const orderedKeys = (node) => {
      const keys = Object.keys(node).filter((k) => !k.startsWith("$"));
      if (keys.length > 1 && keys.every((k) => /^\d/.test(k))) {
        return [...keys].sort((a, b) => parseFloat(a) - parseFloat(b));
      }
      return keys;
    };

    const lines = [];

    const emitLeaf = (node, depth) => {
      const ind = "  ".repeat(depth);
      const name = node.name;
      const orig = node.original.$value;

      // 합성 타이포: 객체 $value → companion 4줄 전개
      if (node.$type === "typography" && orig && typeof orig === "object") {
        lines.push(`${ind}--${name}: ${resolveRefs(orig.fontSize)};`);
        lines.push(
          `${ind}--${name}--line-height: ${resolveRefs(orig.lineHeight)};`,
        );
        lines.push(
          `${ind}--${name}--letter-spacing: ${resolveRefs(orig.letterSpacing)};`,
        );
        lines.push(
          `${ind}--${name}--font-weight: ${resolveRefs(orig.fontWeight)};`,
        );
        return;
      }

      const value = resolveRefs(orig);
      const decl = `${ind}--${name}: ${value};`;
      lines.push(
        node.$description ? `${decl} /* ${node.$description} */` : decl,
      );
    };

    const walk = (node, depth, path) => {
      for (const key of orderedKeys(node)) {
        const child = node[key];
        if (isLeaf(child)) {
          emitLeaf(child, depth);
        } else if (isGroup(child)) {
          const desc = GROUP_DESCRIPTIONS.get([...path, key].join("."));
          if (desc) {
            lines.push("");
            lines.push(`${"  ".repeat(depth)}/* ${desc} */`);
          }
          walk(child, depth, [...path, key]);
        }
      }
    };

    walk(tokens, 1, []);

    return [
      "/**",
      " * 자동 생성됨 — 직접 수정 금지.",
      " * 원본: tokens/*.json   ·   빌드: npm run build:tokens",
      " */",
      "",
      "@import 'tailwindcss';",
      "",
      "@theme static {",
      lines.join("\n"),
      "}",
      "",
      "/* 다크 모드: Semantic 토큰을 여기서 재정의한다 (Primitive·컴포넌트 불변).",
      " * TODO: Figma 에 Dark mode 값이 등록되면 채운다. 현재 Figma 는 Light 단일. */",
      "",
    ].join("\n");
  },
});

// ─────────────────────────────────────────────────────────────
// 빌드
// ─────────────────────────────────────────────────────────────
const sd = new StyleDictionary({
  source: SOURCE,
  platforms: {
    css: {
      transforms: ["name/ddoga-path"],
      buildPath: "src/tokens/",
      files: [
        {
          destination: "_generated.css",
          format: "css/ddoga-theme",
          options: { outputReferences: true },
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
console.log("✅ Style Dictionary 빌드 완료 → src/tokens/_generated.css");
