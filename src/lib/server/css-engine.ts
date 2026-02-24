import { createGenerator, presetWind4 } from "unocss";
import tailwindReset from "@unocss/reset/tailwind-v4.css?inline";

// Initialize the generator once
const generator = createGenerator({
  presets: [presetWind4()],
  preflights: [
    {
      getCSS: () => tailwindReset,
    },
  ],
});

export async function generateCss(html: string) {
  // Ensure we await the generator if it happens to be a promise in this environment
  const gen = await generator;
  const { css } = await gen.generate(html);
  return css;
}
