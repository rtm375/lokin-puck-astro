import { useState } from "react";
import { Icon } from "@iconify/react";
import { VariableSelector } from "./VariableSelector";
import type { PropertyValue, VariableCategory } from "@/stores/useVariableStore";
import { validatePropertyValue, getPropertyValueError } from "@/lib/client/class-system/validation";
import { getPropertyHelp } from "@/lib/client/class-system/property-help";

interface PropertyControlProps {
  property: string;
  label: string;
  value: PropertyValue | undefined;
  inheritedValue: PropertyValue | undefined;
  onChange: (value: PropertyValue) => void;
  onReset: () => void;
  variableCategory?: VariableCategory;
  controlType?: "text" | "select" | "variable";
  options?: Array<{ label: string; value: string }>;
}

export function PropertyControl({
  property,
  label,
  value,
  inheritedValue,
  onChange,
  onReset,
  variableCategory,
  controlType = "text",
  options = [],
}: PropertyControlProps) {
  const [useVariable, setUseVariable] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const hasValue = value !== undefined && value !== null && value !== "";
  const hasInheritedValue = inheritedValue !== undefined && inheritedValue !== null && inheritedValue !== "";
  
  // Check if current value is a variable reference
  const isVariableRef =
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "variable";
  
  // Validate current value
  const isValid = !hasValue || validatePropertyValue(property, value);
  const errorMessage = hasValue && !isValid ? getPropertyValueError(property, value) : null;

  // Get help text for this property
  const helpText = getPropertyHelp(property);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-neutral-700">{label}</label>
          {helpText?.tooltip && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                type="button"
              >
                <Icon icon="lucide:help-circle" width={12} />
              </button>
              {showTooltip && (
                <div className="absolute left-0 top-full mt-1 z-50 w-64 p-2 text-[10px] leading-relaxed bg-neutral-900 text-white rounded shadow-lg">
                  {helpText.tooltip}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {variableCategory && (
            <button
              onClick={() => setUseVariable((s) => !s)}
              className={`
                p-1 rounded transition-colors
                ${useVariable || isVariableRef ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}
              `}
              title="Use variable"
              type="button"
            >
              <Icon icon="lucide:variable" width={12} />
            </button>
          )}
          {hasValue && (
            <button
              onClick={onReset}
              className="p-1 rounded bg-neutral-100 text-neutral-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Reset to inherited value"
              type="button"
            >
              <Icon icon="lucide:rotate-ccw" width={12} />
            </button>
          )}
        </div>
      </div>

      {helpText?.description && (
        <div className="text-[10px] text-neutral-500">
          {helpText.description}
        </div>
      )}

      {hasInheritedValue && (
        <div className="text-[10px] text-neutral-500 italic flex items-center gap-1">
          <Icon icon="lucide:arrow-down" width={10} />
          <span>Inherited: {String(inheritedValue)}</span>
        </div>
      )}

      {useVariable || isVariableRef ? (
        variableCategory && (
          <VariableSelector
            category={variableCategory}
            value={value || ""}
            onChange={onChange}
            onSwitchToCustom={() => setUseVariable(false)}
          />
        )
      ) : (
        <>
          {controlType === "select" && options.length > 0 ? (
            <select
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              className={`
                w-full px-2.5 py-1.5 text-xs rounded-md border bg-white focus:outline-none
                ${!isValid ? "border-red-500 focus:border-red-600" : hasValue ? "border-primary focus:border-primary" : "border-neutral-300 focus:border-primary"}
              `}
            >
              <option value="">Select...</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={String(value || "")}
              onChange={(e) => onChange(e.target.value)}
              placeholder={hasInheritedValue ? String(inheritedValue) : "Enter value"}
              className={`
                w-full px-2.5 py-1.5 text-xs rounded-md border bg-white focus:outline-none transition-colors
                ${!isValid ? "border-red-500 focus:border-red-600" : hasValue ? "border-primary font-medium" : "border-neutral-300 focus:border-primary"}
              `}
            />
          )}
        </>
      )}
      
      {errorMessage && (
        <div className="text-[10px] text-red-600 flex items-center gap-1">
          <Icon icon="lucide:alert-circle" width={10} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
