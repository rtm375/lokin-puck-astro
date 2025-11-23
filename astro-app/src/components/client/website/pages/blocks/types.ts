import type { Slot } from "@measured/puck";

export type Props = {
  Text: {
    content: string;
    htmlTag: "p" | "div" | "span";
  };
  Hero: {
    title: string;
    bgImage: string;
    padding: number;
    textColor: string;
    alignment: "left" | "center" | "right";
  };
  Flex: {
    justifyContent: "start" | "center" | "end";
    direction: "row" | "column";
    gap: number;
    wrap: "wrap" | "nowrap";
    items: Slot;
  };
  HeroSlider: {
    slides: { imageUrl: string; caption: string }[];
  };
};
