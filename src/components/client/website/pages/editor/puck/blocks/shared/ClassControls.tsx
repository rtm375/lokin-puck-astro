import { Icon } from "@iconify/react";
import { useState } from "react";

const parseValueUnit = (val: any, defaultUnit = "px") => {
  if (val === undefined || val === null || val === "") return { value: "", unit: defaultUnit };
  const str = String(val);
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

export const ClassSizeControl = ({ label, value, onChange, disabled, units = ["px", "%", "em", "rem", "vh", "vw"], min = 0, max = 2000, step = 1, description }: any) => {
  const { value: num, unit } = parseValueUnit(value, units[0]);
  const [unitOpen, setUnitOpen] = useState(false);

  // Get dynamic max based on current unit
  const currentMax = getMaxForUnit(unit, max);

  const handleNumChange = (newNum: string | number) => {
    if (disabled) return;
    if (newNum === "" || newNum === "auto") {
      onChange("");
    } else {
      // Clamp value to current unit's max
      const clampedValue = typeof newNum === "number" ? Math.min(newNum, currentMax) : newNum;
      onChange(`${clampedValue}${unit || units[0]}`);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    if (disabled) return;
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
  const sliderValue = isEmpty || isAuto ? min : numericValue;

  return (
    <div className={`flex flex-col gap-1 w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-700">{label}</span>
        <div className="relative flex">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!disabled) setUnitOpen((s) => !s);
            }}
            disabled={disabled}
            className="flex items-center py-1 px-2 text-[11px] rounded hover:bg-neutral-200 transition-colors"
          >
            {unit}
            <Icon icon="lucide:chevron-down" className="ml-1" width={12} />
          </button>
          {unitOpen && (
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
                    className={`flex items-center justify-center w-full py-1.5 px-2 text-[11px] text-neutral-700 hover:bg-neutral-100 ${
                      unit === u ? "text-primary bg-primary/5 font-medium" : ""
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
          disabled={disabled || isAuto}
          onChange={(e) => handleNumChange(Number(e.target.value))}
          className="flex-1 w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-700"
        />
        <input
          type="number"
          value={isAuto ? "" : numericValue}
          disabled={disabled}
          max={currentMax}
          onChange={(e) => handleNumChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="auto"
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

export const ClassOptionGroup = ({ label, value, onChange, disabled, options }: any) => {
  return (
    <div className={`flex flex-col gap-1 w-full mt-1 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <span className="text-[11px] font-medium text-neutral-700">{label}</span>
      <div className="flex rounded-md border bg-white border-neutral-300 overflow-hidden w-full *:not-last-of-type:border-r *:not-last-of-type:border-neutral-300">
        {options.map((opt: any) => (
          <button
            key={opt.value}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              onChange(value === opt.value ? "" : opt.value);
            }}
            title={opt.label}
            className={`h-8 cursor-pointer flex flex-1 items-center justify-center transition-all ${
              value === opt.value ? "bg-primary/10 text-primary" : "text-gray-500 bg-neutral-50 hover:text-primary hover:bg-primary/10"
            }`}
          >
            {opt.icon ? <Icon icon={opt.icon} width={15} /> : <span className="text-[10px] font-semibold">{opt.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

const EdgeInput = ({ edge, icon, type, values, disabled, locked, onChange, parseValueUnit }: any) => {
  const propName = `${type}${edge.charAt(0).toUpperCase() + edge.slice(1)}`;
  const val = values?.[propName] || "";
  const { value: num, unit } = parseValueUnit(val, "px");

  const handleEdgeChange = (newVal: string) => {
    if (disabled) return;
    if (locked) {
      onChange({
        [`${type}Top`]: newVal,
        [`${type}Right`]: newVal,
        [`${type}Bottom`]: newVal,
        [`${type}Left`]: newVal,
      });
    } else {
      onChange({ ...values, [propName]: newVal });
    }
  };

  return (
    <div className="flex items-center bg-white border border-neutral-200 rounded overflow-hidden focus-within:border-neutral-400 group transition-colors">
      <div className="w-6 h-7 flex items-center justify-center bg-neutral-50 border-r border-neutral-200 text-neutral-400 group-hover:text-primary transition-colors">
        <Icon icon={icon} width={12} />
      </div>
      <input
        type="number"
        value={num}
        disabled={disabled}
        onChange={(e) => handleEdgeChange(e.target.value === "" ? "" : `${e.target.value}${unit || 'px'}`)}
        className="w-full min-w-0 h-7 text-xs px-1.5 outline-none bg-transparent"
        placeholder="0"
      />
    </div>
  );
};

export const ClassSpacingControl = ({ label, type, values, onChange, disabled }: { label: React.ReactNode, type: 'margin' | 'padding', values: any, onChange: (v: any) => void, disabled?: boolean }) => {
  const [locked, setLocked] = useState(true);

  return (
    <div className={`flex flex-col gap-1 w-full mt-1 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-700">{label}</span>
        <button
          onClick={(e) => { e.preventDefault(); if (!disabled) setLocked(!locked); }}
          disabled={disabled}
          className={`p-1 rounded transition-all ${locked ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:bg-neutral-100'}`}
        >
          <Icon icon={locked ? "lucide:link" : "lucide:unlink"} width={12} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <EdgeInput edge="top" icon="lucide:arrow-up-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        <EdgeInput edge="right" icon="lucide:arrow-right-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        <EdgeInput edge="bottom" icon="lucide:arrow-down-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        <EdgeInput edge="left" icon="lucide:arrow-left-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
      </div>
    </div>
  );
};

const GapInput = ({ prop, icon, title, values, disabled, locked, onChange, parseValueUnit }: any) => {
  const val = values?.[prop] || "";
  const { value: num, unit } = parseValueUnit(val, "px");

  const handleGapChange = (newVal: string) => {
    if (disabled) return;
    if (locked) {
      onChange({ rowGap: newVal, columnGap: newVal });
    } else {
      onChange({ ...values, [prop]: newVal });
    }
  };

  return (
    <div className="flex items-center bg-white border border-neutral-200 rounded overflow-hidden focus-within:border-neutral-400 group transition-colors">
      <div className="w-6 h-7 flex items-center justify-center bg-neutral-50 border-r border-neutral-200 text-neutral-400 group-hover:text-primary transition-colors" title={title}>
        <Icon icon={icon} width={12} />
      </div>
      <input
        type="number"
        value={num}
        disabled={disabled}
        onChange={(e) => handleGapChange(e.target.value === "" ? "" : `${e.target.value}${unit || 'px'}`)}
        className="w-full min-w-0 h-7 text-xs px-1.5 outline-none bg-transparent"
        placeholder="0"
      />
    </div>
  );
};

export const ClassGapControl = ({ label, values, onChange, disabled }: any) => {
  const [locked, setLocked] = useState(true);

  return (
    <div className={`flex flex-col gap-1 w-full mt-1 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-700">{label}</span>
        <button
          onClick={(e) => { e.preventDefault(); if (!disabled) setLocked(!locked); }}
          disabled={disabled}
          className={`p-1 rounded transition-all ${locked ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:bg-neutral-100'}`}
        >
          <Icon icon={locked ? "lucide:link" : "lucide:unlink"} width={12} />
        </button>
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
