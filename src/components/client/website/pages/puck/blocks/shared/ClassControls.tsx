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

export const ClassSizeControl = ({ label, value, onChange, disabled, units = ["px", "%", "em", "rem", "vh", "vw"] }: any) => {
  const { value: num, unit } = parseValueUnit(value, units[0]);

  const handleNumChange = (newNum: string) => {
    if (disabled) return;
    if (newNum === "" || newNum === "auto") {
      onChange(newNum);
    } else {
      onChange(`${newNum}${unit || units[0]}`);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    if (disabled) return;
    if (num !== "" && num !== "auto") {
      onChange(`${num}${newUnit}`);
    }
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-700">{label}</span>
        <select
          value={unit}
          disabled={disabled}
          onChange={(e) => handleUnitChange(e.target.value)}
          className="text-[10px] bg-neutral-100 border border-neutral-200 rounded px-1 outline-none cursor-pointer"
        >
          {units.map((u: string) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <input
        type="text"
        value={num}
        disabled={disabled}
        onChange={(e) => handleNumChange(e.target.value)}
        className="w-full h-8 text-xs px-2 outline-none rounded border border-neutral-200 focus:border-neutral-400 bg-white transition-colors"
        placeholder="auto"
      />
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

export const ClassSpacingControl = ({ label, type, values, onChange, disabled }: { label: React.ReactNode, type: 'margin' | 'padding', values: any, onChange: (v: any) => void, disabled?: boolean }) => {
  const [locked, setLocked] = useState(true);

  const getEdgeValue = (edge: string) => values?.[`${type}${edge.charAt(0).toUpperCase() + edge.slice(1)}`] || "";

  const handleEdgeChange = (edge: string, val: string) => {
    if (disabled) return;
    const propName = `${type}${edge.charAt(0).toUpperCase() + edge.slice(1)}`;
    if (locked) {
      onChange({
        [`${type}Top`]: val,
        [`${type}Right`]: val,
        [`${type}Bottom`]: val,
        [`${type}Left`]: val,
      });
    } else {
      onChange({ ...values, [propName]: val });
    }
  };

  const EdgeInput = ({ edge, icon }: any) => {
    const val = getEdgeValue(edge);
    const { value: num, unit } = parseValueUnit(val, "px");
    
    return (
      <div className="flex items-center bg-white border border-neutral-200 rounded overflow-hidden focus-within:border-neutral-400 group transition-colors">
        <div className="w-6 h-7 flex items-center justify-center bg-neutral-50 border-r border-neutral-200 text-neutral-400 group-hover:text-primary transition-colors">
          <Icon icon={icon} width={12} />
        </div>
        <input
          type="number"
          value={num}
          disabled={disabled}
          onChange={(e) => handleEdgeChange(edge, e.target.value === "" ? "" : `${e.target.value}${unit || 'px'}`)}
          className="w-full min-w-0 h-7 text-xs px-1.5 outline-none bg-transparent"
          placeholder="0"
        />
      </div>
    );
  };

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
        <EdgeInput edge="top" icon="lucide:arrow-up-to-line" />
        <EdgeInput edge="right" icon="lucide:arrow-right-to-line" />
        <EdgeInput edge="bottom" icon="lucide:arrow-down-to-line" />
        <EdgeInput edge="left" icon="lucide:arrow-left-to-line" />
      </div>
    </div>
  );
};

export const ClassGapControl = ({ label, values, onChange, disabled }: any) => {
  const [locked, setLocked] = useState(true);

  const handleGapChange = (prop: string, val: string) => {
    if (disabled) return;
    if (locked) {
      onChange({ rowGap: val, columnGap: val });
    } else {
      onChange({ ...values, [prop]: val });
    }
  };

  const GapInput = ({ prop, icon, title }: any) => {
    const val = values?.[prop] || "";
    const { value: num, unit } = parseValueUnit(val, "px");
    return (
      <div className="flex items-center bg-white border border-neutral-200 rounded overflow-hidden focus-within:border-neutral-400 group transition-colors">
        <div className="w-6 h-7 flex items-center justify-center bg-neutral-50 border-r border-neutral-200 text-neutral-400 group-hover:text-primary transition-colors" title={title}>
          <Icon icon={icon} width={12} />
        </div>
        <input
          type="number"
          value={num}
          disabled={disabled}
          onChange={(e) => handleGapChange(prop, e.target.value === "" ? "" : `${e.target.value}${unit || 'px'}`)}
          className="w-full min-w-0 h-7 text-xs px-1.5 outline-none bg-transparent"
          placeholder="0"
        />
      </div>
    );
  };

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
        <div className="flex-1"><GapInput prop="rowGap" icon="lucide:rows" title="Row Gap" /></div>
        <div className="flex-1"><GapInput prop="columnGap" icon="lucide:columns" title="Column Gap" /></div>
      </div>
    </div>
  );
};
