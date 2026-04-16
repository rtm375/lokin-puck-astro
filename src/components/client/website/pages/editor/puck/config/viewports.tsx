import type { Viewport } from "@puckeditor/core";
import { Icon } from "@iconify/react";

export const BREAKPOINT_PREFIX: Record<BreakpointKey, string> = {
  desktop: "",
  laptop: "max-xl:",
  tablet: "max-lg:",
  mobile: "max-md:",
};

export const PUCK_VIEWPORTS: Viewport[] = [
  {
    width: 360,
    height: "auto",
    icon: <Icon icon="lucide:smartphone" width={16} />,
    label: "Mobile",
  },
  {
    width: 768,
    height: "auto",
    icon: <Icon icon="lucide:tablet" width={16} />,
    label: "Tablet",
  },
  {
    width: 1024,
    height: "auto",
    icon: <Icon icon="lucide:laptop" width={16} />,
    label: "Laptop",
  },
  {
    width: "100%",
    height: "auto",
    icon: <Icon icon="lucide:monitor" width={16} />,
    label: "Desktop",
  },
];

export type BreakpointKey = "mobile" | "tablet" | "laptop" | "desktop";

export const viewportToKey = (width: number | string): BreakpointKey => {
  if (typeof width === "string" || width >= 1280) return "desktop";
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "laptop";
  return "desktop";
};