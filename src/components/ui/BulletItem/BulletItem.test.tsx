import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BulletItem, type BulletItemProps } from "./BulletItem";

type Color = NonNullable<BulletItemProps["color"]>;
type Size = NonNullable<BulletItemProps["size"]>;

const marker = (c: HTMLElement) => c.querySelector('[data-part="marker"]');
const title = (c: HTMLElement) => c.querySelector('[data-part="title"]');
const contents = (c: HTMLElement) => c.querySelector('[data-part="contents"]');

describe("BulletItem", () => {
  it("기본값은 neutral / vertical / sm 으로 마커·제목·본문을 렌더한다", () => {
    const { container } = render(<BulletItem />);
    const root = container.firstElementChild;
    expect(root?.tagName.toLowerCase()).toBe("div");
    expect(root).toHaveAttribute("data-color", "neutral");
    expect(root).toHaveAttribute("data-direction", "vertical");
    expect(root).toHaveAttribute("data-size", "sm");
    expect(marker(container as HTMLElement)).toHaveTextContent("·");
    expect(title(container as HTMLElement)).toHaveTextContent("Title");
    expect(contents(container as HTMLElement)).toHaveTextContent(
      "Contents Text",
    );
  });

  it("titleValue / contentsText prop 을 그대로 표시한다", () => {
    const { container } = render(
      <BulletItem titleValue="약관 동의" contentsText="필수 항목입니다." />,
    );
    expect(title(container as HTMLElement)).toHaveTextContent("약관 동의");
    expect(contents(container as HTMLElement)).toHaveTextContent(
      "필수 항목입니다.",
    );
  });

  it("color 별 마커·제목·본문 색상 토큰 클래스가 적용된다", () => {
    const cases: Record<Color, [string, string, string]> = {
      neutral: [
        "text-typo-neutral-light",
        "text-typo-neutral-normal",
        "text-typo-neutral-subtle",
      ],
      brand: [
        "text-typo-brand-deep",
        "text-typo-brand-dark",
        "text-typo-brand-deep",
      ],
      danger: [
        "text-typo-danger-deep",
        "text-typo-danger-dark",
        "text-typo-danger-deep",
      ],
      warning: [
        "text-typo-warning-deep",
        "text-typo-warning-dark",
        "text-typo-warning-deep",
      ],
      info: [
        "text-typo-info-deep",
        "text-typo-info-dark",
        "text-typo-info-deep",
      ],
    };
    for (const [color, [m, t, c]] of Object.entries(cases) as [
      Color,
      [string, string, string],
    ][]) {
      const { container } = render(<BulletItem color={color} />);
      expect(marker(container as HTMLElement)).toHaveClass(m);
      expect(title(container as HTMLElement)).toHaveClass(t);
      expect(contents(container as HTMLElement)).toHaveClass(c);
    }
  });

  it("size 별 합성 타이포 토큰 클래스가 적용된다", () => {
    const cases: Record<Size, [string, string, string]> = {
      sm: ["text-body-5", "text-body-5-bold", "text-body-5"],
      md: ["text-body-4", "text-body-4-bold", "text-body-4"],
      lg: ["text-body-4", "text-body-3-bold", "text-body-3"],
    };
    for (const [size, [m, t, c]] of Object.entries(cases) as [
      Size,
      [string, string, string],
    ][]) {
      const { container } = render(<BulletItem size={size} />);
      expect(marker(container as HTMLElement)).toHaveClass(m);
      expect(title(container as HTMLElement)).toHaveClass(t);
      expect(contents(container as HTMLElement)).toHaveClass(c);
    }
  });

  it("bold=false 면 제목도 Medium 프리셋을 쓴다 (본문은 그대로)", () => {
    const { container } = render(<BulletItem bold={false} />);
    expect(title(container as HTMLElement)).toHaveClass("text-body-5");
    expect(title(container as HTMLElement)).not.toHaveClass("text-body-5-bold");
    expect(contents(container as HTMLElement)).toHaveClass("text-body-5");
  });

  it("direction=vertical 은 세로 스택 레이아웃 클래스를 쓴다", () => {
    const { container } = render(<BulletItem direction="vertical" />);
    const group = container.querySelector('[data-part="group"]');
    expect(group).toHaveClass("flex-col", "gap-(--sz-6)");
    expect(title(container as HTMLElement)).toHaveClass("w-full");
    expect(contents(container as HTMLElement)).toHaveClass("w-full");
  });

  it("direction=horizontal 은 제목 고정 폭 + 본문 채움 레이아웃 클래스를 쓴다", () => {
    const { container } = render(<BulletItem direction="horizontal" />);
    const group = container.querySelector('[data-part="group"]');
    expect(group).toHaveClass("flex-row", "gap-(--sz-8)");
    expect(title(container as HTMLElement)).toHaveClass(
      "w-(--sz-128)",
      "shrink-0",
    );
    expect(contents(container as HTMLElement)).toHaveClass("flex-1", "min-w-0");
  });

  it("title=false 면 제목을 렌더하지 않지만 마커·본문은 유지한다", () => {
    const { container } = render(<BulletItem title={false} />);
    expect(title(container as HTMLElement)).toBeNull();
    expect(contents(container as HTMLElement)).not.toBeNull();
    expect(marker(container as HTMLElement)).not.toBeNull();
  });

  it("contents=false 면 본문을 렌더하지 않지만 마커·제목은 유지한다", () => {
    const { container } = render(<BulletItem contents={false} />);
    expect(contents(container as HTMLElement)).toBeNull();
    expect(title(container as HTMLElement)).not.toBeNull();
    expect(marker(container as HTMLElement)).not.toBeNull();
  });

  it("title·contents 둘 다 false 면 마커만 남고 contents 그룹은 사라진다", () => {
    const { container } = render(<BulletItem title={false} contents={false} />);
    expect(marker(container as HTMLElement)).not.toBeNull();
    expect(container.querySelector('[data-part="group"]')).toBeNull();
  });

  it("마커는 항상 aria-hidden 인 장식 요소다", () => {
    const { container } = render(<BulletItem />);
    expect(marker(container as HTMLElement)).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("색은 토큰 유틸로만 지정하고 렌더 마크업에 리터럴 hex 가 없다", () => {
    const { container } = render(
      <BulletItem color="brand" size="lg" direction="horizontal" />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("className 을 루트에 병합하고 기본 클래스도 유지한다", () => {
    const { container } = render(<BulletItem className="mt-(--sz-8)" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("mt-(--sz-8)", "flex", "w-full");
  });
});
