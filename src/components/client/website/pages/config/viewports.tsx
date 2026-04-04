/**
 * Shared Puck viewport configuration.
 */
import type { Viewport } from "@puckeditor/core";
import { Icon } from "@iconify/react";

/** CSS prefix mapping for each breakpoint key.
 *  mobile = base (no prefix), tablet = md:, laptop = lg:, desktop = xl: */
export const BREAKPOINT_PREFIX: Record<BreakpointKey, string> = {
  mobile: "",
  tablet: "md:",
  laptop: "lg:",
  desktop: "xl:",
};

/** * Viewports passed to <Puck viewports={...} /> 
 * Logic Fix: Ensure these numbers align strictly with viewportToKey thresholds.
 */
export const PUCK_VIEWPORTS: Viewport[] = [
  {
    width: 360,
    height: "auto",
    icon: <Icon icon="lucide:smartphone" width={15} />,
    label: "Mobile",
  },
  {
    width: 768,
    height: "auto",
    icon: <Icon icon="lucide:tablet" width={15} />,
    label: "Tablet",
  },
  {
    width: 1024,
    height: "auto",
    icon: <Icon icon="lucide:laptop" width={15} />,
    label: "Laptop",
  },
  {
    width: "100%",
    height: "auto",
    icon: <Icon icon="lucide:monitor" width={15} />,
    label: "Desktop",
  },
];

export type BreakpointKey = "mobile" | "tablet" | "laptop" | "desktop";

/**
 * Map a Puck viewport width to a breakpoint key.
 * * FIX: We use '<' instead of '<=' for the upper boundaries of 
 * Tablet/Laptop so that the specific width defined in PUCK_VIEWPORTS 
 * (e.g., 1024) falls into the correct category (Laptop).
 */
export const viewportToKey = (width: number | string): BreakpointKey => {
  if (typeof width === "string" || width > 1280) return "desktop";

  if (width <= 360) return "mobile";
  if (width <= 768) return "tablet";
  if (width <= 1024) return "laptop"; // Now 1024 correctly maps to laptop

  return "desktop";
};