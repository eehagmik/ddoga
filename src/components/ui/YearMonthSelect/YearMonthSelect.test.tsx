import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { YearMonthSelectValue } from "./YearMonthSelect";
import { YearMonthSelect } from "./YearMonthSelect";

const DEFAULT_VALUE: YearMonthSelectValue = { year: 2024, month: 10 };

describe("YearMonthSelect", () => {
  it("연도·월 2열을 렌더한다", () => {
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByRole("listbox", { name: "연도" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "월" })).toBeInTheDocument();
  });

  it("초기 선택 값이 checked 스타일(bg-bg-info-normal)로 표시된다", () => {
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    expect(screen.getByRole("option", { name: "2024년" })).toHaveClass(
      "bg-bg-info-normal",
    );
    expect(screen.getByRole("option", { name: "10월" })).toHaveClass(
      "bg-bg-info-normal",
    );
  });

  it("선택되지 않은 셀은 배경 없이 typo-neutral-bright 색만 갖는다", () => {
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const monthThree = screen.getByRole("option", { name: "03월" });
    expect(monthThree).toHaveClass("text-typo-neutral-bright");
    expect(monthThree).not.toHaveClass("bg-bg-info-normal");
  });

  it("월 열은 1~12(2자리 zero-pad, 순환 없음)를 고정 렌더한다", () => {
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const monthList = screen.getByRole("listbox", { name: "월" });
    const options = within(monthList).getAllByRole("option");
    expect(options).toHaveLength(12);
    expect(
      within(monthList).getByRole("option", { name: "01월" }),
    ).toBeInTheDocument();
    expect(
      within(monthList).getByRole("option", { name: "12월" }),
    ).toBeInTheDocument();
  });

  it("연도 열은 기본값(오늘 연도 -100 ~ +50)으로 렌더한다", () => {
    const today = new Date();
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} />);
    const yearList = screen.getByRole("listbox", { name: "연도" });
    expect(within(yearList).getAllByRole("option")).toHaveLength(151);
    expect(
      within(yearList).getByRole("option", {
        name: `${today.getFullYear() - 100}년`,
      }),
    ).toBeInTheDocument();
    expect(
      within(yearList).getByRole("option", {
        name: `${today.getFullYear() + 50}년`,
      }),
    ).toBeInTheDocument();
  });

  it("minYear/maxYear 로 연도 범위를 오버라이드할 수 있다", () => {
    render(
      <YearMonthSelect
        value={{ year: 2025, month: 1 }}
        onChange={vi.fn()}
        minYear={2020}
        maxYear={2030}
      />,
    );
    const yearList = screen.getByRole("listbox", { name: "연도" });
    const options = within(yearList).getAllByRole("option");
    expect(options).toHaveLength(11);
    expect(
      within(yearList).getByRole("option", { name: "2020년" }),
    ).toBeInTheDocument();
    expect(
      within(yearList).getByRole("option", { name: "2030년" }),
    ).toBeInTheDocument();
    expect(
      within(yearList).queryByRole("option", { name: "2019년" }),
    ).not.toBeInTheDocument();
  });

  it("연도 셀 클릭 시 onChange 에 변경된 year 와 기존 month 를 함께 전달한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={onChange} />);

    await user.click(screen.getByRole("option", { name: "2025년" }));
    expect(onChange).toHaveBeenCalledWith({ year: 2025, month: 10 });
  });

  it("월 셀 클릭 시 onChange 에 변경된 month 를 전달한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={onChange} />);

    const monthList = screen.getByRole("listbox", { name: "월" });
    await user.click(within(monthList).getByRole("option", { name: "03월" }));
    expect(onChange).toHaveBeenCalledWith({ year: 2024, month: 3 });
  });

  it("같은 값을 다시 클릭하면 onChange 를 호출하지 않는다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<YearMonthSelect value={DEFAULT_VALUE} onChange={onChange} />);

    await user.click(screen.getByRole("option", { name: "2024년" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  describe("disabled", () => {
    it("모든 셀이 disabled 이고 클릭해도 onChange 가 호출되지 않는다", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <YearMonthSelect value={DEFAULT_VALUE} onChange={onChange} disabled />,
      );

      const monthThree = screen.getByRole("option", { name: "03월" });
      expect(monthThree).toBeDisabled();
      await user.click(monthThree);
      expect(onChange).not.toHaveBeenCalled();

      const yearOption = screen.getByRole("option", { name: "2025년" });
      expect(yearOption).toBeDisabled();
      await user.click(yearOption);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("disabled 여도 선택된 셀은 checked=true/enable 룩(bg-bg-info-normal)을 유지한다", () => {
      render(
        <YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} disabled />,
      );
      expect(screen.getByRole("option", { name: "2024년" })).toHaveClass(
        "bg-bg-info-normal",
      );
    });

    it("disabled 이고 선택되지 않은 셀은 typo-disabled-subtle 색이다", () => {
      render(
        <YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} disabled />,
      );
      expect(screen.getByRole("option", { name: "03월" })).toHaveClass(
        "text-typo-disabled-subtle",
      );
    });
  });

  it("value prop 이 외부에서 바뀌면(controlled) 새 값이 checked 로 반영된다", () => {
    const { rerender } = render(
      <YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("option", { name: "2024년" })).toHaveClass(
      "bg-bg-info-normal",
    );

    rerender(
      <YearMonthSelect value={{ year: 2027, month: 5 }} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("option", { name: "2027년" })).toHaveClass(
      "bg-bg-info-normal",
    );
    const monthList = screen.getByRole("listbox", { name: "월" });
    expect(within(monthList).getByRole("option", { name: "05월" })).toHaveClass(
      "bg-bg-info-normal",
    );
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(
      <YearMonthSelect
        value={DEFAULT_VALUE}
        onChange={vi.fn()}
        className="mt-4"
      />,
    );
    expect(container.firstElementChild).toHaveClass("mt-4");
  });

  it("색을 토큰 유틸/var(--color-*) 로만 지정하고 인라인 hex 가 없다", () => {
    const { container } = render(
      <YearMonthSelect value={DEFAULT_VALUE} onChange={vi.fn()} disabled />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});
