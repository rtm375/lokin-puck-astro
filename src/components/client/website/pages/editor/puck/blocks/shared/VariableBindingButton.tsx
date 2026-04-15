import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useVariablesStore } from "@/stores/useVariablesStore";
import { getVariableTypesForProperty, isVariableRef, parseVariableRef, createVariableRef, inferVariableType } from "./controlTypes";
import type { VariableType } from "@/types";

interface VariableBindingButtonProps {
  cssProperty?: string;
  value: any;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const VariableBindingButton: React.FC<VariableBindingButtonProps> = ({
  cssProperty,
  value,
  onChange,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { variables } = useVariablesStore();

  if (!cssProperty) return null;

  const compatibleTypes = getVariableTypesForProperty(cssProperty);
  if (compatibleTypes.length === 0) return null;

  const isBound = isVariableRef(String(value));
  const boundVariableId = isBound ? parseVariableRef(String(value)) : null;
  const boundVariable = boundVariableId ? variables.find(v => v.id === boundVariableId) : null;

  const availableVariables = variables.filter(v => {
    if (v.is_group) return false;
    const inferredType = inferVariableType(v.value);
    return compatibleTypes.includes(inferredType as VariableType);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (variableId: string) => {
    onChange(createVariableRef(variableId));
    setIsOpen(false);
  };

  const handleUnbind = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        title={isBound ? `Bound to ${boundVariable?.name || 'Variable'}` : 'Bind to Variable'}
        className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${
          isBound 
            ? 'text-primary bg-primary/10 hover:bg-primary/20' 
            : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Icon icon="mdi:variable" width={14} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 max-h-64 overflow-y-auto bg-white border border-neutral-200 rounded-md shadow-lg z-50 py-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-100 mb-1">
            Variables
          </div>
          
          {isBound && (
            <button
              onClick={(e) => { e.preventDefault(); handleUnbind(); }}
              className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Icon icon="lucide:unlink" width={12} />
              Unbind Variable
            </button>
          )}

          {availableVariables.length === 0 ? (
            <div className="px-3 py-2 text-xs text-neutral-400 italic">No variables available</div>
          ) : (
            availableVariables.map((v) => {
              const inferredType = inferVariableType(v.value);
              return (
                <button
                  key={v.id}
                  onClick={(e) => { e.preventDefault(); handleSelect(v.id); }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 flex items-center justify-between ${
                    boundVariableId === v.id ? 'bg-primary/5 text-primary font-medium' : 'text-neutral-700'
                  }`}
                >
                  <span className="truncate">{v.name}</span>
                  {inferredType === 'color' ? (
                    <span className="w-3 h-3 rounded-full border border-neutral-200 flex-shrink-0" style={{ background: v.value }} />
                  ) : (
                    <span className="text-[10px] text-neutral-400 truncate max-w-[60px]">{v.value}</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
