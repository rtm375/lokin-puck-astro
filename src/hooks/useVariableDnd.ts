import { useState, useCallback, useRef, useEffect } from "react";
import type { Variable } from "@/types";

export interface DragState {
  isDragging: boolean;
  activeId: string | null;
  targetId: string | null;
  draggedItemIsGroup: boolean;
  position: "top" | "bottom" | "inside" | null;
}

export const useVariableDnD = (
  activeVariables: Variable[],
  onReorder: (updatedVariables: Variable[]) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    activeId: null,
    targetId: null,
    draggedItemIsGroup: false,
    position: null,
  });

  const dragRef = useRef<DragState>(dragState);
  const activeVarsRef = useRef(activeVariables);

  useEffect(() => {
    dragRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    activeVarsRef.current = activeVariables;
  }, [activeVariables]);

  const handleDragStart = useCallback((id: string) => {
    const activeItem = activeVarsRef.current.find((v) => v.id === id);
    setDragState({ isDragging: true, activeId: id, targetId: null, draggedItemIsGroup: activeItem?.is_group || false, position: null });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const state = dragRef.current;
    const activeId = state.activeId;
    if (!activeId || activeId === targetId) return;

    const activeItem = activeVarsRef.current.find((v) => v.id === activeId);
    const targetItem = activeVarsRef.current.find((v) => v.id === targetId);

    if (!activeItem || !targetItem) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    let position: "top" | "bottom" | "inside" = "bottom";

    const canGoInside = targetItem.is_group && !activeItem.is_group;

    if (canGoInside) {
      if (relativeY < rect.height * 0.25) position = "top";
      else if (relativeY > rect.height * 0.75) position = "bottom";
      else position = "inside";
    } else {
      position = relativeY < rect.height / 2 ? "top" : "bottom";
    }

    setDragState((prev) => {
      if (prev.targetId !== targetId || prev.position !== position) {
        return { ...prev, targetId, position };
      }
      return prev;
    });
  }, []);

  const handleDrop = useCallback(() => {
    const { activeId, targetId, position } = dragRef.current;
    setDragState({ isDragging: false, activeId: null, targetId: null, draggedItemIsGroup: false, position: null });

    if (!activeId || !targetId || activeId === targetId) return;

    const vars = activeVarsRef.current;
    const movedItem = vars.find(v => v.id === activeId);
    const targetItem = vars.find(v => v.id === targetId);

    if (!movedItem || !targetItem) return;

    let newGroupId: string | null = null;
    let siblings: Variable[] = [];
    let targetIndex = 0;

    if (position === "inside" && targetItem.is_group && !movedItem.is_group) {
      newGroupId = targetItem.id;
    } else {
      newGroupId = targetItem.group_id;
    }

    if (movedItem.is_group) {
      newGroupId = null;
    }

    if (newGroupId === null) {
      if (movedItem.is_group) {
        siblings = vars.filter(v => v.id !== activeId && !v.group_id && v.is_group).sort((a, b) => a.sort_order - b.sort_order);
      } else {
        siblings = vars.filter(v => v.id !== activeId && !v.group_id && !v.is_group).sort((a, b) => a.sort_order - b.sort_order);
      }
    } else {
      siblings = vars.filter(v => v.id !== activeId && v.group_id === newGroupId).sort((a, b) => a.sort_order - b.sort_order);
    }

    if (position === "inside") {
      targetIndex = siblings.length;
    } else {
      const tIndex = siblings.findIndex(v => v.id === targetId);
      if (tIndex === -1) {
        targetIndex = movedItem.is_group ? 0 : siblings.length;
      } else {
        targetIndex = position === "bottom" ? tIndex + 1 : tIndex;
      }
    }

    const updatedMovedItem = { ...movedItem, group_id: newGroupId };
    siblings.splice(targetIndex, 0, updatedMovedItem);

    const updatedVariables = siblings.map((v, i) => ({ ...v, sort_order: i }));
    onReorder(updatedVariables);
  }, [onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragState({ isDragging: false, activeId: null, targetId: null, draggedItemIsGroup: false, position: null });
  }, []);

  return { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd };
};
