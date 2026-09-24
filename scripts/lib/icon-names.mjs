// 아이콘 이름 모델 — Figma 심볼명에서 registry key / 컴포넌트명 / 파일명을 결정론적으로 파생한다.
//
//   key    : Figma 심볼명 원본. 레지스트리 키이자 IconName 유니온 멤버.
//            예) 'align_bottom_01_line', 'atSign_line', 'facebook'
//   pascal : React 컴포넌트명. 언더스코어 + camelCase 경계로 분해 후 각 조각 capitalize.
//            예) 'AlignBottom01Line', 'AtSignLine', 'Facebook'
//   file   : 파일명(확장자 제외). pascal 을 kebab-case 로.
//            예) 'align-bottom-01-line', 'at-sign-line', 'facebook'

/** 'atSign_line' -> ['At','Sign','Line'] 같은 조각 배열 */
function toWords(rawName) {
  return rawName
    .split("_")
    .filter(Boolean)
    .flatMap((seg) =>
      seg
        // camelCase 경계: 소문자/숫자 다음 대문자
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .split(" ")
        .filter(Boolean),
    );
}

function toPascal(rawName) {
  return toWords(rawName)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

function toFile(rawName) {
  return toWords(rawName).join("-").toLowerCase();
}

/**
 * @param {{id: string, name: string}[]} rows  Figma COMPONENT 노드 목록
 * @returns {{
 *   icons: {key: string, id: string, pascal: string, file: string}[],
 *   duplicates: {key: string, ids: string[]}[],
 * }}
 */
export function buildModel(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("buildModel: 빈 입력 — Figma 노드 목록을 확인하세요.");
  }

  // 1) key(원본 이름) 기준 dedupe — 첫 등장 id 채택
  const byKey = new Map();
  const dupMap = new Map();
  for (const { id, name } of rows) {
    if (typeof name !== "string" || !name) continue;
    if (byKey.has(name)) {
      if (!dupMap.has(name)) dupMap.set(name, [byKey.get(name).id]);
      dupMap.get(name).push(id);
      continue;
    }
    byKey.set(name, { id, name });
  }

  // 2) 파생 + 충돌 검사
  const icons = [];
  const pascalSeen = new Map();
  const fileSeen = new Map();
  for (const { id, name } of byKey.values()) {
    const pascal = toPascal(name);
    const file = toFile(name);

    if (!/^[A-Z][A-Za-z0-9]*$/.test(pascal)) {
      throw new Error(`파생 컴포넌트명이 부적합: '${name}' -> '${pascal}'`);
    }
    if (pascalSeen.has(pascal)) {
      throw new Error(
        `컴포넌트명 충돌: '${name}' 와 '${pascalSeen.get(pascal)}' 가 모두 '${pascal}' 로 파생됨`,
      );
    }
    if (fileSeen.has(file)) {
      throw new Error(
        `파일명 충돌: '${name}' 와 '${fileSeen.get(file)}' 가 모두 '${file}' 로 파생됨`,
      );
    }
    pascalSeen.set(pascal, name);
    fileSeen.set(file, name);
    icons.push({ key: name, id, pascal, file });
  }

  // 3) 결정론적 정렬 (key asc)
  icons.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

  const duplicates = [...dupMap.entries()].map(([key, ids]) => ({ key, ids }));
  return { icons, duplicates };
}
