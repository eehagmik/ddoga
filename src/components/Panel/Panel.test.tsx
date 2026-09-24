import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Panel } from "./Panel";

describe("Panel", () => {
  it("renders with default props", () => {
    const { container } = render(<Panel />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel).toBeInTheDocument();
  });

  it("renders with white background", () => {
    const { container } = render(<Panel color="white" />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel).toHaveClass("bg-bg-neutral-normal");
  });

  it("renders with dim background", () => {
    const { container } = render(<Panel color="dim" />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel).toHaveClass("bg-bg-overlay-blackDark");
  });

  it("applies radius classes when radius=true", () => {
    const { container } = render(<Panel radius={true} placement="bottom" />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel).toHaveClass("rounded-tl-[var(--radius-3xl)]");
    expect(panel).toHaveClass("rounded-tr-[var(--radius-3xl)]");
  });

  it("applies top radius when placement=top and radius=true", () => {
    const { container } = render(<Panel radius={true} placement="top" />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel).toHaveClass("rounded-bl-[var(--radius-3xl)]");
    expect(panel).toHaveClass("rounded-br-[var(--radius-3xl)]");
  });

  it("does not apply radius when radius=false", () => {
    const { container } = render(<Panel radius={false} />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel?.className).not.toContain("rounded-");
  });

  it("applies shadow when shadow=true and placement=bottom", () => {
    const { container } = render(<Panel shadow={true} placement="bottom" />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    const classString = panel?.className || "";
    expect(classString).toContain("filter:drop-shadow");
    expect(classString).toContain("calc(var(--sz-8)*-1)");
  });

  it("applies shadow when shadow=true and placement=top", () => {
    const { container } = render(<Panel shadow={true} placement="top" />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    const classString = panel?.className || "";
    expect(classString).toContain("filter:drop-shadow");
    expect(classString).not.toContain("calc(var(--sz-8)*-1)");
  });

  it("does not apply shadow when shadow=false", () => {
    const { container } = render(<Panel shadow={false} />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    const classString = panel?.className || "";
    expect(classString).not.toContain("filter:drop-shadow");
  });

  it("renders children in the slot", () => {
    const { getByText } = render(
      <Panel>
        <span>Test Content</span>
      </Panel>,
    );
    expect(getByText("Test Content")).toBeInTheDocument();
  });

  it("renders null children gracefully", () => {
    const { container } = render(<Panel children={null} />);
    const slot = container.querySelector("[data-name='contentsSlot']");
    expect(slot).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Panel className="custom-class" />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel).toHaveClass("custom-class");
  });

  it("has correct basic layout classes", () => {
    const { container } = render(<Panel />);
    const panel = container.querySelector("[data-node-id='51405:127512']");
    expect(panel).toHaveClass("flex");
    expect(panel).toHaveClass("flex-col");
    expect(panel).toHaveClass("items-center");
    expect(panel).toHaveClass("gap-0");
    expect(panel).toHaveClass("relative");
    expect(panel).toHaveClass("w-[360px]");
    expect(panel).toHaveClass("px-[var(--sz-20)]");
    expect(panel).toHaveClass("py-[var(--sz-16)]");
  });

  it("renders contentsSlot div", () => {
    const { container } = render(<Panel />);
    const slot = container.querySelector("[data-name='contentsSlot']");
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveAttribute("data-node-id", "51405:127514");
  });

  it("applies correct border styling to slot", () => {
    const { container } = render(<Panel />);
    const slot = container.querySelector("[data-name='contentsSlot']");
    expect(slot).toHaveClass("border");
    expect(slot).toHaveClass("border-[var(--color-red-500)]");
    expect(slot).toHaveClass("border-dashed");
  });

  it("renders all variant combinations", () => {
    const combinations = [
      {
        color: "white" as const,
        placement: "top" as const,
        radius: true,
        shadow: true,
      },
      {
        color: "white" as const,
        placement: "top" as const,
        radius: true,
        shadow: false,
      },
      {
        color: "white" as const,
        placement: "top" as const,
        radius: false,
        shadow: true,
      },
      {
        color: "white" as const,
        placement: "top" as const,
        radius: false,
        shadow: false,
      },
      {
        color: "white" as const,
        placement: "bottom" as const,
        radius: true,
        shadow: true,
      },
      {
        color: "white" as const,
        placement: "bottom" as const,
        radius: true,
        shadow: false,
      },
      {
        color: "white" as const,
        placement: "bottom" as const,
        radius: false,
        shadow: true,
      },
      {
        color: "white" as const,
        placement: "bottom" as const,
        radius: false,
        shadow: false,
      },
      {
        color: "dim" as const,
        placement: "top" as const,
        radius: true,
        shadow: false,
      },
      {
        color: "dim" as const,
        placement: "top" as const,
        radius: false,
        shadow: false,
      },
      {
        color: "dim" as const,
        placement: "bottom" as const,
        radius: true,
        shadow: false,
      },
      {
        color: "dim" as const,
        placement: "bottom" as const,
        radius: false,
        shadow: false,
      },
    ];

    combinations.forEach(({ color, placement, radius, shadow }) => {
      const { container } = render(
        <Panel
          color={color}
          placement={placement}
          radius={radius}
          shadow={shadow}
        />,
      );
      const panel = container.querySelector("[data-node-id='51405:127512']");
      expect(panel).toBeInTheDocument();
    });
  });
});
