import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// 각 테스트 후 DOM 정리 (globals: true 여도 명시적으로 안전하게)
afterEach(() => {
  cleanup();
});
