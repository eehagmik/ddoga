import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Label } from "./Label";

describe("Label", () => {
  it("라벨 텍스트를 렌더한다", () => {
    render(<Label label="테스트" />);
    expect(screen.getByText("테스트")).toBeInTheDocument();
  });

  it("기본값으로 필수 표시(*)를 렌더한다", () => {
    render(<Label label="필수 입력" />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("principal={false}일 때 필수 표시(*)를 렌더하지 않는다", () => {
    render(<Label label="선택 입력" principal={false} />);
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("기본값으로 정보 아이콘을 렌더한다", () => {
    render(<Label label="테스트" />);
    const iconButton = screen.getByRole("button", { name: "정보 보기" });
    expect(iconButton).toBeInTheDocument();
  });

  it("info={false}일 때 정보 아이콘을 렌더하지 않는다", () => {
    render(<Label label="테스트" info={false} />);
    const iconButton = screen.queryByRole("button", { name: "정보 보기" });
    expect(iconButton).not.toBeInTheDocument();
  });

  it("정보 아이콘 클릭 시 onInfoClick 핸들러가 호출된다", async () => {
    const user = userEvent.setup();
    const handleInfoClick = vi.fn();
    render(<Label label="테스트" onInfoClick={handleInfoClick} />);

    const iconButton = screen.getByRole("button", { name: "정보 보기" });
    await user.click(iconButton);

    expect(handleInfoClick).toHaveBeenCalledTimes(1);
  });

  it("onInfoClick이 없으면 아이콘 클릭해도 에러가 발생하지 않는다", async () => {
    const user = userEvent.setup();
    render(<Label label="테스트" />);

    const iconButton = screen.getByRole("button", { name: "정보 보기" });
    await user.click(iconButton);

    expect(iconButton).toBeInTheDocument();
  });

  it("isBold={true}일 때 굵은 스타일을 적용한다", () => {
    const { container } = render(<Label label="굵은 텍스트" isBold />);
    const textElement = container.querySelector("p");
    expect(textElement).toHaveClass("font-bold");
  });

  it("size={md}일 때 md 사이즈 스타일을 적용한다", () => {
    const { container } = render(<Label label="중간 크기" size="md" />);
    const textElement = container.querySelector("p");
    expect(textElement).toHaveClass("text-[length:var(--text-md)]");
  });

  it("size={sm}일 때 sm 사이즈 스타일을 적용한다", () => {
    const { container } = render(<Label label="작은 크기" size="sm" />);
    const textElement = container.querySelector("p");
    expect(textElement).toHaveClass("text-[length:var(--text-sm)]");
  });

  it("className을 받아서 루트에 병합한다", () => {
    const { container } = render(
      <Label label="테스트" className="custom-class" />,
    );
    const root = container.firstChild;
    expect(root).toHaveClass("custom-class");
  });

  it("sm 크기에서 정보 아이콘 너비는 var(--sz-16)이다", () => {
    const { container } = render(<Label label="테스트" size="sm" />);
    const iconButton = container.querySelector("button");
    expect(iconButton).toHaveClass("size-[var(--sz-16)]");
  });

  it("md 크기에서 정보 아이콘 너비는 var(--sz-20)이다", () => {
    const { container } = render(<Label label="테스트" size="md" />);
    const iconButton = container.querySelector("button");
    expect(iconButton).toHaveClass("size-[var(--sz-20)]");
  });

  describe("htmlFor(폼 접근성 연결)", () => {
    it("htmlFor가 없으면 기존처럼 라벨 텍스트를 <p>로 렌더한다(하위 호환)", () => {
      const { container } = render(<Label label="이름" />);
      expect(container.querySelector("p")).toHaveTextContent("이름");
      expect(container.querySelector("label")).not.toBeInTheDocument();
    });

    it("htmlFor가 있으면 라벨 텍스트를 <label htmlFor>로 렌더하고 input과 접근성이 연결된다", () => {
      render(
        <div>
          <Label label="이름" htmlFor="name-input" />
          <input id="name-input" />
        </div>,
      );
      const input = screen.getByLabelText("이름");
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe("INPUT");
    });

    it("htmlFor가 있어도 필수 표시(*)·정보 아이콘 렌더링은 그대로 동작한다", () => {
      render(<Label label="이름" htmlFor="name-input" />);
      expect(screen.getByText("*")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "정보 보기" }),
      ).toBeInTheDocument();
    });
  });

  describe("infoLabel(정보 아이콘 접근성 라벨 커스터마이즈)", () => {
    it("기본값은 '정보 보기'이다", () => {
      render(<Label label="테스트" />);
      expect(
        screen.getByRole("button", { name: "정보 보기" }),
      ).toBeInTheDocument();
    });

    it("infoLabel을 지정하면 aria-label이 바뀐다", () => {
      render(<Label label="테스트" infoLabel="자세히 보기" />);
      expect(
        screen.getByRole("button", { name: "자세히 보기" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "정보 보기" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("정보 아이콘 렌더링(로컬 Icon 컴포넌트, 2026-09-17 CDN img → Icon 교체)", () => {
    it("정보 아이콘을 <img>가 아닌 <svg>로 렌더한다", () => {
      const { container } = render(<Label label="테스트" />);
      const iconButton = container.querySelector("button");
      expect(iconButton?.querySelector("img")).not.toBeInTheDocument();
      expect(iconButton?.querySelector("svg")).toBeInTheDocument();
    });

    it("정보 아이콘 색은 text-icon-info-normal이다", () => {
      const { container } = render(<Label label="테스트" />);
      const iconButton = container.querySelector("button");
      expect(iconButton).toHaveClass("text-icon-info-normal");
    });

    it("sm 크기에서 아이콘 svg 크기는 16px이다", () => {
      const { container } = render(<Label label="테스트" size="sm" />);
      const svg = container.querySelector("button svg");
      expect(svg).toHaveAttribute("width", "16");
      expect(svg).toHaveAttribute("height", "16");
    });

    it("md 크기에서 아이콘 svg 크기는 20px이다", () => {
      const { container } = render(<Label label="테스트" size="md" />);
      const svg = container.querySelector("button svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });
  });
});
