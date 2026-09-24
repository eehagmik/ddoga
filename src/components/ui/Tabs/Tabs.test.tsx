import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tab } from "../Tab";
import { Tabs } from "./Tabs";

describe("Tabs", () => {
  it("기본값(link/fit/sm/normal)으로 <nav> 를 렌더하고 data-* 를 부여한다", () => {
    const { getByRole } = render(
      <Tabs aria-label="탭">
        <Tab selected>A</Tab>
        <Tab>B</Tab>
      </Tabs>,
    );
    const nav = getByRole("navigation", { name: "탭" });
    expect(nav).toHaveAttribute("data-type", "link");
    expect(nav).toHaveAttribute("data-layout", "fit");
    expect(nav).toHaveAttribute("data-size", "sm");
    expect(nav).toHaveAttribute("data-variant", "normal");
  });

  it("children 으로 넘긴 Tab 을 개수 제한 없이 그대로 렌더한다", () => {
    const { getAllByRole } = render(
      <Tabs>
        <Tab>A</Tab>
        <Tab>B</Tab>
        <Tab>C</Tab>
      </Tabs>,
    );
    expect(getAllByRole("button")).toHaveLength(3);
  });

  it("type 은 시각 클래스에 영향 없이 data-type 만 바꾼다", () => {
    const { getByRole, rerender } = render(
      <Tabs type="link">
        <Tab>A</Tab>
      </Tabs>,
    );
    const linkNav = getByRole("navigation");
    const linkClass = linkNav.className;

    rerender(
      <Tabs type="focus">
        <Tab>A</Tab>
      </Tabs>,
    );
    const focusNav = getByRole("navigation");
    expect(focusNav).toHaveAttribute("data-type", "focus");
    expect(focusNav.className).toBe(linkClass);
  });

  it("layout=fit 은 items-end, layout=full 은 items-center + 자식 flex-1 클래스를 쓴다", () => {
    const { getByRole, rerender } = render(
      <Tabs layout="fit">
        <Tab>A</Tab>
      </Tabs>,
    );
    expect(getByRole("navigation")).toHaveClass("items-end");

    rerender(
      <Tabs layout="full">
        <Tab>A</Tab>
      </Tabs>,
    );
    expect(getByRole("navigation")).toHaveClass(
      "items-center",
      "justify-center",
      "[&>*]:flex-1",
    );
  });

  it("variant=normal/blur 별 배경 클래스를 적용한다", () => {
    const { getByRole, rerender } = render(
      <Tabs variant="normal">
        <Tab>A</Tab>
      </Tabs>,
    );
    expect(getByRole("navigation")).toHaveClass("bg-bg-neutral-normal");

    rerender(
      <Tabs variant="blur">
        <Tab>A</Tab>
      </Tabs>,
    );
    expect(getByRole("navigation")).toHaveClass(
      "bg-bg-overlay-whiteSubtle",
      "backdrop-blur-header",
    );
  });

  it("하단 baseline 구분선 클래스를 공통으로 적용한다", () => {
    const { getByRole } = render(
      <Tabs>
        <Tab>A</Tab>
      </Tabs>,
    );
    expect(getByRole("navigation")).toHaveClass(
      "border-b-[length:var(--border-width-xs)]",
      "border-border-neutral-bright",
    );
  });

  it("className 을 병합하고 기본 클래스도 유지한다", () => {
    const { getByRole } = render(
      <Tabs className="rounded-t-2xl">
        <Tab>A</Tab>
      </Tabs>,
    );
    expect(getByRole("navigation")).toHaveClass("rounded-t-2xl", "flex");
  });

  it("렌더 결과에 리터럴 hex 색상값이 없다", () => {
    const { container } = render(
      <Tabs variant="blur">
        <Tab selected>A</Tab>
        <Tab>B</Tab>
      </Tabs>,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,}/);
  });
});
