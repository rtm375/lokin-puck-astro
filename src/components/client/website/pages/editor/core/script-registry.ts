export const scriptRegistry: Record<string, string[]> = {
  HeroSlider: [
    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css",
    "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
    "/js/blocks/slider-init.js", // Your local init script
  ],
  ContactForm: ["/js/blocks/form-handler.js"],
  // Standard components (Text, Image, Flex) usually don't need scripts
};
