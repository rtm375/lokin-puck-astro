import { useState } from "react";
import { Icon } from "@iconify/react";
import { LayoutClassSelector } from "./LayoutClassSelector";
import { ClassChipStack } from "./ClassChipStack";
import { ClassCreationDialog } from "./ClassCreationDialog";
import { ClassImportExport } from "./ClassImportExport";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";
import { GENERAL_HELP } from "@/lib/client/class-system/property-help";

interface ClassTopBarProps {
  classIds: string[];
  activeClassIndex: number;
  onClassIdsChange: (classIds: string[]) => void;
  onActiveClassChange: (index: number) => void;
}

export function ClassTopBar({
  classIds,
  activeClassIndex,
  onClassIdsChange,
  onActiveClassChange,
}: ClassTopBarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStackHelp, setShowStackHelp] = useState(false);
  
  const currentWebsiteId = useClassRegistryStore((state) => state.currentWebsiteId);
  const getComputedStyles = useClassRegistryStore((state) => state.getComputedStyles);

  const handleClassRemove = (index: number) => {
    const newClassIds = classIds.filter((_, i) => i !== index);
    onClassIdsChange(newClassIds);
    
    // Adjust active index if needed
    if (activeClassIndex >= newClassIds.length) {
      onActiveClassChange(Math.max(0, newClassIds.length - 1));
    }
  };

  const handleClassReorder = (fromIndex: number, toIndex: number) => {
    const newClassIds = [...classIds];
    const [movedClass] = newClassIds.splice(fromIndex, 1);
    newClassIds.splice(toIndex, 0, movedClass);
    onClassIdsChange(newClassIds);
    
    // Update active index to follow the moved class
    if (activeClassIndex === fromIndex) {
      onActiveClassChange(toIndex);
    } else if (activeClassIndex > fromIndex && activeClassIndex <= toIndex) {
      onActiveClassChange(activeClassIndex - 1);
    } else if (activeClassIndex < fromIndex && activeClassIndex >= toIndex) {
      onActiveClassChange(activeClassIndex + 1);
    }
  };

  const handleClassCreated = (classId: string) => {
    // Add new class to the stack and make it active
    onClassIdsChange([...classIds, classId]);
    onActiveClassChange(classIds.length);
  };

  // Get current computed values to initialize new class
  const currentComputedValues = getComputedStyles(classIds).properties;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between gap-3">
        <LayoutClassSelector classIds={classIds} onChange={onClassIdsChange} />
        
        <div className="flex items-center gap-2">
          {currentWebsiteId && <ClassImportExport websiteId={currentWebsiteId} />}
          
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Icon icon="lucide:plus" width={14} />
            <span>Add Class</span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <ClassChipStack
            classIds={classIds}
            activeIndex={activeClassIndex}
            onClassSelect={onActiveClassChange}
            onClassRemove={handleClassRemove}
            onClassReorder={handleClassReorder}
          />
        </div>
        
        <div className="relative">
          <button
            onMouseEnter={() => setShowStackHelp(true)}
            onMouseLeave={() => setShowStackHelp(false)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
            type="button"
          >
            <Icon icon="lucide:help-circle" width={14} />
          </button>
          {showStackHelp && (
            <div className="absolute right-0 top-full mt-1 z-50 w-72 p-3 bg-neutral-900 text-white rounded shadow-lg">
              <div className="text-xs font-medium mb-1">{GENERAL_HELP.classStack.title}</div>
              <div className="text-[10px] leading-relaxed mb-2">{GENERAL_HELP.classStack.description}</div>
              <div className="text-[10px] leading-relaxed text-neutral-300">{GENERAL_HELP.classStack.tooltip}</div>
            </div>
          )}
        </div>
      </div>

      {/* Create Class Dialog */}
      {currentWebsiteId && (
        <ClassCreationDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          websiteId={currentWebsiteId}
          currentComputedValues={currentComputedValues}
          onClassCreated={handleClassCreated}
        />
      )}
    </div>
  );
}
