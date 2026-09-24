// Figma REST → 아이콘 원본 SVG 다운로더.
//
//   1. /v1/files/<key>/nodes?ids=<page> 로 노드트리를 받아 COMPONENT 전부의 {id,name} 추출
//      → scripts/data/icons.json 기록 (build-icons.mjs 의 SSOT, 커밋 대상)
//   2. 배치(100 id)로 /v1/images?format=svg 요청 → S3 URL 즉시 다운로드 → src/icons/svg/<file>.svg
//
// 실행: FIGMA_TOKEN=... node scripts/fetch-icons.mjs [--force] [--only=<substr>] [--dry-run]
//   .env 는 읽지 않는다. 토큰은 실행 시점에 env 로 주입.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildModel } from "./lib/icon-names.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE_KEY = "kUirarWT1Xugaq0aajY4G6";
const PAGE_NODE_ID = "34:823"; // "Icon" 페이지
const SVG_DIR = join(ROOT, "src/icons/svg");
const DATA_FILE = join(ROOT, "scripts/data/icons.json");
const CACHE_FILE = join(ROOT, "scripts/.icons-cache.json");

const BATCH_SIZE = 100;
const BATCH_GAP_MS = 400;
const DOWNLOAD_CONCURRENCY = 12;
const MAX_RETRIES = 5;

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");
const ONLY =
  args.find((a) => a.startsWith("--only="))?.slice("--only=".length) ?? null;

const TOKEN = process.env.FIGMA_TOKEN;
if (!TOKEN) {
  console.error(
    "❌ FIGMA_TOKEN 환경변수가 필요합니다.  예) FIGMA_TOKEN=figd_... npm run icons:fetch",
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function figmaGet(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, { headers: { "X-Figma-Token": TOKEN } });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const wait =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 2 ** attempt * 1000;
      console.warn(
        `  ↻ ${res.status} — ${wait}ms 후 재시도 (${attempt + 1}/${MAX_RETRIES})`,
      );
      await sleep(wait);
      continue;
    }
    throw new Error(`Figma API ${res.status} ${res.statusText} — ${url}`);
  }
  throw new Error(`재시도 소진: ${url}`);
}

/** 노드트리에서 COMPONENT {id,name} 재귀 수집 */
function collectComponents(node, out) {
  if (!node || typeof node !== "object") return;
  if (node.type === "COMPONENT" && node.name)
    out.push({ id: node.id, name: node.name });
  for (const child of node.children ?? []) collectComponents(child, out);
}

async function loadJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await mkdir(SVG_DIR, { recursive: true });

  // ── 1. 노드트리 → icons.json ─────────────────────────────
  console.log("▶ 노드트리 조회…");
  const nodesUrl = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(PAGE_NODE_ID)}`;
  const tree = await figmaGet(nodesUrl);
  const doc =
    tree.nodes?.[PAGE_NODE_ID]?.document ??
    tree.nodes?.[PAGE_NODE_ID.replace(":", "-")]?.document;
  if (!doc) throw new Error(`노드 ${PAGE_NODE_ID} 를 응답에서 찾을 수 없음`);

  const rawRows = [];
  collectComponents(doc, rawRows);
  rawRows.sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : 1,
  );
  console.log(`  COMPONENT ${rawRows.length}개 발견`);

  const { icons, duplicates } = buildModel(rawRows);
  if (duplicates.length) {
    console.warn(`  ⚠ 중복 이름 ${duplicates.length}건 (첫 id 채택):`);
    for (const d of duplicates)
      console.warn(`    ${d.key} — ${d.ids.join(", ")}`);
  }

  if (!DRY_RUN) {
    await writeFile(DATA_FILE, JSON.stringify(rawRows, null, 2) + "\n");
    console.log(`  → ${DATA_FILE} (${rawRows.length} rows)`);
  }

  // ── 2. 다운로드 대상 산정 ────────────────────────────────
  let targets = icons;
  if (ONLY) targets = targets.filter((i) => i.key.includes(ONLY));
  if (!FORCE)
    targets = targets.filter(
      (i) => !existsSync(join(SVG_DIR, `${i.file}.svg`)),
    );

  console.log(`▶ 다운로드 대상 ${targets.length} / 전체 ${icons.length}`);
  if (DRY_RUN) {
    console.log("  (--dry-run) 종료");
    return;
  }
  if (targets.length === 0) {
    console.log("  받을 것이 없음. 완료.");
    return;
  }

  const cache = await loadJson(CACHE_FILE, {});
  const idToIcon = new Map(icons.map((i) => [i.id, i]));
  const failed = [];
  let done = 0;

  for (let b = 0; b < targets.length; b += BATCH_SIZE) {
    const batch = targets.slice(b, b + BATCH_SIZE);
    const ids = batch.map((i) => i.id);
    const imgUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${ids.join(",")}&format=svg`;
    const resp = await figmaGet(imgUrl);
    if (resp.err) throw new Error(`images API err: ${resp.err}`);

    const entries = Object.entries(resp.images ?? {});
    await runPool(entries, DOWNLOAD_CONCURRENCY, async ([id, url]) => {
      const icon = idToIcon.get(id) ?? idToIcon.get(id.replace("-", ":"));
      if (!icon) return;
      if (!url) {
        failed.push(icon);
        return;
      }
      const svg = await (await fetch(url)).text();
      await writeFile(join(SVG_DIR, `${icon.file}.svg`), svg);
      cache[icon.key] = {
        id: icon.id,
        downloadedAt: new Date().toISOString(),
        bytes: svg.length,
      };
      done++;
    });

    console.log(
      `  배치 ${b / BATCH_SIZE + 1}/${Math.ceil(targets.length / BATCH_SIZE)} — 누적 ${done}`,
    );
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");
    if (b + BATCH_SIZE < targets.length) await sleep(BATCH_GAP_MS);
  }

  // ── 3. 실패분 개별 재시도 1회 ────────────────────────────
  if (failed.length) {
    console.warn(`▶ 실패 ${failed.length}건 개별 재요청…`);
    const stillFailed = [];
    for (const icon of failed) {
      const resp = await figmaGet(
        `https://api.figma.com/v1/images/${FILE_KEY}?ids=${icon.id}&format=svg`,
      );
      const url = resp.images?.[icon.id];
      if (!url) {
        stillFailed.push(icon);
        continue;
      }
      const svg = await (await fetch(url)).text();
      await writeFile(join(SVG_DIR, `${icon.file}.svg`), svg);
      cache[icon.key] = {
        id: icon.id,
        downloadedAt: new Date().toISOString(),
        bytes: svg.length,
      };
      done++;
    }
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");
    if (stillFailed.length) {
      console.error(`❌ 최종 실패 ${stillFailed.length}건:`);
      for (const i of stillFailed) console.error(`   ${i.key} (${i.id})`);
      process.exit(1);
    }
  }

  console.log(`✅ 완료 — ${done}개 저장, 실패 0`);
}

/** 간단 동시성 풀 */
async function runPool(items, size, worker) {
  const queue = [...items];
  const runners = Array.from(
    { length: Math.min(size, queue.length) },
    async () => {
      while (queue.length) await worker(queue.shift());
    },
  );
  await Promise.all(runners);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
