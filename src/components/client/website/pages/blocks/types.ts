import type { Slot, Data } from "@puckeditor/core";
import type { BreakpointKey } from "../config/viewports";

export type ResponsiveValue<T> = {
  [key in BreakpointKey]?: T;
};

// Common extension for our component configs to support icons and labels
export type BaseBlockConfig = {
  icon?: string;
  label?: string;
};

export type ResponsiveSpacing = {
  top: ResponsiveValue<string>;
  right: ResponsiveValue<string>;
  bottom: ResponsiveValue<string>;
  left: ResponsiveValue<string>;
  topCustom?: ResponsiveValue<number>;
  rightCustom?: ResponsiveValue<number>;
  bottomCustom?: ResponsiveValue<number>;
  leftCustom?: ResponsiveValue<number>;
  unit?: ResponsiveValue<string>;
  lock: boolean;
};

export type ResponsiveSize = {
  value: ResponsiveValue<number | "">;
  unit: ResponsiveValue<string>;
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
    frame: {
      contentWidth: "boxed" | "full";
      width: ResponsiveSize;
      minHeight: ResponsiveSize;
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
      margin: ResponsiveSpacing;
      padding: ResponsiveSpacing;
    };
    items: Slot;
  };
  HeroSlider: {
    slides: { imageUrl: string; caption: string }[];
  };
  GlobalComponent: {
    componentId: string;
    data?: Data;
  };
  Container: {
    classIds: string[];
    items: Slot;
  };
};

export type RootProps = {
  title?: string;
  isFrontPage?: boolean;
};