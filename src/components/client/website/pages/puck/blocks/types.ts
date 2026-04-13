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
  Container: {
    classes: string[];
    styles: Record<string, any>; // format: { [pseudo]: { [breakpoint]: { [prop]: value } } }
    items: Slot;
  };
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
  HeroSlider: {
    slides: { imageUrl: string; caption: string }[];
  };
  GlobalComponent: {
    componentId: string;
    data?: Data;
  };
};

export type RootProps = {
  title?: string;
  isFrontPage?: boolean;
};