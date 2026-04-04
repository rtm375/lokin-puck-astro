import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.(astro|html|[tj]sx|ts|vue)$/],
      exclude: ["**/src/pages/sites/**"],
    },
  },
  presets: [presetWind4()],
  theme: {
    colors: {
      primary: "#f3602a",
    },
    font: {
      lineHeight: "1",
    },
  },
});
