/**
 * BenefitSection — "받을 수 있는 혜택" 카드 안의 혜택 한 덩어리.
 *
 * 구성: 번호 뱃지(①②…) → 제목 → 설명 → 금액 박스(라벨 + 금액 + 기준 문구) →
 * 보충 설명 → (선택) 소제목 → 서비스 링크 카드 목록(카드 사이 구분선).
 * "김또가 어르신" 화면에서 재가서비스/요양원 입소 지원 두 번 쓰인다.
 *
 * @example
 * <BenefitSection
 *   index={1}
 *   title="재가서비스"
 *   description="재가서비스는 ..."
 *   amountLabel="월 한도액"
 *   amount="1,600,000"
 *   footnote="월 한도액은 ..."
 *   servicesHeading={"어르신 상황에 맞는\n재가서비스를 찾아보세요"}
 *   services={[{ id, title, description, iconSrc }]}
 *   onServiceClick={(id) => navigate(`/facilities?type=${id}`)}
 * />
 */

import { Divider } from "../../components/ui/Divider";
import { LtchProfileButtonCard } from "./LtchProfileButtonCard";
import { SectionTitle } from "./SectionTitle";

export interface BenefitSectionService {
  id: string;
  title: string;
  /** `\n` = 줄바꿈. */
  description: string;
  iconSrc: string;
}

export interface BenefitSectionProps {
  /** 번호 뱃지에 표시할 순번(1부터). */
  index: number;
  title: string;
  description: string;
  /** 금액 박스 왼쪽 라벨. 예: "월 한도액" */
  amountLabel: string;
  /** 금액 숫자 문자열(콤마 포함). "원"은 컴포넌트가 붙인다. */
  amount: string;
  /** 금액 아래 작은 기준 문구. 예: "*26년 2등급 기준" */
  amountNote?: string;
  /** 금액 박스 아래 보충 설명. */
  footnote: string;
  /** 서비스 목록 위 소제목. `\n` = 줄바꿈. 생략하면 소제목 없음. */
  servicesHeading?: string;
  services: BenefitSectionService[];
  /** 서비스 링크 카드 클릭. */
  onServiceClick?: (id: string) => void;
}

export function BenefitSection({
  index,
  title,
  description,
  amountLabel,
  amount,
  amountNote,
  footnote,
  servicesHeading,
  services,
  onServiceClick,
}: BenefitSectionProps) {
  return (
    <div className="flex w-full flex-col items-start gap-(--sz-8)">
      <span className="ml-(--sz-20) flex size-(--sz-22) shrink-0 items-center justify-center rounded-circle border border-border-brand-light bg-bg-brand-bright text-label-2-bold text-typo-brand-normal">
        {index}
      </span>
      <SectionTitle title={title} typo="title3" />
      <p className="w-full px-(--sz-20) text-body-5 text-typo-neutral-subtle">
        {description}
      </p>

      <div className="w-full px-(--sz-20)">
        <div className="flex w-full items-center justify-between gap-(--sz-16) rounded-lg bg-bg-neutral-deep px-(--sz-12) py-(--sz-8)">
          <span className="text-label-1 text-typo-neutral-normal">
            {amountLabel}
          </span>
          <div className="flex flex-col items-end">
            <p className="text-right text-body-3-bold text-typo-neutral-normal">
              <span className="text-typo-brand-normal">{amount}</span>원
            </p>
            {amountNote ? (
              <p className="text-label-3 text-typo-neutral-bright">
                {amountNote}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <p className="w-full px-(--sz-20) text-body-5 text-typo-neutral-subtle">
        {footnote}
      </p>

      {servicesHeading ? (
        <p className="w-full px-(--sz-20) pt-(--sz-20) whitespace-pre-line text-body-4-bold text-typo-neutral-subtle">
          {servicesHeading}
        </p>
      ) : null}
      <div className="flex w-full flex-col items-start px-(--sz-20)">
        {services.map((service, serviceIndex) => (
          <div key={service.id} className="flex w-full flex-col items-start">
            {serviceIndex > 0 ? <Divider /> : null}
            <LtchProfileButtonCard
              iconSrc={service.iconSrc}
              title={service.title}
              description={service.description}
              onClick={
                onServiceClick ? () => onServiceClick(service.id) : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
