import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("기본값(person/readOnly/md)은 비인터랙티브 <div> 를 렌더하고 data-* 를 부여한다(버튼 없음)", () => {
    const { container } = render(<Avatar />);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-type", "person");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-variant", "readOnly");
    expect(root).toHaveClass("size-(--sz-48)");
    expect(container.querySelector("button")).toBeNull();
  });

  it("variant='readOnly' 는 onClick 을 전달해도 호출되지 않는다(클릭 불가)", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Avatar onClick={onClick} />);
    const root = container.firstElementChild!;
    await user.click(root);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("type='person' 은 src 가 없으면 personPlaceholder 이미지를 렌더한다", () => {
    const { container } = render(<Avatar />);
    const img = container.querySelector("img")!;
    expect(img).not.toBeNull();
    expect(img).toHaveClass("object-cover", "rounded-circle");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("src 가 있으면 <img src object-cover> 를 렌더하고 placeholder svg 는 없다", () => {
    const { container } = render(<Avatar src="/photo.jpg" alt="사용자" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/photo.jpg");
    expect(img).toHaveAttribute("alt", "사용자");
    expect(img).toHaveClass("object-cover", "rounded-circle");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("type='person'/'ltch' 는 각각 다른 기본 placeholder 이미지를 쓰고 svg 는 렌더하지 않는다", () => {
    const person = render(<Avatar type="person" />);
    const personImg = person.container.querySelector("img")!;
    expect(personImg).not.toBeNull();
    expect(person.container.querySelector("svg")).toBeNull();

    const ltch = render(<Avatar type="ltch" />);
    const ltchImg = ltch.container.querySelector("img")!;
    expect(ltchImg).not.toBeNull();
    expect(ltch.container.querySelector("svg")).toBeNull();
    expect(ltchImg).toHaveAttribute("src");
    expect(ltchImg.getAttribute("src")).not.toBe(personImg.getAttribute("src"));

    const ltchRoot = ltch.container.firstElementChild!;
    expect(ltchRoot.tagName).toBe("DIV");
    expect(ltchRoot).toHaveAttribute("data-type", "ltch");
  });

  it("기본 placeholder 이미지는 object-cover/object-center 로 비율 유지 중앙 크롭한다", () => {
    const { container } = render(<Avatar type="ltch" />);
    const img = container.querySelector("img")!;
    expect(img).toHaveClass("object-cover", "object-center", "size-full");
  });

  it("type='ltch' 는 variant 를 무시하고 항상 비인터랙티브 <div> 를 렌더한다", () => {
    const { container } = render(<Avatar type="ltch" variant="checkable" />);
    expect(container.querySelector("button")).toBeNull();
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    // checkable 링/체크 마크업이 전혀 없어야 한다.
    expect(container.querySelector("[data-checked]")).toBeNull();
  });

  it("type='add' 는 <button> 을 렌더하고 기본 aria-label 은 '새 아바타 추가' 다", () => {
    const { getByRole } = render(<Avatar type="add" />);
    const btn = getByRole("button", { name: "새 아바타 추가" });
    expect(btn).toHaveAttribute("data-type", "add");
    expect(btn).toHaveClass("border-dashed");
  });

  it("variant='edit' 은 person 루트를 <div> 로, 편집 배지를 <button> 으로 렌더한다(이미지는 클릭 불가)", () => {
    const { container, getByRole, queryByRole } = render(
      <Avatar variant="edit" />,
    );
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveAttribute("data-type", "person");
    expect(root).toHaveAttribute("data-variant", "edit");

    // 아바타 루트 자체는 버튼이 아니다 — 클릭 가능한 건 편집 배지뿐이다.
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(1);

    const badge = getByRole("button", { name: "아바타 편집" });
    expect(badge.tagName).toBe("BUTTON");
    expect(badge).toHaveAttribute("type", "button");
    expect(badge).toHaveClass("bg-bg-brandGrayish-deep", "shadow-black-xs");
    expect(queryByRole("button", { name: "아바타" })).toBeNull();
  });

  it("variant='edit' 은 편집 배지 아이콘 색으로 text-icon-brandGrayish-normal 을 쓴다", () => {
    const { container } = render(<Avatar variant="edit" />);
    const icon = container.querySelector(
      "button svg, button img, button [class*='icon']",
    );
    const badge = container.querySelector("button")!;
    expect(badge.innerHTML).toContain("text-icon-brandGrayish-normal");
    expect(icon).not.toBeNull();
  });

  it("variant='edit' 배지 클릭 시 onEditClick 이 호출되고, 루트(div) 클릭은 아무 효과가 없다", async () => {
    const onEditClick = vi.fn();
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { container, getByRole } = render(
      <Avatar variant="edit" onEditClick={onEditClick} onClick={onClick} />,
    );

    const badge = getByRole("button", { name: "아바타 편집" });
    await user.click(badge);
    expect(onEditClick).toHaveBeenCalledTimes(1);
    // readOnly/checkable 전용인 onClick 은 edit 배지 클릭으로 호출되지 않는다.
    expect(onClick).not.toHaveBeenCalled();

    const root = container.firstElementChild!;
    await user.click(root);
    expect(onEditClick).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("variant='readOnly' 는 배지/링을 렌더하지 않는다(자식 span 이 이미지 래퍼 하나뿐)", () => {
    const { container } = render(<Avatar variant="readOnly" />);
    const root = container.firstElementChild!;
    const ariaHiddenSpans = root.querySelectorAll('span[aria-hidden="true"]');
    expect(ariaHiddenSpans).toHaveLength(0);
    expect(container.querySelector("button")).toBeNull();
  });

  it("variant='checkable' 클릭 시 aria-pressed 와 data-checked 가 토글되고 onCheckedChange 가 호출된다(uncontrolled)", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Avatar variant="checkable" onCheckedChange={onCheckedChange} />,
    );
    const btn = getByRole("button", { name: "아바타 선택" });

    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(btn).toHaveAttribute("data-checked", "false");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(btn).toHaveAttribute("data-checked", "true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("variant='checkable' controlled(checked) 는 내부 상태로 바뀌지 않고 콜백만 호출한다", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    const { getByRole } = render(
      <Avatar
        variant="checkable"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const btn = getByRole("button");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("variant='checkable' defaultChecked=true 면 처음부터 체크 상태이고 링이 opacity-100 이다", () => {
    const { getByRole } = render(<Avatar variant="checkable" defaultChecked />);
    const btn = getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "true");
    const ring = btn.querySelector('span[aria-hidden="true"]')!;
    expect(ring).toHaveClass("opacity-100");
  });

  it("size 별 루트 지름 토큰이 적용된다", () => {
    const cases = {
      xs: "size-(--sz-24)",
      sm: "size-(--sz-32)",
      md: "size-(--sz-48)",
      lg: "size-(--sz-60)",
      xl: "size-(--sz-72)",
      "2xl": "size-(--sz-84)",
    } as const;
    for (const [size, cls] of Object.entries(cases)) {
      const { container, unmount } = render(
        <Avatar size={size as keyof typeof cases} />,
      );
      expect(container.firstElementChild).toHaveClass(cls);
      unmount();
    }
  });

  it("aria-label 을 명시하면 기본 라벨을 덮어쓴다(variant='checkable')", () => {
    const { getByRole } = render(
      <Avatar variant="checkable" aria-label="김또가 프로필" />,
    );
    expect(getByRole("button", { name: "김또가 프로필" })).toBeInTheDocument();
  });

  it("className 을 루트에 병합한다", () => {
    const { container } = render(<Avatar className="absolute top-0" />);
    expect(container.firstElementChild).toHaveClass(
      "absolute",
      "top-0",
      "size-(--sz-48)",
    );
  });

  it("색은 토큰 유틸/var(--*) 로만 지정하고 마크업에 hex 가 없다", () => {
    const { container } = render(<Avatar variant="edit" type="person" />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
