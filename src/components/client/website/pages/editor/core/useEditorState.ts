import { useState, useCallback, useEffect } from "react";
import type { Data } from "@puckeditor/core";
import type { Props, RootProps } from "../puck/blocks/types";
import { useEditorData } from "@stores/useEditorData";

export function useEditorState(storageKey: string) {
  const [initialData, setInitialData] = useState<Data<Props, RootProps> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingData, setPendingData] = useState<Data<Props, RootProps> | null>(null);

  const { setPageData, getPageData, clearPageData } = useEditorData();

  // Debounce saving to local storage
  useEffect(() => {
    if (!pendingData) return;

    const timer = setTimeout(() => {
      setPageData(storageKey, pendingData);
    }, 300);

    return () => clearTimeout(timer);
  }, [pendingData, storageKey, setPageData]);

  const handleChange = useCallback(
    (data: Data<Props, RootProps>) => {
      setPendingData(data);
      setHasUnsavedChanges((prev) => prev || true);
    },
    [],
  );

  const clearLocalStorage = () => {
    clearPageData(storageKey);
    setPendingData(null);
    setHasUnsavedChanges(false);
  };

  return {
    initialData,
    setInitialData,
    isSaving,
    setIsSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    pendingData,
    setPendingData,
    handleChange,
    getPageData,
    setPageData,
    clearLocalStorage,
  };
}
