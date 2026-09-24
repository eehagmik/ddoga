import type { Preview } from "@storybook/react";
import "../src/index.css";
import "pretendard/dist/web/static/pretendard.css";

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
        order: ["Components", "Tokens"],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
