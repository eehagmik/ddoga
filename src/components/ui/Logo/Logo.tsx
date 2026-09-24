import type { CSSProperties } from "react";

/**
 * 또하나의가족 브랜드 로고.
 *
 * Figma "또가3.0 Design System / LOGO" (node 51482:15127) 의 심볼·워드마크
 * 락업 매트릭스를 하나의 컴포넌트로 노출한다.
 *
 * - 인라인 SVG 렌더. path `d` 는 Figma 원본 좌표 그대로, `fill` 은 로고 전용
 *   Semantic 토큰(`var(--color-logo-*)`)으로만 지정한다 — hex 하드코딩 없음.
 * - 자체 종횡비 고정: `viewBox` + `preserveAspectRatio="xMidYMid meet"` +
 *   `width` / `height:auto`. `width` 가 커지면 높이도 같은 비율로 커진다.
 */

export type LogoLockup = "symbol" | "wordmark" | "horizontal" | "vertical";

export type LogoTone =
  "color" | "white" | "transparentColor" | "transparentWhite";

export type LogoProps = {
  /** 락업 형태. 기본 'horizontal' */
  lockup?: LogoLockup;
  /** 색 구성. 기본 'color'. transparent* 는 심볼 단독에서만 배경 없는 글리프로 렌더 */
  tone?: LogoTone;
  /** 확장형 글리프. `lockup='symbol'` + transparent tone 에서만 유효. 기본 false */
  expand?: boolean;
  /** SVG 렌더 폭. 숫자는 px 로 해석. 기본 '100%' */
  width?: number | string;
  /** 루트 svg 에 전달할 클래스 */
  className?: string;
  /** 접근성 레이블 & `<title>`. 기본 '또하나의가족' */
  title?: string;
};

/* ── Figma 원본 path 데이터 (색상 치환 전, 좌표 그대로) ─────────────── */

/** 심볼 라운드 사각형 (viewBox 70×70) */
const SYMBOL_SQUARE =
  "M56.2575 0H13.7425C6.15275 0 0 6.15275 0 13.7425V56.2575C0 63.8472 6.15275 70 13.7425 70H56.2575C63.8472 70 70 63.8472 70 56.2575V13.7425C70 6.15275 63.8472 0 56.2575 0Z";

/** 사각형 위에 얹히는 글리프 (viewBox 70×70) */
const SYMBOL_SQUARE_GLYPH =
  "M54.8194 27.0929V38.3414C54.8194 49.3082 45.9393 58.2386 34.9925 58.3342V50.8117C41.7959 50.7212 47.2919 45.1649 47.2919 38.3414V27.7969L34.9925 19.4648L22.6931 27.7969V43.2893H34.9925V50.8067H21.3656C17.9513 50.8067 15.1757 48.031 15.1757 44.6168V27.0929C15.1757 25.0313 16.1914 23.1154 17.896 21.9639L31.5229 12.7369C33.6348 11.3088 36.3602 11.3088 38.4671 12.7369L52.099 21.9639C53.7986 23.1154 54.8194 25.0313 54.8194 27.0929Z";

/** 심볼 white knockout — evenodd 단일 path (viewBox 70×70) */
const SYMBOL_SQUARE_WHITE =
  "M13.7413 0H56.2587C63.8478 0 70 6.15218 70 13.7413V56.2587C70 63.8478 63.8478 70 56.2587 70H13.7413C6.15218 70 0 63.8478 0 56.2587V13.7413C0 6.15218 6.15218 0 13.7413 0ZM54.8309 38.3491V27.0993L54.8405 27.1184C54.8405 25.0582 53.8247 23.1417 52.1191 21.9918L38.4832 12.7639C36.3751 11.3361 33.6441 11.3361 31.5359 12.7639L17.9096 21.9918C16.2039 23.1417 15.1882 25.0582 15.1882 27.1184V44.6448C15.1882 48.0561 17.9671 50.8351 21.3785 50.8351H35.0048V58.3477C45.948 58.2519 54.8309 49.321 54.8309 38.3491ZM47.3087 38.3587C47.3087 45.1718 41.8083 50.7392 35.0048 50.8255V43.3128H22.7009V27.8179L35.0048 19.4908L47.3087 27.8179V38.3587Z";

/** 투명 배경 글리프 — 비확장 (viewBox 70×70) */
const SYMBOL_GLYPH =
  "M56.6849 26.3518V38.6602C56.6849 50.6622 46.9724 60.4185 34.9995 60.5206V52.2956C42.437 52.1935 48.4599 46.1122 48.4599 38.6602V27.1247L34.9995 18.0102L21.5391 27.1247V44.0706H34.9995V52.2956H20.0953C16.362 52.2956 13.3287 49.2622 13.3287 45.5289V26.3664C13.3287 24.106 14.437 22.0206 16.3037 20.7518L31.2078 10.6602C33.512 9.09973 36.5016 9.09973 38.8058 10.6602L53.7099 20.7518C55.5766 22.0206 56.6849 24.106 56.6849 26.3664V26.3518Z";

/** 투명 배경 글리프 — 확장 (viewBox 70×70, 좌표가 뷰박스 밖까지) */
const SYMBOL_GLYPH_EXPAND =
  "M64.73 23.13V40.0136C64.73 56.4771 51.4078 69.86 34.985 70V58.7176C45.1867 58.5776 53.4481 50.2358 53.4481 40.0136V24.1902L34.985 11.6875L16.5219 24.1902V47.4352H34.985V58.7176H14.5416C9.4207 58.7176 5.26 54.5567 5.26 49.4356V23.15C5.26 20.0493 6.78026 17.1887 9.34069 15.4483L29.7841 1.60534C32.9447 -0.535115 37.0453 -0.535115 40.2059 1.60534L60.6493 15.4483C63.2098 17.1887 64.73 20.0493 64.73 23.15V23.13Z";

/** 워드마크 — evenodd 단일 path (viewBox 287.487×50.8972) */
const WORDMARK =
  "M77.1755 10.7859H48.1769V17.021H77.1755V10.7859ZM63.3525 18.7005H62.5932C55.8753 18.7005 50.8872 22.5523 50.8872 29.2702C50.8872 35.9881 55.8703 40.056 62.5932 40.056H63.3525C70.0704 40.056 75.0586 35.9378 75.0586 29.2702C75.0586 22.6025 70.0754 18.7005 63.3525 18.7005ZM56.0397 0.00287366L56.0362 0H56.0413L56.0397 0.00287366ZM53.0041 5.4759L56.0397 0.00287366C58.3721 1.95186 61.0812 2.82092 64.2224 2.82092H70.8901V8.89017H64.1168C59.9433 8.89017 55.9859 7.91466 53.0041 5.4759ZM63.1916 33.7706H62.8145C60.2651 33.7706 58.5303 32.0358 58.5303 29.2702C58.5303 26.5046 60.2651 24.7698 62.8145 24.7698H63.1916C65.741 24.7698 67.4758 26.5046 67.4758 29.2702C67.4758 32.0358 65.741 33.7706 63.1916 33.7706ZM87.9061 2.49407H80.1573V49.2177H87.9061V24.8804H94.4631V17.8859H87.9061V2.49407ZM19.0827 38.2157H0V44.828H45.1548V38.2157H26.8314V29.8686H19.0827V38.2157ZM21.3555 11.0574V4.55069H5.09877V19.6207C5.09877 25.5844 7.1604 28.0231 13.2297 28.0231H22.2807V21.627H15.5578C13.0637 21.627 12.576 21.084 12.576 18.4843V11.0574H21.3555ZM39.7342 11.0574V4.55572H23.1456V20.5459C23.1456 26.1828 24.9357 28.1338 30.7887 28.1338H40.4935V21.7377H33.3934C31.0603 21.7377 30.5725 21.3002 30.5725 18.9168V11.0574H39.7342ZM109.624 37.2904C103.117 37.2904 100.301 34.741 100.301 28.6718V5.69212H108.05V27.1029C108.05 29.8685 108.809 30.6278 111.68 30.6278H118.836C122.466 30.6278 125.719 30.3563 129.35 29.0037V2.49408H137.099V17.8859H143.711V24.8804H137.099V49.2177H129.35V35.5556C125.825 36.9636 122.577 37.2904 118.836 37.2904H109.624ZM164.523 34.8014H146.637H146.632L146.743 41.3584H164.579C170.593 41.3584 175.797 40.8153 180.569 38.8643V49.2177H188.267V2.49408H180.569V32.252C175.742 34.1527 170.376 34.8014 164.523 34.8014ZM162.899 3.84671C155.417 3.84671 149.836 8.56333 149.836 15.774V16.5333C149.836 23.7993 155.472 28.4053 162.899 28.4053C170.326 28.4053 175.908 23.7943 175.908 16.5333V15.774C175.908 8.56333 170.381 3.84671 162.899 3.84671ZM168.265 16.3724C168.265 19.6207 166.097 21.9539 162.899 21.9539C159.701 21.9539 157.534 19.6258 157.534 16.3724V15.94C157.534 12.6866 159.701 10.4641 162.899 10.4641C166.097 10.4641 168.265 12.6866 168.265 15.94V16.3724ZM195.795 5.90835H217.854V15.231C217.854 26.4493 209.346 35.9378 196.987 38.7034L194.115 32.0358C204.142 29.8132 210.05 22.9294 210.05 15.3969V12.5257H195.795V5.91337V5.90835ZM224.954 2.49408H232.703V17.8859H239.315V24.8804H232.703V49.2177H224.954V2.49408ZM261.088 25.0966H242.332V31.2212H287.487V25.0966H268.731V19.6207H261.088V25.0966ZM281.036 9.37793V3.41428H281.031H248.889V9.37793H260.978C260.595 13.1693 254.848 15.5578 247.099 15.9902L248.673 22.1148C256.1 21.5717 262.114 19.4598 264.935 15.5025C267.756 19.4598 273.77 21.5717 281.197 22.1148L282.771 15.9902C274.967 15.5025 269.274 13.1744 268.842 9.37793H281.036ZM279.899 50.8972C280.82 48.9462 281.036 46.2912 281.036 43.4703H281.041V34.0371H248.246V40.1616H273.287V43.4703C273.287 46.2359 273.071 48.8909 272.201 50.8972H279.899Z";

/* ── viewBox / 락업 배치 좌표 ───────────────────────────────────────── */

const VIEW_BOX: Record<LogoLockup, string> = {
  symbol: "0 0 70 70",
  wordmark: "0 0 287.487 50.8972",
  horizontal: "0 0 373 70",
  vertical: "0 0 245.647 145",
};

/** 락업 내부 심볼/워드마크 그룹 transform (Figma inset 에서 산출) */
const HORIZONTAL_WORDMARK_TRANSFORM = "translate(84.56 9.5) scale(1.0019)";
const VERTICAL_SYMBOL_TRANSFORM = "translate(81.97 0) scale(1.1671)";
const VERTICAL_WORDMARK_TRANSFORM = "translate(0 100.88) scale(0.85377)";

/* ── path 그룹 헬퍼 (파일 로컬) ─────────────────────────────────────── */

type SymbolTone = LogoTone;
type WordTone = "color" | "white";

function SymbolGroup({
  tone,
  expand,
  transform,
}: {
  tone: SymbolTone;
  expand: boolean;
  transform?: string;
}) {
  if (tone === "color") {
    return (
      <g transform={transform}>
        <path d={SYMBOL_SQUARE} fill="var(--color-logo-brand)" />
        <path d={SYMBOL_SQUARE_GLYPH} fill="var(--color-logo-on-brand)" />
      </g>
    );
  }

  if (tone === "white") {
    return (
      <g transform={transform}>
        <path
          d={SYMBOL_SQUARE_WHITE}
          fillRule="evenodd"
          clipRule="evenodd"
          fill="var(--color-logo-white)"
        />
      </g>
    );
  }

  const glyphFill =
    tone === "transparentColor"
      ? "var(--color-logo-brand)"
      : "var(--color-logo-white)";
  return (
    <g transform={transform}>
      <path d={expand ? SYMBOL_GLYPH_EXPAND : SYMBOL_GLYPH} fill={glyphFill} />
    </g>
  );
}

function WordmarkGroup({
  tone,
  transform,
}: {
  tone: WordTone;
  transform?: string;
}) {
  const fill =
    tone === "color" ? "var(--color-logo-ink)" : "var(--color-logo-white)";
  return (
    <g transform={transform}>
      <path d={WORDMARK} fillRule="evenodd" clipRule="evenodd" fill={fill} />
    </g>
  );
}

/** transparent* → 비-symbol 락업에서는 불투명 tone 으로 정규화 */
function toSolidTone(tone: LogoTone): WordTone {
  return tone === "white" || tone === "transparentWhite" ? "white" : "color";
}

export function Logo({
  lockup = "horizontal",
  tone = "color",
  expand = false,
  width = "100%",
  className,
  title = "또하나의가족",
}: LogoProps) {
  const isSymbolLockup = lockup === "symbol";
  const isTransparent =
    tone === "transparentColor" || tone === "transparentWhite";
  const effectiveExpand = isSymbolLockup && isTransparent && expand;
  const solidTone = toSolidTone(tone);

  const style: CSSProperties = { width, height: "auto", display: "block" };

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={VIEW_BOX[lockup]}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      data-lockup={lockup}
      data-tone={tone}
      data-expand={effectiveExpand}
    >
      <title>{title}</title>

      {lockup === "symbol" && (
        <SymbolGroup tone={tone} expand={effectiveExpand} />
      )}

      {lockup === "wordmark" && <WordmarkGroup tone={solidTone} />}

      {lockup === "horizontal" && (
        <>
          <SymbolGroup tone={solidTone} expand={false} />
          <WordmarkGroup
            tone={solidTone}
            transform={HORIZONTAL_WORDMARK_TRANSFORM}
          />
        </>
      )}

      {lockup === "vertical" && (
        <>
          <SymbolGroup
            tone={solidTone}
            expand={false}
            transform={VERTICAL_SYMBOL_TRANSFORM}
          />
          <WordmarkGroup
            tone={solidTone}
            transform={VERTICAL_WORDMARK_TRANSFORM}
          />
        </>
      )}
    </svg>
  );
}
