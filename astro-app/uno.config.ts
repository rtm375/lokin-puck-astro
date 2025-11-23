import { defineConfig, presetWind4 } from "unocss";
import fs from "node:fs";
import type { LineHeight } from "@tiptap/extension-text-style";

const reset = fs.readFileSync(
  "node_modules/@unocss/reset/tailwind-compat.css",
  "utf8",
);

export default defineConfig({
  presets: [presetWind4()],
  theme: {
    colors: {
      primary: "#f3602a",
    },
    font: {
      LineHeight: "1",
    },
  },
});
