import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: async (cfg) => {
    // Storybook runs outside of Next, so stub next/link and next/navigation
    // to keep component stories renderable in isolation.
    const path = await import("node:path");
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias as Record<string, string> | undefined),
      "next/link": path.resolve(__dirname, "./mocks/next-link.tsx"),
      "next/navigation": path.resolve(__dirname, "./mocks/next-navigation.ts"),
      "@": path.resolve(__dirname, "../src"),
    };
    return cfg;
  },
};

export default config;
