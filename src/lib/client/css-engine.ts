import { type Class } from "@/types";

export type BreakpointKey = "desktop" | "laptop" | "tablet" | "mobile";

export const BREAKPOINT_WIDTHS: Record<BreakpointKey, number> = {
  desktop: 1280,
  laptop: 1024,
  tablet: 768,
  mobile: 640,
};

export const getInheritanceChain = (classId: string, allClasses: Class[]): Class[] => {
  const current = allClasses.find(c => c.id === classId);
  if (!current) return [];
  if (current.parent_id) {
    return [...getInheritanceChain(current.parent_id, allClasses), current];
  }
  return [current];
};

const deepMerge = (target: any, source: any) => {
  if (!isObject(source)) return target;
  const output = { ...target };

  Object.keys(source).forEach(key => {
    const val = source[key];
    if (isObject(val)) {
      // Recurse for states and breakpoints
      if (['normal', 'hover', 'focus', 'active', 'desktop', 'laptop', 'tablet', 'mobile'].includes(key)) {
        output[key] = deepMerge(target[key] || {}, val);
      }
    } else if (val !== undefined && val !== null && val !== "") {
      output[key] = val;
    }
  });
  return output;
};

export const mergeStyles = (chains: Class[][], blockOverrides: any, baseStyles: any = {}) => {
  // 1. Foundation: Base Defaults (display: flex, etc)
  let merged = JSON.parse(JSON.stringify(baseStyles));

  // 2. Foundation: Local Block Styles (The 'Base' chip)
  if (isObject(blockOverrides)) {
    merged = deepMerge(merged, blockOverrides);
  }

  // 3. Layers: Shared Classes (Left to Right priority)
  if (Array.isArray(chains)) {
    chains.forEach(chain => {
      if (Array.isArray(chain)) {
        chain.forEach(cls => {
          if (cls?.styles) {
            merged = deepMerge(merged, cls.styles);
          }
        });
      }
    });
  }

  return merged;
};

const isObject = (item: any) => {
  return (item && typeof item === 'object' && !Array.isArray(item));
};

export const generateCSS = (selector: string, styles: any) => {
  let css = "";

  // Base styles (Normal state, Desktop breakpoint)
  const baseStyles = styles.normal?.desktop || {};
  css += `${selector} { ${objectToCssProps(baseStyles)} }\n`;

  // Pseudo states for Desktop
  const pseudoStates = ["hover", "focus", "active"];
  pseudoStates.forEach(state => {
    const stateStyles = styles[state]?.desktop;
    if (stateStyles && Object.keys(stateStyles).length > 0) {
      css += `${selector}:${state} { ${objectToCssProps(stateStyles)} }\n`;
    }
  });

  // Responsive breakpoints
  const breakpoints: BreakpointKey[] = ["laptop", "tablet", "mobile"];
  const mediaQueries: Record<BreakpointKey, string> = {
    laptop: "@media (max-width: 1279px)",
    tablet: "@media (max-width: 1023px)",
    mobile: "@media (max-width: 767px)",
    desktop: "" // Not used here
  };

  breakpoints.forEach(bp => {
    let bpCss = "";
    
    // Normal state for this breakpoint
    const normalBp = styles.normal?.[bp];
    if (normalBp && Object.keys(normalBp).length > 0) {
      bpCss += `${selector} { ${objectToCssProps(normalBp)} }\n`;
    }

    // Pseudo states for this breakpoint
    pseudoStates.forEach(state => {
      const stateBp = styles[state]?.[bp];
      if (stateBp && Object.keys(stateBp).length > 0) {
        bpCss += `${selector}:${state} { ${objectToCssProps(stateBp)} }\n`;
      }
    });

    if (bpCss) {
      css += `${mediaQueries[bp]} {\n${bpCss}}\n`;
    }
  });

  return css;
};

const objectToCssProps = (obj: any) => {
  return Object.entries(obj)
    .filter(([_, val]) => typeof val === 'string' || typeof val === 'number')
    .map(([prop, val]) => `${camelToKebab(prop)}: ${val};`)
    .join(" ");
};

const camelToKebab = (str: string) => {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
};
