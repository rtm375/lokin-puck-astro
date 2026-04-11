import { Icon } from "@iconify/react";
import type { DragEvent } from "react";

interface ClassChipProps {
  classId: string;
  className: string;
  isActive: boolean;
  isSystem: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
  isDragging?: boolean;
}

export function ClassChip({
  classId,
  className,
  isActive,
  isSystem,
  onSelect,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: ClassChipProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer transition-all
        ${isActive
          ? "bg-primary text-white shadow-sm"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
        }
        ${isDragging ? "opacity-50" : "opacity-100"}
      `}
    >
      <Icon icon="lucide:grip-vertical" width={12} className="cursor-grab" />
      <span className="text-xs font-medium whitespace-nowrap">{className}</span>
      {!isSystem && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`
            ml-1 p-0.5 rounded hover:bg-black/10 transition-colors
            ${isActive ? "text-white" : "text-neutral-500"}
          `}
          title="Remove class"
        >
          <Icon icon="lucide:x" width={12} />
        </button>
      )}
    </div>
  );
}
