import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

describe("Switch", () => {
  it("기본값은 size md / unchecked / enable 로 렌더한다", () => {
    const { container } = render(<Switch />);
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    expect(label).toHaveAttribute("data-size", "md");
    expect(label).toHaveAttribute("data-checked", "false");
    expect(label).toHaveAttribute("data-state", "enable");
    expect(label).toHaveClass("group", "inline-flex", "cursor-pointer");
  });

  it("label > input[type=checkbox][role=switch] + 트랙 span + 썸 span 구조를 렌더한다", () => {
    const { container } = render(<Switch />);
    const input = container.querySelector("label > input")!;
    expect(input).toHaveAttribute("type", "checkbox");
    expect(input).toHaveAttribute("role", "switch");
    expect(input).toHaveClass("peer", "sr-only");

    const track = container.querySelector("label > span")!;
    const thumb = container.querySelector("label > span > span")!;
    expect(track).toBeInTheDocument();
    expect(thumb).toBeInTheDocument();
    expect(track).toHaveClass("rounded-circle", "outline", "outline-1");
    expect(thumb).toHaveClass("rounded-circle", "shadow-black-sm");
  });

  it("size 별 트랙/썸 치수 클래스가 적용된다", () => {
    const cases = {
      sm: {
        track: ["w-(--sz-46)", "h-(--sz-26)"],
        thumb: ["size-(--sz-20)"],
      },
      md: {
        track: ["w-(--sz-56)", "h-(--sz-34)"],
        thumb: ["size-(--sz-28)"],
      },
    } as const;
    for (const [size, { track, thumb }] of Object.entries(cases)) {
      const { container } = render(<Switch size={size as "sm" | "md"} />);
      expect(container.querySelector("label > span")).toHaveClass(...track);
      expect(container.querySelector("label > span > span")).toHaveClass(
        ...thumb,
      );
    }
  });

  it("checked=true(md) 는 썸을 translate-x-(--sz-22) 로, off 는 translate-x-0 으로 이동한다", () => {
    const on = render(<Switch checked onChange={() => {}} />);
    expect(on.container.querySelector("label > span > span")).toHaveClass(
      "translate-x-(--sz-22)",
    );

    const off = render(<Switch />);
    expect(off.container.querySelector("label > span > span")).toHaveClass(
      "translate-x-0",
    );
  });

  it("checked=true(sm) 는 썸을 translate-x-(--sz-20) 로 이동한다", () => {
    const { container } = render(
      <Switch size="sm" checked onChange={() => {}} />,
    );
    expect(container.querySelector("label > span > span")).toHaveClass(
      "translate-x-(--sz-20)",
    );
  });

  it("uncontrolled: defaultChecked 에서 클릭 시 토글된다", async () => {
    const user = userEvent.setup();
    const { container } = render(<Switch defaultChecked={false} />);
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    expect(input.checked).toBe(false);

    await user.click(label);
    expect(input.checked).toBe(true);
    expect(label).toHaveAttribute("data-checked", "true");

    await user.click(label);
    expect(input.checked).toBe(false);
  });

  it("controlled: checked 를 고정하고 onChange 를 호출한다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Switch checked={false} onChange={onChange} />,
    );
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;

    await user.click(label);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(false);
    expect(label).toHaveAttribute("data-checked", "false");
  });

  it("disabled 는 토글되지 않고 onChange 를 호출하지 않으며 cursor-not-allowed 를 쓴다", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<Switch disabled onChange={onChange} />);
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;

    expect(input).toBeDisabled();
    expect(label).toHaveClass("cursor-not-allowed");
    expect(label).not.toHaveClass("cursor-pointer");
    expect(label).toHaveAttribute("data-state", "disabled");

    await user.click(label);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it("checked 외 input 속성을 <input> 에 spread 한다", () => {
    const { container } = render(
      <Switch name="notify" value="email" required />,
    );
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("name", "notify");
    expect(input).toHaveAttribute("value", "email");
    expect(input).toBeRequired();
  });

  it("className 을 루트 label 에 병합한다", () => {
    const { container } = render(<Switch className="w-full" />);
    expect(container.querySelector("label")).toHaveClass("w-full", "group");
  });

  it("루트/썸에 motion-reduce:transition-none 이 있다", () => {
    const { container } = render(<Switch />);
    expect(container.querySelector("label > span")).toHaveClass(
      "motion-reduce:transition-none",
    );
    expect(container.querySelector("label > span > span")).toHaveClass(
      "motion-reduce:transition-none",
    );
  });

  it("마크업에 hex 가 없다", () => {
    const { container } = render(<Switch checked disabled />);
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
  });
});
