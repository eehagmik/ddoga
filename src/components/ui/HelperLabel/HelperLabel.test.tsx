import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HelperLabel } from "./HelperLabel";

describe("HelperLabel", () => {
  describe("Props rendering", () => {
    it("렌더링됨 — 기본값", () => {
      render(<HelperLabel />);
      expect(screen.getByText("Helper Label Message")).toBeInTheDocument();
    });

    it("label prop 적용됨", () => {
      render(<HelperLabel label="Custom Message" />);
      expect(screen.getByText("Custom Message")).toBeInTheDocument();
    });

    it("size=sm 적용됨", () => {
      render(<HelperLabel label="Test" size="sm" />);
      const text = screen.getByText("Test");
      expect(text).toHaveClass("text-[length:var(--text-xs)]");
    });

    it("size=md 적용됨", () => {
      render(<HelperLabel label="Test" size="md" />);
      const text = screen.getByText("Test");
      expect(text).toHaveClass("text-[length:var(--text-sm)]");
    });
  });

  describe("Variant styling", () => {
    it("variant=default — 텍스트 색 적용됨", () => {
      render(<HelperLabel label="Test" variant="default" />);
      const text = screen.getByText("Test");
      expect(text).toHaveClass("text-typo-neutral-subtle");
    });

    it("variant=success — 텍스트 색 + 아이콘 렌더링됨", () => {
      const { container } = render(
        <HelperLabel label="Success" variant="success" />,
      );
      const text = screen.getByText("Success");
      expect(text).toHaveClass("text-typo-brand-normal");

      // 아이콘 영역 존재 확인
      const iconArea = container.querySelector('[data-name="icon area"]');
      expect(iconArea).toBeInTheDocument();
    });

    it("variant=danger — 텍스트 색 + 아이콘 렌더링됨", () => {
      const { container } = render(
        <HelperLabel label="Error" variant="danger" />,
      );
      const text = screen.getByText("Error");
      expect(text).toHaveClass("text-typo-danger-normal");

      // 아이콘 영역 존재 확인
      const iconArea = container.querySelector('[data-name="icon area"]');
      expect(iconArea).toBeInTheDocument();
    });

    it("variant=warning — 텍스트 색 + 아이콘 렌더링됨", () => {
      const { container } = render(
        <HelperLabel label="Warning" variant="warning" />,
      );
      const text = screen.getByText("Warning");
      expect(text).toHaveClass("text-typo-neutral-subtle");

      // 아이콘 영역 존재 확인
      const iconArea = container.querySelector('[data-name="icon area"]');
      expect(iconArea).toBeInTheDocument();
    });
  });

  describe("Icon rendering", () => {
    it("variant=default 일 때 아이콘 없음", () => {
      const { container } = render(
        <HelperLabel label="Test" variant="default" />,
      );
      const iconArea = container.querySelector('[data-name="icon area"]');
      expect(iconArea).not.toBeInTheDocument();
    });

    it("variant=success 일 때 아이콘 렌더링됨", () => {
      const { container } = render(
        <HelperLabel label="Test" variant="success" />,
      );
      const iconArea = container.querySelector('[data-name="icon area"]');
      expect(iconArea).toBeInTheDocument();
    });

    it("variant=danger 일 때 아이콘 렌더링됨", () => {
      const { container } = render(
        <HelperLabel label="Test" variant="danger" />,
      );
      const iconArea = container.querySelector('[data-name="icon area"]');
      expect(iconArea).toBeInTheDocument();
    });

    it("variant=warning 일 때 아이콘 렌더링됨", () => {
      const { container } = render(
        <HelperLabel label="Test" variant="warning" />,
      );
      const iconArea = container.querySelector('[data-name="icon area"]');
      expect(iconArea).toBeInTheDocument();
    });
  });

  describe("Layout & classes", () => {
    it("루트에 flex 레이아웃 클래스 적용됨", () => {
      const { container } = render(<HelperLabel label="Test" />);
      const root = container.firstChild;
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("items-start");
      expect(root).toHaveClass("gap-[var(--sz-5)]");
    });

    it("테스트 텍스트에 break-keep 적용됨", () => {
      render(<HelperLabel label="Test" />);
      const text = screen.getByText("Test");
      expect(text).toHaveClass("break-keep");
    });

    it("icon wrapper pt 크기 — size=sm", () => {
      const { container } = render(
        <HelperLabel label="Test" size="sm" variant="success" />,
      );
      const iconWrapper = container.querySelector('[data-name="icon area"]');
      expect(iconWrapper).toHaveClass("pt-[var(--sz-2)]");
    });

    it("icon wrapper pt 크기 — size=md", () => {
      const { container } = render(
        <HelperLabel label="Test" size="md" variant="success" />,
      );
      const iconWrapper = container.querySelector('[data-name="icon area"]');
      expect(iconWrapper).toHaveClass("pt-[var(--sz-4)]");
    });

    it("icon 크기 — size=sm", () => {
      const { container } = render(
        <HelperLabel label="Test" size="sm" variant="success" />,
      );
      const iconWrapper = container.querySelector('[data-name="icon area"]');
      expect(iconWrapper).toHaveClass("size-[var(--sz-16)]");
    });

    it("icon 크기 — size=md", () => {
      const { container } = render(
        <HelperLabel label="Test" size="md" variant="success" />,
      );
      const iconWrapper = container.querySelector('[data-name="icon area"]');
      expect(iconWrapper).toHaveClass("size-[var(--sz-18)]");
    });
  });

  describe("className override", () => {
    it("className prop 병합됨", () => {
      const { container } = render(
        <HelperLabel label="Test" className="custom-class" />,
      );
      const root = container.firstChild;
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("flex"); // 기존 클래스 유지
    });
  });

  describe("Typography", () => {
    it("size=sm 타이포 클래스 적용됨", () => {
      render(<HelperLabel label="Test" size="sm" />);
      const text = screen.getByText("Test");
      expect(text).toHaveClass("text-[length:var(--text-xs)]");
      expect(text).toHaveClass("tracking-[-0.14px]");
      expect(text).toHaveClass("leading-[1.46]");
    });

    it("size=md 타이포 클래스 적용됨", () => {
      render(<HelperLabel label="Test" size="md" />);
      const text = screen.getByText("Test");
      expect(text).toHaveClass("text-[length:var(--text-sm)]");
      expect(text).toHaveClass("tracking-[-0.16px]");
      expect(text).toHaveClass("leading-[1.47]");
    });

    it("font-weight Medium 적용됨", () => {
      render(<HelperLabel label="Test" />);
      const text = screen.getByText("Test");
      expect(text).toHaveClass("font-medium");
    });
  });

  describe("HTML attributes", () => {
    it("data 속성 전달됨", () => {
      const { container } = render(
        <HelperLabel label="Test" data-testid="helper-label" />,
      );
      expect(
        container.querySelector("[data-testid='helper-label']"),
      ).toBeDefined();
    });

    it("aria 속성 전달됨", () => {
      const { container } = render(<HelperLabel label="Test" role="status" />);
      expect(container.firstChild).toHaveAttribute("role", "status");
    });
  });
});
