import type { ComponentConfig } from "@puckeditor/core";
import type { Props } from "@blockTypes";
import { useClassRegistryStore, type ClassProperties } from "@stores/useClassRegistryStore";
import { ClassEditor } from "../../components/ClassEditor/ClassEditor";

/**
 * Convert legacy Flex frame properties to ClassProperties format
 */
function convertLegacyFrameToClassProperties(frame: Props["Flex"]["frame"]): ClassProperties {
  const properties: ClassProperties = {};

  // Convert flex direction
  if (frame.direction) {
    properties.flexDirection = {};
    Object.entries(frame.direction).forEach(([breakpoint, value]) => {
      if (value) {
        // Map Tailwind classes to CSS values
        const directionMap: Record<string, string> = {
          "flex-row": "row",
          "flex-col": "column",
          "flex-row-reverse": "row-reverse",
          "flex-col-reverse": "column-reverse",
        };
        properties.flexDirection![breakpoint as keyof typeof properties.flexDirection] = 
          directionMap[value] || "row";
      }
    });
  }

  // Convert justify content
  if (frame.justifyContent) {
    properties.justifyContent = {};
    Object.entries(frame.justifyContent).forEach(([breakpoint, value]) => {
      if (value) {
        // Map Tailwind classes to CSS values
        const justifyMap: Record<string, string> = {
          "justify-start": "flex-start",
          "justify-center": "center",
          "justify-end": "flex-end",
          "justify-between": "space-between",
          "justify-around": "space-around",
          "justify-evenly": "space-evenly",
          "justify-stretch": "stretch",
          "justify-normal": "normal",
        };
        properties.justifyContent![breakpoint as keyof typeof properties.justifyContent] = 
          justifyMap[value] || "flex-start";
      }
    });
  }

  // Convert align items
  if (frame.alignItems) {
    properties.alignItems = {};
    Object.entries(frame.alignItems).forEach(([breakpoint, value]) => {
      if (value) {
        // Map Tailwind classes to CSS values
        const alignMap: Record<string, string> = {
          "items-start": "flex-start",
          "items-center": "center",
          "items-end": "flex-end",
          "items-baseline": "baseline",
          "items-stretch": "stretch",
        };
        properties.alignItems![breakpoint as keyof typeof properties.alignItems] = 
          alignMap[value] || "stretch";
      }
    });
  }

  // Convert flex wrap
  if (frame.wrap) {
    properties.flexWrap = {};
    Object.entries(frame.wrap).forEach(([breakpoint, value]) => {
      if (value) {
        // Map Tailwind classes to CSS values
        const wrapMap: Record<string, string> = {
          "flex-wrap": "wrap",
          "flex-nowrap": "nowrap",
          "flex-wrap-reverse": "wrap-reverse",
        };
        properties.flexWrap![breakpoint as keyof typeof properties.flexWrap] = 
          wrapMap[value] || "nowrap";
      }
    });
  }

  // Convert gaps
  if (frame.gaps) {
    if (frame.gaps.row) {
      properties.rowGap = {};
      Object.entries(frame.gaps.row).forEach(([breakpoint, value]) => {
        if (value) {
          if (value === "custom") {
            const customValue = frame.gaps.rowCustom?.[breakpoint as keyof typeof frame.gaps.rowCustom];
            const unit = frame.gaps.unit?.[breakpoint as keyof typeof frame.gaps.unit] || "px";
            properties.rowGap![breakpoint as keyof typeof properties.rowGap] = 
              `${customValue ?? 0}${unit}`;
          } else {
            // Convert gap-X to rem (gap-4 = 1rem, gap-8 = 2rem, etc.)
            const match = value.match(/gap-(\d+)/);
            if (match) {
              const remValue = parseInt(match[1]) * 0.25;
              properties.rowGap![breakpoint as keyof typeof properties.rowGap] = `${remValue}rem`;
            }
          }
        }
      });
    }

    if (frame.gaps.column) {
      properties.columnGap = {};
      Object.entries(frame.gaps.column).forEach(([breakpoint, value]) => {
        if (value) {
          if (value === "custom") {
            const customValue = frame.gaps.columnCustom?.[breakpoint as keyof typeof frame.gaps.columnCustom];
            const unit = frame.gaps.unit?.[breakpoint as keyof typeof frame.gaps.unit] || "px";
            properties.columnGap![breakpoint as keyof typeof properties.columnGap] = 
              `${customValue ?? 0}${unit}`;
          } else {
            // Convert gap-X to rem
            const match = value.match(/gap-(\d+)/);
            if (match) {
              const remValue = parseInt(match[1]) * 0.25;
              properties.columnGap![breakpoint as keyof typeof properties.columnGap] = `${remValue}rem`;
            }
          }
        }
      });
    }
  }

  // Convert width
  if (frame.width && frame.contentWidth !== "full") {
    properties.maxWidth = {};
    Object.entries(frame.width.value).forEach(([breakpoint, value]) => {
      if (value !== undefined && value !== "") {
        const unit = frame.width.unit[breakpoint as keyof typeof frame.width.unit] || "px";
        properties.maxWidth![breakpoint as keyof typeof properties.maxWidth] = `${value}${unit}`;
      }
    });
  } else if (frame.contentWidth === "full") {
    properties.maxWidth = { desktop: "100%" };
  }

  // Convert minHeight
  if (frame.minHeight) {
    properties.minHeight = {};
    Object.entries(frame.minHeight.value).forEach(([breakpoint, value]) => {
      if (value !== undefined && value !== "") {
        const unit = frame.minHeight!.unit[breakpoint as keyof typeof frame.minHeight.unit] || "px";
        properties.minHeight![breakpoint as keyof typeof properties.minHeight] = `${value}${unit}`;
      }
    });
  }

  // Convert margin
  if (frame.margin) {
    properties.margin = {
      top: {},
      right: {},
      bottom: {},
      left: {},
      lock: frame.margin.lock ?? true,
    };

    const convertSpacingEdge = (edge: "top" | "right" | "bottom" | "left") => {
      const edgeValue = frame.margin[edge];
      if (edgeValue) {
        Object.entries(edgeValue).forEach(([bp, value]) => {
          if (value) {
            const breakpoint = bp as "desktop" | "laptop" | "tablet" | "mobile";
            if (value === "custom") {
              const customKey = `${edge}Custom` as const;
              const customValue = frame.margin[customKey]?.[breakpoint];
              const unit = frame.margin.unit?.[breakpoint] || "px";
              properties.margin![edge][breakpoint] = `${customValue ?? 0}${unit}`;
            } else {
              // Convert space-X to rem
              const match = value.match(/space-(\d+)/);
              if (match) {
                const remValue = parseInt(match[1]) * 0.25;
                properties.margin![edge][breakpoint] = `${remValue}rem`;
              } else {
                properties.margin![edge][breakpoint] = "0px";
              }
            }
          }
        });
      }
    };

    convertSpacingEdge("top");
    convertSpacingEdge("right");
    convertSpacingEdge("bottom");
    convertSpacingEdge("left");
  }

  // Convert padding
  if (frame.padding) {
    properties.padding = {
      top: {},
      right: {},
      bottom: {},
      left: {},
      lock: frame.padding.lock ?? true,
    };

    const convertSpacingEdge = (edge: "top" | "right" | "bottom" | "left") => {
      const edgeValue = frame.padding[edge];
      if (edgeValue) {
        Object.entries(edgeValue).forEach(([bp, value]) => {
          if (value) {
            const breakpoint = bp as "desktop" | "laptop" | "tablet" | "mobile";
            if (value === "custom") {
              const customKey = `${edge}Custom` as const;
              const customValue = frame.padding[customKey]?.[breakpoint];
              const unit = frame.padding.unit?.[breakpoint] || "px";
              properties.padding![edge][breakpoint] = `${customValue ?? 0}${unit}`;
            } else {
              // Convert pt-X, pr-X, pb-X, pl-X to rem
              const match = value.match(/p[trbl]-(\d+)/);
              if (match) {
                const remValue = parseInt(match[1]) * 0.25;
                properties.padding![edge][breakpoint] = `${remValue}rem`;
              } else {
                properties.padding![edge][breakpoint] = "0px";
              }
            }
          }
        });
      }
    };

    convertSpacingEdge("top");
    convertSpacingEdge("right");
    convertSpacingEdge("bottom");
    convertSpacingEdge("left");
  }

  return properties;
}

export const createContainerConfig = (
  t: (key: string) => string,
): ComponentConfig<Props["Container"]> & { icon?: string } => ({
  icon: "lucide:box",
  label: t("editor.blocks.container.title"),
  fields: {
    classIds: {
      type: "custom",
      label: "Classes",
      render: ({ value, onChange, id }) => {
        // Integrate ClassEditor component
        // Get the Flex system class ID
        const flexClass = useClassRegistryStore.getState().getClassByName("Flex");
        const defaultClassIds = flexClass ? [flexClass.id] : [];
        
        return (
          <ClassEditor
            componentId={id || "container"}
            classIds={value && value.length > 0 ? value : defaultClassIds}
            onChange={onChange}
          />
        );
      },
    },
    items: {
      label: t("editor.blocks.items.title"),
      type: "slot",
    },
  },
  defaultProps: {
    classIds: [],
    items: [],
  },
  resolveData: async ({ props }) => {
    // Get the class registry store
    const store = useClassRegistryStore.getState();
    
    // Clean up invalid class IDs
    if (props.classIds && props.classIds.length > 0) {
      const validClassIds = props.classIds.filter((classId) => {
        const classExists = store.getClass(classId);
        if (!classExists) {
          console.warn(`[Container] Removing invalid class ID: ${classId}`);
        }
        return classExists !== undefined;
      });
      
      // If we removed invalid IDs, update props
      if (validClassIds.length !== props.classIds.length) {
        props = {
          ...props,
          classIds: validClassIds.length > 0 ? validClassIds : [],
        };
      }
    }
    
    // Check if this is legacy Flex data (has frame property but no classIds)
    const legacyProps = props as any;
    
    if (legacyProps.frame && !props.classIds) {
      console.log("Migrating legacy Flex component to Container with class system");
      
      // Convert legacy frame properties to class definition
      const legacyClassProperties = convertLegacyFrameToClassProperties(legacyProps.frame);
      
      const websiteId = store.currentWebsiteId;
      
      if (!websiteId) {
        console.warn("No website ID available for migration, using default classes");
        const flexClass = store.getClassByName("Flex");
        return {
          props: {
            classIds: flexClass ? [flexClass.id] : [],
            items: props.items,
          },
        };
      }
      
      try {
        // Create a "Legacy" custom class with converted properties
        const legacyClass = await store.createClass(websiteId, {
          name: `Legacy_${Date.now()}`,
          description: "Migrated from legacy Flex component",
          type: "custom",
          is_system: false,
          properties: legacyClassProperties,
        });
        
        // Set up class stack with [Flex, legacy-class]
        const flexClass = store.getClassByName("Flex");
        return {
          props: {
            classIds: flexClass ? [flexClass.id, legacyClass.id] : [legacyClass.id],
            items: props.items,
          },
        };
      } catch (error) {
        console.error("Failed to create legacy class during migration:", error);
        // Fallback to default if migration fails
        const flexClass = store.getClassByName("Flex");
        return {
          props: {
            classIds: flexClass ? [flexClass.id] : [],
            items: props.items,
          },
        };
      }
    }
    
    // No migration needed, return props as-is
    return { props };
  },
  inline: true,
  render: ({ classIds, items: Items, puck }) => {
    // Get the Flex system class as fallback
    const flexClass = useClassRegistryStore((state) => state.getClassByName("Flex"));
    const effectiveClassIds = classIds && classIds.length > 0 
      ? classIds 
      : (flexClass ? [flexClass.id] : []);
    
    // Get computed styles from ClassRegistryStore
    const computed = useClassRegistryStore((state) =>
      state.getComputedStyles(effectiveClassIds)
    );

    // Get layout mode to determine display type
    const layoutMode = useClassRegistryStore((state) =>
      state.getLayoutMode(effectiveClassIds)
    );

    // Determine display class based on layout mode
    const displayClass = layoutMode === "grid" ? "grid" : "flex";

    return (
      <Items
        ref={puck.dragRef}
        as="section"
        style={computed.cssVariables}
        className={`${displayClass} min-w-0 ${computed.classNames.join(" ")}`}
        disallow={["Hero", "Stats"]}
      />
    );
  },
});
