import { defineConfig } from "vitepress";

export default defineConfig({
  // GitHub Pages serves this repository at https://clemenzi.github.io/mayfail/.
  base: "/mayfail/",
  title: "mayfail",
  description: "Small, explicit error handling for TypeScript.",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  themeConfig: {
    nav: [
      { text: "Introduction", link: "/introduction" },
      { text: "Usage", link: "/usage/basic-usage" },
      { text: "Frameworks", link: "/frameworks/react" },
    ],
    sidebar: [
      {
        items: [
          { text: "Introduction", link: "/introduction" },
          { text: "Install", link: "/install" },
          {
            text: "Usage",
            items: [
              { text: "Basic Usage", link: "/usage/basic-usage" },
              { text: "Async", link: "/usage/async" },
            ],
          },
        ],
      },
      {
        text: "Frameworks",
        items: [
          { text: "React", link: "/frameworks/react" },
          { text: "Vue", link: "/frameworks/vue" },
        ],
      },
    ],
  },
});
