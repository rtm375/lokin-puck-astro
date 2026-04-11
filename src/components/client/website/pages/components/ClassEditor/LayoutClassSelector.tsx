import { useState } from "react";
import { Icon } from "@iconify/react";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";
import { GENERAL_HELP } from "@/lib/client/class-system/property-help";

interface LayoutClassSelectorProps {
  classIds: string[];
  onChange: (newClassIds: string[]) => void;
}

export function LayoutClassSelector({ classIds, onChange }: LayoutClassSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const getLayoutClasses = useClassRegistryStore((state) => state.getLayoutClasses);
  const getClass = useClassRegistryStore((state) => state.getClass);
  
  const layoutClasses = getLayoutClasses();
  
  // Find current active layout class
  const activeLayoutClass = classIds
    .map((id) => getClass(id))
    .find((c) => c?.type === "layout");

  const handleLayoutChange = (newLayoutClassId: string) => {
    // Remove any existing layout class
    const withoutLayout = classIds.filter((id) => {
      const c = getClass(id);
      return c?.type !== "layout";
    });
    
    // Add new layout class at the beginning
    onChange([newLayoutClassId, ...withoutLayout]);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-neutral-300 hover:border-neutral-400 transition-colors"
      >
        <Icon
          icon={activeLayoutClass?.name === "Grid" ? "lucide:grid-3x3" : "lucide:columns-3"}
          width={14}
        />
        <span>{activeLayoutClass?.name || "Layout"}</span>
        <Icon icon="lucide:chevron-down" width={12} />
      </button>

      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
          type="button"
        >
          <Icon icon="lucide:help-circle" width={14} />
        </button>
        {showTooltip && (
          <div className="absolute left-0 top-full mt-1 z-50 w-72 p-3 bg-neutral-900 text-white rounded shadow-lg">
            <div className="text-xs font-medium mb-1">{GENERAL_HELP.layoutClass.title}</div>
            <div className="text-[10px] leading-relaxed">{GENERAL_HELP.layoutClass.tooltip}</div>
          </div>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 flex flex-col bg-white shadow-lg border border-neutral-100 rounded-md overflow-hidden z-50 min-w-[120px]">
            {layoutClasses.map((layoutClass) => (
              <button
                key={layoutClass.id}
                onClick={() => handleLayoutChange(layoutClass.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-neutral-50 transition-colors
                  ${activeLayoutClass?.id === layoutClass.id ? "bg-primary/5 text-primary font-medium" : "text-neutral-700"}
                `}
              >
                <Icon
                  icon={layoutClass.name === "Grid" ? "lucide:grid-3x3" : "lucide:columns-3"}
                  width={14}
                />
                <span>{layoutClass.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
