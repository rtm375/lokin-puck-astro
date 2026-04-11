import { useState } from "react";
import { Icon } from "@iconify/react";
import { useVariableStore, type VariableCategory, type PropertyValue } from "@/stores/useVariableStore";
import { GENERAL_HELP } from "@/lib/client/class-system/property-help";

interface VariableSelectorProps {
  category: VariableCategory;
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  onSwitchToCustom: () => void;
}

export function VariableSelector({
  category,
  value,
  onChange,
  onSwitchToCustom,
}: VariableSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const listVariables = useVariableStore((state) => state.listVariables);
  const getVariable = useVariableStore((state) => state.getVariable);
  const resolveVariable = useVariableStore((state) => state.resolveVariable);
  
  const variables = listVariables(category);
  
  // Check if current value is a variable reference
  const isVariableRef =
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    value.type === "variable";
  
  const currentVariable = isVariableRef && value.variableId ? getVariable(value.variableId) : null;
  const resolvedValue = isVariableRef && value.variableId ? resolveVariable(value.variableId) : String(value || "");

  const handleVariableSelect = (variableId: string) => {
    onChange({ type: "variable", variableId });
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-1.5 mb-1">
        <button
          onClick={() => setOpen((s) => !s)}
          className="flex-1 flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md border border-neutral-300 bg-white hover:border-neutral-400 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon icon="lucide:variable" width={12} className="text-neutral-500 flex-shrink-0" />
            <span className="truncate text-neutral-700">
              {currentVariable ? currentVariable.name : "Select variable"}
            </span>
          </div>
          <Icon icon="lucide:chevron-down" width={12} className="text-neutral-500 flex-shrink-0" />
        </button>
        
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
              {GENERAL_HELP.variables.tooltip}
            </div>
          )}
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 flex flex-col bg-white shadow-lg border border-neutral-100 rounded-md overflow-hidden z-50 max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                onSwitchToCustom();
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-neutral-50 border-b border-neutral-100 text-neutral-700"
            >
              <Icon icon="lucide:pencil" width={12} />
              <span>Custom value</span>
            </button>
            
            {variables.length === 0 ? (
              <div className="px-3 py-2 text-xs text-neutral-500 italic">
                No {category} variables available
              </div>
            ) : (
              variables.map((variable) => {
                const isSelected = currentVariable?.id === variable.id;
                const varResolvedValue = resolveVariable(variable.id);
                
                return (
                  <button
                    key={variable.id}
                    onClick={() => handleVariableSelect(variable.id)}
                    className={`
                      flex items-center justify-between gap-2 px-3 py-2 text-xs text-left hover:bg-neutral-50 transition-colors
                      ${isSelected ? "bg-primary/5 text-primary font-medium" : "text-neutral-700"}
                    `}
                  >
                    <span className="truncate">{variable.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono flex-shrink-0">
                      {varResolvedValue}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
      
      {currentVariable && (
        <div className="mt-1 text-[10px] text-neutral-500 flex items-center gap-1">
          <span>Current value:</span>
          <span className="font-mono">{resolvedValue}</span>
        </div>
      )}
    </div>
  );
}
