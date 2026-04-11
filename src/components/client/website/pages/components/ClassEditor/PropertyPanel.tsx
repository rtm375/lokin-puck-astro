import { PropertyControl } from "./PropertyControl";
import {
  ResponsiveOptionButtonGroup,
  ResponsiveGapControl,
  ResponsiveSpacingControl,
  ResponsiveSliderControl,
  ViewportSelector,
} from "../../blocks/shared/ResponsiveControls";
import { useClassRegistryStore, type BreakpointKey, type ClassProperties } from "@/stores/useClassRegistryStore";
import type { PropertyValue } from "@/stores/useVariableStore";
import { viewportToKey } from "../../config/viewports";
import { createUsePuck } from "@puckeditor/core";

const usePuck = createUsePuck();

interface PropertyPanelProps {
  classIds: string[];
  activeClassIndex: number;
  onPropertyChange: (property: keyof ClassProperties, value: any) => void;
}

export function PropertyPanel({
  classIds,
  activeClassIndex,
  onPropertyChange,
}: PropertyPanelProps) {
  const viewports = usePuck((s) => s.appState.ui.viewports);
  const activeBreakpoint = viewportToKey(viewports.current.width);
  
  const getClass = useClassRegistryStore((state) => state.getClass);
  const getLayoutMode = useClassRegistryStore((state) => state.getLayoutMode);
  const getInheritedValue = useClassRegistryStore((state) => state.getInheritedValue);
  
  const activeClass = getClass(classIds[activeClassIndex]);
  const layoutMode = getLayoutMode(classIds);
  
  if (!activeClass) {
    return (
      <div className="p-4 text-sm text-neutral-500 italic">
        No class selected
      </div>
    );
  }

  const getPropertyValue = (property: keyof ClassProperties) => {
    const propValue = activeClass.properties[property];
    if (!propValue) return undefined;
    
    // Handle responsive values
    if (typeof propValue === "object" && !("type" in propValue)) {
      return (propValue as any)[activeBreakpoint];
    }
    
    return propValue;
  };

  const getInherited = (property: keyof ClassProperties) => {
    return getInheritedValue(classIds, activeClassIndex, property, activeBreakpoint);
  };

  const handlePropertyUpdate = (property: keyof ClassProperties, value: PropertyValue) => {
    const currentProp = activeClass.properties[property];
    
    // Handle responsive properties
    if (currentProp && typeof currentProp === "object" && !("type" in currentProp)) {
      onPropertyChange(property, {
        ...currentProp,
        [activeBreakpoint]: value,
      });
    } else {
      // Direct property
      onPropertyChange(property, { [activeBreakpoint]: value });
    }
  };

  const handlePropertyReset = (property: keyof ClassProperties) => {
    const currentProp = activeClass.properties[property];
    
    if (currentProp && typeof currentProp === "object" && !("type" in currentProp)) {
      const updated = { ...currentProp };
      delete (updated as any)[activeBreakpoint];
      onPropertyChange(property, updated);
    } else {
      onPropertyChange(property, undefined);
    }
  };

  // Flex property options
  const flexDirectionOptions = [
    { label: "Row", value: "row", icon: "lucide:arrow-right" },
    { label: "Column", value: "column", icon: "lucide:arrow-down" },
    { label: "Row Reverse", value: "row-reverse", icon: "lucide:arrow-left" },
    { label: "Column Reverse", value: "column-reverse", icon: "lucide:arrow-up" },
  ];

  const justifyContentOptions = [
    { label: "Start", value: "flex-start", icon: "lucide:align-start-horizontal" },
    { label: "Center", value: "center", icon: "lucide:align-center-horizontal" },
    { label: "End", value: "flex-end", icon: "lucide:align-end-horizontal" },
    { label: "Between", value: "space-between", icon: "lucide:space-between-horizontally" },
    { label: "Around", value: "space-around", icon: "lucide:space-around" },
    { label: "Evenly", value: "space-evenly", icon: "lucide:space-evenly" },
  ];

  const alignItemsOptions = [
    { label: "Start", value: "flex-start", icon: "lucide:align-start-vertical" },
    { label: "Center", value: "center", icon: "lucide:align-center-vertical" },
    { label: "End", value: "flex-end", icon: "lucide:align-end-vertical" },
    { label: "Stretch", value: "stretch", icon: "lucide:stretch-vertical" },
    { label: "Baseline", value: "baseline", icon: "lucide:baseline" },
  ];

  const flexWrapOptions = [
    { label: "No Wrap", value: "nowrap" },
    { label: "Wrap", value: "wrap" },
    { label: "Wrap Reverse", value: "wrap-reverse" },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-neutral-50 border-t border-neutral-200 overflow-y-auto">
      {/* Flex-specific properties */}
      {layoutMode === "flex" && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Flex Layout
          </h3>
          
          <ResponsiveOptionButtonGroup
            label="Direction"
            value={activeClass.properties.flexDirection || {}}
            onChange={(val) => onPropertyChange("flexDirection", val)}
            options={flexDirectionOptions}
            defaultValue="row"
          />
          
          <ResponsiveOptionButtonGroup
            label="Justify"
            value={activeClass.properties.justifyContent || {}}
            onChange={(val) => onPropertyChange("justifyContent", val)}
            options={justifyContentOptions}
            defaultValue="flex-start"
            controlType="justify"
            directionData={activeClass.properties.flexDirection}
          />
          
          <ResponsiveOptionButtonGroup
            label="Align"
            value={activeClass.properties.alignItems || {}}
            onChange={(val) => onPropertyChange("alignItems", val)}
            options={alignItemsOptions}
            defaultValue="stretch"
            controlType="align"
            directionData={activeClass.properties.flexDirection}
          />
          
          <ResponsiveOptionButtonGroup
            label="Wrap"
            value={activeClass.properties.flexWrap || {}}
            onChange={(val) => onPropertyChange("flexWrap", val)}
            options={flexWrapOptions}
            defaultValue="nowrap"
          />
          
          <ResponsiveGapControl
            label="Gap"
            value={activeClass.properties.gap || {}}
            onChange={(val) => onPropertyChange("gap", val)}
          />
        </div>
      )}

      {/* Grid-specific properties */}
      {layoutMode === "grid" && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Grid Layout
          </h3>
          
          <PropertyControl
            property="gridTemplateColumns"
            label="Template Columns"
            value={getPropertyValue("gridTemplateColumns")}
            inheritedValue={getInherited("gridTemplateColumns")}
            onChange={(val) => handlePropertyUpdate("gridTemplateColumns", val)}
            onReset={() => handlePropertyReset("gridTemplateColumns")}
            controlType="text"
          />
          
          <PropertyControl
            property="gridTemplateRows"
            label="Template Rows"
            value={getPropertyValue("gridTemplateRows")}
            inheritedValue={getInherited("gridTemplateRows")}
            onChange={(val) => handlePropertyUpdate("gridTemplateRows", val)}
            onReset={() => handlePropertyReset("gridTemplateRows")}
            controlType="text"
          />
          
          <ResponsiveGapControl
            label="Grid Gap"
            value={activeClass.properties.gridGap || {}}
            onChange={(val) => onPropertyChange("gridGap", val)}
          />
          
          <ResponsiveOptionButtonGroup
            label="Justify Items"
            value={activeClass.properties.justifyItems || {}}
            onChange={(val) => onPropertyChange("justifyItems", val)}
            options={alignItemsOptions}
            defaultValue="stretch"
          />
          
          <ResponsiveOptionButtonGroup
            label="Align Items"
            value={activeClass.properties.alignItems || {}}
            onChange={(val) => onPropertyChange("alignItems", val)}
            options={alignItemsOptions}
            defaultValue="stretch"
          />
        </div>
      )}

      {/* Common properties */}
      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4">
        <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
          Spacing & Sizing
        </h3>
        
        <ResponsiveSpacingControl
          label="Margin"
          value={activeClass.properties.margin || {}}
          onChange={(val) => onPropertyChange("margin", val)}
        />
        
        <ResponsiveSpacingControl
          label="Padding"
          value={activeClass.properties.padding || {}}
          onChange={(val) => onPropertyChange("padding", val)}
        />
        
        <ResponsiveSliderControl
          label="Width"
          value={activeClass.properties.width || {}}
          onChange={(val) => onPropertyChange("width", val)}
          units={["px", "%", "vw", "auto"]}
          max={2000}
        />
        
        <ResponsiveSliderControl
          label="Height"
          value={activeClass.properties.height || {}}
          onChange={(val) => onPropertyChange("height", val)}
          units={["px", "%", "vh", "auto"]}
          max={2000}
        />
      </div>

      {/* Background & Borders */}
      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4">
        <h3 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
          Appearance
        </h3>
        
        <PropertyControl
          property="backgroundColor"
          label="Background Color"
          value={getPropertyValue("backgroundColor")}
          inheritedValue={getInherited("backgroundColor")}
          onChange={(val) => handlePropertyUpdate("backgroundColor", val)}
          onReset={() => handlePropertyReset("backgroundColor")}
          variableCategory="color"
          controlType="variable"
        />
        
        <ResponsiveSliderControl
          label="Border Radius"
          value={activeClass.properties.borderRadius || {}}
          onChange={(val) => onPropertyChange("borderRadius", val)}
          units={["px", "%", "rem"]}
          max={100}
        />
        
        <PropertyControl
          property="borderColor"
          label="Border Color"
          value={getPropertyValue("borderColor")}
          inheritedValue={getInherited("borderColor")}
          onChange={(val) => handlePropertyUpdate("borderColor", val)}
          onReset={() => handlePropertyReset("borderColor")}
          variableCategory="color"
          controlType="variable"
        />
        
        <ResponsiveSliderControl
          label="Border Width"
          value={activeClass.properties.borderWidth || {}}
          onChange={(val) => onPropertyChange("borderWidth", val)}
          units={["px"]}
          max={20}
        />
      </div>
    </div>
  );
}
