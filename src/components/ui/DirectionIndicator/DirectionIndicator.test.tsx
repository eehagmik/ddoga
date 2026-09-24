import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DirectionIndicator } from "./DirectionIndicator";

describe("DirectionIndicator", () => {
  it("이전/다음 버튼과 가운데 CountLabel 을 렌더한다(기본 countable=true)", () => {
    render(
      <DirectionIndicator
        currentCount={1}
        totalCount={3}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "이전 슬라이드" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다음 슬라이드" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
  });

  it("countable=false 면 가운데 CountLabel 을 렌더하지 않는다", () => {
    render(
      <DirectionIndicator
        currentCount={1}
        totalCount={3}
        countable={false}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.queryByText("Unit")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("이전/다음 버튼 클릭 시 onPrev/onNext 를 각각 호출한다", async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <DirectionIndicator
        currentCount={1}
        totalCount={3}
        onPrev={onPrev}
        onNext={onNext}
      />,
    );

    await user.click(screen.getByRole("button", { name: "다음 슬라이드" }));
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "이전 슬라이드" }));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("prevLabel/nextLabel 로 aria-label 을 오버라이드할 수 있다", () => {
    render(
      <DirectionIndicator
        currentCount={1}
        totalCount={3}
        prevLabel="이전 사진"
        nextLabel="다음 사진"
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "이전 사진" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다음 사진" }),
    ).toBeInTheDocument();
  });

  it("currentCount/totalCount/unit 을 CountLabel 에 그대로 전달한다", () => {
    render(
      <DirectionIndicator
        currentCount={2}
        totalCount={5}
        unit="개"
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("개")).toBeInTheDocument();
  });

  it("countable 을 data 속성으로 노출한다", () => {
    const { container } = render(
      <DirectionIndicator
        currentCount={1}
        totalCount={3}
        countable={false}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute(
      "data-countable",
      "false",
    );
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <DirectionIndicator
        currentCount={1}
        totalCount={3}
        className="max-w-[var(--sz-320)]"
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(container.firstElementChild).toHaveClass(
      "max-w-[var(--sz-320)]",
      "gap-[var(--sz-8)]",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(
      <DirectionIndicator
        currentCount={1}
        totalCount={3}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
