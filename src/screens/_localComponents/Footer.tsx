/**
 * Footer — 메인 화면 하단 푸터.
 *
 * Figma 메인 화면(node 30416:71184, "Footer") 과 1:1 구조 — 고객센터 연락처 +
 * 카카오톡/이메일 버튼, 회사 정보 아코디언, 약관 링크, SNS 아이콘 4개. 여러 화면
 * 하단에 반복될 앱 셸 조각이라 로컬 공용 컴포넌트로 분리했다.
 *
 * 아코디언은 2026-09-25 사용자가 Figma 에서 정식 디자인시스템 컴포넌트로 등록해
 * `src/components/ui/FooterAccordion` 로 승격됐다 — 이 화면(`Footer`) 은 더 이상
 * 펼침/접힘 상태·높이 트랜지션 로직을 직접 갖지 않고, 승격된 컴포넌트를
 * import 해서 "(주)헥톤프로젝트" 사업자 정보(`children`)만 채워 넣는다.
 *
 * 패딩 재배치: `FooterAccordion` 이 이제 자체적으로 `px-16`(헤더/콘텐츠 모두)을
 * 갖는 독립 카드형 컴포넌트로 승격되면서, 이 화면의 바깥 Footer 카드가 기존처럼
 * 전체에 `px-16` 을 주면 아코디언 영역만 32px(바깥+아코디언 자체)로 이중
 * 들여쓰기가 생긴다. 그래서 바깥 카드는 `py-24` 만 갖고, `px-16` 은 필요한
 * 형제 섹션(고객센터 블록/약관·SNS 블록)에 개별로 준다 — `FooterAccordion` 은
 * 자기 폭 그대로(`w-full`) 배치해 내부 `px-16` 만으로 나머지 섹션들과 좌우
 * 정렬이 맞는다.
 *
 * 라벨 컬럼 폭은 Figma 실측이 90px 인데 `--sz-90` 토큰이 없어(88/92 두 값
 * 사이) 가장 가까운 `--sz-88` 로 근사했다(Avatar/HorizontalMenuButton 선례와
 * 동일한 "가장 가까운 토큰 근사" 원칙, 2px 차이는 시각적으로 무시 가능).
 *
 * 카카오톡/이메일 버튼은 기존 `ButtonWithLabel`(outline/neutral/xs)을 재사용한다.
 *
 * @example
 * <Footer
 *   phone="02-782-9840"
 *   hours="평일 10:00~17:00"
 *   onKakaoClick={openKakaoChannel}
 *   onEmailClick={openEmailForm}
 *   showCompanyInfo // 사업자 정보 아코디언 노출(기본 숨김)
 * />
 */

import { Icon } from "../../icons";
import { ButtonWithLabel } from "../../components/ui/ButtonWithLabel";
import { FooterAccordion } from "../../components/ui/FooterAccordion";

export interface FooterProps {
  /** 고객센터 전화번호. */
  phone: string;
  /** 운영 시간 안내. */
  hours: string;
  /** 카카오톡 상담 버튼 클릭 핸들러. */
  onKakaoClick?: () => void;
  /** 이메일 문의 버튼 클릭 핸들러. */
  onEmailClick?: () => void;
  /** "(주)헥톤프로젝트 자세히보기" 사업자 정보 아코디언 노출 여부. 기본 false(2026-10-11 숨김 처리, 추후 재사용 예정). */
  showCompanyInfo?: boolean;
}

const SNS_ICONS = [
  { name: "kakaotalk", label: "카카오톡 채널" },
  { name: "naverblog", label: "네이버 블로그" },
  { name: "youtube", label: "유튜브" },
  { name: "instagram", label: "인스타그램" },
] as const;

interface CompanyInfoRow {
  label: string;
  value?: string;
  link?: { label: string; href: string };
}

// TODO(dev): 사업자 정보·가족사 링크(href="#")를 운영 설정값/실제 URL로 교체
const COMPANY_INFO: CompanyInfoRow[] = [
  { label: "상호명", value: "(주)헥톤프로젝트" },
  { label: "대표", value: "이동대" },
  {
    label: "사업자등록번호",
    value: "105-88-16294",
    link: { label: "사업자확인", href: "#" },
  },
  { label: "통신판매번호", value: "2025-서울성동-1881" },
  { label: "이메일", value: "ddoga@hectonproject.com" },
  { label: "전화", value: "02-782-9840" },
  { label: "주소", value: "서울특별시 성동구 왕십리로 241, LF층" },
  { label: "홈페이지", link: { label: "바로가기", href: "#" } },
];

const FAMILY_COMPANIES = ["GC케어", "GC녹십자웰빙", "UBcare", "BBROS"];

export function Footer({
  phone,
  hours,
  onKakaoClick,
  onEmailClick,
  showCompanyInfo = false,
}: FooterProps) {
  return (
    <div className="w-full px-(--sz-20) pt-(--sz-100)">
      <div className="flex w-full flex-col items-start rounded-2xl bg-bg-neutral-deepDark py-(--sz-24)">
        <div className="flex w-full flex-col items-start gap-(--sz-6) px-(--sz-16) pb-(--sz-8)">
          <p className="text-body-4 text-typo-neutral-normal">고객센터</p>
          <div className="flex items-center gap-(--sz-6)">
            <p className="text-body-2-bold text-typo-neutral-normal">{phone}</p>
            <p className="text-body-5 text-typo-neutral-subtle">{hours}</p>
          </div>
          <div className="flex items-center gap-(--sz-6)">
            <ButtonWithLabel
              variant="outline"
              color="neutral"
              size="xs"
              startIcon={<Icon name="kakaotalk" size={14} />}
              onClick={onKakaoClick}
            >
              카카오톡
            </ButtonWithLabel>
            <ButtonWithLabel
              variant="outline"
              color="neutral"
              size="xs"
              startIcon={<Icon name="mail_01_line" size={14} />}
              onClick={onEmailClick}
            >
              이메일
            </ButtonWithLabel>
          </div>
        </div>

        {showCompanyInfo && (
          <FooterAccordion
            title="(주)헥톤프로젝트 자세히보기"
            hoverable={false}
          >
            <div className="flex w-full flex-col items-start gap-(--sz-8)">
              {COMPANY_INFO.map((row) => (
                <div
                  key={row.label}
                  className="flex w-full items-start gap-(--sz-20)"
                >
                  <p className="w-(--sz-88) shrink-0 text-label-2 text-typo-neutral-bright">
                    {row.label}
                  </p>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-(--sz-4)">
                    {row.value ? (
                      <p className="text-label-2 text-typo-neutral-subtle">
                        {row.value}
                      </p>
                    ) : null}
                    {row.link ? (
                      <a
                        href={row.link.href}
                        className="flex items-center gap-(--sz-4) text-label-2 text-typo-neutral-subtle"
                      >
                        {row.link.label}
                        <Icon name="arrow_up_right_line" size={16} />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="flex w-full flex-col items-start gap-(--sz-8)">
                <p className="w-full text-label-2 text-typo-neutral-bright">
                  헥톤프로젝트 가족사
                </p>
                <div className="flex flex-wrap items-center gap-(--sz-6)">
                  {FAMILY_COMPANIES.map((company, index) => (
                    <span
                      key={company}
                      className="flex items-center gap-(--sz-6)"
                    >
                      <a
                        href="#"
                        className="text-label-2 text-typo-neutral-subtle"
                      >
                        {company}
                      </a>
                      {index < FAMILY_COMPANIES.length - 1 ? (
                        <span className="text-label-2 text-typo-neutral-subtle">
                          ⋅
                        </span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FooterAccordion>
        )}

        <div className="flex w-full flex-col items-start gap-(--sz-4) px-(--sz-16) pt-(--sz-8)">
          <div className="flex w-full items-center gap-(--sz-6) py-(--sz-3) text-body-4">
            <span className="text-typo-neutral-normal">서비스 이용약관</span>
            <span className="text-typo-neutral-subtle">⋅</span>
            <span className="text-body-4-bold text-typo-neutral-normal">
              개인정보처리방침
            </span>
          </div>
          <p className="w-full text-body-6 text-typo-neutral-bright">
            Copyright © HectonProject Co.,ltd All rights reserved.
          </p>
          <div className="flex w-full items-start gap-(--sz-16) pt-(--sz-12)">
            {SNS_ICONS.map(({ name, label }) => (
              <a
                key={name}
                href="#"
                aria-label={label}
                className="flex size-(--sz-22) items-center justify-center text-icon-neutral-normal"
              >
                <Icon name={name} size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
