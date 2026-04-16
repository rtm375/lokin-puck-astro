import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import { VariableBindingButton } from "./VariableBindingButton";
import { isVariableRef } from "./controlTypes";

const parseValueUnit = (val: any, defaultUnit = "px") => {
  if (val === undefined || val === null || val === "") return { value: "", unit: defaultUnit };
  const str = String(val);

  if (isVariableRef(str)) {
    return { value: str, unit: "" }; // keep as is
  }

  if (str === "auto") return { value: "auto", unit: "" };
  const match = str.match(/^(-?\d+\.?\d*)(.*)$/);
  if (match) return { value: Number(match[1]), unit: match[2] || defaultUnit };
  return { value: str, unit: "" };
};

// Get appropriate max value based on unit
const getMaxForUnit = (unit: string, defaultMax: number) => {
  switch (unit) {
    case "%":
    case "vh":
    case "vw":
      return 100;
    case "em":
    case "rem":
      return 50; // reasonable max for em/rem
    case "px":
    default:
      return defaultMax;
  }
};

// Clamp value when switching units
const clampValueForUnit = (value: number, newUnit: string, defaultMax: number) => {
  const maxForUnit = getMaxForUnit(newUnit, defaultMax);
  return Math.min(value, maxForUnit);
};

export const ClassSizeControl = ({ label, value, onChange, disabled, units = ["px", "%", "em", "rem", "vh", "vw"], min = 0, max = 2000, step = 1, description, cssProperty }: any) => {
  const { value: num, unit } = parseValueUnit(value, units[0]);
  const [unitOpen, setUnitOpen] = useState(false);

  // Get dynamic max based on current unit
  const currentMax = getMaxForUnit(unit, max);
  const isBound = isVariableRef(String(value));

  const handleNumChange = (newNum: string | number) => {
    if (disabled || isBound) return;
    if (newNum === "" || newNum === "auto") {
      onChange("");
    } else {
      // Clamp value to current unit's max
      const clampedValue = typeof newNum === "number" ? Math.min(newNum, currentMax) : newNum;
      onChange(`${clampedValue}${unit || units[0]}`);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    if (disabled || isBound) return;
    if (num !== "" && num !== "auto" && num !== undefined && typeof num === "number") {
      // Clamp the current value to the new unit's max
      const clampedValue = clampValueForUnit(num, newUnit, max);
      onChange(`${clampedValue}${newUnit}`);
    }
    setUnitOpen(false);
  };

  // Convert to numeric value for slider
  const numericValue = typeof num === "number" && !isNaN(num) ? num : "";
  const isAuto = num === "auto";
  const isEmpty = num === "" || num === undefined;

  // Use min as default for slider when empty
  const sliderValue = isEmpty || isAuto || isBound ? min : numericValue;

  return (
    <div className={`${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-semibold block">{label}</span>
          <VariableBindingButton cssProperty={cssProperty} value={value} onChange={onChange} disabled={disabled} />
        </div>
        <div className="relative flex">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!disabled && !isBound) setUnitOpen((s) => !s);
            }}
            disabled={disabled || isBound}
            className={`flex items-center py-1 px-2 text-[11px] rounded transition-colors ${isBound ? 'opacity-50' : 'hover:bg-neutral-200'}`}
          >
            {isBound ? '-' : unit}
            <Icon icon="lucide:chevron-down" className="ml-1" width={12} />
          </button>
          {unitOpen && !isBound && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUnitOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 flex flex-col bg-white shadow-lg z-50 min-w-[50px] border border-neutral-100 rounded overflow-hidden">
                {units.map((u: string) => (
                  <button
                    key={u}
                    onClick={(e) => {
                      e.preventDefault();
                      handleUnitChange(u);
                    }}
                    className={`flex items-center justify-center w-full py-1.5 px-2 text-[11px] text-neutral-700 hover:bg-neutral-100 ${unit === u ? "text-primary bg-primary/5 font-medium" : ""
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
          max={currentMax}
          step={step}
          value={sliderValue}
          disabled={disabled || isAuto || isBound}
          onChange={(e) => handleNumChange(Number(e.target.value))}
          className={`flex-1 w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isBound ? 'bg-neutral-100 accent-neutral-300' : 'bg-neutral-200 accent-neutral-700'}`}
        />
        {isBound ? (
          <div className="w-16 h-8 flex items-center justify-center bg-primary/5 text-primary text-[10px] font-medium border border-primary/20 rounded overflow-hidden px-1" title={String(value)}>
            <Icon icon="mdi:variable" width={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">Bound</span>
          </div>
        ) : (
          <input
            type="number"
            value={isAuto ? "" : numericValue}
            disabled={disabled}
            max={currentMax}
            onChange={(e) => handleNumChange(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="auto"
            className="w-16 h-8 text-xs px-2 outline-none rounded border border-neutral-200 focus:border-neutral-400 bg-white"
          />
        )}
      </div>
      {description && (
        <span className="text-[10px] text-neutral-500 italic mt-[-2px]">
          {description}
        </span>
      )}
    </div>
  );
};

export const ClassOptionGroup = ({ label, value, onChange, disabled, options, controlType, direction }: any) => {
  const mappedOptions = useMemo(() => {
    if (!controlType || !direction) return options;
    return options.map((opt: any) => {
      let rotateClass = "";
      if (direction === "row") {
        rotateClass = "";
      } else if (direction === "column") {
        rotateClass = controlType === "justify" ? "rotate-90" : "-rotate-90";
      } else if (direction === "row-reverse") {
        if (
          controlType === "justify" &&
          (opt.value.includes("start") || opt.value.includes("end"))
        ) {
          rotateClass = "rotate-180";
        }
      } else if (direction === "column-reverse") {
        rotateClass = "-rotate-90";
      }
      return { ...opt, rotateClass };
    });
  }, [options, controlType, direction]);

  return (
    <div className={`${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <span className="text-xs text-zinc-400 font-semibold block">{label}</span>
      <div className="flex rounded-md border bg-white border-neutral-300 overflow-hidden w-full *:not-last-of-type:border-r *:not-last-of-type:border-neutral-300">
        {mappedOptions.map((opt: any) => (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              onChange(value === opt.value ? "" : opt.value);
            }}
            title={opt.label}
            className={`h-8 cursor-pointer flex flex-1 items-center justify-center transition-all ${value === opt.value ? "bg-primary/10 text-primary" : "text-gray-500 bg-neutral-50 hover:text-primary hover:bg-primary/10"
              }`}
          >
            {opt.icon ? (
              <div className={`flex items-center justify-center transition-transform duration-200 ${opt.rotateClass || ""}`}>
                <Icon icon={opt.icon} width={15} />
              </div>
            ) : (
              <span className="text-[10px] font-semibold">{opt.label}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const SpacingPopout = ({ type, edge, value, onChange, onClose, cssProperty, disabled }: any) => {
  const { value: num, unit } = parseValueUnit(value, "px");
  const isBound = isVariableRef(String(value));
  const [unitOpen, setUnitOpen] = useState(false);
  const units = ["px", "em", "rem", "vh", "vw", "%"];

  const label = `${type.charAt(0).toUpperCase() + type.slice(1)} ${edge}`;

  const handleNumChange = (newVal: string) => {
    if (disabled || isBound) return;
    onChange(newVal === "" ? "" : `${newVal}${unit || "px"}`);
  };

  const handleUnitChange = (newUnit: string) => {
    if (disabled || isBound) return;
    onChange(num === "" ? "" : `${num}${newUnit}`);
    setUnitOpen(false);
  };

  const setBothSides = () => {
    const opposite: Record<string, string> = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left",
    };
    const newVal = value || "0px";
    const updates: any = { [`${type}${edge.charAt(0).toUpperCase() + edge.slice(1)}`]: newVal };
    const oppEdge = opposite[edge];
    updates[`${type}${oppEdge.charAt(0).toUpperCase() + oppEdge.slice(1)}`] = newVal;
    onChange(updates, true);
  };

  const setAllSides = () => {
    const newVal = value || "0px";
    const updates: any = {
      [`${type}Top`]: newVal,
      [`${type}Right`]: newVal,
      [`${type}Bottom`]: newVal,
      [`${type}Left`]: newVal,
    };
    onChange(updates, true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" onClick={onClose} />
      <div className="absolute z-[70] bg-white shadow-xl border border-neutral-200 rounded-lg p-3 w-48 flex flex-col gap-3 left-1/2 -translate-x-1/2 mt-1 top-0">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
          <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">{label}</span>
          <VariableBindingButton
            cssProperty={cssProperty}
            value={value}
            onChange={(v: string) => onChange(v)}
            disabled={disabled}
          />
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              autoFocus
              type="number"
              value={num === "auto" ? "" : num}
              disabled={disabled || isBound}
              placeholder="0"
              onChange={(e) => handleNumChange(e.target.value)}
              className="w-full h-8 text-xs px-2 outline-none rounded border border-neutral-200 focus:border-primary/50 bg-white"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => !isBound && setUnitOpen(!unitOpen)}
              disabled={disabled || isBound}
              className="h-8 px-2 text-[10px] font-medium bg-neutral-50 border border-neutral-200 rounded hover:bg-neutral-100 transition-colors flex items-center gap-1 min-w-[40px] justify-center"
            >
              {isBound ? "-" : unit}
            </button>
            {unitOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 shadow-lg rounded py-1 z-10 min-w-[50px]">
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`w-full text-left px-2 py-1 text-[10px] hover:bg-neutral-50 ${unit === u ? "text-primary font-bold" : "text-neutral-600"}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1 pt-1 border-t border-neutral-100">
          <button
            onClick={setBothSides}
            title="Set opposite side"
            className="flex-1 h-7 flex items-center justify-center gap-1.5 rounded bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <Icon icon={edge === "top" || edge === "bottom" ? "lucide:unfold-vertical" : "lucide:unfold-horizontal"} width={14} />
            <span className="text-[9px] font-medium">Both</span>
          </button>
          <button
            onClick={setAllSides}
            title="Set all sides"
            className="flex-1 h-7 flex items-center justify-center gap-1.5 rounded bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <Icon icon="lucide:maximize" width={14} />
            <span className="text-[9px] font-medium">All</span>
          </button>
        </div>
      </div>
    </>
  );
};

export const ClassBoxModelControl = ({ label, values, onChange, disabled, cssProperties }: any) => {
  const [activePopout, setActivePopout] = useState<{ type: "margin" | "padding"; edge: string } | null>(null);

  const getDisplayValue = (val: any) => {
    if (val === undefined || val === null || val === "") return "0";
    if (isVariableRef(String(val))) return "var";
    const { value: num } = parseValueUnit(val, "px");
    return `${num}`;
  };

  const handleSpacingChange = (type: string, edge: string, newVal: any, isBulk = false) => {
    if (isBulk) {
      onChange(newVal);
    } else {
      const propName = `${type}${edge.charAt(0).toUpperCase() + edge.slice(1)}`;
      onChange({ ...values, [propName]: newVal });
    }
  };

  return (
    <div className={`${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      {label && <span className="text-xs text-zinc-400 font-semibold block">{label}</span>}

      <div className="relative bg-neutral-50 border border-neutral-200 rounded-lg p-8 select-none">
        <span className="absolute top-2 left-2 text-[9px] font-bold text-neutral-400">Margin</span>

        {/* Margin Edges */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {/* Top */}
          <div className="col-start-2 row-start-1 flex items-start justify-center pt-1.5 pointer-events-auto">
            <button
              onClick={() => setActivePopout({ type: "margin", edge: "top" })}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginTop) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
            >
              {getDisplayValue(values?.marginTop)}
            </button>
            {activePopout?.type === "margin" && activePopout?.edge === "top" && (
              <SpacingPopout
                type="margin"
                edge="top"
                value={values?.marginTop}
                cssProperty={cssProperties?.margin?.top}
                onChange={(val: any, bulk: boolean) => handleSpacingChange("margin", "top", val, bulk)}
                onClose={() => setActivePopout(null)}
                disabled={disabled}
              />
            )}
          </div>
          {/* Right */}
          <div className="col-start-3 row-start-2 flex items-center justify-end pr-1.5 pointer-events-auto">
            <button
              onClick={() => setActivePopout({ type: "margin", edge: "right" })}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginRight) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
            >
              {getDisplayValue(values?.marginRight)}
            </button>
            {activePopout?.type === "margin" && activePopout?.edge === "right" && (
              <SpacingPopout
                type="margin"
                edge="right"
                value={values?.marginRight}
                cssProperty={cssProperties?.margin?.right}
                onChange={(val: any, bulk: boolean) => handleSpacingChange("margin", "right", val, bulk)}
                onClose={() => setActivePopout(null)}
                disabled={disabled}
              />
            )}
          </div>
          {/* Bottom */}
          <div className="col-start-2 row-start-3 flex items-end justify-center pb-1.5 pointer-events-auto">
            <button
              onClick={() => setActivePopout({ type: "margin", edge: "bottom" })}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginBottom) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
            >
              {getDisplayValue(values?.marginBottom)}
            </button>
            {activePopout?.type === "margin" && activePopout?.edge === "bottom" && (
              <SpacingPopout
                type="margin"
                edge="bottom"
                value={values?.marginBottom}
                cssProperty={cssProperties?.margin?.bottom}
                onChange={(val: any, bulk: boolean) => handleSpacingChange("margin", "bottom", val, bulk)}
                onClose={() => setActivePopout(null)}
                disabled={disabled}
              />
            )}
          </div>
          {/* Left */}
          <div className="col-start-1 row-start-2 flex items-center justify-start pl-1.5 pointer-events-auto">
            <button
              onClick={() => setActivePopout({ type: "margin", edge: "left" })}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginLeft) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
            >
              {getDisplayValue(values?.marginLeft)}
            </button>
            {activePopout?.type === "margin" && activePopout?.edge === "left" && (
              <SpacingPopout
                type="margin"
                edge="left"
                value={values?.marginLeft}
                cssProperty={cssProperties?.margin?.left}
                onChange={(val: any, bulk: boolean) => handleSpacingChange("margin", "left", val, bulk)}
                onClose={() => setActivePopout(null)}
                disabled={disabled}
              />
            )}
          </div>
        </div>

        {/* Padding Inner Box */}
        <div className="relative bg-white border border-dashed border-neutral-300 rounded-md p-6 shadow-sm">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {/* Top */}
            <div className="col-start-2 row-start-1 flex items-start justify-center pt-1 pointer-events-auto">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "top" })}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-100 transition-colors ${isVariableRef(values?.paddingTop) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
              >
                {getDisplayValue(values?.paddingTop)}
              </button>
              {activePopout?.type === "padding" && activePopout?.edge === "top" && (
                <SpacingPopout
                  type="padding"
                  edge="top"
                  value={values?.paddingTop}
                  cssProperty={cssProperties?.padding?.top}
                  onChange={(val: any, bulk: boolean) => handleSpacingChange("padding", "top", val, bulk)}
                  onClose={() => setActivePopout(null)}
                  disabled={disabled}
                />
              )}
            </div>
            {/* Right */}
            <div className="col-start-3 row-start-2 flex items-center justify-end pr-1 pointer-events-auto">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "right" })}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-100 transition-colors ${isVariableRef(values?.paddingRight) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
              >
                {getDisplayValue(values?.paddingRight)}
              </button>
              {activePopout?.type === "padding" && activePopout?.edge === "right" && (
                <SpacingPopout
                  type="padding"
                  edge="right"
                  value={values?.paddingRight}
                  cssProperty={cssProperties?.padding?.right}
                  onChange={(val: any, bulk: boolean) => handleSpacingChange("padding", "right", val, bulk)}
                  onClose={() => setActivePopout(null)}
                  disabled={disabled}
                />
              )}
            </div>
            {/* Bottom */}
            <div className="col-start-2 row-start-3 flex items-end justify-center pb-1 pointer-events-auto">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "bottom" })}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-100 transition-colors ${isVariableRef(values?.paddingBottom) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
              >
                {getDisplayValue(values?.paddingBottom)}
              </button>
              {activePopout?.type === "padding" && activePopout?.edge === "bottom" && (
                <SpacingPopout
                  type="padding"
                  edge="bottom"
                  value={values?.paddingBottom}
                  cssProperty={cssProperties?.padding?.bottom}
                  onChange={(val: any, bulk: boolean) => handleSpacingChange("padding", "bottom", val, bulk)}
                  onClose={() => setActivePopout(null)}
                  disabled={disabled}
                />
              )}
            </div>
            {/* Left */}
            <div className="col-start-1 row-start-2 flex items-center justify-start pl-1 pointer-events-auto">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "left" })}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded hover:bg-neutral-100 transition-colors ${isVariableRef(values?.paddingLeft) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
              >
                {getDisplayValue(values?.paddingLeft)}
              </button>
              {activePopout?.type === "padding" && activePopout?.edge === "left" && (
                <SpacingPopout
                  type="padding"
                  edge="left"
                  value={values?.paddingLeft}
                  cssProperty={cssProperties?.padding?.left}
                  onChange={(val: any, bulk: boolean) => handleSpacingChange("padding", "left", val, bulk)}
                  onClose={() => setActivePopout(null)}
                  disabled={disabled}
                />
              )}
            </div>
          </div>

          <div className="w-full h-full bg-neutral-50/50 rounded flex items-center justify-center">
            <span className="text-[9px] font-bold text-neutral-400">Padding</span>
          </div>
        </div>
      </div>
    </div>
  );
};


const GapInput = ({ prop, icon, title, values, disabled, locked, onChange, parseValueUnit }: any) => {
  const val = values?.[prop] || "";
  const { value: num, unit } = parseValueUnit(val, "px");
  const isBound = isVariableRef(String(val));

  const handleGapChange = (newVal: string) => {
    if (disabled || isBound) return;
    if (locked) {
      onChange({ rowGap: newVal, columnGap: newVal });
    } else {
      onChange({ ...values, [prop]: newVal });
    }
  };

  return (
    <div className={`${isBound ? 'border-primary/30 bg-primary/5' : 'border-neutral-200 focus-within:border-neutral-400'} rounded overflow-hidden group transition-colors`}>
      <div className={`w-6 h-7 flex items-center justify-center border-r ${isBound ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-neutral-50 border-neutral-200 text-neutral-400 group-hover:text-primary'} transition-colors relative`} title={title}>
        <Icon icon={icon} width={12} className={isBound ? "opacity-50" : ""} />
      </div>
      {isBound ? (
        <div className="w-full h-7 text-xs px-1.5 flex items-center text-primary font-medium truncate" title={String(val)}>
          var
        </div>
      ) : (
        <input
          type="number"
          value={num}
          disabled={disabled}
          onChange={(e) => handleGapChange(e.target.value === "" ? "" : `${e.target.value}${unit || 'px'}`)}
          className="w-full min-w-0 h-7 text-xs px-1.5 outline-none bg-transparent"
          placeholder="0"
        />
      )}
    </div>
  );
};

export const ClassGapControl = ({ label, values, onChange, disabled, cssProperties }: any) => {
  const [locked, setLocked] = useState(true);

  const valRow = values?.rowGap;

  const handleBindingChange = (newVal: string) => {
    if (locked) {
      onChange({
        rowGap: newVal,
        columnGap: newVal,
      });
    } else {
      onChange({
        ...values,
        rowGap: newVal,
        columnGap: newVal,
      });
    }
  };

  return (
    <div className={`${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-semibold block">{label}</span>
        <div className="flex items-center gap-1">
          <VariableBindingButton cssProperty={cssProperties?.rowGap} value={valRow} onChange={handleBindingChange} disabled={disabled} />
          <button
            onClick={(e) => { e.preventDefault(); if (!disabled) setLocked(!locked); }}
            disabled={disabled}
            className={`p-1 rounded transition-all ${locked ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:bg-neutral-100'}`}
          >
            <Icon icon={locked ? "lucide:link" : "lucide:unlink"} width={12} />
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1">
          <GapInput prop="rowGap" icon="lucide:rows" title="Row Gap" values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        </div>
        <div className="flex-1">
          <GapInput prop="columnGap" icon="lucide:columns" title="Column Gap" values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        </div>
      </div>
    </div>
  );
};
