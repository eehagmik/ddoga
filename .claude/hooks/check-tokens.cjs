#!/usr/bin/env node
/**
 * PostToolUse hook — 토큰 하드코딩 감지.
 *
 * Edit/Write/MultiEdit 후 대상 파일을 스캔해서 하드코딩된 색상/치수를 찾는다.
 * 위반 발견 시 stderr로 상세를 출력하고 exit 2 → 편집이 차단되고 Claude에 피드백된다.
 *
 * 규칙 근거: 루트 CLAUDE.md "1. 토큰 사용 규칙".
 */

"use strict";

const fs = require("fs");
const path = require("path");

const TARGET_EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".css", ".scss"]);

// 검사 제외: 토큰 정의 파일 자체 (여기서는 색상/치수 리터럴이 "정의"이다)
// _generated.css 는 Style Dictionary 산출물 (원본은 tokens/*.json)
const EXCLUDE_BASENAMES = new Set([
  "tokens.css",
  "theme.css",
  "_generated.css",
]);

/** stdin(JSON)을 동기적으로 읽는다. */
function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function getFilePath(payload) {
  const ti = payload.tool_input || {};
  return ti.file_path || ti.path || (ti.edits && ti.file_path) || null;
}

/** 라인이 통째로 주석인지(대충) 판별 — 오탐 완화용. */
function isCommentLine(line) {
  const t = line.trim();
  return (
    t.startsWith("//") ||
    t.startsWith("*") ||
    t.startsWith("/*") ||
    t.startsWith("<!--")
  );
}

/**
 * 한 줄에서 위반을 찾는다. { type, value } 배열 반환.
 * 허용: 0, 1px 보더, var(--*) 내부, 50%/100%/auto.
 */
function scanLine(rawLine) {
  const violations = [];
  // var(--token) 참조는 통째로 제거 후 검사 (var 내부의 fallback 값 오탐 방지)
  const line = rawLine.replace(
    /var\(\s*--[a-z0-9-]+\s*(,[^)]*)?\)/gi,
    "var(TOKEN)",
  );

  // 1) Hex 색상
  const hex = line.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hex) hex.forEach((h) => violations.push({ type: "hex 색상", value: h }));

  // 2) 함수형 색상 (rgb/rgba/hsl/hsla/oklch/oklab/lab/lch)
  const fn = line.match(/\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\s*\(/gi);
  if (fn)
    fn.forEach((f) =>
      violations.push({ type: "함수형 색상", value: f.trim() }),
    );

  // 3) 리터럴 px (0px, 1px 보더는 허용)
  const px = line.match(/\b(\d+(?:\.\d+)?)px\b/g);
  if (px) {
    px.forEach((p) => {
      const n = parseFloat(p);
      if (n !== 0 && n !== 1) violations.push({ type: "리터럴 px", value: p });
    });
  }

  // 4) rem/em 리터럴 (0 제외) — 간격/타이포는 토큰 경유해야 함
  const rem = line.match(/\b(\d+(?:\.\d+)?)(rem|em)\b/g);
  if (rem) {
    rem.forEach((r) => {
      const n = parseFloat(r);
      if (n !== 0)
        violations.push({
          type: `리터럴 ${r.replace(/[\d.]/g, "")}`,
          value: r,
        });
    });
  }

  // 5) Tailwind 임의값 — 색상/치수 리터럴을 담은 [...]
  const arb = line.match(
    /\[[^\]\s]*(?:#[0-9a-fA-F]{3,8}|\d+px|\d+rem|rgba?\(|hsla?\(|oklch\()[^\]\s]*\]/gi,
  );
  if (arb)
    arb.forEach((a) => violations.push({ type: "Tailwind 임의값", value: a }));

  return violations;
}

function main() {
  const raw = readStdin();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    process.exit(0); // 페이로드 파싱 실패 시 차단하지 않음
  }

  const filePath = getFilePath(payload);
  if (!filePath) process.exit(0);

  // 아이콘 세트 예외: codegen 산출물(생성기가 색상을 currentColor 로 치환하고 치수 리터럴을
  // 넣지 않음). 재생성 과도기·수동 편집·멀티컬러 아이콘 유입에 대비해 원본/생성 디렉토리를 제외.
  // 수기 파일(Icon.tsx, *.stories.tsx, *.test.tsx, index.ts, iconRegistry/iconNames)은 계속 스캔.
  const iconNorm = filePath.replace(/\\/g, "/");
  if (
    iconNorm.includes("/src/icons/svg/") ||
    iconNorm.includes("/src/icons/components/")
  ) {
    process.exit(0);
  }

  const ext = path.extname(filePath);
  if (!TARGET_EXT.has(ext)) process.exit(0);
  if (EXCLUDE_BASENAMES.has(path.basename(filePath))) process.exit(0);

  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    process.exit(0); // 파일을 못 읽으면 차단하지 않음
  }

  const lines = content.split(/\r?\n/);
  const found = [];
  lines.forEach((line, i) => {
    if (isCommentLine(line)) return;
    const v = scanLine(line);
    v.forEach((item) =>
      found.push({ line: i + 1, ...item, text: line.trim().slice(0, 120) }),
    );
  });

  if (found.length === 0) process.exit(0);

  const rel = path.relative(process.cwd(), filePath) || filePath;
  const msg = [
    `❌ 토큰 하드코딩 감지 — ${rel}`,
    "",
    ...found.map(
      (f) => `  ${rel}:${f.line}  [${f.type}] ${f.value}\n      │ ${f.text}`,
    ),
    "",
    "수정 방법:",
    "  • 색상 → var(--color-*) 또는 Tailwind 토큰 유틸(bg-primary 등)",
    "  • 간격/치수 → var(--spacing-*) 또는 Tailwind 스케일(p-4, gap-3)",
    "  • 필요한 토큰이 없으면 tokens/*.json 에 추가하고 npm run build:tokens 실행",
    "  • 허용: 0, 1px 보더, 100%/auto/50% 같은 레이아웃 상수",
  ].join("\n");

  process.stderr.write(msg + "\n");
  process.exit(2);
}

main();
