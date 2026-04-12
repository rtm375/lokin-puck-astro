import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "@/components/client/website/pages/puck/blocks/types";

export const HeroSlider: ComponentConfig<Props["HeroSlider"]> & { icon?: string } = {
  label: "Hero Slider",
  icon: "lucide:layers",
  fields: {
    slides: {
      type: "array",
      arrayFields: {
        imageUrl: { type: "text" },
        caption: { type: "text" },
      },
    },
  },
  defaultProps: {
    slides: [
      {
        imageUrl: "https://placehold.co/600x400",
        caption: "Slide 1",
      },
    ],
  },
  render: ({ slides }) => (
    // .js-hero-slider is the hook for our vanilla JS file
    <div className="swiper js-hero-slider w-full h-[400px]">
      <div className="swiper-wrapper">
        {slides.map((slide, i) => (
          <div key={i} className="swiper-slide relative">
            <img
              src={slide.imageUrl}
              alt={slide.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white bg-black/50 px-2 py-1 rounded">
              {slide.caption}
            </div>
          </div>
        ))}
      </div>
      <div className="swiper-pagination"></div>
    </div>
  ),
};
