import type { Preview } from "@storybook/react";
import "../src/index.css";
import "pretendard/dist/web/static/pretendard.css";

// 앱 index.html의 <body class="antialiased">와 동일 — macOS 기본 폰트 스무딩이 Figma보다 획을 두껍게 그려서 맞춘다.
document.body.classList.add("antialiased");

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: ["Components", "Tokens", "Screens"],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
