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

export const ViewportSelector = () => {
  const viewports = usePuck((s) => s.appState.ui.viewports);
  const dispatch = usePuck((s) => s.dispatch);
  const [open, setOpen] = useState(false);

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
    <div className="relative flex">
      <button
        onClick={(e) => {
          e.preventDefault();
          setOpen((s) => !s);
        }}
        className="flex p-1 rounded hover:bg-neutral-200 transition-colors"
      >
        {activeViewport && activeViewport.icon}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute rounded left-1/2 -translate-x-[50%] p-1 -top-1 gap-1 flex flex-col justify-center items-center bg-white shadow-lg z-50">
            {PUCK_VIEWPORTS.map((bp) => (
              <button
                key={bp.label}
                onClick={() => handleViewportChange(bp)}
                className={`group relative p-1 flex items-center justify-center transition-colors hover:text-primary ${bp.width === viewports.current.width && "text-primary"
                  }`}
              >
                {bp.icon}
                <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-900 text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all whitespace-nowrap pointer-events-none z-[60] shadow-lg border border-white/5">
                  {bp.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-neutral-900" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CASCADING_ORDER: BreakpointKey[] = ["desktop", "laptop", "tablet", "mobile"];

export const getCascadedValue = (valObj: any, activeKey: BreakpointKey) => {
  if (!valObj) return undefined;
  const targetIndex = CASCADING_ORDER.indexOf(activeKey);
  for (let i = targetIndex; i >= 0; i--) {
    const key = CASCADING_ORDER[i];
    if (valObj[key] !== undefined && valObj[key] !== "") {
      return valObj[key];
    }
  }
  return undefined;
};

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

  const activeKey = viewportToKey(viewports.current.width);
  const activeValue = getCascadedValue(value, activeKey) ?? defaultValue;

  const currentDirection = getCascadedValue(directionData, activeKey) || "flex-row";

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

  return (
    <div className="flex flex-col w-full relative ">
      <div className="flex items-center gap-3 justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-neutral-700">
            {label}
          </span>

          <ViewportSelector />
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

export const ResponsiveSliderControl = ({
  label,
  value,
  onChange,
  units = ["px", "%", "em", "rem", "vw", "vh"],
  min = 0,
  max = 2000,
  step = 1,
  description,
}: {
  label: string;
  value: any;
  onChange: (val: any) => void;
  units?: string[];
  min?: number;
  max?: number;
  step?: number;
  description?: React.ReactNode;
}) => {
  const viewports = usePuck((s) => s.appState.ui.viewports);
  const activeKey = viewportToKey(viewports.current.width);

  const currentVal = value || { value: {}, unit: {} };
  const activeValue = getCascadedValue(currentVal.value, activeKey) ?? "";
  const cascadedUnit = getCascadedValue(currentVal.unit, activeKey);
  const activeUnit = cascadedUnit || units[0];

  const [unitOpen, setUnitOpen] = useState(false);

  const handleValueChange = (val: number | "") => {
    onChange({
      ...currentVal,
      value: { ...(currentVal.value || {}), [activeKey]: val },
    });
  };

  const handleUnitChange = (unit: string) => {
    onChange({
      ...currentVal,
      unit: { ...(currentVal.unit || {}), [activeKey]: unit },
    });
    setUnitOpen(false);
  };

  return (
    <div className="flex flex-col w-full gap-1 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-neutral-700">
            {label}
          </span>
          <ViewportSelector />
        </div>
        <div className="relative flex">
          <button
            onClick={(e) => {
              e.preventDefault();
              setUnitOpen((s) => !s);
            }}
            className="flex items-center py-1 px-2 text-[11px] rounded hover:bg-neutral-200"
          >
            {activeUnit}
            <Icon icon="lucide:chevron-down" className="ml-1" width={12} />
          </button>
          {unitOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUnitOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-white shadow-lg z-50 min-w-[50px] border border-neutral-100 rounded overflow-hidden">
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={(e) => {
                      e.preventDefault();
                      handleUnitChange(u);
                    }}
                    className={`flex items-center justify-center w-full py-1.5 px-2 text-[11px] text-neutral-700 hover:bg-neutral-100 ${activeUnit === u ? "text-primary bg-primary/5 font-medium" : ""
                      }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={activeValue === "" ? min : activeValue}
          onChange={(e) => handleValueChange(Number(e.target.value))}
          className="flex-1 w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-700"
        />
        <input
          type="number"
          value={activeValue}
          onChange={(e) =>
            handleValueChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-16 h-8 text-xs px-2 outline-none rounded border border-neutral-200 focus:border-neutral-400 bg-white"
        />
      </div>
      {description && (
        <span className="text-[10px] text-neutral-500 italic mt-[-2px]">
          {description}
        </span>
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

  const activeKey = viewportToKey(viewports.current.width);
  const currentVal = value || { row: {}, column: {}, lock: true };
  const activeRow = getCascadedValue(currentVal.row, activeKey) ?? "";
  const activeColumn = getCascadedValue(currentVal.column, activeKey) ?? "";
  const isLocked = currentVal.lock ?? true;

  const [unitOpen, setUnitOpen] = useState(false);

  const units = [
    { label: "PX", value: "px" },
    { label: "%", value: "%" },
    { label: "EM", value: "em" },
    { label: "REM", value: "rem" },
  ];

  const cascadedUnit = getCascadedValue(currentVal.unit, activeKey);
  const activeUnit = units.find(
    (u) => u.value === cascadedUnit
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
          <ViewportSelector />
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

      <div className="flex gap-1">
        <div className="flex-1">
          <DropdownControl
            label="Row"
            value={activeRow}
            customValue={getCascadedValue(currentVal.rowCustom, activeKey)}
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
        <div className="flex-1">
          <DropdownControl
            label="Column"
            value={activeColumn}
            customValue={getCascadedValue(currentVal.columnCustom, activeKey)}
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

export const ResponsiveSpacingControl = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (val: any) => void;
}) => {
  const viewports = usePuck((s) => s.appState.ui.viewports);

  const activeKey = viewportToKey(viewports.current.width);
  const currentVal = value || { top: {}, right: {}, bottom: {}, left: {}, lock: true };

  const [unitOpen, setUnitOpen] = useState(false);

  const activeTop = getCascadedValue(currentVal.top, activeKey) ?? "";
  const activeRight = getCascadedValue(currentVal.right, activeKey) ?? "";
  const activeBottom = getCascadedValue(currentVal.bottom, activeKey) ?? "";
  const activeLeft = getCascadedValue(currentVal.left, activeKey) ?? "";
  const isLocked = currentVal.lock ?? true;

  const units = [
    { label: "PX", value: "px" },
    { label: "%", value: "%" },
    { label: "EM", value: "em" },
    { label: "REM", value: "rem" },
  ];

  const cascadedUnit = getCascadedValue(currentVal.unit, activeKey);
  const activeUnit = units.find(
    (u) => u.value === cascadedUnit
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

  const spacingOptions = [
    { label: "None", value: "space-0" },
    { label: "XS", value: "space-2" },
    { label: "S", value: "space-6" },
    { label: "M", value: "space-10" },
    { label: "L", value: "space-14" },
    { label: "XL", value: "space-24" },
    { label: "XXL", value: "space-32" },
    { label: "Custom", value: "custom" },
  ];

  const handleEdgeChange = (edge: "top" | "right" | "bottom" | "left", newVal: string) => {
    let edgeUpdates: any = { [edge]: { ...(currentVal[edge] || {}), [activeKey]: newVal } };

    if (isLocked) {
      ["top", "right", "bottom", "left"].forEach((e) => {
        edgeUpdates[e] = { ...(currentVal[e] || {}), [activeKey]: newVal };
      });
    }

    onChange({ ...currentVal, ...edgeUpdates });
  };

  const handleCustomChange = (edge: "top" | "right" | "bottom" | "left", val: any) => {
    let edgeUpdates: any = { [edge]: { ...(currentVal[edge] || {}), [activeKey]: "custom" } };
    let customUpdates: any = { [`${edge}Custom`]: { ...(currentVal[`${edge}Custom`] || {}), [activeKey]: val } };

    if (isLocked) {
      ["top", "right", "bottom", "left"].forEach((e) => {
        edgeUpdates[e] = { ...(currentVal[e] || {}), [activeKey]: "custom" };
        customUpdates[`${e}Custom`] = { ...(currentVal[`${e}Custom`] || {}), [activeKey]: val };
      });
    }

    onChange({ ...currentVal, ...edgeUpdates, ...customUpdates });
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
          <ViewportSelector />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.preventDefault(); toggleLock(); }}
            title="Lock all sides"
            className={`p-1 flex items-center justify-center rounded transition-colors cursor-pointer ${isLocked ? 'text-primary bg-primary/10' : 'text-neutral-500 hover:bg-neutral-200'
              }`}
          >
            <Icon icon={isLocked ? "lucide:link" : "lucide:unlink"} width={14} />
          </button>

          <div className="relative flex">
            <button
              onClick={() => setUnitOpen((s) => !s)}
              className="flex py-1 px-2 text-[11px] rounded hover:bg-neutral-200"
            >
              {activeUnit?.label || "PX"}
            </button>

            {unitOpen && (
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-white shadow-lg z-50 min-w-[40px]">
                {units.map((u) => (
                  <button
                    key={u.value}
                    onClick={() => handleUnitChange(u.value)}
                    className={`flex items-center justify-center gap-2 w-full p-1 text-[11px] text-neutral-700 hover:bg-neutral-200 ${activeUnit?.value === u.value ? "text-primary bg-primary/10" : ""
                      }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
        <DropdownControl
          label="Top"
          value={activeTop}
          customValue={getCascadedValue(currentVal.topCustom, activeKey)}
          options={spacingOptions}
          onChange={(v: string) => handleEdgeChange("top", v)}
          onCustomChange={(v: number) => handleCustomChange("top", v)}
        />
        <DropdownControl
          label="Right"
          value={activeRight}
          customValue={getCascadedValue(currentVal.rightCustom, activeKey)}
          options={spacingOptions}
          onChange={(v: string) => handleEdgeChange("right", v)}
          onCustomChange={(v: number) => handleCustomChange("right", v)}
        />
        <DropdownControl
          label="Bottom"
          value={activeBottom}
          customValue={getCascadedValue(currentVal.bottomCustom, activeKey)}
          options={spacingOptions}
          onChange={(v: string) => handleEdgeChange("bottom", v)}
          onCustomChange={(v: number) => handleCustomChange("bottom", v)}
        />
        <DropdownControl
          label="Left"
          value={activeLeft}
          customValue={getCascadedValue(currentVal.leftCustom, activeKey)}
          options={spacingOptions}
          onChange={(v: string) => handleEdgeChange("left", v)}
          onCustomChange={(v: number) => handleCustomChange("left", v)}
        />
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
  property: string;
  prefix: string;
  responsiveValue?: ResponsiveValue<any>;
  resolver?: (bp: BreakpointKey) => string | undefined | null;
  formatter?: (val: any) => string;
};

export const getResponsiveCSS = (configs: ResponsiveCSSConfig[]) => {
  const style: React.CSSProperties = {} as any;
  const classes: string[] = [];

  const bps: BreakpointKey[] = ["desktop", "laptop", "tablet", "mobile"];
  const bpCodes: Record<BreakpointKey, string> = {
    desktop: "base",
    laptop: "lg",
    tablet: "md",
    mobile: "sm",
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

        const mqPrefix = BREAKPOINT_PREFIX[bp];
        classes.push(`${mqPrefix}[${property}:var(${varName})]`);
      }
    });
  });

  return { style, className: classes.join(" ") };
};