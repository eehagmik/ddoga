#!/usr/bin/env node
/**
 * PostToolUse hook — 컴포넌트 4파일 구조 & Storybook CSF3 규칙 검증.
 *
 * 편집된 파일이 src/components/<Name>/ 아래일 때만 동작.
 * - 4파일(<Name>.tsx, <Name>.stories.tsx, <Name>.test.tsx, index.ts) 존재 확인
 * - *.stories.tsx 면 CSF3 시그니처 / autodocs / play function 확인
 * 위반 시 stderr 출력 후 exit 2.
 *
 * 규칙 근거: 루트 CLAUDE.md "2. 컴포넌트 구조", "3. Storybook 규칙".
 */

"use strict";

const fs = require("fs");
const path = require("path");

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function main() {
  const raw = readStdin();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    process.exit(0);
  }

  const ti = payload.tool_input || {};
  const filePath = ti.file_path || ti.path;
  if (!filePath) process.exit(0);

  const norm = filePath.replace(/\\/g, "/");
  // 아이콘 세트는 4파일 규칙 예외 (수천 개 규모, codegen 산출물). 아래 정규식이 src/components/ 만
  // 매칭하므로 src/icons/ 는 원래도 통과하지만, 의도를 명시한다.
  if (norm.includes("/src/icons/")) process.exit(0);
  const m = norm.match(/(^|\/)src\/components\/([^/]+)\/([^/]+)$/);
  if (!m) process.exit(0); // 컴포넌트 디렉토리 밖이면 관심 없음

  const componentName = m[2];
  const dir = path.dirname(filePath);

  // index / barrel 디렉토리, 유틸 디렉토리 등은 제외 (PascalCase만 컴포넌트로 간주)
  if (!/^[A-Z][A-Za-z0-9]*$/.test(componentName)) process.exit(0);

  const required = [
    `${componentName}.tsx`,
    `${componentName}.stories.tsx`,
    `${componentName}.test.tsx`,
    "index.ts",
  ];

  const problems = [];

  const missing = required.filter((f) => !fs.existsSync(path.join(dir, f)));
  if (missing.length) {
    problems.push(`누락된 파일: ${missing.join(", ")}`);
  }

  // 스토리 파일 내용 검증
  const storiesPath = path.join(dir, `${componentName}.stories.tsx`);
  if (fs.existsSync(storiesPath)) {
    let src = "";
    try {
      src = fs.readFileSync(storiesPath, "utf8");
    } catch {
      src = "";
    }
    if (src) {
      const hasCsf3 =
        /satisfies\s+Meta\b/.test(src) ||
        /:\s*Meta<typeof\s+/.test(src) ||
        /Meta<typeof\s+/.test(src);
      const hasStoryObj = /StoryObj\b/.test(src);
      const hasAutodocs = /tags\s*:\s*\[[^\]]*['"]autodocs['"]/.test(src);
      const hasPlay = /\bplay\s*:/.test(src);

      // .storybook/preview.{ts,tsx,js} 에 전역 autodocs 태그가 있으면 파일별 요구를 면제
      const globalAutodocs = ["ts", "tsx", "js", "mjs"].some((e) => {
        const p = path.join(process.cwd(), ".storybook", `preview.${e}`);
        try {
          return /tags\s*:\s*\[[^\]]*['"]autodocs['"]/.test(
            fs.readFileSync(p, "utf8"),
          );
        } catch {
          return false;
        }
      });

      if (!hasCsf3)
        problems.push(
          "CSF3 시그니처 없음 (satisfies Meta<typeof X> / Meta<typeof X>)",
        );
      if (!hasStoryObj)
        problems.push("StoryObj 타입 사용 없음 (CSF3 스토리 형식 아님)");
      if (!hasAutodocs && !globalAutodocs)
        problems.push(
          "meta.tags 에 'autodocs' 없음 (전역 preview 태그도 없음)",
        );
      if (!hasPlay)
        problems.push(
          "play function 이 하나도 없음 (스토리마다 최소 1개 필요)",
        );
    }
  }

  // 구현 파일 default export 금지
  const implPath = path.join(dir, `${componentName}.tsx`);
  if (fs.existsSync(implPath)) {
    let src = "";
    try {
      src = fs.readFileSync(implPath, "utf8");
    } catch {
      src = "";
    }
    if (/export\s+default\b/.test(src)) {
      problems.push(
        `${componentName}.tsx 에 default export 사용 (named export 로 변경)`,
      );
    }
  }

  if (problems.length === 0) process.exit(0);

  const rel = path.relative(process.cwd(), dir) || dir;
  const msg = [
    `❌ 컴포넌트 구조/Storybook 규칙 위반 — ${rel}/`,
    "",
    ...problems.map((p) => `  • ${p}`),
    "",
    "요구사항:",
    `  ${componentName}/`,
    `  ├── ${componentName}.tsx          (named export, <Name>Props export)`,
    `  ├── ${componentName}.stories.tsx  (CSF3, tags:['autodocs'], 스토리별 play)`,
    `  ├── ${componentName}.test.tsx     (Vitest + Testing Library)`,
    `  └── index.ts                      (export * from './${componentName}')`,
  ].join("\n");

  process.stderr.write(msg + "\n");
  process.exit(2);
}

main();
