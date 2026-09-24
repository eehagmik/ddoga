import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MenuItem } from "../MenuItem";
import { FloatingMenu } from "./FloatingMenu";

describe("FloatingMenu", () => {
  it("items 를 순서대로 렌더한다", () => {
    render(
      <FloatingMenu
        items={[
          <MenuItem key="1" label="첫번째" />,
          <MenuItem key="2" label="두번째" />,
        ]}
      />,
    );
    expect(screen.getByText("첫번째")).toBeInTheDocument();
    expect(screen.getByText("두번째")).toBeInTheDocument();
  });

  it("항목 사이에만 Divider 를 삽입한다(첫 항목 앞·마지막 항목 뒤는 없음)", () => {
    render(
      <FloatingMenu
        items={[
          <MenuItem key="1" label="첫번째" />,
          <MenuItem key="2" label="두번째" />,
          <MenuItem key="3" label="세번째" />,
        ]}
      />,
    );
    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(2);

    const root = screen
      .getByText("첫번째")
      .closest("div[class*='inline-flex']");
    const children = Array.from(root?.children ?? []);
    expect(children[0]).toHaveTextContent("첫번째");
    expect(children[children.length - 1]).toHaveTextContent("세번째");
  });

  it("항목이 1개면 Divider 를 렌더하지 않는다", () => {
    render(<FloatingMenu items={[<MenuItem key="1" label="Label" />]} />);
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  it("컨테이너에 토큰 기반 클래스를 부여한다(배경/테두리/radius/그림자/너비)", () => {
    const { container } = render(
      <FloatingMenu items={[<MenuItem key="1" label="Label" />]} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass(
      "bg-bg-neutral-normal",
      "border-border-neutral-bright",
      "rounded-2xl",
      "shadow-black-lg",
      "min-w-[var(--sz-128)]",
      "max-w-[var(--sz-256)]",
    );
  });

  it("루트에 리터럴 hex 색상을 사용하지 않는다", () => {
    const { container } = render(
      <FloatingMenu items={[<MenuItem key="1" label="Label" />]} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });

  it("className, 기타 HTML props 를 루트에 전달한다", () => {
    const { container } = render(
      <FloatingMenu
        items={[<MenuItem key="1" label="Label" />]}
        className="custom-class"
        data-testid="floating-menu"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-class");
    expect(root).toHaveAttribute("data-testid", "floating-menu");
  });
});
