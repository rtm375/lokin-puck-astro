import { useCallback, useState } from "react";
import { useEditorLoader } from "@/components/client/website/pages/editor/data/useEditorLoader";
import { useEditorPersistence } from "@/components/client/website/pages/editor/data/useEditorPersistence";
import { publishPage } from "@/components/client/website/pages/editor/publish/publishPage";
import { useConfig } from "@/lib";

export function useEditor() {
  const config = useConfig();

  const {
    data,
    loading,
    error,
    websiteId,
    pageId,
    storageKey,
  } = useEditorLoader();

  const {
    pendingData,
    setPendingData,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  } = useEditorPersistence(storageKey);

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback((data: any) => {
    setPendingData(data);
    setHasUnsavedChanges(true);
  }, []);

  const handlePublish = useCallback(async (data: any) => {
    if (!pageId) return;

    setIsSaving(true);
    try {
      await publishPage({ config, data, websiteId, pageId });
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, [config, websiteId, pageId]);

  return {
    data: data || pendingData,
    loading,
    error,
    isSaving,
    hasUnsavedChanges,
    handleChange,
    handlePublish,
  };
}