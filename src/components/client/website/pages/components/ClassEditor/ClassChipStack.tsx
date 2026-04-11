import { useState, type DragEvent } from "react";
import { ClassChip } from "./ClassChip";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";

interface ClassChipStackProps {
  classIds: string[];
  activeIndex: number;
  onClassSelect: (index: number) => void;
  onClassRemove: (index: number) => void;
  onClassReorder: (fromIndex: number, toIndex: number) => void;
}

export function ClassChipStack({
  classIds,
  activeIndex,
  onClassSelect,
  onClassRemove,
  onClassReorder,
}: ClassChipStackProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  
  const getClass = useClassRegistryStore((state) => state.getClass);

  const handleDragStart = (e: DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDropIndicatorIndex(null);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIndicatorIndex(index);
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));

    if (dragIndex !== dropIndex && !isNaN(dragIndex)) {
      onClassReorder(dragIndex, dropIndex);
    }

    setDraggingIndex(null);
    setDropIndicatorIndex(null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {classIds.map((classId, index) => {
        const styleClass = getClass(classId);
        if (!styleClass) return null;

        return (
          <div
            key={`${classId}-${index}`}
            className="relative"
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            {dropIndicatorIndex === index && draggingIndex !== index && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary -translate-x-1" />
            )}
            <ClassChip
              classId={classId}
              className={styleClass.name}
              isActive={index === activeIndex}
              isSystem={styleClass.is_system}
              onSelect={() => onClassSelect(index)}
              onRemove={() => onClassRemove(index)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              isDragging={draggingIndex === index}
            />
          </div>
        );
      })}
    </div>
  );
}
