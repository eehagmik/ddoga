// Figma 원본 SVG → JSX children 문자열 정규화.
//
// 입력은 Figma /v1/images?format=svg 출력으로, 형태가 균일하다:
//   <svg preserveAspectRatio overflow style width height viewBox fill="none" xmlns>
//     <g id="name"><path fill-rule clip-rule d fill="#272727"/></g>
//   </svg>
// 따라서 정규식 기반 변환이 정당하다. <defs>/<mask>/<clipPath> 등 복잡 케이스는 감지해서
// 경고를 반환하고(호출부가 수동 검토), url(#id) 참조는 파일 스코프로 네임스페이스한다.

const KEBAB_TO_CAMEL = {
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "clip-path": "clipPath",
  "fill-opacity": "fillOpacity",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-opacity": "strokeOpacity",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "color-interpolation-filters": "colorInterpolationFilters",
  gradientUnits: "gradientUnits",
  gradientTransform: "gradientTransform",
  clipPathUnits: "clipPathUnits",
  maskUnits: "maskUnits",
  maskContentUnits: "maskContentUnits",
  "xlink:href": "href",
};

/** SVG 속성값에 든 하드코딩 색을 currentColor 로. 전 아이콘 단색이라 무차별 치환 안전. */
function recolor(svg) {
  return svg.replace(
    /((?:fill|stroke|stop-color)\s*=\s*")([^"]*)"/gi,
    (m, head, val) => {
      const v = val.trim().toLowerCase();
      if (v === "none" || v === "transparent" || v.startsWith("url(")) return m;
      return `${head}currentColor"`;
    },
  );
}

/** kebab / xlink 속성명을 JSX 카멜케이스로. */
function camelizeAttrs(svg) {
  return svg.replace(
    /(\s)([a-zA-Z-]+:[a-zA-Z-]+|[a-z-]+)(\s*=\s*")/g,
    (m, sp, name, tail) => {
      const mapped = KEBAB_TO_CAMEL[name];
      if (mapped) return `${sp}${mapped}${tail}`;
      if (name.includes("-") || name.includes(":")) {
        // 화이트리스트에 없는 kebab/ns 속성 — JSX 에서 그대로는 위험. 로그용으로 남기되 변환 시도.
        return `${sp}${name.replace(/[:-](\w)/g, (_, c) => c.toUpperCase())}${tail}`;
      }
      return m;
    },
  );
}

/**
 * @param {string} svgText  Figma 원본 SVG
 * @param {{ file: string }} opts  file: 아이콘 파일명(=id 네임스페이스 접두사)
 * @returns {{ viewBox: string, jsxChildren: string, warnings: string[] }}
 */
export function normalize(svgText, { file }) {
  const warnings = [];
  let svg = svgText
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .trim();

  const openMatch = svg.match(/<svg\b([^>]*)>/i);
  if (!openMatch) throw new Error(`<svg> 루트를 찾을 수 없음: ${file}`);

  const rootAttrs = openMatch[1];
  const vbMatch = rootAttrs.match(/viewBox\s*=\s*"([^"]*)"/i);
  const viewBox = vbMatch ? vbMatch[1].trim() : "0 0 24 24";
  if (viewBox !== "0 0 24 24")
    warnings.push(`viewBox 가 표준(0 0 24 24)이 아님: "${viewBox}"`);

  // 루트 <svg>...</svg> 껍데기 제거 → inner 만
  let inner = svg
    .replace(/<svg\b[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim();

  // 단일 래퍼 <g id="..."> (transform 없음) 언랩 — 반복
  let unwrapped = true;
  while (unwrapped) {
    unwrapped = false;
    const gWrap = inner.match(/^<g\b([^>]*)>([\s\S]*)<\/g>$/i);
    if (gWrap) {
      const gAttrs = gWrap[1];
      const hasMeaningful =
        /\b(transform|opacity|fill|stroke|clip-path|mask|style|filter)\s*=/i.test(
          gAttrs,
        );
      if (!hasMeaningful) {
        inner = gWrap[2].trim();
        unwrapped = true;
      }
    }
  }

  // 복잡 구조 감지
  if (
    /<(defs|mask|clipPath|filter|pattern|use|image|foreignObject)\b/i.test(
      inner,
    )
  ) {
    warnings.push(
      "defs/mask/clipPath/filter/pattern/use/image 포함 — 수동 검토 권장",
    );
  }

  // id 처리: 참조되는 id 만 파일 스코프로 네임스페이스, 나머지는 삭제
  const referenced = new Set();
  for (const m of inner.matchAll(/url\(#([^)]+)\)/g))
    referenced.add(m[1].trim());
  for (const m of inner.matchAll(/(?:xlink:href|href)\s*=\s*"#([^"]+)"/g))
    referenced.add(m[1].trim());

  inner = inner.replace(/\sid\s*=\s*"([^"]+)"/g, (m, id) => {
    const t = id.trim();
    return referenced.has(t) ? ` id="${file}__${t}"` : "";
  });
  for (const id of referenced) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    inner = inner
      .replace(new RegExp(`url\\(#${esc}\\)`, "g"), `url(#${file}__${id})`)
      .replace(
        new RegExp(`((?:xlink:href|href)\\s*=\\s*")#${esc}"`, "g"),
        `$1#${file}__${id}"`,
      );
  }

  inner = recolor(inner);
  inner = camelizeAttrs(inner);

  // 태그 사이 공백 정리 + 자기닫힘 정규화
  inner = inner
    .replace(/>\s+</g, "><")
    .replace(/\s*\/>/g, " />")
    .trim();

  if (!inner) throw new Error(`정규화 후 내용이 비었음: ${file}`);

  return { viewBox, jsxChildren: inner, warnings };
}
