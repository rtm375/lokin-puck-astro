import { useEffect, useCallback } from "react";
import { ClassTopBar } from "./ClassTopBar";
import { PropertyPanel } from "./PropertyPanel";
import { useClassEditorStore } from "@/stores/useClassEditorStore";
import { useClassRegistryStore, type ClassProperties } from "@/stores/useClassRegistryStore";

interface ClassEditorProps {
  componentId: string;
  classIds: string[];
  onChange: (classIds: string[]) => void;
}

export function ClassEditor({ componentId, classIds, onChange }: ClassEditorProps) {
  const activeClassIndex = useClassEditorStore((state) => state.activeClassIndex);
  const setActiveComponent = useClassEditorStore((state) => state.setActiveComponent);
  const setActiveClassIndex = useClassEditorStore((state) => state.setActiveClassIndex);
  
  const getClass = useClassRegistryStore((state) => state.getClass);
  const updateClassLocal = useClassRegistryStore((state) => state.updateClassLocal);

  // Set active component on mount
  useEffect(() => {
    setActiveComponent(componentId);
    return () => {
      setActiveComponent(null);
    };
  }, [componentId, setActiveComponent]);

  // Ensure active index is valid
  useEffect(() => {
    if (activeClassIndex >= classIds.length) {
      setActiveClassIndex(Math.max(0, classIds.length - 1));
    }
  }, [classIds.length, activeClassIndex, setActiveClassIndex]);

  const handlePropertyChange = useCallback((property: keyof ClassProperties, value: any) => {
    const activeClass = getClass(classIds[activeClassIndex]);
    if (!activeClass) return;

    // Update local state only - no API call
    updateClassLocal(activeClass.id, {
      properties: {
        ...activeClass.properties,
        [property]: value,
      },
    });
  }, [getClass, classIds, activeClassIndex, updateClassLocal]);

  if (classIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-neutral-500 mb-4">
          No classes applied. Add a layout class to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <ClassTopBar
        classIds={classIds}
        activeClassIndex={activeClassIndex}
        onClassIdsChange={onChange}
        onActiveClassChange={setActiveClassIndex}
      />
      
      <PropertyPanel
        classIds={classIds}
        activeClassIndex={activeClassIndex}
        onPropertyChange={handlePropertyChange}
      />
    </div>
  );
}
