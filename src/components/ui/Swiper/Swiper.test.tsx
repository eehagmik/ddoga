import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Swiper } from "./Swiper";

function renderSlides(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index}>슬라이드 {index + 1}</div>
  ));
}

describe("Swiper", () => {
  // variant="sharp" 로 고정 — round(기본값)는 무한 루프 착시를 위해 첫/끝 슬라이드를
  // 복제해 렌더하므로(아래 "복제 슬라이드" 테스트 참고) "슬라이드 1" 텍스트가 두 번
  // 나와 getByText 가 실패한다. 여기서 검증하려는 건 variant 무관 "children 이 전부
  // 렌더되는지" 이므로 복제가 없는 sharp 로 확인한다.
  it("children 을 모두 슬라이드로 렌더한다", () => {
    render(<Swiper variant="sharp">{renderSlides(3)}</Swiper>);
    expect(screen.getByText("슬라이드 1")).toBeInTheDocument();
    expect(screen.getByText("슬라이드 2")).toBeInTheDocument();
    expect(screen.getByText("슬라이드 3")).toBeInTheDocument();
  });

  it("round(기본값) + 슬라이드 2개 이상이면 무한 루프 착시를 위해 첫/끝 슬라이드를 복제해 렌더한다", () => {
    render(<Swiper>{renderSlides(3)}</Swiper>);
    // padded 배열 = [clone(마지막), 실제 1, 2, 3, clone(처음)] — 첫/끝만 2번씩 나온다.
    expect(screen.getAllByText("슬라이드 1")).toHaveLength(2);
    expect(screen.getByText("슬라이드 2")).toBeInTheDocument();
    expect(screen.getAllByText("슬라이드 3")).toHaveLength(2);
  });

  it("indicator='none'(기본값) 이면 이전/다음 버튼과 칩 배지를 렌더하지 않는다", () => {
    render(<Swiper>{renderSlides(3)}</Swiper>);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("indicator='direction' 이면 이전/다음 버튼과 CountLabel 을 렌더한다", () => {
    render(<Swiper indicator="direction">{renderSlides(3)}</Swiper>);
    expect(
      screen.getByRole("button", { name: "이전 슬라이드" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다음 슬라이드" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
  });

  // NOTE: variant="sharp" 로 고정 — round 는 slidesPerView="auto"(실제 슬라이드
  // 픽셀 폭 측정 필요)를 쓰는데, jsdom 은 레이아웃 엔진이 없어 offsetWidth/getBoundingClientRect
  // 가 항상 0 이고 `calc(100vw - ...)` 도 해석하지 못해 Swiper 내부 인덱스 계산이
  // NaN 으로 깨진다(실측으로 확인). 여기서 검증하려는 건 인디케이터 클릭 시 카운트가
  // 갱신되는 variant 무관 동작이라, jsdom 에서 안정적으로 측정 가능한 sharp 로 검증한다
  // — round 전용 full-bleed/peek 레이아웃은 Storybook/실제 브라우저로 실측 검증했다.
  it("indicator='direction' 에서 다음 버튼 클릭 시 CountLabel 이 갱신된다", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Swiper variant="sharp" indicator="direction">
        {renderSlides(3)}
      </Swiper>,
    );
    const countRegion = container.querySelector('[aria-live="polite"]')!;
    expect(countRegion).toHaveTextContent("1/3Unit");

    const nextButton = screen.getByRole("button", { name: "다음 슬라이드" });
    await user.click(nextButton);

    await waitFor(() => expect(countRegion).toHaveTextContent("2/3Unit"));
  });

  it("indicator='chip' 이면 라벨·구분점·CountLabel 을 담은 배지를 렌더한다", () => {
    render(
      <Swiper indicator="chip" chipLabel="사진" unit="개">
        {renderSlides(4)}
      </Swiper>,
    );
    expect(screen.getByText("사진")).toBeInTheDocument();
    expect(screen.getByText("·")).toBeInTheDocument();
    expect(screen.getByText("개")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("슬라이드가 1개뿐이면 정적으로 렌더된다(무한 루프·자동재생 없이)", () => {
    const { container } = render(
      <Swiper indicator="direction">{renderSlides(1)}</Swiper>,
    );
    expect(screen.getByText("슬라이드 1")).toBeInTheDocument();
    const countRegion = container.querySelector('[aria-live="polite"]')!;
    expect(countRegion).toHaveTextContent("1/1Unit");
  });

  it("variant/indicator/ratio 를 data 속성으로 노출한다", () => {
    const { container } = render(
      <Swiper variant="sharp" indicator="chip" ratio="1:1">
        {renderSlides(2)}
      </Swiper>,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("data-variant", "sharp");
    expect(root).toHaveAttribute("data-indicator", "chip");
    expect(root).toHaveAttribute("data-ratio", "1:1");
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <Swiper className="max-w-[var(--sz-320)]">{renderSlides(2)}</Swiper>,
    );
    expect(container.firstElementChild).toHaveClass(
      "max-w-[var(--sz-320)]",
      "w-full",
    );
  });

  it("variant='round'(기본값) 이면 이미지 밴드가 뷰포트 폭(w-screen)을 기준으로 부모 폭을 벗어난다", () => {
    const { container } = render(<Swiper>{renderSlides(3)}</Swiper>);
    const band = container.querySelector('[data-variant="round"] > div')!;
    expect(band).toHaveClass("w-screen");
    expect(band).not.toHaveAttribute("data-name", "contentsSlot");
  });

  it("variant='sharp' 는 기존처럼 부모 폭 안에서 overflow-hidden 컨테이너를 유지한다", () => {
    const { container } = render(
      <Swiper variant="sharp">{renderSlides(3)}</Swiper>,
    );
    const band = container.querySelector('[data-variant="sharp"] > div')!;
    expect(band).toHaveClass("overflow-hidden");
    expect(band).not.toHaveClass("w-screen");
    expect(band).toHaveAttribute("data-name", "contentsSlot");
  });

  it("round + indicator='chip' 이면 배지가 스와이프되는 슬라이드가 아니라 고정된 band 에 붙는다(전환 중에도 위치 고정)", () => {
    const { container } = render(
      <Swiper indicator="chip" chipLabel="사진" unit="개">
        {renderSlides(3)}
      </Swiper>,
    );
    const band = container.querySelector('[data-variant="round"] > div')!;
    const badge = screen.getByText("사진").closest("[data-type]")!;
    // 배지가 band 의 직계 자식(스와이프 트랙 `.swiper` 의 형제)이어야 슬라이드
    // 전환 트랜스폼의 영향을 받지 않는다 — `.swiper-slide` 안에 있으면 안 된다.
    expect(badge.closest(".swiper-slide")).toBeNull();
    expect(band.contains(badge)).toBe(true);
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <Swiper indicator="chip" chipLabel="사진" unit="개">
        {renderSlides(3)}
      </Swiper>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
