import { defineConfig, presetWind4 } from "unocss";

export default defineConfig({
  content: {
    pipeline: {
      include: [/\.([jt]sx?|astro|html|vue)($|\?)/],
      exclude: ["**/src/pages/sites/**"],
    },
    filesystem: ["src/components/client/**/*.{tsx,ts}"],
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
