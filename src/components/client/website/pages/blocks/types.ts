import type { Slot } from "@puckeditor/core";
import type { BreakpointKey } from "../config/viewports";

export type ResponsiveValue<T> = {
  [key in BreakpointKey]?: T;
};

export type Props = {
  Text: {
    content: string;
  };
  Hero: {
    title: string;
    bgImage: string;
    padding: number;
    textColor: string;
    alignment: ResponsiveValue<"left" | "center" | "right">;
  };
  Flex: {
    direction: ResponsiveValue<
      "" | "flex-row" | "flex-col" | "flex-row-reverse" | "flex-col-reverse"
    >;
    justifyContent: ResponsiveValue<
      | ""
      | "justify-normal"
      | "justify-start"
      | "justify-center"
      | "justify-end"
      | "justify-between"
      | "justify-around"
      | "justify-evenly"
      | "justify-stretch"
    >;
    alignItems: ResponsiveValue<
      | ""
      | "items-start"
      | "items-center"
      | "items-end"
      | "items-baseline"
      | "items-stretch"
    >;
    gaps: {
      row: ResponsiveValue<string>;
      column: ResponsiveValue<string>;
      rowCustom?: ResponsiveValue<number>;
      columnCustom?: ResponsiveValue<number>;
      unit?: ResponsiveValue<string>;
      lock: boolean;
    };
    wrap: ResponsiveValue<"" | "flex-wrap" | "flex-nowrap" | "flex-wrap-reverse">;
    // margin: {
    //   top: ResponsiveValue<"" | "mt-2" | "mt-4" | "mt-6" | "mt-8" | "mt-10">;
    //   right: ResponsiveValue<"" | "mr-2" | "mr-4" | "mr-6" | "mr-8" | "mr-10">;
    //   bottom: ResponsiveValue<"" | "mb-2" | "mb-4" | "mb-6" | "mb-8" | "mb-10">;
    //   left: ResponsiveValue<"" | "ml-2" | "ml-4" | "ml-6" | "ml-8" | "ml-10">;
    // };
    // padding: {
    //   top: ResponsiveValue<"" | "pt-2" | "pt-4" | "pt-6" | "pt-8" | "pt-10">;
    //   right: ResponsiveValue<"" | "pr-2" | "pr-4" | "pr-6" | "pr-8" | "pr-10">;
    //   bottom: ResponsiveValue<"" | "pb-2" | "pb-4" | "pb-6" | "pb-8" | "pb-10">;
    //   left: ResponsiveValue<"" | "pt-2" | "pt-4" | "pt-6" | "pt-8" | "pt-10">;
    // };
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