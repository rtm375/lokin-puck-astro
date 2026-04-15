import { useEffect, useState } from "react";
import { useEditorData } from "@stores/useEditorData";

export function useEditorPersistence(storageKey: string) {
  const { updateDraft } = useEditorData();

  const [pendingData, setPendingData] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!pendingData) return;

    const t = setTimeout(() => {
      updateDraft(pendingData);
    }, 300);

    return () => clearTimeout(t);
  }, [pendingData]);

  return {
    pendingData,
    setPendingData,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  };
}