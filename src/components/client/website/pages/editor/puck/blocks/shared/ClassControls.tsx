import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import { Dropdown } from "./Dropdown";
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
          <span className="text-xs text-gray-800 font-semibold block">{label}</span>
          <VariableBindingButton cssProperty={cssProperty} value={value} onChange={onChange} disabled={disabled} />
        </div>
        <div className="relative flex">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!disabled && !isBound) setUnitOpen((s) => !s);
            }}
            disabled={disabled || isBound}
            className={`flex items-center py-1 px-2 text-xs rounded transition-colors ${isBound ? 'opacity-50' : 'hover:bg-neutral-200'}`}
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
                    className={`flex items-center justify-center w-full py-1.5 px-2 text-xs text-neutral-700 hover:bg-neutral-100 ${unit === u ? "text-primary bg-primary/5 font-medium" : ""
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
          <div className="w-16 h-8 flex items-center justify-center bg-primary/5 text-primary text-xs font-medium border border-primary/20 rounded overflow-hidden px-1" title={String(value)}>
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
        <span className="text-xs text-neutral-500 italic mt-[-2px]">
          {description}
        </span>
      )}
    </div>
  );
};

export const ClassOptionGroup = ({ label, value, onChange, disabled, options, controlType, direction, variant, align }: any) => {
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

  const activeOpt = mappedOptions.find((o: any) => o.value === value) || mappedOptions[0];
  const isCompact = variant === "compact";

  return (
    <div className={`${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {label && <span className="text-xs text-gray-800 font-semibold block mb-1">{label}</span>}
      <Dropdown
        align={align}
        trigger={
          <button
            type="button"
            className={`${isCompact ? 'w-full px-0 justify-center' : 'w-full px-2 justify-between'} h-8 flex items-center bg-zinc-50 rounded border border-neutral-200 outline-none text-xxs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors`}
            title={activeOpt?.label}
          >
            <div className="flex items-center gap-2 overflow-hidden px-1">
              {activeOpt?.icon && (
                <div className={`flex items-center justify-center transition-transform duration-200 ${activeOpt.rotateClass || ""}`}>
                  <Icon icon={activeOpt.icon} width={16} />
                </div>
              )}
              {!isCompact && <span className="truncate">{activeOpt?.label}</span>}
            </div>
            {!isCompact && <Icon icon="mdi:chevron-down" width={16} className="text-gray-800 flex-shrink-0" />}
          </button>
        }
      >
        <div className="py-1 whitespace-nowrap">
          {mappedOptions.map((opt: any) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-zinc-50 transition-colors ${value === opt.value ? "text-primary font-semibold bg-primary/5" : "text-zinc-600"
                }`}
            >
              {opt.icon && (
                <div className={`flex items-center justify-center transition-transform duration-200 ${opt.rotateClass || ""}`}>
                  <Icon icon={opt.icon} width={16} />
                </div>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </Dropdown>
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
      <div className="absolute z-[70] bg-white shadow-xl border border-neutral-200 rounded-lg p-3 w-48 flex flex-col gap-3 top-1/2 left-1/2 -translate-1/2">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
          <span className="text-xs font-bold uppercase text-neutral-500 tracking-wider">{label}</span>
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
              className="h-8 px-2 text-xs font-medium bg-neutral-50 border border-neutral-200 rounded hover:bg-neutral-100 transition-colors flex items-center gap-1 min-w-[40px] justify-center"
            >
              {isBound ? "-" : unit}
            </button>
            {unitOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 shadow-lg rounded py-1 z-10 min-w-[50px]">
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`w-full text-left px-2 py-1 text-xs hover:bg-neutral-50 ${unit === u ? "text-primary font-bold" : "text-neutral-600"}`}
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
            <Icon icon={edge === "top" || edge === "bottom" ? "lucide:unfold-vertical" : "lucide:unfold-horizontal"} width={16} />
            <span className="text-[9px] font-medium">Both</span>
          </button>
          <button
            onClick={setAllSides}
            title="Set all sides"
            className="flex-1 h-7 flex items-center justify-center gap-1.5 rounded bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <Icon icon="lucide:maximize" width={16} />
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
      {label && <span className="text-xs text-gray-800 font-semibold block">{label}</span>}

      <div className="relative grid grid-cols-5 grid-rows-4 bg-neutral-50 border border-neutral-200 rounded-lg select-none">
        <span className="absolute top-2 left-2 text-xxs font-bold text-neutral-400">Margin</span>

        {/* Margin Edges */}
        {/* Top */}
        <div className="col-start-3 row-start-1 flex items-center justify-center pointer-events-auto">
          <button
            title="Margin Top"
            onClick={() => setActivePopout({ type: "margin", edge: "top" })}
            className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginTop) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
        <div className="col-start-5 row-start-2 row-span-2 flex items-center justify-center pointer-events-auto">
          <button
            title="Margin Right"
            onClick={() => setActivePopout({ type: "margin", edge: "right" })}
            className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginRight) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
        <div className="col-start-3 row-start-4 flex items-center justify-center pointer-events-auto">
          <button
            title="Margin Bottom"
            onClick={() => setActivePopout({ type: "margin", edge: "bottom" })}
            className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginBottom) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
        <div className="col-start-1 row-start-2 row-span-2 flex items-center justify-center pointer-events-auto">
          <button
            title="Margin Left"
            onClick={() => setActivePopout({ type: "margin", edge: "left" })}
            className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.marginLeft) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
        {/* Padding Inner Box */}
        <div className="col-start-2 col-span-3 row-start-2 row-span-2 bg-white border border-dashed border-neutral-300 rounded-md shadow-sm">
          <div className="grid grid-cols-5 grid-rows-3 pointer-events-none">
            <div className="col-start-2 col-span-3 row-start-2 w-full h-full bg-neutral-50/50 rounded flex items-center justify-center">
              <span className="text-xxs font-bold text-neutral-400">Padding</span>
            </div>
            {/* Top */}
            <div className="col-start-3 row-start-1 flex items-center justify-center pointer-events-auto mt-2">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "top" })}
                className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.paddingTop) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
            <div className="col-start-5 row-start-2 flex items-center justify-center pointer-events-auto mr-2">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "right" })}
                className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.paddingRight) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
            <div className="col-start-3 row-start-3 flex items-center justify-center pointer-events-auto mb-2">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "bottom" })}
                className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.paddingBottom) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
            <div className="col-start-1 row-start-2 flex items-center justify-center pointer-events-auto ml-2">
              <button
                onClick={() => setActivePopout({ type: "padding", edge: "left" })}
                className={`text-xs font-medium px-2 py-0.5 rounded hover:bg-neutral-200 transition-colors ${isVariableRef(values?.paddingLeft) ? "text-primary bg-primary/5" : "text-neutral-600"}`}
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
        </div>
      </div>

    </div>
  );
};


const GapInput = ({ prop, values, disabled, onChange, cssProperty }: any) => {
  const val = values?.[prop] || "";
  const { value: num, unit } = parseValueUnit(val, "px");
  const isBound = isVariableRef(String(val));
  const [unitOpen, setUnitOpen] = useState(false);
  const units = ["px", "rem", "em", "%", "vh", "vw"];

  const handleGapChange = (newVal: string) => {
    if (disabled || isBound) return;
    onChange({ [prop]: newVal });
  };

  const handleUnitChange = (newUnit: string) => {
    if (disabled || isBound) return;
    onChange({ [prop]: num === "" ? "" : `${num}${newUnit}` });
    setUnitOpen(false);
  };

  return (
    <div className={`${isBound ? 'border-primary/30 bg-primary/5' : 'border-neutral-200 focus-within:border-neutral-400 bg-white'} flex items-center rounded border transition-colors h-8`}>
      {isBound ? (
        <div className="flex-1 flex items-center px-2 gap-1.5 min-w-0" title={String(val)}>
          <Icon icon="mdi:variable" width={12} className="text-primary flex-shrink-0" />
          <span className="text-[10px] text-primary font-bold truncate uppercase tracking-tight">Bound</span>
        </div>
      ) : (
        <input
          type="number"
          value={num}
          disabled={disabled}
          onChange={(e) => handleGapChange(e.target.value === "" ? "" : `${e.target.value}${unit || 'px'}`)}
          className="w-full min-w-0 h-full text-xs px-2 outline-none bg-transparent"
          placeholder="0"
        />
      )}
      <div className="flex items-center pr-0.5 border-l border-neutral-100 bg-neutral-50/50">
        <VariableBindingButton
          cssProperty={cssProperty}
          value={val}
          onChange={(v: string) => onChange({ [prop]: v })}
          disabled={disabled}
        />
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!disabled && !isBound) setUnitOpen(!unitOpen);
            }}
            disabled={disabled || isBound}
            className={`h-6 px-1.5 text-[9px] font-bold rounded hover:bg-neutral-100 transition-colors ${isBound ? 'opacity-50' : 'text-neutral-500'}`}
          >
            {isBound ? '-' : (unit || 'px').toUpperCase()}
          </button>
          {unitOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUnitOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 shadow-lg rounded py-1 z-50 min-w-[50px]">
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={(e) => { e.preventDefault(); handleUnitChange(u); }}
                    className={`w-full text-left px-3 py-1 text-[10px] hover:bg-neutral-50 ${unit === u ? "text-primary font-bold bg-primary/5" : "text-neutral-600"}`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ClassGapControl = ({ label, values, onChange, disabled, cssProperties, columnGapOverridden, rowGapOverridden }: any) => {
  const [locked, setLocked] = useState(true);

  const handleGapChange = (updates: any) => {
    if (disabled) return;
    if (locked) {
      const val = Object.values(updates)[0];
      onChange({
        ...values,
        rowGap: val,
        columnGap: val,
      });
    } else {
      onChange({
        ...values,
        ...updates,
      });
    }
  };

  return (
    <div className={`${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {label && <div className="mb-1">{label}</div>}
      <div className="flex items-center justify-between gap-2 mb-2 px-0.5">
        <div className="flex items-center gap-1 flex-1">
          <span className={`text-xs text-gray-800 font-semibold block ${columnGapOverridden ? 'line-through opacity-50' : ''}`}>
            Col gap
          </span>
          {columnGapOverridden && <Icon icon="lucide:lock" width={8} className="text-zinc-300" />}
        </div>
        <div className="flex items-center gap-1 flex-1 justify-between">
          <div>
            {rowGapOverridden && <Icon icon="lucide:lock" width={8} className="text-zinc-300" />}
            <span className={`text-xs text-gray-800 font-semibold block ${rowGapOverridden ? 'line-through opacity-50' : ''}`}>
              Row gap
            </span>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); if (!disabled) setLocked(!locked); }}
            disabled={disabled}
            title={locked ? "Unlink Gaps" : "Link Gaps"}
            className={`p-1 rounded-full transition-all ${locked ? 'bg-primary/20 text-primary' : 'text-neutral-800 hover:bg-neutral-200'}`}
          >
            <Icon icon={locked ? "lucide:link" : "lucide:unlink"} width={10} />
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <GapInput
            prop="columnGap"
            values={values}
            disabled={disabled}
            onChange={handleGapChange}
            cssProperty={cssProperties?.columnGap}
          />
        </div>
        <div className="flex-1">
          <GapInput
            prop="rowGap"
            values={values}
            disabled={disabled}
            onChange={handleGapChange}
            cssProperty={cssProperties?.rowGap}
          />
        </div>
      </div>
    </div>
  );
};
