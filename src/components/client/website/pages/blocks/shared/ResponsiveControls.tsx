import { createUsePuck } from "@puckeditor/core";
import { Icon } from "@iconify/react";
import {
  viewportToKey,
  PUCK_VIEWPORTS,
  BREAKPOINT_PREFIX,
  type BreakpointKey,
} from "../../config/viewports";
import type { ResponsiveValue } from "@blockTypes";

import { useState } from "react";

const usePuck = createUsePuck();

export const OptionButtonGroup = ({
  value,
  onChange,
  options,
  allowUnset = true,
}: any) => (
  <div className="flex flex-col w-full">
    <div className="flex rounded-md border bg-white border-neutral-300 overflow-hidden w-full *:not-last-of-type:border-r *:not-last-of-type:border-neutral-300">
      {options.map((opt: any) => (
        <button
          key={opt.value}
          onClick={(e) => {
            e.preventDefault();
            const newValue = value === opt.value && allowUnset ? "" : opt.value;
            onChange(newValue);
          }}
          title={`${opt.label}`}
          className={`h-8 cursor-pointer flex flex-1 items-center justify-center transition-colors ${value === opt.value
            ? "bg-primary/10 text-primary"
            : "text-gray-600 bg-neutral-100 hover:text-primary hover:bg-primary/10"
            }`}
        >
          {opt.icon ? (
            <div className={`flex items-center justify-center transition-transform duration-200 ${opt.rotateClass || ""}`}>
              <Icon icon={opt.icon} width={15} />
            </div>
          ) : (
            <span className="text-[11px] font-medium leading-none whitespace-nowrap">{opt.label}</span>
          )}
        </button>
      ))}
    </div>
  </div>
);

export const ResponsiveOptionButtonGroup = ({
  label,
  value,
  onChange,
  options,
  defaultValue = "",
  controlType,
  directionData,
}: {
  label: string;
  value: ResponsiveValue<any>;
  onChange: (val: ResponsiveValue<any>) => void;
  options: any[];
  defaultValue?: string;
  controlType?: "justify" | "align";
  directionData?: ResponsiveValue<string>;
}) => {
  const viewports = usePuck((s) => s.appState.ui.viewports);
  const dispatch = usePuck((s) => s.dispatch);

  const [open, setOpen] = useState(false);

  const activeKey = viewportToKey(viewports.current.width);
  const activeValue = value?.[activeKey] ?? defaultValue;

  const currentDirection = directionData?.[activeKey] || "flex-row";

  let mappedOptions = options;
  if (controlType) {
    mappedOptions = options.map((opt) => {
      let rotateClass = "";
      if (currentDirection === "flex-row") {
        rotateClass = "";
      } else if (currentDirection === "flex-col") {
        rotateClass = controlType === "justify" ? "rotate-90" : "-rotate-90";
      } else if (currentDirection === "flex-row-reverse") {
        if (
          controlType === "justify" &&
          (opt.value.includes("start") || opt.value.includes("end"))
        ) {
          rotateClass = "rotate-180";
        }
      } else if (currentDirection === "flex-col-reverse") {
        rotateClass = "-rotate-90";
      }
      return { ...opt, rotateClass };
    });
  }

  const activeViewport = PUCK_VIEWPORTS.find(
    (bp) => bp.width === viewports.current.width
  );

  const handleViewportChange = (bp: any) => {
    dispatch({
      type: "setUi",
      ui: {
        viewports: {
          ...viewports,
          current: {
            width: bp.width,
            height: "auto",
          },
        },
      },
    });
    setOpen(false);
  };

  return (
    <div className="flex flex-col w-full relative ">
      <div className="flex items-center gap-3 justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-neutral-700">
            {label}
          </span>

          {/* Icon trigger */}
          <div className="relative flex">
            <button
              onClick={() => setOpen((s) => !s)}
              className="flex p-1 rounded hover:bg-neutral-200"
            >
              {activeViewport && (
                activeViewport.icon
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-0 flex flex-col gap-3 bg-white shadow-lg z-50">
                {PUCK_VIEWPORTS.map((bp) => (
                  <button
                    key={bp.label}
                    title={bp.label}
                    onClick={() => handleViewportChange(bp)}
                    className={`flex items-center gap-2 w-full p-1 text-xs hover:bg-neutral-100 ${bp.width === viewports.current.width
                      ? "text-primary"
                      : ""
                      }`}
                  >
                    {bp.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {(label === "Direction" || label === "Wrap") && (
          <div className="flex-1">
            <OptionButtonGroup
              title={label}
              value={activeValue}
              onChange={(newVal: string) => {
                onChange({ ...value, [activeKey]: newVal });
              }}
              options={mappedOptions}
            />
          </div>
        )}
      </div>
      {label !== "Direction" && label !== "Wrap" && (
        <OptionButtonGroup
          value={activeValue}
          onChange={(newVal: string) => {
            onChange({ ...value, [activeKey]: newVal });
          }}
          options={mappedOptions}
        />
      )}
    </div>
  );
};

const DropdownControl = ({
  label,
  value,
  options,
  onChange,
  customValue,
  onCustomChange,
}: any) => {
  const [open, setOpen] = useState(false);

  const isCustom = value === "custom";
  const active = options.find((o: any) => o.value === value);

  return (
    <div className="flex flex-col items-start relative w-full">
      <span className="text-[10px] text-neutral-500 uppercase">
        {label}
      </span>

      {/* NORMAL DROPDOWN */}
      {!isCustom && (
        <>
          <button
            onClick={() => setOpen((s) => !s)}
            className="w-full text-left text-xs px-1.5 h-8 rounded border border-neutral-200 bg-white"
          >
            {active?.label || label}
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-full flex flex-col bg-white shadow-lg z-50">
              {options.map((opt: any) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`text-left text-xs p-1.5 hover:bg-neutral-100 ${value === opt.value
                    ? "text-primary"
                    : ""
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* CUSTOM INPUT MODE */}
      {isCustom && (
        <div className="relative w-full">
          <input
            autoFocus
            type="number"
            className="w-full text-xs px-1.5 pr-4 h-8 outline-0 rounded border border-neutral-200 focus:border-neutral-400 bg-white"
            value={customValue ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onCustomChange(val === "" ? "" : Number(val));
            }}
          />

          {/* Reset button */}
          <button
            onClick={() => onChange("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export const ResponsiveGapControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (val: any) => void;
}) => {
  const viewports = usePuck((s) => s.appState.ui.viewports);
  const dispatch = usePuck((s) => s.dispatch);

  const [open, setOpen] = useState(false);

  const activeKey = viewportToKey(viewports.current.width);
  const currentVal = value || { row: {}, column: {}, lock: true };
  const activeRow = currentVal.row?.[activeKey] ?? "";
  const activeColumn = currentVal.column?.[activeKey] ?? "";
  const isLocked = currentVal.lock ?? true;

  const activeViewport = PUCK_VIEWPORTS.find(
    (bp) => bp.width === viewports.current.width
  );

  const [unitOpen, setUnitOpen] = useState(false);

  const units = [
    { label: "PX", value: "px" },
    { label: "%", value: "%" },
    { label: "EM", value: "em" },
    { label: "REM", value: "rem" },
  ];

  const activeUnit = units.find(
    (u) => u.value === currentVal.unit?.[activeKey]
  );

  const handleUnitChange = (unit: string) => {
    onChange({
      ...currentVal,
      unit: {
        ...(currentVal.unit || {}),
        [activeKey]: unit,
      },
    });
    setUnitOpen(false);
  };

  const handleViewportChange = (bp: any) => {
    dispatch({
      type: "setUi",
      ui: {
        viewports: {
          ...viewports,
          current: {
            width: bp.width,
            height: "auto",
          },
        },
      },
    });
    setOpen(false);
  };

  const gapOptions = [
    { label: "None", value: "gap-0" },
    { label: "XS", value: "gap-2" },
    { label: "S", value: "gap-6" },
    { label: "M", value: "gap-10" },
    { label: "L", value: "gap-14" },
    { label: "XL", value: "gap-24" },
    { label: "XXL", value: "gap-32" },
    { label: "Custom", value: "custom" },
  ];

  const handleRowChange = (newVal: string) => {
    let newCol = currentVal.column || {};
    if (isLocked) {
      newCol = { ...newCol, [activeKey]: newVal };
    }
    onChange({
      ...currentVal,
      row: { ...(currentVal.row || {}), [activeKey]: newVal },
      column: newCol
    });
  };

  const handleColumnChange = (newVal: string) => {
    let newRow = currentVal.row || {};
    if (isLocked) {
      newRow = { ...newRow, [activeKey]: newVal };
    }
    onChange({
      ...currentVal,
      column: { ...(currentVal.column || {}), [activeKey]: newVal },
      row: newRow
    });
  };

  const toggleLock = () => {
    onChange({
      ...currentVal,
      lock: !isLocked,
    });
  };

  return (
    <div className="flex flex-col w-full relative gap-1">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-neutral-700">
            {label}
          </span>
          <div className="relative flex">
            <button
              onClick={() => setOpen((s) => !s)}
              className="flex p-1 rounded hover:bg-neutral-200"
            >
              {activeViewport && activeViewport.icon}
            </button>
            {open && (
              <div className="absolute right-0 top-0 flex flex-col gap-2 bg-white shadow-lg z-50">
                {PUCK_VIEWPORTS.map((bp) => (
                  <button
                    key={bp.label}
                    title={bp.label}
                    onClick={() => handleViewportChange(bp)}
                    className={`flex items-center gap-2 w-full p-1 text-xs text-neutral-700 bg-neutral-200 hover:bg-neutral-300 ${bp.width === viewports.current.width
                      ? "text-primary bg-primary/10"
                      : ""
                      }`}
                  >
                    {bp.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="relative flex">
          <button
            onClick={() => setUnitOpen((s) => !s)}
            className="flex py-1 px-2 text-[11px] rounded hover:bg-neutral-200"
          >
            {activeUnit?.label || "PX"}
          </button>

          {unitOpen && (
            <div className="absolute right-0 left-0 top-0 flex justify-center items-center flex-col bg-white shadow-lg z-50">
              {units.map((u) => (
                <button
                  key={u.value}
                  onClick={() => handleUnitChange(u.value)}
                  className={`flex items-center justify-center gap-2 w-full p-1 text-[11px] text-neutral-700 bg-neutral-100 hover:bg-neutral-200 ${activeUnit?.value === u.value
                    ? "text-primary bg-primary/10"
                    : ""
                    }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-1">
        {/* Row */}
        <div className="flex-1">
          <DropdownControl
            label="Row"
            value={activeRow}
            customValue={currentVal.rowCustom?.[activeKey]}
            options={gapOptions}
            onChange={handleRowChange}
            onCustomChange={(val: any) => {
              let newColCustom = currentVal.columnCustom || {};
              if (isLocked) {
                newColCustom = { ...newColCustom, [activeKey]: val };
              }
              onChange({
                ...currentVal,
                row: { ...(currentVal.row || {}), [activeKey]: "custom" },
                column: isLocked ? { ...(currentVal.column || {}), [activeKey]: "custom" } : currentVal.column,
                rowCustom: {
                  ...(currentVal.rowCustom || {}),
                  [activeKey]: val,
                },
                columnCustom: newColCustom,
              });
            }}
          />
        </div>
        {/* Column */}
        <div className="flex-1">
          <DropdownControl
            label="Column"
            value={activeColumn}
            customValue={currentVal.columnCustom?.[activeKey]}
            options={gapOptions}
            onChange={handleColumnChange}
            onCustomChange={(val: any) => {
              let newRowCustom = currentVal.rowCustom || {};
              if (isLocked) {
                newRowCustom = { ...newRowCustom, [activeKey]: val };
              }
              onChange({
                ...currentVal,
                column: { ...(currentVal.column || {}), [activeKey]: "custom" },
                row: isLocked ? { ...(currentVal.row || {}), [activeKey]: "custom" } : currentVal.row,
                columnCustom: {
                  ...(currentVal.columnCustom || {}),
                  [activeKey]: val,
                },
                rowCustom: newRowCustom,
              });
            }}
          />
        </div>
        <div className="flex-1 flex items-end max-w-8">
          <button
            onClick={(e) => { e.preventDefault(); toggleLock(); }}
            title="Lock row and column gap"
            className={`h-8 w-full flex items-center justify-center rounded transition-colors cursor-pointer ${isLocked ? 'text-primary bg-primary/10' : 'text-neutral-700 bg-neutral-200 hover:bg-neutral-300'}`}
          >
            <Icon icon={isLocked ? "lucide:link" : "lucide:unlink"} width={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const getResponsiveClasses = (
  prop: ResponsiveValue<string> | undefined,
  classPrefix: string = "",
) => {
  if (!prop || typeof prop !== "object") return "";
  return Object.entries(prop)
    .map(([bp, val]) => {
      if (!val) return "";
      const prefix = BREAKPOINT_PREFIX[bp as BreakpointKey];
      return `${prefix}${classPrefix}${val}`;
    })
    .filter(Boolean)
    .join(" ");
};

/**
 * Utility to map standard Tailwind/UnoCSS layout values into raw CSS values.
 */
export const tailwindToCSS = (type: "direction" | "justify" | "align" | "wrap", value: string): string => {
  if (!value) return "";
  
  if (type === "direction") {
    if (value === "flex-row") return "row";
    if (value === "flex-col") return "column";
    if (value === "flex-row-reverse") return "row-reverse";
    if (value === "flex-col-reverse") return "column-reverse";
  }
  
  if (type === "justify") {
    const val = value.replace("justify-", "");
    if (val === "start" || val === "end") return `flex-${val}`;
    if (val === "between" || val === "around" || val === "evenly") return `space-${val}`;
    return val;
  }
  
  if (type === "align") {
    const val = value.replace("items-", "");
    if (val === "start" || val === "end") return `flex-${val}`;
    return val;
  }
  
  if (type === "wrap") {
    return value.replace("flex-", "");
  }
  
  return value;
};

export type ResponsiveCSSConfig = {
  /** The actual CSS property, e.g. "flex-direction", "row-gap" */
  property: string;
  /** Unique prefix for the internal CSS variables, e.g. "f-dir" */
  prefix: string;
  /** The primitive mapping from Puck editor data */
  responsiveValue?: ResponsiveValue<any>;
  /** Optional custom resolver for complex values (like gap arrays) */
  resolver?: (bp: BreakpointKey) => string | undefined | null;
  /** Optional formatter to translate the editor value to a standard CSS property value */
  formatter?: (val: any) => string;
};

/**
 * Generates an inline style object of CSS Variables, and the corresponding UnoCSS arbitrary classes 
 * required to apply them responsively without FOUC (flash of unstyled content) in the editor.
 */
export const getResponsiveCSS = (configs: ResponsiveCSSConfig[]) => {
  const style: React.CSSProperties = {} as any;
  const classes: string[] = [];

  const bps: BreakpointKey[] = ["mobile", "tablet", "laptop", "desktop"];
  const bpCodes: Record<BreakpointKey, string> = {
    mobile: "base", // base avoids empty naming conflicts in CSS
    tablet: "md",
    laptop: "lg",
    desktop: "xl",
  };

  configs.forEach(({ property, prefix, responsiveValue, resolver, formatter }) => {
    bps.forEach((bp) => {
      let val;
      if (resolver) {
        val = resolver(bp);
      } else if (responsiveValue) {
        val = responsiveValue[bp];
      }

      if (val !== undefined && val !== null && val !== "") {
        const finalValue = formatter ? formatter(val) : val;
        const varName = `--${prefix}-${bpCodes[bp]}`;
        
        (style as any)[varName] = finalValue;
        
        // Output Unocss arbitrary property string: [flex-direction:var(--f-dir-base)] 
        const mqPrefix = BREAKPOINT_PREFIX[bp];
        classes.push(`${mqPrefix}[${property}:var(${varName})]`);
      }
    });
  });

  return { style, className: classes.join(" ") };
};
