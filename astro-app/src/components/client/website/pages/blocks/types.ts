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
    minHeight: string;
    width: string;
    justifyContent:
      | "justify-start"
      | "justify-center"
      | "justify-end"
      | "justify-stretch";
    direction: "flex-row" | "flex-col";
    gap:
      | "gap-0"
      | "gap-2"
      | "gap-4"
      | "gap-6"
      | "gap-8"
      | "gap-10"
      | "gap-12"
      | "gap-14"
      | "gap-16"
      | "gap-18"
      | "gap-20"
      | "gap-22"
      | "gap-24"
      | "custom";
    gapCustom?: number;
    wrap: "wrap" | "nowrap";
    spacing: {
      top: "pt-2" | "pt-4" | "pt-6" | "pt-8";
      bottom: "pb-2" | "pb-4" | "pb-6" | "pb-8";
    };
    items: Slot;
  };
  HeroSlider: {
    slides: { imageUrl: string; caption: string }[];
  };
  GlobalComponent: {
    componentId: string;
    data?: any;
  };
};

export type RootProps = {
  title?: string;
  isFrontPage?: boolean;
};
